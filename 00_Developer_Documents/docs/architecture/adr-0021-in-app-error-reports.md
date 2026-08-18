# ADR-0021: User-submitted in-app errors and feedback

**Status:** Accepted by user instruction (2026-08-16)  
**Date:** 2026-08-16

## Context

Shared chat and the Expo client need a way for adults to send a screenshot of a broken page, optional notes, and enough diagnostics for an operator or coding agent to reproduce the issue. Feature requests now also come from a `!` on every surface (ADR-0025). Settings is no longer the only idea entry.

Ordinary dating photos and messages stay off the operator console (ADR-0020). A user-chosen diagnostic screenshot is a separate, explicit exception.

## Decision

- Store reports in the existing NAS SQLite control plane, not a new database.
- Title for error rows is always `User Submitted In-App Errors`.
- A screenshot is required. An explanation is optional.
- Auto-collect route, screen, app/build, platform, eligibility flags, and last API error code/path. Never store session tokens, passwords, or chat bodies.
- Feedback ideas are text-only and live behind a Settings button.
- The operator console lists, tags, and statuses these rows and can show the submitted screenshot only.

## Consequences

- Account delete wipes that account's diagnostic screenshots and feedback.
- Screenshots may still contain whatever was on the user's screen; they are user-initiated, not operator-scraped.
- No App Store submit and no golden-master edits.
