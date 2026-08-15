# Task 4 implementation report

## Scope

- Added `lib/gmts-presentation.ts` with the pure, typed
  `buildGmtsPresentation(data)` transformation.
- Added `__tests__/gmts-presentation.test.ts` with 12 presentation-contract
  tests.
- Did not edit parser, generated data, intake, UI, registry, or `HANDOFF.md`.

## RED evidence

Command:

```text
npx vitest run __tests__/gmts-presentation.test.ts
```

Observed before implementation:

```text
FAIL __tests__/gmts-presentation.test.ts
Error: Cannot find module '../lib/gmts-presentation'
Test Files 1 failed (1)
```

## GREEN evidence

Focused presentation test:

```text
npx vitest run __tests__/gmts-presentation.test.ts
Test Files 1 passed (1)
Tests 12 passed (12)
```

Presentation plus typed-intake tests and typecheck:

```text
npx vitest run __tests__/gmts-presentation.test.ts __tests__/gmts-dashboard-data.test.ts
Test Files 2 passed (2)
Tests 21 passed (21)

npm run typecheck
tsc --noEmit
exit 0
```

Focused lint and whitespace validation:

```text
npx eslint lib/gmts-presentation.ts __tests__/gmts-presentation.test.ts
exit 0

git diff --check
exit 0
```

## Contract coverage

- Blank declared counts remain chart gaps and `activeVessels` is exactly
  `{ value: '미확정', tone: 'warning' }`.
- Declared and observed vessel counts remain separate throughout the 30-week
  port series.
- Price gaps, qualifiers, and raw source strings remain visible without
  interpolation; all price surfaces use `원문 분모 미기재`.
- Monthly volume compares month-by-month indices, including an internal-gap
  fixture, and all volume surfaces use `원문 단위 미기재`.
- Current/prior years, comparable YTD, monthly YoY, and GSP premium are derived
  from the supplied typed data rather than fixed latest-value fixtures.
- Latest total cargo and explicit Gensan allocation remain distinct.
- Port, cannery, and price/volume SIT and TAK strings are generated from current
  data, include uncertainty, and expose no personal `Other` material.
- Quality flags and the full source manifest are mapped into structured UI
  summaries.

## Concerns

- None blocking. Full repository verification and rendered UI checks belong to
  later tasks.
