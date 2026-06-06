## 2026-06-04T13:30:09Z

You are the Implementation Worker (teamwork_preview_worker) for the tuna-dashboard project.
Your working directory is: /Users/idong-geon/연구자동화애이전트들/tuna-dashboard/.agents/worker_unloading_2
Your identity: worker_unloading_2

Objective:
Refactor the webhook route handler at `app/api/webhooks/unloading/route.ts` based on the explorer's design, and run the webhook simulation to update the database for `sein-phoenix` with daily reports from June 2 and June 3, 2026.

Scope boundaries:
- Do NOT hardcode the updates in the database directly. All database changes must happen via simulated webhook requests (email POST requests to `/api/webhooks/unloading?token=secret123`).
- Refactor the code at `app/api/webhooks/unloading/route.ts` cleanly.
- Ensure the project compiles and builds successfully.

Tasks:
1. Initialize progress.md in your working directory.
2. Refactor the file `app/api/webhooks/unloading/route.ts` using the proposed code from `/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/.agents/explorer_unloading_1/proposed_route.ts`. Ensure it handles the prefix stripping (`m/v-`, `mv-`), parses all requested species (`UC`, `TUM`, `CMC`, `ISA`, `MMP`, `AAI`, `SJ`, `YF`), maps them correctly to `SJ` and `YF`, and dynamically updates `actual_amount` in the `unloading_species` table by accumulating the new daily amounts.
3. Write a simulation/verification script `scripts/simulate_webhooks.js` (you can base it on `.agents/explorer_unloading_1/simulate_unloading_webhooks.js`) that runs against the running application.
4. Run the Next.js dev server or build the application to verify it compiles. Run the simulation script to post the email payloads for June 2 and June 3.
5. Verify that `/api/unloading-db` returns the correct data, displaying cumulative amounts for June 3 (Skipjack cumulative = 2398.530, Yellowfin cumulative = 142.600).
6. Document your build/test commands and results in a `handoff.md` file in your working directory.
7. Send a message to the Project Orchestrator (conversation ID: 7a5167be-4d2d-4986-8929-f49541f60b85) when done.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.
