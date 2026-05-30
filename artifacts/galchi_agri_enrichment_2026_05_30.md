Final verification complete. **Aquaculture = 0** (all 8,256 records CAPTURE) confirmed — the "100% 자연산" claim is solid. S5's "2017 161.6만→2022 140.0만 (-13.3%)" matches ALL-species (1,616,388→1,400,058). But this again mixes species: LHT-only is 1,220,459→1,068,858 (-12.4%).

I now have everything verified. Key cross-proposal conflict identified and resolved: the China-share figure depends entirely on species scope (LHT-only 84.5% vs all-species 64.5%), and the "India 16.2% / 2위" claim is an all-species artifact (SFS/CUT, not 갈치). I'll standardize on **LHT-only** as the honest galchi basis and flag the all-species figures as mislabeling. Producing the final merged plan.

---

# 갈치 5-Pillar 위젯 최종 실행계획 (종합·검증본)

## 한줄요약
인용된 agri_data 11개 파일 전수 실재 확인(환각 0건), 핵심 수치 직접 재집계 검증 완료 — **Refresh 21건 + 신규 18건**(중복 병합 후 refresh 19·신규 16 권고). 핵심 자산: `FishStat_Capture_hairtail_v2.csv`(LHT 1950~2022 실측)·`Japan_import_HS030389_2019-2023_UN_Comtrade.csv`(한국산 대일 $11.17/kg 실측)·`GAIN_Korea_Seafood_2024.md`(TAC·가공·자급률 1차)·`KMI_Trend_218`(2026 피쉬플레이션 전망). **최대 리스크: 종(species) 스코프 혼선** — 갈치(LHT) 단일종 vs 갈치류 전체(LHT+SFS+CUT+BSF)가 China 점유율을 84.5% vs 64.5%로 갈라놓음. 전 위젯 **LHT-only 기준 통일** 필수.

---

## ## P0 (정직 라벨 위반·날조 데이터·환각 수치 — 즉시 정정)

### `[w_galchi_prod_risk]` 글로벌 어획량 vs 한국 TAC 트렌드
- **근거 파일**: `/agri_data/hairtail/extras/fishstat/FishStat_Capture_hairtail_v2.csv` + `GAIN_Korea_Seafood_2024.md`(Table 2)
- **검증결과**: 코드 하드코딩 정적배열인데 `isLive:true`(L-09 위반). 글로벌 "105만~107만 평탄"은 LHT 실측과 불일치 — **LHT global 2020=1,121,861t, 2022=1,068,858t**(재집계 확인). TAC는 GAIN Table 2 = **30,126/48,908/48,296/52,379**이며 **연도 라벨이 2021-2024**(GAIN line 152 헤더), 제안서 다수가 "2020 30,126"으로 오기 → **2021부터로 정정**.
- **변경**: ① `isLive:false` → telemetry `SYNCED`(syncDate 2026-05). ② 글로벌 생산을 LHT 실측(2020 1,121,861/2021 1,123,646/2022 1,068,858t)로 교체, 미발표 2023행 삭제. ③ TAC 연도 2021-2024로 정정. ④ cardDesc: "FAO FishStat LHT 어획(~2022) + GAIN 2024 Table 2 MOF TAC".
- **기대효과**: 허위 LIVE 제거 + 글로벌 수치 환각 제거.
- **Pillar**: S1 원료수급

### `[w27]` OFAC·EU Sanctions 컴플라이언스 경보
- **근거 파일**: `/agri_data/hairtail/extras/cecaf/CECAF_XXIII_2023_4.md`
- **검증결과**: 라우트 코드가 `isLive:false /* Mock */`로 명시된 날조 시계열(ofac 12→68 등). OpenSanctions 응답 미사용. 보유 agri_data에 제재 데이터 0건.
- **변경**: 제재봇 허구 폐기 → 검증가능한 서아프리카 소싱처 자원리스크로 주제전환. CECAF/XXIII/2023/4(2023-07) **북부 데머설 9개 자원 과잉어획**(검증: line 191, Merluccius merluccius/spp.·Epinephelus aeneus = 모리타니아·세네갈·감비아 stock) Bar로 대체. telemetry `SYNCED`, source "FAO CECAF/XXIII/2023/4".
- **기대효과**: 날조 시계열 → 1차 FAO 실측 자원평가.
- **Pillar**: S5 ESG

### `[w26]` OSH 소싱국 팩토리 매핑·노동 리스크 (S3·S5 중복 → **1건으로 병합**)
- **근거 파일**: `FishStat_Capture_hairtail_v2.csv`
- **검증결과**: 라우트가 API 성공해도 본문 미파싱, 하드코딩 FALLBACK(factoryCount 142·laborRisk 65)에 `isLive:true` 부착 — 발명값. 보유 자료에 노동·공장 데이터 0건.
- **변경**: 발명 점수 폐기 → "중국 단일 야생어획 의존" 실측으로 노동리스크 노출 재정의. **LHT 2022 중국 903,498t = 84.5%**(재집계 확인, 단일국 집중도 = 노동·IUU 리스크 전이). `isLive` 제거 → `STATIC`/`SYNCED`. auditPass 등 미검증 KPI 삭제.
- **기대효과**: 발명 KPI 제거, 검증가능 집중도 리스크로 대체.
- **Pillar**: S3 물류 / S5 ESG (S3에 1개만 유지, S5는 newWidget "집중도"로 흡수)

### `[w24]` WITS 착지원가 시뮬레이션
- **근거 파일**: `GAIN_Korea_Seafood_2024.md`(Table 6/A10)
- **검증결과**: FALLBACK이 "**한-세네갈 FTA**" 제시 — 실존하지 않는 협정(허위 인용). 보유 파일 없이 외부 시스템콜 가장.
- **변경**: 허위 세네갈 FTA 삭제. GAIN Table 6 실제 TRQ(평목 0303.34/39·명태 0303.67·조기 0303.79) + "갈치는 어떤 FTA TRQ에도 미포함 → 전 공급국 동일 MFN 10%" 사실 명시. telemetry `STATIC`, isLive 금지.
- **기대효과**: 환각 FTA 제거 → 갈치 관세중립 사실 정직화.
- **Pillar**: S3 물류

### `[w_galchi_consumption]` 갈치 가공 형태별 소비 비중
- **근거 파일**: `GAIN_Korea_Seafood_2024.md`(Table 3·Table 5)
- **검증결과**: 인라인 하드코딩에 `isLive:true`(L-09). cardDesc "자급률 63.6%"는 2013 KMI '어류' 수치 오귀속(13년 경과). 가공 80:20 출처불명.
- **변경**: `isLive` 제거 → `STATIC`(syncDate 2024-11). 자급률을 **GAIN Table 5 = 64.8%(2023 est)**(검증 line 257)로 정정 + "수산물 전체 자급률(갈치 단일 아님)" 명시. 가공형태를 GAIN Table 3 실측 카테고리순위(냉동>연육>가공해조>염장>조미>통조림, 검증 line 205)로 교체.
- **기대효과**: stale 13년 추정치 → 2024 1차 실측.
- **Pillar**: S2 가공

### `[w_galchi_sg_valueup]` SG 2026 밸류업 마진 시뮬레이션
- **근거 파일**: `GAIN_Korea_Seafood_2024.md`
- **검증결과**: 인라인 가정 마진인데 `isLive:true`. 내부 전략문건 추정(측정값 아님).
- **변경**: `isLive` 제거 → `STATIC`. cardDesc·SIT에 "내부 가정 시나리오(측정값 아님)" 명시. 시장근거를 GAIN 실측("수산 HMR +14%/yr by 2030", 검증 line 282)으로 보강.
- **기대효과**: 허위 LIVE 제거 + 가정/실측 구분.
- **Pillar**: S2 가공

### `[w01]` 전국 갈치 위판 시계열 & `[w18]` KAMIS 산지-소비지 스프레드
- **근거 파일**: `FAOSTAT_FBS_korea_seafood.csv`(보조), `Japan_import_HS030389...csv`(중국 CIF 검증)
- **검증결과**: `LIVE_WIDGETS=['w01','w05','w17','w18']` 하드코딩으로 LIVE 배지가 붙지만 `applyLive()`는 w25~w29에만 적용 → 정적 JSON을 LIVE로 표기(L-09).
- **변경**: (택1) 실시간 KAMIS fetch를 차트 data에 실제 바인딩하거나, `LIVE_WIDGETS`에서 w01·w18 제거 후 `SYNCED`/`STATIC`. 과장어구("압도"·"패권의 종말"·"권력") P-03 톤다운.
- **기대효과**: 미바인딩 LIVE 라벨 정직화.
- **Pillar**: S4 판매

### `[w29]` NOAA·KFAS 기후-가격 융합 매트릭스 & `[w_kosis_cpi_spread]`
- **근거 파일**: `FishStat_Capture_hairtail_v2.csv`, `KMI_Trend_218`, `GAIN_2024`
- **검증결과**: w29 — "NOAA SST API" 암시하나 5행 가정 시나리오. "수온 1℃ 상승 시 볼륨 42% 폭락 확정"은 단정(P-03·R-01). w_kosis — fetch 실패 시 빈배열인데 telemetry LIVE 고정 가능.
- **변경**: w29 — source에서 "API" 제거, 실측 앵커 추가(한국 LHT 2020 65,719→2022 53,999t, **-17.8%** 재집계 확인), "시나리오 추정" 라벨. w_kosis — telemetry를 `liveKosis?.isLive ? LIVE : STATIC` 동적분기.
- **기대효과**: 허위 API 라벨·단정 제거.
- **Pillar**: S1 / S4

---

## ## P1 (수치 정정·종 스코프 통일·출처 보강)

### `[w14]` 글로벌 갈치 어획 50년 — 중국 집중 형성 ★종 스코프 충돌 해결★
- **근거 파일**: `FishStat_Capture_hairtail_v2.csv`
- **검증결과**: **이것이 최대 충돌점.** S1/S4 제안 = LHT-only 84.5%, S3 제안 = all-species 64.5%+India 16.2%. 재집계 양쪽 모두 산술적으로 맞으나 스코프가 다름:
  - **LHT-only(갈치)**: global 1,068,858t, 中 84.5%, 韓 5.1%(2위), code 364(이란) 2.2%. India(356)는 LHT에 거의 없음.
  - **all-species(갈치류 전체)**: global 1,400,058t, 中 64.5%, **印 16.2%**, 韓 3.9%. India 16.2%·2위는 **SFS/CUT(비-갈치종) 때문에 생긴 artifact** — 갈치(LHT) 소싱과 무관.
- **결정/변경**: **LHT-only로 통일**(갈치 대시보드이므로). 中 84.5%·韓 5.1%, 1990 66.9%→2010 88.4%→2022 84.5%(재집계 확인). 韓 1990 103,997t→2022 53,999t. "India 2위" 서사는 **삭제**(혼선 유발). 과장어구("압도적 지배"·"독재"·"학살") → "LHT 어획의 80%대를 중국이 차지하는 고집중 구조"(P-03). telemetry `STATIC`(FAO FishStat 2022).
- **기대효과**: 종 혼선 제거 + 환각성 "India 2위" 차단.
- **Pillar**: S1 / S3

### `[w20]` 일본 수출 프리미엄 $11.15/kg
- **근거 파일**: `Japan_import_HS030389_2019-2023_UN_Comtrade.csv`
- **검증결과**: 재집계 — 한국→일본 2023 = **$11.17/kg**(985,955kg, $11,010,862, 정확 일치). 기존 "중국 수입 $2.08"은 lane 혼동(한국의 중국수입가를 일본축에 오삽입). 일본시장 내 중국산 = **$2.85/kg**(6,682,817kg).
- **변경**: $11.15→$11.17 정정. 동일 lane 비교로 일본내 중국산 $2.85 추가 → **3.9배 프리미엄**(11.17/2.85=3.92). 5개년(2019 $9.16→2023 $11.17, 재집계 확인). telemetry `SYNCED`.
- **기대효과**: lane 혼동 제거 + 동일출처 프리미엄 입증.
- **Pillar**: S3 물류

### `[w25]` UN Comtrade 글로벌 교역 흐름
- **근거 파일**: `Japan_import_HS030389...csv`
- **검증결과**: FALLBACK이 실측무관 라운드넘버("한국 export 11, 중국 510"). 보유 원자료는 **일본 수입 단면만** 존재.
- **변경**: 위젯 범위를 "일본 수입시장 갈치 공급국 경쟁"으로 정직 한정. 2023 일본수입: 중국 $19.0M(6,682t)·한국 $11.0M(986t·고단가). 키 발급 전 `isLive:true` 금지.
- **기대효과**: 라운드넘버 → 실측, 범위 정직화.
- **Pillar**: S3 물류

### `[w22]` 한국인 수산물 소비
- **근거 파일**: `FAOSTAT_FBS_korea_seafood.csv` + `GAIN_2024`(Table 4 교차)
- **검증결과**: SIT "캐시카우 지위 확정"은 실측과 **정반대** — FAOSTAT 1인당 공급 2011 **59.53kg→2018 56.89→2023 52.82kg**(재집계 확인, -11%/-7%). ⚠ **추가 발견**: 2021-2023뿐 아니라 **2010~2023 전 연도가 flag E**(FAOSTAT FBS 전수 추정) — 라벨에 반영 필요.
- **변경**: SIT를 하락추세로 정정 + 대체재(육류) 교차탄력 리스크. telemetry `STATIC`, "FBS 전 시계열 추정(flag E)" 명시. 과장어구("폭력적"·"캐시카우 확정") 삭제.
- **기대효과**: 사실 역전 정정 + 추정 라벨 정직화.
- **Pillar**: S4 판매

### `[w23]` 수산물 관세 MFN 10% & `[w10]` 해수부 정책 모니터링
- **근거 파일**: `GAIN_2024`(Table A10), `CECAF_demersal_subgroup_south_2022.md`
- **검증결과**: w23 — 출처 3개 혼합 모호, FTA 적용세율 미반영. w10 — telemetry/syncDate 전무(A-02), 제목-출처 불일치.
- **변경**: w23 — GAIN Table A10 1차값(냉동어류 0303 MFN 10%, 갈치 조정관세 미적용, 명태 0303.67 조정관세 22% 대조)로 교체. w10 — telemetry `SYNCED` 부착, CECAF 자원관리 권고 트래킹으로 초점 정렬, source 명확화.
- **기대효과**: 출처 일원화 + 라벨 누락 해소.
- **Pillar**: S3 / S5

### `[w04]` SST 상승-어획 감소 시나리오
- **근거 파일**: `FishStat_Capture_hairtail_v2.csv`
- **검증결과**: subtitle "NOAA SST" 라벨 불일치(실제 KFAS·수과원). 제주한정(-67.6%)을 한국전체로 오해 유발. ⚠ 제안서 "2008 75,092t"은 실측 **72,934t**과 차이(재집계).
- **변경**: subtitle을 "KFAS 군집분석(2025)·수과원 수온관측"으로 정정. 제주한정 명시 + 한국전체 LHT 보조라인(2008 72,934→2022 53,999t, -26%) 병기.
- **기대효과**: 출처 라벨 일치 + 스케일 오해 차단.
- **Pillar**: S1

### `[w06]` 학교급식 B2B & `[w02]` 유통 마진 폭포
- **근거 파일**: `GAIN_2024`
- **변경**: w06 — 추정 침투율에 GAIN 실측앵커(HMR +14%/yr·HMR 원재료 수입 68%, 검증 line 282) 추가, 추정/실측 구분. w02 — S2→S3/S4 재분류 권고(Pillar 정합), 유지 시 GAIN Table 3 가공부가가치 교차각주.
- **기대효과**: 추정 단독 → 1차 앵커 보강.
- **Pillar**: S2

---

## ## P2 (신규 위젯 — 모두 1차 출처·실측 기반, 중복 병합 후)

### `[신규] 갈치 어획 50년 — 한국 자원 장기 쇠퇴 곡선`
- **근거**: `FishStat_Capture_hairtail_v2.csv` (LHT, Area 61) — 재집계 검증: 1990 103,997t→2022 53,999t(-48%), 2020 65,719→2022 53,999(-17.8%), 2022 Area61 100%
- **cardDesc**: FAO FishStat LHT 어획(~2022) · **SIT**: 한국 갈치 32년 -48%, 양식 0톤 순자연산 / **TAK**: 어획정점기 선도 락-인 + Area 61 단일집중 대비 / **telemetry** `SYNCED`(2026-05) · **Pillar** S1

### `[신규] 세계 갈치(LHT) 어획 중국 집중도` (S1·S5 중복 → **병합 1건**)
- **근거**: `FishStat_GlobalProd_hairtail.csv` / `FishStat_Capture_hairtail_v2.csv` — 재집계: 2022 LHT global 1,068,858t, 中 903,498t(84.5%), 韓 53,999t(5.1%), 이란 2.2%
- ⚠ **S5 newWidget의 "중국 65%"는 all-species 수치 → LHT-only 84.5%로 통일** / **SIT**: 단일국 84.5% = 글로벌 공급 단일의존 / **TAK**: 비-중국 산지 비중 KPI화 · 분기 분산매수 / `SYNCED` · S1/S5

### `[신규] 갈치 양식 부재 — 100% 야생어획` (S1·S5 중복 → **병합 1건**)
- **근거**: `FishStat_GlobalProd_hairtail.csv` — 재집계: 8,256행 **전부 CAPTURE, AQUACULTURE 0건**(검증 완료)
- **SIT**: 공급 100% 야생, 증산수단 없음 / **TAK**: 완충은 재고·선도뿐, 의무비축 룰 명문화 / `SYNCED` · S1/S5

### `[신규] 한국 수산가공품 생산량·생산액 7년 추이`
- **근거**: `GAIN_2024` Table 3 — 검증: 2023 **1,208,452t / 7,581,294 백만원(7조5,813억원)**, 2022 1,299,740t(물량 -7%, 금액 +7.8%)
- **SIT**: 물량 감·금액 증 = 고부가 전환 / **TAK**: 순살·HMR로 톤당마진 / `STATIC`(2024-11) · S2

### `[신규] 국내 수산가공 카테고리 구조`
- **근거**: `GAIN_2024` — 검증: 냉동>연육(surimi)>가공해조>염장>조미>통조림(line 205, 정성순위, 절대값 비공개)
- 순위/상대값 막대(절대값 추정 금지) · `STATIC` · S2

### `[신규] 수산물 공급·이용 계정 (표층어류)`
- **근거**: `FAOSTAT_FBS_korea_seafood.csv` Pelagic Fish — 검증: 2020 생산 737·수입 660·식용 745·사료 252(천톤), 단백 4.63g/일(flag I/E)
- cardDesc에 "2021-23 캐리포워드 추정" 명시 · `STATIC` · S2

### `[신규] 일본시장 한국산 3.9배 프리미엄`
- **근거**: `Japan_import_HS030389...csv` — 재집계 검증: 2023 韓 $11.17/kg vs 中 $2.85/kg = 3.92배, 韓 2019 $9.16→2023 $11.17, 中 $2.58→$2.85
- `SYNCED` · S3

### `[신규] 한국 수산물 수입 공급국 순위`
- **근거**: `GAIN_2024` Table A1-1 — 검증: 2023 중국 $1,296M(+3.8%)·러시아 $1,090M(-23.1%)·베트남·노르웨이, 전체 $5,929M(-8.3%)
- `STATIC` · S3

### `[신규] 한국 수산물 자급률 추이` & `[신규] 피쉬플레이션 수요압박`
- **근거**: `GAIN_2024` Table 5(2023 64.8%/2021 70.9%/2016 71.4% 검증) + `KMI_Trend_218`(피쉬플레이션·물가안정 핵심과제 검증)
- `STATIC` · S3/S4 (자급률 위젯은 S3·S4 양쪽 제안 → **S4에 1건, S3는 수입순위로 차별화**)

### `[신규] 후쿠시마 SPS 통제` & `[신규] 2026 물류 전망` & `[신규] KORUS FTA TRQ`
- **근거**: `GAIN_2024`(8개현 금지·July 2023 조사 검증) / `KMI_Trend_218`(+3.0% 15.9억t·수출 +1.2~2.7% 검증) / `GAIN_2024` Table 6
- 모두 `STATIC`, 1차 출처 · S3

### `[신규] 대체단백 교차압력 (수산 vs 육류)`
- **근거**: `GAIN_2024` — 검증: 육류 CAGR 2.6% vs 수산 1.4%(2016-22), 2019-22 육류가 수산 추월(line 217-219)
- `STATIC` · S4

### `[신규] 대체소싱처 자원 건전성 (서아프리카)`
- **근거**: `CECAF_XXIII_2023_4.md` — 검증: 북부 데머설 9개 과잉어획, Merluccius·Epinephelus aeneus(모리타니아·세네갈·감비아)
- `SYNCED` · S5

---

## ## 주의·갭

1. **[최우선] 종(species) 스코프 통일 필수**: `FishStat_*_hairtail.csv`는 LHT(갈치)+SFS+CUT+BSF+TCW 5종 혼재. 중국 점유율이 **LHT-only 84.5% vs all-species 64.5%**로 갈림. 갈치 대시보드이므로 **LHT-only 통일** 권고. S3 제안의 "**India 16.2%·2위 공급국**"은 비-갈치종(SFS/CUT) artifact이며 LHT에는 거의 없음 — **갈치 위젯에 넣으면 사실상 환각** → 삭제 또는 "갈치류 전체 기준" 명시 필수.

2. **연도 라벨 오기 확산**: GAIN Table 2 TAC는 헤더가 **2021-2024**(line 152). S1/S2/S5 제안 다수가 "2020 30,126"으로 1년 밀려 표기 → 전부 2021부터로 정정.

3. **FAOSTAT FBS 전 시계열 flag E**: S4 제안은 "2021-2023 flag E"라 했으나 실제 **2010~2023 전 연도가 flag E**(FBS imputation). "2023 실측"이 아니라 "FAO 추정 전 시계열" → 라벨 강등 정확.

4. **Pelagic Fish 볼륨은 flag I(imputed)**: S2 공급계정 위젯의 천톤 수치는 FAO 보간값 → cardDesc에 명시.

5. **소수 수치 미세오차**: 제안서 "2008 한국 75,092t"=실측 72,934t, "Korea 2020→2022 -18%"=실측 -17.8% — 사소하나 정정 권고.

6. **신선도 전원 충족**: 모든 1차 출처 ≥2023-05(FishStat 2022 연 1회 공식·GAIN 2024-11·KMI 2026-02·CECAF 2023-07·Comtrade 2023). FishStat "2022"는 FAO 최신 공식 어획연도로 신선도 충족(연 단위 통계 특성).

7. **검증 불가 잔존**: OSH 공장수·노동점수, OFAC 제재건수, NOAA SST API, 세네갈 FTA — 보유 agri_data로 검증 불가 → 전부 P0 강등/대체 대상(위 반영). 추가로 KOSIS CPI·KAMIS 실시간은 코드 fetch 존재 시에만 LIVE 허용.

8. **중복 병합 결과**: S1·S5의 "양식 부재"·"중국 집중도" 위젯, S3·S5의 w26, S3·S4의 "자급률" 위젯이 중복 → 각 1건으로 통합(신규 18→16건 권고).