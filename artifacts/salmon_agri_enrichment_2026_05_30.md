All processing-pillar figures verified:
- **salmon_processed_split.json**: 1990=51,164 / 2018=256,177 (peak) / 2022=232,048 / 2023=215,266 (frozen 114,815 + prepared 100,451). EXACTLY matches the new widget #1 and w04_proc correction. CONFIRMED. Note: w04_proc's "2022 30만톤" claim contradicts the chart's own 232,048 — the proposal's self-contradiction diagnosis is correct.
- **PTAT Smoked FR price structure (L972-979)**: Raw material 8.19 EUR/kg (21%), Ex-factory 25.34 (66%), Retail incl VAT 38.54 (100%). EXACTLY matches new widget #2. CONFIRMED.
- **PTAT Organic yield ladder (L286-290)**: GWT 84%, Head-off gutted 77%, Fillet skin-on C-Trim 60%. EXACTLY matches new widget #3. CONFIRMED.

Verification is comprehensive. All cited files exist on disk and the load-bearing figures match at the line/cell level. I now have everything to produce the merged final execution plan.

---

# 연어(Salmon) 5-Pillar 위젯 보완 — 최종 실행계획

**한줄요약:** 디스크 실측 검증 완료 — 인용 파일 28종 전부 실재(환각 0건), refresh 27건 + 신규 19건. 핵심 자산은 FAO FishStatJ 1950-2024 CSV(2024년 컬럼 populated 확인) · EUMOFA MH 1/4 2026·EFM2025(1차, 라인단위 일치) · KMI FTA 2026 Q1(2026-05) · 처리본 JSON 18종. 최우선 과제는 v4 JSON에 박힌 **"📡 LIVE API 연동" 허위 라벨 20건** 제거와 **w43 HHI 조작 시계열**(매끈한 4550→3590 vs 실측 5247→3248→3502→3336) 교체.

**검증 결과 요지 (환각·라벨 감사):**
- 인용된 raw CSV·processed JSON·intelligence report·KMI txt **전부 디스크 존재**. 환각 출처 0건.
- **데이터 정합성 확인**: FAO 양식 2024 = 노르웨이 1,552,887 / 칠레 702,768(2023 768,784 대비 -8.6%) / Totals 2,704,464; 어획 2024 = 772.43톤 — 제안서 수치 전부 CSV 실측과 일치(초기 awk 오프셋 오류로 "2024 공란" 의심했으나 헤더 정렬 재검증 결과 2024 컬럼 정상 populated).
- **허위 LIVE 라벨 구조적 확인**: salmon API 라우트는 comtrade·kcs·kamis·dart·usda-fas 5종뿐. esg·climate·carbon·materiality·processing·supply 라우트 없음 → 해당 위젯의 LIVE 라벨은 전부 거짓. v4 JSON 내 "📡 LIVE API 연동" 20회 + telemetry:"live" 3회 + "실시간 연동중" 3회 실재 확인.
- **w43 조작 확인**: v4 JSON HHI(2018 4550→2022 단조감소)가 실측 salmon_hhi.json(변동성 큼)과 불일치 — D-02 위반 사실.

---

## P0 — 허위 라벨·데이터 조작 (정직성 위반, 즉시)

### `[w43_diversification]` 한국 수입 다변화 지수 — HHI 조작 + 허위 LIVE
- **근거 파일:** `/Users/idong-geon/agri_data/salmon/processed_data/salmon_hhi.json`(실측 2020=5247·2021=3248·2022=3502·2023=3336) + `salmon_korea_origin.json`(2023 노르웨이 51.4%·칠레 47.8%) + `13_공통(General)/한국기관/kmi_fta_quarterly/md/FTA체결국_수산물_수입동향_2026_Q1.txt`(수입액 비중 노르웨이 72.1%·칠레 24.8%)
- **변경:** v4 JSON의 조작된 매끈한 HHI 보간값을 실측 salmon_hhi.json 시계열로 교체. telemetry "live"/"실시간 연동중" → SYNCED(syncDate 2026-05). cardDesc "KMI FTA 수입동향 2026Q1 + Comtrade 원산지(salmon_hhi.json)".
- **기대효과:** D-02(데이터 조작)+L-09(허위 LIVE) 동시 해소. 변동성 있는 실측 곡선이 오히려 "공급 집중 리스크 재상승" 내러티브를 강화.
- **Pillar:** S4 판매·수요 (+S3 교차)

### `[v4 JSON 전역]` "📡 LIVE API 연동" 문구 20건 일괄 제거
- **근거 파일:** `/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/public/data/salmon_real_data_v4.json`(grep 실측 20건) + `components/SalmonDashboard.tsx`(L169-177 실 fetch는 정적 JSON 1 + kcs/kamis/comtrade 3종뿐)
- **대상 위젯:** w18_extinction, w19_iceland, w04_proc, w16_processing, w24_poland_hub, w11_kr_price, w12_margin, w20_margin_paradox, w09_kr_import, w15_korea_deficit, w02_aqua_value, w44_scope3_carbon, w06_trade_vol, w07_export, w08_import, w21_russia_blackhole, w23_chile_chokepoint 등
- **변경:** source 문자열에서 "[📡 LIVE API 연동: …]" 제거, 각 위젯 정적 1차출처만 잔존. telemetry는 정직 라벨(스냅샷=SYNCED, 학술/불변계수=STATIC).
- **기대효과:** L-09 허위 LIVE 라벨 누적 위반 일괄 청산.
- **Pillar:** 전 Pillar 공통

### `[SalmonNTBRadar]` fetch 결과 폐기 후 정적 렌더 (오해성 LIVE 동작)
- **근거 파일:** `components/SalmonNTBRadar.tsx`(fetchComplianceData가 /api/wits·/api/risk-radar 호출 후 응답 버리고 항상 staticItems setItems) + `processed_data/salmon_ntb_radar.json`
- **변경:** 버려지는 fetch 제거(또는 응답 실반영). cardDesc "WITS·OFAC·MFDS·KMI 정책연구 기반 6개국 컴플라이언스 스냅샷(STATIC)"으로 정직화. 데이터(한-칠레 FTA 냉동 10→0%, 한-EFTA 신선 20→0%, 미 SIMP 2026.01 확대, 러 OFAC) 유지.
- **기대효과:** 스피너+"교차검증" UI가 주는 실시간 인상 제거.
- **Pillar:** S3 물류·통관(+S5 공유)

### `[SalmonInsightClimate / SalmonInsightDoubleMateriality]` ESG 인라인 허위 LIVE
- **근거 파일:** `processed_data/salmonInsightClimate.json`(mortality 2022 11→2024 16.2, carbonTax 30→150 — 실측 확인) + `SalmonInsightDoubleMateriality.json` + `salmon_esg_tracker.json`(노르웨이 FCR 1.15 vs 칠레 1.40)
- **변경:** source "📡 LIVE API 연동: 실시간 탄소세율/해수온…" 및 "Scope 3 배출량…실사" 제거. telemetry STATIC 유지(syncDate 2026-05). 폐사율 16.2%(2024)에 Fiskeridirektoratet 1차출처 명시. "Double Materiality" → "이중 중대성" 한글 병기(L-01).
- **기대효과:** ESG 인라인 2건 허위 LIVE 청산 + 출처 1차화.
- **Pillar:** S5 ESG

### `[SalmonInsightSmartColdChain / SalmonInsightLogisticsResilience]` 물류 허위 LIVE + 추정치
- **근거 파일:** `intelligence_reports/MH 4 2026 Final.md`(L67 실측: 2026-02-28 호르무즈 봉쇄, Brent +13%/5일, 노르웨이 연어 항공물량 "절반" 감소, FAO GLOBEFISH 2026-03-13) + `processed_data/salmon_logistics_resilience.json`
- **변경:** "📡 LIVE API 연동: 물류 배출량 추적" 및 "[LIVE API 연동: BDI/CCFI·Eurostat COMEXT]" 제거 → SYNCED. 둥근 추정 운임(airCost 4.5/6.8/8.2 등) 대신 MH 4 2026 실측 내러티브로 교체. euRouteCost 출처미상 열은 "추정(estimate)" 라벨 부착.
- **기대효과:** 물류 컴포넌트 허위 LIVE 2건 청산 + 운임 추정치 정직 라벨.
- **Pillar:** S3 물류·통관

---

## P1 — Stale 데이터 갱신 · 과장수식어 제거 (신선도·P-03)

### `[w03_aqua_pie]` 양식 Top5 (2022) → 2024 FAO 실측
- **근거 파일:** `raw_data/3. 대서양 연어 생산량(양식) 1950-2024.csv`(실측 확인: NOR 1,552,887·CHL 702,768·UK 192,000·AUS 70,915, 2024) + `processed_data/salmon_top_producers.json`
- **변경:** 제목 "(2022)→(2024)". 데이터 2024 실측 교체. syncDate 2026-03 명시. 칠레 감산(-8.6%)을 SIT에 공급리스크 신호로 연결.
- **기대효과:** 2년 stale 해소, HAB 내러티브와 연결. **Pillar:** S1 원료수급

### `[w13_monopoly]` 복점 SIT 2022 → 2024
- **근거 파일:** `raw_data/3. …양식… CSV`(Totals 2024 = 2,704,464; NOR 57.4% + CHL 26.0% = 83.4%)
- **변경:** SIT를 2024 실측으로. 칠레 2023→2024 -8.6%로 점유가 노르웨이 쪽 쏠림(단일공급원 리스크 심화) 서술. telemetry SYNCED.
- **기대효과:** stale 해소 + 리스크 정량화. **Pillar:** S1

### `[w18_extinction / w19_iceland]` 자연산 멸종·아이슬란드 — 출처 정직화 + 종점 2024
- **근거 파일:** `raw_data/2. …어획… CSV`(2024 어획 772.43톤 실측) + `raw_data/3. …양식… CSV`(아이슬란드 2023 43,523톤; 2024 컬럼 재검증 필요)
- **변경:** "UN 텔레메트리"/"북대서양 수산기구" 허위 출처 → "FAO FishStatJ (2026.03 접속)". 양식 의존도 99.97%(772.43 / 2,704,464+772.43). 아이슬란드 시계열 종점 2010→2024 연장.
- **주의:** 카탈로그 "아이슬란드 2024 49,253톤"은 CSV 아이슬란드 행에서 직접 재확인 필요(본 검증서 Totals/NOR/CHL은 확인, 아이슬란드 2024 셀은 미확정).
- **기대효과:** L-09 + 출처 1차화. **Pillar:** S1(w18은 S5와 중복 — 아래 주의 참조)

### `[w04_proc]` 가공 — 과장수식어·자기모순·stale 동시 수정
- **근거 파일:** `processed_data/salmon_processed_split.json`(실측: 2018 peak 256,177 / 2022 232,048 / 2023 215,266 = frozen 114,815 + prepared 100,451)
- **변경:** 제목 "폭발적 팽창"·SIT "600% 폭증" 삭제(P-03). 자기모순 "2022년 30만톤"(차트 실값 232,048과 불일치)을 실측으로 정정. 종점 2022→2023 연장. source "FAO FishStat Global Processed Production 1976-2023(CC-BY-4.0)" STATIC.
- **기대효과:** P-03 + D-02(자기모순) + stale 3중 해소. **Pillar:** S2 가공

### `[w16_processing / w24_poland_hub]` 폴란드 가공 — 단위혼동·환각출처 정정
- **근거 파일:** `intelligence_reports/PTAT Smoked salmon FR DE PL_EN.md`(실측: 폴란드 훈제 77,158톤·EU 47%; 對독일 수출 비중)
- **변경:** 차트에 단위 명시(% vs 톤). w24의 "순이익 $840M"(미검증 추정)·"Poland Customs"(환각 출처) 삭제 → "EU 훈제 47% 점유·노르웨이 원물 재수출 허브" 검증가능 사실로. telemetry SYNCED(2022-23). "급부상" 완화.
- **기대효과:** 환각 출처 제거 + 단위정합. **Pillar:** S2

### `[w11_kr_price / w12_margin / w09_kr_import / w15_korea_deficit]` 판매 4종 — KMI 2026 Q1 실측 + P-03
- **근거 파일:** `13_공통(General)/한국기관/kmi_fta_quarterly/md/FTA체결국_수산물_수입동향_2026_Q1.txt`(실측 L1180: 14.4천톤 +19.6%·153.1백만$ +11.9%; L1191 믹스 40.7/33.7/15.9%; L1246 단가) + `MH 1 2026 Final.md` L1541(노르웨이 €8.41→€7.11, 페로 €9.10→€7.60)
- **변경:** 허위 LIVE 삭제→SYNCED. w09 제목/SIT "절대적·폭증", w15 "블랙홀" 등 P-03 수식어 제거. KMI 2026 Q1 누적 실측 추가. w12는 NSC 미검증 스프레드 대신 EUMOFA €/kg 실측.
- **기대효과:** stale + L-09 + P-03 일괄. **Pillar:** S4

### `[w39_hab_risk]` 칠레 HAB — 단일기업보고서 의존 → FAO 교차검증
- **근거 파일:** `raw_data/3. …양식… CSV`(칠레 2021~2024: 758,556→768,784→702,768) + `intelligence_reports/ANNUAL REPORT 2023 - Salmones Camanchaca.md`
- **변경:** FAO 칠레 -8.6%(2024) 오버레이로 HAB 충격 정량화. syncDate 2025.06→2026-03.
- **주의:** Camanchaca는 2023 발행(신선도 경계선) → 보조출처로 강등, FAO를 주출처로. **Pillar:** S1

### `[w20_margin_paradox / w45_automation_roi]` 단가역설·자동화ROI — 연도/기준선 정정
- **근거:** `salmon_unit_price_by_country.json`·`salmon_export_unit_price.json`(역설) / `PTAT_Organic salmon.md` L286-290(수율 GWT 84%·C-Trim 60% 실측)
- **변경:** w20 생산-수출 단가 갭 분리 제시. w45 수율 baseline을 EUMOFA 표준수율표로 보정, 장비사 수치는 "벤더 제시" 분리.
- **기대효과:** 신선도·근거 보강. **Pillar:** S4 / S2

### `[w42_mortality_kpi]` 폐사율 시계열 정합화
- **근거:** `salmonInsightClimate.json`(mortality 2024=16.2% 실측) + `salmon_esg_tracker.json`(칠레 SRS·적조)
- **변경:** 폐사율 시계열을 단일 출처(salmonInsightClimate.json)로 통일. "주주 가치 파괴"는 수치기반(목표 5% 대비 3배) 재서술.
- **기대효과:** 데이터 정합 + 정성 과장 완화. **Pillar:** S5

---

## P2 — 신규 위젯 (검증된 1차출처 자산 활용)

> 인용 파일·수치 전부 디스크 라인단위 검증 완료. 중복 병합 후 16건 권고(아래 주의 참조로 4건 제외/통합).

### S1 원료수급
- **`[신규]` 노르웨이·페로 EU 수입단가 추이** — MH 1 2026 L1541 실측(€8.41→€7.11, €9.10→€7.60). SYNCED 2026-01. line.
- **`[신규]` 칠레 감산 vs 노르웨이 안정 — 복점 균열** — CSV 칠레 768,784→702,768 / 노르웨이 1,542,480→1,552,887. SYNCED 2026-03. composed.
- **`[신규]` RAS 핵심변수 (수온·광주기·백내장)** — `KFAS_연어_연구_통합_로그.md`(실재 1,994바이트 확인). STATIC 2026-05. composed.

### S2 가공
- **`[신규]` FAO 가공유형 전환: 냉동 vs 조제 (1990-2023)** — salmon_processed_split.json 실측(2023 frozen 114,815·prepared 100,451). STATIC 2023. composed.
- **`[신규]` EU 훈제 밸류체인 가격구조 (FR 2022)** — PTAT L972-979 실측(원물 8.19=21%·출고 25.34=66%·소매 38.54=100%). SYNCED 2022. waterfall.
- **`[신규]` 가공 표준수율 사다리 (어체→필렛 60%)** — PTAT_Organic L286-290 실측(GWT 84%·77%·C-Trim 60%). STATIC. funnel.
- **`[신규]` 부산물 가치화 (어유·어분 전환)** — `Fishmeal and fish oil study_2025 Edition.md`(파일 실재 확인). SYNCED 2024. composed.

### S3 물류·통관
- **`[신규]` 한국 수입 HHI 다변화 지수** — salmon_hhi.json 실측(2023=3336). SYNCED 2026-05. composed. *(주의: w43 갱신과 데이터 공유 — 중복 회피 위해 카드는 장기 시계열, w43은 국가비중 중심으로 역할 분리)*
- **`[신규]` 한-FTA 착지원가 시나리오 매트릭스** — salmon_policy_impact.json. "시나리오/추정" 라벨 필수. SYNCED 2026-05.
- **`[신규]` 칠레 콜드체인 HS형태별 수입구조** — salmon_trade_comtrade.csv(85MB 실재 확인). STATIC. area.
- **`[신규]` 아시아 수입단가 벤치마크** — salmon_asia_benchmark.json 실측(한국 8.35 vs 일본 7.47·베트남 7.38). SYNCED 2023-12. bar.
- **`[신규]` 호르무즈·홍해 물류 쇼크 타임라인** — MH 4 2026 L67 실측. STATIC 2026-04. 질적 타임라인+Brent%.

### S4 판매·수요
- **`[신규]` 노르웨이 vs 칠레 교차 수요탄력성** — KMI 2026Q1+2025Q4(둘 다 실재). SYNCED 2026-05. composed.
- **`[신규]` EU 연어 대체재 가격 바스켓 (vs 대구·해덕·새이드)** — EFM2025 L1560 Figure 49(Salmon/Cod/Haddock/Saithe 동일 차트 실재). SYNCED 2026-04. line.

### S5 ESG
- **`[신규]` 자연산 상업적 멸종 — 양식 의존도 99.97%** — 어획 CSV 772.43 + 양식 CSV 2,704,464. SYNCED 2026-03. *(주의: w18_extinction과 동일 주제 — 둘 중 하나로 통합 권고)*
- **`[신규]` 지속가능 사료 전환 (FIFO·대체원료)** — salmonInsightFeedBio.json 실측(FIFO 1.05→0.77·alt 10→35%, 현재 미렌더 자산). SYNCED 2026-05. composed.
- **`[신규]` 원산지별 ESG 리스크 스코어** — salmon_esg_tracker.json. SYNCED 2026-05. radar.

---

## 주의 · 갭

1. **2024 컬럼 검증 정정 (중요):** FAO CSV는 헤더에 `[2024]` + status 플래그 열이 교차하는 구조로, 단순 `$NF` awk는 오프셋 오류를 일으킴. 재정렬 검증 결과 **2024 데이터는 정상 populated**(노르웨이 1,552,887 / 칠레 702,768 / Totals 2,704,464 / 어획 772.43). 제안서 수치는 정확하나, 위젯 라벨에 "FAO FishStatJ 2024"로 표기하되 일부 소국(아이슬란드·UK)의 2024 셀은 빈 행이 존재하므로 위젯 구현 시 셀별 재확인 필요.

2. **w18_extinction 중복:** S1(w18 refresh)과 S5(신규 "양식 의존도 99.97%")가 동일 데이터·동일 주제. **둘 중 하나로 통합**하고 다른 핀에서는 제외. 권고: 데이터 출처(S1 원료수급)에 본체, S5에는 링크/요약만.

3. **HHI 중복:** S3 신규 "HHI 다변화 지수"와 S4 w43 갱신이 salmon_hhi.json을 공유. 역할 분리(S3=장기 시계열, S4=국가비중+최신) 또는 단일화 필요.

4. **w02_aqua_value 핀 오배치:** ESG(S5)에 있으나 본질은 가치·판매 위젯 → S4로 이동 권고(제안서대로).

5. **EFM2025 파일 중복:** `EFM2025_EN.md`와 `[4 시장 무역 컨설팅] THE EU FISH MARKET 2025.md`는 **동일 내용(각 ~414KB)**. 위젯 출처 표기는 하나로 통일(권고: `EFM2025_EN.md`).

6. **KMI 對FTA vs 對세계 혼동 주의:** KMI 2026Q1에 두 수치 병존 — 對FTA(14,105톤/+19.0%, L430)와 對세계(14.4천톤/+19.6%, L1180). 위젯별로 어느 범위인지 명시해야 정합. Sales 신규 #5는 對FTA, w43/w09는 對세계 기준.

7. **KMI 분기자료 경로:** 물류 pillar가 "agri_data/salmon 내 KMI 없음"이라 한 것은 사실 — 실제 위치는 `/Users/idong-geon/agri_data/13_공통(General)/한국기관/kmi_fta_quarterly/md/`. Sales pillar가 올바른 경로 인용. 로컬 1차 검증 가능하므로 telemetry SYNCED + "KMI 원본 로컬 보관" 표기 가능(Logistics pillar의 "로컬 미보관" 단서는 정정 대상).

8. **신선도 강등 대상:** Camanchaca Annual Report 2023(<2023-05 경계선) → 보조출처로 강등, FAO 실측을 주출처로(w39). 모든 신규/갱신 위젯의 1차출처는 ≥2023-05 충족(최신 KMI 2026Q1·MH 2026·EFM2025·FAO 2026-03 접속).

9. **미검증 잔여 셀:** 아이슬란드 2024 양식 49,253톤(카탈로그 주장)은 본 검증서에서 미확정 — 구현 전 CSV 아이슬란드 행 2024 셀 직접 확인 필요.