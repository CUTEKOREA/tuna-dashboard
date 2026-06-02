## 2026-06-03T05:52:49Z
You are the teamwork_preview_worker. Your working directory is `/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/.agents/worker_implementation_1`. Your role is Implementation Worker.

Your task is to implement Milestones M2, M3, and M4 to upgrade the unloading status page UI/UX of `components/UnloadingStatus.tsx` and `components/UnloadingStatus.module.css`.

Please follow these specific instructions:
1. Read the explorer analysis report at `/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/.agents/explorer_1/analysis.md` and the explorer handoff report at `/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/.agents/explorer_1/handoff.md` to guide your design and math calculations.
2. Implement:
   - High-fidelity dark glassmorphism layout with neon borders.
   - Interactive SVG Ship Cargo Hold Schematic:
     * Represents a 4x3 grid (Hatches 4, 3, 2, 1 and Levels A, B, C).
     * Slanted compartments for Hatch 1 (FWD/Front).
     * Compartments fill dynamically based on actual vs reported capacity (use the clipping path or gradient fill stops suggested in the analysis report).
     * Compartments color-code based on temperature: deep blue below -20°C, green/teal for good, amber for warning if above -18°C.
     * Hovering on a compartment displays an interactive tooltip with specific hold telemetry (temperature, current cargo amount, quality description).
     * Clicking a compartment highlights it and displays its details (status, actual vs reported, temperature, species breakdown).
   - Replace linear progress bars with custom SVG circular radial progress indicators.
   - Replace timeline list with a stylized vertical shipping lane timeline path (illustrative path with anchor/ship icons/nodes).
   - Fully preserve React hooks, state (like `selectedVessel`), and dynamic database fetch merging logic (`staticData` + `dbData`).
3. Run `npm run build` after implementing to verify the code compiles without any TypeScript, lint, or syntax errors.
4. Update `.agents/worker_implementation_1/progress.md` with your progress and write your handoff report to `.agents/worker_implementation_1/handoff.md`.
5. Report completion to the parent orchestrator conversation ID: e0ee8c32-bacb-49b1-b01a-b56dbfa905a0.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.
