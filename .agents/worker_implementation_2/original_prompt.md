## 2026-06-03T06:20:54Z
You are the teamwork_preview_worker. Your working directory is `/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/.agents/worker_implementation_2`.

Your task is to update `/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/components/UnloadingStatus.tsx` to add all necessary E2E test-ids (`data-testid`), temperature styling boundaries, and edge-case fallbacks, and run the E2E test suite to verify that all 60 test cases pass.

Refer to:
- `/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/TEST_INFRA.md`
- `/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/TEST_READY.md`
- `/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/e2e/specs/` (spec definitions)

Here are the specific implementation details to apply in `components/UnloadingStatus.tsx`:
1. Vessel Cards selection: Add `data-testid={`vessel-select-item-${v.id}`}` to the vessel list card container element.
2. SVG Ship Silhouette: Add `data-testid="ship-silhouette"` to the outer `<svg>` element representing the ship.
3. Cargo hold segments: Add `data-testid={`hold-segment-${holdId.replace('#', '')}`}` to the background compartment cell element (`<rect>` or `<polygon>`).
4. Update `getTemperatureColor` to return `#14b8a6` for safe freezing.
5. Update `getTemperatureColor` boundaries:
   - Below -24.0: `#0284c7` (cyber blue)
   - Up to -18.0: `#14b8a6` (safe teal)
   - Up to -17.0: `#f59e0b` (warning amber)
   - Above -17.0: `#ef4444` (critical red)
6. Tooltip items:
   - Add `data-testid="hold-tooltip"` to the floating tooltip container div.
   - Add `data-testid="tooltip-temp"` to the span displaying the temperature value.
   - Add warning badge/text inside the tooltip (containing word 'Warning' or '경고') if the temperature is warning or critical (> -18.0°C).
7. Alert icon: Add a warning/danger icon (containing class name 'alertIcon' or 'danger') inside the vessel list card if any compartment has a critical temperature (> -17.0°C).
8. Circular Progress Gauges:
   - Pass `dataTestId?: string` prop to `RadialGauge` and bind it to the `<svg>` element. In the vessel list card, pass `data-testid={`progress-gauge-${v.id}`}`.
   - In the RadialGauge center percentage label, if `radius > 30`, add `data-testid="progress-percentage-label"` and format to 1 decimal place (`progress.toFixed(1)}%`).
9. Timeline items:
   - Add `data-testid="vertical-shipping-path"` to the vertical timeline lane path container.
   - Add `data-testid={isFirst ? "current-voyage-dot" : undefined}` to the node icon container div when it is the first timeline log.
   - Add `data-testid={`timeline-node-${t.date.replace('/', '-')}`}` to the timeline node container. If the node is a holiday (`t.dailyAmount === 0`), add the class name `holiday` or `styles.holiday` to it.
10. Executive Takeaway Box: Update it to render both `finalReport.takeaway.situation` and `finalReport.takeaway.insight`, and add `data-testid="exec-takeaway-box"` to its container.
11. Empty State: Add an empty state timeline prompt showing "하역 데이터가 없습니다" inside the timeline if `selectedData.timeline` is empty.
12. Crash Prevention: Add fallback handling for nonexistent query parameter vessel IDs so the page defaults back to `sein-phoenix` safely without crashing (e.g. check keys of `data` and set `selectedData = data[selectedVessel] || data['sein-phoenix']`).
13. Query Params selection: Read the `vessel` query parameter inside `useEffect` (using `window.location.search`) to select the active vessel from the URL.
14. API Error Handling: Display an error banner/boundary containing the word "Error" or "에러" if the fetch API returns a non-ok response (like 502).

Verification Steps:
1. Run `npm run build` in the project root to verify compilation.
2. Run the test runner:
   `node e2e/run-tests.js`
3. Verify that all 60 test cases across Tiers 1-4 pass cleanly.
4. Update `.agents/worker_implementation_2/progress.md` and write your handoff report to `.agents/worker_implementation_2/handoff.md`.
5. Report completion to the parent orchestrator conversation ID: e0ee8c32-bacb-49b1-b01a-b56dbfa905a0.
