# Profile text field titles

- **ID:** 2026-08-18-profile-field-titles
- **Status:** ready_for_review
- **Architect:** Codex / GPT Main
- **Implementer:** Cursor IDE Agent
- **Owner:** 2026-08-18 18:21 ET — add titles to edit-profile text fields.
- **Do not self-accept.**
- **GitHub:** https://github.com/PeterJFrancoIII/swipe-dating/blob/review/photo-upload/.agent-memory/tasks/2026-08-18-profile-field-titles.md

## What

Profile settings text entries only had placeholders. After a name is typed, the field looks unlabeled. Add visible titles above Display name, City or region, and About you.

## Files

- `apps/swipe/app/profile.tsx`
- this packet, `.agent-memory/CURRENT.md`

## Validation

```text
cd apps/swipe && npx tsc --noEmit
# tsc exit 0
```
