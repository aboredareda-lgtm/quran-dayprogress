# CLAUDE.md

@AGENTS.md

## Session brief (STATUS.md)

- **Session start:** read `STATUS.md` before anything else (the SessionStart hook prints it), then refresh its Git state from live `git status -sb`, `git log -5`, and open GitHub issues, because the snapshot in the file goes stale.
- **Session end:** update `STATUS.md`: Last session (date), Last changes, Remaining work, Git state (pushed? ahead/behind), Delivery state (last build/tag, delivered?), Blocked on client (what + since when), Open questions for client. Keep the fixed section headings.
- Track tasks as GitHub issues with labels `blocked:client`, `waiting:clarification`, `bug`, `feature`, `backend`, `frontend`, `infra`.
- This repo belongs to the client, so keep `STATUS.md` neutral and factual.
