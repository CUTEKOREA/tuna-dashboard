Final verifications:
- OEC Korea import: 2020 = $447.9M, 2021 = $512.0M, 2022 = $600.9M (S4 cites 4.48/5.12/6.01 hundred-million — exact match), 2023 = $495.3M, 2024 = $475.4M. **Important correction**: the file extends to 2024, so S4's "한국 위치, 2022" widget is unnecessarily stale — it can use 2024. Also S4's claim "two consecutive years of double-digit growth" only holds through 2022; 2023-2024 actually declined.
- OEC export GCC: this is an *export* file (countries as exporters). For the halal widget, the proposal wants GCC as *import markets* — that data lives in the import file (askor pattern = importer). The export file shows UAE/Saudi as re-exporters, not Korea's target import demand. The S4 halal proposal conflated export/import direction; the correct file for "Middle East import market size" is oec_shrimp_1030613_import.csv (filter GCC importers), not the export file cited. I'll flag this.

I now have enough verification to produce the merged plan.

# 새우 대시보드 5-Pillar 위젯 최종 실행계획 (종합·검증판)

**1) 한 줄 요약**: 5개 기둥 합산 refresh 30건 + 신규 20건을 검증한 결과, refresh 22건·신규 16건을 채택(P0 13 / P1 16 / P2 9), 나머지는 데이터 오독·출처방향 오류·중복으로 강등/제외. 핵심 검증 자산 5종 모두 실재 확인 — `shrimp_fta_quarterly.json`(KMI 2026Q1, T-0, 최고권위), `shrimp_dashboard.json`(FAO 2024 top10), `shrimp_capture_vs_aqua.json`(FAO 2024), `9. 새우 가공 생산량 1976-2023.csv`(FAO 가공 T-1), 인텔리전스 MD 4종(EUMOFA EFM2025·Fishmeal 2025·Seafood Watch Vietnam 2026-01·GSSI 2025) 및 MPEDA SHAPHARI PDF·AP5I CSV·OEC CSV 모두 원문 1차 검증 통과.

---

## P0 (즉시·고가치)

**[w_raw1_production_trend]** 글로벌 새우 생산량 추이 — 근거 `shrimp_dashboard.json`(production_total.timeline, latest 2024=19,129,390톤, 검증완료). 변경: 정적 JSON인데 src에 'FAO API 연동' 표기 → 허위 LIVE 제거하고 SYNCED(syncDate 2026-05-04)로 정정, 2015~2024 실측 시계열 교체. 기대효과: L-09 위반 해소 + 총량 추세 직접 가시화. **Pillar: S1 원료수급**

**[w03_processing]** 고부가가치 가공 패러다임 — 근거 `9. 새우 가공 생산량 1976-2023.csv`(FAO T-1, 컬럼구조 검증). 변경: SIT 서사가 실측과 정면 모순(부가가치 비중 2010년 24.3%→2023년 10.1% 하락, NEI 단순냉동 67.7%→85.3% 상승). '고도화 지배' 서사를 '저가 벌크화 역행'으로 정정, 'FAO API 연동' 제거→정적 CSV 표기. 기대효과: 사실 오류 정정 + L-09 해소. **Pillar: S2 가공·생산**

**[w_proc1_type_production]** 가공형태별 글로벌 생산량 — 근거 동일 CSV. 변경: 2022 부분합(3,965,027톤)을 2023 전체(4,282,269톤, NEI냉동 85.3%)로 갱신, 제목 (2023), 'API 연동' 제거. 기대효과: 1년 신선화 + 전체분류 정합. **Pillar: S2**

**[w_proc2_kr_import_type]** 한국 수입 가공형태별 구성 — 근거 `shrimp_fta_quarterly.json`(formMix2026Q1: 냉동 73.7%/조미가공 23.5%/건조 2.4%/기타 0.4%, 검증완료). 변경: 2022 stale→2026Q1 실측, KMI 출처. 기대효과: T-0 최신화. **Pillar: S2**

**[w_shrimp_concentration_risk]** 소싱 편중도 HHI — 근거 `7. 새우 무역량(수출입) 1976-2023.csv`(파일 실재 확인). 변경: 스코프 오류(글로벌 HHI 2,180을 한국 편중으로 오표기) → 한국 수입 partner 실측 HHI=3,379로 교체, 베트남 55.5% 단일집중 반영, 허위 LIVE→SYNCED. 기대효과: 데이터 스코프 정정 + 리스크 정직화. **Pillar: S3 물류·통관**

**[w_log2_kr_sourcing]** 한국 수입 소싱국 변화 — 근거 `shrimp_fta_quarterly.json`(originShift2025/2026Q1, 검증완료: 베트남 가치 44.4%→40.0%, 중국 21.2%→25.5% 물량 +36.6%, 페루 +63.7%). 변경: '베트남 의존→중국·페루 대체' 내러티브 + 차트 2026Q1 연장, LIVE 강제렌더 정직 SYNCED화. **Pillar: S3**

**[w12_unit_price]** 단위당 프리미엄 트렌드 — 근거 `shrimp_fta_quarterly.json`(unitPrice 2026 1~3월 베트남 8.5/중국 7.3/페루 7.4 USD/kg, 검증완료). 변경: 허위 'KAMIS API LIVE'·'IMF Benchmark' 삭제, FAO 글로벌평균 vs 한국 실수입단가 이중축. 기대효과: L-09 해소 + 한국시장 실측. **Pillar: S4 판매·수요**

**[w_shrimp_forced_labor_map]** 강제노동 리스크 히트맵 — 근거 `Warmwater shrimp social risk profile — Vietnam ... - Seafood Watch.md`(2026-01, 원문 검증: 중간상인 70%·소규모농가 65%/상업 35%·TIP 2024 Tier 2(2022 Tier 3에서 상향)). 변경: 자의적 점수→Seafood Watch SSRT v2 실측, 백엔드 하드코딩 fallback의 LIVE 렌더 STATIC 강등. 기대효과: L-09 정면 위반 해소. **주의: 원문은 "새우 양식·가공 직접 강제노동 증거 없음" 명시 — 위젯도 '추적불가 리스크' 톤으로 정직 표기 필수.** **Pillar: S5 ESG**

**[w_esg1_compliance]** ESG 스코어카드 — 근거 `LIST_OF_FARMS_CERTIFIED_FOR_SHAPHARI_040326.pdf`(MPEDA 정부 명부, 2026-03 실재). 변경: 가짜 'LIVE API 연동: SSP Ecuador' 제거, 인도 인증농장 25곳·부화장 16곳(SPF L.vannamei) 실측 앵커. 기대효과: 허위 LIVE 해소 + 정부 1차출처. **Pillar: S5**

**[신규]** 한국 새우 수입 분기 동향 및 원산지 대체 (2025~2026Q1) — 근거 `shrimp_fta_quarterly.json`(전 필드 검증). composed 차트, telemetry SYNCED(2026-05-27). 기대효과: T-0 최신·최고권위 자산의 대표 위젯. **Pillar: S3**

**[신규]** 한국 수입 새우 원산지별 단가 추이 (2023~2026Q1) — 근거 `shrimp_fta_quarterly.json`(unitPrice 검증). composed, SYNCED. 기대효과: 듀얼소싱 단가차(중국 -14%) 의사결정. **Pillar: S4**

**[신규]** 인도 SHAPHARI 무항생제 인증 공급망 지도 — 근거 `LIST_OF_FARMS_CERTIFIED_FOR_SHAPHARI_040326.pdf`(검증). bar, STATIC(2026-03). 기대효과: SIMP/CSDDD 대응 소싱 게이트. **Pillar: S5** (S1·S5 양측 제안 중복 → S5로 병합, S1은 동일 PDF로 '인도 산지 공급기반' 각도 별도 유지 가능)

**[신규]** 베트남 공급망 이력추적 단절 리스크 — 근거 Seafood Watch Vietnam MD(검증). bar, STATIC(2026-01-07). 기대효과: 강제노동 맵과 짝, 재가공 원산지 리스크 분리. **Pillar: S5**

---

## P1

**[w04_top10_aqua]** 양식 Top10 — 근거 `shrimp_dashboard.json`(aquaculture.top10 2024: 중국 3,219,603/인도 1,304,882/베트남 1,289,118, 검증완료). 2022→2024 갱신. **Pillar: S1**

**[w05_top10_catch]** 어획 Top10 — 근거 dashboard.json(capture.top10 2024: 중국 577,844/아르헨티나 222,163/인도네시아 217,578, 검증). 'FAO API 연동' 삭제. **Pillar: S1**

**[w01_paradigm_shift]** 양식 vs 어획 패러다임 — 근거 `shrimp_capture_vs_aqua.json`(1980 760,529/74,169 → 2024 1,589,438/9,501,242, 양식 85.7%, 검증). stale값 교체 + 과장수식어('폭발적·완벽히 압도') 제거(P-03). **Pillar: S1**

**[w_log3_kr_import_value]** 한국 수입금액 추이 — 근거 `shrimp_fta_quarterly.json`(yearly 2024=635.9/2025=761.1 백만$, 검증). KCS fetch 실동작 시에만 LIVE, fallback이면 SYNCED 정직표기. **Pillar: S3**

**[w61_hhi_timeseries]** 소싱 집중도 시계열 — 근거 `7. 새우 무역량 CSV`. 2023 실측 HHI 앵커, reliability None 제거. **Pillar: S3**(w_shrimp_concentration_risk와 데이터 공유 — 시계열 vs 스냅샷으로 역할분리)

**[w56_trade_diversion_flow]** 무역전환 효과 — 근거 `shrimp_fta_quarterly.json`. **NotebookLM 출처 제거 필수**(규칙2 위반), KMI 실측 대체. **Pillar: S3**

**[w43_feed_inflation]** 사료 인플레 — 근거 `Fishmeal and fish oil study_2025 Edition.md`(어유 +117%/어분 +3% 인플레조정, 원문 검증). 허위 'World Bank API LIVE' 제거, 동인을 어유로 정정, 미검증 '40% 도산' 삭제. **Pillar: S4**(S5 w59와 동일 보고서 — 중복 주의)

**[w06_top10_revenue]** 양식 매출 Top7 — 근거 `4. 새우 생산액(양식) 1950-2024.csv`(실재). 'FAO API LIVE' 삭제만, SYNCED화. **Pillar: S4**

**[w_shrimp_substitute_elasticity]** 대체탄력성 — 근거 `shrimp_fta_quarterly.json`(domesticProduction 17.5→16.7kt 검증). 환각 KMI 2022-11 근거 폐기, 실측 재구성, 과장표현('살포/융단폭격') 톤다운. **Pillar: S4**

**[w58_vn_labor_audit]** 베트남 노동감사 — 근거 Seafood Watch Vietnam MD(검증). 미검증치(성과급97·ESG감사28) 제거, 검증분만, 과장 TAK 톤다운. **Pillar: S5**

**[w_shrimp_cert_tracker]** 인증 획득률 — 근거 `Annual Report 2025 - Global Sustainable Seafood Initiative.md`(7스킴·MOCA 5·64파트너 검증). 국가 커버리지%는 '추정' 라벨. **Pillar: S5**

**[w59_feed_substitute_economics]** 대체사료 경제성 — 근거 Fishmeal 2025 MD. 어분 실가격 인용·페이지 명시, 과장 톤다운. **Pillar: S5**

**[신규]** 역행하는 가공 고도화 (2010-2023) — 근거 `9. 가공 CSV`. **Pillar: S2**

**[신규]** 글로벌 가공 패권: 에콰도르 점유 (2023) — 근거 dashboard.json processed.top10(에콰도르 1,280,852 검증) + 9.CSV. **Pillar: S2**

**[신규]** EU 새우 수입 단가·인플레 수요위축 — 근거 EFM2025_EN.md(6.06 EUR/kg·에콰도르 5.14·인도 6.99·베트남 7.94·per-capita 1.59 LWE 전부 원문 검증). **Pillar: S4**

**[신규]** GSSI 인정 인증 스킴 거버넌스 — 근거 GSSI 2025 MD(검증). **Pillar: S5**

---

## P2

**[w55_india_species_shift]** 인도 종자전환 — 근거 `3. 새우 생산량(양식) 1950-2024.csv`(실재). FAO 종별 필터로 Rabobank 서베이 강등. (종별 SPECIES_ALPHA_3 필터 가능여부 컬럼 사전확인 필요) **Pillar: S1**

**[w63_coldwater_shrimp_stock]** 한류새우 자원 — 근거 `shrimp_capture.csv`(실재). FAO Area 21·27 한류종 필터로 어획 대리지표, NAFO 정성유지. **Pillar: S1**

**[w_raw2_unit_price]** 양식국 톤당 원가 — 근거 dashboard.json(aquaculture_value 2024 검증). 추정 원가→생산액÷물량 산출단가. 산출식 투명표기. **Pillar: S1**

**[w19_hyperspectral / w_shrimp_rte_format / w42_format_shift]** — 근거 `8. 새우 무역액 CSV`·EFM2025. 허위 LIVE(Comtrade/EUMOFA API) 삭제·STATIC 강등, 과장수식 제거. (3건 모두 라벨정직성 위주 → 묶음 처리) **Pillar: S2**

**[w_shrimp_antibiotic_tracker]** 잔류 항생제 — 근거 `Revised_SHAPHARI_farm_guidelines.pdf`(실재). 허위 LIVE→STATIC, MFDS 검출률은 연도·건수 인용가능시만. **Pillar: S5**

**[신규]** 부산물 가공 실측 (2023) — 근거 9.CSV. **Pillar: S2**

**[신규]** ADB 무역원활화 지수 (2023) — 근거 ADB Trade Facilitation Report 2024 MD(실재). **Pillar: S3**

**[신규]** EU 수입구조·다변화 / 미국 CVD 타임라인(인니) — 근거 EFM2025 MD / `ap5i_filtered.csv`(5단계 이벤트 2023-11~2024-10 전부 검증, 단 관세율 미포함). **Pillar: S3**

**[신규]** 야생 어획 정체 vs 양식 전환 — 근거 capture_vs_aqua.json. S1 w01과 데이터 중복 → ESG 각도로만 차별화 시 채택, 아니면 w01에 흡수. **Pillar: S5**

---

## 주의·갭 (agri_data로 못 채우거나 정정 필요)

1. **[제외/강등] S1 신규 '글로벌 양식 부가가치 메가트렌드(USD)'** — 근거 `shrimp_global_megatrend.json` **데이터 오독**. 제안 SIT는 "2021년 8,289백만달러→2024년 9,564백만달러"라 했으나, 파일 실측값(2021=8,294,503 / 2024=9,564,695)은 **USD가 아니라 생산 톤수 합계**(capture+aquaculture와 연도키·값 일치). USD 가치 위젯으로 쓰면 환각. → 단위를 '톤'으로 정정해 생산메가트렌드로만 사용하거나 제외. 가치(USD)는 dashboard.json의 aquaculture_value(중국 30.82B$ 등)로 별도 구성.

2. **[정정] S4 신규 '글로벌 수입시장 점유(한국 위치, 2022)'** — `oec_shrimp_1030613_import.csv`는 **2024까지 존재**(한국 2024=$475.4M). '2022' 고정은 불필요한 stale. 또 제안 SIT "2년 연속 두자릿수 증가"는 2022까지만 참 — 실제 2023=$495.3M(-17.6%)·2024=$475.4M로 **하락 반전**. 서사 정정 필수.

3. **[출처방향 오류] S4 w_shrimp_halal_export** — 제안은 GCC '수입시장 규모'를 `oec_shrimp_1030613_export.csv`로 산출하려 하나, 이 파일은 **수출국 기준**(UAE/사우디는 재수출국으로 등장). 중동 수입수요는 import 파일에서 GCC importer 필터로 잡아야 함. 파일 방향 교정 후 채택. (KMI 2019-14 환각 근거 폐기 판단은 타당)

4. **[현재가 인용금지] PinkSheet_Shrimp.csv** — 2024M08~2026M03 전 구간이 "1079" 플레이스홀더로 손상 확인. 현재가·최근시세 위젯에 절대 인용 불가(S4 경고 타당). 유효구간은 2023M10 이전뿐.

5. **[신선도 경계] FAO 가공 CSV는 2023(T-2)** — 가공 위젯군의 최신 한계. 한국 가공기반은 KMI domesticProduction(T-0)로 보완 가능하나 글로벌 가공 2024치는 부재.

6. **[관세율 부재] AP5I CVD 타임라인** — 이벤트 시계열만 있고 실제 관세율(%) 미포함(헤드라인 색인). 위젯은 '조사 단계 타임라인'으로 한정, 관세율 수치 임의생성 금지.

7. **[중복 병합 정리]** ① SHAPHARI PDF는 S1·S5 양측에서 신규 제안 → S5 공급망지도로 병합(S1은 '산지 공급기반' 각도만 보조). ② Fishmeal 2025 MD는 S1 w_raw2/신규·S4 w43·S5 w59에서 4중 인용 → 사료원가 위젯 1개로 통합 권장. ③ capture_vs_aqua.json은 S1 w01·S5 신규 중복 → 기둥별 각도(공급구조 vs 지속가능성 압력) 차별화 안 되면 단일화.

8. **[FCR·종별 필터 사전검증]** w55(종별 SPECIES_ALPHA_3)·w59(대체사료 FCR)는 CSV 컬럼·KFAS 논문 실재여부 미확인분 포함 → 구현 전 컬럼 존재 확인, 없으면 '추정' 라벨 또는 제외.

9. **[KMI는 1차출처 인정, 단 LIVE 아님]** 전 KMI 기반 위젯은 PDF 추출 스냅샷이므로 일괄 SYNCED(syncDate 2026-05-27), 분기 자동갱신 코드 없음 — LIVE 금지.

검증 파일 경로(전수 실재 확인): `/Users/idong-geon/agri_data/01_수산물(Seafood)/shrimp/processed_data/{shrimp_fta_quarterly.json, shrimp_dashboard.json, shrimp_capture_vs_aqua.json, shrimp_global_megatrend.json}` · `/raw_data/{3·4·5·7·8·9번 CSV, shrimp_capture.csv, oec_shrimp_1030613_export.csv, oec_shrimp_1030613_import.csv, PinkSheet_Shrimp.csv}` · `/intelligence_reports/{EFM2025_EN.md, Fishmeal and fish oil study_2025 Edition.md, Warmwater shrimp social risk profile — Vietnam ... - Seafood Watch.md, Annual Report 2025 - Global Sustainable Seafood Initiative.md, Asia-Pacific Trade Facilitation Report 2024....md}` · `/india_shrimp_associations/mpeda/2026/{LIST_OF_FARMS_CERTIFIED_FOR_SHAPHARI_040326.pdf, LIST_OF_HATCHERIES_APPROVED_050326.pdf, Revised_SHAPHARI_farm_guidelines.pdf}` · `/indonesia_shrimp/AP5I/ap5i_filtered.csv`. 환각 파일 없음.