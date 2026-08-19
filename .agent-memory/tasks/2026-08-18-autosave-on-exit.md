# Autosave on field exit

- **ID:** 2026-08-18-autosave-on-exit
- **Status:** ready_for_review
- **Architect:** Codex / GPT Main (owner instruction)
- **Implementer:** Cursor IDE Agent
- **Owner:** 2026-08-18 19:24 ET — never require Save; persist when an input is changed and then exited.

## What

Profile and Settings persist when a field is left. Save buttons are gone.

- Text: `onEndEditing` / `onBlur`
- Choice sheets: persist on close
- Distance slider: persist on thumb release
- Leaving the screen still persists a dirty draft
- Chat compose and report notes are not auto-sent

## Files changed

- `apps/swipe/app/profile.tsx`
- `apps/swipe/app/filters.tsx`
- `apps/swipe/components/ChoiceSheet.tsx`
- `apps/swipe/components/DistanceSlider.tsx`
- `apps/swipe/lib/autosave.ts`
- `apps/swipe/lib/autosave.test.ts`
- `apps/swipe/package.json`
- `.agent-memory/CURRENT.md`
- `.agent-memory/tasks/2026-08-18-autosave-on-exit.md`

## Validation

```text
cd apps/swipe && npx tsc --noEmit && npm test
# tests 69, pass 69
```

Do not self-accept.
