# Agent Instructions (Beads)

Beads (`bd`) is the source of truth for work.

Rules:
- Always run `bd ready` before starting any task
- If work is missing, create an issue instead of writing plans
- Add blockers using `bd dep add <blocked> <blocker>`
- Update status while working: open → in_progress → closed
- Close issues with a short factual summary
- Prefer bd over markdown for task tracking
