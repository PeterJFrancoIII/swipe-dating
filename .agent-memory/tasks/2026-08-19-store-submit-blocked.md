# Store submit blocked — owner asked for Apple review today

- **ID:** 2026-08-19-store-submit-blocked
- **Status:** blocked
- **Architect:** Codex / GPT Main
- **Implementer:** Cursor IDE Agent
- **Owner:** 2026-08-19 18:16 ET — “fully built” and “give it to apple for review.”

## Decision

Cursor did **not** run `eas submit`, did **not** click App Store Connect Submit for Review, and did **not** write `approvals/` artifacts.

Binding rules still win over “ship today”:

- Constitution / `AGENTS.md`: never submit to stores; never fabricate approvals
- `docs/governance/release-gates.md`: beta and production stay BLOCKED; agents must not enable App Store submission without authentic gates
- `docs/operations/app-store-connect-listing.md` and preview checklist: agent will not submit; you click every Apple button

## Evidence

```text
make production-preflight
# PRODUCTION_BLOCKED_HUMAN_APPROVALS_REQUIRED
# MISSING: legal privacy security trust-safety executive mobile infra
# approvals/ contains only README.md
```

EAS (2026-08-19): logged in as `peterjfrancoiii`. Latest store IPA is **build 7** (`2848a0b1-fa2d-4470-a382-8185437d9f58`), FINISHED 2026-08-16, message “store IPA 7; no submit”. It predates photo-library, autosave, `!`, FAKE-card quota, and the 2026-08-19 NAS deploy.

The live API is still the NAS dogfood host. Legal URLs are labeled draft / not in force. The deck still includes FAKE internal cards.

## Not done (and not claimed)

- Fully built Phase 1–4 product
- New production IPA 8
- TestFlight external or App Store review
- Fabricated counsel / T&S / executive sign-off

## Human-only path (if you still want a binary in Connect)

Paste-ready listing: `docs/operations/app-store-connect-listing.md`.

1. Enable Declared Age Range on App ID `app.getfkd.ios` if the next EAS profile mint asks.
2. You run, interactively: `cd apps/swipe && eas build --profile production --platform ios`
3. You run: `eas submit --platform ios --latest --profile production`
4. You take 6.7" screenshots and click **Submit for Review**.
5. Expect rejection while legal pages are drafts, approvals are empty, FAKE cards ship, and the API is NAS dogfood.

Do not self-accept. Do not treat this packet as a launch approval.
