# Plan - Tuna Dashboard Unloading Update (Updated with Webhook Simulation)

## Steps
1. **Milestone 1: Exploration (Underway)**
   - Find the webhook handler at `app/api/webhooks/unloading/route.ts`.
   - Inspect its current implementation, especially how it parses email bodies and inserts to Supabase.
   - Inspect the SQLite/Postgres/Supabase structure for `unloading_vessels`, `unloading_reports`, and `unloading_species`.
2. **Milestone 2: Webhook Code Enhancement & Simulation**
   - Dispatch `teamwork_preview_worker` to:
     - Refactor the webhook handler `app/api/webhooks/unloading/route.ts` to parse species and buyer metrics:
       - Species parsed: `UC`, `TUM`, `CMC`, `ISA`, `MMP`, `AAI`, `SJ`, `YF`.
       - Map species: `TUM` and `YF` -> `YF` (Yellowfin); `UC`, `CMC`, `ISA`, `MMP`, `AAI`, and `SJ` -> `SJ` (Skipjack).
       - Accumulate daily amounts into `actual_amount` in the `unloading_species` table dynamically for the given vessel.
     - Implement a test simulation script that makes `multipart/form-data` POST requests to `/api/webhooks/unloading?token=secret123` with the raw email bodies for June 2 and June 3.
     - Validate that database contains correct cumulative amounts, actual species amounts, and report details.
3. **Milestone 3: Verification & Auditing**
   - Dispatch `teamwork_preview_reviewer` to review the route handler changes and the simulation script.
   - Dispatch `teamwork_preview_challenger` to run verification tests verifying that `/api/unloading-db` returns the correct data.
   - Dispatch `teamwork_preview_auditor` to check integrity and verify there are no violations.
4. **Milestone 4: User/Sentinel Handoff**
   - Report final completion status.
