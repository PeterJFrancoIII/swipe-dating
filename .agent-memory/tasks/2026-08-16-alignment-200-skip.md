# Alignment quiz: 200 questions, Skip is an answer

- **ID:** 2026-08-16-alignment-200-skip
- **Status:** ready_for_review
- **Architect:** Codex
- **Implementer:** Cursor IDE Agent
- **Objective:** Expand the compatibility quiz to 200 relationship/sex questions. Skip is a saved answer that counts toward progress and never lowers a match score. Boot two iOS Simulators so the owner can test a match without two phones.

## Allowed files
- Live API sibling `swipe-dating-web-repo` (`alignment_catalog.py`, `alignment.py`, session, mobile_api, unit/integration tests)
- `apps/swipe/` quiz, onboarding, session fallbacks, alignment label helpers/tests
- `.agent-memory/CURRENT.md`, `DECISIONS.md`, and this task file

## Forbidden files
- `golden-master/swipe-dating-web/`
- `approvals/`
- `eas submit`
- App Attest / Get Fk'd live map / Skin Shop
- UniFFI `apps/ios` / `apps/android`
- Using quiz answers as bot-risk inputs (ADR-0013)

## Acceptance criteria
- Catalog has exactly 200 unique questions
- Skip is accepted on every question, increments `answered`, and is excluded from pairwise scoring
- If the only overlapping answers are skip / prefer-not, alignment is hidden (`None`), not `0%`
- Expo Skip button saves `"skip"` (including the last question)
- Two iOS Simulators can run Expo Go against the same Metro on 8082
- Tests + NAS health evidence
- No `eas submit`

## Implementation summary
- Catalog is 200 unique relationship/sex questions; `skip` is always allowed and never a real option id
- `score_alignment` treats `skip` and `prefer_not` as non-comparable
- `pairwise_alignment_percent` returns `None` when there is no overlapping comparable answer
- Expo quiz and onboarding Skip call `saveAlignment` with `"skip"`
- iPhone 17 and iPhone 17 Pro are both Booted with Expo Go on `exp://127.0.0.1:8082` (one Metro, pid 5736)

## Files changed
- `swipe-dating-web-repo/src/swipe_dating/domain/alignment_catalog.py`
- `swipe-dating-web-repo/src/swipe_dating/domain/alignment.py`
- `swipe-dating-web-repo/tests/unit/test_alignment_catalog.py`
- `swipe-dating-web-repo/tests/unit/test_adult_alignment.py`
- `swipe-dating-web-repo/tests/integration/test_mobile_api.py`
- `apps/swipe/app/quiz.tsx`
- `apps/swipe/components/OnboardingScreen.tsx`
- `apps/swipe/lib/session.tsx`
- `apps/swipe/lib/alignment.ts`
- `apps/swipe/lib/alignment.test.ts`
- `.agent-memory/CURRENT.md`, `DECISIONS.md` (AM-010), this task

## Validation evidence
- `cd "/Users/computer/App Development/swipe-dating-web-repo" && uv run pytest tests/unit tests/integration tests/property -q` → **307 passed**, 1 warning, 15.66s
- `cd "/Users/computer/App Development/Swipe Dating/apps/swipe" && npx tsc --noEmit && npm test` → **13 passed**, 0 failed
- `NAS_HOST=MediaServer2 bash deploy/nas-arch/deploy-to-nas.sh` → exit 0
- Live `GET /api/health` → 200 `{"status":"ok","client":"expo"}`
- Two sims Booted: iPhone 17 `47A05D76-B077-4D3F-A24E-8855125CE42C`, iPhone 17 Pro `7758A320-E896-4BAF-8C5F-3321620F4F97`; Expo Go on both; Metro `*:8082` pid 5736
- No `eas submit`. Golden master not edited.

## Blockers / questions
- NAS still fail-closed without Apple for new onboarding. Expo Go skips the Apple screen (`__DEV__`), so a brand-new sim account may still be rejected at finish unless that sim uses Sign in with Apple. Two sims must be two accounts (two Apple IDs if binding).
- Store IPA 7 does not include this quiz or the match overlay. Test in Expo Go.
- App Attest still deferred.

## Architect review
- 
