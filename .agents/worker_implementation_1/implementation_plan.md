# Implementation Plan - Upgrading Unloading Status UI/UX

## Milestone 2: Glassmorphism Theme & Layout Updates
- Update `components/UnloadingStatus.module.css` to add high-fidelity dark glassmorphic styling tokens (`backdrop-filter`, neon border highlights, glowing shadow classes).
- Replace card and container background rules with glassmorphism classes.
- Revamp `execCard` and `vesselCard` containers with glassmorphism styles.

## Milestone 3: Interactive SVG Ship Cargo Hold Schematic
- Create the custom SVG cargo hold schematic representing the ship hull silhouette (viewBox: 0 0 800 260).
- Implement dynamic compartment grid configurations:
  * For `sein-phoenix`: Hatches 4, 3, 2 have 4 levels (A, B, C, D); Hatch 1 has 3 levels (A, B, C).
  * For `bao-lucky`: Hatches 4, 3, 2, 1 have 3 levels (A, B, C).
  * Other vessels: Fallback to a default 4x3 compartment layout (A, B, C).
- Implement slanted polygons for Hatch 1's B and C levels to represent the bow of the ship.
- Define a clipping path for each compartment cell to enable smooth vertical liquid-like fill progress.
- Apply temperature-based color-coding (Deep Cyber Blue below -24°C, Teal/Green for normal, Amber/Orange for warning above -18°C, Red for critical).
- Implement tooltip state (`hoveredHold`, `tooltipData`) to show temperature, actual volume, nominal capacity, and latest quality description.
- Implement click highlight (`selectedHold`) and detailed compartment info panel beside the SVG grid.
- Integrate the species breakdown of the clicked compartment based on proportional scaling of the vessel's total species composition.

## Milestone 4: Radial Gauges & Transit Line Timeline
- Implement `RadialGauge` component to render circular progress dials.
- Replace vessel cards' linear progress bars with small radial dials.
- Add a large radial gauge inside the deep-dive KPI status/ETA card.
- Redesign the timeline section to render a vertical shipping lane timeline path:
  * Left side: An absolute-positioned vertical SVG path with flowing dashed animations (`seaCurrentAnimation`).
  * Right side: High-fidelity timeline entry cards.
  * Node overlays containing Lucide icons (`Ship` for current position, `Anchor` for starting point).

## Milestone 5: Verification & Production Compilation
- Run `npm run build` to verify Next.js production builds.
- Resolve any TypeScript compilation, syntax, or styling warnings.
