# AI Engineering Standards & Brand Identity

<!-- dv-harness:boot:start v0.1.0 -->
## Boot: load the hub first

This repo is part of the DummVinci ecosystem. The private hub repo `dummJo/dummvinci-md` is the single source for workstream status, working rules, the model roster, the MCP and plugin registry, and the repo registry.

Before the first task in a session:

1. Run skill `dv-boot` (plugin `dummvinci-harness@dummvinci`). Without the plugin, locate the hub (`$DUMMVINCI_MD`, `../dummvinci-md`, `~/dummvinci-md`; in a cloud session, attach `dummJo/dummvinci-md`) and read, in order: `CLAUDE.md`, `_harness/INIT.md`, `_harness/STATUS.yaml`, `_harness/REPOS.yaml`, `_harness/MODELS.md`, `_Global-Memory/PREFERENCES.md`, `_Global-Memory/FEEDBACK.md`, `_MCP/INDEX.md`.
2. Do not read the hub's `_Personal/` or pricing files from this repo, and never copy hub content into this repo's files, commits, PRs, or issues.
3. Multi-agent work: skill `dv-orchestrate`. Model choice: hub `_harness/MODELS.md`, never a model ID written in this repo. Status updates go to the hub's `_harness/STATUS.yaml`.

If the hub cannot be loaded, say so in the first reply and continue with local context only.
<!-- dv-harness:boot:end -->

**CRITICAL:** This project enforces strict AI progress standards, UI/UX brand identity, and engineering constraints.
Before taking any action, you MUST read and comply with:

1. `AGENTS.md` (Role, Identity, UI/UX Rules, Project Map)
2. `standards/AI_ENGINEERING.md` (Code Quality & Handoff Protocols)
3. `standards/AI_PROGRESS_STANDARDS.md` (Traceability formatting)

Every task completion MUST include the Traceability Stamp (Timestamp Before/After, Duration, Progress Category).

---

<!-- code-review-graph MCP tools -->
## MCP Tools: code-review-graph

**IMPORTANT: This project has a knowledge graph. ALWAYS use the
code-review-graph MCP tools BEFORE using Grep/Glob/Read to explore
the codebase.** The graph is faster, cheaper (fewer tokens), and gives
you structural context (callers, dependents, test coverage) that file
scanning cannot.

### When to use graph tools FIRST

- **Exploring code**: `semantic_search_nodes` or `query_graph` instead of Grep
- **Understanding impact**: `get_impact_radius` instead of manually tracing imports
- **Code review**: `detect_changes` + `get_review_context` instead of reading entire files
- **Finding relationships**: `query_graph` with callers_of/callees_of/imports_of/tests_for
- **Architecture questions**: `get_architecture_overview` + `list_communities`

Fall back to Grep/Glob/Read **only** when the graph doesn't cover what you need.

### Key Tools

| Tool | Use when |
| --- | --- |
| `detect_changes` | Reviewing code changes — gives risk-scored analysis |
| `get_review_context` | Need source snippets for review — token-efficient |
| `get_impact_radius` | Understanding blast radius of a change |
| `get_affected_flows` | Finding which execution paths are impacted |
| `query_graph` | Tracing callers, callees, imports, tests, dependencies |
| `semantic_search_nodes` | Finding functions/classes by name or keyword |
| `get_architecture_overview` | Understanding high-level codebase structure |
| `refactor_tool` | Planning renames, finding dead code |

### Workflow

1. The graph auto-updates on file changes (via hooks).
2. Use `detect_changes` for code review.
3. Use `get_affected_flows` to understand impact.
4. Use `query_graph` pattern="tests_for" to check coverage.
