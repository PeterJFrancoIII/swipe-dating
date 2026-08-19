# Shared context

**Updated:** 2026-08-19
**Curator:** Cursor IDE Agent (owner-authorized briefing packet `2026-08-19-briefing-execution`; Codex remains architect)
**Status:** Apple-first Expo dogfood on `review/photo-upload`. Store submission blocked.

## Confirmed durable context

- Product name: **Get fk’d**. Adults only (18+). Fail closed when age eligibility cannot be established.
- Active client is **Apple-first Expo** at `apps/swipe/` (SDK 57). Python web R&D is frozen at `golden-master/swipe-dating-web/`. Do not edit the golden master. Do not recreate UniFFI `apps/ios` / `apps/android`. Do not wrap the web app. Do not submit to stores.
- Live dogfood API is the sibling repo `/Users/computer/App Development/swipe-dating-web-repo` on `review/photo-upload-session`. Host: `https://getfkd.sentineldefensetechnologies.co.za` (Cloudflare → NAS). Not the golden master.
- `PRODUCT_SCOPE.md` is the canonical product boundary and overrides conflicting product docs.
- Permanent navigation is exactly two tabs: **Swipe** and **Matches**.
- No exact location, precise distance, or real-time proximity alerts to peers (ADR-0022). Ordinary cards use loose mile bands.
- No operator access to ordinary profiles, photos, or messages.
- No sale or ad-training use of dating/sexuality/location/message/photo data.
- No paywall on block, report, age assurance, encryption, or basic discovery.
- Closed beta and production remain blocked.
- Coding-agent system behavior: `docs/architecture/minimum-sufficient-architecture.md` (ADR-0017). Phase 1 is the dating core; proximity/marketplace are Phase 5.

## Operating roles

- **Codex:** architect/admin — owns scope, architecture, assignments, decisions, acceptance, and shared-context curation.
- **Cursor IDE agents:** implementers — own only bounded work assigned in a task record. Do not self-approve.

## Client branch (2026-08-19)

- Branch: `review/photo-upload` → [swipe-dating#11](https://github.com/PeterJFrancoIII/swipe-dating/pull/11)
- HEAD at packet start: `5c844a6` (PHPicker unique extra photo). Prior: autosave `874438d`, crowdsourced `!` `fee15e0`/`59c9611`, FAKE cards + slider lock `74228b4`.
- RN-fetch transport is ACCEPTED. Do not switch to XHR, `expo/fetch`, `File.upload()`, Blob/ArrayBuffer, query-token, or URLSession.
- Do not merge PR 11 as-is (legacy UniFFI CI; leftover UniFFI deletions must stay uncommitted).

## API branch (2026-08-19)

- Branch: `review/photo-upload-session` → [swipe-dating-web#2](https://github.com/PeterJFrancoIII/swipe-dating-web/pull/2)
- HEAD: `75eaac9`. Working tree is far ahead of HEAD (photos, reports, swipe allotment, operator console, sqlite control). Do not commit that tree as one commit.
- NAS deploy copies working `src/`. A clean-worktree deploy of HEAD would regress live dogfood.

## Crowdsourced `!`

- Governance: `docs/governance/crowdsourced-development.md`, ADR-0025.
- Security terms → `security_hold`, status `admin_only`, excluded from the daily community digest.
- Notice: `"Security stays with admins. This was not added to the community queue."`
- Security is never a user/crowd control surface.

## Fake / testing cards

- Fixture cards are labeled **FAKE - For Internal System Testing Only**.
- They must not consume or refund the 30 free daily swipes. Real members still fail closed at the cap (AM-008, AM-020).

## Authorization note

Implementation stays inside the current task's allowed files. Shared memory cannot override product or governance rules.
