# E2E Test Infrastructure & Plan (Puppeteer)

This document outlines the testing architecture, API mocking strategy, and detailed execution plan for verifying the high-fidelity Unloading Status page (`/unloading`).

---

## 1. Test Directory Structure

We recommend placing all E2E test files under an `e2e/` folder at the root of the `tuna-dashboard` project:

```
tuna-dashboard/
├── e2e/
│   ├── fixtures/
│   │   ├── live-data-default.json
│   │   ├── db-data-default.json
│   │   └── db-data-extreme.json
│   ├── specs/
│   │   ├── tier1_features.spec.js
│   │   ├── tier2_boundaries.spec.js
│   │   ├── tier3_pairwise.spec.js
│   │   └── tier4_realworld.spec.js
│   ├── mockServer.js         # Optional helper for local mock injection
│   └── run-tests.js          # Master Puppeteer test runner
```

---

## 2. API Mocking Strategy

To make tests reproducible and independent of the Supabase database and live server status, the E2E test suite utilizes **Puppeteer Request Interception**. By intercepting fetches to `/api/tuna-live` and `/api/unloading-db`, the test suite can feed customized telemetry, mock dates, empty states, and abnormal temperatures directly to the frontend.

### Mocking Example inside Puppeteer:
```javascript
const puppeteer = require('puppeteer');

async function runTestWithMocks(vesselDbMock, liveTelemetryMock) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // Enable request interception
  await page.setRequestInterception(true);

  page.on('request', (request) => {
    const url = request.url();
    if (url.includes('/api/unloading-db')) {
      request.respond({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: vesselDbMock }),
      });
    } else if (url.includes('/api/tuna-live')) {
      request.respond({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(liveTelemetryMock),
      });
    } else {
      request.continue();
    }
  });

  await page.goto('http://localhost:3000/unloading');
  
  // Execute test assertions here...
  
  await browser.close();
}
```

---

## 3. Recommended HTML & Selector Contracts

To keep tests resilient to style and structure rewrites, the frontend implementation must expose specific `data-testid` contracts:

| Element Description | Selection Selector | Expected Attributes / Content |
|---|---|---|
| Vessel Selector Card/Dropdown | `[data-testid="vessel-select-item-[vessel-id]"]` | Clickable card or `<option>` |
| Active Vessel Indicator | `[data-testid="vessel-select-item-[vessel-id]"].active` | Styled active state class |
| Ship Silhouette Container | `svg[data-testid="ship-silhouette"]` | Main SVG element |
| Individual Cargo Hold Segment | `[data-testid="hold-segment-[hatch]-[level]"]` | E.g. `[data-testid="hold-segment-4-A"]` |
| Floating Tooltip Container | `[data-testid="hold-tooltip"]` | Visible when hold is hovered |
| Circular Progress Gauge | `svg[data-testid="progress-gauge-[vessel-id]"]` | Radial circle with `stroke-dashoffset` |
| Progress Value Text | `[data-testid="progress-percentage-label"]` | Float number string e.g., `33.1%` |
| Shipping Lane Timeline Path | `[data-testid="vertical-shipping-path"]` | Vertical flex/grid line |
| Individual Timeline Node | `[data-testid="timeline-node-[date]"]` | Timeline milestone |
| Executive Takeaway Summary Box | `[data-testid="exec-takeaway-box"]` | Displayed only if `finalReport` exists |
| Temperature Text in Tooltip | `[data-testid="tooltip-temp"]` | E.g. `-24.0°C` |

---

## 4. Test Tiers Specification

### Tier 1: Feature Coverage (>= 5 cases per feature)

#### Feature A: Vessel Selection Dropdown/Grid Cards
1. **Switch Vessel Focus:** Clicking on `[data-testid="vessel-select-item-bao-lucky"]` updates page state and displays "M/V BAO LUCKY - 상세 하역 분석" in the deep dive card.
2. **Active vs. Completed Rendering:** Clicking completed vessel `[data-testid="vessel-select-item-hikari"]` displays Completed status badge (`statusBadge completed` style) and correct GENSAN metadata.
3. **Selection Highlight Sync:** Clicking a vessel card appends the `.active` class to the card and removes it from previously active cards.
4. **Vessel Listing Ordering:** Asserts that active vessels (e.g., `sein-phoenix`, `bao-lucky`) are positioned above completed ones (`hikari`, `dinok`) in the left/top grid.
5. **No Session Bypass Check:** Verifies that when session is mock-authenticated (development mode), the landing page overlay is dismissed and dashboard features are interactive.

#### Feature B: SVG Ship Silhouette Rendering
6. **Presence of SVG:** Confirming `svg[data-testid="ship-silhouette"]` renders with viewbox dimensions of `800x260` (or responsive ratio).
7. **4x3 Grid Segments:** Asserts that 12 hold paths exist in the DOM with attributes from `#1-A` to `#4-C`.
8. **Slanted Bow Geometry:** Verifies `#1-B` and `#1-C` are drawn as `<polygon>` nodes with coordinate bounds reflecting a slanted bow.
9. **Fill Completion Heights:** Asserts hold segment gradient offsets or clip-paths match the percentage of cargo unloaded from that hold.
10. **Hold Text Overlays:** Checks that hold labels (e.g., "4A", "2B") are rendered as SVG `<text>` elements aligned to cell midpoints.

#### Feature C: Hold Tooltips on Hover
11. **Tooltip Trigger:** Simulates hover over `[data-testid="hold-segment-2-A"]` and asserts that `[data-testid="hold-tooltip"]` transitions to visible (CSS opacity/display check).
12. **Tooltip Telemetry Verification:** Asserts that tooltip text displays the correct temperature parsed from timeline data (e.g., `-24.0°C`).
13. **Tooltip Quality Description:** Confirms tooltip reads out the correct quality metadata string ("외관상태 및 색택 전반적으로 양호").
14. **Tooltip Dismissal:** Moves mouse to `(0, 0)` and asserts that the tooltip container is hidden or removed from the DOM.
15. **Tooltip Update on Swap:** Hovering on `hold-segment-4-A`, checking contents, then moving to `hold-segment-2-B` instantly updates tooltip text.

#### Feature D: Circular Progress Gauges
16. **Radial SVG Presence:** Confirms radial circular gauge has `cx`, `cy`, and `r` circle attributes.
17. **Stroke Dash Offset Match:** Asserts `stroke-dashoffset` equals mathematically computed circumference offset based on progress: $S = 2\pi r \times (1 - P/100)$.
18. **Neon/Glow Filter Appended:** Checks that the progress circle has the filter attribute `url(#radial-glow)` referencing the glow defs.
19. **Percentage Label Sync:** Confirms center label text inside the gauge matches the calculated percentage value (e.g., `4.8%`).
20. **Dynamic Re-calc on Switch:** Switching vessels triggers transition animation and recalculates radius fill to new progress level.

#### Feature E: Vertical Timeline Path
21. **Transit Lane Line Renders:** Verifies vertical `<line>` exists with `stroke-dasharray="8, 5"` and correct sea gradient color definition.
22. **Reverse Chronological Sort:** Verifies timeline list items are ordered newest date first (e.g. `6/2` appears above `5/23`).
23. **Anchor Node Presence:** Asserts key milestone nodes display Lucide anchor/ship indicators depending on state (completed vs active).
24. **Sunday Off-day Rendering:** Asserts sunday nodes (e.g., `5/24`) display holiday text and 0 MT daily quantity with distinct styling.
25. **Current Voyage Indicator Position:** Verifies a pulsing dot or ship icon is absolute-positioned along the timeline path relative to progress.

---

### Tier 2: Boundary & Corner Cases (>= 5 cases per feature)

#### Boundary A: Extremely Low Temperatures (below -25°C)
1. **Deep Cyber Blue Fill:** Intercepts API to set hold temperature to `-26.0°C`. Asserts compartment fill changes to Cyber Blue (`#0284c7`).
2. **Text Parsing Limit:** Asserts tooltip accurately reads out `-26.0°C` without rounding or formatting errors.
3. **Range Parsing Min-Max:** For temperature input of `-24.0°C ~ -26.0°C`, checks that the parser computes the average or registers the lowest temperature safely.
4. **No Spurious Alerts:** Verifies no warning or alert indicator appears when temperature is super-frozen (< -24°C).
5. **Efficiency Gauge Stability:** Verifies radial progress gauges are unaffected by sub-25°C measurements.

#### Boundary B: Temperature Warnings (above -18°C)
6. **Amber Code Color:** Mocks hold temperature to `-17.0°C`. Asserts compartment fill changes to Amber warning color (`#f59e0b`).
7. **Tooltip Warning Badge:** Confirms warning text or a warning exclamation icon appears inside the tooltip for active warning holds.
8. **Edge Case of Exactly -18.0°C:** Intercepts API to output exactly `-18.0°C`. Verifies it maps to teal/safe, not amber.
9. **Critical Spoilage Alert (> -17.0°C):** Mocks temperature to `-15.0°C`. Asserts hold turns warning Red (`#ef4444`).
10. **Vessel Card Highlight:** Verifies that if any hold is in warning/critical state, an alert indicator icon is added to the vessel selection card.

#### Boundary C: Empty Database States
11. **Null API Fallback:** Mocks `/api/unloading-db` to return `data: null`. Verifies page falls back to `staticData` without throwing fatal errors.
2. **Empty DB Timeline:** Sets timeline to `[]` for a custom mock vessel. Asserts progress gauge evaluates to `0.0%` (not `NaN%`).
13. **Empty Table Prompt:** Verifies "하역 데이터가 없습니다" is displayed in the timeline panel when no logs exist.
14. **No Division By Zero:** Asserts mathematical metrics (daily average, speed) display `0` rather than crashing the javascript runtime.
15. **API Timeout Grace:** Mocks API failure (502 Gateway Error). Asserts that dashboard shows an Error Boundary or a connection failure message.

#### Boundary D: Invalid Vessel IDs
16. **Query Selector Recovery:** Launches page with URL `/unloading?vessel=titanic-ghost`. Asserts dashboard defaults to first active vessel (`sein-phoenix`).
17. **State Index Out-of-Bounds:** Simulates clicking a card with an unmapped ID. Verifies React state falls back safely to default.
18. **Unmapped Species Fallback:** Mocks db data containing a species code other than `SJ` or `YF`. Asserts page lists the raw species code without breaking.
19. **Missing Buyer/Location Values:** Mocks vessel profile lacking buyer/location. Asserts dashboard displays `-` instead of blank slots.
20. **Vessel Card Key Missing:** Asserts page doesn't throw null reference warnings when rendering partial vessel objects.

#### Boundary E: Missing Timeline Work Times
21. **Average Calculation Exclusions:** Timeline node contains `time: "-"`. Verifies working hours calculator skips this entry and does not pollute calculations.
22. **All Nodes Missing Time:** If all timeline entries have `time: "-"`, asserts "평균 작업시간" displays `0.0 시간` instead of `NaN` or crashing.
23. **Time Interval Cross-Day:** Intercepts timeline node with night shift `time: "22:00 ~ 07:00"` (crossing midnight). Asserts average work hours calculates this as `9.0` hours, not negative `-15.0` hours.
24. **Malformed Time Format:** Input is `time: "08:00"`. Asserts parser ignores the entry without a crash.
25. **Holiday Exemption:** Confirms holiday text (e.g. "일요일 휴무", "Cannery 휴무") is parsed and skips hours calculation.

---

### Tier 3: Cross-Feature Combinations (Pairwise)

1. **State Reset on Switch during Hover:** Hover over compartment `#4-A` of `bao-lucky` to show tooltip. While hover is active, click `[data-testid="vessel-select-item-sein-phoenix"]`. Assert that the tooltip instantly updates to show `sein-phoenix` `#4-A` data or dismisses cleanly.
2. **Double-Click & Rapid Selection:** Rapidly click `bao-lucky`, `hikari`, and `sein-phoenix` cards in sequence. Assert that the dashboard successfully renders the final clicked vessel's SVG holds and charts without race-condition data overlays.
3. **Mock DB Interceptor Sync:** While viewing `bao-lucky`, inject an updated `/api/unloading-db` payload showing a new daily log entry. Verify that the circular gauge completion percentage rises, a new node is appended to the timeline path, and the corresponding SVG hold changes color/fill in real-time.
4. **Viewport Scaling with Hover Anchor:** Hover over an SVG hold to display the tooltip, then resize the browser window. Verify that the tooltip re-anchors correctly relative to the scaled SVG element's absolute bounding rect.
5. **Takeaway Box Logic Cross-Check:** Switch from a completed vessel containing `finalReport` (which displays the executive summary box) to an active vessel without `finalReport`. Assert that the summary box is removed from the DOM and does not leak content between vessels.

---

### Tier 4: Real-World Scenarios

#### Scenario: Full Multi-day Unloading Sequence Tracking
This scenario tracks a simulated vessel (`M/V BAO LUCKY`) from initial arrival to completion:
1. **Initial State (Day 1):** Mocks database to show 1 single day of unloading (actual volume: `229.16 MT`, reported: `4,803 MT`). Asserts progress gauge reads `4.8%`, Hatch 4-A and Hatch 1-A display partial teal fills.
2. **Add Day 2 (Day 2):** Injects Day 2 data (daily amount: `500.00 MT` from Hatch 4-B). Asserts progress increases to `15.2%` and Hatch 4-B updates to show teal fill, with the tooltip displaying correct date details.
3. **Add Sunday Holiday (Day 3):** Injects Day 3 data (`time: "-"`, `dailyAmount: 0`). Asserts timeline node displays Sunday 휴무 and average daily amount, speed, and ETA remain steady.
4. **Add Day 4 (Day 4):** Injects Day 4 data (daily amount: `3,800 MT`). Asserts progress jumps to `94.3%`.
5. **Final Discharge (Day 5):** Injects Day 5 data completing the remaining `273.84 MT` and changes the database status to "하역완료 (Completed)" and adds `finalReport`. Asserts:
   - Progress gauge reaches `100.0%`.
   - Vessel status badge changes to Completed (green theme).
   - Executive Takeaway box is rendered in the UI with takeaway insights.
   - Asserts all calculations are visually matching (reported = actual, surplus = 0).

---

## 5. Sample Puppeteer Test Script

Save the following script as `e2e/specs/unloading-status.spec.js` and execute it with `node e2e/specs/unloading-status.spec.js`:

```javascript
/**
 * Standalone Puppeteer test verifying UnloadingStatus features.
 * Assumes the Next.js dev server is running on http://localhost:3000
 */
const puppeteer = require('puppeteer');
const assert = require('assert');

// Mock data fixtures
const mockDbData = {
  "bao-lucky": {
    name: "M/V BAO LUCKY",
    dateRange: "2026.06.02 ~ 진행중",
    location: "BANGKOK, THAILAND",
    buyer: "FCF CO.,LTD",
    status: "하역중 (In Progress)",
    reportedTotal: 4803.000,
    actualTotal: 229.160,
    surplus: -4573.840,
    species: [
      { id: "SJ", name: "Skipjack", reported: 4176.000, actual: 204.460, surplus: -3971.540 },
      { id: "YF", name: "Yellowfin", reported: 627.000, actual: 24.700, surplus: -602.300 }
    ],
    timeline: [
      { 
        date: "6/2", 
        time: "09:00 ~ 17:10", 
        targetHol: "S/EXP(#4-A), N/STAR(#1-A)", 
        dailyAmount: 229.160, 
        cumAmount: 229.160, 
        quality: "S/EXP(#4-A): 어창 개방 측정온도 -18.0℃ ~ -19.0℃. N/STAR(#1-A): -19.0℃ ~ -20.0℃." 
      }
    ]
  }
};

const mockLiveData = {
  unloading: {
    congestion: "High",
    delayDays: 3
  }
};

(async () => {
  console.log("Starting Puppeteer E2E Test Suite...");
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    // Enable request interception to mock Supabase and Telemetry APIs
    await page.setRequestInterception(true);
    page.on('request', (request) => {
      const url = request.url();
      if (url.includes('/api/unloading-db')) {
        request.respond({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, data: mockDbData })
        });
      } else if (url.includes('/api/tuna-live')) {
        request.respond({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockLiveData)
        });
      } else {
        request.continue();
      }
    });

    console.log("Navigating to dashboard unloading page...");
    // Bypass auth in development mode automatically
    await page.goto('http://localhost:3000/unloading', { waitUntil: 'networkidle2' });

    // Assert Page title / Header presence
    const headerText = await page.$eval('h2, div[class*="pageTitle"]', el => el.textContent);
    console.log(`Page Loaded. Header Text: "${headerText.trim()}"`);
    assert(headerText.includes("하역 현황") || headerText.includes("Unloading"), "Unloading page header not found!");

    // Switch vessel to BAO LUCKY
    const baoLuckyCardSelector = '[data-testid="vessel-select-item-bao-lucky"]';
    // Fallback support if custom testids are not applied yet (clicks the card containing "BAO LUCKY")
    const cardFound = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('div[class*="vesselCard"]'));
      const targetCard = cards.find(c => c.textContent.includes("BAO LUCKY"));
      if (targetCard) {
        targetCard.click();
        return true;
      }
      return false;
    });
    
    assert(cardFound, "Vessel card for BAO LUCKY not found!");
    console.log("Selected BAO LUCKY vessel card successfully.");

    // Wait for the SVG schematic to load
    await page.waitForSelector('svg[data-testid="ship-silhouette"]', { timeout: 5000 });
    console.log("SVG Ship Silhouette found in DOM.");

    // Assert hold segment exists and click it
    const holdSegmentSelector = '[data-testid="hold-segment-4-A"]';
    await page.waitForSelector(holdSegmentSelector, { timeout: 3000 });
    
    // Simulate hover (trigger tooltip)
    const holdBoundingBox = await page.$eval(holdSegmentSelector, el => {
      const rect = el.getBoundingClientRect();
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    });
    await page.mouse.move(holdBoundingBox.x, holdBoundingBox.y);
    await page.waitForSelector('[data-testid="hold-tooltip"]', { visible: true, timeout: 2000 });
    console.log("Tooltip displayed successfully on hold hover.");

    // Assert tooltip text includes correct temperature
    const tooltipText = await page.$eval('[data-testid="hold-tooltip"]', el => el.textContent);
    console.log(`Tooltip Text: "${tooltipText.trim()}"`);
    assert(tooltipText.includes("-18.0") || tooltipText.includes("-19.0"), "Tooltip temperature mismatch!");

    // Assert circular progress gauge is rendering correct value
    const progressTextSelector = '[data-testid="progress-percentage-label"]';
    const progressLabel = await page.$eval(progressTextSelector, el => el.textContent);
    console.log(`Unloading Progress: "${progressLabel.trim()}"`);
    assert.strictEqual(progressLabel.trim(), "4.8%", "Circular progress percentage mismatch!");

    console.log("E2E Test completed successfully: ALL ASSERTIONS PASSED!");

  } catch (error) {
    console.error("E2E Test Failed!", error);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
```
