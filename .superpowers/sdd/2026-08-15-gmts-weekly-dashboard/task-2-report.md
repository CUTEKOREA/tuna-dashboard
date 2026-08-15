# Task 2 구현 보고

## 변경 파일

- `lib/data/gmts.ts`
- `__tests__/gmts-dashboard-data.test.ts`

## RED 증거

명령:

```bash
npx vitest run __tests__/gmts-dashboard-data.test.ts
```

결과: 종료 코드 1. `lib/data/gmts.ts`가 없는 상태에서 `Cannot find module '../lib/data/gmts'`로 예상대로 실패했고, 테스트 구현 전에 생산 모듈이 존재하지 않음을 확인했다.

## GREEN 증거

명령:

```bash
npx vitest run __tests__/gmts-dashboard-data.test.ts
```

결과: 테스트 파일 1개, 테스트 9개 통과.

명령:

```bash
npx vitest run __tests__/gmts-dashboard-data.test.ts __tests__/architecture-guards.test.ts
```

결과: 테스트 파일 2개, 테스트 18개 통과.

명령:

```bash
python3 scripts/check_data_imports.py
```

결과: `✅ [C-4] 빌드타임 data import 124건 전부 git 추적됨`.

명령:

```bash
npm run typecheck
```

결과: `tsc --noEmit` 종료 코드 0.

## 구현 요약

- JSON 직접 import를 `lib/data/gmts.ts` 안으로 제한하고 `getGmtsDashboard()`를 공개했다.
- 월별 값은 12개 위치 튜플, 연간 이력은 2019~2026 순서의 8개 행 튜플로 모델링했다.
- `qualityFlags`는 `code`로 식별되는 6개 구조화 union으로 모델링했다.
- 공란 건수, `operationalAsOf: null`, 가격·반입량 미기재 단위, 선박 원문 필드·날짜, 출처 manifest와 2월 수정 이력을 타입과 테스트에서 보존했다.
- 정적 스냅샷에 `LIVE` 표기를 추가하지 않았고 `Other` 섹션이 반환 계약에 재유입되지 않는지 검사했다.

## 우려 사항

- 없음.
