# Live Introductions — Wireframe Agent Brief

**Status:** AGENT INPUT ONLY · WIREFRAME RESEARCH  
**Audience:** UX designer AI agents producing screen-by-screen wireframes  
**Study materials:** SYNTHETIC / FICTIONAL  
**Real-user pilot:** BLOCKED  
**Updated:** 2026-07-24

## How to use this document

1. Treat [`docs/product/live-introductions-ux.md`](live-introductions-ux.md) as the **immutable normative source** for every screen’s nine fields, copy strings, privacy rules, and terminal routing.
2. Use **this brief** as the operating contract: draw order, shell inheritance, glossary, anti-patterns, designer cues, and acceptance checks.
3. For each frame ID, produce a wireframe that implements the nine fields in the UX document **exactly**. Do not invent product behavior, notifications, APIs, or missing screens.
4. If a needed decision is absent from both documents, label it **Unresolved — human product/safety/privacy decision required** and stop. Do not guess.

This brief does **not** authorize recruitment, live sessions, recording, real-user pilots, beta, or production.

---

## Binding constraints (do not renegotiate)

| Constraint | Rule |
|---|---|
| Cohort (first study) | Featured live participant = verified adult **man**. Viewers = adult **women seeking men**. Facilitator = independent (**Mara**). |
| Room | Invite-only **Introduction Circle**: 1 featured man + 1 independent facilitator + **≤6 viewers**; fixed **12 minutes**; no extension; no late entry after start. |
| Fictional cast | **Elias, 29** — library-program coordinator; radios; sourdough. **Mara** — independent facilitator. |
| Spark | Viewer-only **sealed** interest action. Not a match. Not contact permission. Not visible to Elias, Mara, or other viewers. |
| Reciprocal interest | Mutual outcome only: sealed spark **and** Elias’s independent ordinary discovery interest. Never label attendance or one-sided interest as reciprocal. |
| V12 path | Only **C06 → V11 (normal)** may expose **V12**. C07 / C08 / S01 suppress Live-derived continuation from that circle. |
| Adult gate | Fail closed when eligibility cannot be established. |
| Location | No exact location, distance, proximity alerts, meeting pins, maps, or calendar exchange. |
| Safety | Block, report, age, hide, and leave are never paywalled. |
| Markers | Every frame shows **Synthetic study · fictional people only** (or equivalent persistent synthetic banner). |

---

## Glossary (use these words only)

| Term | Meaning |
|---|---|
| **Live Introductions** | Feature family |
| **Introduction Circle** | One scheduled finite room |
| **Spark** | Viewer’s sealed private interest action |
| **Reciprocal interest** | Mutual private outcome after independent choices |
| **Leave quietly** | Immediate private viewer exit; no social penalty |
| **Hide Live Introductions (S03)** | Feature-local hide; not the app-wide Emergency privacy control |
| **C06** | Healthy normal completion at fixed end |
| **C07** | Mara-confirmed safety termination only |
| **C08** | Known-neutral automatic closure |
| **S01** | Fail-closed integrity / unconfirmed-safety closure |
| **Lightly romantic** | Viewer-local helper wording only; never shared room atmosphere |

---

## Global shell every frame inherits

### Persistent chrome

- Top: **Live Introductions** · synthetic banner · current **role** · **Safety**
- In-circle header (when relevant): **Elias · featured participant** · **Mara · independent facilitator** · **Fixed 12-minute pilot** · **Invite only · six-viewer maximum** · scheduled end time (**not** a scarcity countdown)
- Viewer room: sticky **Leave quietly** + Safety drawer (**Block Elias**, **Report a concern**, **Hide Live Introductions**, **How this room works**)
- After V01: retain **Withdraw preview consent**
- Featured room: **Ask to pause**, **End my participation**, **Safety**
- Facilitator: separate routine pacing from destructive **End room**; never place destroy next to acknowledge/complete

### Visual system

- Canvas flax `#F3EFE7`, surfaces oat `#FBF8F2`, text charcoal `#292723` / stone `#68635C`
- Selected oxidized plum `#7C5368`, supportive moss `#536A5B`, caution ochre `#94672A`, destructive brick `#9C463E`
- No gender color coding; no black-room neon; no glossy skin gradients
- System serif for titles/names; system sans for body/controls
- Signature element: editorial **conversation / prompt cards** with a small topic tab — playfulness from specificity, not hearts/flames/confetti

### Breakpoints and targets

- Compose for **390 / 768 / 1440**
- Interactive targets ≥ **44×44**
- Visible `:focus-visible`; honor reduced motion
- One clear page title (h1); logical heading order

### Capture honesty (repeat where Safety appears)

**This concept does not record, but it cannot prevent or erase operating-system screenshots, operating-system screen recordings, or another device filming the screen.**

---

## Evidence sequence (layout hierarchy, not a funnel)

1. **Trust / safety / privacy / autonomy** before attraction
2. **Responsiveness and intimacy** cues second
3. **Optional viewer-local romantic wording** third
4. **Safe meeting transition** last — never auto-scheduled

On V01–V06, safety/roles/duration/exit and **What does not happen** occupy the upper half. Portraits and chemistry never lead.

---

## Per-screen wireframe schema (required output)

For **every** frame ID, output a wireframe annotation with **exactly these nine labels in this order**, filled from the UX document:

1. **Purpose**
2. **Visual hierarchy**
3. **Layout zones**
4. **Primary action**
5. **Secondary actions**
6. **Motion / haptics**
7. **Accessibility**
8. **Privacy state**
9. **Failure / exit states**

Also annotate on the artboard:

- Incoming / outgoing transitions (state IDs only)
- Terminal class if post-room: `C06 | C07 | C08 | S01 | silent exit`
- Consent scope: what this screen does **not** grant
- Synthetic banner visible

Preserve every **bold** action/status string from the UX document. Especially:

- **Choosing not to continue is a complete outcome**
- **Leave quietly**
- **Camera off** / **Microphone off** / **Other viewers cannot see you**
- **Verification does not guarantee identity truth, compatibility, conduct, or safety**
- **A spark is an interest signal, not a match or permission to contact you**
- **Reciprocal interest confirmed** / **Nothing opens automatically**
- **Reciprocal interest is not consent to meet**
- **No meeting is scheduled, and this readiness state shared no structured location**
- **Meeting readiness is no longer mutual**

---

## Screen catalog (39 frames)

One-line purpose only. Expand from [`live-introductions-ux.md`](live-introductions-ux.md).

### Viewer · V01–V19 (+ V08A)

| ID | Purpose |
|---|---|
| **V01** | Research invitation and consent; preview withdrawal available |
| **V02** | Adult eligibility gate; fail closed |
| **V03** | Reusable cue, pacing, and tone defaults (not join consent) |
| **V04** | Curated scheduled circles; finite invitations, not a live feed |
| **V05** | Session detail for one circle |
| **V06** | Pre-room briefing and scoped join + external-capture disclosure |
| **V07** | Private lobby; independent arm for disclosed start |
| **V08** | Live room — viewer view (camera/mic off) |
| **V08A** | Optional private safety clarification overlay |
| **V09** | Private topic choice (no tallies) |
| **V10** | Anonymous question + one bounded facilitator-mediated follow-up |
| **V11** | Post-room private debrief; only C06 exposes spark path |
| **V12** | Private spark choice (three equal outcomes) |
| **V13** | Sealed spark + optional delayed/mixed profile eligibility |
| **V14** | Reciprocal-interest outcome; nothing opens automatically |
| **V15** | No reciprocal interest; neutral close |
| **V16** | Separate text-connection permission |
| **V17** | Private asynchronous pair-only connection |
| **V18** | Private meeting-readiness choice |
| **V19** | Mutual meeting-readiness boundary / revalidation |

### Featured participant · F01–F08

| ID | Purpose |
|---|---|
| **F01** | Adult and identity verification status |
| **F02** | Policy and facilitation training + capture disclosure |
| **F03** | Rehearsal and media check |
| **F04** | Greenroom — roster-blind; no viewer presence |
| **F05** | Live room — featured view; Mara controls room |
| **F06** | Private post-session reflection |
| **F07** | Roster-blind standard discovery decision (**no Live provenance**) |
| **F08** | Standard reciprocal-interest connection choice (**no Live provenance**) |

### Independent facilitator · C01–C08

| ID | Purpose |
|---|---|
| **C01** | Assignment and run-of-show review |
| **C02** | Pre-room health; arm/disarm scheduled opening |
| **C03** | Live facilitation console; terminal precedence visible |
| **C04** | Private incident intake |
| **C05** | Facilitator pause |
| **C06** | Scheduled healthy completion closeout |
| **C07** | Facilitator-confirmed safety termination |
| **C08** | Neutral trigger closure |

### Cross-role safety · S01–S03

| ID | Purpose |
|---|---|
| **S01** | Fail-closed integrity closure |
| **S02** | Synthetic report preview — nothing actually sent |
| **S03** | Hide Live Introductions until deliberate re-entry |

---

## Draw order (produce in this sequence)

### Phase 1 — Viewer trust + happy path (highest leverage)

`V01 → V02 → V03 → V04 → V05 → V06 → V07 → V08 → V09 → V10 → C06 → V11 → V12 → V13 → V14 → V16 → V17 → V18 → V19`

### Phase 2 — Same-session safety overlays

`V08A`, `C05`, global Safety drawer, `S03`

### Phase 3 — Terminals and no-outcome

`C07`, `C08`, `S01` → matching **V11** variants → `V15`

### Phase 4 — Featured participant

`F01 → F02 → F03 → F04 → F05 → F06 → F07 → F08`

### Phase 5 — Facilitator path

`C01 → C02 → C03 → C04 → C05 → C06 / C07 / C08`

### Phase 6 — Cross-role + required variants

`S02` (preview + nothing-sent), invitation post-start boundaries, reconnect / low bandwidth, reduced motion, keyboard-only, empty/loading V04

---

## Live-room composition (V08 / F05 / C03)

Six-segment strip; current segment = quiet **Now** underline; times orient, do not pressure:

| Segment | Window |
|---|---|
| Welcome & boundaries | 0:00–1:30 |
| Human introduction | 1:30–3:00 |
| Prompt cards | 3:00–5:30 |
| Private topic + response | 5:30–7:30 |
| Anonymous Q + optional follow-up | 7:30–10:45 |
| Close & exit | 10:45–12:00 |

**Cut order when behind:** optional follow-up → topic elaboration → compact/skip prompt. **Never cut** welcome/boundaries, accessibility announcements, safety pause, or close/exit. End never moves.

**Fixed-end precedence:** Mara-confirmed **C07** → unconfirmed/integrity **S01** → known-neutral **C08** → healthy **C06**.

---

## Role visibility matrix (privacy diagram)

| Signal | Viewer | Elias | Mara | Operators |
|---|---|---|---|---|
| Own Mara-only pseudonym | own only | never | session-needed only | no ordinary profiles |
| Viewer roster / count / presence | no other viewers | **never** | min room status only | no ordinary content |
| Incoming spark | own sealed | **never** | **never** | **never** |
| Selected topic / paraphrased Q | shared content may imply ≥1 viewer participated | sees content, not author | mediates | no ordinary DMs/photos |
| Ordinary profile / photos / messages | ordinary app rules | F07 standard discovery only | **never** | **never** |
| Report author identity to Elias | — | **never** | — | — |

F07 / F08 must contain **no** Live Introductions branding, Mara, circle schedule, spark provenance, or viewer context.

---

## Hard anti-patterns (do not invent)

- TikTok Live / mass feed / gifts / tips / reactions / hearts / watch-time / popularity / scarcity countdown / “top host”
- Covert arousal inference, urgency to spark/match/meet, loss framing on leave, preselected consent
- >6 viewers, drop-in audience, viewer tiles/grid, public chat, viewer cam/mic/speaking
- Attendance → DM; spark → match; reciprocal interest → messages/meet/location; romantic tone → flirting consent
- Exact distance, proximity, meeting pins, maps, calendar/social/phone fields, “Meet now”
- Operator views of ordinary profiles, photos, DMs, sparks, reflections
- Paywalled block/report/hide/age
- In-app recording, clips, saved transcripts, or claims that screenshots are impossible
- Gender-coded pink/blue; “rate him,” “hot seat,” chemistry scores, body ranking
- Permanent product rule that only men may ever go live (this is a **study cohort variable**)
- Hidden transitions, fake “report sent,” operational case IDs, or unimplemented persistence

---

## Designer instructions from ethical evidence

1. **Trust before attraction** — upper half of pre-room frames = roles, privacy, duration, exit, what does not happen.
2. **Warm conversation folio** — not entertainment stage or scoreboard.
3. **Low comparison / low body surveillance** — one eye-level portrait; no beauty filters or leaderboards.
4. **Responsiveness over performance** — weight on Mara’s pacing and listening cues, not charisma meters.
5. **Agency as first-class UI** — declines equal weight to confirms; leave is never buried.
6. **Romantic layer is viewer-local only** — no ambient shared “mood,” autoplay audio, or room-wide romantic atmosphere.
7. **Feeling desired without objectification** — specific appreciation of topic/answer, never body appraisal.
8. **Novelty in conversation; stability in safety** — prompt cards may rotate; Leave / Block / Report / consent strings stay fixed.
9. **Private unscored reflection** — no score rings, sad mascots, or inferred interest from sliders.
10. **Meeting readiness as calm checkpoint** — reciprocal interest ≠ meet; owner-only expiry; free-text warning visible; uniform neutral closure.

---

## Required variants checklist

Draw separate frames or clearly labeled variants for:

- Preview entered / withdrawn; adult unknown / checking / established / ineligible / unavailable
- Invitation scheduled / cancelled / **Entry window closed** / personal eligibility failure / loading / empty
- Lobby not armed / armed / withdrawn / disconnected / excluded / no late entry
- Room live / reconnecting / low bandwidth / paused
- Terminals C06 / C07 / C08 / S01 with matching V11 / F06 closeouts
- Spark / eligibility / text-permission / meeting-readiness expiry lines (exact date-time placeholders; no scarcity)
- S02 preview + nothing-sent confirmation
- Reduced motion; keyboard / screen-reader focus; 200% zoom safety still reachable

---

## Acceptance check (every frame)

- [ ] Synthetic banner visible
- [ ] Nine fields annotated from the UX source
- [ ] Bold copy strings preserved exactly
- [ ] Role visibility matches the matrix
- [ ] Terminal class correct; V12 only after C06→V11
- [ ] No anti-pattern UI from this brief
- [ ] Safety / leave reachable without paywall
- [ ] F07/F08 have zero Live provenance if those frames
- [ ] Unresolved items labeled, not invented
- [ ] Output remains wireframe-only and fictional

---

## Sources

- Normative UX: [`docs/product/live-introductions-ux.md`](live-introductions-ux.md)
- Ethics basis: `Research/Ethical Design Principles for Digital Environments That Support Desire for Meeting Men Online in Adult Women.md`
- Governance: `MISSION.md`, `docs/governance/release-gates.md`, `policies/community-rules.md`

## REAL-USER PILOT BLOCKER

Do not depict real people, real messages, sent reports, operational safety cases, recording, deployment, beta access, or completed approvals. Until release gates pass with authentic human evidence, all outputs remain **synthetic/fictional wireframe research only**.
