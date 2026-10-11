# 발주서 — 명태 「시장 이해」 서술을 최종 해부보고서 원문으로 교체

## 목표
`/pollock-industry` 의 서술(단계별 lede·paragraphs·facts)을 손으로 쓴 `lib/pollock-industry-content.ts` 대신
**최종 해부보고서 HTML 원문에서 그대로 추출**해 보이게 한다. 회사 해부 페이지가 이미 쓰는 파이프라인을 재사용한다:
`scripts/report_prose.py`·`build_report_prose.py`(문단·콜아웃) + `report_tables.py`·`build_report_tables.py`(표)
→ `public/data/companies/<key>_prose_v1.json`·`_tables_v1.json` → `lib/data/company-report-prose.ts`·`company-report-tables.ts`
→ `lib/company-prose-stages.ts`(proseStages)·`CompanyAnatomyDashboard.tsx`(inlineReport, 표를 원문 자리에).

원문: `docs/evidence/industry-pollock-2026-10/보고서.html` (이미 복사해 둠, `<section id="s01">…` 구조, 회사 보고서와 같은 틀).

## 해야 할 것
1. `build_report_tables.py` SPECS 에 키 `pollock` 추가(src = 위 경로). 절 → 단계 매핑(대시보드 키는 현재 `lib/pollock-industry-content.ts` 의 StageNarrative key):
   - s01·s02·s05 → `s01`(자원) · s07 → `s02`(원양) · s03·s04 → `s03`(수입) · s06 → `s06`(명의)
   - s08·s09·s10 → `s04`(가공) · s11 → `s07`(명부) · s12·s17 → `s08`(재무) · s13·s16 → `s05`(값과 재고) · s14·s15 → `x01`(제도)
   - 부록 sA·sB·sC 는 제외(화면에 싣지 않음).
   - `expect`(절별 표 개수)를 원문에서 세어 못박는다. `drop` 은 쓰지 않는다(원문 표 전량).
2. 두 빌드 스크립트를 돌려 `public/data/companies/pollock_prose_v1.json`·`pollock_tables_v1.json` 을 만든다.
3. `company-report-prose.ts`·`company-report-tables.ts` 에 pollock 을 등록한다.
4. `PollockIndustryDashboard.tsx` 의 서술을 `proseStages('pollock')` 기반으로 바꾸고, 회사 페이지의 inlineReport 처럼 원문 표를 원문 자리에 끼운다.
   **위젯·차트(손으로 만든 인터랙티브 슬롯)는 그대로 둔다** — 단계 끝 「근거」 자리에 남긴다. 단계 제목·질문(title·question)은 지금 값을 유지해도 된다.
   손으로 쓴 lede·paragraphs·facts·terms 는 화면에서 빠진다. 파일에서 지울지는 타입·테스트가 허락하는 쪽으로(안 쓰는 export 는 지워도 된다).
5. 테스트: `__tests__/company-report-prose.test.ts`·`company-report-tables.test.ts` 패턴으로 pollock 을 덮는다.
   추가로 **화면 서술 문장이 모두 원문 HTML 텍스트 안에 그대로 있는지** 검사하는 테스트 하나(공백 정규화 후 부분 문자열).
   단계 수·탭 테스트(`stage-tab-nav` 등)가 깨지면 기대값을 고친다.

## 완료 판정(명령으로)
- `python3 scripts/build_report_tables.py && python3 scripts/build_report_prose.py` 종료코드 0
- `npx vitest run` 전부 통과 · `npx tsc --noEmit` 0 errors
- 원문 대조 테스트 통과(위 5번)

## Do NOT
- **건드리지 말 파일:** 다른 회사·어종의 SPECS 값과 JSON(이미 라이브, 바꾸면 그 페이지들이 바뀐다), `lib/auth/**`·`proxy.ts`(로그인 보호 — 손대면 보안 경계가 바뀐다), `public/data/pollock_*_v4.json`·`pollock_industry_v1.json`(위젯 데이터, 이번 범위 밖).
- **커밋하지 마라. 메인이 diff 를 보고 커밋한다.** push 금지.
- **스펙과 코드가 어긋나면 고치지 말고 보고하라**(예: 매핑에 없는 절이 원문에 있음, report_prose 가 commodity 틀에서 다르게 동작함, 단계 키가 다름).
- 원문 HTML(`docs/evidence/industry-pollock-2026-10/보고서.html`)을 고치지 마라 — 원문이 정답이다.
