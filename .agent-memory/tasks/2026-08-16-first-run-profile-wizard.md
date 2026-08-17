# First-run profile question wizard

- **ID:** 2026-08-16-first-run-profile-wizard
- **Status:** ready_for_review
- **Architect:** User instruction (overrides stale shared-memory “no product task”)
- **Implementer:** Cursor IDE Agent
- **Objective:** First-time profile creation asks required questions in order, then two optional continue gates.

## Allowed files

- `apps/swipe/components/OnboardingScreen.tsx`
- `apps/swipe/lib/types.ts`
- `apps/swipe/lib/api.ts`
- `apps/swipe/lib/session.tsx`
- `apps/swipe/app/profile.tsx`
- sibling live API `swipe-dating-web-repo` onboarding/profile/alignment/tests
- `.agent-memory/CURRENT.md`
- `.agent-memory/tasks/2026-08-16-first-run-profile-wizard.md`

## Forbidden files

- `golden-master/swipe-dating-web/`
- `apps/ios`, `apps/android`
- `approvals/`
- store submit / `eas submit`

## Acceptance criteria

- Required order after Age Gate: Sex, Location (coarse city/region), Name, Bio, Smoking, Drinking, Drugs, 2 photos
- Optional continue: Turn ons, Interested, Hobbies, Personality
- Optional continue: 10-question compatibility quiz
- No exact location / GPS
- Optional extras and quiz do not block swipe
- Tests pass with evidence

## Implementation summary

- Replaced the one-page Expo onboarding form with a one-question wizard.
- Age stays on the existing 18+ Age Gate (question 1 of 9). Wizard starts at Sex.
- Live API onboarding now requires sex/gender, coarse `home_region`, name, bio, habits, and ≥2 photos. Photo upload is allowed after the age gate.
- Draft saves use `finish: false`. Optional extras and the quiz never block completion.
- Alignment bank is 10 questions. Existing completed accounts stay in via a sticky onboarding flag.

## Files changed

- `apps/swipe/components/OnboardingScreen.tsx`
- `apps/swipe/lib/types.ts`
- `apps/swipe/lib/api.ts`
- `apps/swipe/lib/session.tsx`
- `apps/swipe/app/profile.tsx`
- `swipe-dating-web-repo/src/swipe_dating/domain/local_state.py`
- `swipe-dating-web-repo/src/swipe_dating/domain/alignment_catalog.py`
- `swipe-dating-web-repo/src/swipe_dating/application/session.py`
- `swipe-dating-web-repo/src/swipe_dating/web/mobile_api.py`
- `swipe-dating-web-repo/src/swipe_dating/web/app.py`
- `swipe-dating-web-repo/src/swipe_dating/web/templates/onboarding.html`
- `swipe-dating-web-repo/src/swipe_dating/adapters/sqlite_control.py`
- `swipe-dating-web-repo/tests/onboarding_support.py`
- `swipe-dating-web-repo/tests/__init__.py`
- related unit/integration tests
- `.agent-memory/CURRENT.md`
- `.agent-memory/tasks/2026-08-16-first-run-profile-wizard.md`

## Validation evidence

- `uv run pytest tests/unit tests/integration tests/property -q` in swipe-dating-web-repo → **283 passed** (exit 0)
- `npx tsc --noEmit` in `apps/swipe` → exit 0
- `npm test` in `apps/swipe` → **10 passed**
- NAS deploy `NAS_HOST=MediaServer2 bash deploy/nas-arch/deploy-to-nas.sh` → exit 0
- Live `GET /api/health` → 200 `{"status":"ok","client":"expo"}`
- Live after age gate: missing `['gender','location','name','bio','smoking','drinking','drugs','photos']`; `alignment_total` 10

## Blockers / questions

- Shared memory (`CURSOR_IDE_AGENT_UPDATE.md`, `CONTEXT.md`) still says no product task and names the frozen web app as the active client. User instruction and `PRODUCT_SCOPE.md` win.
- Already-onboarded sessions will not see this wizard unless they sign out / new account.
- IPA 6 does not include this flow. Reload Metro to try it.

## Architect review

- Pending Codex
