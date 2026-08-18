# Fake test cards and distance slider gesture

- **ID:** 2026-08-18-fake-cards-and-slider
- **Status:** ready_for_review
- **Architect:** Codex / GPT Main
- **Implementer:** Cursor IDE Agent
- **Owner:** 2026-08-18 18:50 ET — Mock cards are all the same with no detailed fake info. Populate them and label **FAKE - For Internal System Testing Only**. Distance slider also grabs the Settings page.

## What

1. Seed the five fixture people into the live discovery deck, with distinct bios and a testing banner so testers do not treat them as real members.
2. Stop the Settings `ScrollView` from panning when the distance thumb is dragged.

## Allowed

- `apps/swipe/components/DatingCard.tsx`
- `apps/swipe/components/DistanceSlider.tsx`
- `apps/swipe/app/filters.tsx`
- `apps/swipe/app/(tabs)/index.tsx`
- `apps/swipe/app/matches/[id].tsx`
- `apps/swipe/lib/types.ts`
- `apps/swipe/lib/testingCard.ts`
- `apps/swipe/lib/testingCard.test.ts`
- sibling live API (not golden master): fixtures, discovery, mobile API, session store default, sqlite live-deck filter, related tests
- this packet, `.agent-memory/CURRENT.md`

## Forbidden

- `golden-master/swipe-dating-web/`
- UniFFI `apps/ios` / `apps/android`
- Photo transport / session minting / store submit
- Exact km or coordinates on ordinary cards

## Not in this slice

- Refunding swipe quota on fake cards
- Deploy to NAS
- Self-accept

## Files changed

Client (`review/photo-upload`):

- `apps/swipe/components/DatingCard.tsx`
- `apps/swipe/components/DistanceSlider.tsx`
- `apps/swipe/app/filters.tsx`
- `apps/swipe/app/(tabs)/index.tsx`
- `apps/swipe/app/matches/[id].tsx`
- `apps/swipe/lib/types.ts`
- `apps/swipe/lib/testingCard.ts`
- `apps/swipe/lib/testingCard.test.ts`
- `apps/swipe/package.json`
- this packet, `.agent-memory/CURRENT.md`

Sibling API (`swipe-dating-web-repo`, not committed — mixed dirty tree):

- `src/swipe_dating/domain/discovery.py`
- `src/swipe_dating/fixtures.py`
- `src/swipe_dating/web/app.py`
- `src/swipe_dating/web/mobile_api.py`
- `src/swipe_dating/application/session.py`
- `src/swipe_dating/adapters/sqlite_control.py`
- `src/swipe_dating/web/templates/discover.html`
- `tests/unit/test_discovery.py`
- `tests/integration/test_mobile_api.py`
- `tests/integration/test_web.py`

## Validation

```text
cd apps/swipe && npx tsc --noEmit && npm test
# tests 66, pass 66, fail 0

cd /Users/computer/App Development/swipe-dating-web-repo
uv run pytest tests/unit/test_discovery.py tests/unit/test_loose_location.py \
  tests/unit/test_session.py tests/integration/test_mobile_api.py \
  tests/integration/test_web.py tests/integration/test_chat_live.py
# 103 passed
```

Live NAS still serves the old empty-seeded deck until this API slice is deployed.
