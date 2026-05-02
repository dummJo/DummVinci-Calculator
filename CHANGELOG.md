# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.3.0] — 2026-05-02

### Added
- **PID Loop Simulator**: Interactive step-response tuning for motor, pump, and compressor control loops using FOPDT modeling.
- **Testing Tutorials**: High-fidelity visual guides for electrical measurements (Multimeter, Megger, Earth Tester) with step-by-step animations and IEC/IEEE reference values.
- **Electrical Converter Hub**: Redesigned unit conversion system covering 10 engineering categories with optimized kVA ↔ Amps and Power/Energy field tools.
- **Engineering Wisdom Engine**: New `funFacts.ts` integration providing contextual engineering tips, formulas, and "did-you-know" snippets across the platform.
- **By DummVinci Branding**: Standardized internal brand identity across all calculators, metadata, and production assets.

### Changed
- **Enhanced UI Contrast**: Globally improved readability with high-contrast background/text pairings and refined "Season 2" visual identity.
- **Telegram-Style Navigation**: Optimized the `BottomTabBar` with liquid pop animations and a compact "More" utility overlay.

### Fixed
- **Mobile Navigation Stability**: Resolved overlap issues and improved click-outside closure logic for the utility menu.

## [2.2.0] — 2026-04-20

### Added
- **Module-Centric Engine Expansion**: Fully integrated the **ACS880-02 Compact Module** series and **ACS380 Machinery Drive** family into the VSD and Unified sizing calculators.
- **Enhanced Drive Catalog**: Expanded `abb-drives.json` with 40+ new industrial ratings, including ACQ580-04/07 module variants and detailed physical specs (H×W×D).
- **Portfolio-Grade Typography**: Upgraded the design system to sync with dummJo's signature portfolio, featuring **Bricolage Grotesque** (Headings/UI) and **Outfit** (Premium Sans).

### Changed
- **Taskbar Visibility Boost**: Increased "Ghost" navigation opacity to **70%** and enabled perennial labels at 50% opacity for improved accessibility and discoverability.
- **Fluid Dock Physics**: Refined the Gooey SVG filter and transition curves (`0.5s elastic`) for a cleaner, high-precision liquid effect.

### Fixed
- **Mobile Scroll Trapping**: Resolved "sticky" vertical scrolling on iOS/Mobile by optimizing overflow-x logic and implementing `-webkit-overflow-scrolling: touch`.
- **Safe Area Compliance**: Updated `app-root` padding to dynamically account for mobile safe areas (`env(safe-area-inset-bottom)`), preventing the taskbar from covering content.
- **Animation Stability**: Added a resize listener to the taskbar dock to maintain perfect blob alignment during viewport shifts.

## [2.1.0] — 2026-04-19

### Added
- **Liquid Meta-ball UI**: Advanced "Gooey" taskbar system implemented via SVG filters for organic, liquid transitions between navigation items.
- **Ghost Navigation**: Implemented "Invisible-until-Active" logic for the taskbar to minimize distraction and maximize screen real estate.
- **Interactive Hover Follower**: High-fidelity mouse-tracking indicator that follows the cursor on the dock, providing real-time tactile feedback.
- **Golden Ratio UI Alignment**: Refactored `SummaryStrip` and internal input spacing using the 1.618 golden proportion for harmonic visual balance.
- **Elastic Motion Engine**: Transitioned from linear easing to bouncy `cubic-bezier` spring physics for all taskbar and toggle interactions.

### Fixed
- **Summary Overlap**: Resolved text clipping in part codes by implementing a proportionally weighted grid system.
- **Click-Outside Closure**: Integrated a global listener to automatically close navigation overlays when clicking outside the menu.

## [2.0.0] — 2026-04-19

### Added
- **ABB Support Hub**: A comprehensive technical support module featuring:
  - **Dynamic Fault Code Lookup**: Pop-up solutions for common ABB drive error codes (Overcurrent, DC Overvoltage, etc.).
  - **Verified Documentation Library**: Direct link shortcuts to 2026/Latest hardware and software manuals for ACS880, ACQ580, ACS580, ACH580, and ACS380.
  - **Frame Dimensions Table**: Physical reference data (H×W×D) for frames R1 through R11.
- **Expanded Drive Variant Support**: Calculation logic now supports specific construction types:
  - **-01 Wall-mounted** (Default)
  - **-04 Drive Modules** (Frame-mounted for high power R10/R11)
  - **-07 Cabinet-built** (Ready-to-use enclosures)
  - **-31 Ultra-Low Harmonic (ULH)**: Integrated sizing with LCL filter dimensions and THDi < 3% recommendations.
- **Engineering Specification Summary Strip**: A professional-grade specification table in the "Fast Sizing" (Unified) calculator showing Code, kW, Fuse, Breaker, Cable, Airflow, Frame, and Dimensions.
- **Tropical Climate Derating**: Logic implementation for 1%/°C ambient temperature derating above 40°C as per ABB Hardware Manuals.
- **Branding**: Implemented "Engineered by dummJo" white-label trademark across all pages and results.

### Changed
- **Precision Data Overhaul**: Migrated from generic 3% loss estimations to frame-specific `ploss` [W] and `requiredAirflow` [m³/h] values from real ABB/Siemens catalogs.
- **Localized UI (i18n)**: Full translation support for Indonesian (ID) and English (EN) across all navigation and calculation labels.
- **Mobile UX**: Optimized `BottomTabBar` for 390px viewports with 8 functional tabs (Home, Unified, Cable, VSD, Breaker, Busbar, Panel, Support Hub).

### Removed
- Deprecated legacy "placeholder" part codes.
- Removed hardcoded default cooling assumptions; replaced with standardized IEC 60890 and XLTC calculation logic.
- Purged all "DummVinci" branding from logic logs to align with PTTS IoT Dashboard rebranding.

## [1.9.0] — 2026-04-18

### Added
- Unified (Fast Sizing) calculator orchestrator.
- Multi-component dependency logic (e.g., Cable sizing based on Breaker trip rating).
- Integrated footer and navigation system for the calculator hub.


### Added
- Backend integration readiness for NestJS with dedicated `portfolioApi` client
- Hybrid data orchestration: automatic API fetching with local translation fallback
- UI Skeletons for Projects and Skills sections for improved loading UX
- Environment variable support for API endpoints (`.env.example`)
- Multi-language SEO: Dynamic `html lang` attribute updates based on user locale

### Changed
- Hardened project architecture: Removed hardcoded metadata from components
- Decoupled data from UI: Migrated project metadata (years, tags, links) to `translations.ts`
- Standardized `Role` and `AboutData` interfaces for shared backend-frontend compatibility

### Fixed
- Resolved project-wide IDE errors by restoring missing `node_modules`
- Fixed `About.tsx` type mismatch for role descriptions
- Fixed missing Lucide icon imports in `CareerJourney.tsx`

## [1.7.0] — 2026-04-03

### Added
- Internationalization support for 5 languages with language switching
- WhatsApp call-to-action integration
- Brand marquee carousel showcasing partner companies
- Page transition animations for enhanced navigation flow
- International SEO optimization with hreflang tags and language-specific metadata

### Changed
- Enhanced multi-language support across all content sections

## [1.6.0] — 2026-04-03

### Added
- Light/dark mode toggle for user preference
- Warm vincinian light theme implementation with golden accents

### Changed
- Canvas contrast increased in light mode with darker gold and higher opacity for better readability among older audiences

## [1.5.0] — 2026-04-03

### Added
- Floating action buttons for enhanced user interaction
- Back-to-top functionality
- GitHub and LinkedIn icon cards in Contact section with card-hover styling
- Consultation request call-to-action

### Changed
- Consultation button switched from mailto to Gmail compose URL for improved compatibility
- Contact section redesigned with social media integration

### Fixed
- Removed AnimatePresence from FloatingActions to fix aria-hidden on #app-root
- Fixed accessibility issues with aria-hidden isolation on canvas
- Fixed mailto implementation using dynamic anchor click for browser compatibility

## [1.4.0] — 2026-04-03

### Added
- Favicon: Vitruvian Man SVG illustration as renaissance design element
- JSON-LD structured data for improved search engine understanding
- Comprehensive SEO overhaul with title optimization and Jabodetabek keywords
- Larger clickable profile photo with lightbox functionality
- Da Vinci cursor-reactive background animation

### Changed
- Page title updated to "dummJo Engineering & Consulting"
- Profile presentation enhanced with Da Vinci renaissance elements and golden spiral motifs
- GitHub links updated to dummJo organization
- Increased Da Vinci background cursor effect opacity to ~30%

### Fixed
- Fixed horizontal overflow with viewport-clamped canvas and hidden scrollbar
- Resolved nav links on subpages and centralized contact information to Jakarta

## [1.3.0] — 2026-04-03

### Added
- Hover lift effect applied to all card elements across the homepage
- Aria-label improvements for project external links

### Changed
- Hero statistics updated with JKT & Bali-based information
- Availability messaging clarified as worldwide hybrid
- Multi-brand positioning for ABB, Siemens, and Allen Bradley partnerships
- Generalized PQ & ICSS product offerings with N5050 Crane integration
- Product positioning adjusted to focus on sizing and quotation services
- AI project description generalized for broader applicability
- Software skills section trimmed for conciseness

## [1.2.0] — 2026-04-03

### Added
- Profile photo frame design element
- Da Vinci renaissance aesthetic branding
- Golden spiral visual motifs
- Footer tagline with vincinian design philosophy

### Changed
- Complete readability overhaul implementing WCAG contrast standards
- Four-tier color system established for visual hierarchy
- Font hierarchy refined for improved typography
- Vincinian tagline prominently featured
- Profile photo updated with new imagery

### Fixed
- Adjusted color contrast for accessibility compliance

## [1.1.0] — 2026-04-03

### Added
- Dedicated dummVinci project page and showcase
- Digitalization icons for project representation
- Homepage teaser for dummVinci initiative

### Changed
- Branding updated to dummjo.dev
- Full name updated to Adam Muhammad
- Archived previous adam-retto branding
- Comprehensive SEO improvements

### Fixed
- Removed boilerplate components

## [1.0.0] — 2026-04-03

### Added
- Initial portfolio implementation
- Basic Next.js framework setup
- Contact information and professional profile
- Project showcase sections
- Navigation structure

[Unreleased]: https://github.com/dummJo/portfolio/compare/v1.8.0...HEAD
[1.8.0]: https://github.com/dummJo/portfolio/compare/v1.7.0...v1.8.0
[1.7.0]: https://github.com/dummJo/portfolio/compare/v1.6.0...v1.7.0
[1.6.0]: https://github.com/dummJo/portfolio/compare/v1.5.0...v1.6.0
[1.5.0]: https://github.com/dummJo/portfolio/compare/v1.4.0...v1.5.0
[1.4.0]: https://github.com/dummJo/portfolio/compare/v1.3.0...v1.4.0
[1.3.0]: https://github.com/dummJo/portfolio/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/dummJo/portfolio/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/dummJo/portfolio/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/dummJo/portfolio/releases/tag/v1.0.0
