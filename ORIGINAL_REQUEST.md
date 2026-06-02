# Original User Request

## Initial Request — 2026-06-03T05:49:17+09:00

Upgrade the UI/UX design of the unloading status page (`https://leedonggun.co.kr/unloading`) to look like a high-fidelity, interactive infographic scene representing ship cargo holds, temperature meters, and logistical flows.

Working directory: `/Users/idong-geon/연구자동화애이전트들/tuna-dashboard`
Integrity mode: development

## Requirements

### R1. Interactive Ship Hold Schematic (SVG Graphic)
- Implement a highly polished, interactive SVG graphic of a cargo vessel silhouette in the center/top section of the selected vessel's analytics.
- Divide the ship silhouette into visual compartments representing different 어창 (Holds, e.g., #1-A, #2-B, #4-C).
- Dynamically fill the compartments (liquid height or gradient fill) to match their actual vs. reported capacity.
- Dynamically color-code compartments based on reported hold temperatures (e.g., deep blue for below -20°C, teal/green for good, amber for warning if above -18°C).
- Enable interactive hover tooltips on each hold segment showing specific hold telemetry (temperature, current cargo amount, quality description).

### R2. High-Fidelity Infographic Theme & Layout
- Re-architect the layout of the page (`components/UnloadingStatus.tsx` & `.module.css`) to match a premium infographic spread.
- Replace generic linear progress bars with custom SVG circular radial dials (glowing circular gauges with animated borders).
- Replace the timeline list with a stylized, vertical transit/shipping lane path (infographic timeline nodes with shipping/anchor indicators).
- Apply rich glassmorphism design tokens (`backdrop-filter: blur`, subtle neon-blue/teal drop-shadow borders, custom dark panel backgrounds, and smooth hover translations).
- Maintain responsive adaptability (mobile-friendly vertical stack, scale SVG graphics down cleanly).

### R3. Functional Logic Preservation
- Preserve the existing React hooks, state (`selectedVessel`, `vesselsList`, etc.), and dynamic database fetch merging logic (`staticData` + `dbData`).
- Ensure all vessels (`M/V SEIN PHOENIX`, `M/V BAO LUCKY`, `M/V HIKARI`, etc.) render correctly with their corresponding hold names and data.

## Verification Plan

### Automated Build Verification
- Execute `npm run build` to verify the code compiles without TypeScript, lint, or syntax errors.

### Functional Audit
- The implementation must be tested to ensure switching between different vessels updates the SVG ship silhouette, circular progress dials, and timeline correctly.
- Verify tooltips trigger on hover/click on the SVG hold components without throwing runtime errors.

## Acceptance Criteria

### Infographic Visualization
- [ ] A custom SVG ship hold schematic is rendered, dynamically segmented by hold names (e.g., #1-A, #4-C) and filled/colored by data.
- [ ] Key metrics (e.g., 진척률) are visualized using custom radial circular progress indicators instead of default linear bars.
- [ ] Log timeline is structured as an illustrated path with graphic icons/anchors for nodes.

### UI Style & Build
- [ ] The overall dashboard theme (neon dark mode) is unified, utilizing backdrop blur and subtle glowing border effects.
- [ ] No generic placeholder text, empty divs, or basic unstyled tables are present.
- [ ] Production build (`npm run build`) compiles with zero errors.

## Follow-up — 2026-06-03T05:51:53+09:00

Here is additional factual stowage and hold breakdown data for the ship infographic:

1. **Ship Hold Layout Structure**:
   - The cargo ships have 4 main hatches: **Hatch 4 (AFT/Back)**, **Hatch 3**, **Hatch 2**, and **Hatch 1 (FWD/Front)**.
   - Each hatch has 3 vertical levels: **A (Top)**, **B (Middle)**, and **C (Bottom)**.
   - This forms a 4x3 grid (AFT -> FWD: Hatches 4, 3, 2, 1; Top -> Bottom: Levels A, B, C).

2. **Hold Mapping for BAO LUCKY**:
   - **Hatch 4**:
     - 4A: SHILLA EXPLORER (S/EXP)
     - 4B: SHILLA EXPLORER (S/EXP), SHILLA PIONEER (S/PIO), PAPA RESTY
     - 4C: PAPA RESTY
   - **Hatch 3**:
     - 3A: SHILLA PIONEER (S/PIO), SHILLA CHALLENGER (S/CHA)
     - 3B: SHILLA CHALLENGER (S/CHA)
     - 3C: SHILLA CHALLENGER (S/CHA)
   - **Hatch 2**:
     - 2A: SHILLA EXPLORER (S/EXP), MOAKONA
     - 2B: MOAKONA, NAGOERO STAR (N/STAR)
     - 2C: PAPA RESTY
   - **Hatch 1**:
     - 1A: NAGOERO STAR (N/STAR)
     - 1B: NAGOERO STAR (N/STAR), MOAMARI
     - 1C: MOAMARI
   - **Total Capacity**: 5,733 MT (including 930 MT of PAPA RESTY). The main commercial species breakdown totals 4,803 MT.

3. **Logistics Correlation**:
   - In BAO LUCKY's 6/2 report: "N/STAR:#1-A" means Nagoero Star in Hatch 1-A. "S/EXP:#4-A" means Shilla Explorer in Hatch 4-A.
   - In SEIN PHOENIX's reports: "S/SPR:#1-A" means S/SPR in Hatch 1-A. "MARI:#4-C" means MOAMARI in Hatch 4-C.

Please use this 4x3 grid SVG visualization for the ship hold schematic. Clicking on any cell should highlight it and display its corresponding details (status, actual vs reported, temperature, species breakdown).

## Follow-up 2 — 2026-06-03T05:53:00+09:00

Here is the stowage plan data for M/V SEIN PHOENIX:

1. **Ship Hold Grid Structure (Vessel-Specific)**:
   - Unlike BAO LUCKY which has a 4x3 grid, **SEIN PHOENIX** has a 4-level layout (A, B, C, D) for Hatches 4, 3, 2, and a 3-level layout (A, B, C) for Hatch 1.
   - Total capacity of SEIN PHOENIX is 6,955.00 MT.

2. **Hold Mapping for SEIN PHOENIX**:
   - **Hatch 4 (AFT)**:
     - 4A: SHILLA SPRINTER (S/SPR)
     - 4B: SHILLA SPRINTER (S/SPR)
     - 4C: SHILLA SPRINTER (S/SPR), MOAMARI (MARI)
     - 4D: SHILLA SPRINTER (S/SPR)
   - **Hatch 3**:
     - 3A: SHILLA PIONEER (S/PIO)
     - 3B: SHILLA PIONEER (S/PIO)
     - 3C: SHILLA PIONEER (S/PIO), SHILLA JUPITER (S/JUP)
     - 3D: SHILLA JUPITER (S/JUP)
   - **Hatch 2**:
     - 2A: SHILLA HARVESTER (S/HAR), MOAKONA
     - 2B: MOAKONA
     - 2C: NAGOERO STAR (N/STAR)
     - 2D: NAGOERO STAR (N/STAR)
   - **Hatch 1 (FWD)**:
     - 1A: SHILLA SPRINTER (S/SPR) (Note: 6/2 UC: 77.870 MT S/SPR:#1-A was discharged from here)
     - 1B: SHILLA HARVESTER (S/HAR)
     - 1C: SHILLA HARVESTER (S/HAR)

Please ensure that when switching vessels on the frontend, the SVG ship compartment rendering adapts to the correct layout schema for each vessel:
- For `sein-phoenix`: Renders Hatches 4, 3, 2 with 4 rows (A, B, C, D) and Hatch 1 with 3 rows (A, B, C).
- For `bao-lucky`: Renders Hatches 4, 3, 2, 1 with 3 rows (A, B, C).
- For other vessels (e.g., `dinok`, `hikari` etc.): If detailed plans are not specified, fallback to a clean default 4x3 compartment layout.

## Follow-up 3 — 2026-06-03T06:05:36+09:00

Please provide an update on the progress of the implementation and E2E validation. Are the tests passing?
