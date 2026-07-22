# Reciprocal match and conversation R&D

**Status:** Synthetic JavaScript research only  
**Updated:** 2026-07-22  
**Real-user availability:** Prohibited

## Product hypothesis

The supplied casual-dating research recommends consent-driven conversation starters and a communication surface that can support both immediate compatibility and longer-term connection. This implementation tests whether carrying one visible shared-ground tag from discovery into the opening message reduces blank, crude, or context-free starts.

The research document is product-design input. Its numerical claims about reply rates, harassment reduction, safety outcomes, retention, or market performance are not treated as verified evidence by this repository.

## Current synthetic experience

### Discovery decisions

- **Pass:** suppresses the profile for the current session.
- **Interested:** requires one visible lifestyle/shared-ground tag.
- **Unilateral fixture:** interest remains pending and creates no match.
- **Reciprocal fixture:** creates one session-only synthetic match.
- **Undo:** restores only the latest pass or pending interest.

### Match creation

A match screen is created only after the candidate fixture explicitly marks reciprocal interest. The flag is deterministic test data, not another person's action, identity verification, cryptographic signature, or network response.

Match creation does not:

- send a message;
- share location;
- enable Bluetooth/proximity;
- change disclosure settings;
- expose private intent or exclusion reasons;
- persist match activity.

### Opening conversation

The first local message must use the same shared-ground tag selected during discovery. The app offers three generated templates that:

- mention the visible tag;
- ask an open-ended question;
- invite clarification of expectations or boundaries;
- avoid claiming consent to sex, media, location, or meeting.

After a shared-ground opener is sent, the synthetic conversation permits free-form text up to 500 characters and a deterministic synthetic reply action.

### Undo, unmatch, and block

- **Undo** applies only to the last pass or pending interest.
- **Unmatch** is explicit, disables further sending, and leaves the transcript visible only until the R&D session ends.
- **Block and purge** disables sending, removes visible messages and starter context immediately, and suppresses rediscovery for the session.
- Another person is never shown whether or why they were passed, unmatched, blocked, or excluded.

## Privacy and storage

The entire lifecycle remains in memory:

- decisions and undo history;
- pending interests and fixture reciprocity;
- matches and statuses;
- selected starter tags;
- messages and timestamps;
- unmatch/block state;
- Matches-tab visibility.

The existing AsyncStorage allowlist is not expanded. Storage tests prove these fields are discarded, and `Matches` is not an approved persisted last-tab value.

## Free safety controls

Pass, undo, unmatch, block, and future report controls may not depend on:

- subscription status;
- payment;
- purchased cosmetics;
- creator status;
- profile reach boosts.

Message content may not influence discovery rank, advertising, marketplace pricing, or access to safety features.

## Known limitations

The current build does not provide:

- real accounts, identity, or adult credentials;
- signed likes or bilateral match receipts;
- E2EE or any message encryption;
- message transport, delivery, retries, offline behavior, push, or synchronization;
- read receipts, typing indicators, attachments, ephemeral media, or screenshot controls;
- report intake, moderation, appeals, evidence handling, or emergency response;
- cross-device/service unmatch or block propagation.

## Measurement plan for later controlled research

No real-user measurement is authorized. A future approved synthetic or controlled study could evaluate:

- percentage of eligible profiles that receive a shared-ground selection;
- unilateral versus reciprocal outcome handling;
- opener choice distribution without storing intimate content;
- undo frequency and empty-queue recovery;
- unmatch/block control discoverability;
- accessibility completion without gestures;
- error recovery after stale or duplicate state.

Any real-user analytics plan requires privacy review and must avoid message content, sexual intent, match graph reconstruction, block reasons, or protected-trait profiling.

## Next product transition

Once real matching and messaging prerequisites are satisfied, a separate mutual **Deepen Connection** state may allow both matched adults to unlock additional long-term prompts. It must remain bilateral, reversible, private, and independent from payment or engagement pressure.
