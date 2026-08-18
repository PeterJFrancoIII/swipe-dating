# Crowdsourced surface reports

- **ID:** 2026-08-18-crowdsourced-surface-reports
- **Status:** ready_for_review
- **Architect:** Codex / GPT Main
- **Implementer:** Cursor IDE Agent
- **Owner:** 2026-08-18 18:58 ET — `!` on every surface for Bug or Feature Request, with that control's link stored. Daily agent compile + human review. Cybersecurity never belongs to users.

## What

- Governance: crowdsourced development is a core feature. Security stays admin-only.
- Expo: contextual `!` marks open Bug or Feature Request and attach `getfkd://…` surface links.
- API: persist kind + surface; `security_hold` is excluded from the daily community digest.

## Validation

```text
cd apps/swipe && npx tsc --noEmit && npm test
# tests 68, pass 68

cd /Users/computer/App Development/swipe-dating-web-repo
uv run pytest tests/unit/test_system_reports.py tests/integration/test_in_app_errors.py
# 6 passed
```

NAS deploy still required for live persist and digest. Do not self-accept.
