# 발주 — 「시장 국면」 띠 전 품목 연결 (Cursor composer-2.5, 이 worktree 안에서만)
데이터 `public/data/market-regime.v1.json` 이 33개 품목으로 늘었다(키는 lib/industry-items.json 의 key).
1. `IndustryItemDashboard.tsx` 에서 corn·garlic 으로 제한한 조건을 없애 데이터가 있는 모든 공통 라우트 품목에 띠를 붙인다(데이터 없으면 그리지 않는 기존 동작 유지).
2. 전용 페이지 품목(lib/industry-items.json 에 route 가 있는 것: 예 squid·shrimp·surimi·tuna·tunafarm·whelk·octopus·mackerel·pollock 등)의 대시보드 컴포넌트에도 pollock 과 같은 방식으로 띠를 붙인다. 데이터가 없는 품목은 그리지 않는다.
3. 띠 카드 수: status ok 지표 앞 4개 + ENSO. 
4. 테스트 `__tests__/market-regime-band.test.ts` 확장: JSON 에 ok 지표가 있는 품목 전부에 대해 띠가 렌더되고 첫 ok 지표의 값 문자열이 마크업에 있다(표본 반복 테스트), ok 가 없는 품목(olive)은 「갱신 대기」 또는 띠 없음 — 기존 규칙대로.
완료 판정: `npx vitest run` 실패 0 · `npx tsc --noEmit` 0. Do NOT: 회사 해부 화면·lib/auth/**·proxy.ts·scripts/market_regime 수정, 커밋, push. 스펙과 코드가 어긋나면 보고.
