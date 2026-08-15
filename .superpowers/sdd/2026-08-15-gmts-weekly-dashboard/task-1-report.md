# Task 1: GMTS PDF normalizer and source manifest

## Status

Implementation, reviewer corrections, and full verification are complete on
`codex/gmts-dashboard-impl-20260815`. Original PDFs were read only. No push or
deployment was performed.

## Delivered

- Added `scripts/build_gmts_dashboard.py` using `pdfplumber==0.11.9`, with a
  CLI, `GMTS_SOURCE_DIR` override, SHA-256 source manifest, and stable JSON output.
- Replaced the latest-report fixture override with a generic coordinate/table-row
  parser. It discovers the three port lane tables from their source headers and
  derives vessel identifiers, traders, consignees, cargo fields, and dates from
  the extracted cells. Production parsing code contains no latest date, vessel,
  or latest numeric fixture literals.
- Generated forced-tracked `data/gmts_dashboard.json`: 30 reports, 38 pages,
  2026-01-21 through 2026-08-12, 82,441 bytes.
- Kept `weekly` compact, `latest` detailed, and `volumeHistory` as the owner of
  the annual volume table. Empty declarations and volume cells remain `null`;
  missing price and volume units remain unknown.
- Emitted all month series and the 2019–2026 annual table as ordered arrays,
  and emitted `qualityFlags` as a stable 41-entry structured array. Added a
  runtime report gate for cannery identity, four sum reconciliations, every
  individual/Total utilization, all annual rows, and annual totals. Revision
  detection now covers every present year and month.
- Added `npm run sync:gmts` and the focused regression suite.

## TDD evidence

1. Added two regression tests before changing production code: one rejected
   latest-report date/vessel fixture literals in parser/build helpers, and one
   required `parse_report` to produce complete source-derived vessel records.
2. RED was observed with 19 tests: one failure found the literal
   `2026-08-12` in `build_dashboard`; one error found missing `traders` on the
   generic `parse_report` result.
3. After the coordinate/table-row parser replaced the override, the same suite
   was GREEN: 19 tests passed.
4. Reviewer follow-up began RED at 24 tests with 2 failures and 7 errors for the
   object-shaped external contract, JavaScript array methods, missing runtime
   gate, and 2026-only revision detection. A minimal `validate_report` stub then
   proved the three mutation tests behaviorally RED with three expected
   `ValueError not raised` failures.
5. The array converters, runtime gate, and all-year revision detector made the
   focused suite GREEN: 24 tests passed.

## Verification

- `python3 scripts/test_build_gmts_dashboard.py` — 24 passed.
- `npm run sync:gmts` — generated 30 reports, latest 2026-08-12.
- Archive inspection — 165 vessel records; every record has the common five-key
  date schema and non-empty `rawFields`.
- Generated contract inspection — 82,441 bytes; annual years are ordered
  2019–2026, all month arrays have 12 entries, `qualityFlags` has 41 ordered
  entries, and JavaScript `.find()`, `.filter()`, and `.slice()` execute against
  the emitted arrays. Latest lane counts remain active 0, completed 2, incoming 3.
- Controller fresh `npm run verify` after the reviewer correction completed with
  exit code 0: ESLint 0 errors and 5 pre-existing warnings, TypeScript passed,
  Vitest 77 files/430 tests passed, API cache 153/153 passed, Next production
  build generated 117 pages, and bundle budget passed for 32 routes.

## Latest source anchors

- Latest source: `GMTS Weekly Report 20260812.pdf`
- SHA-256: `e84ad3bb26ebe05e863467bff3f4507775a8cf4b04adefa8026eb3414e1e5243`
- AMAGI and HIKARI 1 retain all cargo/discharge/short raw values and operational
  dates; SEIN QUEEN retains cargo, Gensan allocation, and ETA range.
- SEA BLAZER and QUEEN ELLICE retain raw cargo, normalized ETA, traders, and
  consignees without an empty `rawFields` object.
- February 2026 revision remains explicit: 6,220 in the 2026-03-04 report became
  11,968 in the 2026-03-11 report.

## Concern

The parser intentionally fails closed when the three port tables or required
report sections cannot be identified. Source tables can disagree with declared
heading counts; those independent source facts remain separate rather than being
forced to match.
