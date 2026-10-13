# 발주 — 「시장 국면」 띠 (Cursor composer-2.5, 이 worktree 안에서만)

데이터: `public/data/market-regime.v1.json`(수집기 `scripts/market_regime/market_regime.py` 산출. 키 `commodities.<corn|pollock|garlic>` = 지표 배열 {id,label,value,unit,asof,baseline,delta,source_url,status}, `common` = ENSO 등).
만들 것:
1. `lib/data/market-regime.ts` — JSON 을 빌드 시 import 해 `marketRegimeFor(key)` (지표 배열, 없으면 []) 와 `marketRegimeCommon()` 을 낸다. 품목 키 매핑: 대시보드 키 corn·garlic(공통 라우트 /industry/[key], `components/market-understanding/IndustryItemDashboard.tsx`), pollock(`PollockIndustryDashboard.tsx`).
2. `components/market-understanding/MarketRegimeBand.tsx` — 히어로 바로 아래에 붙는 띠. 지표 카드 3~5개: 라벨 · 값+단위(숫자는 천 단위 쉼표, %는 소수 1자리) · 기준일 · baseline 이 있으면 「5년 평균 x · 차이 ±y」, status 가 ok 가 아니면 회색과 「갱신 대기」. 맨 끝에 ENSO(엘니뇨 지수) 카드. 아래 한 줄: 「2주마다 공개 통계로 갱신 · 갱신일 {generated_at}」 + 출처 링크(source_url). 명태처럼 지표가 많으면 status ok 인 것 중 앞 4개만. 기존 CSS 모듈·디자인 토큰을 따르고 새 의존성 금지.
3. 위 세 페이지(corn·garlic·pollock)에만 띠를 넣는다. 다른 품목은 데이터가 없으면 아무것도 그리지 않는다(빈 띠 금지).
4. 테스트 `__tests__/market-regime-band.test.ts`: 세 품목 렌더 시 JSON 의 값 문자열(예: 옥수수 수확 23, 마늘 10,682)이 마크업에 있다 · 데이터 없는 품목(예: almonds)은 띠가 없다 · status 가 ok 가 아닌 지표는 「갱신 대기」.
완료 판정: `npx vitest run` 실패 0, `npx tsc --noEmit` 0.
Do NOT: 다른 품목 페이지·회사 해부 화면 수정, `lib/auth/**`·`proxy.ts` 수정, scripts/market_regime 수정, 커밋(메인이 diff 보고 커밋), push. 스펙과 코드가 어긋나면 고치지 말고 보고하라.
