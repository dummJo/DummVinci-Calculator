# PTTS Praxis — Agent & LLM Collaboration Guide

> **Naming:** product = **PTTS Praxis**; trademark/attribution = **by DummVinci** (never remove). Full rules in [BRAND.md](./BRAND.md).

<!-- BEGIN:nextjs-agent-rules -->
## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

> **DummVinci** is positioned at multinational-consultant level.  
> All AI contributions must meet that standard — no placeholder logic, no intern-grade output.

---

## Model Roster & Task Assignment

Route tasks to the right model by specialty:

| Task Type | Primary Model | Fallback |
| --- | --- | --- |
| Engineering formula validation (IEC / ABB / STAHL) | **claude-opus-4-7** | chatgpt-oss |
| UI/UX components, Next.js App Router pages | **claude-sonnet-4-6** | chatgpt-oss |
| Bulk catalog JSON generation (product tables) | **claude-haiku-4-5** | gemini-flash |
| Advanced Context / Mass Refactoring (1M+ tokens) | **gemini-pro** | claude-sonnet-4-6 |
| Code review, security, type safety | **claude-opus-4-7** | chatgpt-oss |
| SEO metadata, copy, i18n strings | **gemini-pro** | claude-sonnet-4-6 |
| Rapid scaffolding / boilerplate | **chatgpt-oss** | claude-haiku-4-5 |
| Architecture decisions, cross-domain reasoning | **claude-opus-4-7** | gemini-pro |

---

## Project Structure Quick Reference

```text
app/                              ← App Router; route groups keep GitHub tidy (URLs unchanged)
  layout.tsx, globals.css
  (home)/page.tsx                 ← Landing `/`
  (tools)/                        ← All feature routes live here
    cable/page.tsx                ← IEC 60364-5-52 / PUIL
    vsd/page.tsx                  ← ABB ACQ580 & ACS880 + airflow
    breaker/page.tsx              ← Siemens 3VA / 5SL / 5SY
    busbar/page.tsx               ← DIN 43671 busbar sizing
    unified/                      ← Fast sizing orchestrator
    starter/                      ← Motor starter (Siemens SIRIUS)
    plc/                          ← PLC I/O sizing (S7-1200/1500)
    pid/                          ← PID loop simulator
    braking-resistor/             ← STAHL / ABB ACS880 BR
    panel/, panel-layout/         ← Panel & enclosure sizing (IEC 61439)
    convert/                      ← Unit converter hub
    tutorials/                    ← Field test guides
    abb-support/                  ← ABB documentation hub
    abb-drivecare/                ← ABB DriveCare service tool
    icc/                          ← Short-circuit calculation
    selectivity/                  ← Breaker discrimination (IEC 60947-2)
    transformer/                  ← Distribution transformer sizing (IEC 60076)
    skf-microlog/                 ← Vibration analysis learning suite
    game/                         ← Break Room (2048, Snake, Tetris, Minesweeper, Solitaire)

components/
  calc/                     ← FieldNumber, FieldSelect, FieldToggle, ResultCard, CalcShell, AuditFooter
  nav/                      ← TopBar (logo + trademark), BottomTabBar (mobile sticky)
  share/                    ← ShareButton, SharedWatermark

lib/calc/                   ← Pure TS calc functions — no side effects, fully testable
data/                       ← Static JSON product catalogs (ABB, Siemens, STAHL, enclosures)
standards/                  ← AI engineering & progress standards (AI_ENGINEERING.md, AI_PROGRESS_STANDARDS.md)
```

---

## Engineering Standards Enforced

| Domain | Standard / Source |
| --- | --- |
| Cable ampacity | IEC 60364-5-52 Table B.52.4, PUIL 2011 (Indonesia) |
| ABB drive catalog | ACQ580 HW Manual 3AUA0000099584, ACS880 HW Manual 3AUA0000078093 |
| MCCB/MCB selection | IEC 60947-2 (MCCB), IEC 60898 (MCB) — Siemens European series |
| Busbar sizing | DIN 43671, IEC 61439-1 Annex N |
| Braking resistor | STAHL CraneSystems BR catalog, ABB ACS880 BR wiring guide |
| Panel / enclosure | IEC 60890, IEC 61439, Rittal TS 8 catalog, XLTC standard |
| Cable brands | Supreme (Indonesia), Jembo (Indonesia) — NYY / NYFGbY / N2XSY |

**Never fabricate catalog data.** If a part number is uncertain, mark it `*` and add a source note.

---

## Agent Grouping Patterns

### Pattern 1 — Parallel Feature Build

When adding a new calculator, launch 3 agents simultaneously:

```text
Agent A (Opus)   → Engineering logic in lib/calc/new-feature.ts
Agent B (Sonnet) → UI page in app/(tools)/new-feature/page.tsx
Agent C (Haiku)  → Seed JSON in data/new-feature.json
```

### Pattern 2 — Review Chain

After any significant change:

```text
Agent 1 (Haiku)  → Type-check lib/calc/*.ts, report any TS errors
Agent 2 (Sonnet) → Visual review: does ResultCard show all key outputs with correct accent rows?
Agent 3 (Opus)   → Engineering review: formulas vs. IEC/ABB/STAHL standard
```

### Pattern 3 — Catalog Expansion

When adding new product families (e.g., 690V drives, new Siemens MCCB frame):

```text
Agent A (Haiku)  → Generate raw JSON entries from datasheet values
Agent B (Opus)   → Cross-validate 3 entries against known reference values
Agent C (Sonnet) → Update FieldSelect options in affected pages
```

---

## Advanced Orchestration & Subagent Protocol

To maximize productivity and utilize the full spectrum of available models (Gemini Pro, ChatGPT-OSS, Opus, Sonnet, Haiku), the Orchestrator AI (Primary Agent) must strictly follow these advanced collaboration techniques:

### 1. The Orchestrator Role (You)

As the primary agent, your job is **Orchestration**, not just coding. Break down complex user requests into parallel tracks. If the user requests a new calculator + UI + research, **do not execute them sequentially**.

### 2. Multi-Model Delegation & Subagents

Whenever possible, utilize specific tools and subagents to offload context-heavy tasks:

- **`browser_subagent` (Web & Research)**: If a task requires fetching live ABB datasheets, scraping IEC standards, or doing competitive UI/UX research, spawn a `browser_subagent`. Give it a highly detailed `Task` prompt to ensure it fetches the exact engineering data needed.
- **`code-review-graph` (Architecture)**: **NEVER** use standard `grep` for complex architecture tracing. ALWAYS use the `code-review-graph` MCP tools (`get_impact_radius`, `query_graph`) to let the graph model analyze the blast radius before refactoring.
- **`generate_image` (UI/UX Mockups)**: If the user requests a new dashboard layout, use the `generate_image` tool to spawn an image generation model to create a visual mockup *before* writing the CSS.

### 3. Asynchronous & Parallel Execution

- When running long terminal commands (e.g., `npm run build` or `npm run lint` via `run_command` sent to background), **DO NOT WAIT IDLY**. Immediately use `command_status` in parallel with other tool calls (like writing documentation or updating `i18n.ts`).
- Bundle multiple `multi_replace_file_content` calls together if modifying loosely coupled files (e.g., updating UI components and localized strings simultaneously).

### 4. Tool Prioritization Rules

To prevent context overflow and save tokens across models:

- **Use Specific Tools**: `grep_search` instead of `grep` in bash. `replace_file_content` instead of `sed`. `view_file` instead of `cat`.
- **Minimize Read Radius**: Do not read a 1000-line file if you only need the imports. Use targeted `StartLine` and `EndLine`.

---

## Code Quality Non-Negotiables

- **No magic numbers** — every constant must trace to a standard (cite in short inline comment)
- **No `any` types** — use interfaces exported from `lib/calc/*.ts`
- **No placeholder part codes** — show real code or explain why lookup failed
- **Mobile-first always** — verify layout at 390 px viewport width before marking done
- **Trademark on every page** — footer: `"By DummVinci · PTTS Praxis"`
- **Traceable Work Logs** — every agent-generated walkthrough (`walkthrough.md`), handoff document, or task summary must strictly include:
  - **Timestamp Before**: Starting date & time (local time format).
  - **Timestamp After**: Completion date & time.
  - **Execution Duration**: Total duration of work (e.g. in minutes or seconds).
  - **Progress Category**: Must align with one or more categories defined in `standards/AI_PROGRESS_STANDARDS.md` (e.g., Documentation, Code Quality).

---

## Local Dev Note

```bash
npm run dev          # webpack (Turbopack disabled — path contains # which breaks URL parsing)
npm run build        # runs on Vercel Linux env; local build fails on Windows with # in path
```

Push to GitHub → Vercel handles production builds cleanly.

---

## Brand Identity

> *"By DummVinci"* — appears on every page, every export, every shared link.

PTTS Praxis is an engineering suite **by DummVinci**, ABB Value Partner.  
Presales standard tool for VSD, cable, protection, and panel sizing across Indonesia and Southeast Asia.
