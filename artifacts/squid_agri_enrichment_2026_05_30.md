Confirmed: w25 chitosan source is `'Global Marine Biotech Report 2024'` with reliability 100 — but no chitosan/biomaterial primary source exists in agri_data (empty grep). The "$50-200/kg, 400% margin" claim is unbacked → S2's P0 verdict (downgrade to STATIC/추정, strip reliability) is correct. Squid oil Korea 2023=366톤 confirmed in CSV9 (last value in the Korea squid oil row) → partial physical backing valid.

All verifications complete. No hallucinated files. All load-bearing numbers verified verbatim against primary sources. Now writing the final consolidated execution plan.

---

# 오징어 5-Pillar 위젯 보완 — 최종 실행계획 (종합·검증판)

**한줄요약:** Refresh 24건 + 신규 16건 (총 40건) 중, agri_data 인용 파일 **22종 전수 실재 확인(환각 0건)**·load-bearing 수치 전수 verbatim 일치. 핵심 자산은 ① 허위 LIVE 라벨 5건(`w12_ax_fishing`·`w54`·`w55`·`w_kosis_squid_cpi`·`w_squid_eu_ceph_demand`) 정직 강등, ② orphan 슬롯 7건(`w_squid_hs_tariff_sim`·`w84`·`w_ofac_iuu_radar`·`w_wto_squid_sps`·`w_mfds_squid_safety`·`w86`·`w88`) 정의 채움 또는 제거, ③ `SeaAroundUs` 4건 오표기 → FAO 원본 단일화, ④ 1차 출처 `_152 보고서(2025-06~2026)`·`EUMOFA MH6/2025`로 최신 수급 시그널 주입.

검증 핵심 결과: `isLiveApi:true`인데 `apiEndpoints=['hsping','kosis','mfds','ofac','wto','importyeti','squid-forecast','squid-sourcing']` 8종에 미포함 → LIVE 부정직 = TSX/JSON에서 실증. `kosis/route.ts` L5 주석 자체가 "위젯 데이터는 정적… 헬스 표기만 LIVE" 인정. orphan 7종 모두 `PILLAR_WIDGET_IDS`엔 등록·`v4.json`엔 정의 0건.

---

## P0 — 정직성·렌더링 무결성 (즉시)

**[w12_ax_fishing] 허위 LIVE 강등**
- 근거: `public/data/squid_real_data_v4.json` (`isLiveApi:true`·source "해수부 원양어선 현대화(2025)·수협중앙회 결산서(2025)"), `components/SquidDashboard.tsx` L176 apiEndpoints에 미포함 — TSX/JSON 교차로 LIVE 부정직 실증. `/Users/idong-geon/agri_data/squid/raw_data/2025년도 어업경영조사보고.md` (실재 확인)
- 변경: `isLiveApi:false`, telemetry=SYNCED, syncDate='2025'. 원가는 어업경영조사보고(2025) 근해채낚기 비용구조로 교차검증. cardDesc='수협중앙회 어업경영조사보고(2025)·SYNCED 2025'
- 기대효과: 연1회 정태 재무자료의 LIVE 뱃지 제거 → 신뢰도 라벨 정합 / Pillar **S1**

**[w54_sourcing_bottleneck] 허위 LIVE·"Thai MOC 라이브" 문구 제거**
- 근거: JSON `isLiveApi:true`·source "UN Comtrade API (2025), Thai MOC 라이브 연동" 확인 — fetch 흐름 없음. `/Users/idong-geon/agri_data/squid/processed_data/squid_trade_matrix.json` (Peru→China 등 Comtrade 2023 양자흐름, 실재)
- 변경: 정적 추정배열을 trade_matrix.json 실 양자흐름으로 교체. source='UN Comtrade 양자무역 2023(HS 0307/1605)', "Thai MOC 라이브" 삭제, isLiveApi=false, telemetry=SYNCED syncDate=2023
- 기대효과: 검증불가 LIVE 주장 제거 + 실측 점유율 / Pillar **S3**

**[w55_export_concentration] 허위 LIVE 강등**
- 근거: JSON `isLiveApi:true`·source "태국 관세청 실시간 통관 API(HS 0307)" 확인 — 실시간 fetch 코드 부재. `squid_trade_matrix.json`
- 변경: cardDesc "실시간 통관 API" 삭제, isLiveApi=false, telemetry=SYNCED syncDate=2023(Comtrade 확정)
- 기대효과: LIVE 근거 없는 위젯 정직화 / Pillar **S4**

**[w_kosis_squid_cpi] 하드코딩 추정 CPI(168) 제거**
- 근거: `app/api/squid/kosis/route.ts` L5 주석 "위젯 데이터는 정적… 헬스 표기만 LIVE", L28 `isLiveApi:health.ok`, L45 추정 "168까지 폭등" 실증. `/Users/idong-geon/agri_data/squid/processed_data/squid_korea_supply.json` (import_cost_per_ton 2000=2187→2023=3223, self_sufficiency 95.7%→35.6% 실측 확인)
- 변경: 추정 CPI 라인을 수입단가 vs 자급률 디커플링으로 재구성. KOSIS healthcheck는 "키 유효성 모니터"로만 라벨 분리, telemetry=SYNCED syncDate=2023(FAOSTAT)
- 기대효과: 미검증 168 제거 → 실측 디커플링 / Pillar **S4**

**[w_squid_eu_ceph_demand] 허위 LIVE·추정 시계열(508E) 교체**
- 근거: `SquidDashboard.tsx` L276 inline 정의 `isLive:true`+라운드 추정(2025=508E). `/Users/idong-geon/agri_data/squid/intelligence_reports/MH 6 2025_final.md` L299 verbatim 확인: 두족류 첫경매 78.5M EUR(+11%)·10,617톤(-3%)·오징어 +7%·문어 +22%·갑오징어 -17%, France Squid 9.70→9.58 EUR/kg(-1%, L326)
- 변경: 추정 508E 제거, EUMOFA 실측으로 교체. isLive:true→telemetry:SYNCED syncDate='2025-06'
- 기대효과: LIVE 추정 위젯을 1차 실측으로 / Pillar **S4**

**[orphan 7종] 빈 슬롯·렌더 누락 해소** `w_squid_hs_tariff_sim`·`w84_reefer_logistics_cost`·`w_ofac_iuu_radar`·`w_wto_squid_sps`·`w_mfds_squid_safety`·`w86_ssrt_labor_risk_scorecard`·`w88_uschina_fishery_geopolitics`
- 근거: TSX `PILLAR_WIDGET_IDS`엔 등록·`v4.json` 정의 0건 전수 확인(filter silently skip). 채움 데이터: `squid_korea_supply.json`/README §3.3(HS 관세), `squid_origin_diversification.json`+`squid_logistics_cost.json`(리퍼), `BRIGHT LIGHTS…EJF_33.md`+`CHINA'S GLOBAL FISHING OFFENSIVE…CCP_34.md`(IUU/노동/지정학) — 모두 실재
- 변경: 둘 중 하나 필수 — (1) 데이터 없는 ID는 리스트에서 제거(허위 카운트 방지) 또는 (2) 아래 신규 위젯으로 정의 주입. **권고: HS관세·리퍼·forced-labor·DWF는 신규로 채우고, 매핑 불가능한 잔여 ID는 제거**
- 기대효과: "위젯 N개" 카운트와 실제 렌더 수 일치 / Pillar **S3·S5**

**[w25_squid_chitosan_biomaterial] 검증불가 2차출처 정직화**
- 근거: JSON source='Global Marine Biotech Report 2024'·reliability 100 확인 — agri_data에 chitosan/biomaterial 1차 출처 **부재(grep 0건 확인)**. "$50-200/kg·400% 마진" unbacked
- 변경: 가격·마진 수치를 STATIC(추정) 라벨로 정직 강등, reliability 하향, LIVE/검증 라벨 금지. 물량 베이스만 CSV9 Squid oil(Korea 2023=366톤, 실측 확인)로 부분 보강
- 기대효과: 신뢰도 100 부풀림 제거 / Pillar **S2**(주제상 S5→S2 재편 검토)

**[w52_iuu_geopolitics / w77_mile201_dwf_crisis / w58_iuu_blackbox_risk] 추정 스코어 → 1차 출처 교체**
- 근거: `CHINA'S GLOBAL FISHING OFFENSIVE…CCP_34.md`(DWF 2,000-16,000척·글로벌 어업노력 44%·110M시간·$7.2B 2017 — verbatim 확인), `BRIGHT LIGHTS…EJF_33.md`(343척·중국 74.6%/대만 18.0%/한국 6.7%·어업노력 91%·공해시간 +65%·중국 +85%·63.0% 폭력연관 — verbatim 확인), `Concerns Over Squid…CORI_45.md`(거버넌스 근거)
- 변경: 라운드 추정 막대를 원문 수치로 교체, telemetry=STATIC syncDate=2026-05-30, EJF 신뢰도 80→95 상향. SeaAroundUs 스코어 제거
- 기대효과: 1차 NGO/의회 출처로 ESG 신뢰도 정상화 / Pillar **S5**

---

## P1 — 출처 정정·최신성 주입

**[w1_catch_powers / w3_jumbo_flying / w2_korea_supply / w4_unit_price / w7_korea_category] SeaAroundUs 오표기 제거**
- 근거: 5건 모두 JSON source='FAO FishStatJ + SeaAroundUs Database' 확인. SeaAroundUs는 catch 모델 추정으로 단가·가공·포트폴리오 1차출처 아님. 교체축: `2. 오징어 생산량(어획량) 1950-2024.csv`(한국 2024=105,354톤), `squid_unit_price.json`(FAOSTAT TM Item873 파생), `squid_import_portfolio.json`(2023 냉동 114,536t/73.6% 등) — 실재
- 변경: 'SeaAroundUs' 삭제→FAO 원본/FAOSTAT 무역통계 단일화, telemetry=SYNCED syncDate=2023~2024 부착, 2025 데이터포인트는 '잠정' 플래그
- 기대효과: 출처-데이터 정합 + 최신 데이터포인트 확장 / Pillar **S1·S4**

**[w68_import_dependency / w17 / w10_processed_dominance / w47_spain_processing_empire / w49_processing_funnel] 가공·수입 출처 실측 고정**
- 근거: `9. 오징어 가공 생산량 1976-2023.csv` (Peru frozen 2023=354,310.2톤·rings 19,457.29·prepared 333.81 — verbatim 확인 → 단순냉동 94.7% 검증), `_152 보고서` L185(2025.1-8 페루 +47%/칠레 +10%/중국 -0.7%/미국 -5.0%, 8월 냉동동체 +60.0% — verbatim), `squid_import_portfolio.json`
- 변경: SeaAroundUs 표기 제거→FAO FishStat 가공통계(CC-BY-4.0, 2025-07 발표). PRODCOM 2022는 1차축 유지+FishStat 교차검증. telemetry=STATIC freshness=2023, 산지 다변화 레이어 추가 syncDate=2025-08
- 기대효과: 출처 신뢰성 + 2025 다변화 트렌드 반영 / Pillar **S2·S3**

**[w27_squid_climate_geopolitics / w11_no_aquaculture] 미연결 데이터 직결**
- 근거: `squid_climate.json`(ONI×어획 1980-2024, 2024=480,844톤/ONI -0.5 — 확인), `FishStat_Aquaculture_squid.csv`(nonzero 10행·누적 32.635톤·단일최대 17톤 — 전수 계산 확인). 주의: 17톤은 1990 area 37(지중해·흑해) **CTC=갑오징어**이며 제안의 "동중국해 갑오징어"는 지리 오표기
- 변경: 차트 데이터 직결, 양식 출처를 'FAO FishStat 양식생산'으로 정정(NOAA ENSO 오표기 제거), telemetry=SYNCED syncDate=2026-03(메타 갱신일)
- 기대효과: 정량 차트 연결 + 출처-주장 정합 / Pillar **S1·S5**

---

## P2 — 신규 위젯 (실데이터 기반, 16건 중 dedup 후 권고)

**[신규] 한국 살오징어 자원 회복 시그널 — 2025 반등·2026 어기 전망**
- 근거: `_152 보고서` (883톤/+158%·평년 -18%·2026어기 2.6~3.6배 — verbatim 확인)
- 추가: composed 차트, telemetry=SYNCED 2025-06. SIT(883톤 +158%, 평년 -18%, 2026 2.6~3.6배 상향)+TAK(조달계획 반영, 평년 -18% 갭=수입의존 유지) / Pillar **S1**

**[신규] 수입 산지 다변화 — 페루 +47% vs 중국 -0.7% (2025)**
- 근거: `_152 보고서` L185 (verbatim 확인)
- 추가: bar, telemetry=SYNCED 2025-08 isLive=false. cardDesc='KMI 2024-2026 보고서(데이터 2025.06)' / Pillar **S3**

**[신규] 수입 통관단가 23년 추이 — MT당 $2,187→$3,223**
- 근거: `squid_korea_supply.json` (2000=2187→2023=3223, 자급률 95.7→35.6 — 실측 확인)
- 추가: composed, telemetry=SYNCED 2024 isLive=false / Pillar **S3·S4**

**[신규] 포클랜드 Loligo(D. gahi) 자원평가 — 1만톤 보전 임계선**
- 근거: `Vessel Units…Falkland_106.md` (escapement 10,000톤·VU 27.01 — 확인). **정정필수: Table 2.1 바이오매스 52,941/145,482/242,913/160,375/138,471은 1st seasons 2020/2021/2022/2023/2024이며, 제안의 시작값 52,941을 "최근 첫 시즌"으로 둔 연도 정렬 오류 보정 필요**
- 추가: composed, telemetry=STATIC 2024(FIFD VUAEAC 2025, Crown Copyright) / Pillar **S1**

**[신규] EU 두족류 첫 경매가 — 오징어 +7% (2025)** | 근거 `MH 6 2025_final.md`(verbatim) | telemetry=SYNCED 2025-06 / **S4**

**[신규] 글로벌 가공유형 지도·어획→가공 수율·일본 가공 디플레이션** | 근거 `9. 가공 CSV`+`FishStat_Capture_squid.csv`(실재) | telemetry=STATIC 2023 CC-BY-4.0 / **S2**

**[신규] 수입 루트 리드타임·IUU/ITQ 컴플라이언스** | 근거 `squid_origin_diversification.json`(80/55/30일)·`squid_compliance_risk.json`(포클랜드 ITQ85/IUU15, 중국공해 10/95 — 확인) | **두 파일 모두 source 필드 없는 내부모델 → telemetry=STATIC + "실측 운임 미연동" 정직 표기 필수** / **S3**

**[신규] 강제노동·DWF 지배·한국 면세유 탄소** | 근거 EJF_33.md·CCP_34.md(verbatim)·`2025년 11월 면세유류현황…md`(실재) | telemetry=STATIC/SYNCED / **S5**

---

## 주의·갭

1. **중복 병합 필수 — 양식 불가 위젯이 S1·S5 양쪽 신규로 중복.** 동일 evidence(`FishStat_Aquaculture_squid.csv`, 32.635톤/17톤)를 2개 Pillar가 각각 신규 제안 → **단일 위젯으로 병합하고 한 Pillar(S5 ESG 자원관리 맥락 권고)에만 배치**. w11_no_aquaculture refresh와도 주제 동일 → refresh로 통합 권고.

2. **정직 라벨 강제 — 내부모델 4종**(`squid_origin_diversification.json`·`squid_logistics_cost.json`·`squid_compliance_risk.json`은 source 필드 부재·라운드넘버 확인): LIVE/SYNCED 금지, **STATIC + syncDate 2026-05-30 + "실측 미연동" 명기**. 제안서가 이미 정직 STATIC 라벨링한 것은 적절.

3. **수치 정정 2건(환각 아님, 라벨/정렬 오류):** ① Falkland 바이오매스는 **2020~2024 연도 정렬**(제안의 "최근 1차 시즌" 서술 보정). ② 양식 17톤은 **area 37 지중해·흑해 CTC(갑오징어)**이지 "동중국해"가 아님 → SIT 지리 표기 수정.

4. **w25 키토산 가격($50-200/kg·400% 마진)은 agri_data에 1차 출처 부재 확정.** 별도 1차자료(KMI·논문) 수집 전까지 **STATIC(추정) 라벨 + reliability 하향 + 검증/LIVE 라벨 금지**. 물량 베이스만 Squid oil(366톤) 부분 보강 가능.

5. **신선도 전수 통과:** 인용 1차출처 모두 ≥2023-05 — `_152`(2025-06~2026), `EUMOFA MH6`(2025), `EJF`(2025), `CCP`(2026-01), `CORI`(2025-05), `Falkland VUAEAC`(2024-2025), FAO FishStat(메타 2026-03). 강등/제외 대상 없음.

6. **w7_korea_category 단가 주의:** `squid_import_portfolio.json` 2023 가공/조미 4,296 vs 냉동 2,580 USD/톤(약 1.7배)은 검증 가능하나, S4 SIT의 "톤당 약 1,700 USD 회피 마진"은 가공원가 차감 전 단가차이일 뿐 — **마진≠단가차이임을 SIT에 명시**(과장 방지, P-03).