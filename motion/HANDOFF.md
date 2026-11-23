# PTTS Praxis — "One Shape" motion piece

A 1440×1440, 14.000 s seamless loop in which **one shape** morphs through eleven
real PTTS Praxis components, driven by a cursor, on a 120 BPM grid.

---

## Traceability stamp

| Field | Value |
| --- | --- |
| **Timestamp Before** | `2026-09-25T19:05:38+07:00` |
| **Timestamp After** | `2026-09-25T20:24:52+07:00` |
| **Execution Duration** | 1h 19m 14s |
| **Progress Category** | System Design & Visualization; Documentation & Knowledge Management |

---

## The grid

120 BPM · 1 beat = 0.500 s · 7 bars · 28 beats · **14.000 s** · loops exactly.

| Beats | State | Real component | Source |
| --- | --- | --- | --- |
| 0–1 | Primary button | `.btn-primary` | `app/globals.css:658-671` |
| 2 | Click + collapse | `.cl-cta-pill:active` scale(0.98) | `components/nav/BottomTabBar.tsx:454` |
| 3–4 | Loader | `PageTransition` / `ptr-spin` | `components/PullToRefresh.tsx` |
| 5–6 | Check | `<Check size={14} strokeWidth={2.4}/>` | `components/share/ShareButton.tsx:73` |
| 7–10 | Wordmark island | `TopBar` wordmark | `components/nav/TopBar.tsx:88-112` |
| 8–10 | **Theme wipe** | `ThemeToggle` View Transition | `components/ThemeToggle.tsx:60-107` |
| 11–12 | Load-current field | `FieldNumber` | `components/calc/FieldNumber.tsx:56-72` |
| 13–16 | Ampacity bar + over-drag | `SplashScreen` track 200×4 r2 | `components/SplashScreen.tsx:268-274` |
| 17–18 | Toggle | `FieldToggle` 44×24 r12, knob 16 | `components/calc/FieldToggle.tsx:43-58` |
| 19–21 | Tab indicator | — **invented**, see ledger | — |
| 22–23 | Derating chart | IEC 60364-5-52 Table B.52.14 | — |
| 24–26 | ⌘K palette | `PraxisModal` / `RecentDropdown` | — |
| 27 | Toast | `AuditFooter` ISO 9001 strip | `components/calc/AuditFooter.tsx` |
| 28 ≡ 0 | back to the button | — | — |

The over-drag past 100% uses the repo's **own** rubber-band law rather than an
invented curve: `eased = 115 * (1 - exp(-dy / 90))`, `components/PullToRefresh.tsx:78`.

---

## Decisions taken by the requester

1. **Chrome clean, motion ours.** The brief bans glows, gradients on chrome,
   mismatched icon strokes and bouncy easing; this site ships all four on
   purpose. Resolution: drop the glows and gradients (so `.btn-primary:hover`'s
   24 px accent glow at `globals.css:685` is *not* reproduced), keep the site's
   easings including `FieldToggle`'s overshoot and the nav's
   `cubic-bezier(0.32,0.72,0,1)`.
2. **Full PTTS components** rather than the brief's generic state list. The
   brief's music player, play/pause morph and volume slider therefore do not
   appear; their motion beats are carried by the `FieldNumber` stepper and the
   ampacity over-drag instead.
3. **Peach light theme** `#F5E6DF` with `#D97757` as the one spent accent, plus
   the ThemeToggle wipe to `#141413` across beats 8–10.
4. **Silent render.** The environment's network policy denied `mixkit.co:443`
   (403 on CONNECT), so no track could be fetched. The grid is locked to 120 BPM,
   so audio can be laid against it later with no re-render.

---

## Invention ledger

Everything below is **new work, not a recreation**. Nobody should read these as
shipped product behaviour.

| Invented | Why it had to be | Tuned against |
| --- | --- | --- |
| **Liquid tab indicator** (beats 19–21) | `BottomTabBar` has no sliding indicator. `activeIndex` is computed at `:94` but only feeds `isUtilityActive` at `:95`; nothing positions a pill. The comment at `:484` promises a "Telegram-style pill indicator" that was never shipped. | nav's `cubic-bezier(0.32,0.72,0,1)` |
| **Dual-edge springs** (toggle knob, tab indicator) | No spring physics exists anywhere in the repo — no library in `package.json`, no stiffness/damping constant. | `FieldToggle`'s `cubic-bezier(0.34,1.56,0.64,1)` overshoot |
| **All spring constants** | as above | — |
| **Checkmark draw-on** | No `stroke-dashoffset` reveal and no `getTotalLength()` call exists. The only dash motion in the repo is an infinite marching-ants loop. | — |
| **Chart draw-on** | as above | — |
| **The cursor** — sprite, path, smoothing, click ring | `components/CursorGlow.tsx` **returns `null`**. There is no drawn cursor, pointer sprite or click ripple anywhere. | — |
| **Toast component** | No toast, snackbar or `aria-live` region exists. Styled from `AuditFooter`'s traceability strip. | — |
| **Slider thumb / drag-to-value** | No `input[type=range]`, no thumb, no drag mapping anywhere. Only the 200×4 track is sourced. | `PullToRefresh`'s rubber-band law |
| **1440×1440 frame + camera** | The repo has no square layout and no 1440 grid. 80 px gutter chosen because `1440 / 80 = 18` tiles the body dot lattice exactly. | `globals.css:239-244` |
| **Toggle off-knob colour** | The shipped component puts `--muted` (#0F0F0F) on `--hairline` (#3d372e) — dark on dark. Substituted `--parchment-low` #b0aea5 so the flip reads at 792 px. | see findings below |

---

## Findings in the codebase (verified, not from the animation)

Each was read directly in the file named.

1. **`components/CursorGlow.tsx` is dead code** — it runs a `mousemove` listener
   and a rAF scan, then `return null`. It renders nothing.
2. **`app/globals.css:33` declares `--font-mono` in terms of itself**:
   `--font-mono: var(--font-mono), 'JetBrains Mono', monospace;`. A custom
   property that references itself is invalid at computed-value time. The mono
   font only survives because every consumer repeats the literal fallback
   (`:281`, `:501`).
3. **43 `fontWeight: 900` call sites across `app/` and `components/`**, but
   `app/layout.tsx:18` loads Inter at 300–800 only. All 43 render as synthetic
   bold.
4. **`app/layout.tsx:18` loads Inter with no `style` key**, so the italic kicker
   in the wordmark is synthetic oblique. *This piece reproduces the synthetic
   oblique deliberately* — loading true italic would look wrong beside the site.
5. **`app/(tools)/pid/pid-client.tsx:54`** draws the setpoint at
   `rgba(255,255,255,0.3)` on a `rgba(0,0,0,0.2)` plot well (`:40`). On the peach
   light canvas that is close to invisible. The chart in this piece uses
   `--accent` at stroke-width 3 instead.
6. **`app/opengraph-image.tsx:21-22`** renders dark (`#141413` on `#F5E6DF`)
   while the site's effective default theme is light — the social card does not
   match the site it advertises.
7. **`FieldToggle` off state is dark-on-dark** (finding 10 in the ledger above).

None of these were changed. They are reported, not fixed.

### One caught in this work, worth knowing repo-wide

`font-family: var(--font-inter), Inter, system-ui` looks like a safe fallback
chain and is not. If `--font-inter` is undefined, `var(--font-inter)` becomes
guaranteed-invalid, which invalidates the **whole** declaration — the element
falls back to its *inherited* font, not to the rest of the list. The engine hit
this the moment it was rendered outside Next.js: the button came out in a serif.
The fix is to give the `var()` its own fallback, `var(--font-inter, Inter)`.
Anywhere in the app that writes `var(--font-…)` without an inner fallback has
the same latent trap — it is only masked today because `body` sets a font.

---

## Build and render

**One engine, two consumers.** `lib/motion/morphEngine.ts` is the only
implementation. `motion/build.py` bundles it with esbuild into the standalone
capture file; `components/MorphLoop.tsx` imports it directly. The video and the
on-site animation therefore cannot drift.

```bash
npm i -g esbuild playwright                # one-time
pip install numpy pillow imageio-ffmpeg    # one-time

cd motion
python3 build.py            # bundles the engine + inlines fonts -> one HTML file
node capture.mjs beats      # 28 PNGs, one per beat, for review
node probe.mjs              # prints the shape box at every beat
node seamtest.mjs           # asserts seek(0) === seek(14) byte-for-byte
node test/scaleshot.mjs     # renders at 0.5 scale, the path MorphLoop.tsx uses
./render-master.sh          # the 1440x1440 60fps master
./render-derivatives.sh     # 9:16, WebM and GIF from the master
```

`motion/node_modules/` is two symlinks to the globally installed `playwright`
(ESM does not honour `NODE_PATH`). `ffmpeg` comes from the `imageio-ffmpeg`
pip package — **Playwright's own bundled ffmpeg is built `--disable-everything`**
and has no H.264, no `tmix` and no audio codecs, so it cannot produce any of
this. `motion/` is in `.vercelignore`: the renders are deliverables, not site
assets, and should not be uploaded on every deploy.

**Capture must not run under `prefers-reduced-motion`.** `globals.css:875-890`
sets `animation-duration: 0.001ms !important` on everything under that query.
The standalone file does not import `globals.css`, but `capture.mjs` passes
`reducedMotion: 'no-preference'` explicitly so the habit survives any future
capture of the real site.

---

## Verified properties

| Property | How it was checked | Result |
| --- | --- | --- |
| `seek(t)` is pure | `seek(9.37)`, then `seek(2.10)`, then `seek(9.37)` again | byte-identical |
| Loop is seamless | `seek(0)` vs `seek(14.000)` | byte-identical |
| Loop holds off-grid | `seek(1/60)` vs `seek(14 + 1/60)` | byte-identical |
| Every beat is on-grid | `probe.mjs` — shape box at all 28 beats | 43–87% of frame, none clipped |
| No dead beats | 28-frame contact sheet | every beat carries a distinct state |

The cursor's velocity at the loop seam is zero on both sides (each path segment
uses smoothstep, which has zero derivative at its endpoints), so position *and*
speed match across the join.

---

## Known limitations

- **No audio.** See decision 4. Every UI sound placement is still to be done.
- **The spring residual at the seam is not exactly zero**, it is below 1e-4 px.
  Springs are asymptotic; the final morph runs a stiffer spring (`SEAL`, ω=30)
  specifically so the residual falls under a pixel. The byte-identical result
  above confirms it rounds away.
- **Stroke weights vary across the zoom range.** A 1 px border at the toggle's
  K=18 is 18 px; at the chart's K=2.4 it is 2.4 px. Within any single frame the
  ratios are true to the component; across states they are not constant. That is
  inherent to "one shape, camera zooms" and was accepted, not overlooked.
- The React component (`components/MorphLoop.tsx`) holds a static frame under
  `prefers-reduced-motion`; it has not been wired into any page.

---

*By DummVinci · PTTS Praxis*
