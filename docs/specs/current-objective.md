# Current objective — bilateral Deepen Connection R&D slice

**Status:** ACTIVE  
**Branch:** `agent/deepen-connection`  
**Real users:** Prohibited

## Objective

Build a complete synthetic JavaScript relationship-phase transition inside an active match: casual by default, mutually deepened only after two explicit opt-ins, reversible by either side, and automatically cleared when the match ends.

The direction comes from the user-provided casual-first, relationship-capable research, which recommends a mutual “Deepen Connection” mode that unlocks deeper prompts over time. The research remains product-design input rather than independently verified evidence.

## Deliverables

- shared `@swipe/rnd-relationship-phases` package;
- casual/deepened/ended phase model per match;
- local and synthetic counterpart request paths;
- explicit accept/decline behavior in either request order;
- pending-request withdrawal;
- one-party return to casual;
- bounded allowlist of communication, goals, availability, values, and boundary prompts;
- session-only prompt answers with save and clear controls;
- automatic prompt clearing on return to casual, unmatch, or block;
- ended-phase rejection of future transition attempts;
- no automatic phase inference from messages, time, sexual activity, location, meetings, purchases, or models;
- no public-profile or discovery-intent mutation;
- storage regression tests for requests, phase state, and answers;
- mobile Deepen Connection panel integrated into Matches;
- ADR, mission, architecture, privacy, release, beta, ownership, agent, and CI updates.

## Acceptance commands

```bash
nvm use
npm install --ignore-scripts
npm run check
npm run mobile:export:web
```

## Required outcomes

- one-sided request remains casual;
- two explicit requests/acceptances enter deepened;
- candidate-first and local-first ordering both work;
- decline resets requests without retaining a reason;
- pending request can be withdrawn;
- deeper prompts are unavailable before mutual acceptance;
- only allowlisted prompts accept answers up to 300 characters;
- answers can be cleared individually;
- either participant can return to casual and clear all deeper answers;
- unmatch or block ends the phase and clears answers;
- ended phases reject further requests;
- Deepen Connection never implies consent to sex, exclusivity, media, location, health disclosure, or meeting;
- phase state does not affect rank, reach, monetization, safety access, or public profiles;
- phase requests, answers, and timestamps remain absent from AsyncStorage;
- Expo web export remains green;
- production preflight remains blocked.

## Explicitly deferred

- real counterpart consent or signed transition requests;
- encrypted local custody or E2EE sharing of prompt answers;
- push notifications and multi-device synchronization;
- relationship counseling, mental-health assessment, or compatibility prediction;
- health, trauma, finance, fertility, immigration, identity-document, or precise-location prompts;
- automatic relationship inference from behavior or content;
- real analytics, retention experiments, or engagement nudges;
- real accounts, authenticated matching, E2EE messaging, reports, moderation, or production deployment.

## Release state

```text
JAVASCRIPT_RND_SYNTHETIC_ONLY
REAL_USER_CLOSED_BETA_BLOCKED
PRODUCTION_BLOCKED_HUMAN_APPROVALS_REQUIRED
```
