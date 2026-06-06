## 2026-06-04T12:56:30Z
Update the unloading status (하역현황) for the carrier vessel M/V SEIN PHOENIX in the tuna-dashboard database based on daily reports for June 2, 2026, and June 3, 2026, and ensure the dashboard displays the updated data correctly.

Working directory: /Users/idong-geon/연구자동화애이전트들/tuna-dashboard

## Requirements

### R1. Database Data Ingestion
- Ensure the vessel **M/V SEIN PHOENIX** (`vessel_id: 'sein-phoenix'`) is updated in the `unloading_vessels` table:
  - Name: `M/V SEIN PHOENIX`
  - Location: `BANGKOK, THAILAND`
  - Buyer: `FCF CO.,LTD`
  - Status: `하역중 (In Progress)`
  - Reported Total: `6955.000`
  - Date Range: `2026.05.23 ~ 진행중`
- Ingest/upsert the daily unloading reports for **June 2 (6/2)** and **June 3 (6/3)** into the `unloading_reports` table for `vessel_id: 'sein-phoenix'`:
  - **June 2 (6/2)**:
    - Work Time: `08:20 ~ 14:00`
    - Target Holds: `S/SPR(#1-A), MOAMARI(#4-C)`
    - Daily Amount: `198.780`
    - Cumulative Amount: `2304.990`
    - Quality Notes: `S/SPR(#1-A): 어창 개방 측정온도 -20.0℃ ~ -21.0℃. 외관상태 및 색택 전반적으로 양호. MOAMARI(#4-C): 어창 개방 측정온도 -21.0℃ ~ -22.0℃. 외관상태 및 색택 전반적으로 양호. 명일(6/3)은 약 235톤 하역 진행 예정.`
  - **June 3 (6/3)**:
    - Work Time: `08:10 ~ 18:40`
    - Target Holds: `S/PIO(#3-A), MOAKONA(#2-B)`
    - Daily Amount: `236.140`
    - Cumulative Amount: `2541.130`
    - Quality Notes: `S/PIO(#3-A): 어창 개방 측정온도 -21.0℃ ~ -22.0℃. 외관상태 및 색택 전반적으로 양호. MOAKONA(#2-B): 어창 개방 측정온도 -21.0℃ ~ -22.0℃. 외관상태 및 색택 전반적으로 양호. 명일(6/4)은 약 330톤 하역 진행 예정.`
- Update the species actual amounts in the `unloading_species` table for `sein-phoenix`:
  - Species include `SJ` (Skipjack, reported: `6646.000`) and `YF` (Yellowfin, reported: `309.000`).
  - Update the actual amounts according to the ground truth from Excel sheets (which matches the cumulative values as of 6/2 and 6/3):
    - As of June 2 (Day 11): `SJ` actual cumulative = `2172.480` (or `2172.490`), `YF` actual cumulative = `132.500`
    - As of June 3 (Day 12): `SJ` actual cumulative = `2398.530`, `YF` actual cumulative = `142.600`

### R2. Verification & Testing
- Establish automated tests or verification scripts that fetch data from `/api/unloading-db` and assert that the returned data matches the reports above.
- Verify that the frontend (UI) correctly reflects the updated status and timeline when fetching data.

## Acceptance Criteria

### Data Correctness
- [ ] Database contains the `sein-phoenix` vessel with the correct reported total of 6,955 MT.
- [ ] `unloading_reports` table contains entries for `sein-phoenix` on report dates `6/2` and `6/3` with cumulative amounts matching 2,304.990 MT and 2,541.130 MT respectively.
- [ ] `unloading_species` table contains Skipjack and Yellowfin actual amounts matching 2,398.530 MT and 142.600 MT respectively as of 6/3.

### API & System Health
- [ ] `/api/unloading-db` returns `success: true` and includes `sein-phoenix` in the dataset with correct values.
- [ ] No regression or database errors are introduced.

## 2026-06-04T13:00:37Z
The user has updated the requirements for the M/V SEIN PHOENIX unloading status update task:

1. **Webhook Simulation Injection**: Do NOT insert data directly into the database via a standalone DB script. Instead, inject the June 2 and June 3 report data by simulating email webhook POST requests to `/api/webhooks/unloading?token=secret123` (using `multipart/form-data` with the 'text' field containing the raw email bodies).
2. **Enhance Webhook Code**: Refactor the webhook route handler (`app/api/webhooks/unloading/route.ts`) to:
   - Properly parse species/buyer metrics from the email body (including UC, TUM, CMC, ISA, MMP, AAI, SJ, YF).
   - Correctly map the parsed amounts to the corresponding species IDs (`SJ` or `YF`):
     - `TUM` and `YF` map to Yellowfin (`YF`).
     - `UC`, `CMC`, `ISA`, `MMP`, `AAI`, and `SJ` map to Skipjack (`SJ`).
   - Dynamically update the `unloading_species` table by accumulating the new daily actual amounts into the `actual_amount` column for the given vessel.
3. **Verify**: Ensure that after sending the webhook POST requests, the database updates match the expected values and that `/api/unloading-db` returns the correct data.

Please forward this to the Orchestrator and adapt your plans and verification checks accordingly.
