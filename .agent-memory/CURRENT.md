# Current task

- **Task:** 2026-08-16-photo-upload-handoff
- **Status:** ready_for_review
- **Authorization:** Owner 2026-08-17 17:22 ET — stop Cursor iteration; hand photo upload to GPT Main

## Review branches

- https://github.com/PeterJFrancoIII/swipe-dating/pull/11
- https://github.com/PeterJFrancoIII/swipe-dating-web/pull/2

## Owner stop (2026-08-17 17:22 ET)

Photo add is still not working in Expo Go. Owner asked for GPT review. Cursor stopped further transport changes. Full packet: `.agent-memory/tasks/2026-08-16-photo-upload-handoff.md`. Latest client path and packet are on public PR https://github.com/PeterJFrancoIII/swipe-dating/pull/11 (`review/photo-upload`). No access token is required.

Last owner-visible failure: **Uploading photos…** forever (Expo 57 `expo/fetch` + `File.bytes()` hang). On-disk path is now XHR + `{uri,name,type}`; **no live 200**, and XHR already failed once on 2026-08-16.

## Earlier follow-ups (do not treat as current plan)

- 2026-08-16 19:07 ET: photo POST **401**; JSON routes **200**; session header dropped.
- 2026-08-17: form `session` attach. NAS 72h photo POSTs: 5× **401**, 0× **200**.
- 2026-08-17 16:55 ET: **Unsupported FormDataPart Implementation**, then `File.upload` hang, then ArrayBuffer Blob reject.
- 2026-08-17 17:15 ET: XHR + 45s timeout written; Metro later aborted and restarted on 8082.
