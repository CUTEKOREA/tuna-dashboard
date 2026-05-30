The Korea 1990-2013 CSV is mojibake-encoded (EUC-KR) so column headers aren't directly readable, but the structure exists. The proposal's claim of 주꾸미 "1998=7,999톤 정점→2013=2,340톤" — I can see a column with 7999 in the 1998 row and 2340 in the 2013 row, which is plausibly the 주꾸미 column. The series exists but exact column mapping needs the encoding fixed before citing. This downgrades it to "needs verification" not hallucination.

I now have enough verification. KCS aggregates confirmed:
- **030752 frozen**: 2020 = 112,133t/$698.7M → 2024 = 111,981t/$748.3M (proposal's "55,991t" was wrong — actual is ~112kt; CIF ~$6.68/kg confirmed direction)
- **030751 live/fresh**: 2020 = 20,087t → 2024 = 17,280t (proposal's 10,044→8,640 was wrong scale; actual is ~17-20kt)
- **160555 prepared**: ~12kt/yr flat — confirmed
- **주꾸미 (0307512000) alone**: near-zero (12.7t in 2024) — the big import figures are 낙지/Octopus group, NOT 주꾸미

I have all I need to write the verified merged plan.

# 주꾸미 5-Pillar 위젯 최종 실행계획 (검증·병합본)

**한줄요약**: refresh 18건 + 신규 13건. 핵심 검증 자산은 FAO FishStat **GlobalProduction**(한국 OCT 2022=16,069톤 실측 확인) · KMI FTA 분기 JSON(2026-05-27, 가장 신선) · 관세청 KCS HS별 통관 5년치. **단, 인용 파일·HS·종코드에 다수 오류가 확인되어 P0에서 강제 정정** — 특히 (1) 한국 어획량은 Capture 파일이 아닌 GlobalProduction 파일에 있음, (2) "주꾸미 단독" 수입통계는 사실상 0(낙지/문어 묶음임), (3) "양식 0톤" 주장은 거짓(스페인·일본 소량 실측 존재).

---

## P0 — 환각·허위라벨·치명적 오류 (즉시 정정)

### `[w3_supply_demand]` FTA 물류 원가 및 통관 리스크
- **근거 파일**: `/Users/idong-geon/agri_data/jukkumi/processed_data/jukkumi_fta_quarterly.json` (실재 확인, freshness 2026-05-27)
- **변경**: 허위 LIVE 제거 → SYNCED. `Math.random()` 라이브 지터로 `isLiveApi=true` 강제하는 코드는 L-09 위반. 추정 운임 시계열을 KMI `unitPrice`(베트남 6.5/태국 7.8/중국 4.60 $/kg, 26년 1~3월)·`quarter2025`(25Q4 누적 30.70kt, 26Q1 6.57kt, delta −8.4%) 실측으로 교체.
- **기대효과**: 허위 실시간 라벨 제거, 추적 가능 출처 확보. **Pillar: 물류·통관(S3)**

### `[w9_korea_fta_imports]` 한국 수입 국가별 점유율
- **근거 파일**: `jukkumi_fta_quarterly.json` `originShift` 배열 (실재 확인)
- **변경**: 허위 LIVE 제거 → SYNCED. 점유율 추정값(베트남 68%)을 KMI 실측으로 정정: 베트남 금액 71.0%·물량 76.9%, 중국 14.3%, 태국 12.8%(2026Q1). 전년동기比 베트남 −7.1%·중국 +3.6%·태국 −23.6%. "현지가공비용지수" 임의 지표 제거.
- **기대효과**: 실측-라벨 정합. **Pillar: 물류·통관(S3) / 판매·수요 교차**

### `[w15_hsk_tariff]` HSK 관세율 매트릭스
- **근거 파일**: `/Users/idong-geon/agri_data/jukkumi/01_Korea/Korea_Tariff_Schedule.pdf` (실재 확인) + KCS CSV
- **변경**: 허위 LIVE 제거 → STATIC. **HS 정정(검증 완료)**: KCS 데이터상 실제 세번은 활·신선 `0307511000/0307512000`, 냉동 `0307521000~0307529000`, 기타 `0307592000/0307599000`, 조제 `1605550000`. **주꾸미 단독 세번은 `0307512000`이나 실제 수입은 near-zero(2024년 12.7톤)** — 대량 수입은 낙지·문어 묶음세번임을 cardDesc에 명시 필수. L-04(HSK 10자리) 준수.
- **기대효과**: 코드-위젯 모순 해소, 종 혼동 차단. **Pillar: 물류·통관(S3)**

### `[w1_global_catch]` 글로벌 원물 소싱 및 연안 자원량
- **근거 파일**: **`/Users/idong-geon/agri_data/jukkumi/fishstat/FishStat_GlobalProduction_octopus.csv`** (⚠️ 제안서의 Capture 파일 경로는 **오류** — 한국 OCT 어획량은 Capture 파일에서 area-31만 잡혀 거의 0임. **반드시 GlobalProduction 파일 사용**)
- **변경**: 허위 SYNCED 정정. 한국 OCT(area 61, NW Pacific) **실측 확인값**으로 교체: 2017=19,609 / 2018=19,241 / 2019=19,554 / 2020=19,366 / 2021=19,049 / **2022=16,069톤(YoY −15.6% 확인)**. 이 시계열은 **주꾸미 단일종이 아닌 한국 보고 두족류(OCT) 합산**임을 SIT 명시. 2023~2026 미래값은 제거 또는 점선'추정'분리.
- **기대효과**: 환각 파일 경로 교정 + 추정 미래값 제거. **Pillar: 원료수급(S1)**

### `[w12_generation_risk]` 단년생 세대 회전율·기후 리스크
- **근거 파일**: **`FishStat_GlobalProduction_octopus.csv`** (Capture 아님 — 위와 동일 교정)
- **변경**: 추정 어획량 축을 GlobalProduction 실측으로 교체(2021 19,049→2022 16,069, −15.6%로 단년생 변동성 입증). 해수온 라인은 NIFS 실측 부재 → 제거 또는 별도 STATIC '(추정)' 라벨.
- **기대효과**: 미래 추정 제거, 변동성 주장 실측 입증. **Pillar: 원료수급(S1)**

### `[w20_fip_esg]` 산지별 인증·해역 리스크
- **근거 파일**: `/Users/idong-geon/agri_data/jukkumi/03_Vietnam/MarinTrust_Vung_Tau_Trawl_FIP_2021.pdf` + `/Users/idong-geon/agri_data/jukkumi/05_Mauritania/SeaBOS_Brief3_Octopus_Morocco_Mauritania_Senegal.pdf` (둘 다 실재 확인)
- **변경**: 추정 혼획율(8%/3%) 제거 → 저가잡어(trash fish) 실측 대리지표(otter trawl 39.2%/pair 51.5%/남서부 최대 96%). 모리타니 TAC 2024=30,744톤·금어기 연2회·최소상장 500g(SeaBOS Brief3). source 문자열을 실보유 파일로 정정. **단 PDF→MD 변환 후 본문 수치 재확인 필수**(현재 미변환).
- **기대효과**: 1차 근거 없는 합성 수치 제거. **Pillar: ESG(S5)**

### `[w29_africa_human_rights_risk]` 아프리카 인권 리스크 (보조)
- **근거 파일**: `SeaBOS_Brief3_Octopus...pdf` (실재). ⚠️ 제안서 인용 ILO·EJF Bright-lights 파일은 **풀세트에 없음(환각 위험)** — 해당 인용 삭제.
- **변경**: 합성 위험도지수(모리타니 85 등) 제거 → SeaBOS 실재 기재(IUU 고위험·Cap Blanc/Dakhla 과잉이용·글로벌 어획 1980 179,042→2021 497,000톤)로 재구성. source를 SeaBOS Brief3 단일로. STATIC.
- **기대효과**: 환각 출처 제거. **Pillar: ESG(S5)**

---

## P1 — 약한 출처·검증 가능 지표로 대체 (높은 가치)

### `[w17_price_spread]` 국내산 대 수입산 가격 스프레드
- **근거 파일**: `/Users/idong-geon/agri_data/jukkumi/extras/kcs/KCS_jukkumi_HS_2020-2024.csv` (실재)
- **변경**: 허위 SYNCED 정정. ⚠️ **제안서의 "주꾸미 HS 0307512000 CIF" 수치는 부정확** — 해당 세번 주꾸미 실수입은 near-zero. 수입산 라인은 **Octopus 묶음세번(030751 live: 2024년 17,280톤/$235M → $13.6/kg, 또는 030752 frozen: 111,981톤/$748M → $6.68/kg)** 중 정의를 명확히 하고 "주꾸미 단독 아님"을 cardDesc 명시. 국내산 도매가는 agri_data에 실측 없음 → KAMIS 연동 전까지 STATIC '(추정)'.
- **기대효과**: 종·세번 혼동 제거. **Pillar: 판매·수요(S4)**

### `[w23_hmr_yield_optimization]` HMR 가공 수율·단가
- **근거 파일**: `jukkumi_fta_quarterly.json` (실재) + `/Users/idong-geon/agri_data/jukkumi/01_Korea/[202507-15] 일본 쭈꾸미 볶음 보고서(경쟁력분석형).pdf` (실재). ⚠️ 제안서 인용 "USDA FAS Korea Seafood 2025"는 **부재** — 풀세트엔 `USDA_Korea_Seafood_Market_Brief_2017.pdf`만 존재. 해당 출처 표기 삭제.
- **변경**: 추정 수율 시계열을 KMI `formMix2026Q1`(냉동 86.5%/활·신선 13.5%) 실측으로 교체. cardDesc 출처를 'KMI 2026-05 + aT KATI 2025-07'로 정정. SYNCED.
- **기대효과**: 환각 USDA 출처 제거. **Pillar: 가공·생산(S2)**

### `[w13_processing_auto]` 산지별 수율·1차 가공 단가
- **근거 파일**: KCS CSV + `jukkumi_fta_quarterly.json` (둘 다 실재). ⚠️ 제안서 인용 "KFRI 가공통계"는 **부재** — 삭제.
- **변경**: 검증 불가 '자동화율' 제거. 산지축을 KMI `unitPrice` 실측(베트남 6.5/태국 7.8/중국 4.60 $/kg)으로 재구성. STATIC/SYNCED.
- **기대효과**: 환각 KFRI 출처 제거. **Pillar: 가공·생산(S2)**

### `[w6_bio_processing]` 생물학적 가공 수율(월별 알/내장)
- **근거 파일**: `jukkumi_fta_quarterly.json`(실측 보조) + `/Users/idong-geon/agri_data/jukkumi/01_Korea/주꾸미의 생식소 발달에 따른...몸통부위 조.pdf`(실재하나 **스캔본·수치추출 불가**)
- **변경**: 원물단가축을 KMI unitPrice로 교체. 월별 순살수율 곡선은 NIFS PDF가 스캔본이라 '정성 추정' 라벨로 강등. 과장 표현 완화(P-03).
- **기대효과**: 추출 불가 출처 정직 라벨. **Pillar: 가공·생산(S2)**

### `[w8_recreational_tac]` 유어낚시 어획·TAC 리스크
- **근거 파일**: `/Users/idong-geon/agri_data/jukkumi/01_Korea/전라남도 연안...유어낚시 어획실태.pdf` + `제4차 수산자원관리기본계획(2026~2030).pdf` (둘 다 실재)
- **변경**: 추정값을 NIFS 논문 실측(전남 연 185,085kg, CPUE 3~302.4kg/척·일)으로 교체. 규제 근거를 제4차 기본계획 실재 조항으로. STATIC. ⚠️ PDF→MD 변환 후 수치 재확인 권장.
- **기대효과**: 1차 학술 근거 확보. **Pillar: ESG(S5)**

### `[w30_tac_regulation_map]` 2026 자원관리 TAC 압박도
- **근거 파일**: `제4차 수산자원관리기본계획(2026~2030).pdf` (실재)
- **변경**: 추상 '압박도 지수' → 실측 TAC 확대지표(관리어선 1,450척→4,108척, 대상어종 12→15종, 실적 26,735→34,727건). 단위 괄호 명기. ⚠️ PDF→MD 변환 후 수치 확정.
- **기대효과**: 정의 불명 지수 제거. **Pillar: ESG(S5)**

### `[w21_leisure_fishing_impact]` 유어낚시 자원 잠식도 — 병합
- **근거 파일**: `/Users/idong-geon/agri_data/jukkumi/01_Korea/충남 서천 해역...유어낚시 어획량 추정.pdf` (실재). [원료수급]·[ESG] 양쪽 제안 중복 → ESG로 병합.
- **변경**: 추정 40%를 서천 논문 실측(2018 충남 어획의 15%, 충남=전국 30~40%)으로. 핵심을 '통계 사각지대'로 재설계. 과장 수식어 제거(P-03). STATIC.
- **기대효과**: 중복 제거 + 1차 근거. **Pillar: ESG(S5)**

### `[w22_vietnam_trawl_fip]` 베트남 저인망 FIP — 병합
- **근거 파일**: `MarinTrust_Vung_Tau_Trawl_FIP_2021.pdf` (실재). [원료수급]·[ESG] 중복 → ESG로 병합.
- **변경**: 추정 진행률(%) → MarinTrust 실재 사실(2018 개시, 2021 신청, MSC 아님 **MarinTrust** 정정). 진행률을 FIP 단계+trash fish 저감과제로 표현. SYNCED.
- **기대효과**: 인증기관 오인(MSC→MarinTrust) 정정. **Pillar: ESG(S5)**

### `[w25_tariff_schedule_impact]` / `[w16_korus_schedule]` / `[w26_coldchain_utilization]`
- **근거 파일**: `Korea_Tariff_Schedule.pdf`(w25/w16, 실재) / `jukkumi_fta_quarterly.json`(w26, 실재)
- **변경**: w25·w16 양허표 실 staging으로 세번별 단계철폐 정정, cardDesc에 근거 파일 명시. w26 검증 불가 레이더 축을 formMix(냉동 86.5%)·CIF 단가차 실측으로 일부 대체, 정성 축은 '(추정)' 표기.
- **기대효과**: 출처 추적성 확보. **Pillar: 물류·통관(S3)**

### `[w4_fbs_seafood]` 채널별 판매단가·탄력성
- **근거 파일**: `jukkumi_fta_quarterly.json` (실재). 채널별 소매가 실측은 부재.
- **변경**: 검증 불가 채널 단가를 수입원물 단가 기준선으로 축소 재정의. '폭력적 가격 폭등'→중립 서술(P-03). KAMIS 연동 전까지 STATIC.
- **기대효과**: P-03 위반 제거. **Pillar: 판매·수요(S4)**

---

## P2 — 신규 위젯 (검증 통과분만 채택, 중복 병합)

### 신규 `[한국 두족류 어획량 장기추세 1990~2022]`
- **근거**: `FishStat_GlobalProduction_octopus.csv`(area 61 실측) + `해양수산부_일반해면어업생산량현황(품종별)_20131231.csv`(⚠️ EUC-KR 인코딩, 주꾸미 컬럼 매핑 재확인 필요 — 1998=7,999/2013=2,340 추정 일치하나 디코딩 후 확정). composed. **Pillar: S1**

### 신규 `[한국 두족류 수입 단가·물량 추이 (KCS HS별)]`
- **근거**: KCS CSV. **검증 정정**: 030752 frozen 2024=111,981톤/$748M($6.68/kg), 030751 live 2024=17,280톤, 160555 prepared ~12.6kt 정체. ⚠️ 제안서의 "55,991톤/56,066톤"은 **오류**(실제 약 2배) → 정정 수치 사용. "Octopus 묶음, 주꾸미 단독 아님" 명시. SYNCED. **Pillar: S2/S3**

### 신규 `[FTA 체결국발 두족류 수입 분기추이]` (가장 신선, 2026-05-27)
- **근거**: `jukkumi_fta_quarterly.json` `yearly`/`quarter2025`/`originShift`. 베트남 71.0%(2026Q1), 26Q1 6.57kt(−8.4%). SYNCED. **Pillar: S1/S3**

### 신규 `[산지별 CIF 단가 추이 (베트남·태국·중국)]`
- **근거**: `jukkumi_fta_quarterly.json` `unitPrice`. 베트남 5.8→6.5, 태국 6.9→7.8, 중국 4.6 정체. line. SYNCED. **Pillar: S3/S4**

### 신규 `[통관 형태 구성 — 냉동 대 활·신선]`
- **근거**: `jukkumi_fta_quarterly.json` `formMix2026Q1`(냉동 86.5%). bar. ⚠️ [가공]·[물류] 양쪽 제안 중복 → 1건으로 병합. SYNCED. **Pillar: S3**

### 신규 `[수입 의존도 심화 — 국내생산 급감 대 수입 정체]`
- **근거**: `jukkumi_fta_quarterly.json` `domesticProduction`(24년 2.2kt→25년 1.6kt, −24.7%) + `yearly`. composed. SYNCED. **Pillar: S3**

### 신규 `[일본 수출용 주꾸미 볶음 경쟁 포지션]`
- **근거**: `[202507-15] 일본 쭈꾸미 볶음 보고서.pdf`. 정성·구조 데이터(경쟁 3사·이온/세븐앤아이 채널). bar. ⚠️ PDF→MD 변환 후 인용. STATIC. **Pillar: S2**

### 신규 `[산란기 자원관리·금어기 압박도]`
- **근거**: `제4차 수산자원관리기본계획(2026~2030).pdf` + `2023년 수산자원관리 시행계획.pdf` + `TAC_제도_실태와_개선방향_2019.pdf`(모두 실재). bar. ⚠️ PDF→MD 후 금어기 날짜 확정. STATIC. **Pillar: S1/S5**

### 신규 `[서아프리카 문어 자원상태·IUU 매트릭스]`
- **근거**: `SeaBOS_Brief3...pdf`. composed. STATIC(2024-09). **Pillar: S5**

### 신규 `[베트남 저인망 잡어 혼획률·인증 마크업]`
- **근거**: `MarinTrust_Vung_Tau_Trawl_FIP_2021.pdf`. bar. STATIC(2021-07). **Pillar: S5**

### 신규 `[황해 갯벌·산란장 리스크]`
- **근거**: `/Users/idong-geon/agri_data/jukkumi/01_Korea/IUCN_황해생태계_상황분석_2023.pdf`(실재). radar(정성). STATIC(2023). **Pillar: S5**

### 신규 `[수입 단가 환율 전가 지수]`
- **근거**: KCS CSV + `extras/ecos_fred/ECOS_KRW_USD_2020~2024.json`(실재, 5개 연도별 파일). composed. ⚠️ ECOS는 연도별 부분 수록 → '가용 평균치' 명시. SYNCED. **Pillar: S4**

---

## 주의·갭

1. **파일 경로 환각 (P0 강제 교정)**: [원료수급]의 w1/w12/장기추세 신규가 인용한 `FishStat_Capture_octopus.csv`의 한국 OCT는 거의 전부 0(area 31). **실제 한국 어획량(16,069톤 등)은 `FishStat_GlobalProduction_octopus.csv` area 61에 존재** — 모든 한국 어획 인용을 GlobalProduction으로 교체해야 함. (2022=16,069 YoY −15.6%는 ✅ 실측 확인)

2. **"양식 0톤" 주장 거짓 → 강등/제외**: [원료수급] 신규 '두족류 양식 미개발(전연도 0톤)'은 **틀림**. `FishStat_Aquaculture_octopus.csv`에 39개 nonzero 행 존재(일본 1960~70년대, 스페인 2013~2022 ~5톤/년). → "주꾸미 상업양식 미상용화 + 문어류 양식 미미(스페인 시범 ~5톤)"로 재기술. 이 위젯은 채택 시 문구 필수 수정.

3. **"주꾸미 단독 수입통계" 부재 (반복 리스크)**: KCS에서 주꾸미 전용세번 `0307512000` 실수입은 near-zero(2024년 12.7톤). 대량 수입(베트남 76%, 30kt 등)은 전부 **낙지·문어 포함 Octopus 묶음**. 모든 KCS·KMI 기반 위젯 cardDesc에 "주꾸미 단독 아님(두족류/낙지 묶음)" 라벨 의무화. KMI JSON도 'FTA 두족류'이지 주꾸미 단독 아님.

4. **KCS 수치 스케일 오류 (신규 위젯)**: 제안서 "030752 frozen 55,991톤"은 실제 **약 112,000톤**의 절반 — 집계 오류. 정정값(2024: 030752=111,981톤/$748M, 030751=17,280톤, 160555=12,611톤) 사용.

5. **PDF 미변환 갭**: ESG·자원관리 위젯 다수(w20·w8·w30·w21, 신규 일본/금어기/IUCN)가 인용하는 PDF 본문 수치는 **아직 MD 미변환**. 글로벌 지침(verify_pdf.sh 훅)상 신규 PDF→MD 짝 생성 대상. 정확 인용 전 변환·재확인 필수.

6. **인코딩 갭**: `해양수산부_일반해면어업생산량현황(품종별)_20131231.csv`는 EUC-KR mojibake. 주꾸미 컬럼(1998=7,999/2013=2,340 추정) 매핑은 UTF-8 디코딩 후 확정 필요.

7. **freshness 강등 대상 (<2023-05)**: MarinTrust FIP(2021-07)·Korea_Tariff(보관 2026-05이나 양허 baseline 구형)·USDA 2017·NIFS 스캔본(연도미상)은 신선도 하위. KMI(2026-05-27)·SeaBOS(2024-09)·제4차 기본계획(2026~2030)·IUCN(2023)을 우선 노출, 구형은 보조 라벨.

8. **중복 병합 처리**: '냉동 대 활·신선 형태구성'([가공]+[물류] 2건), 'w21 유어낚시'([S1]+[S5]), 'w22 베트남 FIP'([S1]+[S5]), '국가별 점유율'([물류]+[판매]) — 각 1건으로 병합 완료. 신규 13건은 중복 제거 후 수치.