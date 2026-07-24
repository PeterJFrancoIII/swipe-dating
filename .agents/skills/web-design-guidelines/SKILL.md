---
name: web-design-guidelines
description: Review this project's server-rendered web UI for its approved accessibility, interaction, responsive-layout, and copy rules.
license: Complete terms in LICENSE.txt
metadata:
  author: vercel
  version: "1.0.0"
  source: "vercel-labs/agent-skills"
  wrapper-revision: "4559f18a20c1691c744b4395194290db6a0df5e9"
  source-revision: "4e799d45c17aec1498c269287a83b9dba22b966b"
  project-adaptation: "Swipe Dating synthetic Python web UI"
  argument-hint: <file-or-pattern>
---

# Project Web Interface Guidelines

This is a reviewed, self-contained subset of the MIT-licensed Vercel Web Interface Guidelines at
revision `4e799d45c17aec1498c269287a83b9dba22b966b`. It is intentionally scoped to the local
FastAPI/Jinja app. Repository mission, governance, and user-approved visual direction always win.

## Allowed review scope

Review only:

- semantic HTML and heading order;
- form labels, input types, names, autocomplete, and actionable error text;
- visible keyboard focus and keyboard-operable native controls;
- skip navigation, current-page semantics, live status semantics, and decorative accessibility;
- touch targets, hover/active states, safe responsive layout, and horizontal overflow;
- reduced motion and explicit transition properties;
- readable hierarchy, plain active copy, empty-state direction, and long-content resilience;
- truthful synthetic/R&D boundaries.

Do not recommend React, client-side state, hydration work, UI frameworks, CDNs, web fonts, analytics,
new dependencies, dark mode, production services, or product behavior. Do not reinterpret the
adult-only, privacy, moderation, or release policies.

## Rules

- Prefer native elements (`button`, `a`, `label`, `input`, `select`) before ARIA.
- Every form control needs a visible label or an explicit accessible name.
- Use buttons for actions and links for navigation.
- Preserve browser zoom; never block paste.
- Provide a visible `:focus-visible` treatment and never remove outlines without replacement.
- Include a skip link and one clear page-level heading.
- Mark the active navigation link with `aria-current="page"`.
- Use `role="alert"` for errors and polite live status for successful updates.
- Use the correct input type, meaningful name, and appropriate autocomplete value.
- Error messages state what happened and what the user can do next.
- Keep primary actions visually distinct from secondary and cautionary actions.
- Keep interactive targets at least 44 by 44 CSS pixels where practical.
- Use flex/grid for layout; verify 390, 768, and 1440 pixel viewports without horizontal overflow.
- Use `overflow-wrap` or equivalent for long identifiers and user-provided text.
- Animate only `transform` and `opacity`; never use `transition: all`.
- Honor `prefers-reduced-motion`.
- Use system fonts and avoid layout shifts from remote assets.
- Keep headings concise and balanced; use sentence case to match this project's voice.
- Make hover, active, and focus states more prominent than rest states.
- Keep synthetic-only and no-real-user limitations visible and accurate.

## Review process

1. Read the requested templates and CSS.
2. Check only the allowed scope and rules above.
3. Report actionable findings as `path:line - issue`.
4. Mark files with no findings as `pass`.
