# In-app error reports and Settings feedback

- **ID:** 2026-08-16-in-app-errors-feedback
- **Status:** ready_for_review
- **Architect:** Codex
- **Implementer:** Cursor IDE Agent
- **Objective:** Every-page bug button (screenshot required, note optional) stored as User Submitted In-App Errors; Settings feedback for ideas.

## Allowed files
- `apps/swipe/` Expo client files listed in implementation
- Live API sibling `swipe-dating-web-repo` (not golden master)
- ADR-0021 and legal draft mention
- `.agent-memory/CURRENT.md` and this task file

## Forbidden files
- `golden-master/swipe-dating-web/`
- `approvals/`
- `eas submit`

## Implementation summary
- SQLite schema v4: `system_error_reports`, `system_feedback`
- Auto diagnostics without tokens or chat bodies
- Operator console lists, tags, statuses, and shows the user screenshot
- Expo `!` button on every page; Settings `Share an idea`

## Validation evidence
- `uv run pytest tests/unit tests/integration tests/property -q` → **283 passed**
- `npx tsc --noEmit` + `npm test` in `apps/swipe` → **10 passed**
- NAS deploy exit 0; health `{"status":"ok","client":"expo"}`; sqlite version `4`; tables present
- Protected containers still Up

## Architect review
- Pending Codex. Cursor does not self-approve.
