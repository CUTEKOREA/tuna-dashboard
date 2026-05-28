## A. 출처 충돌 (최대 5건)
- [w3_jumbo_flying] '대왕(훔볼트) 오징어 글로벌 지배력' vs [w6_species_pie] '글로벌 주요 오징어 종별 어획 비중' → w3의 훔볼트 지배력 주장과 w6의 상위 5종 비중이 FAO 수치와 불일치. 동일 연도 모순 해결 권고
- [w28_falkland_waterfall] '어로원가 303.0억' vs [w50_fleet_opex] '선민수산 원가구조' → 선민수산의 총 원가 수치와 유류비 비중(23.1%) 기반 역산 수치 충돌. 결산서 기준 일원화 권고

## B. Stale (최대 5건)
- [S2] components/SquidImportPortfolio.tsx:L61 → 2010-2023년 데이터 포트폴리오를 2025년 관세청 수입자료 기반으로 2026년 업데이트 가능
- [S4] components/SquidUnitPrice.tsx:L106 → 2000-2023년 주요국 평균 단가 추이를 2024-2025 FAO 최신 릴리스 데이터로 갱신 가능
- [w8_china_export] '중국 오징어 수출 독점 수익 (1990-2023)' → 2024-2025년 중국 원양 선단 수출 급팽창 데이터로 갱신 가능
- [w10_processed_dominance] '글로벌 2차 가공 패권 (2000-2023)' → 베트남·인도 거점 분산 및 2024-2025 PRODCOM 데이터 추가 가능
- [w76_area41_illex_share] 'SW Atlantic (Area 41) 어획 점유율' → 2024-2026년 최신 FAO 및 포클랜드 Bulletin 29 데이터 반영 필요

## C. 잘못된 인용 (최대 3건)
- [S1] components/SquidQuotaExhaustion.tsx:L10 → '실시간 소진율' 인용. SPRFMO 관할 Dosidicus gigas 및 Falkland Loligo는 ITQ 기반이나, 2026년 SPRFMO 회의에서 TAC 도입이 부결되어 effort-based로 유지 중이므로 'ITQ 실시간 소진율' 개념 오적용
- [w16] '포클랜드' → '인구 3,800명이 가공 69,890톤 수출'로 기술되어 있으나, 포클랜드 Loligo 및 Illex는 대부분 Vigo 등 EU 허브로 원물 직수출되어 현지 가공되므로 '자체 가공 수출' 인용 오류
- [w78_itq_transition_timeline] 'Illex ITQ 전환 정책' → 2026년 기준 Argentina Illex 조기 종료 권고 및 effort-based 관리 체계 속에서 ITQ 정책의 일방적 연도 매칭 오류

## D. 의심 outlier (최대 5건)
- [S1] components/SquidTab1Widgets.tsx:L325 → '30년간 9도 위도 상승'은 생물학적 북상 한계치를 초과한 과도한 아웃라이어 수치로 검증 필요
- [S4] components/SquidTab3Widgets.tsx:L128 → '국내 4대 수입상 대기업 3사가 70% 통제'는 독과점 비중이 과장됨 (실제 중소 수입사 및 가공 유통 벤더 분산)
- [w13] '태국의 오징어 연금술 — 수입 $2,741 → 수출 $7,995' → 단순 가공 마크업 191%는 원가 대비 마진으로 비현실적 수치임 (수입 단가와 수출 단가 톤당 마크업 혼동 의심)
- [w15] '일본의 침묵의 붕괴 — 2024년 5만톤' → 일본 Todarodes pacificus 어획량 급감 추세 중 2024년 5만톤 수치는 연근해/원양 합산 기준 검증 필요
- [w31_eu_squid_supply_shock] 'EU 오징어 수입량 2년 만에 반토막 (60% 붕괴)' → 유로스타트 통계 기준 2년 내 60% 급감은 극단적 이상치로, 실제 통관 지연 및 우회 경로 누락 검증 필요

## 종합
- P0 4 · P1 8
- Codex 검증 후보 5건
  1. w13 태국의 수입 대비 수출 마크업 191% 실측 데이터 검증
  2. S1 (L325) 오징어 서식지 위도 북상 편차(9도) 생태학적 한계 검증
  3. w16 포클랜드 인구 대비 가공 수출량 69,890톤 진위 규명
  4. S1 (L10) SPRFMO TAC 부결에 따른 ITQ 쿼터 소진율 로직 정합성 검증
  5. w28/w50 선민수산 결산서상 어로원가(303억) 및 유류비(23.1%) 교차 검증
