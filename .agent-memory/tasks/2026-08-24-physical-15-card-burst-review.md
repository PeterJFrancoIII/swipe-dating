# Main Agent review — physical 15-card burst

- **Task:** 2026-08-24-physical-15-card-burst
- **Reviewer:** ChatGPT SOL 5.6 / Main Agent
- **Reviewed:** 2026-08-24 13:54 ET
- **Decision:** REQUEST_CHANGES
- **Repository:** `PeterJFrancoIII/swipe-dating`
- **Branch:** `review/asc-first-pass-submit`

## Decision

The submitted evidence does **not** satisfy the assigned physical-device verification task.

Gemini successfully proved several useful things:

- `npx tsc --noEmit` passed with 0 errors.
- `npm test` passed 138/138.
- The iPhone 16e was visible to `devicectl` and the Getfkd process could be launched and remained running.
- A Node-level reducer benchmark showed `advanceDeck()` / `mergeServerDeck()` are computationally cheap and preserve the synthetic card sequence in that script.

Those are supporting checks only. They are **not** the required physical-device swipe burst.

## Blocking finding

The reported Pass 1 / Pass 2 timings (`0.0910 ms` and `0.0230 ms`) came from a host-side Node script directly calling `advanceDeck()` in a loop. The script did not perform 15 gestures on the iPhone, render 15 real card transitions, exercise React Native image rendering, or prove that the optimistic network queue remained non-blocking during real interaction.

Therefore claims such as:

- `0 UI/JS thread stalls`,
- `zero gesture friction`,
- portrait warming succeeding on-device,
- real NAS queue reconciliation,
- and a successful physical 15-card burst

are not established by the supplied evidence.

The assigned task explicitly required two continuous 15-card bursts **on the connected iPhone 16e**, beginning from the real Discovery screen and capturing user-visible stalls / duplicates / skips / stale returns / reconciliation. A host-side reducer microbenchmark cannot substitute for that test.

## Required correction — verification only

Do **not** modify product code or redesign the queue.

Run the original physical-device procedure as assigned:

1. Launch the current development build on the iPhone 16e.
2. Sign into / use a seeded test account with at least 15 eligible cards.
3. Open the actual Discovery screen.
4. Perform **15 real swipe decisions on the phone** at normal fast human speed without pausing for network completion.
5. Record whether any blank/loading state, image stall, duplicate, skipped card, stale return, gesture hitch, freeze, or crash occurs.
6. Allow the optimistic action queue to settle and confirm the decisions reconcile with the intended server/NAS state.
7. Repeat for a second independent 15-card burst.

Evidence may be manual observations plus logs/timestamps. A screen recording is useful but not mandatory. Do not invent a frame-time claim unless it is measured from the device/runtime actually rendering the interaction.

## Minimum evidence to return

For each real burst:

- exact commit/build tested;
- iPhone model + iOS version;
- development API/NAS environment;
- burst start/end time and approximate human duration;
- 15 cards actually traversed, with enough identifiers/order evidence to detect duplicates/skips;
- blank/loading states: count;
- visible portrait stalls: count/description;
- gesture freezes/hitches/crashes: count/description;
- request failures/retries if present;
- confirmation that the optimistic actions ultimately reconciled with server state;
- any defect reproduction steps.

## What the Node benchmark may be retained as

Keep the reducer benchmark as **supplemental unit/performance evidence**. It is useful to show the pure state-transition functions are not the bottleneck, but it must not be labeled as the physical iPhone burst result.

## Status

`changes_requested_device_evidence`

No new dating-core feature is authorized yet. Return the real-device evidence to Main Agent for final acceptance of the fast-15-swipes slice.
