## Beads-First Workflow (MANDATORY)
This project uses Beads (beads_viewer) as the source of truth for all planning and execution. Issues are stored in .beads/ and tracked in version control.

### Agent Rules (Required)
Before starting any work, an agent MUST:

Triage: Run bv --robot-triage to get a machine-readable project overview.

Select: Choose a task that is OPEN and has zero active blockers.

Identify: Explicitly state the Beads ID (e.g., ab-bi5) in the chat before taking action.

Scope: Limit work strictly to the technical requirements of that specific task.

### Prohibited Behavior
Agents MUST NOT:

Invent new tasks or sub-tasks outside of the Beads system.

Work on tasks marked as blocked.

Proceed with work without an associated Beads ID.

Ignore dependency relationships defined in the graph.

[!IMPORTANT] If no unblocked tasks exist, the agent must respond: "No unblocked Beads tasks available. Awaiting dependency resolution."

Agent Instructions (Beads)
### Essential Commands
Bash

# RECONNAISSANCE
bv --robot-triage     # Best for AI: Shows actionable work + dependency graph
bd ready              # List only tasks with no active blockers
bd show <id>          # View full details, history, and dependencies

# EXECUTION
bd create --title="..." --type=task --priority=2
bd update <id> --status=in_progress
bd dep add <blocked-id> <blocker-id>
bd close <id> --reason="Completed implementation of..."

# SYNCHRONIZATION
bd sync               # Commits and pushes .beads metadata changes
Reference Metadata
Priorities: 0 (Critical/Blocker), 1 (High), 2 (Medium), 3 (Low), 4 (Backlog).

Types: task, bug, feature, epic, question, docs.

Status: open → in_progress → closed.

### Session Protocol (End-of-Work Checklist)
Before ending a session, the agent must execute these steps in order to ensure code and task metadata stay in sync:

Sync Tasks: Run bd sync to commit Beads metadata changes.

Stage Code: git add . (include all relevant source files).

Commit Code: git commit -m "feat: [ID] description of work" (always include the Beads ID).

Final Push: git push to remote.