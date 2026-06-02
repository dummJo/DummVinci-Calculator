# Brand & Trademark — PTTS Praxis

> **Single source of truth for naming.** Read this before touching any
> user-facing string, logo, or metadata.

## The split (important)

| Layer | Value | Where it appears | Rule |
| --- | --- | --- | --- |
| **Product name** | **PTTS Praxis** | tab title, hero, splash wordmark, PWA install name, share title, email subjects | This is what the app is *called*. |
| **Maker / trademark** | **by DummVinci** (`Oleh DummVinci` in ID) | footer attribution, changelog footer, splash/share watermark, audit/export stamps | **Never remove.** Legal attribution — must survive every rebrand. |
| **Partner / deployer** | **PT Prima Tekindo Tirta Sejahtera (PTTS)** | "Supported by …" credit, logo badge | Org credit. |

**Plain rule:** rename the *product* freely; the line **"by DummVinci"** always stays.

## Wordmark

Composed from three i18n keys (so both EN/ID render identically):

```
brandDumm       = "PTTS"     → light italic kicker
brandVinci      = "Praxis"   → bold accent (the hero word)
brandCalculator = "Suite"    → mono uppercase superscript
```

Rendered: **_PTTS_ Praxis** ᴿˢᵘⁱᵗᵉ — used in `TopBar`, `SplashScreen`,
`(home)/page.tsx`, and `SharedWatermark`.

## Where each string lives

- **Wordmark + attribution text:** `lib/i18n.ts` keys `nav.brand*`,
  `common.managedBy`, `home.heroTitle`/`heroSubtitle`, `*.byDummVinci`.
  Editing these auto-updates every component (EN + ID).
- **Hardcoded product strings:** `app/layout.tsx` (metadata + manifest consts),
  `app/manifest.ts`, `components/share/ShareButton.tsx`, `components/FeedbackButton.tsx`,
  `components/share/SharedWatermark.tsx` (wordmark spans + "by DummVinci" line),
  `app/(tools)/abb-drivecare/page.tsx` (footer stamp),
  `app/(tools)/panel-layout/page.tsx` (attribution stamp + sample project name).
- **Kept brand assets (do NOT rename):** `public/logo-dv-ptts.png`,
  the `"DummVinci"` logo entry in `lib/calc/panelLayoutData.ts` (a selectable
  panel-logo component), and `localStorage` keys prefixed `dummvinci_*`
  (internal state — renaming would reset users' flags).

## Config

- `package.json` `name`: `ptts-praxis`
- `app/manifest.ts`: install name **PTTS Praxis**, theme `#F5E6DF`
- Feedback recipient: `NEXT_PUBLIC_FEEDBACK_EMAIL` (defaults `1437yb@gmail.com`)
- Analytics domain: `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` (unset → analytics off)

## Checklist when renaming the product again

1. Update the three `nav.brand*` keys in **both** EN and ID blocks of `lib/i18n.ts`.
2. Update `home.heroTitle` (both langs).
3. Update product suffix in every `byDummVinci` key — keep the `By/Oleh DummVinci ·` prefix.
4. Update `app/layout.tsx` `APP_NAME`, `app/manifest.ts`, `package.json` name.
5. Update hardcoded product strings in ShareButton / FeedbackButton / SharedWatermark.
6. **Verify** no `by DummVinci` / `Oleh DummVinci` attribution was lost (grep both).
7. `npm run build` green, then ship.
