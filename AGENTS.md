<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# DummVinci Calculator — Agent & LLM Collaboration Guide

> **DummVinci** is positioned at multinational-consultant level.  
> All AI contributions must meet that standard — no placeholder logic, no intern-grade output.

---

## Model Roster & Task Assignment

Route tasks to the right model by specialty:

| Task Type | Primary Model | Fallback |
|---|---|---|
| Engineering formula validation (IEC / ABB / STAHL) | **claude-opus-4-7** | claude-sonnet-4-6 |
| UI/UX components, Next.js App Router pages | **claude-sonnet-4-6** | claude-haiku-4-5 |
| Bulk catalog JSON generation (product tables) | **claude-haiku-4-5** | gemini-flash |
| Code review, security, type safety | **claude-opus-4-7** | — |
| SEO metadata, copy, i18n strings | **gemini-pro** | claude-sonnet-4-6 |
| Rapid scaffolding / boilerplate | **claude-haiku-4-5** | gemini-flash |
| Architecture decisions, cross-domain reasoning | **claude-opus-4-7** | — |

---

## Project Structure Quick Reference

```
app/                        ← Next.js App Router pages (all "use client")
  cable/page.tsx            ← Cable sizing: IEC 60364-5-52 / PUIL
  vsd/page.tsx              ← ABB ACQ580 & ACS880 + panel airflow
  breaker/page.tsx          ← Siemens 3VA / 5SL / 5SY MCCB/MCB
  busbar/page.tsx           ← Cu/Al flat bar sizing
  braking-resistor/         ← STAHL crane BR sizing for ACS880
  panel/page.tsx            ← XLTC / Rittal + fan/filter/AC BTU

components/
  calc/                     ← FieldNumber, FieldSelect, FieldToggle, ResultCard, CalcShell
  nav/                      ← TopBar (logo + trademark), BottomTabBar (mobile sticky, 7 tabs)

lib/calc/                   ← Pure TS calc functions — no side effects, fully testable
data/                       ← Static JSON product catalogs (ABB, Siemens, STAHL, enclosures)
```

---

## Engineering Standards Enforced

| Domain | Standard / Source |
|---|---|
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

```
Agent A (Opus)   → Engineering logic in lib/calc/new-feature.ts
Agent B (Sonnet) → UI page in app/new-feature/page.tsx
Agent C (Haiku)  → Seed JSON in data/new-feature.json
```

### Pattern 2 — Review Chain
After any significant change:

```
Agent 1 (Haiku)  → Type-check lib/calc/*.ts, report any TS errors
Agent 2 (Sonnet) → Visual review: does ResultCard show all key outputs with correct accent rows?
Agent 3 (Opus)   → Engineering review: formulas vs. IEC/ABB/STAHL standard
```

### Pattern 3 — Catalog Expansion
When adding new product families (e.g., 690V drives, new Siemens MCCB frame):

```
Agent A (Haiku)  → Generate raw JSON entries from datasheet values
Agent B (Opus)   → Cross-validate 3 entries against known reference values
Agent C (Sonnet) → Update FieldSelect options in affected pages
```

---

## Code Quality Non-Negotiables

- **No magic numbers** — every constant must trace to a standard (cite in short inline comment)
- **No `any` types** — use interfaces exported from `lib/calc/*.ts`
- **No placeholder part codes** — show real code or explain why lookup failed
- **Mobile-first always** — verify layout at 390 px viewport width before marking done
- **Trademark on every page** — footer: `"Engineered by dummJo · DummVinci Calculator"`

---

## Local Dev Note

```bash
npm run dev          # webpack (Turbopack disabled — path contains # which breaks URL parsing)
npm run build        # runs on Vercel Linux env; local build fails on Windows with # in path
```

Push to GitHub → Vercel handles production builds cleanly.

---

## Brand Identity

> *"Engineered by dummJo"* — appears on every page, every export, every shared link.

DummVinci Calculator is an internal tool brand of **dummJo Engineering & Consulting**, ABB Value Partner.  
Presales standard tool for VSD, cable, protection, and panel sizing across Indonesia and Southeast Asia.
