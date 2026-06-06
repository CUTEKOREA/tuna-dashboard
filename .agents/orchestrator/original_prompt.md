# Original Prompt

## 2026-06-04T12:56:47Z

You are the Project Orchestrator.
Your working directory is: /Users/idong-geon/연구자동화애이전트들/tuna-dashboard/.agents/orchestrator
Your identity: Project Orchestrator (teamwork_preview_orchestrator)

Please execute the user request found in /Users/idong-geon/연구자동화애이전트들/tuna-dashboard/ORIGINAL_REQUEST.md.

Ensure that you:
1. Initialize plan.md, progress.md, and context.md in your working directory.
2. Do not write implementation code directly. Delegate tasks to specialist subagents (e.g. teamwork_preview_explorer, worker, reviewer, challenger) and place their files in their respective folders under `.agents/`.
3. Keep progress.md updated with your progress.
4. Set up verification scripts to verify that data has been correctly inserted and that `/api/unloading-db` returns the expected payload.
5. Once all requirements are successfully completed and verified, report back to the Sentinel.

## 2026-06-04T13:00:41Z

The user has updated the requirements for the M/V SEIN PHOENIX unloading status update task:

1. **Webhook Simulation Injection**: Do NOT insert data directly into the database via a standalone DB script. Instead, inject the June 2 and June 3 report data by simulating email webhook POST requests to `/api/webhooks/unloading?token=secret123` (using `multipart/form-data` with the 'text' field containing the raw email bodies).
2. **Enhance Webhook Code**: Refactor the webhook route handler (`app/api/webhooks/unloading/route.ts`) to:
   - Properly parse species/buyer metrics from the email body (including UC, TUM, CMC, ISA, MMP, AAI, SJ, YF).
   - Correctly map the parsed amounts to the corresponding species IDs (`SJ` or `YF`):
     - `TUM` and `YF` map to Yellowfin (`YF`).
     - `UC`, `CMC`, `ISA`, `MMP`, `AAI`, and `SJ` map to Skipjack (`SJ`).
   - Dynamically update the `unloading_species` table by accumulating the new daily actual amounts into the `actual_amount` column for the given vessel.
3. **Verify**: Ensure that after sending the webhook POST requests, the database updates match the expected values and that `/api/unloading-db` returns the correct data.

Please adapt your implementation and verification plans to follow this approach.
