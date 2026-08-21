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

# Safari retry 2026-08-20 ~19:40 ET (JS from Apple Events on)
# SaaSHub: https://www.saashub.com/getfkd HTTP 200 pending approval
#   details updated; logo + 3 screenshots; free queue (not $75)
# PH: Dating launch tag applied; Images step open; do not Launch
# Uneed: Fast-track $14.99 checkout opened; left unpaid; draft remains 48268
# Fazier: Google sign-in as peterjfrancoiii@gmail.com; /launch form; link filled
#   still needs 3 comments + badge; no fake comments; no paid plan
# Tiny: still email-verify blocked
# Startup Stash: email filled; recaptcha needs human
# Microlaunch/Peerlist/StackShare/Betabound/AlternativeTo: no free complete submit
# Canonical /app HTTP 200; IH HTTP 200; Launching Next thanks HTTP 200
# HN curl 429 (rate limit); post id 49381635 unchanged
# Owner "do it" pass 2026-08-20 ~20:00 ET
# /app Fazier badge deployed; live HTML contains launch_badges.svg
# uv run pytest …test_public_listing_page_is_public -q → 1 passed in 0.58s
# NAS_HOST=MediaServer2 deploy-to-nas.sh → swipe-dating-web recreated; /app 200
# PH scheduled Fri Aug 21 12:00 AM PT
#   https://www.producthunt.com/products/getfkd-dating?launch=getfkd-dating
#   dashboard TIME UNTIL LAUNCH ~7h from 20:00 ET
# Fazier live https://fazier.com/launches/getfkd-dating HTTP 200
# Tiny: ABANDONED 2026-08-20 20:05 ET — owner said verification link is broken; do not retry
#   /api/me still emailVerified:false for PeterJFrancoIII@gmail.com
# Startup Stash: form send error
# No paid upgrades purchased
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
