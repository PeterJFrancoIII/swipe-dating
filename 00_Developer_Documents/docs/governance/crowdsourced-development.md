# Crowdsourced development

**Status:** DRAFT / UNAPPROVED until named humans sign `approvals/`  
**Updated:** 2026-08-18  
**Rank:** One of the most important operating features of Get fk'd.  
**ADR:** `docs/architecture/adr-0025-crowdsourced-surface-reports.md`

## Why this exists

Get fk'd is built in a limited, controlled loop with the people who use it.

Adult testers can mark **any page, subpage, button, or section** with a single `!`. That mark opens **Bug** or **Feature Request** and stores the exact surface link (`getfkd://…`) with the report. At the end of each day, coding agents compile the community queue. A human reviews the compile before anything is adapted.

Users steer product shape. They do not steer security.

## The `!` mark

- Every user-facing surface must expose a `!`.
- Tapping `!` on a control includes that control's surface link in the report.
- The global `!` still works and uses the current route when no local mark was tapped.
- Kinds are only **Bug** and **Feature Request**.
- Reports persist in the NAS SQLite control plane (`system_error_reports`, `system_feedback`), isolated from ordinary profiles, photos, and messages.

## Daily loop

1. Testers file Bug or Feature Request from the surface they are on.
2. After the local day, agents compile the **community queue** (no security holds).
3. The compile groups items by surface link and kind, with counts and short quotes.
4. A human reviews the compile and chooses what, if anything, to adapt.
5. Agents implement only the human-approved slice. They do not self-approve.

This is crowdsourced development, not autonomous product change.

## Security is never a user control surface

Cybersecurity, cryptography, age-gate internals, attestation, operator credentials, exploit work, and any request to weaken those controls **must not** enter the community queue.

- Those filings are tagged `security_hold` and stored **admin-only**.
- Agents compiling the daily community backlog must drop `security_hold` rows.
- Only the Security / Admin role may read or act on them.
- The product must not add a user-facing security settings or exploit-reporting console.
- Ordinary Bug / Feature Request copy stays generic. Do not teach users which words were filtered.

Fail closed: when classification is uncertain, hold for admins.

## What users may steer

Dating UX, copy, layout, swipe/match flow, onboarding clarity, and similar product surfaces — subject to `PRODUCT_SCOPE.md`, age, privacy, and the two-tab navigation limit.

## What users may never steer

- Encryption, keys, session tokens, attestation, operator login
- Age assurance, fail-closed adult gates, child-safety internals
- Bypass, weaken, or disable any of the above
- Access to ordinary profiles, photos, or messages for operators or agents

## Related

- ADR-0021 (in-app error rows)
- ADR-0020 (operator console is metadata only)
- ADR-0025 (surface-linked Bug / Feature Request)
- `roles-and-owners.md` — Security owner stays a named human, never the crowd
