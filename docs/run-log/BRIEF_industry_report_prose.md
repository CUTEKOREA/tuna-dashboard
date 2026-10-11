# 발주서 — 품목 「시장 이해」 서술을 최종 해부보고서 원문으로 교체 (명태 방식 그대로)

인자: 품목 키(<key>), 원문 `docs/evidence/industry-<key>-2026-10/보고서.html`(메인이 복사해 둠), 화면 `components/market-understanding/<Key>IndustryDashboard.tsx`·`lib/<key>-industry-content.ts`.
기준 구현: 커밋 87870454(명태). `git show 87870454` 로 바뀐 파일·패턴을 먼저 보고 그대로 따른다.

## 해야 할 것
1. `scripts/build_report_tables.py` SPECS 에 `<key>` 추가. **절 → 단계 매핑은 네가 정한다**: 원문 `<section id="sNN">` 각 절을 현재 화면 StageNarrative key 중 주제가 맞는 단계에 붙인다. 부록(sA·sB·sC…)은 제외, 본문 절은 하나도 빠뜨리지 않는다. 요약 절(01 「먼저 알아야 할 …」 류)은 첫 단계 맨 앞. `expect` 는 원문 `<table>` 수를 세어 못박고 `drop` 은 비운다.
2. `python3 scripts/build_report_tables.py && python3 scripts/build_report_prose.py` → `public/data/companies/<key>_prose_v1.json`·`_tables_v1.json`.
3. `lib/data/company-report-prose.ts`·`company-report-tables.ts` 등록, figures/intake 테스트에서 명태처럼 제외 처리.
4. `<Key>IndustryDashboard.tsx` 를 명태처럼 `proseStages`/`proseBriefing` + inlineReport(절 순번 오프셋), 위젯은 단계 끝 「근거」에 유지, 단계 제목·질문은 기존 손 작성 값, 「: 」 머리 처리 명태와 같게.
5. 테스트: `company-report-prose.test.ts`·`company-report-tables.test.ts` 에 명태 블록과 같은 <key> 블록(화면 서술·머리글·브리핑·표 전부 원문 HTML 대조, 단계·표 수), `commodity-industry-render.test.ts` 의 <key> fixture 를 새 서술로(명태와 같은 방식).

## 완료 판정(실제 실행)
빌드 스크립트 종료코드 0 · `npx vitest run` 실패 0 · `npx tsc --noEmit` 0 errors · 원문 대조 테스트 통과.
끝나면 `git add -A && git commit` 으로 **이 품목만** 커밋한다(메시지 `feat(<key>): 시장 이해 서술을 최종 해부보고서 원문에서 추출` + 본문에 매핑 요약 + `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`). push 금지.

## Do NOT
- 다른 품목·회사의 SPECS 값·JSON·화면을 바꾸지 마라(라이브 페이지가 바뀐다). `lib/auth/**`·`proxy.ts` 금지(로그인 보호).
- 원문 HTML 을 고치지 마라. git stash 금지. 다른 저장소로 cd 금지.
- 스펙과 코드가 어긋나면 고치지 말고 보고하라.
- HANDOFF.md 는 이 품목 한 블록만 덧붙인다.

## 사용자 결정 (2026-10-11) — 모든 품목에 적용
6. **보고서에 대응 절이 없는 손 작성 단계**는 유지하되, 단계 머리에 「보고서 밖 사내 분석」 표시를 붙여 원문 단계와 구분한다(문어 s09, 새우 x01·s05·s06 류).
7. **히어로 KPI·옛 위젯이 원문과 겹치면 정리한다.** 히어로 KPI 는 보고서 원문 값으로 바꾼다(원문 문장·표에 있는 값만). 원문 표와 같은 주제의 옛 위젯 표는 내린다(같은 표가 옛판·원문판 두 벌로 보이면 안 된다). 원문에 없는 인터랙티브 차트(시계열·지도 등)는 유지하되 출처·기준일을 캡션에 적어 보고서와 다른 집계임이 보이게 한다. 렌더 테스트의 「집계와 본문 대조」 블록은 원문 기준으로 다시 쓴다.
