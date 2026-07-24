import ast
import io
import inspect
import os
import unittest
from collections import Counter
from contextlib import redirect_stderr, redirect_stdout
from dataclasses import FrozenInstanceError, replace
from html.parser import HTMLParser
from pathlib import Path
import re
import subprocess
import sys
import tempfile
import tomllib
from urllib.parse import unquote, urlsplit


EXPECTED_FRAME_IDS = {
    *(f"V{number:02d}" for number in range(1, 20)),
    "V08A",
    *(f"F{number:02d}" for number in range(1, 9)),
    *(f"C{number:02d}" for number in range(1, 9)),
    *(f"S{number:02d}" for number in range(1, 4)),
}
EXPECTED_FRAME_ORDER = (
    *(f"V{number:02d}" for number in range(1, 9)),
    "V08A",
    *(f"V{number:02d}" for number in range(9, 20)),
    *(f"F{number:02d}" for number in range(1, 9)),
    *(f"C{number:02d}" for number in range(1, 9)),
    *(f"S{number:02d}" for number in range(1, 4)),
)
EXPECTED_SAFETY_VARIANT_IDS = {
    "S02-VIEWER",
    "S02-FEATURED",
    "S02-FACILITATOR",
}
EXPECTED_ROUTABLE_IDS = EXPECTED_FRAME_IDS | EXPECTED_SAFETY_VARIANT_IDS
EXACT_EXTERNAL_CAPTURE_COPY = (
    "This concept does not record, but it cannot prevent or erase "
    "operating-system screenshots, operating-system screen recordings, "
    "or another device filming the screen."
)
REPOSITORY_ROOT = Path(__file__).resolve().parents[1]
GENERATOR = REPOSITORY_ROOT / "scripts" / "generate_live_introductions_prototype.py"


class LiveIntroductionsAcceptanceHarnessTests(unittest.TestCase):
    def test_browser_matrix_declares_every_generated_route_and_required_width(
        self,
    ) -> None:
        from scripts.browser_acceptance_live_introductions import (
            VIEWPORTS,
            expected_route_paths,
        )

        expected_routes = {
            "/",
            *(f"/{frame_id.lower()}/" for frame_id in EXPECTED_ROUTABLE_IDS),
        }
        self.assertEqual(expected_routes, set(expected_route_paths()))
        self.assertEqual(43, len(expected_route_paths()))
        self.assertEqual((390, 768, 1440), tuple(viewport.width for viewport in VIEWPORTS))

    def test_makefile_and_netlify_expose_focused_prototype_commands(self) -> None:
        from scripts.browser_acceptance_live_introductions import (
            BROWSER_ACCEPTANCE_COMMAND,
            CHROMIUM_INSTALL_COMMAND,
        )

        makefile = (REPOSITORY_ROOT / "Makefile").read_text(encoding="utf-8")
        uv_prefix = (
            "uv run --project "
            "tools/live-introductions-browser --frozen"
        )

        self.assertRegex(
            makefile,
            r"(?m)^live-introductions-build:\s*$",
        )
        self.assertRegex(
            makefile,
            r"(?m)^live-introductions-test:\s*$",
        )
        self.assertRegex(
            makefile,
            r"(?m)^live-introductions-browser:\s*$",
        )
        self.assertIn(
            "python3 scripts/generate_live_introductions_prototype.py "
            "--output dist/live-introductions",
            makefile,
        )
        self.assertIn(
            "python3 -m unittest tests.test_live_introductions_prototype",
            makefile,
        )
        self.assertIn(
            f"{uv_prefix} python scripts/browser_acceptance_live_introductions.py",
            makefile,
        )
        self.assertEqual(
            f"{uv_prefix} python scripts/browser_acceptance_live_introductions.py",
            BROWSER_ACCEPTANCE_COMMAND,
        )
        self.assertEqual(
            f"{uv_prefix} playwright install chromium",
            CHROMIUM_INSTALL_COMMAND,
        )
        self.assertRegex(makefile, r"(?m)^test: test-unit ## Default test target$")

        netlify = tomllib.loads(
            (REPOSITORY_ROOT / "netlify.toml").read_text(encoding="utf-8")
        )
        generator_command = (
            "python3 scripts/generate_live_introductions_prototype.py "
            "--output dist/live-introductions"
        )
        verifier_command = (
            "python3 scripts/verify_live_introductions_deploy_context.py"
        )
        preflight_command = f"{verifier_command} --deployment-preflight"
        expected_commands = {
            "build": (
                f'{verifier_command} --context "${{CONTEXT:-missing}}"'
            ),
            "deploy-preview": (
                f"{preflight_command} && "
                f"{verifier_command} --context deploy-preview && "
                f"{generator_command}"
            ),
            "branch-deploy": (
                f"{preflight_command} && "
                f"{verifier_command} --context branch-deploy && "
                f"{generator_command}"
            ),
            "production": f"{verifier_command} --context production",
            "dev": f"{verifier_command} --context dev",
        }
        self.assertEqual("dist/live-introductions", netlify["build"]["publish"])
        self.assertEqual(expected_commands["build"], netlify["build"]["command"])
        self.assertNotIn(generator_command, netlify["build"]["command"])
        self.assertEqual(
            {"deploy-preview", "branch-deploy", "production", "dev"},
            set(netlify["context"]),
        )
        for context in (
            "deploy-preview",
            "branch-deploy",
            "production",
            "dev",
        ):
            with self.subTest(context=context):
                self.assertEqual(
                    expected_commands[context],
                    netlify["context"][context]["command"],
                )

        verifier = (
            REPOSITORY_ROOT
            / "scripts"
            / "verify_live_introductions_deploy_context.py"
        )
        for context in ("deploy-preview", "branch-deploy"):
            with self.subTest(verifier_context=context):
                result = subprocess.run(
                    [
                        sys.executable,
                        str(verifier),
                        "--context",
                        context,
                    ],
                    cwd=REPOSITORY_ROOT,
                    capture_output=True,
                    text=True,
                    check=False,
                )
                self.assertEqual(0, result.returncode, result.stderr)
                self.assertIn(
                    f"HOSTED_CONTEXT_VALIDATED: {context}",
                    result.stdout,
                )
                self.assertIn(
                    "not deployment authorization",
                    result.stdout,
                )

        production = subprocess.run(
            [
                sys.executable,
                str(verifier),
                "--context",
                "production",
            ],
            cwd=REPOSITORY_ROOT,
            capture_output=True,
            text=True,
            check=False,
        )
        self.assertNotEqual(0, production.returncode)
        self.assertIn("PRODUCTION_BLOCKED", production.stderr)
        self.assertIn("production deployment is prohibited", production.stderr)
        configured_production = subprocess.run(
            ["/bin/sh", "-c", expected_commands["production"]],
            cwd=REPOSITORY_ROOT,
            capture_output=True,
            text=True,
            check=False,
        )
        self.assertNotEqual(0, configured_production.returncode)
        self.assertIn("PRODUCTION_BLOCKED", configured_production.stderr)

        blocked_contexts = {
            "dev": "DEV_CONTEXT_BLOCKED: dev",
            "missing": "CONTEXT_MISSING_BLOCKED: missing",
            "local": "UNAPPROVED_CONTEXT_BLOCKED: local",
            "local-validation": (
                "UNAPPROVED_CONTEXT_BLOCKED: local-validation"
            ),
            "quality-review-custom": (
                "UNAPPROVED_CONTEXT_BLOCKED: quality-review-custom"
            ),
        }
        for context, expected_blocker in blocked_contexts.items():
            with self.subTest(blocked_context=context):
                blocked = subprocess.run(
                    [
                        sys.executable,
                        str(verifier),
                        "--context",
                        context,
                    ],
                    cwd=REPOSITORY_ROOT,
                    capture_output=True,
                    text=True,
                    check=False,
                )
                self.assertNotEqual(0, blocked.returncode)
                self.assertIn(expected_blocker, blocked.stderr)

        custom_environment = dict(os.environ)
        custom_environment["CONTEXT"] = "quality-review-custom"
        configured_custom = subprocess.run(
            ["/bin/sh", "-c", expected_commands["build"]],
            cwd=REPOSITORY_ROOT,
            env=custom_environment,
            capture_output=True,
            text=True,
            check=False,
        )
        self.assertNotEqual(0, configured_custom.returncode)
        self.assertIn(
            "UNAPPROVED_CONTEXT_BLOCKED: quality-review-custom",
            configured_custom.stderr,
        )

        self.assertEqual(1, len(netlify["headers"]))
        static_headers = netlify["headers"][0]
        self.assertEqual("/*", static_headers["for"])
        values = static_headers["values"]
        expected_csp = (
            "default-src 'none'; base-uri 'none'; child-src 'none'; "
            "connect-src 'none'; font-src 'none'; frame-ancestors 'none'; "
            "frame-src 'none'; form-action 'none'; img-src 'self'; "
            "manifest-src 'none'; media-src 'none'; object-src 'none'; "
            "script-src 'none'; style-src 'self'; worker-src 'none'"
        )
        self.assertEqual(expected_csp, values["Content-Security-Policy"])
        self.assertEqual("DENY", values["X-Frame-Options"])
        self.assertEqual("nosniff", values["X-Content-Type-Options"])
        self.assertEqual("no-referrer", values["Referrer-Policy"])
        self.assertEqual(
            "camera=(), microphone=(), geolocation=(), payment=(), "
            "usb=(), browsing-topics=()",
            values["Permissions-Policy"],
        )
        self.assertEqual("no-store, max-age=0", values["Cache-Control"])

        forbidden_services = {
            "analytics",
            "blobs",
            "database",
            "edge_functions",
            "forms",
            "functions",
            "identity",
            "images",
            "plugins",
            "redirects",
        }
        self.assertTrue(forbidden_services.isdisjoint(netlify))
        self.assertNotIn("environment", netlify["build"])
        self.assertTrue(
            all(
                "environment" not in context_config
                for context_config in netlify["context"].values()
            )
        )
        netlify_text = (REPOSITORY_ROOT / "netlify.toml").read_text(
            encoding="utf-8"
        )
        self.assertNotRegex(
            netlify_text,
            r"(?im)^\s*[A-Z0-9_]*(?:TOKEN|SECRET|PASSWORD|API_KEY)"
            r"[A-Z0-9_]*\s*=",
        )
        self.assertNotIn("remote_images", netlify_text)

        gitignore_lines = (REPOSITORY_ROOT / ".gitignore").read_text(
            encoding="utf-8"
        ).splitlines()
        self.assertEqual(1, gitignore_lines.count(".netlify/"))

        for target in (
            "live-introductions-netlify-validate",
            "live-introductions-deploy-preflight",
        ):
            self.assertRegex(makefile, rf"(?m)^{target}:\s*$")
        self.assertNotRegex(
            makefile,
            r"(?m)^live-introductions-netlify-build:",
        )
        validation_recipe = re.search(
            r"(?m)^live-introductions-netlify-validate:[ \t]*\n"
            r"(?P<recipe>(?:\t[^\n]*\n)+)",
            makefile,
        )
        self.assertIsNotNone(validation_recipe)
        self.assertRegex(
            makefile,
            r"(?m)^NETLIFY_CLI := npx --yes netlify-cli@23\.13\.0$",
        )
        self.assertIn(
            "$(NETLIFY_CLI) --version",
            validation_recipe.group("recipe"),
        )
        self.assertIn(
            "netlify-cli/23.13.0",
            validation_recipe.group("recipe"),
        )
        self.assertIn(
            "$(NETLIFY_CLI) build --dry --offline",
            validation_recipe.group("recipe"),
        )
        for resolved_context in (
            "production",
            "dev",
            "quality-review-custom",
            "deploy-preview",
            "branch-deploy",
        ):
            with self.subTest(resolved_context=resolved_context):
                self.assertIn(
                    resolved_context,
                    validation_recipe.group("recipe"),
                )
        for resolved_value in (
            "Resolved config",
            "Content-Security-Policy",
            "X-Frame-Options: DENY",
            "LIVE_INTRODUCTIONS_CONFIG_RESOLUTION_ONLY",
            "CONFIG_RESOLUTION_ONLY_BLOCKED",
        ):
            with self.subTest(resolved_value=resolved_value):
                self.assertIn(
                    resolved_value,
                    validation_recipe.group("recipe"),
                )
        self.assertNotIn(
            generator_command,
            validation_recipe.group("recipe"),
        )
        self.assertNotIn("local-validation", makefile)
        self.assertNotIn("local-validation", netlify_text)
        for prohibited_command in (
            "netlify deploy",
            "netlify init",
            "netlify link",
            "netlify login",
            "--no-build",
        ):
            self.assertNotIn(prohibited_command, makefile)
            self.assertNotIn(prohibited_command, netlify_text)

    def test_browser_dependency_and_ci_are_tracked_and_isolated(self) -> None:
        tool_directory = (
            REPOSITORY_ROOT / "tools" / "live-introductions-browser"
        )
        pyproject = (tool_directory / "pyproject.toml").read_text(
            encoding="utf-8"
        )
        lockfile = (tool_directory / "uv.lock").read_text(encoding="utf-8")
        workflow = (
            REPOSITORY_ROOT / ".github" / "workflows" / "ci.yml"
        ).read_text(encoding="utf-8")

        self.assertIn('requires-python = ">=3.12"', pyproject)
        self.assertIn('"playwright==1.61.0"', pyproject)
        self.assertIn("package = false", pyproject)
        self.assertRegex(
            lockfile,
            r'(?s)name = "playwright"\s+version = "1\.61\.0"',
        )
        self.assertIn("live-introductions-prototype:", workflow)
        self.assertIn("uses: actions/setup-python@v6", workflow)
        self.assertIn("uses: astral-sh/setup-uv@v8", workflow)
        self.assertIn("make live-introductions-test", workflow)
        self.assertIn("make live-introductions-build", workflow)
        self.assertIn(
            "uv run --project tools/live-introductions-browser --frozen "
            "playwright install --with-deps chromium",
            workflow,
        )
        self.assertIn("make live-introductions-browser", workflow)

    def test_acceptance_helpers_reject_external_origins_and_measure_contrast(
        self,
    ) -> None:
        from scripts.browser_acceptance_live_introductions import (
            contrast_ratio_from_css,
            is_allowed_local_request,
        )

        origin = "http://127.0.0.1:43123"
        self.assertTrue(
            is_allowed_local_request(
                "http://127.0.0.1:43123/v08/",
                origin,
            )
        )
        for prohibited_url in (
            "http://localhost:43123/v08/",
            "http://127.0.0.1:43124/v08/",
            "https://example.com/asset.css",
            "data:text/plain,remote",
        ):
            with self.subTest(url=prohibited_url):
                self.assertFalse(is_allowed_local_request(prohibited_url, origin))

        self.assertGreaterEqual(
            contrast_ratio_from_css(
                "rgb(41, 39, 35)",
                "rgb(251, 248, 242)",
            ),
            4.5,
        )
        self.assertAlmostEqual(
            1.0,
            contrast_ratio_from_css(
                "rgba(41, 39, 35, 1)",
                "rgb(41, 39, 35)",
            ),
        )
        self.assertGreaterEqual(
            contrast_ratio_from_css(
                "rgb(41, 39, 35)",
                "color(srgb 0.938196 0.925804 0.901961)",
            ),
            4.5,
        )

    def test_browser_contrast_matrix_covers_interactive_states_and_text_layers(
        self,
    ) -> None:
        from scripts.browser_acceptance_live_introductions import (
            ACTIONABLE_SELECTOR,
            CONTRAST_REST_SELECTOR,
            INTERACTION_STATES,
            _computed_interaction_layers,
            _run_partial_opacity_contrast_regression_fixture,
            _run_contrast_contract,
            _run_browser_acceptance,
        )

        self.assertEqual(
            ("rest", "hover", "focus-visible"),
            INTERACTION_STATES,
        )
        self.assertIn("a[href]", ACTIONABLE_SELECTOR)
        self.assertIn(":not([readonly])", ACTIONABLE_SELECTOR)
        self.assertIn(":not([aria-disabled='true'])", ACTIONABLE_SELECTOR)
        self.assertIn(".product-action[aria-disabled='true']", CONTRAST_REST_SELECTOR)
        source = inspect.getsource(_run_contrast_contract)
        self.assertIn("for viewport in VIEWPORTS", source)
        self.assertIn("for route in expected_route_paths()", source)
        self.assertIn("viewport.width", source)
        self.assertIn("viewport.height", source)
        self.assertIn("ACTIONABLE_SELECTOR", source)
        self.assertNotIn(".first", source)
        self.assertIn('"::before"', source)
        self.assertIn('"::after"', source)
        self.assertIn("focus indicator", source)
        for variant in (
            "product-action--caution",
            "product-action--destructive",
            "product-action--facilitator",
            "product-action--user",
            "shell-link--safety",
        ):
            self.assertIn(variant, source)
        self.assertIn("route", source)
        self.assertIn("control", source)
        compositing_source = inspect.getsource(_computed_interaction_layers)
        self.assertIn("applyGroupOpacity", compositing_source)
        self.assertIn("renderThroughOpacityChain", compositing_source)
        self.assertIn("unsupportedCompositing", compositing_source)
        partial_fixture_source = inspect.getsource(
            _run_partial_opacity_contrast_regression_fixture
        )
        self.assertIn("opacity: 0.1", partial_fixture_source)
        self.assertIn("elementFromPoint", partial_fixture_source)
        self.assertIn("contrast_ratio_from_css", partial_fixture_source)
        self.assertIn("1.20", partial_fixture_source)
        self.assertIn("1.30", partial_fixture_source)
        self.assertIn(
            "_run_partial_opacity_contrast_regression_fixture",
            inspect.getsource(_run_browser_acceptance),
        )

    def test_actionability_contract_scrolls_clips_and_hit_tests(self) -> None:
        from scripts.browser_acceptance_live_introductions import (
            ACTIONABLE_SELECTOR,
            _assert_actionable_targets,
            _run_actionability_regression_fixture,
            _run_browser_acceptance,
        )

        self.assertNotIn(".product-action", ACTIONABLE_SELECTOR)
        source = inspect.getsource(_assert_actionable_targets)
        self.assertIn("scroll_into_view_if_needed", source)
        self.assertIn("intersection", source)
        self.assertIn("overflow", source)
        self.assertIn("pointerEvents", source)
        self.assertIn("elementFromPoint", source)
        self.assertIn("topmost", source)
        self.assertIn("effectiveOpacity", source)
        self.assertIn("visibilityBlockedBy", source)
        self.assertIn('getAttribute("aria-hidden")', source)
        self.assertIn(".inert", source)
        fixture_source = inspect.getsource(
            _run_actionability_regression_fixture
        )
        self.assertIn("opacity: 0", fixture_source)
        self.assertIn("elementFromPoint", fixture_source)
        self.assertIn("effective opacity", fixture_source)
        self.assertIn(
            "_run_actionability_regression_fixture",
            inspect.getsource(_run_browser_acceptance),
        )

    def test_browser_runner_help_declares_optional_screenshot_evidence(self) -> None:
        runner = (
            REPOSITORY_ROOT
            / "scripts"
            / "browser_acceptance_live_introductions.py"
        )
        result = subprocess.run(
            [sys.executable, str(runner), "--help"],
            cwd=REPOSITORY_ROOT,
            capture_output=True,
            text=True,
            check=False,
        )

        self.assertEqual(0, result.returncode, result.stderr)
        normalized_help = " ".join(result.stdout.lower().split())
        self.assertIn("--screenshot-dir", normalized_help)
        self.assertIn("atlas desktop", normalized_help)
        self.assertIn("viewer live mobile", normalized_help)
        self.assertIn("facilitator console desktop", normalized_help)

    def test_generated_skip_destination_is_programmatically_focusable(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            output = Path(temporary_directory) / "prototype"
            result = subprocess.run(
                [
                    sys.executable,
                    str(GENERATOR),
                    "--output",
                    str(output),
                ],
                cwd=REPOSITORY_ROOT,
                capture_output=True,
                text=True,
                check=False,
            )
            self.assertEqual(0, result.returncode, result.stderr)

            for page in output.rglob("index.html"):
                with self.subTest(page=page.relative_to(output)):
                    self.assertIn(
                        '<main id="main-content" tabindex="-1">',
                        page.read_text(encoding="utf-8"),
                    )


class LiveIntroductionsDeployGateTests(unittest.TestCase):
    @staticmethod
    def _aws_identity(status: str) -> str:
        verified = status == "VERIFIED"
        return f"""# AWS staging identity fixture

**Status: {status}**

```yaml
status: {status}
cloud_provider: aws
account_id: {"123456789012" if verified else "REPLACE_ME"}
verified_by: {"Human Operator" if verified else "null"}
verified_at_utc: {"2026-07-24T07:00:00Z" if verified else "null"}
notes: >
  Human-owned fixture.
```
"""

    @staticmethod
    def _netlify_identity(status: str) -> str:
        verified = status == "VERIFIED"
        return f"""# Netlify staging identity fixture

**Status: {status}**

```yaml
status: {status}
platform: netlify
team_id: {"team-staging-123" if verified else "REPLACE_ME"}
team_slug: {"swipe-staging" if verified else "REPLACE_ME"}
site_id: {"123e4567-e89b-12d3-a456-426614174000" if verified else "REPLACE_ME"}
site_name: {"swipe-dating-staging" if verified else "REPLACE_ME"}
site_url: {"https://swipe-dating-staging.netlify.app" if verified else "null"}
git_repository_linked: {"true" if verified else "false"}
staging_only: {"true" if verified else "null"}
contains_production_data: false
uses_production_domain: false
enforce_git_based_production_deploys: {"true" if verified else "null"}
production_publish_lock_supported: {"true" if verified else "null"}
production_publish_lock_enabled: {"true" if verified else "null"}
automatic_production_publishing_lock_supported: {"false" if verified else "null"}
automatic_production_publishing_lock_enabled: null
verified_by: {"Human Operator" if verified else "null"}
verified_at_utc: {"2026-07-24T07:00:00Z" if verified else "null"}
notes: >
  Human-owned fixture.
```
"""

    def test_netlify_identity_record_is_human_owned_and_unverified(self) -> None:
        identity_path = (
            REPOSITORY_ROOT
            / "infra"
            / "netlify"
            / "environments"
            / "staging"
            / "ACCOUNT_IDENTITY.md"
        )
        identity = identity_path.read_text(encoding="utf-8")

        self.assertIn("**Status: UNVERIFIED**", identity)
        for field in (
            "status: UNVERIFIED",
            "platform: netlify",
            "team_id: REPLACE_ME",
            "team_slug: REPLACE_ME",
            "site_id: REPLACE_ME",
            "site_name: REPLACE_ME",
            "site_url: null",
            "git_repository_linked: false",
            "staging_only: null",
            "contains_production_data: null",
            "uses_production_domain: null",
            "enforce_git_based_production_deploys: null",
            "production_publish_lock_supported: null",
            "production_publish_lock_enabled: null",
            "automatic_production_publishing_lock_supported: null",
            "automatic_production_publishing_lock_enabled: null",
            "verified_by: null",
            "verified_at_utc: null",
        ):
            with self.subTest(field=field):
                self.assertIn(field, identity)
        self.assertIn(
            "Agents must never mark this record VERIFIED",
            identity,
        )
        self.assertIn("Enforce Git-based deployments", identity)
        create_index = identity.index(
            "Create the staging-only Netlify project"
        )
        link_index = identity.index(
            "Link the Git repository without authorizing or publishing a "
            "deployment"
        )
        stop_index = identity.index(
            "If the UI cannot defer the first build, stop"
        )
        enforce_index = identity.index(
            "After linking, immediately enable **Enforce Git-based "
            "deployments**"
        )
        self.assertLess(create_index, link_index)
        self.assertLess(link_index, enforce_index)
        self.assertLess(stop_index, enforce_index)
        self.assertIn("deploy --no-build", identity)
        self.assertIn(
            "If the required production publishing lock is unavailable after "
            "linking, stop",
            identity,
        )
        self.assertIn(
            "cannot block a raw CLI upload",
            identity,
        )

    def test_identity_parser_accepts_unverified_and_verified_lifecycle(
        self,
    ) -> None:
        from scripts.verify_live_introductions_deploy_context import (
            IdentityStatus,
            load_aws_identity,
            load_netlify_identity,
            verify_deployment_preflight,
        )

        with tempfile.TemporaryDirectory() as temporary_directory:
            root = Path(temporary_directory)
            aws_identity = root / "aws.md"
            netlify_identity = root / "netlify.md"
            aws_identity.write_text(
                self._aws_identity("UNVERIFIED"),
                encoding="utf-8",
            )
            netlify_identity.write_text(
                self._netlify_identity("UNVERIFIED"),
                encoding="utf-8",
            )

            self.assertIs(
                IdentityStatus.UNVERIFIED,
                load_aws_identity(aws_identity).status,
            )
            self.assertIs(
                IdentityStatus.UNVERIFIED,
                load_netlify_identity(netlify_identity).status,
            )
            stdout = io.StringIO()
            stderr = io.StringIO()
            with redirect_stdout(stdout), redirect_stderr(stderr):
                status = verify_deployment_preflight(
                    aws_identity,
                    netlify_identity,
                )
            self.assertEqual(1, status)
            blocked_output = stdout.getvalue() + stderr.getvalue()
            self.assertIn("AWS_IDENTITY_UNVERIFIED", blocked_output)
            self.assertIn("NETLIFY_IDENTITY_UNVERIFIED", blocked_output)
            self.assertIn("NETLIFY_NO_BUILD_BOUNDARY", blocked_output)
            self.assertIn(
                "create and Git-link the staging-only project without "
                "authorizing or publishing a deployment",
                blocked_output,
            )
            self.assertIn(
                "if the UI cannot defer that build, stop",
                blocked_output,
            )
            self.assertIn(
                "After linking, immediately enable",
                blocked_output,
            )

            aws_identity.write_text(
                self._aws_identity("VERIFIED"),
                encoding="utf-8",
            )
            netlify_identity.write_text(
                self._netlify_identity("VERIFIED"),
                encoding="utf-8",
            )
            self.assertIs(
                IdentityStatus.VERIFIED,
                load_aws_identity(aws_identity).status,
            )
            self.assertIs(
                IdentityStatus.VERIFIED,
                load_netlify_identity(netlify_identity).status,
            )
            stdout = io.StringIO()
            stderr = io.StringIO()
            with redirect_stdout(stdout), redirect_stderr(stderr):
                status = verify_deployment_preflight(
                    aws_identity,
                    netlify_identity,
                )
            self.assertEqual(0, status, stderr.getvalue())
            self.assertIn(
                "DEPLOYMENT_PREFLIGHT_ALLOWED",
                stdout.getvalue(),
            )
            self.assertIn(
                "not deployment or production approval",
                stdout.getvalue(),
            )
            self.assertIn(
                "NETLIFY_NO_BUILD_BOUNDARY",
                stderr.getvalue(),
            )

            stdout = io.StringIO()
            stderr = io.StringIO()
            with redirect_stdout(stdout), redirect_stderr(stderr):
                status = verify_deployment_preflight(
                    aws_identity,
                    netlify_identity,
                    resolution_only=True,
                )
            self.assertEqual(1, status)
            self.assertIn(
                "CONFIG_RESOLUTION_ONLY_BLOCKED",
                stderr.getvalue(),
            )

    def test_preflight_distinguishes_missing_malformed_and_unverified(
        self,
    ) -> None:
        from scripts.verify_live_introductions_deploy_context import (
            evaluate_deployment_preflight,
            verify_deployment_preflight,
        )

        with tempfile.TemporaryDirectory() as temporary_directory:
            root = Path(temporary_directory)
            aws_identity = root / "aws.md"
            netlify_identity = root / "netlify.md"
            scenarios = (
                (
                    "missing",
                    None,
                    None,
                    ("AWS_IDENTITY_MISSING", "NETLIFY_IDENTITY_MISSING"),
                ),
                (
                    "malformed",
                    self._aws_identity("UNVERIFIED").replace(
                        "**Status: UNVERIFIED**",
                        "**Status: VERIFIED**",
                    ),
                    self._netlify_identity("UNVERIFIED").replace(
                        "platform: netlify",
                        "platform: another-service",
                    ),
                    (
                        "AWS_IDENTITY_MALFORMED",
                        "NETLIFY_IDENTITY_MALFORMED",
                    ),
                ),
                (
                    "unverified",
                    self._aws_identity("UNVERIFIED"),
                    self._netlify_identity("UNVERIFIED"),
                    (
                        "AWS_IDENTITY_UNVERIFIED",
                        "NETLIFY_IDENTITY_UNVERIFIED",
                    ),
                ),
            )
            for label, aws_content, netlify_content, expected_codes in scenarios:
                with self.subTest(scenario=label):
                    aws_identity.unlink(missing_ok=True)
                    netlify_identity.unlink(missing_ok=True)
                    if aws_content is not None:
                        aws_identity.write_text(aws_content, encoding="utf-8")
                    if netlify_content is not None:
                        netlify_identity.write_text(
                            netlify_content,
                            encoding="utf-8",
                        )
                    stderr = io.StringIO()
                    with redirect_stderr(stderr):
                        status = verify_deployment_preflight(
                            aws_identity,
                            netlify_identity,
                        )
                    self.assertEqual(1, status)
                    evaluation = evaluate_deployment_preflight(
                        aws_identity,
                        netlify_identity,
                    )
                    self.assertFalse(evaluation.allowed)
                    self.assertEqual(
                        expected_codes,
                        tuple(
                            blocker.code
                            for blocker in evaluation.blockers
                        ),
                    )
                    for code in expected_codes:
                        self.assertIn(code, stderr.getvalue())

    def test_verified_netlify_record_requires_production_safeguards(
        self,
    ) -> None:
        from scripts.verify_live_introductions_deploy_context import (
            IdentityRecordError,
            load_netlify_identity,
        )

        unsafe_records = {
            "git enforcement": (
                "enforce_git_based_production_deploys: true",
                "enforce_git_based_production_deploys: false",
            ),
            "supported publish lock": (
                "production_publish_lock_enabled: true",
                "production_publish_lock_enabled: false",
            ),
            "publish lock support": (
                "production_publish_lock_supported: true\n"
                "production_publish_lock_enabled: true",
                "production_publish_lock_supported: false\n"
                "production_publish_lock_enabled: null",
            ),
            "production data": (
                "contains_production_data: false",
                "contains_production_data: true",
            ),
            "site URL": (
                "site_url: https://swipe-dating-staging.netlify.app",
                "site_url: ftp://example.invalid",
            ),
        }
        with tempfile.TemporaryDirectory() as temporary_directory:
            identity_path = Path(temporary_directory) / "netlify.md"
            for label, (safe_value, unsafe_value) in unsafe_records.items():
                with self.subTest(safeguard=label):
                    identity_path.write_text(
                        self._netlify_identity("VERIFIED").replace(
                            safe_value,
                            unsafe_value,
                        ),
                        encoding="utf-8",
                    )
                    with self.assertRaisesRegex(
                        IdentityRecordError,
                        "VERIFIED Netlify record",
                    ):
                        load_netlify_identity(identity_path)

    def test_canonical_preflight_derives_expectations_without_mutation(
        self,
    ) -> None:
        from scripts.verify_live_introductions_deploy_context import (
            AWS_STAGING_IDENTITY,
            NETLIFY_STAGING_IDENTITY,
            evaluate_deployment_preflight,
        )

        aws_before = AWS_STAGING_IDENTITY.read_bytes()
        netlify_before = NETLIFY_STAGING_IDENTITY.read_bytes()
        evaluation = evaluate_deployment_preflight()
        result = subprocess.run(
            [
                sys.executable,
                str(
                    REPOSITORY_ROOT
                    / "scripts"
                    / "verify_live_introductions_deploy_context.py"
                ),
                "--deployment-preflight",
            ],
            cwd=REPOSITORY_ROOT,
            capture_output=True,
            text=True,
            check=False,
        )
        output = result.stdout + result.stderr
        if evaluation.allowed:
            self.assertEqual(0, result.returncode, result.stderr)
            self.assertIn("DEPLOYMENT_PREFLIGHT_ALLOWED", output)
        else:
            self.assertNotEqual(0, result.returncode)
            self.assertTrue(evaluation.blockers)
            for blocker in evaluation.blockers:
                self.assertIn(blocker.code, output)
        self.assertIn("NETLIFY_NO_BUILD_BOUNDARY", output)

        netlify = tomllib.loads(
            (REPOSITORY_ROOT / "netlify.toml").read_text(encoding="utf-8")
        )
        for context in ("deploy-preview", "branch-deploy"):
            with self.subTest(hosted_context=context):
                hosted = subprocess.run(
                    [
                        "/bin/sh",
                        "-c",
                        netlify["context"][context]["command"],
                    ],
                    cwd=REPOSITORY_ROOT,
                    capture_output=True,
                    text=True,
                    check=False,
                )
                hosted_output = hosted.stdout + hosted.stderr
                if evaluation.allowed:
                    self.assertEqual(0, hosted.returncode, hosted.stderr)
                    self.assertIn(
                        f"HOSTED_CONTEXT_VALIDATED: {context}",
                        hosted_output,
                    )
                else:
                    self.assertNotEqual(0, hosted.returncode)
                    for blocker in evaluation.blockers:
                        self.assertIn(blocker.code, hosted_output)

        self.assertEqual(aws_before, AWS_STAGING_IDENTITY.read_bytes())
        self.assertEqual(
            netlify_before,
            NETLIFY_STAGING_IDENTITY.read_bytes(),
        )

    def test_ci_job_pins_cli_and_checks_every_context_without_deploy(
        self,
    ) -> None:
        workflow = (
            REPOSITORY_ROOT / ".github" / "workflows" / "ci.yml"
        ).read_text(encoding="utf-8")
        match = re.search(
            r"(?ms)^  live-introductions-prototype:\n"
            r"(?P<job>.*?)(?=^  [a-zA-Z0-9_-]+:\n|\Z)",
            workflow,
        )
        self.assertIsNotNone(match)
        job = match.group("job")

        self.assertIn("uses: actions/setup-node@v4", job)
        self.assertIn("node-version: '22'", job)
        self.assertIn("npx --yes netlify-cli@23.13.0 --version", job)
        self.assertIn("netlify-cli/23.13.0", job)
        self.assertIn("make live-introductions-netlify-validate", job)
        for context in ("deploy-preview", "branch-deploy"):
            with self.subTest(context=context):
                self.assertIn(context, job)
        self.assertNotIn("local-validation", job)
        self.assertIn("preflight_status=$?", job)
        self.assertIn("if [[ $preflight_status -eq 0 ]]", job)
        self.assertIn("for context in deploy-preview branch-deploy", job)
        self.assertIn('build --context "$context" --offline', job)
        self.assertIn("matched_blockers", job)
        for blocker in (
            "AWS_IDENTITY_MISSING",
            "AWS_IDENTITY_MALFORMED",
            "AWS_IDENTITY_UNVERIFIED",
            "NETLIFY_IDENTITY_MISSING",
            "NETLIFY_IDENTITY_MALFORMED",
            "NETLIFY_IDENTITY_UNVERIFIED",
        ):
            with self.subTest(blocker=blocker):
                self.assertIn(blocker, job)
        self.assertNotIn(
            "assert_blocked deploy-preview AWS_IDENTITY_UNVERIFIED",
            job,
        )
        for prohibited in (
            "netlify deploy",
            "--no-build",
            "--prod",
            "netlify login",
            "netlify link",
            "netlify init",
        ):
            with self.subTest(prohibited=prohibited):
                self.assertNotIn(prohibited, job)


class PrototypeHTMLParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.tags: Counter[str] = Counter()
        self.attributes: list[tuple[str, dict[str, str]]] = []
        self.ids: set[str] = set()
        self.text_parts: list[str] = []
        self.heading_levels: list[int] = []

    def handle_starttag(
        self,
        tag: str,
        attrs: list[tuple[str, str | None]],
    ) -> None:
        normalized = {name: value or "" for name, value in attrs}
        self.tags[tag] += 1
        self.attributes.append((tag, normalized))
        if normalized.get("id"):
            self.ids.add(normalized["id"])
        if re.fullmatch(r"h[1-6]", tag):
            self.heading_levels.append(int(tag[1]))

    def handle_startendtag(
        self,
        tag: str,
        attrs: list[tuple[str, str | None]],
    ) -> None:
        self.handle_starttag(tag, attrs)

    def handle_data(self, data: str) -> None:
        self.text_parts.append(data)

    @property
    def text(self) -> str:
        return " ".join(" ".join(self.text_parts).split())


class LiveIntroductionsGeneratorTests(unittest.TestCase):
    def _generate(self, output: Path) -> subprocess.CompletedProcess[str]:
        return subprocess.run(
            [
                sys.executable,
                str(GENERATOR),
                "--output",
                str(output),
            ],
            cwd=REPOSITORY_ROOT,
            capture_output=True,
            text=True,
            check=False,
        )

    def test_generator_builds_linked_atlas_and_first_frame(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            output = Path(temporary_directory) / "prototype"
            result = self._generate(output)

            self.assertEqual(0, result.returncode, result.stderr)
            atlas = (output / "index.html").read_text(encoding="utf-8")
            frame = (output / "v01" / "index.html").read_text(encoding="utf-8")
            self.assertIn('href="v01/"', atlas)
            self.assertIn('data-frame-id="V01"', frame)
            self.assertIn("SYNTHETIC / FICTIONAL", frame)

    def test_generator_writes_exact_deterministic_inventory(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            root = Path(temporary_directory)
            first = root / "first"
            second = root / "second"

            for output in (first, second):
                result = self._generate(output)
                self.assertEqual(0, result.returncode, result.stderr)

            expected_paths = {
                "index.html",
                "app.css",
                *(
                    f"{frame_id.lower()}/index.html"
                    for frame_id in EXPECTED_ROUTABLE_IDS
                ),
            }

            def generated_files(output: Path) -> dict[str, bytes]:
                return {
                    path.relative_to(output).as_posix(): path.read_bytes()
                    for path in output.rglob("*")
                    if path.is_file()
                }

            first_files = generated_files(first)
            second_files = generated_files(second)
            self.assertEqual(expected_paths, set(first_files))
            self.assertEqual(first_files, second_files)

    def test_generator_replaces_stale_files_in_its_previous_output(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            output = Path(temporary_directory) / "prototype"
            first_result = self._generate(output)
            self.assertEqual(0, first_result.returncode, first_result.stderr)
            stale_file = output / "stale-preview.html"
            stale_file.write_text("obsolete", encoding="utf-8")

            second_result = self._generate(output)

            self.assertEqual(0, second_result.returncode, second_result.stderr)
            self.assertFalse(stale_file.exists())

    def test_generator_refuses_repository_and_source_tree_outputs(self) -> None:
        protected_paths = (
            REPOSITORY_ROOT,
            REPOSITORY_ROOT.parent,
            REPOSITORY_ROOT / "web" / "live-introductions-src",
            REPOSITORY_ROOT / "scripts",
        )
        for protected_path in protected_paths:
            with self.subTest(output=protected_path):
                result = self._generate(protected_path)
                self.assertNotEqual(0, result.returncode)
                self.assertIn("unsafe output path", result.stderr.lower())

    def test_generator_preserves_unique_unmarked_foreign_directory(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            external_root = Path(temporary_directory)
            self.assertNotIn(REPOSITORY_ROOT, external_root.parents)
            foreign_output = external_root / "foreign-existing-directory"
            foreign_output.mkdir()
            sentinel = foreign_output / "do-not-delete.txt"
            sentinel.write_text("foreign sentinel", encoding="utf-8")

            result = self._generate(foreign_output)

            self.assertNotEqual(0, result.returncode)
            self.assertIn(
                "refusing to replace a non-empty directory",
                result.stderr.lower(),
            )
            self.assertTrue(sentinel.is_file())
            self.assertEqual(
                "foreign sentinel",
                sentinel.read_text(encoding="utf-8"),
            )

    def test_generated_pages_are_local_semantic_and_fully_linked(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            output = Path(temporary_directory) / "prototype"
            result = self._generate(output)
            self.assertEqual(0, result.returncode, result.stderr)
            resolved_output = output.resolve()

            html_files = sorted(output.rglob("*.html"))
            parsed_by_path: dict[Path, PrototypeHTMLParser] = {}
            frame_ids: set[str] = set()

            for html_file in html_files:
                markup = html_file.read_text(encoding="utf-8")
                parser = PrototypeHTMLParser()
                parser.feed(markup)
                parsed_by_path[html_file.resolve()] = parser

                with self.subTest(page=html_file.relative_to(output)):
                    self.assertNotRegex(markup, r"\{\{[A-Z_]+\}\}")
                    self.assertEqual(1, parser.tags["h1"])
                    for landmark in ("header", "nav", "main", "footer"):
                        self.assertGreaterEqual(parser.tags[landmark], 1)
                    self.assertIn("SYNTHETIC / FICTIONAL", parser.text)
                    self.assertIn("WIREFRAME ONLY", parser.text)
                    self.assertEqual(0, parser.tags["script"])
                    self.assertEqual(0, parser.tags["form"])
                    self.assertTrue(
                        any(
                            tag == "a"
                            and "skip-link" in attrs.get("class", "").split()
                            and attrs.get("href") == "#main-content"
                            for tag, attrs in parser.attributes
                        )
                    )

                    for tag, attrs in parser.attributes:
                        for attribute_name in ("href", "src", "action"):
                            value = attrs.get(attribute_name)
                            if value is None:
                                continue
                            parsed_url = urlsplit(value)
                            self.assertFalse(
                                parsed_url.scheme
                                or parsed_url.netloc
                                or value.startswith("//"),
                                (tag, attribute_name, value),
                            )

                    body_attributes = next(
                        (
                            attrs
                            for tag, attrs in parser.attributes
                            if tag == "body"
                        ),
                        {},
                    )
                    frame_id = body_attributes.get("data-frame-id")
                    if frame_id:
                        frame_ids.add(frame_id)
                        self.assertEqual(
                            html_file.parent.name,
                            frame_id.lower(),
                        )

            self.assertEqual(len(EXPECTED_ROUTABLE_IDS) + 1, len(html_files))
            self.assertEqual(EXPECTED_ROUTABLE_IDS, frame_ids)
            atlas_text = parsed_by_path[(output / "index.html").resolve()].text
            for group_label in (
                "Viewer · 20 frames",
                "Featured participant · 8 frames",
                "Independent facilitator · 8 frames",
                "Cross-role safety / integrity · 3 frames",
            ):
                self.assertIn(group_label, atlas_text)

            for source_path, parser in parsed_by_path.items():
                for tag, attrs in parser.attributes:
                    href = attrs.get("href")
                    if tag not in {"a", "link"} or href is None:
                        continue
                    parsed_url = urlsplit(href)
                    relative_path = unquote(parsed_url.path)
                    target = (
                        source_path
                        if not relative_path
                        else (source_path.parent / relative_path).resolve()
                    )
                    if relative_path.endswith("/") or target.is_dir():
                        target = target / "index.html"
                    with self.subTest(
                        source=source_path.relative_to(resolved_output),
                        href=href,
                    ):
                        self.assertTrue(target.is_file())
                        if parsed_url.fragment and target.suffix == ".html":
                            self.assertIn(
                                unquote(parsed_url.fragment),
                                parsed_by_path[target.resolve()].ids,
                            )

    def test_generated_controls_preserve_catalog_ownership_and_guards(
        self,
    ) -> None:
        from scripts.live_introductions_catalog import (
            ActionScope,
            SurfaceContext,
            TerminalClass,
            TransitionKind,
            all_frames,
            frame_actions_for,
            review_transitions_for,
            shell_actions_for,
            transitions_for,
        )

        with tempfile.TemporaryDirectory() as temporary_directory:
            output = Path(temporary_directory) / "prototype"
            result = self._generate(output)
            self.assertEqual(0, result.returncode, result.stderr)

            v12_sources: set[str] = set()
            blocked_terminal_targets = {"V12", "V13", "V14", "F07", "F08"}

            for frame in all_frames():
                parser = PrototypeHTMLParser()
                parser.feed(
                    (output / frame.id.lower() / "index.html").read_text(
                        encoding="utf-8"
                    )
                )
                actual_body_nodes = [
                    (tag, attrs)
                    for tag, attrs in parser.attributes
                    if attrs.get("data-control-scope") == "body"
                ]
                actual_shell_nodes = [
                    (tag, attrs)
                    for tag, attrs in parser.attributes
                    if attrs.get("data-control-scope") == "shell"
                ]
                actual_system_nodes = [
                    (tag, attrs)
                    for tag, attrs in parser.attributes
                    if attrs.get("data-transition-kind") == "system"
                ]
                actual_review_nodes = [
                    (tag, attrs)
                    for tag, attrs in parser.attributes
                    if attrs.get("data-transition-kind") == "review"
                ]

                control_audiences = (
                    frame.presentation.control_audiences
                    or (frame.presentation.audience,)
                )
                expected_body = {
                    (
                        action.label,
                        action.target_id,
                        action.kind.value,
                        action.guard.value,
                        audience.value,
                    )
                    for audience in control_audiences
                    for action in frame_actions_for(frame.id, audience)
                    if not (
                        frame.presentation.context
                        is SurfaceContext.NO_LIVE_CONTINUATION
                        and action.scope
                        is ActionScope.LIVE_DERIVED_CONTINUATION
                    )
                }
                actual_body = {
                    (
                        attrs["data-label"],
                        attrs["data-target-id"],
                        attrs["data-transition-kind"],
                        attrs["data-guard"],
                        attrs["data-audiences"],
                    )
                    for _, attrs in actual_body_nodes
                }
                expected_shell = {
                    (
                        action.label,
                        action.target_id or "",
                        action.kind.value,
                        action.guard.value,
                    )
                    for action in shell_actions_for(
                        frame.id,
                        frame.presentation.audience,
                    )
                }
                actual_shell = {
                    (
                        attrs["data-label"],
                        attrs.get("data-target-id", ""),
                        attrs["data-shell-kind"],
                        attrs["data-guard"],
                    )
                    for _, attrs in actual_shell_nodes
                }
                expected_system = {
                    (
                        action.label,
                        action.target_id,
                        action.guard.value,
                    )
                    for action in transitions_for(
                        frame.id,
                        kind=TransitionKind.SYSTEM,
                    )
                }
                actual_system = {
                    (
                        attrs["data-label"],
                        attrs["data-target-id"],
                        attrs["data-guard"],
                    )
                    for _, attrs in actual_system_nodes
                }
                expected_review = {
                    (
                        action.label,
                        action.target_id,
                        action.guard.value,
                    )
                    for action in review_transitions_for(frame.id)
                }
                actual_review = {
                    (
                        attrs["data-label"],
                        attrs["data-target-id"],
                        attrs["data-guard"],
                    )
                    for _, attrs in actual_review_nodes
                }

                with self.subTest(frame=frame.id):
                    self.assertEqual(expected_body, actual_body)
                    self.assertEqual(len(actual_body), len(actual_body_nodes))
                    self.assertTrue(
                        all(tag in {"a", "div"} for tag, _ in actual_body_nodes)
                    )
                    self.assertEqual(expected_shell, actual_shell)
                    self.assertEqual(len(actual_shell), len(actual_shell_nodes))
                    self.assertTrue(
                        {
                            item[0] for item in actual_body
                        }.isdisjoint(item[0] for item in actual_shell)
                    )
                    self.assertEqual(expected_system, actual_system)
                    self.assertEqual(len(actual_system), len(actual_system_nodes))
                    self.assertTrue(
                        all(tag != "a" for tag, _ in actual_system_nodes)
                    )
                    self.assertEqual(expected_review, actual_review)
                    self.assertTrue(
                        all(tag != "a" for tag, _ in actual_review_nodes)
                    )

                    for _, attrs in actual_body_nodes:
                        if (
                            frame.id != "V12"
                            and attrs["data-target-id"] == "V12"
                        ):
                            v12_sources.add(frame.id)
                            self.assertEqual(
                                "normal_completion_only",
                                attrs["data-guard"],
                            )
                    if frame.terminal_class is not TerminalClass.NON_TERMINAL:
                        self.assertTrue(
                            blocked_terminal_targets.isdisjoint(
                                attrs["data-target-id"]
                                for _, attrs in actual_body_nodes
                            )
                        )

            self.assertEqual({"V11"}, v12_sources)

    def test_generated_navigation_enforces_terminal_provenance(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            output = Path(temporary_directory) / "prototype"
            result = self._generate(output)
            self.assertEqual(0, result.returncode, result.stderr)

            graph: dict[str, set[str]] = {}
            guarded_link_edges: set[tuple[str, str]] = set()
            v12_sources: set[str] = set()
            f07_sources: set[str] = set()

            for frame_id in EXPECTED_FRAME_IDS:
                parser = PrototypeHTMLParser()
                parser.feed(
                    (output / frame_id.lower() / "index.html").read_text(
                        encoding="utf-8"
                    )
                )
                body_links = [
                    attrs
                    for tag, attrs in parser.attributes
                    if tag == "a"
                    and attrs.get("data-control-scope") == "body"
                ]
                graph[frame_id] = {
                    attrs["data-target-id"]
                    for attrs in body_links
                    if attrs["data-target-id"] in EXPECTED_FRAME_IDS
                    and attrs["data-target-id"] != frame_id
                }
                guarded_link_edges.update(
                    (frame_id, attrs["data-target-id"])
                    for attrs in body_links
                    if attrs.get("data-guard") != "always"
                )
                v12_sources.update(
                    {frame_id}
                    if any(
                        attrs["data-target-id"] == "V12"
                        and frame_id != "V12"
                        for attrs in body_links
                    )
                    else set()
                )
                f07_sources.update(
                    {frame_id}
                    if any(
                        attrs["data-target-id"] == "F07"
                        and frame_id != "F07"
                        for attrs in body_links
                    )
                    else set()
                )

                system_nodes = [
                    tag
                    for tag, attrs in parser.attributes
                    if attrs.get("data-transition-kind") == "system"
                ]
                review_nodes = [
                    (tag, attrs)
                    for tag, attrs in parser.attributes
                    if attrs.get("data-transition-kind") == "review"
                ]
                self.assertTrue(all(tag != "a" for tag in system_nodes))
                self.assertTrue(
                    all(
                        attrs.get("data-control-scope") != "body"
                        for _, attrs in review_nodes
                    )
                )

            def reachable_from(start: str) -> set[str]:
                reached: set[str] = set()
                pending = [start]
                while pending:
                    source = pending.pop()
                    for target in graph[source] - reached:
                        reached.add(target)
                        pending.append(target)
                return reached

            for terminal_id in ("C07", "C08", "S01"):
                with self.subTest(terminal=terminal_id):
                    terminal_markup = (
                        output / terminal_id.lower() / "index.html"
                    ).read_text(encoding="utf-8")
                    self.assertIn(
                        'data-action-scope="closure_reflection"',
                        terminal_markup,
                    )
                    self.assertNotRegex(
                        terminal_markup,
                        r'<a class="product-action[^>]+'
                        r'data-target-id="(?:V11|F06)"',
                    )
                    self.assertTrue(
                        {"V12", "F07"}.isdisjoint(reachable_from(terminal_id))
                    )

            self.assertEqual({("V11", "V12"), ("F06", "F07")}, guarded_link_edges)
            self.assertEqual({"V11"}, v12_sources)
            self.assertEqual({"F06"}, f07_sources)
            for frame_id, target_id in (("V11", "V12"), ("F06", "F07")):
                markup = (output / frame_id.lower() / "index.html").read_text(
                    encoding="utf-8"
                )
                self.assertIn(
                    'data-provenance-variant="normal_completion"',
                    markup,
                )
                self.assertIn(f'data-target-id="{target_id}"', markup)

    def test_generated_actions_are_honest_role_scoped_navigation(self) -> None:
        from scripts.live_introductions_catalog import (
            ATLAS_TARGET,
            ActionIntent,
            ActionScope,
            SurfaceContext,
            TransitionKind,
            all_frames,
            frame_actions_for,
        )

        with tempfile.TemporaryDirectory() as temporary_directory:
            output = Path(temporary_directory) / "prototype"
            result = self._generate(output)
            self.assertEqual(0, result.returncode, result.stderr)

            for frame in all_frames():
                presentation = frame.presentation
                self.assertIsNotNone(presentation)
                parser = PrototypeHTMLParser()
                parser.feed(
                    (output / frame.id.lower() / "index.html").read_text(
                        encoding="utf-8"
                    )
                )
                body_nodes = [
                    (tag, attrs)
                    for tag, attrs in parser.attributes
                    if attrs.get("data-control-scope") == "body"
                ]
                shell_nodes = [
                    (tag, attrs)
                    for tag, attrs in parser.attributes
                    if attrs.get("data-control-scope") == "shell"
                ]
                control_audiences = (
                    presentation.control_audiences or (presentation.audience,)
                )
                expected_actions = tuple(
                    (action, audience)
                    for audience in control_audiences
                    for action in frame_actions_for(frame.id, audience)
                    if not (
                        presentation.context
                        is SurfaceContext.NO_LIVE_CONTINUATION
                        and action.scope
                        is ActionScope.LIVE_DERIVED_CONTINUATION
                    )
                )
                with self.subTest(frame=frame.id):
                    self.assertEqual(
                        [action.label for action, _ in expected_actions],
                        [attrs["data-label"] for _, attrs in body_nodes],
                    )
                    for (tag, attrs), (action, audience) in zip(
                        body_nodes,
                        expected_actions,
                    ):
                        self.assertEqual(
                            audience.value,
                            attrs["data-audiences"],
                        )
                        self.assertEqual(
                            action.scope.value,
                            attrs["data-action-scope"],
                        )
                        if tag == "a":
                            self.assertEqual(
                                ActionIntent.NAVIGATION.value,
                                attrs["data-action-intent"],
                            )
                            self.assertNotEqual(
                                frame.id,
                                attrs["data-target-id"],
                            )
                            self.assertNotEqual(
                                ATLAS_TARGET,
                                attrs["data-target-id"],
                            )
                            self.assertIn(
                                attrs["data-transition-kind"],
                                {
                                    TransitionKind.USER.value,
                                    TransitionKind.FACILITATOR.value,
                                },
                            )
                        else:
                            self.assertEqual("div", tag)
                            self.assertEqual("true", attrs.get("aria-disabled"))
                            self.assertNotIn("href", attrs)
                    self.assertTrue(
                        all(
                            attrs.get("data-audiences")
                            == presentation.audience.value
                            for _, attrs in shell_nodes
                        )
                    )
                    self.assertTrue(
                        all(" " not in attrs.get("data-audiences", "") for _, attrs in body_nodes)
                    )

            for frame_id in ("F07", "F08"):
                parser = PrototypeHTMLParser()
                parser.feed(
                    (output / frame_id.lower() / "index.html").read_text(
                        encoding="utf-8"
                    )
                )
                links_to_live_safety = [
                    attrs
                    for tag, attrs in parser.attributes
                    if tag == "a"
                    and (
                        attrs.get("data-target-id", "").startswith("S02")
                        or attrs.get("data-target-id") == "S03"
                    )
                ]
                self.assertEqual([], links_to_live_safety)

    def test_action_render_intent_is_explicit_and_label_invariant(self) -> None:
        scripts_directory = str(REPOSITORY_ROOT / "scripts")
        if scripts_directory not in sys.path:
            sys.path.insert(0, scripts_directory)
        from generate_live_introductions_prototype import (
            _body_controls_for,
            _render_body_controls,
        )
        from live_introductions_catalog import (
            ActionIntent,
            all_frames,
            routable_frames,
        )

        catalog_path = (
            REPOSITORY_ROOT / "scripts" / "live_introductions_catalog.py"
        )
        source = catalog_path.read_text(encoding="utf-8")
        syntax = ast.parse(source)
        constructor_calls = [
            node.func.id
            for node in ast.walk(syntax)
            if isinstance(node, ast.Call)
            and isinstance(node.func, ast.Name)
            and node.func.id in {"_navigate", "_preview"}
        ]

        self.assertNotIn("navigation_prefixes", source)
        self.assertNotIn("label.casefold()", source)
        self.assertNotRegex(source, r"(?<![A-Za-z0-9_])_action\(")
        self.assertIn("_navigate", constructor_calls)
        self.assertIn("_preview", constructor_calls)
        self.assertGreaterEqual(
            len(constructor_calls),
            sum(len(frame.actions) for frame in all_frames()),
        )
        self.assertEqual(
            1,
            sum(
                isinstance(node, ast.Call)
                and isinstance(node.func, ast.Name)
                and node.func.id == "Action"
                for node in ast.walk(syntax)
            ),
        )

        expected_edges = {
            ("V04", "V05"),
            ("V05", "V04"),
            ("V05", "V06"),
            ("V06", "V03"),
            ("V06", "V05"),
            ("V07", "S02-VIEWER"),
            ("V08", "V09"),
            ("V08", "V11"),
            ("V08A", "S02-VIEWER"),
            ("V08A", "V08"),
            ("V11", "V12"),
            ("V12", "V11"),
            ("V14", "V16"),
            ("V15", "V04"),
            ("V18", "V17"),
            ("V19", "S02-VIEWER"),
            ("V19", "V18"),
            ("F06", "F07"),
            ("C02", "C01"),
            ("C03", "C04"),
            ("C04", "C01"),
            ("C08", "S02-VIEWER"),
            ("S01", "S02-VIEWER"),
            ("S03", "S02-VIEWER"),
            ("S03", "V01"),
            ("S02-FACILITATOR", "C01"),
        }

        expected_edge_counts = Counter(
            {edge: 1 for edge in expected_edges}
        )
        expected_edge_counts[("V08", "V11")] = 2

        def rendered_edges(
            frames: tuple[object, ...],
        ) -> Counter[tuple[str, str]]:
            edges: Counter[tuple[str, str]] = Counter()
            for rendered_frame in frames:
                parser = PrototypeHTMLParser()
                parser.feed(_render_body_controls(rendered_frame))
                edges.update(
                    (rendered_frame.id, attrs["data-target-id"])
                    for tag, attrs in parser.attributes
                    if tag == "a"
                    and attrs.get("data-control-scope") == "body"
                )
            return edges

        canonical_frames = routable_frames()
        self.assertEqual(
            expected_edge_counts,
            rendered_edges(canonical_frames),
        )

        mutated_frames = []
        for frame in canonical_frames:
            original_actions = frame.actions
            mutated_actions = tuple(
                replace(
                    action,
                    label=(
                        f"Preview-only wording {frame.id}-{index}"
                        if action.intent is ActionIntent.NAVIGATION
                        else f"Continue anywhere {frame.id}-{index}"
                    ),
                )
                for index, action in enumerate(original_actions, start=1)
            )
            self.assertEqual(
                tuple(action.intent for action in original_actions),
                tuple(action.intent for action in mutated_actions),
            )
            primary_count = len(frame.primary_actions)
            mutated_frame = replace(
                frame,
                primary_actions=mutated_actions[:primary_count],
                secondary_actions=mutated_actions[primary_count:],
            )
            resolved_mutations = _body_controls_for(mutated_frame)
            self.assertTrue(
                all(
                    action.label.startswith(
                        ("Preview-only wording", "Continue anywhere")
                    )
                    for action, _ in resolved_mutations
                )
            )
            mutated_frames.append(mutated_frame)

        self.assertEqual(
            expected_edge_counts,
            rendered_edges(tuple(mutated_frames)),
        )

        v03 = next(frame for frame in canonical_frames if frame.id == "V03")
        explicit_navigation = replace(
            v03.primary_actions[0],
            intent=ActionIntent.NAVIGATION,
        )
        self.assertEqual(v03.primary_actions[0].label, explicit_navigation.label)
        self.assertIs(ActionIntent.NAVIGATION, explicit_navigation.intent)
        intent_mutated_v03 = replace(
            v03,
            primary_actions=(explicit_navigation,),
        )
        frames_with_explicit_intent_change = tuple(
            intent_mutated_v03 if frame.id == "V03" else frame
            for frame in canonical_frames
        )
        expected_with_explicit_intent = expected_edge_counts.copy()
        expected_with_explicit_intent[("V03", "V04")] = 1
        self.assertEqual(
            expected_with_explicit_intent,
            rendered_edges(frames_with_explicit_intent_change),
        )

    def test_report_preview_destinations_are_catalog_owned_and_role_safe(self) -> None:
        from scripts.live_introductions_catalog import (
            Role,
            SafetyReportDestination,
            get_frame,
            safety_report_frames,
            safety_report_target_for,
            shell_actions_for,
        )

        expected_targets = {
            Role.VIEWER: SafetyReportDestination.VIEWER.value,
            Role.FEATURED_PARTICIPANT: SafetyReportDestination.FEATURED.value,
            Role.FACILITATOR: SafetyReportDestination.FACILITATOR.value,
        }
        self.assertEqual(
            expected_targets,
            {role: safety_report_target_for(role) for role in expected_targets},
        )
        variants = safety_report_frames()
        self.assertEqual(
            EXPECTED_SAFETY_VARIANT_IDS,
            {frame.id for frame in variants},
        )
        for frame in variants:
            presentation = frame.presentation
            self.assertIsNotNone(presentation)
            with self.subTest(variant=frame.id):
                self.assertIs(frame.role, presentation.audience)
                self.assertTrue(
                    all(action.applies_to(frame.role) for action in frame.actions)
                )
                other_roles = {
                    Role.VIEWER,
                    Role.FEATURED_PARTICIPANT,
                    Role.FACILITATOR,
                } - {frame.role}
                self.assertTrue(
                    all(
                        not action.applies_to(other_role)
                        for action in frame.actions
                        for other_role in other_roles
                    )
                )

        viewer_labels = {
            action.label for action in get_frame(expected_targets[Role.VIEWER]).actions
        }
        featured_labels = {
            action.label
            for action in get_frame(expected_targets[Role.FEATURED_PARTICIPANT]).actions
        }
        facilitator_labels = {
            action.label
            for action in get_frame(expected_targets[Role.FACILITATOR]).actions
        }
        self.assertIn("Block Elias", viewer_labels)
        self.assertIn("Hide Live Introductions", viewer_labels)
        for labels in (featured_labels, facilitator_labels):
            self.assertNotIn("Block Elias", labels)
            self.assertNotIn("Hide Live Introductions", labels)
        self.assertFalse(
            any("block" in label.casefold() for label in facilitator_labels)
        )

        shell_sources = {
            "V08": Role.VIEWER,
            "F05": Role.FEATURED_PARTICIPANT,
            "C03": Role.FACILITATOR,
        }
        for frame_id, role in shell_sources.items():
            safety = next(
                action
                for action in shell_actions_for(frame_id, role)
                if action.label == "Safety"
            )
            self.assertEqual(expected_targets[role], safety.target_id)

        with tempfile.TemporaryDirectory() as temporary_directory:
            output = Path(temporary_directory) / "prototype"
            result = self._generate(output)
            self.assertEqual(0, result.returncode, result.stderr)
            for role, target_id in expected_targets.items():
                markup = (output / target_id.lower() / "index.html").read_text(
                    encoding="utf-8"
                )
                parser = PrototypeHTMLParser()
                parser.feed(markup)
                with self.subTest(output=target_id):
                    self.assertIn(
                        f'data-audience="{role.value}"',
                        markup,
                    )
                    current_safety = [
                        (tag, attrs)
                        for tag, attrs in parser.attributes
                        if attrs.get("data-control-scope") == "shell"
                        and attrs.get("data-shell-kind") == "safety"
                    ]
                    self.assertEqual(1, len(current_safety))
                    self.assertNotEqual("a", current_safety[0][0])
                    self.assertEqual(
                        "page",
                        current_safety[0][1].get("aria-current"),
                    )
                    labels = {
                        attrs["data-label"]
                        for _, attrs in parser.attributes
                        if attrs.get("data-control-scope") == "body"
                    }
                    if role is not Role.VIEWER:
                        self.assertNotIn("Block Elias", labels)
                        self.assertNotIn("Hide Live Introductions", labels)

            fallback_parser = PrototypeHTMLParser()
            fallback_parser.feed(
                (output / "s02" / "index.html").read_text(encoding="utf-8")
            )
            fallback_safety = [
                (tag, attrs)
                for tag, attrs in fallback_parser.attributes
                if attrs.get("data-control-scope") == "shell"
                and attrs.get("data-shell-kind") == "safety"
            ]
            self.assertEqual(1, len(fallback_safety))
            self.assertNotEqual("a", fallback_safety[0][0])
            self.assertEqual("page", fallback_safety[0][1].get("aria-current"))

    def test_rendered_safety_destinations_resolve_from_declared_audiences(
        self,
    ) -> None:
        from scripts.live_introductions_catalog import (
            AudienceDestination,
            Role,
            frame_actions_for,
            get_frame,
            routable_frames,
            safety_report_target_for,
            shell_actions_for,
        )

        shared_report = next(
            action
            for action in get_frame("S03").actions
            if action.label == "Open synthetic report preview"
        )
        self.assertEqual(
            {
                role: safety_report_target_for(role)
                for role in (
                    Role.VIEWER,
                    Role.FEATURED_PARTICIPANT,
                    Role.FACILITATOR,
                )
            },
            {
                destination.audience: destination.target_id
                for destination in shared_report.destinations
            },
        )
        self.assertTrue(
            all(
                isinstance(destination, AudienceDestination)
                for destination in shared_report.destinations
            )
        )
        for role in (
            Role.VIEWER,
            Role.FEATURED_PARTICIPANT,
            Role.FACILITATOR,
        ):
            resolved = next(
                action
                for action in frame_actions_for("S03", role)
                if action.label == shared_report.label
            )
            self.assertEqual(safety_report_target_for(role), resolved.target_id)

        with tempfile.TemporaryDirectory() as temporary_directory:
            output = Path(temporary_directory) / "prototype"
            result = self._generate(output)
            self.assertEqual(0, result.returncode, result.stderr)

            s03_markup = (output / "s03" / "index.html").read_text(
                encoding="utf-8"
            )
            self.assertRegex(
                s03_markup,
                r'data-label="Open synthetic report preview"[^>]+'
                r'data-target-id="S02-VIEWER"',
            )
            self.assertNotRegex(
                s03_markup,
                r'data-label="Open synthetic report preview"[^>]+'
                r'data-target-id="S02"',
            )

            for frame in routable_frames():
                parser = PrototypeHTMLParser()
                parser.feed(
                    (output / frame.id.lower() / "index.html").read_text(
                        encoding="utf-8"
                    )
                )
                for _, attrs in parser.attributes:
                    target_id = attrs.get("data-target-id", "")
                    if not target_id.startswith("S02"):
                        continue
                    with self.subTest(frame=frame.id, control=attrs.get("data-label")):
                        audiences = attrs.get("data-audiences", "").split()
                        self.assertEqual(1, len(audiences))
                        audience = Role(audiences[0])
                        expected_target = (
                            "S02"
                            if audience is Role.CROSS_ROLE
                            else safety_report_target_for(audience)
                        )
                        self.assertEqual(expected_target, target_id)
                        if attrs.get("data-control-scope") == "body":
                            declarations = frame_actions_for(frame.id, audience)
                        else:
                            declarations = shell_actions_for(frame.id, audience)
                        self.assertTrue(
                            any(
                                action.label == attrs.get("data-label")
                                and action.target_id == target_id
                                for action in declarations
                            )
                        )

    def test_safety_contracts_are_explicit_and_role_isolated(self) -> None:
        from scripts.live_introductions_catalog import ContractData, get_frame

        expected = {
            "S02": ContractData(
                privacy=(
                    "No reporter identity, target identity, ordinary profile, "
                    "message, or role-specific control is exposed."
                ),
                accessibility=(
                    "Identify this as a neutral fallback and provide no "
                    "preselected product role."
                ),
                failure_exit=(
                    "Nothing is sent; return through ordinary static navigation."
                ),
            ),
            "S02-VIEWER": ContractData(
                privacy=(
                    "Only viewer-selected fictional room context appears. Elias "
                    "receives no report notice, viewer identity, private note, "
                    "or operational case."
                ),
                accessibility=(
                    "Name Elias as the fictional visible subject, preserve "
                    "evidence labels and selection state, and keep block, hide, "
                    "cancel, and exit distinct."
                ),
                failure_exit=(
                    "If the viewer preview is unavailable, nothing is sent or "
                    "saved; block, hide, cancel, and exit previews remain independent."
                ),
            ),
            "S02-FEATURED": ContractData(
                privacy=(
                    "Only the featured participant's own visible content and any "
                    "ordinary candidate or connection already visible to them may "
                    "appear; no viewer identity, roster, or pseudonym is available."
                ),
                accessibility=(
                    "Name the featured-participant scope and expose candidate or "
                    "connection evidence only when that ordinary context is already visible."
                ),
                failure_exit=(
                    "If no ordinary candidate or connection is visible, omit that "
                    "evidence; nothing is sent or saved and cancel and exit remain available."
                ),
            ),
            "S02-FACILITATOR": ContractData(
                privacy=(
                    "Only minimum pseudonymous incident and protocol context may "
                    "appear; no personal block, ordinary profile, viewer roster, "
                    "or private reflection is available."
                ),
                accessibility=(
                    "Name the protocol-scoped authority, preserve pseudonymous "
                    "evidence labels, and distinguish protocol review from "
                    "confirmation and exit."
                ),
                failure_exit=(
                    "If the facilitator preview is unavailable, nothing is sent "
                    "or saved, room control is unchanged, and protocol review and "
                    "exit remain available."
                ),
            ),
        }
        all_copy = {
            copy
            for contract in expected.values()
            for copy in (
                contract.privacy,
                contract.accessibility,
                contract.failure_exit,
            )
        }
        self.assertEqual(12, len(all_copy))

        with tempfile.TemporaryDirectory() as temporary_directory:
            output = Path(temporary_directory) / "prototype"
            result = self._generate(output)
            self.assertEqual(0, result.returncode, result.stderr)

            for frame_id, contract in expected.items():
                frame = get_frame(frame_id)
                self.assertIsNotNone(frame.presentation)
                with self.subTest(frame=frame_id):
                    self.assertEqual(contract, frame.presentation.contract)
                    self.assertEqual(contract.privacy, frame.privacy_statement)
                    self.assertEqual(contract.accessibility, frame.accessibility_note)
                    self.assertEqual(contract.failure_exit, frame.failure_exit_copy)
                    markup = (output / frame_id.lower() / "index.html").read_text(
                        encoding="utf-8"
                    )
                    parser = PrototypeHTMLParser()
                    parser.feed(markup)
                    for own_copy in (
                        contract.privacy,
                        contract.accessibility,
                        contract.failure_exit,
                    ):
                        self.assertIn(own_copy, parser.text)
                    for other_copy in all_copy - {
                        contract.privacy,
                        contract.accessibility,
                        contract.failure_exit,
                    }:
                        self.assertNotIn(other_copy, parser.text)
                    self.assertNotIn(
                        "no reporter identity reaches Elias",
                        parser.text.casefold(),
                    )

    def test_no_live_continuation_suppresses_only_typed_live_edges(self) -> None:
        from scripts.live_introductions_catalog import (
            ActionScope,
            Role,
            get_frame,
        )

        expected_labels = {
            "V15": {
                "Return to invitations",
                "Review my private reflection",
                "Block Elias",
                "Report a concern",
                "Leave Live Introductions",
            },
            "C07": {
                "Leave and open private debrief",
                "Leave and open private reflection",
                "Close protocol incident",
                "Return to ordinary app",
                "Block Elias",
                "Report a concern",
                "Hide Live Introductions",
            },
            "C08": {
                "Open private closure reflection",
                "Acknowledge neutral closure",
                "Return to ordinary app",
                "Block Elias",
                "Open synthetic report preview",
                "Hide Live Introductions",
            },
            "S01": {
                "Open private closure options",
                "Open protocol review",
                "Return to ordinary app",
                "Block Elias",
                "Open synthetic report preview",
                "Hide Live Introductions",
            },
        }
        with tempfile.TemporaryDirectory() as temporary_directory:
            output = Path(temporary_directory) / "prototype"
            result = self._generate(output)
            self.assertEqual(0, result.returncode, result.stderr)

            for frame_id, required_labels in expected_labels.items():
                parser = PrototypeHTMLParser()
                parser.feed(
                    (output / frame_id.lower() / "index.html").read_text(
                        encoding="utf-8"
                    )
                )
                nodes = [
                    (tag, attrs)
                    for tag, attrs in parser.attributes
                    if attrs.get("data-control-scope") == "body"
                ]
                labels = {attrs["data-label"] for _, attrs in nodes}
                with self.subTest(frame=frame_id):
                    self.assertEqual(required_labels, labels)
                    self.assertTrue(
                        all(" " not in attrs["data-audiences"] for _, attrs in nodes)
                    )
                    self.assertFalse(
                        any(
                            attrs["data-action-scope"]
                            == ActionScope.LIVE_DERIVED_CONTINUATION.value
                            for _, attrs in nodes
                        )
                    )
                    prohibited_targets = {"V11", "F06", "V12", "V13", "F07", "F08"}
                    self.assertFalse(
                        any(
                            tag == "a"
                            and attrs["data-target-id"] in prohibited_targets
                            for tag, attrs in nodes
                        )
                    )

            for frame_id in ("C07", "C08", "S01"):
                frame = get_frame(frame_id)
                closure_edges = [
                    action
                    for action in frame.actions
                    if action.scope is ActionScope.CLOSURE_REFLECTION
                ]
                self.assertEqual(2, len(closure_edges))
                self.assertEqual(
                    {Role.VIEWER, Role.FEATURED_PARTICIPANT},
                    {next(iter(action.audiences)) for action in closure_edges},
                )

    def test_current_navigation_is_noninteractive_and_links_never_self_target(
        self,
    ) -> None:
        honest_copy = (
            "Every linked choice opens another static page; "
            "preview controls do not send or save anything."
        )
        with tempfile.TemporaryDirectory() as temporary_directory:
            output = Path(temporary_directory) / "prototype"
            result = self._generate(output)
            self.assertEqual(0, result.returncode, result.stderr)

            for html_file in output.rglob("index.html"):
                markup = html_file.read_text(encoding="utf-8")
                parser = PrototypeHTMLParser()
                parser.feed(markup)
                is_frame = html_file.parent != output
                if is_frame:
                    self.assertIn(honest_copy, parser.text)
                for tag, attrs in parser.attributes:
                    with self.subTest(page=html_file, tag=tag, attrs=attrs):
                        if attrs.get("aria-current") == "page":
                            self.assertNotEqual("a", tag)
                        if tag == "a" and attrs.get("data-target-id"):
                            source_id = next(
                                value
                                for candidate, value in parser.attributes
                                if candidate == "body"
                            )["data-frame-id"]
                            self.assertNotEqual(
                                source_id,
                                attrs["data-target-id"],
                            )
                        href = attrs.get("href")
                        if tag != "a" or not href:
                            continue
                        parsed_href = urlsplit(href)
                        if parsed_href.scheme or parsed_href.netloc or not parsed_href.path:
                            continue
                        destination = (html_file.parent / unquote(parsed_href.path)).resolve()
                        if destination.is_dir():
                            destination = destination / "index.html"
                        self.assertNotEqual(html_file.resolve(), destination)

    def test_all_generated_pages_have_unskipped_heading_order(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            output = Path(temporary_directory) / "prototype"
            result = self._generate(output)
            self.assertEqual(0, result.returncode, result.stderr)

            for html_file in output.rglob("index.html"):
                parser = PrototypeHTMLParser()
                parser.feed(html_file.read_text(encoding="utf-8"))
                with self.subTest(page=html_file):
                    self.assertTrue(parser.heading_levels)
                    self.assertEqual(1, parser.heading_levels[0])
                    self.assertEqual(1, parser.heading_levels.count(1))
                    self.assertTrue(
                        all(
                            current <= previous + 1
                            for previous, current in zip(
                                parser.heading_levels,
                                parser.heading_levels[1:],
                            )
                        ),
                        parser.heading_levels,
                    )

    def test_generated_composition_is_specific_to_room_private_and_discovery_states(
        self,
    ) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            output = Path(temporary_directory) / "prototype"
            result = self._generate(output)
            self.assertEqual(0, result.returncode, result.stderr)

            representative_surfaces = {
                "V05": ("viewer_invitation_detail", "profile-card"),
                "V08": ("viewer_live_room", "conversation-region"),
                "F04": ("featured_greenroom", "status-grid"),
                "C03": ("facilitator_console", "conversation-region"),
                "C07": ("facilitator_termination", "surface-panels"),
            }
            for frame_id, (surface_kind, marker) in representative_surfaces.items():
                markup = (output / frame_id.lower() / "index.html").read_text(
                    encoding="utf-8"
                )
                with self.subTest(frame=frame_id, surface=surface_kind):
                    self.assertIn(f'data-surface-kind="{surface_kind}"', markup)
                    self.assertIn(f'class="{marker}', markup)
                    self.assertNotIn('data-composition="', markup)

            forbidden_discovery_copy = (
                "Live Introductions",
                "Live provenance",
                "Mara",
                "segment-rail",
                "Fixed 12-minute",
                "six-viewer",
                "spark",
                "viewer",
                "room schedule",
                "room history",
                "room order",
                "room name",
            )
            for frame_id in ("F07", "F08"):
                markup = (output / frame_id.lower() / "index.html").read_text(
                    encoding="utf-8"
                )
                with self.subTest(frame=frame_id, context="ordinary-app"):
                    self.assertIn('data-surface-context="ordinary_app"', markup)
                    self.assertNotIn('class="segment-rail"', markup)
                    for forbidden in forbidden_discovery_copy:
                        self.assertNotIn(forbidden.casefold(), markup.casefold())

    def test_generated_pages_render_typed_product_surface_semantics(self) -> None:
        from scripts.live_introductions_catalog import all_frames

        with tempfile.TemporaryDirectory() as temporary_directory:
            output = Path(temporary_directory) / "prototype"
            result = self._generate(output)
            self.assertEqual(0, result.returncode, result.stderr)

            for frame in all_frames():
                presentation = frame.presentation
                self.assertIsNotNone(presentation)
                markup = (output / frame.id.lower() / "index.html").read_text(
                    encoding="utf-8"
                )
                parser = PrototypeHTMLParser()
                parser.feed(markup)
                product_surfaces = [
                    attrs
                    for tag, attrs in parser.attributes
                    if tag == "section"
                    and "product-surface" in attrs.get("class", "").split()
                ]
                with self.subTest(frame=frame.id):
                    self.assertEqual(1, len(product_surfaces))
                    self.assertEqual(
                        presentation.kind.value,
                        product_surfaces[0].get("data-surface-kind"),
                    )
                    self.assertEqual(
                        presentation.context.value,
                        product_surfaces[0].get("data-surface-context"),
                    )
                    self.assertEqual(
                        presentation.audience.value,
                        product_surfaces[0].get("data-audience"),
                    )
                    self.assertIn(presentation.heading, parser.text)
                    self.assertIn(presentation.summary, parser.text)
                    for status in presentation.statuses:
                        self.assertIn(status.label, parser.text)
                        self.assertIn(status.value, parser.text)
                    for panel in presentation.panels:
                        self.assertIn(panel.heading, parser.text)
                        for line in panel.body:
                            self.assertIn(line, parser.text)
                    semantic_group_count = len(presentation.choice_groups) + (
                        1 if presentation.evidence is not None else 0
                    )
                    self.assertEqual(semantic_group_count, parser.tags["fieldset"])
                    self.assertEqual(semantic_group_count, parser.tags["legend"])
                    self.assertEqual(0, parser.tags["form"])
                    self.assertNotIn('data-composition="', markup)
                    self.assertNotIn('class="conversation-card"', markup)
                    self.assertNotIn('class="boundary-card', markup)

                    if presentation.profile is not None:
                        self.assertIn('class="profile-card"', markup)
                    if presentation.conversation is not None:
                        self.assertIn('class="conversation-region"', markup)
                        self.assertIn('class="message-list"', markup)
                    for control in presentation.text_controls:
                        self.assertIn(control.label, parser.text)
                        self.assertRegex(
                            markup,
                            r'<(?:input|textarea)[^>]*\sreadonly(?:\s|>)',
                        )
                    if presentation.evidence is not None:
                        self.assertIn('class="evidence-checklist"', markup)
                        self.assertIn('type="checkbox"', markup)

            generator_source = GENERATOR.read_text(encoding="utf-8")
            for obsolete_name in (
                "ORDINARY_DISCOVERY_COPY",
                "INLINE_CLOSURE_BLOCKS",
                "ROOM_CLOSURE_FRAMES",
                "_composition_for",
                "_content_blocks_for",
            ):
                self.assertNotIn(obsolete_name, generator_source)

    def test_product_surface_is_prioritized_before_controls_and_contract(self) -> None:
        representative_frames = ("V03", "V08", "V11", "F07", "C02", "S02")
        with tempfile.TemporaryDirectory() as temporary_directory:
            output = Path(temporary_directory) / "prototype"
            result = self._generate(output)
            self.assertEqual(0, result.returncode, result.stderr)

            for frame_id in representative_frames:
                markup = (output / frame_id.lower() / "index.html").read_text(
                    encoding="utf-8"
                )
                parser = PrototypeHTMLParser()
                parser.feed(markup)
                surface = next(
                    attrs
                    for tag, attrs in parser.attributes
                    if tag == "section"
                    and "product-surface" in attrs.get("class", "").split()
                )
                with self.subTest(frame=frame_id):
                    self.assertEqual("priority", surface.get("data-first-viewport"))
                    self.assertLess(
                        markup.index('class="product-surface '),
                        markup.index('class="control-deck"'),
                    )
                    self.assertLess(
                        markup.index('class="product-surface '),
                        markup.index('<details class="wireframe-contract"'),
                    )

            css = (output / "app.css").read_text(encoding="utf-8")
            self.assertIn("@media (max-width: 767px)", css)
            self.assertIn("--mobile-priority-gap:", css)

    def test_representative_surface_kinds_use_native_accessibility_semantics(
        self,
    ) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            output = Path(temporary_directory) / "prototype"
            result = self._generate(output)
            self.assertEqual(0, result.returncode, result.stderr)

            for frame_id in ("V03", "V11", "V12", "F06", "C02"):
                markup = (output / frame_id.lower() / "index.html").read_text(
                    encoding="utf-8"
                )
                with self.subTest(frame=frame_id, semantic="choices"):
                    self.assertIn("<fieldset", markup)
                    self.assertIn("<legend>", markup)
                    self.assertIn("<label ", markup)
                    self.assertRegex(markup, r'type="(?:radio|checkbox)"')

            for frame_id in ("V05", "F07"):
                markup = (output / frame_id.lower() / "index.html").read_text(
                    encoding="utf-8"
                )
                with self.subTest(frame=frame_id, semantic="profile"):
                    self.assertIn(
                        '<article class="profile-card" aria-labelledby=',
                        markup,
                    )

            for frame_id in ("V08", "F05", "C03", "V17"):
                markup = (output / frame_id.lower() / "index.html").read_text(
                    encoding="utf-8"
                )
                with self.subTest(frame=frame_id, semantic="conversation"):
                    self.assertIn(
                        '<section class="conversation-region" aria-labelledby=',
                        markup,
                    )
                    self.assertIn('<ol class="message-list">', markup)

            for frame_id in ("V10", "V11", "F06", "S02"):
                markup = (output / frame_id.lower() / "index.html").read_text(
                    encoding="utf-8"
                )
                with self.subTest(frame=frame_id, semantic="readonly-text"):
                    self.assertRegex(
                        markup,
                        r'<label for="[^"]+">[^<]+</label>'
                        r'(?:<input[^>]+readonly>|<textarea[^>]+readonly>)',
                    )

            report_markup = (output / "s02" / "index.html").read_text(
                encoding="utf-8"
            )
            self.assertIn('<fieldset class="evidence-checklist"', report_markup)
            self.assertRegex(
                report_markup,
                r'type="checkbox"[^>]*checked[^>]*disabled',
            )
            preferences_markup = (output / "v03" / "index.html").read_text(
                encoding="utf-8"
            )
            self.assertGreaterEqual(preferences_markup.count(" checked disabled"), 3)
            self.assertIn('aria-current="true"', preferences_markup)

    def test_generated_frames_render_product_content_before_contract_metadata(
        self,
    ) -> None:
        from scripts.live_introductions_catalog import all_frames, get_frame

        prototype_limitation = (
            "No report, message, recording, location sharing, age check, "
            "study action, or safety operation actually occurs."
        )
        with tempfile.TemporaryDirectory() as temporary_directory:
            output = Path(temporary_directory) / "prototype"
            result = self._generate(output)
            self.assertEqual(0, result.returncode, result.stderr)

            for frame in all_frames():
                page_path = output / frame.id.lower() / "index.html"
                markup = page_path.read_text(encoding="utf-8")
                parser = PrototypeHTMLParser()
                parser.feed(markup)

                product_frame = next(
                    (
                        attrs
                        for tag, attrs in parser.attributes
                        if tag == "article"
                        and "product-frame" in attrs.get("class", "").split()
                    ),
                    {},
                )
                with self.subTest(frame=frame.id):
                    presentation = frame.presentation
                    self.assertIsNotNone(presentation)
                    self.assertEqual(frame.role.value, product_frame.get("data-role"))
                    self.assertEqual(frame.phase.value, product_frame.get("data-phase"))
                    self.assertNotIn("data-composition", product_frame)
                    self.assertIn(presentation.heading, parser.text)
                    self.assertIn(presentation.summary, parser.text)
                    for status in presentation.statuses:
                        self.assertIn(status.label, parser.text)
                        self.assertIn(status.value, parser.text)
                    for panel in presentation.panels:
                        self.assertIn(panel.heading, parser.text)
                        for line in panel.body:
                            self.assertIn(line, parser.text)
                    self.assertIsNotNone(presentation.contract)
                    self.assertIn(presentation.contract.privacy, parser.text)
                    self.assertIn(presentation.contract.accessibility, parser.text)
                    self.assertIn(presentation.contract.failure_exit, parser.text)
                    self.assertEqual(1, parser.tags["details"])
                    self.assertEqual(1, parser.tags["summary"])
                    for heading in (
                        "Privacy",
                        "Accessibility",
                        "Failure / exit behavior",
                        "Transition semantics",
                        "Prototype limitation",
                    ):
                        self.assertIn(heading, parser.text)
                    self.assertIn(prototype_limitation, parser.text)
                    self.assertLess(
                        markup.index('class="product-frame"'),
                        markup.index('<details class="wireframe-contract"'),
                    )

            aggregate = " ".join(
                path.read_text(encoding="utf-8")
                for path in output.rglob("index.html")
            )
            self.assertIn(EXACT_EXTERNAL_CAPTURE_COPY, aggregate)
            for frame_id in ("V06", "F02"):
                self.assertIn(
                    EXACT_EXTERNAL_CAPTURE_COPY,
                    (output / frame_id.lower() / "index.html").read_text(
                        encoding="utf-8"
                    ),
                )
            self.assertIn(
                "Verification does not guarantee identity truth, compatibility, conduct, or safety.",
                (output / "f01" / "index.html").read_text(encoding="utf-8"),
            )
            self.assertIn(
                "Library-program coordinator · repairs old radios · learning sourdough.",
                aggregate,
            )
            self.assertIn("Cedar", aggregate)
            self.assertIn(
                "No real recording, no real location sharing, no real report submission, no real messaging, meeting, or research collection occurs.",
                aggregate,
            )
            self.assertEqual(
                1,
                len(
                    re.findall(
                        r'<a class="product-action[^>]+'
                        r'data-target-id="V12"[^>]+'
                        r'data-guard="normal_completion_only"',
                        aggregate,
                    )
                ),
            )
            self.assertIn(
                "Only a C06 normal-completion variant may continue to V12",
                get_frame("V11").content_blocks[1].body[0],
            )

    def test_stylesheet_encodes_visual_accessibility_and_responsive_contract(
        self,
    ) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            output = Path(temporary_directory) / "prototype"
            result = self._generate(output)
            self.assertEqual(0, result.returncode, result.stderr)
            css = (output / "app.css").read_text(encoding="utf-8")
            compact_css = re.sub(r"\s+", " ", css.lower())

            for color in (
                "#f3efe7",
                "#fbf8f2",
                "#292723",
                "#68635c",
                "#7c5368",
                "#536a5b",
                "#94672a",
                "#9c463e",
            ):
                self.assertIn(color, compact_css)
            self.assertIn("ui-serif", compact_css)
            self.assertIn("system-ui", compact_css)
            self.assertIn(":focus-visible", compact_css)
            self.assertRegex(compact_css, r"min-height:\s*44px")
            self.assertRegex(compact_css, r"min-width:\s*44px")
            self.assertIn("@media (min-width: 390px)", compact_css)
            self.assertIn("@media (min-width: 768px)", compact_css)
            self.assertIn("@media (min-width: 1440px)", compact_css)
            self.assertIn("@media (prefers-reduced-motion: reduce)", compact_css)
            self.assertIn("@media print", compact_css)
            self.assertIn("overflow-wrap:", compact_css)
            self.assertIn("max-width: 100%", compact_css)
            self.assertIn("transition: opacity", compact_css)
            self.assertIn("transform", compact_css)
            self.assertNotIn("transition: all", compact_css)
            self.assertNotIn("url(", compact_css)

    def test_contrast_sensitive_text_uses_the_darker_charcoal_token(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            output = Path(temporary_directory) / "prototype"
            result = self._generate(output)
            self.assertEqual(0, result.returncode, result.stderr)
            css = (output / "app.css").read_text(encoding="utf-8").lower()

            def declarations(selector: str) -> str:
                matches = re.findall(
                    re.escape(selector) + r"\s*\{([^}]*)\}",
                    css,
                    flags=re.DOTALL,
                )
                self.assertTrue(matches, selector)
                return matches[-1]

            for selector in (
                ".topic-tab",
                ".segment",
                ".segment-number",
                ".frame-summary",
                ".atlas-intro > p:last-child",
                ".atlas-card p",
                ".wireframe-contract summary",
            ):
                with self.subTest(selector=selector):
                    self.assertRegex(
                        declarations(selector),
                        r"color:\s*var\(--charcoal\)",
                    )

            def relative_luminance(color: tuple[int, int, int]) -> float:
                channels = []
                for channel in color:
                    normalized = channel / 255
                    channels.append(
                        normalized / 12.92
                        if normalized <= 0.04045
                        else ((normalized + 0.055) / 1.055) ** 2.4
                    )
                return (
                    0.2126 * channels[0]
                    + 0.7152 * channels[1]
                    + 0.0722 * channels[2]
                )

            def contrast_ratio(
                foreground: tuple[int, int, int],
                background: tuple[int, int, int],
            ) -> float:
                lighter, darker = sorted(
                    (
                        relative_luminance(foreground),
                        relative_luminance(background),
                    ),
                    reverse=True,
                )
                return (lighter + 0.05) / (darker + 0.05)

            charcoal = (0x29, 0x27, 0x23)
            flax = (0xF3, 0xEF, 0xE7)
            oat = (0xFB, 0xF8, 0xF2)
            plum = (0x7C, 0x53, 0x68)
            spine = tuple(
                round(flax_channel * 0.75 + plum_channel * 0.25)
                for flax_channel, plum_channel in zip(flax, plum)
            )
            for background in (flax, oat, spine):
                self.assertGreaterEqual(
                    contrast_ratio(charcoal, background),
                    4.5,
                )

    def test_print_css_reveals_closed_wireframe_contract_content(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            output = Path(temporary_directory) / "prototype"
            result = self._generate(output)
            self.assertEqual(0, result.returncode, result.stderr)

            parser = PrototypeHTMLParser()
            parser.feed(
                (output / "v08" / "index.html").read_text(encoding="utf-8")
            )
            details = [
                attrs
                for tag, attrs in parser.attributes
                if tag == "details"
                and "wireframe-contract" in attrs.get("class", "").split()
            ]
            self.assertEqual(1, len(details))
            self.assertNotIn("open", details[0])
            print_contract = [
                attrs
                for tag, attrs in parser.attributes
                if tag == "section"
                and "print-contract" in attrs.get("class", "").split()
            ]
            self.assertEqual(1, len(print_contract))
            self.assertEqual("true", print_contract[0].get("aria-hidden"))

            css = re.sub(
                r"\s+",
                " ",
                (output / "app.css").read_text(encoding="utf-8").lower(),
            )
            self.assertRegex(
                css,
                r"details\.wireframe-contract:not\(\[open\]\)\s*>\s*:not\(summary\)"
                r"\s*\{[^}]*display:\s*block\s*!important",
            )
            self.assertRegex(
                css,
                r"details\.wireframe-contract:not\(\[open\]\)\s*>\s*\.contract-grid"
                r"\s*\{[^}]*display:\s*grid\s*!important",
            )
            self.assertRegex(
                css,
                r"\.print-contract\s*\{[^}]*display:\s*none",
            )
            self.assertRegex(
                css,
                r"\.print-contract\s*\{[^}]*display:\s*block\s*!important",
            )
            self.assertRegex(
                css,
                r"\.print-contract\s*>\s*\.contract-grid\s*\{"
                r"[^}]*display:\s*grid\s*!important",
            )


class LiveIntroductionsCatalogTests(unittest.TestCase):
    def test_catalog_has_exact_frame_inventory(self) -> None:
        from scripts.live_introductions_catalog import all_frames

        frames = all_frames()

        self.assertEqual(EXPECTED_FRAME_IDS, {frame.id for frame in frames})
        self.assertEqual(39, len(frames))
        self.assertEqual(len(frames), len({frame.id for frame in frames}))

    def test_every_frame_has_a_distinct_typed_product_presentation(self) -> None:
        from scripts.live_introductions_catalog import (
            ChoiceGroupData,
            ConversationData,
            EvidenceData,
            PanelData,
            ProfileData,
            StatusData,
            SurfaceContext,
            SurfaceKind,
            SurfacePresentation,
            TextControlData,
            all_frames,
        )

        expected_surface_values = {
            "viewer_consent",
            "viewer_adult_status",
            "viewer_preferences",
            "viewer_invitations",
            "viewer_invitation_detail",
            "viewer_briefing",
            "viewer_lobby",
            "viewer_live_room",
            "viewer_safety_clarification",
            "viewer_topic_choice",
            "viewer_question",
            "viewer_debrief",
            "viewer_spark",
            "viewer_spark_sealed",
            "viewer_reciprocal_outcome",
            "viewer_no_outcome",
            "viewer_connection_permission",
            "viewer_conversation",
            "viewer_meeting_readiness",
            "viewer_meeting_plan",
            "featured_verification",
            "featured_training",
            "featured_rehearsal",
            "featured_greenroom",
            "featured_live_room",
            "featured_reflection",
            "featured_candidate_profile",
            "featured_connection",
            "facilitator_assignment",
            "facilitator_readiness",
            "facilitator_console",
            "facilitator_incident",
            "facilitator_pause",
            "facilitator_completion",
            "facilitator_termination",
            "facilitator_neutral_closure",
            "integrity_closure",
            "safety_report",
            "safety_report_viewer",
            "safety_report_featured",
            "safety_report_facilitator",
            "hide_live",
        }
        self.assertEqual(expected_surface_values, {kind.value for kind in SurfaceKind})

        frames = all_frames()
        self.assertEqual(
            len(frames),
            len({frame.presentation.kind for frame in frames}),
        )
        for frame in frames:
            with self.subTest(frame=frame.id):
                presentation = frame.presentation
                self.assertIsInstance(presentation, SurfacePresentation)
                self.assertIsInstance(presentation.kind, SurfaceKind)
                self.assertIsInstance(presentation.context, SurfaceContext)
                self.assertTrue(presentation.eyebrow)
                self.assertTrue(presentation.heading)
                self.assertTrue(presentation.panels)
                self.assertTrue(
                    all(isinstance(panel, PanelData) for panel in presentation.panels)
                )
                self.assertTrue(
                    all(
                        isinstance(status, StatusData)
                        for status in presentation.statuses
                    )
                )
                self.assertTrue(
                    all(
                        isinstance(group, ChoiceGroupData)
                        for group in presentation.choice_groups
                    )
                )
                self.assertTrue(
                    all(
                        isinstance(control, TextControlData)
                        for control in presentation.text_controls
                    )
                )
                self.assertTrue(
                    presentation.profile is None
                    or isinstance(presentation.profile, ProfileData)
                )
                self.assertTrue(
                    presentation.conversation is None
                    or isinstance(presentation.conversation, ConversationData)
                )
                self.assertTrue(
                    presentation.evidence is None
                    or isinstance(presentation.evidence, EvidenceData)
                )

    def test_catalog_pins_canonical_order_and_critical_ux_copy(self) -> None:
        from scripts.live_introductions_catalog import (
            Role,
            TransitionGuard,
            TransitionKind,
            all_frames,
            frame_actions_for,
            get_frame,
            shell_actions_for,
            transitions_for,
        )

        self.assertEqual(
            EXPECTED_FRAME_ORDER,
            tuple(frame.id for frame in all_frames()),
        )

        def block_lines(frame_id: str) -> tuple[str, ...]:
            return tuple(
                line
                for block in get_frame(frame_id).content_blocks
                for line in block.body
            )

        for frame_id in {"V06", "F02"}:
            with self.subTest(frame=frame_id, copy="external-capture"):
                self.assertIn(
                    EXACT_EXTERNAL_CAPTURE_COPY,
                    block_lines(frame_id),
                )

        self.assertEqual(
            "I understand — check adult eligibility",
            frame_actions_for("V01", Role.VIEWER)[0].label,
        )
        self.assertEqual(
            "Arm scheduled opening",
            frame_actions_for("C02", Role.FACILITATOR)[0].label,
        )
        self.assertTrue(
            {
                "Ask Mara to pause",
                "End my participation",
            }.issubset(
                {
                    action.label
                    for action in frame_actions_for(
                        "F05",
                        Role.FEATURED_PARTICIPANT,
                    )
                }
            )
        )
        self.assertEqual(
            (("C03", TransitionGuard.VALID_ARMED_START),),
            tuple(
                (transition.target_id, transition.guard)
                for transition in transitions_for(
                    "C02",
                    kind=TransitionKind.SYSTEM,
                )
            ),
        )
        self.assertEqual(
            (
                ("V19", TransitionGuard.MUTUAL_READINESS_REVALIDATED),
                ("V18", TransitionGuard.MUTUAL_READINESS_NOT_CONFIRMED),
            ),
            tuple(
                (transition.target_id, transition.guard)
                for transition in transitions_for(
                    "V18",
                    kind=TransitionKind.SYSTEM,
                )
            ),
        )

        self.assertEqual(
            "Choosing not to continue is a complete outcome.",
            get_frame("V01").cue_text,
        )
        self.assertEqual(
            "Camera off · Microphone off · Other viewers cannot see you",
            get_frame("V07").cue_text,
        )
        self.assertIn(
            "Verification does not guarantee identity truth, compatibility, conduct, or safety.",
            block_lines("F01"),
        )
        self.assertEqual(
            "A spark is an interest signal, not a match or permission to contact you.",
            get_frame("V12").cue_text,
        )
        self.assertEqual(
            "Nothing opens automatically.",
            get_frame("V14").cue_text,
        )
        self.assertEqual(
            "Reciprocal interest is not consent to meet.",
            get_frame("V18").cue_text,
        )
        self.assertEqual(
            "No meeting is scheduled, and this readiness state shared no structured location.",
            get_frame("V19").cue_text,
        )
        self.assertIn("200% zoom", get_frame("V06").accessibility_note)
        self.assertIn("44-by-44 targets", get_frame("V08").accessibility_note)
        self.assertIn(
            "keyboard and screen-reader order",
            get_frame("F02").accessibility_note,
        )
        self.assertIn(
            "Leave quietly",
            {
                action.label
                for action in frame_actions_for("V08", Role.VIEWER)
            },
        )
        self.assertIn(
            "Safety",
            {
                action.label
                for action in shell_actions_for("V08", Role.VIEWER)
            },
        )

    def test_catalog_has_role_appropriate_frame_counts(self) -> None:
        from scripts.live_introductions_catalog import Role, all_frames, get_frame

        frames = all_frames()

        self.assertEqual(
            {
                Role.VIEWER: 20,
                Role.FEATURED_PARTICIPANT: 8,
                Role.FACILITATOR: 8,
                Role.CROSS_ROLE: 3,
            },
            Counter(frame.role for frame in frames),
        )
        for frame in frames:
            self.assertIs(frame, get_frame(frame.id))

    def test_every_frame_exposes_complete_immutable_rendering_data(self) -> None:
        from scripts.live_introductions_catalog import (
            ContinuationClass,
            Phase,
            TerminalClass,
            all_frames,
        )

        frames = all_frames()

        for frame in frames:
            with self.subTest(frame=frame.id):
                self.assertIsInstance(frame.phase, Phase)
                self.assertTrue(frame.title.strip())
                self.assertTrue(frame.headline.strip())
                self.assertTrue(frame.summary.strip())
                self.assertTrue(frame.status_text.strip())
                self.assertTrue(frame.cue_text.strip())
                self.assertGreaterEqual(len(frame.content_blocks), 2)
                for block in frame.content_blocks:
                    self.assertTrue(block.heading.strip())
                    self.assertTrue(block.body)
                    self.assertTrue(all(line.strip() for line in block.body))
                self.assertTrue(frame.primary_actions)
                self.assertTrue(frame.secondary_actions)
                self.assertTrue(frame.privacy_statement.strip())
                self.assertTrue(frame.accessibility_note.strip())
                self.assertTrue(frame.failure_exit_copy.strip())
                self.assertIsInstance(frame.terminal_class, TerminalClass)
                self.assertIsInstance(frame.continuation, ContinuationClass)

        with self.assertRaises(FrozenInstanceError):
            frames[0].title = "mutated"

    def test_every_declared_transition_has_a_valid_target(self) -> None:
        from scripts.live_introductions_catalog import (
            ATLAS_TARGET,
            Role,
            TransitionGuard,
            TransitionKind,
            routable_frames,
            transitions_for,
        )

        frames = routable_frames()
        valid_targets = {frame.id for frame in frames} | {ATLAS_TARGET}

        for frame in frames:
            with self.subTest(frame=frame.id):
                self.assertEqual(
                    frame.primary_actions + frame.secondary_actions,
                    frame.actions,
                )
                for action in transitions_for(frame.id):
                    self.assertTrue(action.label.strip())
                    self.assertIn(action.target_id, valid_targets)
                    self.assertIsInstance(action.guard, TransitionGuard)
                    self.assertIsInstance(action.kind, TransitionKind)
                    if action.kind in {
                        TransitionKind.SYSTEM,
                        TransitionKind.REVIEW,
                    }:
                        self.assertIsNone(action.audience)
                    else:
                        self.assertIsInstance(action.audience, Role)

    def test_catalog_preserves_core_terms_and_blocks_real_capabilities(self) -> None:
        from scripts.live_introductions_catalog import Role, all_frames, get_frame

        frames = all_frames()
        catalog_text = " ".join(
            text
            for frame in frames
            for text in (
                frame.title,
                frame.headline,
                frame.summary,
                frame.status_text,
                frame.cue_text,
                *(line for block in frame.content_blocks for line in block.body),
                frame.privacy_statement,
                frame.accessibility_note,
                frame.failure_exit_copy,
            )
        ).lower()

        for frame in frames:
            with self.subTest(frame=frame.id):
                self.assertIn("synthetic", frame.status_text.lower())
                self.assertIn("fictional", frame.status_text.lower())

        self.assertIn("independent facilitator", catalog_text)
        self.assertIn("six-viewer maximum", catalog_text)
        self.assertIn("fixed 12 minutes", catalog_text)
        self.assertIn("no real recording", catalog_text)
        self.assertIn("no real location", catalog_text)
        self.assertIn("no real report", catalog_text)
        self.assertIn("no real messaging", catalog_text)
        self.assertIn("private mutual outcome", get_frame("V14").summary.lower())
        self.assertIn("private mutual outcome", get_frame("F08").summary.lower())

        spark_actions = [
            action
            for frame in frames
            for action in frame.actions
            if "spark" in action.label.lower()
        ]
        self.assertTrue(spark_actions)
        self.assertTrue(
            all(action.audience is Role.VIEWER for action in spark_actions)
        )

    def test_terminal_provenance_controls_live_continuation(self) -> None:
        from scripts.live_introductions_catalog import (
            ContinuationClass,
            TerminalClass,
            TransitionGuard,
            all_frames,
            get_frame,
        )

        frames = all_frames()
        v12_sources = {
            frame.id
            for frame in frames
            if frame.id != "V12"
            if any(action.target_id == "V12" for action in frame.actions)
        }
        self.assertEqual({"V11"}, v12_sources)

        v11_to_v12 = [
            action
            for action in get_frame("V11").actions
            if action.target_id == "V12"
        ]
        self.assertEqual(1, len(v11_to_v12))
        self.assertIs(
            TransitionGuard.NORMAL_COMPLETION_ONLY,
            v11_to_v12[0].guard,
        )

        expected_terminals = {
            "C06": (
                TerminalClass.NORMAL_COMPLETION,
                ContinuationClass.NORMAL_COMPLETION_ONLY,
            ),
            "C07": (
                TerminalClass.SAFETY_TERMINATION,
                ContinuationClass.NO_LIVE_CONTINUATION,
            ),
            "C08": (
                TerminalClass.NEUTRAL_CLOSURE,
                ContinuationClass.NO_LIVE_CONTINUATION,
            ),
            "S01": (
                TerminalClass.INTEGRITY_CLOSURE,
                ContinuationClass.NO_LIVE_CONTINUATION,
            ),
        }
        blocked_targets = {"V12", "V13", "V14", "F07", "F08"}

        for frame_id, expected in expected_terminals.items():
            frame = get_frame(frame_id)
            with self.subTest(frame=frame_id):
                self.assertEqual(expected, (frame.terminal_class, frame.continuation))
                if frame_id != "C06":
                    self.assertTrue(
                        blocked_targets.isdisjoint(
                            action.target_id for action in frame.actions
                        )
                    )

        f06_to_f07 = next(
            action
            for action in get_frame("F06").actions
            if action.target_id == "F07"
        )
        self.assertIs(
            TransitionGuard.NORMAL_COMPLETION_ONLY,
            f06_to_f07.guard,
        )

    def test_actions_remain_role_appropriate(self) -> None:
        from scripts.live_introductions_catalog import (
            Role,
            TransitionKind,
            all_frames,
            product_controls_for,
        )

        frames = all_frames()
        for frame in frames:
            for action in frame.actions:
                with self.subTest(frame=frame.id, action=action.label):
                    if action.kind is TransitionKind.USER:
                        self.assertIn(
                            action.audience,
                            {
                                Role.VIEWER,
                                Role.FEATURED_PARTICIPANT,
                                Role.CROSS_ROLE,
                            },
                        )
                    elif action.kind is TransitionKind.FACILITATOR:
                        self.assertIs(action.audience, Role.FACILITATOR)
                    else:
                        self.assertIsNone(action.audience)

            for audience in Role:
                with self.subTest(frame=frame.id, audience=audience):
                    controls = product_controls_for(frame.id, audience)
                    expected_kinds = {TransitionKind.USER}
                    if audience is Role.FACILITATOR:
                        expected_kinds.add(TransitionKind.FACILITATOR)
                    self.assertTrue(
                        all(
                            action.kind in expected_kinds
                            and action.applies_to(audience)
                            for action in controls
                        )
                    )

    def test_shared_controls_use_safe_explicit_audience_sets(self) -> None:
        from scripts.live_introductions_catalog import (
            Role,
            product_controls_for,
            safety_report_frames,
        )

        actual_roles = {
            Role.VIEWER,
            Role.FEATURED_PARTICIPANT,
            Role.FACILITATOR,
        }
        for role in actual_roles:
            self.assertEqual((), product_controls_for("S02", role))

        for variant in safety_report_frames():
            with self.subTest(variant=variant.id):
                self.assertIn(variant.role, actual_roles)
                controls = product_controls_for(variant.id, variant.role)
                self.assertEqual(variant.actions, controls)
                self.assertTrue(
                    all(
                        action.audiences == frozenset({variant.role})
                        for action in controls
                    )
                )
                for other_role in actual_roles - {variant.role}:
                    self.assertEqual(
                        (),
                        product_controls_for(variant.id, other_role),
                    )

        expected_hide_shared = {
            "Hide Live Introductions",
            "Return to ordinary app",
            "Keep Live Introductions hidden",
            "Open synthetic report preview",
        }
        for role in actual_roles:
            with self.subTest(frame="S03", role=role):
                labels = {
                    action.label
                    for action in product_controls_for("S03", role)
                }
                self.assertTrue(expected_hide_shared.issubset(labels))

        viewer_labels = {
            action.label
            for action in product_controls_for("S03", Role.VIEWER)
        }
        featured_labels = {
            action.label
            for action in product_controls_for(
                "S03",
                Role.FEATURED_PARTICIPANT,
            )
        }
        facilitator_labels = {
            action.label
            for action in product_controls_for("S03", Role.FACILITATOR)
        }
        self.assertTrue(
            {
                "Block Elias",
                "Manage ordinary connection",
                "Review deliberate re-entry",
            }.issubset(viewer_labels)
        )
        self.assertIn("Manage ordinary connection", featured_labels)
        self.assertNotIn("Block Elias", featured_labels)
        self.assertNotIn("Review deliberate re-entry", featured_labels)
        self.assertNotIn("Manage ordinary connection", facilitator_labels)
        self.assertNotIn("Block Elias", facilitator_labels)
        self.assertNotIn("Review deliberate re-entry", facilitator_labels)
        self.assertEqual(
            (),
            product_controls_for("S02", Role.CROSS_ROLE),
        )

    def test_automatic_transitions_are_not_rendered_controls(self) -> None:
        from scripts.live_introductions_catalog import (
            Role,
            TransitionKind,
            product_controls_for,
            transitions_for,
        )

        automatic_edges = {
            ("V07", "V08"),
            ("F04", "F05"),
            ("F05", "C06"),
            ("F05", "C08"),
            ("F07", "F08"),
            ("V13", "V14"),
            ("V13", "V15"),
            ("V16", "V17"),
            ("C02", "C03"),
            ("C03", "C06"),
            ("C03", "C08"),
            ("C03", "S01"),
            ("C05", "C08"),
            ("C05", "S01"),
        }
        for source_id, target_id in automatic_edges:
            with self.subTest(source=source_id, target=target_id):
                self.assertTrue(
                    any(
                        transition.target_id == target_id
                        for transition in transitions_for(
                            source_id,
                            kind=TransitionKind.SYSTEM,
                        )
                    )
                )

        control_audiences = {
            "V07": Role.VIEWER,
            "V13": Role.VIEWER,
            "V16": Role.VIEWER,
            "F04": Role.FEATURED_PARTICIPANT,
            "F05": Role.FEATURED_PARTICIPANT,
            "F07": Role.FEATURED_PARTICIPANT,
            "C02": Role.FACILITATOR,
            "C03": Role.FACILITATOR,
            "C05": Role.FACILITATOR,
        }
        for source_id, audience in control_audiences.items():
            automatic_targets = {
                target
                for source, target in automatic_edges
                if source == source_id
            }
            with self.subTest(source=source_id, check="not-rendered"):
                self.assertTrue(
                    automatic_targets.isdisjoint(
                        action.target_id
                        for action in product_controls_for(source_id, audience)
                    )
                )

        self.assertEqual(
            {"Enter at scheduled start"},
            {
                action.label
                for action in product_controls_for("V07", Role.VIEWER)
                if "scheduled start" in action.label
            },
        )
        self.assertEqual(
            {"Tell Mara I’m ready for this time"},
            {
                action.label
                for action in product_controls_for(
                    "F04",
                    Role.FEATURED_PARTICIPANT,
                )
                if "ready" in action.label
            },
        )
        self.assertEqual(
            {"Arm scheduled opening", "Disarm scheduled opening"},
            {
                action.label
                for action in product_controls_for("C02", Role.FACILITATOR)
                if "opening" in action.label or "scheduled start" in action.label
            },
        )
        self.assertTrue(
            {
                "Ask Mara to pause",
                "End my participation",
            }.issubset(
                {
                    action.label
                    for action in product_controls_for(
                        "F05",
                        Role.FEATURED_PARTICIPANT,
                    )
                }
            )
        )
        self.assertTrue(
            {"C05", "C06", "C07", "C08", "S01"}.isdisjoint(
                action.target_id
                for action in product_controls_for(
                    "F05",
                    Role.FEATURED_PARTICIPANT,
                )
            )
        )
        for source_id, automatic_targets, audience in (
            ("V13", {"V14", "V15"}, Role.VIEWER),
            ("V16", {"V17"}, Role.VIEWER),
            ("F07", {"F08"}, Role.FEATURED_PARTICIPANT),
        ):
            with self.subTest(source=source_id, check="automatic-outcome"):
                self.assertTrue(
                    automatic_targets.isdisjoint(
                        action.target_id
                        for action in product_controls_for(source_id, audience)
                    )
                )

    def test_meeting_readiness_uses_success_specific_revalidation(self) -> None:
        from scripts.live_introductions_catalog import (
            Role,
            TransitionGuard,
            TransitionKind,
            get_frame,
            product_controls_for,
            transitions_for,
        )

        v18_system = transitions_for("V18", kind=TransitionKind.SYSTEM)
        success = [
            transition
            for transition in v18_system
            if transition.target_id == "V19"
        ]
        failure = [
            transition
            for transition in v18_system
            if transition.target_id == "V18"
        ]

        self.assertEqual(1, len(success))
        self.assertIs(
            TransitionGuard.MUTUAL_READINESS_REVALIDATED,
            success[0].guard,
        )
        self.assertEqual(1, len(failure))
        self.assertIs(
            TransitionGuard.MUTUAL_READINESS_NOT_CONFIRMED,
            failure[0].guard,
        )
        self.assertFalse(
            any(
                action.target_id == "V19"
                for action in product_controls_for("V18", Role.VIEWER)
            )
        )

        v19_to_v17 = [
            transition
            for transition in transitions_for("V19")
            if transition.target_id == "V17"
        ]
        self.assertEqual(1, len(v19_to_v17))
        self.assertEqual("Return to messages", v19_to_v17[0].label)
        self.assertIs(TransitionKind.USER, v19_to_v17[0].kind)
        self.assertIs(
            TransitionGuard.RETURN_NAVIGATION,
            v19_to_v17[0].guard,
        )

        discuss = next(
            action
            for action in product_controls_for("V19", Role.VIEWER)
            if action.label == "Discuss it in the private connection"
        )
        self.assertEqual("V19", discuss.target_id)
        self.assertIn(
            "Meeting readiness is no longer mutual",
            get_frame("V18").failure_exit_copy,
        )
        self.assertIn(
            "fresh unselected",
            get_frame("V18").failure_exit_copy,
        )

    def test_fixed_end_terminal_precedence_is_machine_readable(self) -> None:
        from scripts.live_introductions_catalog import (
            Role,
            TerminalResolutionCondition,
            TransitionGuard,
            TransitionKind,
            fixed_end_terminal_precedence,
            frame_actions_for,
            transitions_for,
        )

        expected = (
            (
                1,
                TerminalResolutionCondition.FACILITATOR_SAFETY_COMMITTED,
                TransitionGuard.MARA_CONFIRMED_SAFETY,
                "C07",
            ),
            (
                2,
                TerminalResolutionCondition.UNRESOLVED_SAFETY_OR_INTEGRITY,
                TransitionGuard.FAIL_CLOSED,
                "S01",
            ),
            (
                3,
                TerminalResolutionCondition.KNOWN_NEUTRAL,
                TransitionGuard.KNOWN_NEUTRAL_TRIGGER,
                "C08",
            ),
            (
                4,
                TerminalResolutionCondition.HEALTHY_NORMAL,
                TransitionGuard.HEALTHY_FIXED_END,
                "C06",
            ),
        )
        rules = fixed_end_terminal_precedence()
        self.assertIsInstance(rules, tuple)
        self.assertEqual(
            expected,
            tuple(
                (rule.priority, rule.condition, rule.guard, rule.target_id)
                for rule in rules
            ),
        )

        expected_transitions = tuple(
            (rule.guard, rule.target_id) for rule in rules
        )
        for frame_id in {"C03", "C05"}:
            with self.subTest(frame=frame_id):
                system_transitions = transitions_for(
                    frame_id,
                    kind=TransitionKind.SYSTEM,
                )
                self.assertEqual(
                    expected_transitions,
                    tuple(
                        (transition.guard, transition.target_id)
                        for transition in system_transitions
                    ),
                )
                end_room = next(
                    action
                    for action in frame_actions_for(
                        frame_id,
                        Role.FACILITATOR,
                    )
                    if action.label == "End room"
                )
                self.assertEqual(frame_id, end_room.target_id)

    def test_shell_and_frame_actions_are_ordered_and_disjoint(self) -> None:
        from scripts.live_introductions_catalog import (
            ATLAS_TARGET,
            Role,
            SafetyReportDestination,
            ShellActionKind,
            TransitionGuard,
            all_frames,
            frame_actions_for,
            product_controls_for,
            shell_actions_for,
        )

        expected_base = (
            ShellActionKind.STATUS,
            ShellActionKind.NAVIGATION,
            ShellActionKind.SAFETY,
        )
        representative_frames = (
            ("V08", Role.VIEWER, expected_base + (ShellActionKind.WITHDRAWAL,)),
            ("F05", Role.FEATURED_PARTICIPANT, expected_base),
            ("C03", Role.FACILITATOR, expected_base),
            (
                SafetyReportDestination.VIEWER.value,
                Role.VIEWER,
                expected_base + (ShellActionKind.WITHDRAWAL,),
            ),
            (
                "F07",
                Role.FEATURED_PARTICIPANT,
                (ShellActionKind.STATUS, ShellActionKind.NAVIGATION),
            ),
        )
        for frame_id, audience, expected_order in representative_frames:
            with self.subTest(frame=frame_id, audience=audience):
                shell_actions = shell_actions_for(frame_id, audience)
                frame_actions = frame_actions_for(frame_id, audience)
                self.assertEqual(
                    expected_order,
                    tuple(action.kind for action in shell_actions),
                )
                self.assertEqual(
                    frame_actions,
                    product_controls_for(frame_id, audience),
                )
                shell_labels = {action.label for action in shell_actions}
                frame_labels = {action.label for action in frame_actions}
                self.assertTrue(shell_labels.isdisjoint(frame_labels))
                composed_labels = [
                    *(action.label for action in shell_actions),
                    *(action.label for action in frame_actions),
                ]
                self.assertEqual(len(composed_labels), len(set(composed_labels)))

        self.assertEqual(
            (),
            shell_actions_for("S02", Role.FEATURED_PARTICIPANT),
        )

        viewer_shell = shell_actions_for("V08", Role.VIEWER)
        self.assertEqual(
            (
                "Synthetic study · fictional people only",
                "Back to frame atlas",
                "Safety",
                "Withdraw preview consent",
            ),
            tuple(action.label for action in viewer_shell),
        )
        withdrawal = viewer_shell[-1]
        self.assertEqual(ATLAS_TARGET, withdrawal.target_id)
        self.assertEqual(frozenset({Role.VIEWER}), withdrawal.audiences)
        self.assertIs(TransitionGuard.PREVIEW_ENTERED, withdrawal.guard)
        self.assertFalse(
            any(
                action.label
                in {
                    "Synthetic study · fictional people only",
                    "Back to frame atlas",
                    "Safety",
                    "Withdraw preview consent",
                }
                for frame in all_frames()
                for action in frame.actions
            )
        )
        neutral_safety = shell_actions_for("S02", Role.CROSS_ROLE)
        self.assertEqual(("Safety",), tuple(action.label for action in neutral_safety))
        self.assertEqual("S02", neutral_safety[0].target_id)
        self.assertEqual(
            frozenset({Role.CROSS_ROLE}),
            neutral_safety[0].audiences,
        )
        with self.assertRaises(FrozenInstanceError):
            shell_actions_for("V02", Role.VIEWER)[0].label = "mutated"

    def test_public_role_and_review_helpers_keep_atlas_links_separate(
        self,
    ) -> None:
        from scripts.live_introductions_catalog import (
            ATLAS_TARGET,
            Role,
            TransitionKind,
            all_frames,
            frames_for_role,
            product_controls_for,
            review_transitions_for,
            transitions_for,
        )

        expected_ids_by_role = {
            Role.VIEWER: {
                *(f"V{number:02d}" for number in range(1, 20)),
                "V08A",
            },
            Role.FEATURED_PARTICIPANT: {
                *(f"F{number:02d}" for number in range(1, 9)),
            },
            Role.FACILITATOR: {
                *(f"C{number:02d}" for number in range(1, 9)),
            },
            Role.CROSS_ROLE: {
                *(f"S{number:02d}" for number in range(1, 4)),
            },
        }
        for role, expected_ids in expected_ids_by_role.items():
            frames = frames_for_role(role)
            with self.subTest(role=role):
                self.assertIsInstance(frames, tuple)
                self.assertEqual(expected_ids, {frame.id for frame in frames})
                self.assertTrue(all(frame.role is role for frame in frames))

        for frame in all_frames():
            with self.subTest(frame=frame.id):
                review = review_transitions_for(frame.id)
                self.assertIsInstance(review, tuple)
                self.assertEqual(1, len(review))
                self.assertEqual(ATLAS_TARGET, review[0].target_id)
                self.assertIsNone(review[0].audience)
                self.assertIs(TransitionKind.REVIEW, review[0].kind)
                self.assertIn(
                    review[0],
                    transitions_for(
                        frame.id,
                        kind=TransitionKind.REVIEW,
                    ),
                )
                for audience in Role:
                    self.assertNotIn(
                        review[0],
                        product_controls_for(frame.id, audience),
                    )

        with self.assertRaises(FrozenInstanceError):
            review_transitions_for("C06")[0].label = "mutated"

    def test_consequential_transitions_declare_their_preconditions(self) -> None:
        from scripts.live_introductions_catalog import (
            TransitionGuard,
            transitions_for,
        )

        expected_guards = {
            ("V01", "I understand — check adult eligibility"): (
                TransitionGuard.CONSENT_ACKNOWLEDGED
            ),
            ("V02", "Continue as an eligible adult"): (
                TransitionGuard.ADULT_ELIGIBLE
            ),
            ("V06", "Confirm for this circle and join the private lobby"): (
                TransitionGuard.CIRCLE_CONFIRMED
            ),
            ("V07", "Admit valid armed viewer at scheduled start"): (
                TransitionGuard.VALID_ARMED_START
            ),
            ("F01", "Continue to policy and training"): (
                TransitionGuard.ADULT_ELIGIBLE
            ),
            ("F02", "Complete training review"): (
                TransitionGuard.TRAINING_COMPLETE
            ),
            ("F04", "Admit ready featured participant at scheduled start"): (
                TransitionGuard.VALID_ARMED_START
            ),
            ("C02", "Open at scheduled start"): (
                TransitionGuard.VALID_ARMED_START
            ),
        }

        for (frame_id, label), expected_guard in expected_guards.items():
            action = next(
                action
                for action in transitions_for(frame_id)
                if action.label == label
            )
            with self.subTest(frame=frame_id, action=label):
                self.assertIs(expected_guard, action.guard)


if __name__ == "__main__":
    unittest.main()
