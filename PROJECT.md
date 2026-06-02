# Project: Tuna Dashboard Unloading Page Upgrade

## Architecture
- React Frontend: `components/UnloadingStatus.tsx` handles the main layout, state management, vessel selection, efficiency metrics calculation, and timeline rendering.
- Styles: `components/UnloadingStatus.module.css` contains CSS modules with glassmorphism style classes, responsive design layout definitions, grid systems, and animations.
- Data Integration:
  - `/api/tuna-live`: Fetches live/synced dashboard telemetry including port congestion and demurrage alerts.
  - `/api/unloading-db`: Fetches historical and active vessel unloading logs from Supabase database.
  - Merged Data: Combines static vessel profiles with DB updates to compute dynamic unloading progress.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Test Suite & Baseline | Design and implement the Puppeteer E2E testing script, and verify current page compiles. | None | DONE |
| 2 | High-Fidelity Glassmorphic Layout | Redesign the page layout to use glassmorphism styling, glass cards, and neon border accents. | M1 | DONE |
| 3 | Interactive SVG Ship Cargo Holds | Implement the SVG cargo ship schematic in the center/top section. Generate compartments, dynamic fills, temperature-based color-coding, and hover tooltips. | M2 | DONE |
| 4 | Circular Gauges & Timeline Path | Replace linear progress bars with circular SVG radial dials and style the timeline as a vertical shipping lane path. | M3 | DONE |
| 5 | Dual Track Validation & Hardening | Run the E2E test suite (Tiers 1-4) to verify vessel switching, tooltips, and radial progress. Generate Tier 5 adversarial tests to harden robustness. | M4 | DONE |

## Interface Contracts
### `UnloadingStatus` Component ↔ SVG Ship Hold Graphic
- Input: Selected vessel's `timeline` and calculated `holdsData`.
- Grid layout rules:
  - `sein-phoenix`: Hatches 4, 3, 2 have 4 rows (A, B, C, D) and Hatch 1 has 3 rows (A, B, C).
  - `bao-lucky`: Hatches 4, 3, 2, 1 have 3 rows (A, B, C).
  - Other vessels: Fallback to a default 4x3 compartment layout.
- Interaction: Hovering over a compartment displays a floating tooltip with specific hold telemetry; clicking selection highlights the cell and updates the deep-dive analytics.

## Vessel Stowage Layouts
### M/V SEIN PHOENIX
- **Hatch 4**: 4A (S/SPR), 4B (S/SPR), 4C (S/SPR, MARI), 4D (S/SPR)
- **Hatch 3**: 3A (S/PIO), 3B (S/PIO), 3C (S/PIO, S/JUP), 3D (S/JUP)
- **Hatch 2**: 2A (S/HAR, MOAKONA), 2B (MOAKONA), 2C (N/STAR), 2D (N/STAR)
- **Hatch 1**: 1A (S/SPR), 1B (S/HAR), 1C (S/HAR)

### M/V BAO LUCKY
- **Hatch 4**: 4A (S/EXP), 4B (S/EXP, S/PIO, PAPA RESTY), 4C (PAPA RESTY)
- **Hatch 3**: 3A (S/PIO, S/CHA), 3B (S/CHA), 3C (S/CHA)
- **Hatch 2**: 2A (S/EXP, MOAKONA), 2B (MOAKONA, N/STAR), 2C (PAPA RESTY)
- **Hatch 1**: 1A (N/STAR), 1B (N/STAR, MOAMARI), 1C (MOAMARI)

