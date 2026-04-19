# dummjo.id — Portfolio

> Personal portfolio of Adam Jo — generalist engineer, Vincinian aesthetic.  
> [dummjo.dev](https://dummjo.dev)

---

## Stack

| Layer | Tech |
|---|---|
| Framework | Web Framework (App Router) |
| Styling | Utility-first CSS |
| Language | Typed JavaScript |
| Deploy | Cloud Platform (`dummjo-teams`) |
| Repo | `dummJo/portfolio` |

---

## Structure

```
📦 portfolio
│
├── 🗂️  app/                    # Next.js App Router
│   ├── 📄  layout.tsx          # Root layout, fonts, metadata
│   ├── 📄  page.tsx            # Home — all sections composed here
│   ├── 📄  template.tsx        # Page transition wrapper
│   ├── 📄  globals.css         # CSS variables, base styles
│   ├── 🤖  robots.ts           # robots.txt generator
│   ├── 🗺️  sitemap.ts          # sitemap.xml generator
│   ├── 🖼️  apple-icon.tsx      # Apple touch icon (generated)
│   ├── 📁  changelog/          # /changelog route
│   └── 📁  dummvinci/          # /dummvinci easter egg route
│
├── 🧩  components/             # All UI components
│   │
│   ├── ── Page Sections ──
│   ├── 📄  Hero.tsx            # Landing hero with intro
│   ├── 📄  About.tsx           # About section
│   ├── 📄  Skills.tsx          # Skills list
│   ├── 📄  SkillGraph.tsx      # Radial skill graph
│   ├── 📄  CareerJourney.tsx   # Timeline of career milestones
│   ├── 📄  Projects.tsx        # Project cards
│   ├── 📄  Contact.tsx         # Contact section
│   ├── 📄  Footer.tsx          # Site footer
│   │
│   ├── ── Navigation ──
│   ├── 📄  Navbar.tsx          # Top navigation bar
│   ├── 📄  FloatingActions.tsx # Floating action buttons
│   ├── 📄  BrandMarquee.tsx    # Scrolling brand ticker
│   │
│   ├── ── Theme & UX ──
│   ├── 📄  ThemeToggle.tsx     # Dark/light toggle
│   ├── 📄  LanguageSelector.tsx # EN/ID language switcher
│   ├── 📄  CursorGlow.tsx      # Cursor glow effect
│   ├── 📄  VisitorInfo.tsx     # Visitor geolocation badge
│   │
│   ├── ── Da Vinci System ──
│   ├── 🎨  DaVinciSketches.tsx # 83 SVG sketch components (library)
│   ├── 🎨  DaVinciWatermark.tsx # Randomized background watermarks
│   ├── 🎨  DaVinciBackground.tsx # Static Da Vinci background layer
│   ├── 🎨  DaVinciElements.tsx # Decorative floating elements
│   ├── 🎨  DaVinciTrail.tsx    # Cursor ink trail effect
│   │
│   ├── ── Features ──
│   ├── 📄  Changelog.tsx       # Changelog viewer
│   ├── 📄  DummVinci.tsx       # DummVinci easter egg page
│   └── 📄  DummVinciTeaser.tsx # DummVinci teaser component
│
├── 📚  lib/                    # Shared utilities
│   ├── 📄  LanguageContext.tsx  # i18n React context
│   └── 📄  translations.ts     # EN/ID translation strings
│
├── 🖼️  public/                 # Static assets
│   ├── 🧑  profile.jpg         # Profile photo
│   ├── 🤖  robots.txt
│   └── 🗺️  sitemap.xml
│
├── ⚙️  next.config.ts          # Next.js config
├── ⚙️  tsconfig.json           # TypeScript config
├── ⚙️  eslint.config.mjs       # ESLint rules
├── ⚙️  postcss.config.mjs      # PostCSS (Tailwind)
├── 📦  package.json
└── 📋  CHANGELOG.md            # Release notes
```

---

## Dev

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm build
pnpm lint
```

---

## Deploy

Push to `main` → auto-deploy.
