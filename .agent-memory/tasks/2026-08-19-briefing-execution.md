# Briefing execution — swipe quota, isolated API slice, NAS, compile

- **ID:** 2026-08-19-briefing-execution
- **Status:** ready_for_review
- **Architect:** Codex / GPT Main
- **Implementer:** Cursor IDE Agent
- **Owner:** 2026-08-19 ~18:04 ET — “Let's get it all done, step by step.”

## Authorization

Owner authorized the 2026-08-19 review/dogfood briefing sequence. This packet bounds Cursor to that list. Cursor may update `CURRENT.md`, this file, the daily compile under `.agent-memory/`, and (this slice only) `CONTEXT.md` plus one append-only `DECISIONS.md` entry for the synthetic swipe exemption.

## This slice

1. Fake/synthetic cards do not consume or refund the 30 free daily swipes. Real members still fail closed at the cap.
2. Expo deck actions stay enabled on a labeled testing card when remaining is 0.
3. Isolated API git commit of standalone domain files only. Do not commit the mixed dirty API tree.
4. NAS staging deploy from the working API `src/` after tests (same practice as prior dogfood deploys). Clean-worktree deploy would regress live photo/session work that is not on HEAD.
5. First daily community compile (empty is OK). Security holds stay out.
6. Do not merge PR 11. Do not self-accept. Do not edit the golden master. Do not start Phase 5.

## Allowed files

### Client (`review/photo-upload`)

- `apps/swipe/app/(tabs)/index.tsx`
- `apps/swipe/lib/swipeQuota.ts`
- `apps/swipe/lib/swipeQuota.test.ts`
- `.agent-memory/CURRENT.md`
- `.agent-memory/CONTEXT.md`
- `.agent-memory/DECISIONS.md`
- `.agent-memory/tasks/2026-08-19-briefing-execution.md`
- `.agent-memory/tasks/2026-08-19-community-compile.md`

### API (`/Users/computer/App Development/swipe-dating-web-repo`)

- `src/swipe_dating/domain/swipe_allotment.py`
- `src/swipe_dating/application/session.py` (consume/refund gates only; file stays mixed/uncommitted except isolated domain commit)
- `tests/unit/test_swipe_allotment.py`
- `tests/unit/test_session.py` (swipe-quota tests only)
- `tests/integration/test_mobile_api.py` (swipe-quota tests only)
- Isolated commit only: `src/swipe_dating/domain/system_reports.py`, `src/swipe_dating/domain/swipe_allotment.py`, `tests/unit/test_system_reports.py`, `tests/unit/test_swipe_allotment.py`

## Forbidden

- `golden-master/swipe-dating-web/`
- UniFFI `apps/ios` / `apps/android` (do not recreate; do not commit leftover deletions)
- Whole dirty API tree as one commit
- Raising `SESSIONS_PER_IP_HOUR`
- JPEG-transcode of library picks (AM-017)
- Minting sessions on photo POST (AM-019)
- Switching RN-fetch transport
- Production deploy, store submit, merging PR 11
- Self-accept

## Files changed

### Client

- `apps/swipe/app/(tabs)/index.tsx`
- `apps/swipe/lib/swipeQuota.ts`
- `apps/swipe/lib/swipeQuota.test.ts`
- `apps/swipe/package.json`
- `.agent-memory/CURRENT.md`
- `.agent-memory/CONTEXT.md`
- `.agent-memory/DECISIONS.md` (AM-020)
- `.agent-memory/tasks/2026-08-19-briefing-execution.md`
- `.agent-memory/tasks/2026-08-19-community-compile.md`

### API (working tree; isolated git add listed below)

- `src/swipe_dating/domain/swipe_allotment.py` — `charges_daily_swipe`
- `src/swipe_dating/application/session.py` — charge/refund gates (stays mixed, not in isolated commit)
- `tests/unit/test_swipe_allotment.py`
- `tests/unit/test_session.py`
- `tests/integration/test_mobile_api.py`

Isolated API commit only: `system_reports.py`, `swipe_allotment.py`, `test_system_reports.py`, `test_swipe_allotment.py`.

## Validation

```text
cd apps/swipe && npx tsc --noEmit && npm test
# tests 74, pass 74

cd /Users/computer/App Development/swipe-dating-web-repo
uv run pytest tests/unit/test_swipe_allotment.py tests/unit/test_session.py tests/unit/test_system_reports.py tests/integration/test_in_app_errors.py tests/integration/test_mobile_api.py::test_daily_swipe_limit_blocks_the_next_decision tests/integration/test_mobile_api.py::test_synthetic_cards_do_not_consume_daily_swipes
# 34 passed

API isolated commit: 716c34d on review/photo-upload-session (pushed).
NAS: deploy-to-nas.sh 2026-08-19. swipe-dating-web Up 56s (healthy).
GET https://getfkd.sentineldefensetechnologies.co.za/api/health → 200 {"status":"ok","client":"expo"}
Protected containers stayed up. session.py swipe skip is on NAS via working-tree sync, not in 716c34d.
```

## Human-only (cannot close in this packet)

- Two-simulator match
- Extra-photo / autosave / `!` density dogfood
- Native rebuild if multi-select still fails
- Codex acceptance of ready_for_review packets
