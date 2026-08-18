# Distance filter for discovery

- **ID:** 2026-08-18-distance-filter
- **Status:** ready_for_review
- **Architect:** Codex / GPT Main
- **Implementer:** Cursor IDE Agent
- **Owner:** 2026-08-18 18:22 ET — users should filter discovery/swiping cards by distance.
- **Follow-up:** 2026-08-18 18:28 ET — Distance should be a slider.
- **Do not self-accept.**
- **GitHub:** https://github.com/PeterJFrancoIII/swipe-dating/blob/review/photo-upload/.agent-memory/tasks/2026-08-18-distance-filter.md

## What

Settings already filtered eligibility (gender, looking, habits, turn-ons). Distance only affected ranking via `max_distance_km` and did not exclude cards. Add a mile-band maximum on Settings. Empty / `any` keeps everyone, including Farther and Distance unavailable. A chosen max excludes farther bands and Distance unavailable (fail closed). Filters change who is eligible, not ranking weights. No exact km, no radius slider, no peer-precise distance.

## Client files

- `apps/swipe/app/filters.tsx`
- `apps/swipe/components/DistanceSlider.tsx`
- `apps/swipe/lib/distance.ts`
- `apps/swipe/lib/distance.test.ts`
- `apps/swipe/lib/types.ts`
- `apps/swipe/lib/session.tsx`
- `apps/swipe/lib/theme.ts`
- this packet, `.agent-memory/CURRENT.md`

## API files (sibling `swipe-dating-web-repo`, not golden-master)

Working-tree implementation, **not committed** — that repo’s tree already has a large mix of prior uncommitted work. Do not fold this slice into that soup.

- `src/swipe_dating/domain/loose_location.py` — `normalize_distance_filter`, `candidate_distance_label`, `distance_within_max_band`
- `src/swipe_dating/domain/discovery.py` — `feed_distance_band`, exclusion `distance_feed_mismatch`
- `src/swipe_dating/domain/preferences.py` — distance labels/icons/section mark
- `src/swipe_dating/application/session.py` — `selected_distance_band`, viewer mapping, reset
- `src/swipe_dating/adapters/sqlite_control.py` — persist/restore `selected_distance_band`
- `src/swipe_dating/web/mobile_api.py` — GET/POST `/api/filters` `values.distance_band`, catalogs `distance`
- `tests/unit/test_loose_location.py`
- `tests/unit/test_discovery.py`
- `tests/integration/test_mobile_api.py`

HTML `/filters` left for a later slice. Golden master not touched.

## Behavior

| id | label |
|---|---|
| `any` | Any distance (stored as `""`) |
| `about_1_mile` | About 1 mile |
| `about_5_miles` | About 5 miles |
| `about_15_miles` | About 15 miles |
| `farther` | Farther |

Eligibility uses `candidate_distance_label(viewer.location_cell, candidate.location_cell, candidate.distance_km)`: pairwise cells if both exist; else if both cells are None, fixture `distance_km`; else Distance unavailable.

## Slider (2026-08-18 18:28 ET)

Settings Distance is a stepped slider, not a choice sheet. Left is About 1 mile; right is Any distance. Thumb snaps to the five approved bands. No km, no continuous radius, no new native dependency.

## Validation

```text
cd apps/swipe && npx tsc --noEmit && npm test
# tsc exit 0
# tests 62, pass 62, fail 0

cd /Users/computer/App Development/swipe-dating-web-repo
uv run pytest tests/unit/test_loose_location.py tests/unit/test_discovery.py tests/integration/test_mobile_api.py -q --tb=short
# 50 passed in 4.47s
```

## Not claimed

- Live NAS deploy of the API (required before the deck actually filters)
- HTML filters UI
- Exact km or ranking-weight changes
- Live dogfood that a chosen band hides farther cards

## Ask of owner

1. Reload Metro on `review/photo-upload`. Settings → Distance is a slider. Drag, then Save settings.
2. Approve a NAS deploy of the sibling API working tree if the swipe deck should honor the band live.
3. After deploy: a max of About 5 miles should hide About 15 miles, Farther, and Distance unavailable.
