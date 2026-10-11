# 발주서 — 품목 「시장 이해」 5페이지를 해부보고서 원문에 더 가깝게

대상 품목 키: pollock · octopus · shrimp · squid · tuna(화면 tuna-anatomy). 원문: `docs/evidence/industry-<key>-2026-10/보고서.html`(2026-10-11 정정본, 수정 금지).
기준 구현: PR #1412(main e297c431) — 서술·표는 `report_prose`·`report_tables` 파이프라인으로 이미 원문 추출됨.

## 해야 할 것
1. **그림·도표(필수):** 회사 해부 페이지의 그림 파이프라인(`lib/data/company-report-figures.ts` · `figuresForStage` · 이를 만드는 스크립트 · `CompanyAnatomyDashboard.tsx` 의 inlineReport 그림 슬롯 RepChart/RepShots)을 품목 5개에도 연결한다. 지금 5품목은 `company-report-figures.test.ts`·`company-report-intake-complete.test.ts` 에서 그림 파이프라인 제외로 묶여 있다 — 제외를 풀고 등록한다. 오징어 원문에는 지표 타일(div.metric·.n)·막대(div.bars·.bar)·그림(figure·div.fi·figcaption)·종 도판(div.sci·.cr·.ds·.mt) 26개 안팎이 있다. 원문 자리(ord)에 끼운다. 다른 네 품목은 원문에 그림이 없으면 0개로 통과해야 한다. 그림 추출기가 품목 원문 틀에서 못 읽는 요소가 있으면 추출기를 넓히되 회사 편 JSON 이 바뀌지 않게(재생성 후 git diff 로 확인).
2. **장 제목(필수):** 5품목에서 원문 본문 절(sNN)의 장 제목(h2 의 번호 라벨 + 부제)이 화면 소제목으로 하나도 빠짐없이 나오게 한다. 지금 품목마다 1~2개가 빠진다(한 단계의 첫 절 제목이 단계 제목에 묻히는 경우로 보인다). 단계 제목·질문(손 작성)은 그대로 둔다. 테스트: 원문 본문 절 h2 텍스트 전부가 화면 머리글에 있다.
3. **보고서 원문 보기(필수):** 원문 HTML 을 `public/reports/industry/<key>-2026-10.html` 로 복사하는 스크립트(`scripts/sync_industry_report_html.py`, 소스=docs/evidence 경로)를 만들고 돌린다. 5페이지 히어로 근처에 「보고서 원문 보기」 링크(새 탭)를 단다. 원문은 인쇄 스타일이 있어 브라우저 인쇄로 PDF 가 된다 — 링크 옆에 그 안내 한 줄. 로그인 보호는 `proxy.ts` matcher `/:path*` 가 이미 덮는다(손대지 마라). 테스트: 5개 파일이 존재하고 docs/evidence 원문과 바이트가 같다.
4. 렌더 테스트를 위 1~3에 맞게 갱신. 원문 대조 테스트(서술·머리글·브리핑·표)는 그림 캡션까지 넓힌다.

## 완료 판정(실제 실행)
빌드 스크립트(표·서술·그림) 종료코드 0 · 회사 편 JSON 무변화(git diff) · `npx vitest run` 실패 0 · `npx tsc --noEmit` 0. 품목별 또는 기능별로 커밋(메시지 끝 `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`), push 금지.

## Do NOT
- 원문 HTML 수정 금지. `lib/auth/**`·`proxy.ts` 금지(로그인 보호). 회사 해부 편 화면·데이터 변경 금지.
- git stash 금지, 다른 저장소로 cd 금지. 스펙과 코드가 어긋나면 고치지 말고 보고하라.
