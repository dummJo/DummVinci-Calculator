# PTTS Praxis — Engineering Suite

> Professional, high-fidelity engineering calculator and industrial panel estimator.  
> **PTTS Praxis** · by DummVinci · Engineered by [dummjo.dev](https://dummjo.dev)
>
> Product name **PTTS Praxis** · trademark/attribution **by DummVinci** — see [BRAND.md](./BRAND.md).

---

## 🤝 Special Thanks & Supported By

**This project is proudly supported by [PT Prima Tekindo Tirta Sejahtera (PTTS)](https://www.ptts.co.id/).**

We extend our deepest gratitude to PTTS for their continued support, domain expertise, and collaboration in making this industrial engineering tool a reality. Their commitment to excellence in the automation and electrical sector has been instrumental in shaping the precision sizing logic, drive configurations, and panel layout libraries found within this application.

*Terima kasih atas dukungannya, PTTS!*

---

## Stack

| Layer | Tech |
| --- | --- |
| Framework | Next.js (App Router) |
| Styling | CSS Variables & React Inline Styles |
| Language | TypeScript |
| Engine | Pure TS Engineering Algorithms |
| Repo | `dummJo/DummVinci-Calculator` |

---

## Structure

```text
📦 DummVinci-Calculator
│
├── 🗂️  app/                         # Next.js App Router
│   ├── layout.tsx, globals.css      # Root shell + theme
│   ├── (home)/page.tsx              # Landing `/` (route group — URL unchanged)
│   └── (tools)/                     # All calculator & utility routes (URLs unchanged)
│       ├── cable/, vsd/, breaker/, busbar/, unified/, starter/
│       ├── panel/, panel-layout/, plc/, pid/, braking-resistor/
│       ├── convert/, tutorials/, abb-support/
│
├── 🧩  components/                  # UI (calc fields, nav, chrome)
├── 📚  lib/calc/                    # Pure TS engineering logic
├── 📦  data/                        # JSON catalogs (ABB, Siemens, STAHL, enclosures)
├── 📐  standards/                   # Internal engineering notes for AI/agents
└── 📋  CHANGELOG.md
```

---

## Dev

```bash
npm install
npm run dev        # http://localhost:3000
npm run build
npm run lint
```

---

## Deploy

Push to `main` → auto-deploy to Vercel.
