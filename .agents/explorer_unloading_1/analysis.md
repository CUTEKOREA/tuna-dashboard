# Analysis - M/V SEIN PHOENIX Unloading Status Update

This document details the read-only codebase investigation and proposal to ingest M/V SEIN PHOENIX (`sein-phoenix`) unloading report data for June 2 and 3, 2026.

## 1. Problem Boundary & Objectives
- **Goal**: Accurately parse raw email daily reports for June 2 and June 3, 2026, mapping species and buyer metrics, and inserting them into the database via email webhook simulation.
- **Constraints**: 
  - Do NOT modify the database records directly.
  - Do NOT modify the source code directly (explorer role constraint).
  - Use `/api/webhooks/unloading?token=secret123` via `multipart/form-data` with a `text` field containing the raw email bodies.

## 2. Database Schema & State Investigation

The data is split across three main Supabase tables:
1. `unloading_vessels`:
   - `vessel_id` (PK, string, e.g. `'sein-phoenix'`)
   - `name` (string, e.g. `'M/V SEIN PHOENIX'`)
   - `location` (string)
   - `buyer` (string)
   - `status` (string, e.g. `'하역중 (In Progress)'`)
   - `reported_total` (numeric, total target cargo)
   - `date_range` (string)
2. `unloading_reports`:
   - `vessel_id` (FK to `unloading_vessels`)
   - `report_date` (PK element / text, e.g. `'6/2'`, `'6/3'`)
   - `work_time` (string)
   - `target_holds` (string)
   - `daily_amount` (numeric)
   - `cumulative_amount` (numeric)
   - `quality_notes` (text)
3. `unloading_species`:
   - `vessel_id` (FK to `unloading_vessels`)
   - `species_id` (string, e.g. `'SJ'`, `'YF'`)
   - `species_name` (string)
   - `reported_amount` (numeric)
   - `actual_amount` (numeric, cumulative amount of actual unloaded fish)

## 3. Parsing and Mapping Design

### A. Vessel ID Normalization
The email webhook receives raw vessel names like `M/V SEIN PHOENIX`.
In the current code, the vessel ID is parsed as:
```typescript
const vesselId = vesselRaw.toLowerCase().replace(/\s+/g, '-');
```
This maps `M/V SEIN PHOENIX` to `m/v-sein-phoenix`.
However, the database records and frontend rely on `sein-phoenix`.
**Proposed Fix**:
Strip the `m/v-` or `mv-` prefix when generating the `vesselId`:
```typescript
const vesselId = vesselRaw.toLowerCase().replace(/\s+/g, '-').replace(/^m\/v-|^mv-/, '');
```

### B. Species Ingestion & Aggregation
We need to support parsing of `UC, TUM, CMC, ISA, MMP, AAI, SJ, YF` from the email body.
The email body format for species breakdown is:
```
CMC 150.0 MT
TUM 48.78 MT
```
Or:
```
CMC 226.04 MT
TUM 10.10 MT
```

**Proposed Regex Mapping**:
```typescript
const speciesList = ['UC', 'TUM', 'CMC', 'ISA', 'MMP', 'AAI', 'SJ', 'YF'];
const parsedSpecies: { [key: string]: number } = {};
for (const sp of speciesList) {
  const regex = new RegExp(`${sp}\\s*([\\d,\\.]+)\\s*(?:MT|톤)?`, 'i');
  const match = textBody.match(regex);
  if (match) {
    parsedSpecies[sp] = parseFloat(match[1].replace(/,/g, ''));
  }
}
```

**Proposed Species ID Mapping**:
- `TUM`, `YF` -> `YF` (Yellowfin)
- `UC`, `CMC`, `ISA`, `MMP`, `AAI`, `SJ` -> `SJ` (Skipjack)

```typescript
const speciesMapping: { [key: string]: string } = {
  TUM: 'YF',
  YF: 'YF',
  UC: 'SJ',
  CMC: 'SJ',
  ISA: 'SJ',
  MMP: 'SJ',
  AAI: 'SJ',
  SJ: 'SJ'
};
```

### C. Species Database Accumulation
We will accumulate the parsed amounts in `unloading_species`:
1. Check if a record exists for `(vessel_id, species_id)`.
2. If it exists, update `actual_amount = existing_actual + parsed_daily_amount`.
3. If it does not exist, insert it:
   - `reported_amount`: for `sein-phoenix`, initialize `SJ` to `6646.000` and `YF` to `309.000`.
   - `actual_amount`: set to `parsed_daily_amount`.

## 4. Ground Truth Verification

Using the proposed parsing rules, the cumulative amounts are updated as follows:

| Date | Mapped Species | Daily Parsing Amount (MT) | Mapped Cumulative Actual (MT) | Expected Target Actual (MT) |
|------|----------------|---------------------------|-------------------------------|-----------------------------|
| **June 2** | `SJ` (CMC)     | `150.00`                  | `2022.49` (prior) + `150.00` = `2172.49` | `2172.490`                  |
| **June 2** | `YF` (TUM)     | `48.78`                   | `83.72` (prior) + `48.78` = `132.50`     | `132.500`                   |
| **June 3** | `SJ` (CMC)     | `226.04`                  | `2172.49` + `226.04` = `2398.53`         | `2398.530`                  |
| **June 3** | `YF` (TUM)     | `10.10`                   | `132.50` + `10.10` = `142.60`            | `142.600`                   |

This perfectly matches the ground truth cumulative amounts in the requirements!

## 5. Artifacts Produced
- `proposed_route.ts`: Contains the proposed Next.js webhook route implementation with the species accumulation and vessel initialization logic.
- `simulate_unloading_webhooks.js`: Contains a test script that sends June 2 and June 3 reports to the local web server and performs GET requests to verify correctness of DB status.
