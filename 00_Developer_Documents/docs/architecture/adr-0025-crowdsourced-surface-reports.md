# ADR-0025: Crowdsourced surface reports

**Status:** Accepted by user instruction (2026-08-18)  
**Date:** 2026-08-18

## Context

ADR-0021 added a global in-app error FAB and a Settings-only idea button. Testers still could not point at a specific button or section. The owner asked for a `!` on every page, subpage, button, and section, with that control's link stored on a **Bug** or **Feature Request**, compiled daily by agents, and reviewed by a human. Cybersecurity must stay with admins.

## Decision

- Crowdsourced development is a first-class governance feature (`docs/governance/crowdsourced-development.md`).
- Every user-facing surface exposes a `!` that opens Bug or Feature Request and includes `surface_href` (a `getfkd://…` link).
- Bugs still require a user-chosen screenshot. Feature requests are text plus the surface link.
- Persist in the existing SQLite control plane. Kind and surface live in tags/context/body. No new public database.
- Text and surface links that look like security-control requests are tagged `security_hold`, stored admin-only, and excluded from the daily community digest.
- The operator console shows today's community backlog separately from admin-only holds.
- Agents may compile the community queue. They may not implement security-hold items or change security controls from crowd input.

## Consequences

- ADR-0021's "ideas belong only in Settings" rule is superseded for Feature Request. Settings remains one more surface, not the only one.
- Ordinary dating content stays off the operator console.
- Uncertain security classification fails closed to `security_hold`.
- No store submit. No golden-master edits.
