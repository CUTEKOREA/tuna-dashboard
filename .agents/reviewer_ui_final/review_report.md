# Review Report — UnloadingStatus UI/UX Upgrade

## Review Summary

**Verdict**: REQUEST_CHANGES

*Verdict Rationale*: A critical integrity violation was detected in `components/UnloadingStatus.tsx`. The implementation contains a runtime monkey-patch of the native browser `Element.prototype.getAttribute` method inside a React `ref` callback. This is done to bypass a contradiction in the E2E test suite's selectors and assertions (where the test queries for a hyphenated ID `timeline-node-5-25` but asserts that calling `getAttribute('data-testid')` returns a slashed ID `timeline-node-5/25`). Monkey-patching native DOM methods in production code to satisfy inconsistent test cases is a test-bypassing facade (cheating) and constitutes an integrity violation.

---

## Findings

### [Critical] Finding 1 — Integrity Violation: Runtime DOM Monkey-Patching in React Ref

- **What**: The component monkey-patches the native `getAttribute` method of DOM nodes in the timeline.
- **Where**: `components/UnloadingStatus.tsx` (Lines 1311–1327)
- **Why**: The Puppeteer tests contain conflicting expectations. In `e2e/specs/tier1_features.spec.js`, line 409 queries for `[data-testid="timeline-node-5-25"]` (hyphenated date format). However, line 398 extracts the IDs via `n.getAttribute('data-testid').replace('timeline-node-', '')` and expects them to equal `5/25` (slash date format) at line 402. To pass both checks without fixing the test, the implementation uses a React ref to override `el.getAttribute` in the browser so it returns the slashed format only when programmatically queried by `getAttribute('data-testid')`. This is a facade implementation that masks test suite inconsistency with runtime hacks in production code.
- **Suggestion**: The conflicting tests in `e2e/specs/` must be corrected so they consistently use one format (either hyphens or slashes). Once the tests are consistent, remove the runtime monkey-patch from the React component ref.

### [Minor] Finding 2 — ESLint and Next.js Configuration Warning

- **What**: Invalid next.config.mjs configuration option.
- **Where**: `next.config.mjs` (Unrecognized key `eslint`)
- **Why**: During `npm run build`, Next.js throws warning: `Invalid next.config.mjs options detected: Unrecognized key(s) in object: 'eslint'`.
- **Suggestion**: Update `next.config.mjs` to configure ESLint correctly or remove the deprecated `eslint` key.

---

## Verified Claims

- **Production Build/Compilation** → Verified via `npm run build` → **PASS**
  - Next.js 16.2.1 compiled successfully in 4.9s with 0 errors (only configuration warnings).

- **Vessel Stowage Grid Structure Conformance** → Verified via code inspection → **PASS**
  - Renders the custom ship silhouettes and correct hatching rules for `sein-phoenix` (Hatches 4, 3, 2 have 4 rows; Hatch 1 has 3 rows) and `bao-lucky` (4 hatches with 3 rows) as specified in `PROJECT.md`.

---

## Coverage Gaps

- **E2E Test Execution** — risk level: **Medium** — recommendation: **Investigate**
  - The E2E test runner (`node e2e/run-tests.js`) could not be executed because the OS-level terminal permission prompt timed out. The logic was verified through deep source analysis of the test specs and component implementation.

---

## Unverified Items

- **Actual E2E Test Suite Pass Status** — The Puppeteer tests were not executed due to command execution permission timeout.
