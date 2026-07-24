#!/usr/bin/env python3
"""Run local-only Chromium acceptance for the Live Introductions prototype."""

from __future__ import annotations

import argparse
from contextlib import contextmanager
from dataclasses import dataclass, field
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import re
import subprocess
import sys
import tempfile
import threading
from typing import Any, Iterator
from urllib.parse import urlsplit


REPOSITORY_ROOT = Path(__file__).resolve().parents[1]
if str(REPOSITORY_ROOT) not in sys.path:
    sys.path.insert(0, str(REPOSITORY_ROOT))

from scripts.live_introductions_catalog import routable_frames


@dataclass(frozen=True, slots=True)
class Viewport:
    width: int
    height: int


VIEWPORTS = (
    Viewport(390, 844),
    Viewport(768, 1024),
    Viewport(1440, 900),
)
INTERACTION_STATES = ("rest", "hover", "focus-visible")
ACTIONABLE_SELECTOR = ", ".join(
    (
        "a[href]:not([aria-disabled='true'])",
        "button:not([disabled]):not([aria-disabled='true'])",
        "input:not([disabled]):not([readonly]):not([aria-disabled='true'])",
        "select:not([disabled]):not([aria-disabled='true'])",
        "textarea:not([disabled]):not([readonly]):not([aria-disabled='true'])",
        "summary:not([aria-disabled='true'])",
        "[tabindex]:not([tabindex='-1']):not([aria-disabled='true'])",
    )
)
CONTRAST_REST_SELECTOR = (
    f"{ACTIONABLE_SELECTOR}, "
    ".product-action[aria-disabled='true'], "
    ".shell-link[aria-disabled='true']"
)
UV_RUN_PREFIX = (
    "uv run --project tools/live-introductions-browser --frozen"
)
BROWSER_ACCEPTANCE_COMMAND = (
    f"{UV_RUN_PREFIX} python scripts/browser_acceptance_live_introductions.py"
)
CHROMIUM_INSTALL_COMMAND = (
    f"{UV_RUN_PREFIX} playwright install chromium"
)


class AcceptanceFailure(AssertionError):
    """A browser-observed acceptance contract failure."""


class AcceptanceDependencyError(RuntimeError):
    """A missing declared browser-test dependency."""


@dataclass(slots=True)
class PageSignals:
    console_errors: list[str] = field(default_factory=list)
    page_errors: list[str] = field(default_factory=list)
    remote_requests: list[str] = field(default_factory=list)

    def checkpoint(self) -> tuple[int, int, int]:
        return (
            len(self.console_errors),
            len(self.page_errors),
            len(self.remote_requests),
        )

    def since(
        self,
        checkpoint: tuple[int, int, int],
    ) -> tuple[list[str], list[str], list[str]]:
        console_index, page_index, remote_index = checkpoint
        return (
            self.console_errors[console_index:],
            self.page_errors[page_index:],
            self.remote_requests[remote_index:],
        )


class QuietStaticHandler(SimpleHTTPRequestHandler):
    """Serve only the generated temporary tree without terminal noise."""

    def log_message(self, format: str, *args: object) -> None:
        del format, args


def expected_route_paths() -> tuple[str, ...]:
    """Return the atlas and every generated frame route."""

    return ("/", *(f"/{frame.id.lower()}/" for frame in routable_frames()))


def is_allowed_local_request(url: str, origin: str) -> bool:
    """Return whether a request stays on the runner's exact loopback origin."""

    request = urlsplit(url)
    allowed = urlsplit(origin)
    return (
        allowed.scheme == "http"
        and allowed.hostname == "127.0.0.1"
        and request.scheme == allowed.scheme
        and request.hostname == allowed.hostname
        and request.port == allowed.port
    )


def _opaque_rgb(css_color: str) -> tuple[float, float, float]:
    channels = tuple(float(value) for value in re.findall(r"[\d.]+", css_color))
    if len(channels) not in {3, 4}:
        raise ValueError(f"Unsupported computed color: {css_color}")
    if len(channels) == 4 and channels[3] < 1:
        raise ValueError(f"Expected an opaque computed color: {css_color}")
    if css_color.strip().lower().startswith("color(srgb "):
        return tuple(channel * 255 for channel in channels[:3])
    return channels[:3]


def contrast_ratio_from_css(foreground: str, background: str) -> float:
    """Calculate WCAG contrast from opaque computed rgb/rgba colors."""

    def luminance(css_color: str) -> float:
        linear_channels = []
        for channel in _opaque_rgb(css_color):
            normalized = channel / 255
            linear_channels.append(
                normalized / 12.92
                if normalized <= 0.04045
                else ((normalized + 0.055) / 1.055) ** 2.4
            )
        return (
            0.2126 * linear_channels[0]
            + 0.7152 * linear_channels[1]
            + 0.0722 * linear_channels[2]
        )

    lighter, darker = sorted(
        (luminance(foreground), luminance(background)),
        reverse=True,
    )
    return (lighter + 0.05) / (darker + 0.05)


def _require(condition: bool, message: str) -> None:
    if not condition:
        raise AcceptanceFailure(message)


def _route_for_frame(frame_id: str) -> str:
    return f"/{frame_id.lower()}/"


@contextmanager
def _generated_loopback_site() -> Iterator[str]:
    with tempfile.TemporaryDirectory(
        prefix="live-introductions-browser-",
    ) as temporary_directory:
        output = Path(temporary_directory) / "site"
        generation = subprocess.run(
            [
                sys.executable,
                str(
                    REPOSITORY_ROOT
                    / "scripts"
                    / "generate_live_introductions_prototype.py"
                ),
                "--output",
                str(output),
            ],
            cwd=REPOSITORY_ROOT,
            capture_output=True,
            text=True,
            check=False,
        )
        if generation.returncode:
            raise AcceptanceFailure(
                "Temporary prototype generation failed:\n"
                f"{generation.stderr.strip() or generation.stdout.strip()}"
            )

        handler = partial(QuietStaticHandler, directory=str(output))
        server = ThreadingHTTPServer(("127.0.0.1", 0), handler)
        server.daemon_threads = True
        host, port = server.server_address[:2]
        _require(host == "127.0.0.1", f"Server bound to non-loopback host: {host}")
        thread = threading.Thread(
            target=server.serve_forever,
            name="live-introductions-loopback-server",
            daemon=True,
        )
        thread.start()
        try:
            yield f"http://127.0.0.1:{port}"
        finally:
            server.shutdown()
            server.server_close()
            thread.join(timeout=5)
            if thread.is_alive():
                raise AcceptanceFailure("Loopback HTTP server did not stop cleanly")


def _attach_request_guard(context: Any, origin: str, signals: PageSignals) -> None:
    def guard(route: Any, request: Any) -> None:
        if is_allowed_local_request(request.url, origin):
            route.continue_()
            return
        signals.remote_requests.append(request.url)
        route.abort("blockedbyclient")

    context.route("**/*", guard)


def _attach_page_signals(page: Any, signals: PageSignals) -> None:
    def capture_console(message: Any) -> None:
        if message.type == "error":
            signals.console_errors.append(message.text)

    page.on("console", capture_console)
    page.on("pageerror", lambda error: signals.page_errors.append(str(error)))


def _assert_clean_signals(
    signals: PageSignals,
    checkpoint: tuple[int, int, int],
    label: str,
) -> None:
    console_errors, page_errors, remote_requests = signals.since(checkpoint)
    _require(
        not console_errors,
        f"{label}: console errors: {console_errors}",
    )
    _require(
        not page_errors,
        f"{label}: page errors: {page_errors}",
    )
    _require(
        not remote_requests,
        f"{label}: remote requests blocked: {remote_requests}",
    )


def _navigate(
    page: Any,
    signals: PageSignals,
    origin: str,
    route: str,
) -> tuple[int, int, int]:
    checkpoint = signals.checkpoint()
    response = page.goto(f"{origin}{route}", wait_until="load")
    _require(response is not None, f"{route}: navigation returned no response")
    _require(
        response.status == 200,
        f"{route}: expected HTTP 200, received {response.status}",
    )
    return checkpoint


def _focus_evidence(page: Any) -> dict[str, Any]:
    return page.evaluate(
        """
        () => {
          const element = document.activeElement;
          const style = getComputedStyle(element);
          const rect = element.getBoundingClientRect();
          return {
            tag: element.tagName,
            classes: element.className,
            id: element.id,
            outlineStyle: style.outlineStyle,
            outlineWidth: parseFloat(style.outlineWidth) || 0,
            rect: {
              top: rect.top,
              right: rect.right,
              bottom: rect.bottom,
              left: rect.left,
              width: rect.width,
              height: rect.height,
            },
            inViewport:
              rect.bottom > 0 &&
              rect.right > 0 &&
              rect.top < innerHeight &&
              rect.left < innerWidth,
          };
        }
        """
    )


def _assert_actionable_targets(page: Any, page_label: str) -> None:
    """Verify every rendered actionable is usable, visible, and unobscured."""

    actionables = page.locator(ACTIONABLE_SELECTOR)
    for index in range(actionables.count()):
        control = actionables.nth(index)
        is_skip_link = control.evaluate(
            "(node) => node.matches('a.skip-link')"
        )
        if is_skip_link:
            _focus_with_keyboard(page, control)
        control.scroll_into_view_if_needed()
        evidence = control.evaluate(
            """
            (node) => {
              const rect = node.getBoundingClientRect();
              const style = getComputedStyle(node);
              const label =
                node.getAttribute("data-label") ||
                node.getAttribute("aria-label") ||
                node.textContent.trim().replace(/\\s+/g, " ").slice(0, 100) ||
                node.tagName;
              const intersection = {
                left: Math.max(rect.left, 0),
                top: Math.max(rect.top, 0),
                right: Math.min(rect.right, innerWidth),
                bottom: Math.min(rect.bottom, innerHeight),
              };
              intersection.width = Math.max(
                0,
                intersection.right - intersection.left,
              );
              intersection.height = Math.max(
                0,
                intersection.bottom - intersection.top,
              );

              const clippedBy = [];
              const pointerBlockedBy = [];
              const visibilityBlockedBy = [];
              const inertBy = [];
              const ariaHiddenBy = [];
              let effectiveOpacity = 1;
              for (
                let ancestor = node;
                ancestor;
                ancestor = ancestor.parentElement
              ) {
                const ancestorStyle = getComputedStyle(ancestor);
                const ancestorRect = ancestor.getBoundingClientRect();
                const ancestorLabel =
                  ancestor.id ||
                  (
                    typeof ancestor.className === "string"
                      ? ancestor.className
                      : ""
                  ) ||
                  ancestor.tagName;
                const ancestorOpacity = Number(ancestorStyle.opacity);
                effectiveOpacity *= Number.isFinite(ancestorOpacity)
                  ? ancestorOpacity
                  : 1;
                if (
                  ancestor.hidden ||
                  ancestorStyle.display === "none" ||
                  /^(hidden|collapse)$/.test(ancestorStyle.visibility) ||
                  ancestorStyle.contentVisibility === "hidden"
                ) {
                  visibilityBlockedBy.push(ancestorLabel);
                }
                if (ancestor.inert) {
                  inertBy.push(ancestorLabel);
                }
                if (ancestor.getAttribute("aria-hidden") === "true") {
                  ariaHiddenBy.push(ancestorLabel);
                }
                if (ancestorStyle.pointerEvents === "none") {
                  pointerBlockedBy.push(ancestorLabel);
                }
                const clipsX = /^(auto|hidden|clip|scroll)$/.test(
                  ancestorStyle.overflowX,
                );
                const clipsY = /^(auto|hidden|clip|scroll)$/.test(
                  ancestorStyle.overflowY,
                );
                if (
                  (clipsX && (
                    rect.left < ancestorRect.left - 1 ||
                    rect.right > ancestorRect.right + 1
                  )) ||
                  (clipsY && (
                    rect.top < ancestorRect.top - 1 ||
                    rect.bottom > ancestorRect.bottom + 1
                  ))
                ) {
                  clippedBy.push(ancestorLabel);
                }
              }

              const point = {
                x: intersection.left + intersection.width / 2,
                y: intersection.top + intersection.height / 2,
              };
              const topmost =
                intersection.width > 0 && intersection.height > 0
                  ? document.elementFromPoint(point.x, point.y)
                  : null;
              return {
                control: {
                  label,
                  tag: node.tagName.toLowerCase(),
                  classes:
                    typeof node.className === "string"
                      ? node.className
                      : "",
                  href: node.getAttribute("href") || "",
                },
                effectiveOpacity,
                visibilityBlockedBy,
                inertBy,
                ariaHiddenBy,
                pointerEvents: style.pointerEvents,
                rect: {
                  left: rect.left,
                  top: rect.top,
                  right: rect.right,
                  bottom: rect.bottom,
                  width: rect.width,
                  height: rect.height,
                },
                intersection,
                clippedBy,
                pointerBlockedBy,
                point,
                topmost:
                  topmost &&
                  (
                    topmost.getAttribute("data-label") ||
                    topmost.getAttribute("aria-label") ||
                    topmost.tagName
                  ),
                topmostIsControl:
                  Boolean(topmost) &&
                  (topmost === node || node.contains(topmost)),
              };
            }
            """
        )
        control_label = (
            f"{page_label}: actionable #{index + 1} "
            f"{evidence['control']}"
        )
        _require(
            evidence["effectiveOpacity"] > 0
            and not evidence["visibilityBlockedBy"]
            and not evidence["inertBy"]
            and not evidence["ariaHiddenBy"],
            f"{control_label}: effective visibility failed "
            f"(effective opacity {evidence['effectiveOpacity']}, "
            f"visibility/display blockers {evidence['visibilityBlockedBy']}, "
            f"inert ancestors {evidence['inertBy']}, "
            f"aria-hidden ancestors {evidence['ariaHiddenBy']})",
        )
        _require(
            evidence["rect"]["width"] >= 43.5
            and evidence["rect"]["height"] >= 43.5,
            f"{control_label}: below practical 44px size ({evidence['rect']})",
        )
        _require(
            evidence["intersection"]["width"] > 0
            and evidence["intersection"]["height"] > 0,
            f"{control_label}: has no viewport intersection "
            f"({evidence['intersection']})",
        )
        _require(
            not evidence["clippedBy"],
            f"{control_label}: clipped by overflow ancestor(s) "
            f"{evidence['clippedBy']}",
        )
        _require(
            evidence["pointerEvents"] != "none"
            and not evidence["pointerBlockedBy"],
            f"{control_label}: pointer events blocked by "
            f"{evidence['pointerBlockedBy']}",
        )
        _require(
            evidence["topmostIsControl"],
            f"{control_label}: center/interior point {evidence['point']} is "
            f"not topmost (hit {evidence['topmost']!r})",
        )


def _run_actionability_regression_fixture(browser: Any) -> None:
    """Prove ancestor opacity cannot be masked by successful hit-testing."""

    context = browser.new_context(viewport={"width": 390, "height": 844})
    page = context.new_page()
    try:
        page.set_content(
            """
            <main>
              <div style="opacity: 0">
                <a href="#fixture"
                   style="display: inline-flex; min-width: 44px; min-height: 44px">
                  Invisible but hit-testable fixture
                </a>
              </div>
            </main>
            """
        )
        fixture = page.locator("a[href='#fixture']")
        _require(
            fixture.evaluate(
                """
                (node) => {
                  const rect = node.getBoundingClientRect();
                  const hit = document.elementFromPoint(
                    rect.left + rect.width / 2,
                    rect.top + rect.height / 2,
                  );
                  return hit === node || node.contains(hit);
                }
                """
            ),
            "Ancestor-opacity fixture must remain hit-testable",
        )
        try:
            _assert_actionable_targets(page, "ancestor-opacity regression")
        except AcceptanceFailure as error:
            _require(
                "effective opacity 0" in str(error),
                "Ancestor-opacity fixture failed for the wrong reason: "
                f"{error}",
            )
        else:
            raise AcceptanceFailure(
                "Ancestor-opacity fixture was incorrectly accepted"
            )
    finally:
        context.close()


def _assert_page_contract(
    page: Any,
    signals: PageSignals,
    origin: str,
    route: str,
    viewport: Viewport,
) -> None:
    label = f"{route} at {viewport.width}px"
    checkpoint = _navigate(page, signals, origin, route)

    _require(page.locator("h1").count() == 1, f"{label}: expected one h1")
    for landmark in ("main", "nav", "footer"):
        _require(
            page.locator(landmark).count() >= 1,
            f"{label}: missing semantic {landmark}",
        )

    markers = page.locator(".study-markers")
    _require(markers.count() == 1, f"{label}: expected one synthetic marker group")
    _require(markers.is_visible(), f"{label}: synthetic markers are not visible")
    marker_text = markers.inner_text()
    for marker in ("SYNTHETIC / FICTIONAL", "WIREFRAME ONLY"):
        _require(marker in marker_text, f"{label}: missing marker {marker!r}")

    skip_link = page.locator("a.skip-link")
    _require(skip_link.count() == 1, f"{label}: expected one skip link")
    target_href = skip_link.get_attribute("href")
    _require(
        bool(target_href and target_href.startswith("#")),
        f"{label}: skip link lacks a fragment target",
    )
    target_id = target_href[1:]
    target = page.locator(f"#{target_id}")
    _require(target.count() == 1, f"{label}: skip target {target_href!r} missing")

    page.keyboard.press("Tab")
    focused_skip = _focus_evidence(page)
    _require(
        "skip-link" in str(focused_skip["classes"]).split(),
        f"{label}: first Tab did not focus the skip link ({focused_skip})",
    )
    _require(
        focused_skip["inViewport"],
        f"{label}: focused skip link is outside the viewport",
    )
    _require(
        focused_skip["outlineStyle"] not in {"none", "hidden"}
        and focused_skip["outlineWidth"] >= 2,
        f"{label}: keyboard focus is not visibly outlined ({focused_skip})",
    )

    page.keyboard.press("Enter")
    target_focus = _focus_evidence(page)
    _require(
        page.evaluate("() => location.hash") == target_href,
        f"{label}: skip activation did not navigate to {target_href}",
    )
    _require(
        target_focus["id"] == target_id,
        f"{label}: skip target did not receive focus ({target_focus})",
    )
    _require(
        target_focus["inViewport"],
        f"{label}: focused skip target is outside the viewport",
    )

    overflow = page.evaluate(
        """
        () => ({
          viewport: document.documentElement.clientWidth,
          html: document.documentElement.scrollWidth,
          body: document.body.scrollWidth,
        })
        """
    )
    _require(
        max(overflow["html"], overflow["body"]) <= overflow["viewport"] + 1,
        f"{label}: horizontal overflow detected ({overflow})",
    )

    _assert_actionable_targets(page, label)
    _assert_clean_signals(signals, checkpoint, label)


def _run_route_matrix(browser: Any, origin: str) -> None:
    failures: list[str] = []
    for viewport in VIEWPORTS:
        context = browser.new_context(
            viewport={"width": viewport.width, "height": viewport.height},
        )
        signals = PageSignals()
        _attach_request_guard(context, origin, signals)
        page = context.new_page()
        page.set_default_timeout(5_000)
        _attach_page_signals(page, signals)
        try:
            for route in expected_route_paths():
                try:
                    _assert_page_contract(
                        page,
                        signals,
                        origin,
                        route,
                        viewport,
                    )
                except Exception as error:
                    failures.append(
                        f"{route} at {viewport.width}px: "
                        f"{type(error).__name__}: {error}"
                    )
        finally:
            context.close()
    if failures:
        raise AcceptanceFailure(
            "Responsive route matrix failed:\n- " + "\n- ".join(failures)
        )


def _click_frame_link(
    page: Any,
    signals: PageSignals,
    origin: str,
    source_id: str,
    target_id: str,
    *,
    scope: str = "body",
) -> str:
    source_route = _route_for_frame(source_id)
    label = f"{source_id} -> {target_id}"
    checkpoint = _navigate(page, signals, origin, source_route)
    selector = (
        f'a[data-control-scope="{scope}"]'
        f'[data-target-id="{target_id}"]'
    )
    link = page.locator(selector)
    _require(
        link.count() == 1,
        f"{label}: expected one navigation link for selector {selector!r}",
    )
    href = link.get_attribute("href")
    _require(bool(href), f"{label}: link has no href")
    with page.expect_navigation(wait_until="load") as navigation:
        link.click()
    response = navigation.value
    _require(
        response is not None and response.status == 200,
        f"{label}: destination did not return HTTP 200",
    )
    destination_path = urlsplit(page.url).path
    _require(
        destination_path != urlsplit(f"{origin}{source_route}").path,
        f"{label}: source and destination paths are identical",
    )
    _require(
        page.locator("body").get_attribute("data-frame-id") == target_id,
        f"{label}: destination rendered the wrong frame",
    )
    _assert_clean_signals(signals, checkpoint, label)
    return destination_path


def _run_navigation_contracts(browser: Any, origin: str) -> None:
    context = browser.new_context(viewport={"width": 768, "height": 1024})
    signals = PageSignals()
    _attach_request_guard(context, origin, signals)
    page = context.new_page()
    page.set_default_timeout(5_000)
    _attach_page_signals(page, signals)
    try:
        representative_destinations = {
            _click_frame_link(page, signals, origin, "V04", "V05"),
            _click_frame_link(page, signals, origin, "F06", "F07"),
            _click_frame_link(page, signals, origin, "C03", "C04"),
            _click_frame_link(
                page,
                signals,
                origin,
                "S02-FACILITATOR",
                "C01",
            ),
        }
        _require(
            len(representative_destinations) == 4,
            "Representative role navigation did not use distinct destinations",
        )

        _click_frame_link(page, signals, origin, "V11", "V12")

        expected_safety_variants = (
            ("V08", "S02-VIEWER", "viewer"),
            ("F05", "S02-FEATURED", "featured_participant"),
            ("C03", "S02-FACILITATOR", "facilitator"),
        )
        safety_paths: set[str] = set()
        for source_id, target_id, role in expected_safety_variants:
            destination_path = _click_frame_link(
                page,
                signals,
                origin,
                source_id,
                target_id,
                scope="shell",
            )
            safety_paths.add(destination_path)
            surface = page.locator(".product-surface")
            _require(
                surface.get_attribute("data-audience") == role,
                f"{target_id}: wrong product audience",
            )
            exposed_audiences = page.locator("[data-audiences]").evaluate_all(
                """
                (nodes) => Array.from(
                  new Set(nodes.map((node) => node.dataset.audiences))
                )
                """
            )
            _require(
                exposed_audiences == [role],
                f"{target_id}: role-unsafe controls exposed {exposed_audiences}",
            )
        _require(
            len(safety_paths) == 3,
            "Role-specific safety links did not resolve to distinct destinations",
        )

        for terminal_id in ("C07", "C08", "S01"):
            checkpoint = _navigate(
                page,
                signals,
                origin,
                _route_for_frame(terminal_id),
            )
            _require(
                page.locator(
                    ".product-surface"
                    '[data-surface-context="no_live_continuation"]'
                ).count()
                == 1,
                f"{terminal_id}: missing no-continuation context",
            )
            _require(
                page.locator(
                    'a[data-action-scope="live_derived_continuation"]'
                ).count()
                == 0,
                f"{terminal_id}: prohibited Live-derived continuation is linked",
            )
            _require(
                page.locator(
                    'a[data-target-id="V12"], a[data-target-id="F07"]'
                ).count()
                == 0,
                f"{terminal_id}: prohibited V12/F07 continuation is linked",
            )
            _assert_clean_signals(signals, checkpoint, terminal_id)

        for discovery_id in ("F07", "F08"):
            checkpoint = _navigate(
                page,
                signals,
                origin,
                _route_for_frame(discovery_id),
            )
            _require(
                page.locator(
                    '.product-surface[data-surface-context="ordinary_app"]'
                ).count()
                == 1,
                f"{discovery_id}: ordinary-app provenance context missing",
            )
            _require(
                page.locator("[data-provenance-variant]").count() == 0,
                f"{discovery_id}: Live provenance marker leaked",
            )
            _require(
                page.locator(
                    'a[data-target-id^="S02"], a[data-target-id="S03"]'
                ).count()
                == 0,
                f"{discovery_id}: Live safety provenance leaked into navigation",
            )
            _assert_clean_signals(signals, checkpoint, discovery_id)
    finally:
        context.close()


def _run_reduced_motion_contract(browser: Any, origin: str) -> None:
    context = browser.new_context(
        viewport={"width": 390, "height": 844},
        reduced_motion="reduce",
    )
    signals = PageSignals()
    _attach_request_guard(context, origin, signals)
    page = context.new_page()
    _attach_page_signals(page, signals)
    try:
        checkpoint = _navigate(page, signals, origin, _route_for_frame("V08"))
        motion = page.evaluate(
            """
            () => {
              const seconds = (token) => {
                const value = parseFloat(token) || 0;
                return token.trim().endsWith("ms") ? value / 1000 : value;
              };
              const maximum = (value) =>
                Math.max(...value.split(",").map(seconds), 0);
              let transition = 0;
              let animation = 0;
              for (const element of document.querySelectorAll("*")) {
                const style = getComputedStyle(element);
                transition = Math.max(
                  transition,
                  maximum(style.transitionDuration),
                );
                animation = Math.max(
                  animation,
                  maximum(style.animationDuration),
                );
              }
              return {
                matches: matchMedia(
                  "(prefers-reduced-motion: reduce)"
                ).matches,
                scrollBehavior: getComputedStyle(
                  document.documentElement
                ).scrollBehavior,
                maxTransitionSeconds: transition,
                maxAnimationSeconds: animation,
              };
            }
            """
        )
        _require(motion["matches"], "Reduced-motion media query was not active")
        _require(
            motion["scrollBehavior"] == "auto",
            f"Reduced motion retained smooth scrolling: {motion}",
        )
        _require(
            motion["maxTransitionSeconds"] <= 0.001,
            f"Transition duration was not effectively disabled: {motion}",
        )
        _require(
            motion["maxAnimationSeconds"] <= 0.001,
            f"Animation duration was not effectively disabled: {motion}",
        )
        _assert_clean_signals(signals, checkpoint, "reduced motion")
    finally:
        context.close()


def _run_print_contract(browser: Any, origin: str) -> None:
    context = browser.new_context(viewport={"width": 768, "height": 1024})
    signals = PageSignals()
    _attach_request_guard(context, origin, signals)
    page = context.new_page()
    _attach_page_signals(page, signals)
    try:
        checkpoint = _navigate(page, signals, origin, _route_for_frame("V08"))
        mirror = page.locator(".print-contract")
        _require(mirror.is_hidden(), "Print contract mirror is visible on screen")
        page.emulate_media(media="print")
        _require(mirror.is_visible(), "Print contract mirror is hidden in print")
        _require(
            page.locator("details.wireframe-contract").is_hidden(),
            "Screen contract disclosure remains visible in print",
        )
        for selector in (
            ".skip-link",
            ".frame-navigation",
            ".shell-controls",
            ".control-deck",
            ".review-navigation",
        ):
            displays = page.locator(selector).evaluate_all(
                "(nodes) => nodes.map((node) => getComputedStyle(node).display)"
            )
            _require(displays, f"Print suppression selector missing: {selector}")
            _require(
                all(display == "none" for display in displays),
                f"Print did not suppress {selector}: {displays}",
            )
        _assert_clean_signals(signals, checkpoint, "print")
    finally:
        context.close()


def _computed_color_pair(
    page: Any,
    foreground_selector: str,
    background_selector: str,
) -> tuple[str, str]:
    foreground = page.locator(foreground_selector).first
    background = page.locator(background_selector).first
    _require(
        foreground.count() == 1,
        f"Contrast foreground missing: {foreground_selector}",
    )
    _require(
        background.count() == 1,
        f"Contrast background missing: {background_selector}",
    )
    return (
        foreground.evaluate("(node) => getComputedStyle(node).color"),
        background.evaluate("(node) => getComputedStyle(node).backgroundColor"),
    )


def _computed_interaction_layers(
    interactive: Any,
    pseudos: tuple[str, ...],
) -> dict[str, Any]:
    return interactive.evaluate(
        """
        (root, pseudos) => {
          const parseColor = (input) => {
            const normalized = input.trim().toLowerCase();
            if (normalized === "transparent") {
              return [0, 0, 0, 0];
            }
            const values = normalized.match(
              /-?(?:\\d+\\.?\\d*|\\.\\d+)(?:e[-+]?\\d+)?%?/g,
            );
            if (!values || values.length < 3) {
              throw new Error(`Unsupported computed color: ${input}`);
            }
            const isSrgb = normalized.startsWith("color(srgb ");
            const channels = values.slice(0, 3).map((value) => {
              if (value.endsWith("%")) {
                return Number(value.slice(0, -1)) * 2.55;
              }
              return Number(value) * (isSrgb ? 255 : 1);
            });
            let alpha = values.length > 3 ? Number(values[3]) : 1;
            if (values.length > 3 && values[3].endsWith("%")) {
              alpha = Number(values[3].slice(0, -1)) / 100;
            }
            return [...channels, alpha];
          };
          const over = (foreground, background) => {
            const alpha =
              foreground[3] + background[3] * (1 - foreground[3]);
            if (alpha <= 0) {
              return [0, 0, 0, 0];
            }
            return [
              (
                foreground[0] * foreground[3] +
                background[0] * background[3] * (1 - foreground[3])
              ) / alpha,
              (
                foreground[1] * foreground[3] +
                background[1] * background[3] * (1 - foreground[3])
              ) / alpha,
              (
                foreground[2] * foreground[3] +
                background[2] * background[3] * (1 - foreground[3])
              ) / alpha,
              alpha,
            ];
          };
          const asCss = (color) =>
            `rgb(${color.slice(0, 3).map(
              (channel) => Math.max(0, Math.min(255, channel)).toFixed(3),
            ).join(", ")})`;
          const applyGroupOpacity = (color, opacity) => {
            const normalized = Number(opacity);
            if (!Number.isFinite(normalized)) {
              throw new Error(`Unsupported computed opacity: ${opacity}`);
            }
            return [
              color[0],
              color[1],
              color[2],
              color[3] * Math.max(0, Math.min(1, normalized)),
            ];
          };
          const inspectCompositing = (
            style,
            label,
            unsupportedCompositing,
          ) => {
            if (style.backgroundImage !== "none") {
              unsupportedCompositing.push(
                `${label} background-image ${style.backgroundImage}`,
              );
            }
            if (style.backgroundBlendMode !== "normal") {
              unsupportedCompositing.push(
                `${label} background-blend-mode ${style.backgroundBlendMode}`,
              );
            }
            if (style.mixBlendMode !== "normal") {
              unsupportedCompositing.push(
                `${label} mix-blend-mode ${style.mixBlendMode}`,
              );
            }
            if (style.filter !== "none") {
              unsupportedCompositing.push(
                `${label} filter ${style.filter}`,
              );
            }
            if (
              style.backdropFilter &&
              style.backdropFilter !== "none"
            ) {
              unsupportedCompositing.push(
                `${label} backdrop-filter ${style.backdropFilter}`,
              );
            }
            if (style.maskImage && style.maskImage !== "none") {
              unsupportedCompositing.push(
                `${label} mask-image ${style.maskImage}`,
              );
            }
          };
          const renderThroughOpacityChain = (
            element,
            contentColor = null,
            pseudo = null,
            includeStartBackground = true,
          ) => {
            let rendered = contentColor || [0, 0, 0, 0];
            const unsupportedCompositing = [];
            const opacityChain = [];
            if (pseudo) {
              const pseudoStyle = getComputedStyle(element, pseudo);
              inspectCompositing(
                pseudoStyle,
                pseudo,
                unsupportedCompositing,
              );
              rendered = over(
                rendered,
                parseColor(pseudoStyle.backgroundColor),
              );
              const pseudoOpacity = Number(pseudoStyle.opacity);
              rendered = applyGroupOpacity(rendered, pseudoOpacity);
              opacityChain.push({
                node: pseudo,
                opacity: pseudoOpacity,
              });
            }
            let backgroundNode = element;
            let isStart = true;
            while (backgroundNode) {
              const style = getComputedStyle(backgroundNode);
              const label =
                backgroundNode.id ||
                (
                  typeof backgroundNode.className === "string"
                    ? backgroundNode.className
                    : ""
                ) ||
                backgroundNode.tagName;
              inspectCompositing(
                style,
                label,
                unsupportedCompositing,
              );
              if (
                !(
                  isStart &&
                  !pseudo &&
                  !includeStartBackground
                )
              ) {
                rendered = over(
                  rendered,
                  parseColor(style.backgroundColor),
                );
              }
              const opacity = Number(style.opacity);
              rendered = applyGroupOpacity(rendered, opacity);
              opacityChain.push({node: label, opacity});
              isStart = false;
              backgroundNode = backgroundNode.parentElement;
            }
            rendered = over(rendered, [255, 255, 255, 1]);
            return {
              color: rendered,
              css: asCss(rendered),
              unsupportedCompositing,
              opacityChain,
            };
          };
          const pathFor = (element) => {
            if (element === root) {
              return "control";
            }
            const classes =
              typeof element.className === "string" && element.className
                ? `.${element.className.trim().replace(/\\s+/g, ".")}`
                : "";
            return `${element.tagName.toLowerCase()}${classes}`;
          };
          const layers = [];
          const elements = [root, ...root.querySelectorAll("*")];
          for (const element of elements) {
            const style = getComputedStyle(element);
            if (
              style.display === "none" ||
              style.visibility === "hidden" ||
              Number(style.opacity) <= 0
            ) {
              continue;
            }
            const directText = [...element.childNodes]
              .filter((node) => node.nodeType === Node.TEXT_NODE)
              .map((node) => node.textContent.trim())
              .filter(Boolean)
              .join(" ");
            if (directText) {
              const background = renderThroughOpacityChain(element);
              const foreground = renderThroughOpacityChain(
                element,
                parseColor(style.color),
              );
              layers.push({
                layer: `${pathFor(element)} text`,
                text: directText.slice(0, 100),
                foreground: foreground.css,
                background: background.css,
                unsupportedBackgrounds: [
                  ...foreground.unsupportedCompositing,
                  ...background.unsupportedCompositing,
                ],
                opacityChain: foreground.opacityChain,
              });
            }
            for (const pseudo of pseudos) {
              const pseudoStyle = getComputedStyle(element, pseudo);
              const content = pseudoStyle.content;
              if (
                !content ||
                content === "none" ||
                content === "normal" ||
                content === '""'
              ) {
                continue;
              }
              const background = renderThroughOpacityChain(
                element,
                null,
                pseudo,
              );
              const foreground = renderThroughOpacityChain(
                element,
                parseColor(pseudoStyle.color),
                pseudo,
              );
              layers.push({
                layer: `${pathFor(element)}${pseudo}`,
                text: content.slice(0, 100),
                foreground: foreground.css,
                background: background.css,
                unsupportedBackgrounds: [
                  ...foreground.unsupportedCompositing,
                  ...background.unsupportedCompositing,
                ],
                opacityChain: foreground.opacityChain,
              });
            }
          }
          if (!layers.length) {
            const style = getComputedStyle(root);
            const background = renderThroughOpacityChain(root);
            const foreground = renderThroughOpacityChain(
              root,
              parseColor(style.color),
            );
            layers.push({
              layer: "control accessible label",
              text: root.getAttribute("aria-label") || "",
              foreground: foreground.css,
              background: background.css,
              unsupportedBackgrounds: [
                ...foreground.unsupportedCompositing,
                ...background.unsupportedCompositing,
              ],
              opacityChain: foreground.opacityChain,
            });
          }

          const focusStyle = getComputedStyle(root);
          const focusBackground = root.parentElement
            ? renderThroughOpacityChain(root.parentElement)
            : {
                color: [255, 255, 255, 1],
                css: "rgb(255, 255, 255)",
                unsupportedCompositing: [],
                opacityChain: [],
              };
          const focusForeground = renderThroughOpacityChain(
            root,
            parseColor(focusStyle.outlineColor),
            null,
            false,
          );
          const focusUnsupported = [
            ...focusForeground.unsupportedCompositing,
            ...focusBackground.unsupportedCompositing,
          ];
          if ((parseFloat(focusStyle.outlineOffset) || 0) < 0) {
            focusUnsupported.push(
              "negative outline offset requires indeterminate overlap compositing",
            );
          }
          return {
            layers,
            focus: {
              matchesFocusVisible: root.matches(":focus-visible"),
              outlineStyle: focusStyle.outlineStyle,
              outlineWidth: parseFloat(focusStyle.outlineWidth) || 0,
              outlineOffset: parseFloat(focusStyle.outlineOffset) || 0,
              foreground: focusForeground.css,
              background: focusBackground.css,
              unsupportedBackgrounds: focusUnsupported,
              opacityChain: focusForeground.opacityChain,
            },
          };
        }
        """,
        pseudos,
    )


def _run_partial_opacity_contrast_regression_fixture(browser: Any) -> None:
    """Prove partial ancestor opacity is included in effective contrast."""

    context = browser.new_context(viewport={"width": 390, "height": 844})
    page = context.new_page()
    try:
        page.set_content(
            """
            <style>
              html, body { background: rgb(255, 255, 255); margin: 0; }
              .faded { opacity: 0.1; }
              a {
                background: rgb(0, 0, 0);
                color: rgb(255, 255, 255);
                display: inline-flex;
                min-height: 44px;
                min-width: 44px;
                outline: 3px solid rgb(0, 0, 0);
                outline-offset: 3px;
              }
              a::after {
                color: rgb(255, 255, 255);
                content: "Pseudo cue";
              }
            </style>
            <div class="faded">
              <a href="#partial-opacity">Text label</a>
            </div>
            """
        )
        control = page.locator("a[href='#partial-opacity']")
        _require(
            control.evaluate(
                """
                (node) => {
                  const rect = node.getBoundingClientRect();
                  const hit = document.elementFromPoint(
                    rect.left + rect.width / 2,
                    rect.top + rect.height / 2,
                  );
                  return hit === node || node.contains(hit);
                }
                """
            ),
            "Partial-opacity fixture must remain hit-testable",
        )
        page.keyboard.press("Tab")
        evidence = _computed_interaction_layers(
            control,
            ("::before", "::after"),
        )
        _require(
            evidence["focus"]["matchesFocusVisible"],
            "Partial-opacity fixture did not enter focus-visible state",
        )
        layer_names = {layer["layer"] for layer in evidence["layers"]}
        _require(
            any(name.endswith(" text") for name in layer_names)
            and any(name.endswith("::after") for name in layer_names),
            "Partial-opacity fixture did not exercise text and pseudo layers: "
            f"{sorted(layer_names)}",
        )
        _require(
            all(
                not layer["unsupportedBackgrounds"]
                for layer in evidence["layers"]
            )
            and not evidence["focus"]["unsupportedBackgrounds"],
            "Partial-opacity fixture unexpectedly used indeterminate "
            f"compositing: {evidence}",
        )
        measured_ratios = [
            *(
                contrast_ratio_from_css(
                    layer["foreground"],
                    layer["background"],
                )
                for layer in evidence["layers"]
            ),
            contrast_ratio_from_css(
                evidence["focus"]["foreground"],
                evidence["focus"]["background"],
            ),
        ]
        _require(
            measured_ratios
            and all(1.20 <= ratio <= 1.30 for ratio in measured_ratios),
            "Partial-opacity fixture did not resolve near its true "
            f"low effective contrast: {measured_ratios}",
        )
        try:
            _require(
                all(ratio >= 4.5 for ratio in measured_ratios[:-1])
                and measured_ratios[-1] >= 3,
                "partial ancestor opacity contrast must fail: "
                f"{measured_ratios}",
            )
        except AcceptanceFailure as error:
            _require(
                "partial ancestor opacity contrast must fail" in str(error),
                f"Partial-opacity fixture failed unexpectedly: {error}",
            )
        else:
            raise AcceptanceFailure(
                "Partial-opacity fixture was incorrectly accepted"
            )
    finally:
        context.close()


def _focus_with_keyboard(page: Any, interactive: Any) -> None:
    focusable_count = page.locator(
        "a[href], button:not([disabled]), input:not([disabled]), "
        "select:not([disabled]), textarea:not([disabled]), summary, "
        "[tabindex]:not([tabindex='-1'])"
    ).count()
    for _ in range(focusable_count * 2 + 4):
        page.keyboard.press("Tab")
        if interactive.evaluate("(node) => document.activeElement === node"):
            break
    else:
        raise AcceptanceFailure("Keyboard focus did not reach contrast probe")

    focus = interactive.evaluate(
        """
        (node) => {
          const style = getComputedStyle(node);
          return {
            focusVisible: node.matches(":focus-visible"),
            outlineStyle: style.outlineStyle,
            outlineWidth: parseFloat(style.outlineWidth) || 0,
          };
        }
        """
    )
    _require(
        focus["focusVisible"],
        f"Keyboard-focused contrast probe did not match :focus-visible ({focus})",
    )
    _require(
        focus["outlineStyle"] not in {"none", "hidden"}
        and focus["outlineWidth"] >= 2,
        f"Keyboard-focused contrast probe lacks a visible outline ({focus})",
    )


def _focus_actionable_indices(
    page: Any,
    expected_count: int,
) -> Iterator[int]:
    """Yield every actionable once in actual keyboard tab order."""

    focusable_count = page.locator(
        "a[href], button:not([disabled]), input:not([disabled]), "
        "select:not([disabled]), textarea:not([disabled]), summary, "
        "[tabindex]:not([tabindex='-1'])"
    ).count()
    page.mouse.move(1, 1)
    page.evaluate(
        "() => document.activeElement instanceof HTMLElement "
        "&& document.activeElement.blur()"
    )
    seen: set[int] = set()
    for _ in range(focusable_count * 2 + 4):
        page.keyboard.press("Tab")
        index = page.evaluate(
            """
            (selector) => {
              const actionables = [...document.querySelectorAll(selector)];
              return actionables.indexOf(document.activeElement);
            }
            """,
            ACTIONABLE_SELECTOR,
        )
        if index < 0 or index in seen:
            continue
        seen.add(index)
        yield index
        if len(seen) == expected_count:
            return
    raise AcceptanceFailure(
        "Keyboard tab order did not reach actionable indices "
        f"{sorted(set(range(expected_count)) - seen)}"
    )


def _prepare_interaction_state(
    page: Any,
    interactive: Any,
    state: str,
) -> None:
    page.mouse.move(1, 1)
    page.evaluate(
        "() => document.activeElement instanceof HTMLElement "
        "&& document.activeElement.blur()"
    )
    if state == "rest":
        return
    if state == "focus-visible":
        _focus_with_keyboard(page, interactive)
        return
    if state == "hover":
        if interactive.evaluate("(node) => node.matches('a.skip-link')"):
            _focus_with_keyboard(page, interactive)
        interactive.hover()
        _require(
            interactive.evaluate("(node) => node.matches(':hover')"),
            "Actionable hover state did not activate",
        )
        return
    raise ValueError(f"Unknown interaction state: {state}")


def _run_contrast_contract(browser: Any, origin: str) -> dict[str, float]:
    state_minima = {
        **{state: float("inf") for state in INTERACTION_STATES},
        "focus-indicator": float("inf"),
    }
    covered_variant_classes: set[str] = set()
    covered_audiences: set[str] = set()
    failures: list[str] = []
    for viewport in VIEWPORTS:
        context = browser.new_context(
            viewport={"width": viewport.width, "height": viewport.height},
        )
        signals = PageSignals()
        _attach_request_guard(context, origin, signals)
        page = context.new_page()
        page.set_default_timeout(5_000)
        _attach_page_signals(page, signals)
        try:
            checkpoint = _navigate(page, signals, origin, "/")
            pair = _computed_color_pair(page, ".atlas-card h3", ".atlas-card")
            static_ratios = {
                "atlas card heading": contrast_ratio_from_css(*pair),
            }
            _assert_clean_signals(
                signals,
                checkpoint,
                f"atlas contrast at {viewport.width}px",
            )

            checkpoint = _navigate(
                page,
                signals,
                origin,
                _route_for_frame("V08"),
            )
            pairs = {
                "surface heading": _computed_color_pair(
                    page,
                    ".product-surface__header h1",
                    ".product-surface",
                ),
                "synthetic marker": _computed_color_pair(
                    page,
                    ".study-markers strong",
                    ".study-markers strong",
                ),
                "guarded primary action": _computed_color_pair(
                    page,
                    ".product-action--guarded.product-action--primary > span",
                    ".product-action--guarded.product-action--primary",
                ),
                "linked primary action": _computed_color_pair(
                    page,
                    "a.product-action--primary > span",
                    "a.product-action--primary",
                ),
            }
            static_ratios.update(
                {
                    label: contrast_ratio_from_css(*colors)
                    for label, colors in pairs.items()
                }
            )
            for label, ratio in static_ratios.items():
                _require(
                    ratio >= 4.5,
                    f"{label} at {viewport.width}px contrast is "
                    f"{ratio:.2f}:1, below 4.5:1",
                )
            _assert_clean_signals(
                signals,
                checkpoint,
                f"frame contrast at {viewport.width}px",
            )

            for route in expected_route_paths():
                checkpoint = _navigate(page, signals, origin, route)
                actionables = page.locator(ACTIONABLE_SELECTOR)
                rest_controls = page.locator(CONTRAST_REST_SELECTOR)
                _require(
                    actionables.count() > 0,
                    f"{route} at {viewport.width}px: "
                    "no rendered actionable controls found",
                )
                for state in INTERACTION_STATES:
                    if state == "focus-visible":
                        indexed_controls = (
                            (index, actionables.nth(index))
                            for index in _focus_actionable_indices(
                                page,
                                actionables.count(),
                            )
                        )
                    else:
                        controls = (
                            rest_controls
                            if state == "rest"
                            else actionables
                        )
                        if state == "rest":
                            page.mouse.move(1, 1)
                            page.evaluate(
                                "() => document.activeElement instanceof "
                                "HTMLElement && document.activeElement.blur()"
                            )
                        indexed_controls = (
                            (index, controls.nth(index))
                            for index in range(controls.count())
                        )
                    for index, control in indexed_controls:
                        descriptor = control.evaluate(
                            """
                            (node) => ({
                              label:
                                node.getAttribute("data-label") ||
                                node.getAttribute("aria-label") ||
                                node.textContent.trim().replace(/\\s+/g, " ").slice(0, 100) ||
                                node.tagName,
                              tag: node.tagName.toLowerCase(),
                              classes:
                                typeof node.className === "string"
                                  ? node.className
                                  : "",
                              href: node.getAttribute("href") || "",
                              audiences: node.getAttribute("data-audiences") || "",
                            })
                            """
                        )
                        if state == "rest":
                            covered_variant_classes.update(
                                str(descriptor["classes"]).split()
                            )
                            covered_audiences.update(
                                str(descriptor["audiences"]).split()
                            )
                        control_label = (
                            f"route {route} at {viewport.width}px "
                            f"control #{index + 1} {descriptor}"
                        )
                        if state == "hover":
                            _prepare_interaction_state(
                                page,
                                control,
                                state,
                            )
                        evidence = _computed_interaction_layers(
                            control,
                            ("::before", "::after"),
                        )
                        for layer in evidence["layers"]:
                            if layer["unsupportedBackgrounds"]:
                                failures.append(
                                    f"{control_label} {state} "
                                    f"{layer['layer']}: cannot resolve "
                                    "effective compositing "
                                    f"{layer['unsupportedBackgrounds']}"
                                )
                                continue
                            ratio = contrast_ratio_from_css(
                                layer["foreground"],
                                layer["background"],
                            )
                            state_minima[state] = min(
                                state_minima[state],
                                ratio,
                            )
                            if ratio < 4.5:
                                failures.append(
                                    f"{control_label} {state} "
                                    f"{layer['layer']} {layer['text']!r}: "
                                    f"{ratio:.2f}:1 "
                                    f"({layer['foreground']} on "
                                    f"{layer['background']}; opacity chain "
                                    f"{layer['opacityChain']})"
                                )
                        if state == "focus-visible":
                            focus = evidence["focus"]
                            if focus["unsupportedBackgrounds"]:
                                failures.append(
                                    f"{control_label} focus indicator: "
                                    "cannot resolve effective compositing "
                                    f"{focus['unsupportedBackgrounds']}"
                                )
                            focus_ratio = contrast_ratio_from_css(
                                focus["foreground"],
                                focus["background"],
                            )
                            state_minima["focus-indicator"] = min(
                                state_minima["focus-indicator"],
                                focus_ratio,
                            )
                            if (
                                not focus["matchesFocusVisible"]
                                or focus["outlineStyle"]
                                in {"none", "hidden"}
                                or focus["outlineWidth"] < 2
                                or focus_ratio < 3
                            ):
                                failures.append(
                                    f"{control_label} focus indicator is "
                                    "not visible/contrasting: "
                                    f"{focus_ratio:.2f}:1 ({focus}; "
                                    f"opacity chain "
                                    f"{focus['opacityChain']})"
                                )
                _assert_clean_signals(
                    signals,
                    checkpoint,
                    f"interaction contrast {route} at "
                    f"{viewport.width}px",
                )
        finally:
            context.close()

    required_variant_classes = {
        "product-action--caution",
        "product-action--destructive",
        "product-action--facilitator",
        "product-action--user",
        "shell-link--safety",
    }
    _require(
        required_variant_classes.issubset(covered_variant_classes),
        "Contrast inventory missed rendered action variants: "
        f"{sorted(required_variant_classes - covered_variant_classes)}",
    )
    required_audiences = {
        "viewer",
        "featured_participant",
        "facilitator",
    }
    _require(
        required_audiences.issubset(covered_audiences),
        "Contrast inventory missed role audiences: "
        f"{sorted(required_audiences - covered_audiences)}",
    )
    if failures:
        raise AcceptanceFailure(
            "Interaction contrast failed:\n- " + "\n- ".join(failures)
        )
    return state_minima


def _run_first_viewport_contract(browser: Any, origin: str) -> None:
    representatives = (
        ("consent", "V01"),
        ("live", "V08"),
        ("discovery", "F07"),
        ("console", "C03"),
        ("report", "S02-VIEWER"),
        ("conversation", "V17"),
        ("meeting", "V18"),
    )
    context = browser.new_context(viewport={"width": 390, "height": 844})
    signals = PageSignals()
    _attach_request_guard(context, origin, signals)
    page = context.new_page()
    _attach_page_signals(page, signals)
    try:
        for state, frame_id in representatives:
            checkpoint = _navigate(
                page,
                signals,
                origin,
                _route_for_frame(frame_id),
            )
            bounds = page.evaluate(
                """
                () => {
                  const surface = document.querySelector(
                    '[data-first-viewport="priority"]'
                  );
                  const nativeContent = surface.querySelector(
                    ".surface-native-ui"
                  );
                  const controls = document.querySelector(".control-deck");
                  const heading = surface.querySelector("h1");
                  const surfaceRect = surface.getBoundingClientRect();
                  const nativeRect = nativeContent.getBoundingClientRect();
                  const headingRect = heading.getBoundingClientRect();
                  const controlsRect = controls.getBoundingClientRect();
                  const visibleSurface = Math.max(
                    0,
                    Math.min(surfaceRect.bottom, innerHeight) -
                    Math.max(surfaceRect.top, 0),
                  );
                  return {
                    scrollY,
                    viewportHeight: innerHeight,
                    surfaceTop: surfaceRect.top,
                    surfaceBottom: surfaceRect.bottom,
                    headingTop: headingRect.top,
                    nativeTop: nativeRect.top,
                    controlsTop: controlsRect.top,
                    visibleSurface,
                    nativeChildren: nativeContent.children.length,
                  };
                }
                """
            )
            height = bounds["viewportHeight"]
            _require(
                bounds["scrollY"] == 0,
                f"{state}/{frame_id}: route did not start at the first viewport",
            )
            _require(
                bounds["surfaceTop"] <= height * 0.72,
                f"{state}/{frame_id}: priority surface starts too low ({bounds})",
            )
            _require(
                bounds["headingTop"] <= height * 0.82,
                f"{state}/{frame_id}: priority heading starts too low ({bounds})",
            )
            _require(
                bounds["nativeChildren"] > 0
                and bounds["nativeTop"] <= height,
                f"{state}/{frame_id}: native state content misses first viewport ({bounds})",
            )
            _require(
                bounds["visibleSurface"] >= height * 0.25,
                f"{state}/{frame_id}: too little priority surface is visible ({bounds})",
            )
            _require(
                bounds["controlsTop"] > bounds["surfaceTop"],
                f"{state}/{frame_id}: controls precede priority surface ({bounds})",
            )
            _assert_clean_signals(
                signals,
                checkpoint,
                f"first viewport {state}/{frame_id}",
            )
    finally:
        context.close()


def _capture_screenshot_evidence(
    browser: Any,
    origin: str,
    screenshot_directory: Path,
) -> tuple[Path, ...]:
    screenshot_directory = screenshot_directory.expanduser().resolve()
    screenshot_directory.mkdir(parents=True, exist_ok=True)
    evidence = (
        ("atlas-desktop.png", "/", Viewport(1440, 900), True),
        (
            "viewer-live-mobile.png",
            _route_for_frame("V08"),
            Viewport(390, 844),
            False,
        ),
        (
            "facilitator-console-desktop.png",
            _route_for_frame("C03"),
            Viewport(1440, 900),
            False,
        ),
    )
    paths: list[Path] = []
    for filename, route, viewport, full_page in evidence:
        context = browser.new_context(
            viewport={"width": viewport.width, "height": viewport.height},
            reduced_motion="reduce",
        )
        signals = PageSignals()
        _attach_request_guard(context, origin, signals)
        page = context.new_page()
        _attach_page_signals(page, signals)
        try:
            checkpoint = _navigate(page, signals, origin, route)
            destination = screenshot_directory / filename
            page.screenshot(path=str(destination), full_page=full_page)
            _assert_clean_signals(signals, checkpoint, f"screenshot {filename}")
            paths.append(destination)
        finally:
            context.close()
    return tuple(paths)


def _run_browser_acceptance(
    browser: Any,
    origin: str,
    screenshot_directory: Path | None,
) -> tuple[dict[str, float], tuple[Path, ...]]:
    _run_actionability_regression_fixture(browser)
    _run_partial_opacity_contrast_regression_fixture(browser)
    _run_route_matrix(browser, origin)
    _run_navigation_contracts(browser, origin)
    _run_reduced_motion_contract(browser, origin)
    _run_print_contract(browser, origin)
    contrast_minima = _run_contrast_contract(browser, origin)
    _run_first_viewport_contract(browser, origin)
    screenshots = (
        _capture_screenshot_evidence(browser, origin, screenshot_directory)
        if screenshot_directory is not None
        else ()
    )
    return contrast_minima, screenshots


def _parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Generate and test the local-only Live Introductions static prototype "
            "in headless Chromium."
        ),
    )
    parser.add_argument(
        "--screenshot-dir",
        type=Path,
        help=(
            "Optional directory for atlas desktop, viewer live mobile, and "
            "facilitator console desktop PNG evidence."
        ),
    )
    return parser.parse_args()


def main() -> int:
    args = _parse_args()
    try:
        from playwright.sync_api import Error as PlaywrightError
        from playwright.sync_api import sync_playwright
    except ModuleNotFoundError as error:
        print(
            "ERROR: Playwright is not installed in the active Python environment.",
            file=sys.stderr,
        )
        print(
            "Run this acceptance script through the declared project:\n"
            f"  {BROWSER_ACCEPTANCE_COMMAND}",
            file=sys.stderr,
        )
        raise SystemExit(2) from error

    try:
        with _generated_loopback_site() as origin:
            with sync_playwright() as playwright:
                try:
                    browser = playwright.chromium.launch(
                        headless=True,
                        args=["--disable-background-networking"],
                    )
                except PlaywrightError as error:
                    raise AcceptanceDependencyError(
                        "Chromium could not be launched. Install the declared "
                        "Playwright browser without adding a dependency:\n"
                        f"  {CHROMIUM_INSTALL_COMMAND}\n"
                        "Then rerun: make live-introductions-browser"
                    ) from error
                try:
                    contrast_minima, screenshots = _run_browser_acceptance(
                        browser,
                        origin,
                        args.screenshot_dir,
                    )
                finally:
                    browser.close()
    except (AcceptanceFailure, AcceptanceDependencyError, PlaywrightError) as error:
        print(f"ERROR: {error}", file=sys.stderr)
        return 1

    route_count = len(expected_route_paths())
    print("Live Introductions browser acceptance: PASS")
    print(
        f"  responsive matrix: {route_count} routes × {len(VIEWPORTS)} widths "
        f"= {route_count * len(VIEWPORTS)} HTTP-200 page checks"
    )
    print("  request boundary: exact 127.0.0.1 ephemeral origin only")
    print("  navigation: viewer, featured, facilitator, safety, and provenance passed")
    print("  media: reduced-motion and print contracts passed")
    print(
        "  interaction contrast minimums: "
        + " · ".join(
            f"{state} {contrast_minima[state]:.2f}:1"
            for state in INTERACTION_STATES
        )
        + f" · focus indicator {contrast_minima['focus-indicator']:.2f}:1"
    )
    print("  mobile first-viewport states: 7 passed")
    if screenshots:
        print("  screenshot evidence:")
        for screenshot in screenshots:
            print(f"    {screenshot}")
    else:
        print("  screenshot evidence: skipped (optional)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
