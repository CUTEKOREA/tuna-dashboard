# 참치 value-chain 위젯 보완 — agri_data 활용 실행계획 (2026-05-29)

> 생성: 멀티 에이전트 워크플로우 `value-chain-agri-enrichment` (11 에이전트, 도메인 카탈로그×5 → 5-Pillar 제안×5 → 검증·종합×1).
> 검증: 인용 agri_data 파일 전수 실재 확인(환각 0건) + 핵심 수치 1차 데이터 직접 대조.
> 범위: `app/page.tsx`(TunaDashboard) value-chain 위젯 89개 vs `~/agri_data/tuna` 334개 데이터 파일.

## 1) 한 줄 요약
**refresh 23건 + 신규 18건**. 활용 핵심 자산: FAO FishStat 어획(2024 확정 7,204,054t)·가공생산(2023), IOTC SC27 YFT 자원평가(F/FMSY 0.75·SB/SBMSY 1.32), AtunaPrice 30년 현물가(방콕 SKJ·세이셸 YFT), KCS 관세청 통관 5년, EU Comext/EUMOFA 소매·무역, WCPFC Yearbook 2025, 방콕 reefer 주간 매니페스트, NTIS 부산물 R&D 28건.

### 검증 메모 (정직 라벨 적용 필수)
- FAO 어획 Totals 2024 = **7,204,054.45t** — 정확 (w01·03·13·14 근거 확정)
- FAO 가공생산 2023: 스페인 516,777t(14.4%, **톤수 1위**) > 태국 462,710t(12.9%) > 한국 163,288t(-57% vs 2013). **"태국 절대 주도"는 수출 점유율 기준일 뿐, 가공 톤수 1위는 스페인** — 현 대시보드 단언이 지표 혼동.
- IOTC YFT: F2023/FMSY 0.75, SB2023/SBMSY 1.32, SB/SB0 0.44, MSYrecent 421kt — 원문 일치
- Atuna skjbkk 2024-09 $1,280 / 2026-05-22 $1,850, yfsey 2026-05-20 $2,000 — 일치
- **주의**: `Aquaculture_Quantity_tuna66.csv`는 **2022까지**가 마지막 실측 → ESG 제안의 "2024까지" 라벨은 과장, "2022 확정"으로 정정. 경로도 `processed_data/`.

---

## 2) 실행 우선순위

### P0 (즉시·고가치)

1. **`[w15_canning_factory]` 가공 패권 지표 분리 (수출 점유율 ≠ 가공 톤수)** · 근거 `raw_data/9. 참치 가공 생산량 1976-2023.csv` · "태국 32.6% 절대 주도" → "가공 톤수 1위 스페인 516,777t(14.4%)·2위 태국 462,710t / 수출은 태국 우위"로 지표 분리, 2014~2017 stale→2023 확정, FAO CC-BY-4.0 접근일 명기, SYNCED · 가공·생산
2. **`[w03_pie]` 국가별 조업 Top5 추정치(E)→2024 확정** · `raw_data/2. 참치 생산량(어획량) 1950-2024.csv` · '2026E' 폐기, 에콰도르 4위→2위 순위 정정, SYNCED · 원료 수급
3. **`[w01_paradigm]` ISSF 추정치→FAO 2024 확정 (신뢰도 60→95)** · 동 어획 CSV · 추정 표기 제거, SYNCED · 원료 수급
4. **`[w98_byproduct_rd_pipeline]` 출처 None→NTIS 실데이터** · `rd_research/01_domestic_kr/ntis/ntis_tuna_byproduct_rd_projects.csv`(28건) + `KFAS_참치액젓_연구_통합_로그.md` · 동원에프앤비 규제자유특구 39.7억(2025)·한국생산기술연구원 33.2억·NIFS 7.5억, STATIC · 가공·생산+ESG(병합)
5. **`[w11_kr_price]` 출처-내용 mismatch 교정** · `extras/kcs/KCS_tuna_5y.csv` · 생산DB→관세청 수입단가(4.95→4.42→4.15 USD/kg), 하방경직 입증, KCS API 연동 시 LIVE · 판매·수요
6. **`[w94_wcpo_record_catch]` 출처·신뢰도·telemetry 전무→WCPFC Yearbook 2025** · `raw_data/WCPFC_Tuna_Fishery_Yearbook_2025.md` · SYNCED · 원료 수급
7. **`[w43_retail_price_map]` 2024 stale + 출처 오류(Eurostat→EUMOFA)** · `raw_data/2026_Daily-online retail prices.csv` · 2026 실측(그리스 8.01·헝가리 6.53 vs 스웨덴 2.09=3.8배), SYNCED · 판매·수요
8. **`[신규]` 5대 RFMO 자원상태 신호등 레이더 (F/FMSY·SB/SBMSY)** · `raw_data/IOTC_IOTC-2024-SC27-ES04_YFTE.md`(+IATTC/WCPFC/CCSBT) · 조달 리스크 어종 단위 선제 식별 · 원료 수급
9. **`[신규]` 방콕 SKJ 현물가 추적(line)** · `Atuna price/skjbkk.csv` · 캔 원가 70~80% 원어단가 벤치마크 · 원료 수급

### P1
- **`[w04_proc]` "팽창"→"정점 후 수축"** · 가공생산 CSV(2014=4.17M 정점→2023=3.58M, -14% 검증) · 제목-사실 불일치 해소 · 가공·생산
- **`[w13_korea_empire]` "글로벌 3위 탈환" 재검증** · 한국 2024=343,506t(에콰도르·베트남에 밀려 4위) · 미검증 카피 정정 · 원료 수급
- **`[w14_species_polar]` 오타('가랑어')+가다랑어 49.6% 비중 단서** · 어획 CSV · 원료 수급
- **`[w82_indian_ocean_tuna]` 서술→정량(F/FMSY 0.75·Kobe green)** · IOTC YFTE · ESG (radar와 역할 분리)
- **`[w52_msc_cbam]` 2차 학술추정→ISSF 2025-08 1차** · `intelligence_reports/[2-A ISSF] ISSF 2025-08 ...MSC Criteria.md` + `CCSBT IUU List.md` · ESG
- **`[w71_bluefin_ranching_growth]` 정량근거 부착** · `processed_data/Aquaculture_Quantity_tuna66.csv`(일본 PBF 20,400·몰타 15,816·스페인 13,145, **2022 확정**) · ESG
- **`[w60_bluefin_ranching_defense]` SBT 재건 진척** · `raw_data/CCSBT_ESC28_16_stockAssessment2023.md` · TRO 30%/2035 on-track · ESG
- **`[w62_fuel_impact]` 합성값→Caharbor 보도 앵커링** · `intelligence_reports/Soaring Fuel Prices...Caharbor.md` · MGO 2배·톤당 +€400, STATIC · 물류·통관
- **`[w08_import]` 생산DB→EU Comext 수입금액** · `raw_data/2019_2025_Yearly_comext_mcs.csv` · 스페인 €13.0억·이탈리아 €11.6억, 미·일은 Comtrade 별도 명시, SYNCED · 판매·수요
- **`[신규]` 방콕항 reefer 주간 입항(2026 18주)** · `REEFER SHIP MOVEMENT FOR WEEK/2026/`(18 xlsx) · 캐너리 가동률 선행지표 · 물류·통관
- **`[신규]` 한국 냉동(0303) vs 통조림(160414) 단가 갭** · `extras/kcs/KCS_tuna_5y.csv` · 가공 내재화 입증 · 물류·통관
- **`[신규]` EU 16개국 소매 3.8배 격차(bar)** · `2026_Daily-online retail prices.csv` · 판매·수요
- **`[신규]` 가공 패권 재편: 스페인↑ vs 한국 -57%(line)** · 가공생산 CSV · 가공·생산

### P2 (백로그)
w39_nl_tollgate(Comext raw 88MB) / w55_emerging_route·w63_us_tariff(KCS 공유) / w50_bunker_freight(Caharbor) / w25_byproduct_cashcow(KFAS 히스타민 45mg/kg) / w49_yield_labor(EUMOFA·FAO Canning Manual PDF) / w44_italy_retail(2021 vs 2026 +93%) / w34_germany_blackhole(독일 €4.53억) / 신규 묶음: 부산물 R&D 100억 bar·가공업 134개소(`processed_data/tuna_processing_master_list_v2.csv`)·IUU 블랙리스트·혼획 폐기율(`IATTC_No-23-2025`)·탄소 프록시·고등어 교차탄력성·소비 계절성(`Monthly_Consumption.csv`)·트랜십먼트 옵저버·SBT TAC·세이셸 YFT-SKJ 스프레드·reefer 하역 매트릭스 — 전부 파일 실재 확인.

---

## 3) 주의·갭 (agri_data로 못 채우는 부분)
- **2022 천장**: 축양 데이터는 2022가 마지막. "2024" 라벨 금지, "2022 확정"으로.
- **글로벌 수입(미·일)**: agri_data Comext/EUMOFA는 EU권 한정 → 미·일은 **UN Comtrade 추가 수집** 필요.
- **직접 탄소배출**: WCPFC 조업일수 기반 **간접 프록시**뿐. 실측 CO2e는 IMO DCS·선사 공시 필요 → LIVE/실측 주장 금지.
- **소매가 출처**: "Eurostat" 표기 다수 → 실파일은 **EUMOFA** 소관, 일괄 정정.
- **KCS LIVE**: 관세청 API 실연동 코드 있을 때만 LIVE. 스냅샷 CSV만 있으면 **SYNCED**.
- **reefer 하역 톤수**: 입항 척수는 실측이나 하역 톤수는 일부 추정 → "추정" 단서 유지.

검증 결론: 5개 Pillar 인용 파일 환각 0건, 핵심 수치 전수 1차 데이터 대조 일치.
