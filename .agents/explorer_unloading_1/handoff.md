# Handoff Report - M/V SEIN PHOENIX Unloading Status Investigation

This handoff report describes the codebase analysis and proposals to ingest M/V SEIN PHOENIX unloading report data for June 2 and 3, 2026.

## 1. Observation
We analyzed the following files in the project workspace:
- **`app/api/webhooks/unloading/route.ts`**: Handles SendGrid email parse webhooks. It currently parses vessel details, daily amount, cumulative amount, target holds, and quality notes from email bodies. However, it lacks robust species accumulation logic (only checks CMC/TUM placeholder comments) and converts `M/V SEIN PHOENIX` raw text to `m/v-sein-phoenix` which mismatching the database record keys.
- **`app/api/unloading-db/route.ts`**: Exposes the database values for vessels, reports, and species at `/api/unloading-db`.
- **`components/UnloadingStatus.tsx`**: Renders the frontend unloading dashboard. It queries `/api/unloading-db` and falls back to hardcoded static data for `sein-phoenix` up to June 2.
- **`.env.local`**: Contains the Supabase configurations and `UNLOADING_WEBHOOK_SECRET="secret123"`.

## 2. Logic Chain
1. To ingestion daily report data through webhooks without direct DB manipulation, we must send a simulated SendGrid POST request containing raw email text to `/api/webhooks/unloading?token=secret123`.
2. To align the raw vessel name `M/V SEIN PHOENIX` with database record keys (which are mapped via `sein-phoenix`), we must strip prefixes like `m/v-` or `mv-` from the normalized vessel ID string in the webhook router.
3. To update the species actual amounts:
   - The webhook must dynamically parse all target species codes (`UC`, `TUM`, `CMC`, `ISA`, `MMP`, `AAI`, `SJ`, `YF`).
   - Group them based on species categories (`TUM` and `YF` -> `YF`; others -> `SJ`).
   - Fetch the current `actual_amount` from `unloading_species` and increment it by the parsed daily amount.

## 3. Caveats
- Since we are in CODE_ONLY mode, we cannot test database connectivity directly because of remote network restrictions.
- We assume the local developer has the Supabase server running or has network access to the remote staging database via standard client credentials.
- No other pages or handlers seem to insert directly to `unloading_species`, so this webhook is the sole entry point for email-driven updates.

## 4. Conclusion
To complete the task:
1. Replace `/app/api/webhooks/unloading/route.ts` with the proposed implementation file (`.agents/explorer_unloading_1/proposed_route.ts`).
2. Run the Next.js development server:
   ```bash
   npm run dev
   ```
3. Run the simulation script to post the June 2 and June 3 emails and verify the updates:
   ```bash
   node .agents/explorer_unloading_1/simulate_unloading_webhooks.js
   ```

## 5. Verification Method
- Execute the simulation script `.agents/explorer_unloading_1/simulate_unloading_webhooks.js` against the running Next.js application.
- Verify that the terminal output lists the correct cumulative totals as of June 3:
  - Skipjack (`SJ`): `2398.530`
  - Yellowfin (`YF`): `142.600`
  - Actual Total: `2541.130`
