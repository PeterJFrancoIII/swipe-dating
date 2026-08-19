# Task records

One Markdown file per task. Codex creates the assignment; Cursor updates implementation fields and status through `ready_for_review`; Codex alone marks `accepted`.

## Allowed statuses

`assigned` · `in_progress` · `blocked` · `ready_for_review` · `accepted`

## Template

```md
# Task title

- **ID:** YYYY-MM-DD-short-slug
- **Status:** assigned
- **Architect:** Codex
- **Implementer:** Cursor IDE Agent
- **Objective:** ...

## Allowed files
- ...

## Forbidden files
- ...

## Acceptance criteria
- ...

## Implementation summary
- ...

## Files changed
- ...

## Validation evidence
- ...

## Blockers / questions
- ...

## Architect review
- ...
```
