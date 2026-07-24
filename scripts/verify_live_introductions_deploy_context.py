#!/usr/bin/env python3
"""Fail closed for prohibited Live Introductions deploy contexts."""

from __future__ import annotations

import argparse
from dataclasses import dataclass
from datetime import datetime, timezone
from enum import Enum
import os
from pathlib import Path
import re
import sys
from urllib.parse import urlsplit
from uuid import UUID


HOSTED_CONTEXTS = frozenset({"deploy-preview", "branch-deploy"})
PRODUCTION_CONTEXT = "production"
REPOSITORY_ROOT = Path(__file__).resolve().parents[1]
AWS_STAGING_IDENTITY = (
    REPOSITORY_ROOT
    / "infra"
    / "terraform"
    / "environments"
    / "staging"
    / "ACCOUNT_IDENTITY.md"
)
NETLIFY_STAGING_IDENTITY = (
    REPOSITORY_ROOT
    / "infra"
    / "netlify"
    / "environments"
    / "staging"
    / "ACCOUNT_IDENTITY.md"
)


class IdentityStatus(Enum):
    """Allowed human-owned identity lifecycle states."""

    UNVERIFIED = "UNVERIFIED"
    VERIFIED = "VERIFIED"


@dataclass(frozen=True, slots=True)
class IdentityRecord:
    """Parsed identity record with normalized scalar fields."""

    path: Path
    status: IdentityStatus
    values: dict[str, object]


class IdentityRecordError(ValueError):
    """An identity record exists but is malformed or semantically invalid."""


@dataclass(frozen=True, slots=True)
class DeploymentBlocker:
    """One parsed canonical preflight failure."""

    code: str
    message: str


@dataclass(frozen=True, slots=True)
class DeploymentPreflightEvaluation:
    """Status-aware result for both canonical identity records."""

    blockers: tuple[DeploymentBlocker, ...]

    @property
    def allowed(self) -> bool:
        return not self.blockers


_DISPLAY_STATUS = re.compile(r"^\*\*Status: ([A-Z]+)\*\*$", re.MULTILINE)
_YAML_FENCE = re.compile(r"```yaml[ \t]*\n(.*?)\n```", re.DOTALL)
_FIELD = re.compile(r"^([a-z][a-z0-9_]*):(?:[ \t]*(.*))?$")


def _parse_scalar(value: str) -> object:
    normalized = value.strip()
    if normalized == "null":
        return None
    if normalized == "true":
        return True
    if normalized == "false":
        return False
    if (
        len(normalized) >= 2
        and normalized[0] == normalized[-1]
        and normalized[0] in {'"', "'"}
    ):
        return normalized[1:-1]
    return normalized


def _parse_identity(path: Path, required_fields: set[str]) -> IdentityRecord:
    try:
        content = path.read_text(encoding="utf-8")
    except FileNotFoundError:
        raise
    except OSError as error:
        raise IdentityRecordError(f"could not read record: {error}") from error

    displayed_statuses = _DISPLAY_STATUS.findall(content)
    fenced_records = _YAML_FENCE.findall(content)
    if len(displayed_statuses) != 1:
        raise IdentityRecordError("expected exactly one displayed status")
    if len(fenced_records) != 1:
        raise IdentityRecordError("expected exactly one fenced yaml record")

    values: dict[str, object] = {}
    for line in fenced_records[0].splitlines():
        if not line.strip() or line.startswith((" ", "\t", "#")):
            continue
        match = _FIELD.fullmatch(line)
        if match is None:
            raise IdentityRecordError(f"malformed record line: {line!r}")
        name, raw_value = match.groups()
        if name in values:
            raise IdentityRecordError(f"duplicate field: {name}")
        values[name] = _parse_scalar(raw_value or "")

    missing = sorted(required_fields - values.keys())
    if missing:
        raise IdentityRecordError(
            f"missing required fields: {', '.join(missing)}"
        )
    structured_status = values["status"]
    if displayed_statuses[0] != structured_status:
        raise IdentityRecordError(
            "displayed and structured status values do not match"
        )
    try:
        status = IdentityStatus(str(structured_status))
    except ValueError as error:
        raise IdentityRecordError(
            f"unsupported status: {structured_status!r}"
        ) from error
    return IdentityRecord(path=path, status=status, values=values)


def _is_human_value(value: object) -> bool:
    return isinstance(value, str) and value.strip() not in {"", "REPLACE_ME"}


def _is_utc_timestamp(value: object) -> bool:
    if not isinstance(value, str):
        return False
    try:
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        return False
    return (
        parsed.tzinfo is not None
        and parsed.utcoffset() == timezone.utc.utcoffset(parsed)
    )


def load_aws_identity(path: Path) -> IdentityRecord:
    """Parse and validate an AWS staging identity lifecycle record."""

    record = _parse_identity(
        path,
        {
            "status",
            "cloud_provider",
            "account_id",
            "verified_by",
            "verified_at_utc",
            "notes",
        },
    )
    if record.values["cloud_provider"] != "aws":
        raise IdentityRecordError("cloud_provider must be aws")
    if record.status is IdentityStatus.VERIFIED:
        errors = []
        if not (
            isinstance(record.values["account_id"], str)
            and re.fullmatch(r"\d{12}", record.values["account_id"])
        ):
            errors.append("account_id must be a 12-digit AWS account ID")
        if not _is_human_value(record.values["verified_by"]):
            errors.append("verified_by must name a human verifier")
        if not _is_utc_timestamp(record.values["verified_at_utc"]):
            errors.append("verified_at_utc must be an explicit UTC timestamp")
        if errors:
            raise IdentityRecordError(
                "VERIFIED AWS record requires: " + "; ".join(errors)
            )
    return record


def load_netlify_identity(path: Path) -> IdentityRecord:
    """Parse and validate a Netlify staging identity lifecycle record."""

    record = _parse_identity(
        path,
        {
            "status",
            "platform",
            "team_id",
            "team_slug",
            "site_id",
            "site_name",
            "site_url",
            "git_repository_linked",
            "staging_only",
            "contains_production_data",
            "uses_production_domain",
            "enforce_git_based_production_deploys",
            "production_publish_lock_supported",
            "production_publish_lock_enabled",
            "automatic_production_publishing_lock_supported",
            "automatic_production_publishing_lock_enabled",
            "verified_by",
            "verified_at_utc",
            "notes",
        },
    )
    if record.values["platform"] != "netlify":
        raise IdentityRecordError("platform must be netlify")
    if record.status is IdentityStatus.VERIFIED:
        errors = []
        for field in ("team_id", "team_slug", "site_name", "site_url"):
            if not _is_human_value(record.values[field]):
                errors.append(f"{field} must be recorded")
        site_url = urlsplit(str(record.values["site_url"]))
        if site_url.scheme != "https" or not site_url.hostname:
            errors.append("site_url must be an HTTPS URL")
        try:
            UUID(str(record.values["site_id"]))
        except (TypeError, ValueError, AttributeError):
            errors.append("site_id must be a UUID")
        required_boolean_values = {
            "git_repository_linked": True,
            "staging_only": True,
            "contains_production_data": False,
            "uses_production_domain": False,
            "enforce_git_based_production_deploys": True,
            "production_publish_lock_supported": True,
            "production_publish_lock_enabled": True,
        }
        for field, required_value in required_boolean_values.items():
            if record.values[field] is not required_value:
                errors.append(f"{field} must be {str(required_value).lower()}")
        for support_field, enabled_field in (
            (
                "automatic_production_publishing_lock_supported",
                "automatic_production_publishing_lock_enabled",
            ),
        ):
            supported = record.values[support_field]
            enabled = record.values[enabled_field]
            if supported not in {True, False}:
                errors.append(f"{support_field} must be true or false")
            elif supported is True and enabled is not True:
                errors.append(
                    f"{enabled_field} must be true when supported"
                )
            elif supported is False and enabled not in {None, False}:
                errors.append(
                    f"{enabled_field} must be null or false when unsupported"
                )
        if not _is_human_value(record.values["verified_by"]):
            errors.append("verified_by must name a human verifier")
        if not _is_utc_timestamp(record.values["verified_at_utc"]):
            errors.append("verified_at_utc must be an explicit UTC timestamp")
        if errors:
            raise IdentityRecordError(
                "VERIFIED Netlify record requires: " + "; ".join(errors)
            )
    return record


def verify_context(context: str) -> int:
    """Return success only for explicitly approved synthetic build contexts."""

    if context == PRODUCTION_CONTEXT:
        print(
            "PRODUCTION_BLOCKED: Live Introductions is a synthetic static "
            "prototype; production deployment is prohibited and no release "
            "approval is implied.",
            file=sys.stderr,
        )
        return 1

    if context in HOSTED_CONTEXTS:
        print(
            f"HOSTED_CONTEXT_VALIDATED: {context} is an approved synthetic "
            "build context only after the canonical deployment preflight; "
            "this context check alone is not deployment authorization."
        )
        return 0

    if context == "dev":
        print(
            "DEV_CONTEXT_BLOCKED: dev is not an approved Live Introductions "
            "build context; use make live-introductions-build for standalone "
            "local generation.",
            file=sys.stderr,
        )
        return 1

    if not context.strip() or context == "missing":
        print(
            "CONTEXT_MISSING_BLOCKED: missing Netlify build context; the base "
            "build command denies generation.",
            file=sys.stderr,
        )
        return 1

    print(
        f"UNAPPROVED_CONTEXT_BLOCKED: {context} is not an approved Live "
        "Introductions build context.",
        file=sys.stderr,
    )
    return 1


def _identity_blocker(
    label: str,
    path: Path,
    loader,
) -> DeploymentBlocker | None:
    try:
        record = loader(path)
    except FileNotFoundError:
        code = f"{label}_IDENTITY_MISSING"
        return DeploymentBlocker(code, f"{code}: {path}")
    except IdentityRecordError as error:
        code = f"{label}_IDENTITY_MALFORMED"
        return DeploymentBlocker(code, f"{code}: {path}: {error}")
    if record.status is IdentityStatus.UNVERIFIED:
        code = f"{label}_IDENTITY_UNVERIFIED"
        return DeploymentBlocker(
            code,
            f"{code}: {path} status is UNVERIFIED; human verification is "
            "required.",
        )
    return None


def evaluate_deployment_preflight(
    aws_identity: Path = AWS_STAGING_IDENTITY,
    netlify_identity: Path = NETLIFY_STAGING_IDENTITY,
) -> DeploymentPreflightEvaluation:
    """Parse canonical identity records into a status-aware gate result."""

    blockers = tuple(
        blocker
        for blocker in (
            _identity_blocker("AWS", aws_identity, load_aws_identity),
            _identity_blocker(
                "NETLIFY",
                netlify_identity,
                load_netlify_identity,
            ),
        )
        if blocker is not None
    )
    return DeploymentPreflightEvaluation(blockers)


def verify_deployment_preflight(
    aws_identity: Path = AWS_STAGING_IDENTITY,
    netlify_identity: Path = NETLIFY_STAGING_IDENTITY,
    *,
    resolution_only: bool = False,
) -> int:
    """Require valid human-owned AWS and Netlify staging identity records."""

    if resolution_only:
        print(
            "CONFIG_RESOLUTION_ONLY_BLOCKED: pinned Netlify configuration "
            "inspection stops before identity authorization and generation.",
            file=sys.stderr,
        )
        return 1

    evaluation = evaluate_deployment_preflight(
        aws_identity,
        netlify_identity,
    )
    blockers = evaluation.blockers
    for blocker in blockers:
        print(blocker.message, file=sys.stderr)
    print(
        "NETLIFY_NO_BUILD_BOUNDARY: netlify deploy --no-build bypasses "
        "TOML/build scripts; local code cannot block raw CLI uploads. "
        "A human must create and Git-link the staging-only project without "
        "authorizing or publishing a deployment; if the UI cannot defer that "
        "build, stop. After linking, immediately enable Enforce Git-based "
        "deployments and the production publishing lock, then verify the "
        "canonical Netlify record before any external deployment.",
        file=sys.stderr,
    )
    if blockers:
        return 1

    print(
        "DEPLOYMENT_PREFLIGHT_ALLOWED: AWS and Netlify staging identities are "
        "well-formed VERIFIED records and required Netlify production "
        "safeguards are recorded true; this is not deployment or production "
        "approval."
    )
    return 0


def _parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Verify a local-only Live Introductions synthetic build context."
        )
    )
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument(
        "--context",
        metavar="CONTEXT",
    )
    mode.add_argument(
        "--deployment-preflight",
        action="store_true",
        help="Report human-owned staging identity blockers without mutation.",
    )
    return parser.parse_args()


def main() -> int:
    args = _parse_args()
    if args.deployment_preflight:
        return verify_deployment_preflight(
            resolution_only=(
                os.environ.get(
                    "LIVE_INTRODUCTIONS_CONFIG_RESOLUTION_ONLY"
                )
                == "1"
            )
        )
    return verify_context(args.context)


if __name__ == "__main__":
    raise SystemExit(main())
