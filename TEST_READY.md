# E2E Test Ready Report: Tuna Dashboard Unloading Page

This document confirms that the E2E testing infrastructure is established and ready. The spec suite is written to be requirement-driven and opaque-box, verifying features, boundary cases, pairwise combinations, and real-world multi-day unloading sequences.

---

## 1. Execution Commands

To execute the End-to-End test suite locally, run the following command from the project root:

```bash
node e2e/run-tests.js
```

### Script Execution Logic
1. **Dynamic Port Allocation:** The runner searches for an available port starting from `3000` to prevent collision with other active services.
2. **Next.js Dev Server Spawning:** It boots the development server with `npm run dev` bound to the allocated port.
3. **Sequential Spec Execution:** Executes the test suites in `e2e/specs/` one by one:
   - `tier1_features.spec.js` (Core features: Selection, Silhouette, Tooltips, Progress, Timeline)
   - `tier2_boundaries.spec.js` (Boundaries: Low temps, Warnings, Empty DB, Bad IDs, No times)
   - `tier3_pairwise.spec.js` (Combinations: Switch while hover, Rapid clicks, Sync updates, Scaling, Takeaway rules)
   - `tier4_realworld.spec.js` (Real-world: Multi-day arrival-to-completion sequence)
4. **Clean Shutdown:** Ensures the Next.js process group is cleanly terminated via `SIGINT` on completion or failure.

---

## 2. Test Execution & Coverage Summary

Because the implementation of the Unloading Status page (`UnloadingStatus.tsx`) is currently in progress, several elements (e.g., custom SVG cargo holds, circular progress gauges, custom vertical timeline paths, and specific `data-testid` markup) are not yet integrated. 

As a result, tests asserting on those elements are **expected to fail cleanly**. This is normal and serves as a verified baseline for the implementation team.

| Spec Category | Total Cases | Expected Pass | Expected Fail | Reason for Failures |
|---|---|---|---|---|
| **Tier 1: Feature Coverage** | 25 | 5 | 20 | Missing `data-testid` properties, SVG silhouette geometry details, hover tooltips, circular progress gauge overlays, and timeline nodes. |
| **Tier 2: Boundary Cases** | 25 | 7 | 18 | Missing temperature warning/critical color styles, empty timeline table message, error boundary templates, and timeline node calculations. |
| **Tier 3: Pairwise Combinations** | 5 | 1 | 4 | Missing hover segment event bindings, tooltip position anchors, and live data sync updates. |
| **Tier 4: Real-world Sequence** | 5 | 0 | 5 | Missing cargo hold fills, timeline nodes, and executive summary boxes for multi-day status transitions. |
| **Total** | **60** | **13** | **47** | **Expected baseline behavior prior to implementation completion.** |

---

## 3. Comprehensive Checklist of Test Cases

### Tier 1: Feature Coverage (`tier1_features.spec.js`)
- [x] **A1. Switch Vessel Focus** — Click vessel card (BAO LUCKY) and verify deep dive header updates. *(PASS via text fallback)*
- [x] **A2. Active vs. Completed Rendering** — Verify completed status badge on completed vessels (HIKARI). *(PASS via text fallback)*
- [x] **A3. Selection Highlight Sync** — Selected card receives active styling class. *(PASS)*
- [x] **A4. Vessel Listing Ordering** — Active vessels sorted above completed ones in DOM. *(PASS)*
- [x] **A5. No Session Bypass Check** — Developer mode bypasses login overlay automatically. *(PASS)*
- [ ] **B6. Presence of SVG** — `svg[data-testid="ship-silhouette"]` renders. *(FAIL - missing id)*
- [ ] **B7. 4x3 Grid Segments** — 12 cargo hold paths exist in the SVG layout. *(FAIL - missing segments)*
- [ ] **B8. Slanted Bow Geometry** — Bow compartments (1-B, 1-C) are polygon nodes. *(FAIL - missing geometry)*
- [ ] **B9. Fill Completion Heights** — Segment fill heights correspond to volume discharged. *(FAIL - missing fill styles)*
- [ ] **B10. Hold Text Overlays** — Cargo hold labels render inside SVG elements. *(FAIL - missing labels)*
- [ ] **C11. Tooltip Trigger** — Tooltip becomes visible on hold hover. *(FAIL - missing hover binding)*
- [ ] **C12. Tooltip Telemetry Verification** — Tooltip displays temperature parsed from timeline. *(FAIL - missing telemetry)*
- [ ] **C13. Tooltip Quality Description** — Tooltip displays correct quality text. *(FAIL - missing text)*
- [ ] **C14. Tooltip Dismissal** — Tooltip disappears on mouse leave. *(FAIL)*
- [ ] **C15. Tooltip Update on Swap** — Tooltip updates instantly when swapping hover targets. *(FAIL)*
- [ ] **D16. Radial SVG Presence** — Radial circular gauge renders in vessel cards. *(FAIL - missing gauge)*
- [ ] **D17. Stroke Dash Offset Match** — Circular progress dashoffset matches calculated progress. *(FAIL)*
- [ ] **D18. Neon/Glow Filter Appended** — Glow filter defs applied to active gauge. *(FAIL)*
- [ ] **D19. Percentage Label Sync** — Center percentage text matches actual value. *(FAIL)*
- [ ] **D20. Dynamic Re-calc on Switch** — Radial fill updates when swapping active vessel. *(FAIL)*
- [ ] **E21. Transit Lane Line Renders** — Vertical timeline lane is drawn. *(FAIL - missing timeline lane)*
- [ ] **E22. Reverse Chronological Sort** — Timeline logs ordered newest first. *(FAIL)*
- [ ] **E23. Anchor Node Presence** — Milestone nodes display anchor/ship icons. *(FAIL)*
- [ ] **E24. Sunday Off-day Rendering** — Sundays display distinct off-day styling and 0 MT daily log. *(FAIL)*
- [ ] **E25. Current Voyage Indicator Position** — Pulse/dot placed relative to timeline progress. *(FAIL)*

### Tier 2: Boundary & Corner Cases (`tier2_boundaries.spec.js`)
- [ ] **A1. Deep Cyber Blue Fill** — Hold measuring below -25°C turns Cyber Blue (`#0284c7`). *(FAIL - missing color coding)*
- [ ] **A2. Text Parsing Limit** — Tooltip shows exact decimal temperature (e.g., -26.0°C). *(FAIL)*
- [ ] **A3. Range Parsing Min-Max** — Safe parsing for ranges like `-24.0°C ~ -26.0°C`. *(FAIL)*
- [ ] **A4. No Spurious Alerts** — No amber warnings for extremely low temperatures. *(FAIL)*
- [ ] **A5. Efficiency Gauge Stability** — Deep freeze holds do not disrupt overall progress gauges. *(FAIL)*
- [ ] **B6. Amber Code Color** — Hold exceeding -18°C turns warning Amber (`#f59e0b`). *(FAIL)*
- [ ] **B7. Tooltip Warning Badge** — Warnings show alert labels inside tooltip. *(FAIL)*
- [ ] **B8. Edge Case of Exactly -18.0°C** — Exactly -18.0°C stays safe teal, not amber warning. *(FAIL)*
- [ ] **B9. Critical Spoilage Alert** — Temperatures > -17°C (e.g., -15.0°C) turn red (`#ef4444`). *(FAIL)*
- [ ] **B10. Vessel Card Highlight** — Active critical warning adds alert badge to vessel card. *(FAIL)*
- [x] **C11. Null API Fallback** — Fall back to staticData if database returns null. *(PASS)*
- [ ] **C12. Empty DB Timeline** — Evaluation yields `0.0%` progress when logs are empty. *(FAIL)*
- [ ] **C13. Empty Table Prompt** — Shows "하역 데이터가 없습니다" when logs are empty. *(FAIL)*
- [x] **C14. No Division By Zero** — Metric calculators display `0` rather than `NaN`. *(PASS)*
- [ ] **C15. API Timeout Grace** — Displays error banner/boundary upon 502/timeout. *(FAIL)*
- [x] **D16. Query Selector Recovery** — Defaults to first active vessel on bad query. *(PASS)*
- [x] **D17. State Index Out-of-Bounds** — Fallback safety for out-of-bounds state clicks. *(PASS)*
- [x] **D18. Unmapped Species Fallback** — Renders raw species code if not SJ or YF. *(PASS)*
- [x] **D19. Missing Buyer/Location** — Displays `-` for missing profile metadata. *(PASS)*
- [x] **D20. Vessel Card Key Missing** — Fleet grid doesn't crash on partial vessel data. *(PASS)*
- [ ] **E21. Average Calculation Exclusions** — Timeline nodes with `time: "-"` skipped. *(FAIL)*
- [ ] **E22. All Nodes Missing Time** — Returns `0.0 시간` when all node times are missing. *(FAIL)*
- [ ] **E23. Time Interval Cross-Day** — Calculates cross-midnight hours correctly (e.g., 9.0 hours). *(FAIL)*
- [ ] **E24. Malformed Time Format** — Ignores malformed times (e.g., "08:00") without crashing. *(FAIL)*
- [ ] **E25. Holiday Exemption** — Excludes Sundays and holiday texts from time averages. *(FAIL)*

### Tier 3: Pairwise Combinations (`tier3_pairwise.spec.js`)
- [ ] **1. State Reset on Switch during Hover** — Tooltip updates/clears when vessel is switched while hover is active. *(FAIL)*
- [x] **2. Double-Click & Rapid Selection** — Rapid clicks handle concurrency safely without rendering race conditions. *(PASS)*
- [ ] **3. Mock DB Interceptor Sync** — Live database updates reflect instantly in SVG/gauge. *(FAIL)*
- [ ] **4. Viewport Scaling with Hover Anchor** — Tooltip scales dynamically on browser resize. *(FAIL)*
- [ ] **5. Takeaway Box Logic Cross-Check** — Summary box is strictly bounded to vessels with `finalReport`. *(FAIL)*

### Tier 4: Real-World Scenarios (`tier4_realworld.spec.js`)
- [ ] **Step 1: Initial State (Day 1)** — Mock 1 day of logs, progress 4.8%, Hatch 4-A and 1-A partial fills. *(FAIL)*
- [ ] **Step 2: Add Day 2 (Day 2)** — Mock 2 days of logs, progress 15.2%, Hatch 4-B partial fill. *(FAIL)*
- [ ] **Step 3: Add Sunday Holiday (Day 3)** — Sunday holiday logged. ETA and averages remain stable. *(FAIL)*
- [ ] **Step 4: Add Day 4 (Day 4)** — Progress jumps to 94.3%. *(FAIL)*
- [ ] **Step 5: Final Discharge (Day 5)** — Progress 100%, Completed badge, Executive Takeaway box visible. *(FAIL)*
