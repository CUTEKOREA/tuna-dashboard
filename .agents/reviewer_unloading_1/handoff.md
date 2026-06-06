# Handoff Report — 2026-06-04T13:33:41Z

## 1. Observation

- **Modified Files**:
  - `app/api/webhooks/unloading/route.ts` (Webhook handler)
  - `components/PollockDraftInsights.tsx` (JSX layout correction)
  - `app/api/unloading-db/route.ts` (API route for Live/Local data retrieval)
  - `components/ReeferMovement.tsx` (Week 22 Port data update)
- **Top-Level Code in Webhook Route (`app/api/webhooks/unloading/route.ts:10-11`)**:
  ```typescript
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!.trim().replace(/\\n$/, '').replace(/\n$/, '');
  const supabaseKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!).trim().replace(/\\n$/, '').replace(/\n$/, '');
  ```
- **Top-Level Code in Database Route (`app/api/unloading-db/route.ts:8-10`)**:
  ```typescript
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseKey);
  ```
- **Execution when environment variables are missing (simulated by renaming `.env.local`)**:
  When hitting the webhook endpoint, Next.js server logs:
  ```
  ⨯ TypeError: Cannot read properties of undefined (reading 'trim')
      at module evaluation (app/api/webhooks/unloading/route.ts:10:59)
      at Object.<anonymous> (.next/dev/server/app/api/webhooks/unloading/route.js:7:3)
  ```
- **Simulation Script**:
  Run command: `PORT=3000 node scripts/simulate_webhooks.js`
  - Under normal conditions: Outputs `SUCCESS: Webhook simulation verified successfully!` (Skipjack = 2398.53, Yellowfin = 142.6).
  - Under key-missing conditions: Fails with status 500 or network error due to server-side module evaluation crash.

---

## 2. Logic Chain

1. **Top-Level Initialization**: Both `route.ts` files initialize the Supabase client at the global module scope. Specifically, `app/api/webhooks/unloading/route.ts` calls `.trim()` directly on `process.env.NEXT_PUBLIC_SUPABASE_URL` and `process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY` without checking if they are undefined.
2. **Crash on Missing Variables**: If environment variables are missing (such as in local fallback mode where keys are not injected, or during build-time evaluation), `process.env.NEXT_PUBLIC_SUPABASE_URL` is `undefined`, and `undefined!.trim()` throws a runtime `TypeError` immediately during module evaluation.
3. **Fallback Bypassed**: Although the code contains a condition `if (!hasServiceRoleKey) { ... }` to use the local JSON DB fallback (`scratch/local_db.json`), this logic is inside the `POST` or `GET` handler, meaning it is never reached because the module evaluation throws a TypeError at startup and the endpoints fail with a `500` status.
4. **Conclusion**: Therefore, the application fails to run or fall back to local storage correctly when Supabase keys are missing.

---

## 3. Caveats

- We did not explore alternative build setups where compilation could fail entirely during Server-Side Rendering (SSR) bundling if the bundler attempts to execute files containing non-null assertions without values.
- Assumed `scratch/local_db.json` is pre-seeded. If it doesn't exist, the local database loader (`getLocalDb()`) still tries to query Supabase (which would fail if the client itself is broken or unauthenticated).

---

## 4. Conclusion

- **Verdict**: **REQUEST_CHANGES**
- The webhook successfully implements prefix stripping, 어종별 mapping (UC, TUM, CMC, ISA, MMP, AAI, SJ, YF -> SJ/YF), dynamic accumulation, and idempotency logic under normal environment variables conditions.
- However, it **fails to operate when Supabase keys are missing** because the global Supabase initialization throws a `TypeError: Cannot read properties of undefined (reading 'trim')` before the request-level local JSON fallback logic can run.
- The same issue exists in `app/api/unloading-db/route.ts` where `createClient(undefined, undefined)` is called globally.
- Both routes need to defer Supabase initialization or wrap it in a safe check that avoids calling `.trim()` on undefined variables and safely handles the absence of the client.

---

## 5. Verification Method

To verify the issue:
1. Temporarily rename `.env.local` to disable the environment variables:
   ```bash
   mv .env.local .env.local.temp
   ```
2. Start the dev server:
   ```bash
   npm run dev
   ```
3. Run the simulation script:
   ```bash
   PORT=3000 node scripts/simulate_webhooks.js
   ```
   You will observe the webhook simulation fail with 500, and the Next.js dev server terminal will output:
   `TypeError: Cannot read properties of undefined (reading 'trim') at module evaluation (app/api/webhooks/unloading/route.ts:10:59)`
4. Restore the environment variables afterward:
   ```bash
   mv .env.local.temp .env.local
   ```

---

## Quality Review Report

**Verdict**: **REQUEST_CHANGES**

### Findings

#### [Critical] Finding 1: Initialization Crash on Missing Supabase Keys
- **Where**: `app/api/webhooks/unloading/route.ts` (lines 10-12), `app/api/unloading-db/route.ts` (lines 8-10)
- **Why**: Top-level module execution calls `.trim()` or `createClient` on undefined environment variables. This causes the server to throw a `TypeError` and crash the route upon evaluation, rendering the local JSON database fallback logic completely unreachable.
- **Suggestion**: Defer Supabase client creation or wrap it in a utility/getter function (e.g., `getSupabaseClient()`) that returns `null` or a mocked client when environment variables are missing, allowing the local fallback block to execute safely.

#### [Minor] Finding 2: Unconditional local baseline correction assumption
- **Where**: `app/api/webhooks/unloading/route.ts` (`getLocalDb()` function)
- **Why**: The baseline correction is applied inside the fallback block but only when the local DB file does not exist. If the file exists but has incorrect/unseeded baseline, it will return the uncorrected baseline, meaning correctness relies heavily on the JSON file's pre-seeded state.

### Verified Claims
- **Vessel ID prefix stripping**: Verified. `M/V SEIN PHOENIX` is correctly normalized to `sein-phoenix` via regex substitution.
- **Species Mapping**: Verified. `TUM` maps to `YF`, `CMC` maps to `SJ`.
- **Species Accumulation & Idempotency**: Verified. The script successfully accumulates Skipjack to `2398.53` and Yellowfin to `142.60`, and duplicate webhook submissions do not double-accumulate.

---

## Adversarial Challenge Report

**Overall risk assessment**: **MEDIUM**

### Challenges

#### [High] Challenge 1: Crash under Key-Missing Environments
- **Assumption challenged**: The route assumes `process.env.NEXT_PUBLIC_SUPABASE_URL` is always defined.
- **Attack scenario**: Deploying to a staging/testing server or local environment without Supabase credentials configured.
- **Blast radius**: Complete outage of both the webhook ingestion and DB API routes, rendering the live dashboard completely broken.
- **Mitigation**: Implement a safe environment checking wrapper around `createClient` and avoid `.trim()` calls on undefined values.

#### [Low] Challenge 2: Local DB concurrent access corruption
- **Assumption challenged**: The JSON database `scratch/local_db.json` is only accessed by a single request at a time.
- **Attack scenario**: Simultaneous webhook requests are received by the server.
- **Blast radius**: Race conditions lead to partial writes, data corruption, or incorrect accumulations in `scratch/local_db.json`.
- **Mitigation**: Use a file locking mechanism or database transaction wrapper to serialize writes to the local JSON file.
