# E2E Test Infra: Tuna Dashboard Unloading Page

This document establishes the End-to-End (E2E) testing framework and verification standards for the Unloading Status page (`/unloading`).

---

## 1. Test Philosophy

Our E2E testing framework is designed around three main pillars:
1. **Opaque-box Testing:** The tests interact with the page purely through public interfaces, DOM selectors, and user actions (clicks, hovers, inputs) without depending on internal React state or component-level APIs.
2. **Requirement-driven Verifications:** Every test is linked directly to a functional or non-functional requirement. If a requirement is modified, the corresponding test cases must adapt.
3. **Request Interception:** To decouple tests from external databases (Supabase) and third-party APIs, we use Puppeteer's network interception. This allows us to inject deterministic payloads, simulating various operational states (e.g., standard unloading, extremely low temperatures, high temperature warnings, empty states, and malformed inputs).

---

## 2. Feature Inventory

This inventory maps page features and requirement tiers directly to their design requirements.

### Tier 1: Feature Coverage (R1)
- **Vessel Selection Dropdown/Grid Cards:** Selectors must allow switching focus between active and completed vessels, displaying correct details for the active vessel.
- **SVG Ship Silhouette Rendering:** Verify the presence of the SVG cargo ship schematic with the 4x3 Hatch/Level grid layout (with custom layouts for vessels like *M/V SEIN PHOENIX* and *M/V BAO LUCKY*).
- **Hold Tooltips on Hover:** Hovering over cargo compartments must show a tooltip containing hold-specific temperature, species metadata, and quality statements.
- **Circular Progress Gauges:** Replace linear progress indicators with circular radial progress gauges that correctly represent vessel unloading completion percentage.
- **Vertical Timeline Path:** The timeline should render as a vertical shipping lane path, styled chronologically, showing Sunday off-days and milestone events.

### Tier 2: Boundary & Corner Cases (R2)
- **Extremely Low Temperatures (below -25°C):** Verifying the dark cyber-blue color coding and tooltip parsing for compartments measuring below -25°C.
- **Temperature Warnings (above -18°C):** Verifying color-coding (amber for warning, red for critical spoilage) and warning indicators when temperatures exceed -18°C.
- **Empty Database States:** Confirming fallback states, avoiding division by zero, and showing empty state indicators when no logs are returned.
- **Invalid Vessel IDs:** Confirming query parameter fallback handling and out-of-bounds safety.
- **Missing Timeline Work Times:** Gracefully skipping nodes with missing times and handling cross-day shifts.

### Tier 3: Cross-Feature Combinations (Pairwise) (R3)
- Intersecting state resets (hovering holds during vessel switches), rapid selection clicks, live database update merging, viewport scaling with tooltip recalculation, and takeaway box visibility rules.

### Tier 4: Real-World Scenarios
- **Scenario:** Full Multi-day Unloading Sequence Tracking (simulating arrival on Day 1, progression on Day 2, a Sunday holiday on Day 3, and final discharge on Day 5).

---

## 3. Test Architecture

### 3.1 Test Runner Details
The test suite utilizes a custom, standalone Node.js script located at `e2e/run-tests.js`. It performs the following duties:
- Automatically boots the Next.js development server (using `npm run dev`) on a designated port.
- Sequentially executes all spec files in the `e2e/specs/` directory.
- Logs verbose test results, capturing console logs and assertion statuses.
- Cleanly terminates the Next.js dev server process (guaranteeing port release) upon execution completion or unexpected failure.

### 3.2 Directory Layout
```
tuna-dashboard/
├── e2e/
│   ├── run-tests.js          # Master Puppeteer test runner & server process manager
│   └── specs/
│       ├── tier1_features.spec.js   # T1: Core feature assertions
│       ├── tier2_boundaries.spec.js # T2: Boundary conditions & empty states
│       ├── tier3_pairwise.spec.js   # T3: Cross-feature states & combinations
│       └── tier4_realworld.spec.js  # T4: Multi-day unloading scenarios
```

---

## 4. Real-World Application Scenarios (Tier 4)

### Scenario 1: Complete Vessel Unloading Sequence (M/V BAO LUCKY)
1. **Day 1 (Arrival):** Initial log containing `229.16 MT` is uploaded. Assert progress gauge reads `4.8%`.
2. **Day 2 (Progress):** A second log containing `500.00 MT` from Hatch 4-B is injected. Verify progress gauge rises to `15.2%`.
3. **Day 3 (Sunday Holiday):** Log with daily amount `0` and time `"-"` is processed. Verify Sunday styling is active and ETA/daily averages remain stable.
4. **Day 4 (Heavy Discharge):** Log with `3,800 MT` is injected. Assert progress rises to `94.3%`.
5. **Day 5 (Completion):** Final log for the remaining `273.84 MT` is uploaded, and the database status changes to "하역완료 (Completed)" with an added `finalReport`. Assert that the gauge reaches `100.0%`, the Completed status badge is shown, and the Executive Takeaway Box is rendered.

---

## 5. Coverage Thresholds

| Metric | Target | Description |
|---|---|---|
| Tier 1 Features | 100% | All core UI components must be asserted for presence & basic interactivity. |
| Tier 2 Boundaries | >= 5 per category | Must cover deep freezing, amber/red warning states, empty databases, invalid parameters, and malformed times. |
| Tier 3 Pairwise | 100% | All specified cross-feature combinations must be checked. |
| Tier 4 Real-World | 100% | The full multi-day sequence must be successfully simulated. |
