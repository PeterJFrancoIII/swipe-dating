# Public directory listing

- **ID:** 2026-08-20-public-listing
- **Status:** ready_for_review
- **Reviewer:** Main GPT Sol 5.6 (Codex / architect). Cursor does not self-accept.
- **Architect:** Codex / GPT Main
- **Implementer:** Cursor IDE Agent
- **Owner:** 2026-08-20 18:54 ET — list Getfkd on every website possible, with App Store link, photos, full vivid copy, Get Fk'd explanation, in-development + contributor lifetime / latecomer discount.

## Bound

Publish a canonical listing page and submit to directories that accept a website URL. Do **not** claim the App Store page is live (it 404s). Do **not** invent IAP. Do **not** edit `golden-master/`. Do **not** write `approvals/`. Do **not** merge PR 11.

## Allowed

- Live API sibling: `swipe-dating-web-repo` listing page + `/static/listing/` screenshots + NAS deploy of working `src/`
- `00_Developer_Documents/docs/operations/public-listing.md`
- This task / `CURRENT.md`
- Directory submit forms (owner identity; no fake accounts)

## Forbidden

- Golden master edits
- Fabricated `approvals/`
- Claiming production / store-live / counsel sign-off
- Paid spam “250 directories” services
- Recreating UniFFI apps

## Acceptance

1. `https://getfkd.sentineldefensetechnologies.co.za/app` serves photos + full copy + App Store URL + contributor offer.
2. Tracker in `public-listing.md` records submitted vs owner-login-required.
3. App Store URL used: `https://apps.apple.com/app/id6803669203` labeled pending Apple.

## Evidence

```
# Live listing
curl -sS -o /tmp/getfkd-app.html -w "HTTP %{http_code}" https://getfkd.sentineldefensetechnologies.co.za/app
# HTTP 200; contains Getfkd Dating, Get Fk, lifetime access, apps.apple.com/app/id6803669203, Adults 18+
# Screenshot 01-age-gate.png HTTP 200, 557390 bytes
# /press → 307 → /app

# Local test (sibling web repo)
uv run pytest tests/integration/test_mobile_api.py::test_public_listing_page_is_public -q
# 1 passed in 0.88s

# NAS
NAS_HOST=MediaServer2 bash deploy/nas-arch/deploy-to-nas.sh
# swipe-dating-web recreated and started; health starting then public /app 200

# GitHub
gh repo edit … homepage=/app
# https://github.com/PeterJFrancoIII/swipe-dating homepage + description updated

# Launching Next
POST https://www.launchingnext.com/submit/ → 302 Location: /thanks/?i=145881
# title: Submission Received | Launching Next
```

## Files (this repo)

- `00_Developer_Documents/docs/operations/public-listing.md`
- `.agent-memory/tasks/2026-08-20-public-listing.md`
- `.agent-memory/CURRENT.md`
- `README.md` (public listing pointer only)

## Files (sibling live API, not this git tree)

- `swipe-dating-web-repo/src/swipe_dating/web/listing_page.py`
- `swipe-dating-web-repo/src/swipe_dating/web/mobile_api.py` (`/app`, `/press`)
- `swipe-dating-web-repo/src/swipe_dating/web/static/listing/*.png`
- `swipe-dating-web-repo/tests/integration/test_mobile_api.py` (listing test)

Do not merge PR 11. Do not self-accept. Do not write `approvals/`.
