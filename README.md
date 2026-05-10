# DummVinci Calculator

> Professional, high-fidelity engineering calculator and industrial panel estimator.  
> Engineered by [dummjo.dev](https://dummjo.dev)

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
├── 🗂️  app/                    # Next.js App Router (Calculators)
│   ├── 📄  cable/              # Cable Ampacity (IEC 60364-5-52)
│   ├── 📄  vsd/                # VSD/Drive Sizing (ABB ACQ580/ACS880)
│   ├── 📄  breaker/            # MCCB/MCB Protection
│   ├── 📄  panel-layout/       # 3D Industrial Panel Estimator
│   └── 📄  page.tsx            # Unified Calculator Dashboard
│
├── 🧩  components/             # UI Components
│   ├── 📁  calc/               # Engineering inputs & cards
│   └── 📁  nav/                # Telegram-style fluid navigation
│
├── 📚  lib/                    # Core Libraries
│   ├── 📁  calc/               # Pure TS Engineering Logic
│   └── 📄  i18n.ts             # Localization
│
└── 📋  CHANGELOG.md            # Release notes
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
