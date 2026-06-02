## 2026-06-03T05:54:06Z

You are the E2E Test Developer. Your task is to establish the E2E testing track for the Unloading status page upgrade.

### MANDATORY INTEGRITY WARNING
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

### Context & Goals
1. Read the explorer's handoff files:
   - Proposed Test Plan & Specs: `/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/.agents/explorer_e2e_tests_1/proposed_TEST_INFRA.md`
   - Explorer Handoff: `/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/.agents/explorer_e2e_tests_1/handoff.md`
2. Create `TEST_INFRA.md` at the project root using the standard template in `COMPREHENSIVE_RULEBOOK.md` / UI rules. The template structure should be:
   - E2E Test Infra: Tuna Dashboard Unloading Page
   - Test Philosophy (Opaque-box, requirement-driven, request interception)
   - Feature Inventory (mapping features to requirements R1, R2, R3 across Tiers 1-3, and Tier 4 application scenarios)
   - Test Architecture (Test runner details, Directory layout)
   - Real-World Application Scenarios (Tier 4)
   - Coverage Thresholds
3. Write Puppeteer test scripts under the `e2e/` folder:
   - Directory Layout:
     - `e2e/run-tests.js`: The main test runner. It should launch the Next.js dev server (on port 3000 or an alternate available port), run the specs, log detailed results, and guarantee that the dev server process is clean-killed on completion or failure.
     - `e2e/specs/tier1_features.spec.js`
     - `e2e/specs/tier2_boundaries.spec.js`
     - `e2e/specs/tier3_pairwise.spec.js`
     - `e2e/specs/tier4_realworld.spec.js`
   - Writing Style: Standalone Node scripts using native `assert` and Puppeteer. Do not import Jest or other test frameworks unless they are already in `package.json` (they aren't).
   - Mocking Strategy: Use Puppeteer request interception (`page.setRequestInterception(true)`) to mock `/api/unloading-db` and `/api/tuna-live` response payloads. This is crucial for verifying boundaries like sub -25°C, warnings (> -18°C), empty database states, malformed timeline work times, and multi-day unloading sequences.
   - UI Selectors: Use static `data-testid` attributes as planned in `proposed_TEST_INFRA.md`.
4. Run and verify the test scripts.
   - Start the Next.js development server.
   - Run the test suite against the dev server using `e2e/run-tests.js`.
   - IMPORTANT: Since some UI elements (like the SVG ship cargo holds and circular progress gauges) might not be fully implemented in the current `UnloadingStatus.tsx` file (which is in progress on the implementation track), the tests checking for those components may fail. That is EXPECTED! The test runner should run, perform assertions, and fail cleanly when elements are missing. Ensure that the test runner logs these failures and exits with a standard error code without crashing the runner script itself. If there are tests that pass (e.g. vessel card switching, baseline headers), verify they pass.
5. Publish `TEST_READY.md` at the project root with the test runner execution command (e.g., `node e2e/run-tests.js`), the coverage summary, and the checklist of test cases.
6. Write a complete handoff report at `/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/.agents/worker_e2e_tests/handoff.md`. Include the commands run, test execution outputs (list of passed/failed tests), layout compliance verification, and next steps for the implementation track.

Do not write code or run commands outside of your task boundaries. Report your findings back in detail.
