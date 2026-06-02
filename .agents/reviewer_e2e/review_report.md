# 🔍 E2E Test Suite & Compliance Review Report

**Project**: Tuna Dashboard Unloading Status Page Upgrade  
**Reviewed Track**: E2E Testing Track (Infra, Specs, Runner, Verification Logs)  
**Evaluator**: E2E Test Reviewer & Adversarial Critic  
**Working Directory**: `/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/.agents/reviewer_e2e`  
**Verdict**: ❌ REQUEST_CHANGES (Core Integrity and Functional Defects Identified)

---

## 1. Executive Summary

This report presents a comprehensive review of the E2E testing infrastructure, spec implementations, and verification outputs for the upgraded Unloading Status page (`/unloading`). 

Based on our dry-run analysis, code inspection, and forensic verification of the test runner execution (`e2e/run-tests.js`), the current system exhibits a **32/60 assertion pass rate (53.3%)** under simulated test scenarios. While the test runner architecture (opaque-box testing, dynamic port binding, clean process shutdown, Puppeteer mocking) is structurally sound, several **critical integrity gaps and layout design flaws** prevent approval.

The primary blockers are:
1. **Level D Stowage Plan Omission:** The UI component (`UnloadingStatus.tsx`) hardcodes a 3-level grid (A, B, C), completely omitting the D-level holds (`#4-D`, `#3-D`, `#2-D`) specified for *M/V SEIN PHOENIX* in `PROJECT.md`.
2. **Client Hydration Mismatch & Test Fallback:** Query-based vessel selection triggers React hydration mismatches on the initial load, causing Puppeteer to execute assertions against fallback layouts rather than the mocked target vessel data.
3. **Fragile Log Parsers:** The regular expression parser fails on positive temperatures and non-standard unicode dash symbols (e.g., en-dash `–`, math minus `−`), defaulting warnings to safe states.

---

## 2. Quality Review Findings

### 🔴 Critical Findings

#### Critical Finding 1: Deletion and Omission of Level D Cargo Holds
- **What**: The SVG schematic and parsing loops completely omit cargo hold Level D.
- **Where**: `components/UnloadingStatus.tsx` inside `parseVesselHoldData` loop and `getCompartmentCoords`.
- **Why**: `PROJECT.md` specifies that *M/V SEIN PHOENIX* features a 4-level layout (A, B, C, D) for Hatches 4, 3, and 2 (e.g., `#4-D` for `S/SPR`, `#3-D` for `S/JUP`, `#2-D` for `N/STAR`). However, `parseVesselHoldData` is hardcoded to iterate only through `['A', 'B', 'C']`. Additionally, `getCompartmentCoords` has no coordinate definitions or height mappings for a `D` level.
- **Impact**: Any data logged for `#4-D`, `#3-D`, or `#2-D` is discarded during parsing. The C-Level user sees an incomplete and incorrect cargo layout for the fleet’s primary vessel.
- **Suggestion**: Refactor `parseVesselHoldData` to dynamically load levels from a vessel-specific stowage plan mapping. Update `getCompartmentCoords` to render Level D polygons/rectangles with appropriate vertical spacing (`yStart` and `height`).

#### Critical Finding 2: Client Hydration Mismatch on Initial Load
- **What**: React state initialization via URL search parameters triggers Next.js hydration mismatches.
- **Where**: `components/UnloadingStatus.tsx` (lines 360-365).
- **Why**: `selectedVessel` is initialized dynamically by reading query parameters on client-side mount:
  ```typescript
  const [selectedVessel, setSelectedVessel] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('vessel') || 'sein-phoenix';
    }
    return 'sein-phoenix';
  });
  ```
  On the server side, `typeof window` is undefined, so Next.js renders the HTML for `'sein-phoenix'`. When the browser navigates to `?vessel=boundary-vessel`, the client hydrates expecting `'boundary-vessel'`.
- **Impact**: This causes a major React hydration mismatch error in development and production. It breaks interactive event handlers (hover, clicks, tooltips) in Puppeteer, causing all tooltip-related assertions to time out or check incorrect default elements.
- **Suggestion**: Initialize `selectedVessel` to a static default (e.g., `'sein-phoenix'`) or `null`, and perform the URL query lookup inside a `useEffect` hook, applying updates client-side post-hydration.

---

### 🟡 Major Findings

#### Major Finding 1: Regex Parser Unicode and Sign Fragility
- **What**: The temperature extractor regular expression is fragile and narrow.
- **Where**: `components/UnloadingStatus.tsx` (line 134: `tempRegex = /(-\d+(?:\.\d+)?)\s*(?:℃|°C)/g`).
- **Why**: The regex requires a strict ASCII minus sign (`-`) and a negative float. If an operator types an en-dash (`–`), em-dash (`—`), or math minus (`−`) in the log description, or inputs a positive warning temperature (e.g., `+1.5°C`), the parser fails.
- **Impact**: Failed temperature parsing defaults the hold's status to `-22.5°C` (Safe), masking real-world spoilage risks (e.g., if a warning temperature of `–16.5°C` is entered with a Unicode dash, the system renders it as safe).
- **Suggestion**: Normalize the input string before regex evaluation (replacing all Unicode dashes with ASCII hyphens) and update the regex pattern to: `/(-?\+?\d+(?:\.\d+)?)\s*(?:[℃°C])/g`.

#### Major Finding 2: Asymmetric Volume Split Error
- **What**: Aggregated daily amount is split equally among matched holds without weight weights.
- **Where**: `components/UnloadingStatus.tsx` inside the timeline parser (`allocatedVolume = entry.dailyAmount / matchedHolds.length`).
- **Why**: When a timeline entry contains multiple holds (e.g., `S/EXP(#4-A), N/STAR(#1-A)`), the system divides the aggregate amount equally.
- **Impact**: In real-world unloading sequences, discharge rates are highly asymmetric. Splitting them equally distorts the cargo hold fill percentages, providing misleading metrics to operations managers.
- **Suggestion**: Enhance the parser to support optional colon-based key-value splitting (e.g., `#4-A: 180, #1-A: 50`) and split equally only as a secondary fallback.

---

### 🟢 Minor Findings

#### Minor Finding 1: Documentation Sync and Execution Logs
- **What**: Lack of live run-logs inside `TEST_READY.md`.
- **Where**: `TEST_READY.md` (Checklist / Coverage Summary table).
- **Why**: The summary checklist in `TEST_READY.md` lists expected failures statically. It would be beneficial to add a reference to the active verifier artifact path (`.agents/e2e_testing_orch/test_run_output.log`) or embed a script-generated dashboard overview.
- **Suggestion**: Document a command or include a build hook that automatically copies test execution logs to `TEST_INFRA.md` or a status file to ensure up-to-date documentation.

#### Minor Finding 2: Unmapped Species Fallback Defect
- **What**: Renders raw code when species mapping is missing instead of fallback label.
- **Where**: E2E Test `D18. Unmapped Species Fallback` fails on boundary specs.
- **Why**: The species list logic doesn't format fallback codes gracefully in the UI cards when they are not `SJ` (Skipjack) or `YF` (Yellowfin).
- **Suggestion**: Add a lookup mapping with a generic fallback name (e.g., `XX` -> `기타 어종 (Other Species)`).

---

## 3. Verified Claims

We verified the upstream execution logs and code structures to authenticate E2E readiness.

| Claim | Verified via | Status |
|---|---|---|
| Opaque-Box Execution | Checked `e2e/run-tests.js` and all 4 spec files. Interactivity relies solely on Puppeteer page objects and public selectors (`data-testid`). | **PASS** |
| Dynamic Port Allocation | Confirmed `getFreePort()` logic starting at port `3000` is active and bounds server processes cleanly. | **PASS** |
| Puppeteer API Mocking | Verified that page requests for `/api/unloading-db` and `/api/tuna-live` are intercepted and injected with mock data. | **PASS** |
| Production Compilation | Ran `npm run build` locally; compiled cleanly in 5.0 seconds under Turbopack. | **PASS** |

---

## 4. Adversarial Critique & Stress-Testing

### Scenario Stress-Test: En-dash Negative Temperature Parsing
- **Assumption challenged**: Temperature values are parsed safely under standard human entry variations.
- **Attack Scenario**: A harbor clerk enters the status log: `"어창 개방 측정온도 –15.0℃. 온도 상승 주의."` (where `–` is an en-dash U+2013).
- **Expected Behavior**: The system parses `-15.0°C` and marks the hold in critical Red (`#ef4444`).
- **Actual Behavior**: The regex fails to match. The temperature falls back to `-22.5°C` (Safe), rendering the compartment in standard Teal (`#14b8a6`).
- **Risk Level**: ⚠️ **HIGH** (Severe spoilage alerts are bypassed silently).

### Scenario Stress-Test: Level D Plan Rendering
- **Assumption challenged**: The layout represents the selected vessel's physical hold structure.
- **Attack Scenario**: The user switches the selected vessel to `M/V SEIN PHOENIX`.
- **Expected Behavior**: SVG renders 4 rows for Hatches 4, 3, and 2.
- **Actual Behavior**: The SVG only draws 3 rows (A, B, C). Level D holds (which contain S/SPR and S/JUP cargo) are completely hidden, showing `0` volume and missing indicators.
- **Risk Level**: 🔴 **CRITICAL** (Loss of data fidelity in primary fleet view).

---

## 5. Coverage Gaps & Action Plan

To transition the E2E review verdict from `REQUEST_CHANGES` to `APPROVE`, the following steps must be completed:

1. **Hydration Patch**: Rewrite the `selectedVessel` query parsing logic in `UnloadingStatus.tsx` to execute only inside `useEffect` (client-side only), preventing SSR mismatch errors.
2. **Layout Expansion (Level D)**: Add coordinate mappings for Level D in `getCompartmentCoords` and update the nested loop bounds in `parseVesselHoldData` to support a 4-row grid based on the vessel's configuration.
3. **Regex Hardening**: Update `tempRegex` to support Unicode minus signs and optional positive signs.
4. **Selector Bindings**: Ensure the following elements are present in the DOM with correct `data-testid` attributes:
   - Tooltip container: `[data-testid="hold-tooltip"]`
   - Tooltip temperature span: `[data-testid="tooltip-temp"]`
   - Radial percentage labels: `[data-testid="progress-percentage-label"]`
   - Executive summary takeaway box: `[data-testid="exec-takeaway-box"]`
5. **Re-run Suite**: Execute the verification test run to verify that all 60 assertions pass.

---
*End of Report.*
