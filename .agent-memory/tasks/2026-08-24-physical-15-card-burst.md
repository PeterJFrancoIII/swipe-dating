# Physical 15-card burst verification

- **ID:** 2026-08-24-physical-15-card-burst
- **Status:** execution_ready
- **Reviewer:** ChatGPT SOL 5.6 (Main Agent / Architect). Implementation agents do not self-accept.
- **Architect:** ChatGPT SOL 5.6 / Main Agent
- **Implementer:** Gemini 3.7 Flash in Antigravity, with Cursor only if explicitly needed
- **Assigned:** 2026-08-24 12:48 ET
- **Repository:** `PeterJFrancoIII/swipe-dating`
- **Branch:** `review/asc-first-pass-submit`
- **Shared memory:** `.agent-memory/`

## Architect decision

The next active slice is **physical-device verification of the completed fast-15-swipes work**. Do not start another Phase 1 feature until this path is proven on real hardware or returned with failure evidence.

This is a verification slice, not a redesign slice.

## Objective

Prove that the 15-card in-memory warm window, portrait prefetching, and optimistic Like / Pass / Superlike queue remain fast, ordered, and stable under real iPhone rendering and network conditions.

The product requirement is simple: a user should be able to fling through the deck at normal human swipe speed without waiting on the network between ordinary cards.

## Primary device

- Connected iPhone 16e over USB.
- Record exact iOS version and app build / commit tested.

## Secondary device

If an iPhone SE or the lowest-performance supported iPhone is immediately available, repeat the same test there. Do not block completion waiting for hardware that is not available.

## Pre-run verification

From `apps/swipe/`:

```bash
npx tsc --noEmit
npm test
```

Expected baseline from the implementation briefing:

- TypeScript: 0 errors.
- Tests: 138/138 passing or greater.

If baseline verification fails, stop and return the failure to the Main Agent. Do not proceed to device performance claims with a red test suite.

## Test setup

1. Use the current development build on the physical iPhone 16e.
2. Use seeded test accounts with at least 15 immediately eligible discovery cards.
3. Start from a freshly loaded Discovery screen.
4. Confirm the app is using the intended development API / NAS environment before recording results.
5. Do not alter ranking, swipe limits, test-account eligibility, or queue behavior merely to make the test pass.

## Test procedure

Run **two independent continuous 15-card bursts** on the iPhone 16e.

For each burst:

1. Begin from a loaded first card.
2. Start timing immediately before the first decision.
3. Make 15 consecutive decisions at normal fast human swipe speed.
4. Pass and Like may be mixed. Superlike may be included if it is already part of the normal tested path.
5. Do not intentionally pause to let networking catch up.
6. End timing when the 15th decision has transitioned away and the next client state is stable.
7. Allow the optimistic queue to reconcile with NAS and verify final state/order.

If a secondary low-performance iPhone is available, perform the same two bursts there.

## Evidence to record

For every burst record:

- exact Git commit / app build;
- device model;
- iOS version;
- runtime / Metro mode used;
- API / NAS environment;
- burst start timestamp;
- burst end timestamp;
- total duration for all 15 decisions;
- longest visible inter-card stall, if any;
- count of blank/loading states between ordinary swipes;
- duplicate card IDs, if any;
- skipped card IDs, if any;
- stale / previously swiped cards that reappear, if any;
- portrait load or prefetch failures;
- visible gesture lock, hitch, freeze, or crash;
- request failures / retries visible in logs;
- optimistic queue ordering / reconciliation result;
- final server-side state sufficient to confirm client decisions reconciled correctly;
- memory behavior if already observable without adding invasive tooling.

Video or screen recording is useful if available, but is not required if the timestamps, logs, and card-order evidence are sufficient.

## Pass criteria

Each required iPhone 16e burst must satisfy **all** of the following:

1. Fifteen distinct decisions can be made continuously.
2. No blocking loading screen appears between ordinary swipes.
3. The next card is visually ready at transition; portrait preparation does not block the fling path.
4. No duplicate card is introduced by client queue corruption.
5. No card is skipped because of client state corruption.
6. No previously swiped card unexpectedly returns during the burst.
7. Gesture handling remains responsive.
8. No crash or freeze occurs.
9. Client action ordering reconciles correctly with NAS/server state.
10. Ordinary network latency does not stop the swipe UI.
11. No obviously abnormal sustained memory growth is observed across repeated bursts if memory data is already available.

### Performance interpretation

Do **not** invent an arbitrary millisecond SLA before measuring the physical device. Capture actual timing and user-visible stalls first. The acceptance question is whether the swipe path remains perceptibly immediate at realistic human swipe speed while preserving correctness.

## Fail / stop conditions

If any of the following is reproducible, stop after capturing enough evidence to reproduce it:

- blank/loading interruption between ordinary swipes;
- duplicate card;
- skipped card;
- stale card returning unexpectedly;
- queue-order or server-reconciliation mismatch;
- gesture lock;
- app freeze or crash;
- reproducible portrait-loading stall that blocks transition;
- tests or TypeScript baseline regresses.

Return the failure evidence to the Main Agent. **Do not redesign the queue independently.** The Main Agent will assign at most one corrective slice after reviewing evidence.

## Allowed files

This task is primarily observational. Committed changes are limited to:

- `.agent-memory/CURRENT.md`
- `.agent-memory/tasks/2026-08-24-physical-15-card-burst.md`
- a new task-specific handoff / evidence record under `.agent-memory/`
- existing non-product test/evidence artifacts only if already part of the repository's normal verification workflow

If additional implementation instrumentation appears necessary, stop and ask the Main Agent before editing product code.

## Forbidden files / scope

Do not change in this slice:

- discovery ranking or eligibility policy;
- swipe quotas / economics;
- `apps/swipe/lib/swipeDeck.ts` behavior;
- discovery screen product behavior;
- optimistic queue architecture;
- NAS schema or control-plane design;
- match/chat features;
- photo transport or onboarding;
- App Store metadata, submission, or Build 12 state;
- unrelated UI polish;
- production deployment.

Do not merge PR 11 as part of this task.

## Required handoff

On completion, create a task-specific handoff in `.agent-memory/` containing:

- repository / branch / commit tested;
- exact verification commands and results;
- device and runtime information;
- results of burst 1 and burst 2;
- card-order / reconciliation evidence;
- every observed defect or `none observed`;
- owner/device manual result as evidence, not as self-acceptance;
- recommended next action: `architect_review`.

Set the implementation packet to `ready_for_review`. Gemini / Antigravity / Cursor must not mark the task `accepted`.

## Release-track note

App Store Build 12 may remain in Apple review in parallel. Do not spend this slice changing store submission state simply because Apple has not acted yet. A new dating-core feature is not authorized until this physical-device verification returns to the Main Agent.
