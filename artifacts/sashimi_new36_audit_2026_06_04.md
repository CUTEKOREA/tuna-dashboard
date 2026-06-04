# 신규 sashimi 36 위젯 4-Axis 포렌식 Audit 종합 보고서

- **대상**: tuna-dashboard `sashimi-strategy` 모듈 신규 위젯 36개 (`Sas*` 시리즈)
- **작성일**: 2026-06-04
- **방법론**: 4-Axis 포렌식 audit (a1 출처·a2 신선도·a3 검증성·a4 통합) → 적대적 반증(adversarial-reviewer) 재채점 → 교차벤더(Codex/GPT-5.5 + Grok/xAI) 대조
- **분리 규율**: writer(본 보고서) ≠ reviewer(감사·반증). 본 문서는 신규 검증을 수행하지 않고, 검증 통과 발견만 합성한다.
- **구조화 데이터**: 점수·항목 결정치는 `sashimi_new36_4axis_scores.csv`에 별도 저장. 본 산문은 분류·우선순위만.

> **핵심 요약**: 36위젯 전부 telemetry STATIC을 정직하게 표기 → **L-09 P0(LIVE 참칭) 0건**. 조정후 등급은 A 0 / B 9 / C 13 / D 7. 평균은 감사 78.0 → 조정후 **71.7**로 하락(적대적 반증이 출처 과대귀속·차트-텍스트 모순·stale 데이터를 추가 적발). 자동 배포 게이트(A=85)를 통과한 위젯은 없으며, **F 2건(SasUsMarginWaterfall·SasPrAuctionDirect)**과 **출처 명의도용 1건(SasKrByproduct)**이 최우선 정정 대상.

---

## 1. 등급 분포 (조정후)

| 등급 | 위젯 수 | 비율 |
|------|--------|------|
| A (≥85) | 0 | 0% |
| B (75~84.9) | 9 | 25% |
| C (65~74.9) | 13 | 36% |
| D (55~64.9) | 7 | 19% |
| F (<55) | 2 | 6% |
| C+ / B+ 등 경계 | (위 분포 내 포함) | — |
| **합계** | **36** | 100% |

- 감사 평균(auditAvg): **78.0** → 조정 평균(adjustedAvg): **71.7** (-6.3)
- **P0(치명·즉시) 총 0건** — 전 위젯 STATIC 정직 표기, fetch/LIVE 참칭 없음
- 자동 배포 A-gate(≥85) 통과: **0/36** → 현 상태 전량 배포 보류 권고

> 주: C+/B+는 reviewer가 부여한 경계 등급으로, CSV의 `grade` 컬럼에 원 표기 유지. 분포 표에서는 정수 등급 구간으로 집계.

---

## 2. 위젯별 4축 점수표 (조정후 기준 정렬 — 낮은 순)

| 위젯 | 축구분 a1/a2/a3/a4 (조정) | 감사avg→조정avg | 등급 | P1 | P2 |
|------|--------------------------|-----------------|------|----|----|
| SasUsMarginWaterfall | 44/60/38/64 | 64 → **51.5** | **F** | 5 | 3 |
| SasPrAuctionDirect | 74/58/72/88 | 73 → **59.75** | **F** | 4 | 3 |
| SasKrSuperTuna | 74/28/62/85 | 60.25 → 62.25 | D | 0 | 3 |
| SasGlConsumptionMatrix | 60/52/52/87 | 71.5 → 62.75 | D | 5 | 3 |
| SasEuProcessingHub | 60/50/58/84 | 73.5 → 63 | D | 3 | 2 |
| SasThaiSourcing | 58/60/54/84 | 73 → 64 | D | 3 | 3 |
| SasPrGradeBySpecies | 53/80/44/80 | 69.5 → 64.25 | C | 2 | 2 |
| SasUsCompetitorMap | 66/50/70/74 | 70.75 → 65 | D | 3 | 3 |
| SasKrByproduct | 58/80/42/82 | 77 → 65.5 | C | 4 | 3 |
| SasEuClosedCycle | 64/54/63/85 | 71 → 66.5 | C | 3 | 3 |
| SasEuRetailInflation | 58/82/52/82 | 80 → 68.5 | D | 4 | 2 |
| SasExColdLogistics | 68/74/52/80 | 79.25 → 68.5 | C | 3 | 2 |
| SasGlTradeFlows | 78/55/60/84 | 79 → 69 | C+ | 4 | 2 |
| SasKrDualRoute | 66/70/58/82 | 73 → 69 | D | 3 | 3 |
| SasKrFleetEconomics | 74/54/70/80 | 81 → 69.5 | C | 3 | 2 |
| SasJpDistribution | 72/58/70/84 | 80.5 → 71 | C | 3 | 3 |
| SasUsDemandSeasonality | 72/70/66/78 | 81.5 → 71.5 | C | 3 | 4 |
| SasGlChinaDemand | 66/58/70/85 | 67.5 → 71.75 | C | 2 | 1 |
| SasEuTariffRegime | 78/65/72/74 | 79 → 72.25 | C | 2 | 3 |
| SasEuDistantFleet | 78/70/68/80 | 87.5 → 74 | B | 3 | 3 |
| SasUkChannelSplit | 70/80/68/78 | 81.5 → 74.5 | C+ | 3 | 2 |
| SasKrAccessQuota | 80/70/62/88 | 83 → 75 | C | 4 | 3 |
| SasJpAquaculture | 74/90/58/80 | 84.25 → 75.5 | C | 3 | 3 |
| SasEuBrandMap | 73/71/79/82 | 78.5 → 75.5 | B | 2 | 3 |
| SasEuMscGate | 78/77/74/74 | 82.5 → 75.75 | C | 3 | 3 |
| SasPrGradeSystem | 74/72/74/85 | 69.5 → 76.25 | C | 1 | 3 |
| SasJpImportYen | 71/85/63/87 | 77.25 → 76.5 | B | 3 | 3 |
| SasUsImportBarriers | 80/70/74/88 | 85.75 → 78 | B | 2 | 3 |
| SasUkSupplierTariff | 78/86/70/80 | 81 → 79 | B | 3 | 3 |
| SasClimateMigration(SasOlClimateMigration) | 90/68/86/73 | 83 → 79 | B | 2 | 4 |
| SasUsTariffLadder | 86/78/76/80 | 86.5 → 80 | B | 3 | 3 |
| SasGlWcpoSupply | 80/88/68/93 | 89.25 → 80.5 | B+ | 4 | 4 |
| SasThaiEsgRisk | 82/78/83/80 | 85.75 → 80.75 | B | 2 | 3 |
| SasExEmergingMena | 79/88/72/88 | 84.25 → 81.75 | B | 3 | 4 |
| SasEuCatchGate | 90/78/85/88 | 85.25 → 82.5 | B+ | 2 | 2 |
| SasOlCellBased | 82/85/80/85 | 86.5 → 83 | B+ | 2 | 3 |

> 전체 수치는 `sashimi_new36_4axis_scores.csv` 참조(원본 4축 점수 a1~a4는 조정후 값 기준).

---

## 3. 정정 분류 — P0 / P1 / P2

### P0 (즉시·치명) — **0건**
전 위젯이 telemetry status='STATIC'을 정직 표기. fetch/useState/JSON import 통한 LIVE 참칭(L-09) 없음. 따라서 즉시 차단 대상 P0는 없다. 다만 아래 P1 중 **출처 명의도용·차트-텍스트 정면 모순**은 사용자 노출 사실 오류로, P0 인접 P1로 별도 우선순위(★)를 표시한다.

### P1 (중기·확정 정정) — 위젯별 actionable

#### ★최우선군 (사실 오류·명의도용·차트-텍스트 모순)

- **SasKrByproduct** ★ — 출처 명의도용 2건. (1) Springer ESPR 2023(s11356-023-28610-w) 구성비로 인용했으나 위젯·차트 수치 어느 것도 원문(머리17%·껍질8%·내장5%·뼈4%, 총~36%)과 불일치, '혈액·자숙액'은 원문에 없는 날조 항목. (2) 헤드라인 시장규모 $33.7B→$64.8B를 FMI로 귀속했으나 FMI 실제 보고서는 $5.4B→$7.6B 규모로 한 자릿수. **정정**: 두 헤드라인 수치의 출처를 실제 원천으로 재대조하거나 수치 제거. 동원 창원 200톤/일(실재·검증)은 source 필드에 추가.
- **SasPrAuctionDirect** ★ — 핵심 주장 'PLOS One 2019 = 도요스 경매 냉동 블루핀 글로벌 가격선도자'가 원문(pone.0221147)에 의해 REFUTED. 원문은 냉동 BFT 대다수가 경매 미경유·직판이며 price leadership 실증검정 없음, 연구시장은 Tsukiji/Adachi/Ota(2003-2016)지 Toyosu 아님. 교차벤더(Codex) 독립 REFUTED 합의. 추가로 'PNA 입어료 $500M'은 2016이 아니라 2018 수치(2016≈$450M). **정정**: 가격선도 단정을 'fresh BFT 일반 서술·frozen은 간접영향'으로 톤다운, $500M→2018로 연도 정정.
- **SasEuDistantFleet** ★ — 차트가 구(2021) MSY=349K선 위에 어획 410,332K를 그려 '과잉어획' 시각 단정하나, 위젯이 직접 인용한 2024 IOTC SC27(ES04)은 MSY 421K로 상향·green(not-overfished) 판정. 차트가 자기 서사를 정면 훼손. 교차검증 재현(`/tmp/iotc_yft.txt`). **정정**: 차트 MSY 참조선을 2024 SC27 기준(421K)으로 갱신하거나 평가사이클을 차트에 명시.
- **SasGlWcpoSupply** ★ — 황다랑어 700천t(23%)가 SPC 2024/WCPFC 실측(741,473mt/24%)과 불일치. 가다랑어 2,046 고정 후 황다랑어를 깎고 날개·기타를 163으로 부풀려 합 3,059에 맞춘 역산 추정치. actionPlan ②의 '사시미급 28%'도 1차 기준 29%와 어긋남. Codex/gpt-5.5 독립 REFUTED. **정정**: 황다랑어를 741천t로 정정, 파생 28%→29% 동기화.
- **SasEuMscGate** ★ — 차트 최종 막대 2024=40%인데 cardDesc·SIT·source가 모두 49%를 최종치로 단언 → 차트에 49% 데이터포인트 부재(시각-텍스트 정면 모순). 49%는 MSC UK Tuna Shopper Report 2026(2026-02 측정) 기준 2021→2026 비교치. 중간값 2023=30%·2024=40%는 인용 출처 미확인. **정정**: 차트에 49%(2026) 막대 추가 또는 텍스트를 40%로 통일, 연도 라벨 정정.
- **SasJpAquaculture** ★ — 차트 FULLCYCLE 2022=8%가 어떤 1차 출처에도 없음(닛케이 공개분은 2020/2023/2024만, 수산청 환산 시 2021=8.57%·2022≈5.6%). Codex 교차검증 일치. 추가로 '쿼터 +50%(2025 적용)가 2020→2024 하락을 야기'는 원인이 결과보다 미래인 시점 모순. **정정**: 2022=8%를 2021 라벨로 정정 또는 제거, 인과 서술을 '배경 지목·인과 미확정'으로 톤다운.

#### 출처 과대귀속·오귀속군

- **SasUsMarginWaterfall** — cardDesc/source 영문 고유명사 잔존(Tridge·Selina Wamucii·KitchenCost, L-01 위반); 출처-단계 오인(Tridge=farmgate·Selina=CIF인데 '도매'로 표기); 주석 $11.28 vs 렌더 price:12 불일치; Selina 실제 밴드 $7.19~60.56인데 하단만 자의절단·$8 단일보간; 외식 배율 1.7~2.2배 재현 불가. Codex farmgate $2.5·CIF $8 UNVERIFIABLE.
- **SasExColdLogistics** — 항공 비용 프리미엄 '3~5배'·차트 4.5x가 인용 출처 CEVA('+50%')와 정면 모순. 위젯의 '자체 정정 주석'이 출처를 날조 수치로 덮어씀. Codex/GPT-5.5 독립 확인. **정정**: 4.5x→CEVA 원문(+50%) 또는 4.5x를 지지하는 1차 출처 제시.
- **SasThaiSourcing** — 원료 의존도 50.5%를 IOM 노동보고서에 단독 오귀속(실제 원출처 Krungsri/Yamada-Spire/USDA FAS 2021 산업분석). 2021 기준값을 현재형 제시 + syncDate '2024-25'로 포장. **정정**: 출처를 산업분석으로 교정, 기준연도(2021) 명시.
- **SasEuProcessingHub** — €1.1B·62,000명의 1차 출처는 INTERATUN+FAO인데 SeafoodSource(2012)·WeAreAquaculture·ANFACO 2차로 귀속. 14년 고정 수치를 syncDate '2024'로 라벨. KPI 실제 렌더값은 헤지 없는 '€1.1B' 단정.
- **SasEuClosedCycle** — 21,503톤을 'ICCAT 야생쿼터'로 오귀속(실제 EU 배분쿼터, ICCAT TAC는 40,570t). Next Tuna €70M(조건부 2단계)을 2024 착수와 합쳐 ~10배 과대(실제 2024 개시는 ~€7M 파일럿). Nortuna 1만톤 미검증. Codex/gpt-5.5 합의.
- **SasGlTradeFlows** — 집계치($118.6억·+20%·+1.3%)가 FAO Globefish 2024 1~9월 누계인데 '2024 연간'으로 제시(연간 확정치는 +28%·+3.32%). $53.8억·54.8%는 파생계산치이며 1차 출처는 Comtrade 아닌 GTT 기반 FAO 집계.
- **SasGlConsumptionMatrix** — 포케 $61억은 Global Poke Foods 시장($6.27B)을 미국 외식으로 스코프 오귀속(미국 전용 ~$2.0B); 미국 스시 $279억은 Statista 2022(실제 2024=$32.7B); 참다랑어 72%는 WWF 2012 추정(14년 괴리); 중국 일식당 4만개는 2017; EU 일식당 1.2만개 UNVERIFIABLE.
- **SasKrAccessQuota** — SIT '선망 ~97% 가다랑어'가 WCPFC 실측(75~87%)과 13~22%p 충돌(틀린 수치); 단가 $8,000은 2015 적용 11년 명목상수인데 현행처럼 노출; 현물 $12~14K·highliner 1만+mt/척은 PNA 출처 미추적.
- **SasKrFleetEconomics** — 해기사 '50세+ 78.9%'는 인용 출처 미추적·1차치 81%와 모순; 외국인선원 '원양 45.7%'는 전 업종 집계를 원양으로 스코프 과대; 차트 '30년 이상' 막대(112)가 제목(138/64.4%)과 모순(실제 30~40년).
- **SasGlChinaDemand** — 일식당 '약 8만개'는 early-2020s 피크치로 2025년 ~63,500개(-19.4%) 급감 미반영(stale); 일식당 출처를 '추적불가'로 부실 표기했으나 실제 추적 가능(washoku-agent 10,600→80,000).

#### 출처-주장 불일치·claim-source 미스매치군

- **SasUkChannelSplit** — SIT '참치 2023년 이래 연어 추월 최다소비'는 인용 MSC UK Tuna Shopper Report 2023이 정면 부정(원문: tuna is second only to salmon); PB '4사(Iceland 포함)'가 MSC PDF 6사 목록과 불일치(Iceland 미수록); Wasabi 세후이익 급감 수치 귀속 누락.
- **SasEuTariffRegime** — '수산 98.7% 철폐'는 전 품목 집계치를 수산 섹터로 오표기; 영문 약어 33회(EVFTA·Pacific EPA·MFN·ATQ·TRQ) TermTooltip 미병기.
- **SasUkSupplierTariff** — value(31%)/volume(33%) share 혼동(에콰도르 share에 $168M·범례 102K톤 병치, 기준 미명시); 정밀도 내부 모순($168M÷31%=$541.9M>명시 $539M); 출처 표기 IndexBox로만(원천 HMRC 재가공).
- **SasUsTariffLadder** — 'White House EO 2025-15010' 식별자 오기(2025-15010은 FR 문서번호, 실제 EO 14326); 15/19/20%를 'HS 0302/0303/0304 참치 관세율'로 단정하나 1차 출처는 국가별 일반율(EU MFN inclusive 메커니즘 미반영); 11/25 농산물 예외(FR 2025-21203) 미반영.
- **SasUsCompetitorMap** — cardDesc/situation/헤더주석이 출처를 '공개 1차 출처 교차검증'으로 오칭(실제 100% 2차 매체); FCF $1.7B 기준시점 2020인데 연도 무표기·감사관 '2022 추정' 오라벨.
- **SasUsDemandSeasonality** — IFIC baseline 내부모순(카드 67% vs takeaway 59%, 둘 다 렌더; 정본 59%(2022)→67%(2023)→71%(2024)); FMI '54%' 1차 미확인; NFI 2.2lb/년은 2019값(현재 2.0lb).
- **SasUsImportBarriers** — '수산물 FDA 수입거부 1위·20%+'가 무앵커 이중노출(실제 USDA ERS 2005-2013, stale); 메틸수은 1.0ppm 'action level'을 '즉시 부적합'으로 과장.
- **SasExEmergingMena** — KMI 유령귀속(21/19/11%는 VASEP 단일출처); 렌더 4카드 vs source 5지표 불일치; 해수부 $589M 데이터핸들 부재.
- **SasOlClimateMigration** — 차트 23% vs 본문 23.3% 불일치(정본 Frontiers 2022 +23.3%/673,129t); +23.3% 출처 귀속이 주석(Bell)과 source(Frontiers) 사이 비일관.
- **SasOlCellBased** — 식물성 시장수치 전체가 GVR 단일·유료 의존; 인디애나 '2년 한시' 금지를 '판매금지 7개주' 영구 어감으로 혼입.
- **SasJpDistribution** — '9가공장'이 도요레이조 공식 사업소(공장 2곳)와 정면 모순(Codex REFUTED); '점유 1위'가 공식 '톱클래스'보다 강한 단정.
- **SasJpImportYen** — '지중해 양식 BFT 약 4만톤'을 총량처럼 제시(실제 총량 ~5만t·4만t은 蓄養분); 거시수치 1차는 수산청 백서인데 Nippon.com만 귀속; USD/JPY 161.6 출처기관 무명.
- **SasThaiEsgRisk** — 'SeafoodSource' 구체 식별자 없이 매체명만; value '4년 연속' 기준연도 미명시(TIP 2026 발행 시 갱신 누락 위험).
- **SasEuBrandMap** — source가 검증수치('~70%')와 미특정 '업계 자료'(보고서명·연도 부재) 혼합; MSC Italy Tuna Market의 Rio Mare 선도 결합 느슨.
- **SasEuCatchGate** — syncDate '2026' 연도만(IUU Watch 출처 2025-04 명확하므로 정밀화 필요); 출처에 1차 EU 문서번호/URL/페이지 부재(추적성 1단계 부족, 핵심수치는 외부 1차 확인).
- **SasEuRetailInflation** — 스페인 PB 80% 출처 오귀속(Gaictech 원문은 '전체 캔수산물', 캔참치 단독 아님; 유럽 캔참치 PB는 28-29%); Gaictech는 기계 제조사가 Solunion 재인용한 2차; €62.8bn 연도(2024) 미특정.
- **SasKrDualRoute** — 헤드라인 $150.1M·14.8%·3위는 무료 1차 Comtrade에서 재현되나 유료 2차 IndexBox만 인용(A-01 정신 위반); 對美19%·MFN20%p 무근거 단정.
- **SasPrGradeBySpecies** — 오토로 지방 '최대 30%' 무출처(외부 27-28%); 저자·DOI·논문제목 0개(야케 클레임은 PubMed 26868578 실재하나 미연결).
- **SasPrGradeSystem** — source에 URL·구체문헌·게시일 부재(핵심수치는 원문 축자 일치하므로 과대인용은 아님, 추적성 보강 권장).

### P2 (선택·표준 정합성)

전 위젯 공통 P2 패턴(반복):

- **syncDate 비표준**: '2025-26'·'2024-25'·'2026'·'2024' 등 ISO 비준수. 단일 ISO 날짜 또는 명시 기준연도로 교체(L-09/A-02/W-04).
- **pillar 비표준 코드**: S1~S5는 sashimi-strategy 로컬 코드로 Universal 5-Pillar(1.원료/2.가공/3.물류/4.판매/5.ESG) 번호와 직접 매핑 표기 부재(W-04 #6).
- **W-02 단위 괄호**: '$1.7B'·'%'·'톤' 등 인라인 접미사를 ($)·(개)·(%) 괄호 라벨로 미준수.
- **L-01 약어/영문 잔존**: VMS·MFN·EPA·ATQ·MEA·OIC·CEPA·KMI·VASEP·Mordor·niche·Toyosu·Ahi·capex 등 첫 노출 시 한글 풀네임/TermTooltip 병기 부재(다수 위젯).
- **이모지**: SasUsDemandSeasonality 🔥🎄 — S-Grade 톤 정합성 위해 제거 권장.
- **dangling 주석**: SasGlConsumptionMatrix line9 '정정: 중국 가다랑어 $1,418/t' 렌더 미대응 → 제거.

---

## 4. 교차벤더 판정표 (Codex/GPT-5.5 + Grok/xAI)

> Grok(xAI)은 다수 호출에서 cli-chat-proxy.grok.com HTTP 503(Cloudflare/nginx upstream) 또는 빈응답으로 unavailable. 일부는 재시도로 회수. 합의가 단일 모델(Codex)에 근거한 항목은 신뢰도 '중간'으로 표시.

| # | 위젯 | 주장 | Codex | Grok | Consensus(권고 조치) |
|---|------|------|-------|------|----------------------|
| 1 | SasUsCompetitorMap | FCF 연매출 ~$1.7B | 정당/EDIT | 정당/KEEP | **정당·EDIT** — $1.7B 실재(2020.1 Undercurrent/법원자료), 2021~ 최신치 부재. 표시 stat에 '(2020 추정)' 연도태그 부착 |
| 2 | SasUsCompetitorMap | True World Foods 연매출(미검증 배제분) | false alarm/EDIT | unavailable | **false alarm·EDIT**(Codex 단독) — SeafoodSource 2020 '5억$ 초과' 실재. '미검증 배제' 대신 출처·기준연도 명기로 포함 |
| 3 | SasUsCompetitorMap | 동원/StarKist 미국 점유율 47.5%(2022) | 불명/EDIT | unavailable | **불명·EDIT**(Codex 단독) — 47.5% 1차 미입증, 동원 공식 ~46%. 산정베이스(금액/물량) 명시 또는 동원 IR 46% 병기 |
| 4 | SasUsCompetitorMap | TWF 23 물류센터·8,200 레스토랑 | 정당/EDIT | 정당/EDIT | **만장일치 정당·EDIT** — 수치 검증됨. 단 23센터=미+캐+런던+마드리드 합산(미국 단독 22). '미국 23곳'→'글로벌 23곳'으로 수정 |
| 5 | SasUsDemandSeasonality | FMI 2025 '섭취 증가 54%' | 불명/DELETE | unavailable | **불명·DELETE 보류**(Codex 단독) — 54% 1차 미확인. 유료본 확인 또는 공개 FMI 지표로 교체/제거 |
| 6 | SasUsDemandSeasonality | IFIC 71%를 '2025'로 표기 | 정당/EDIT | unavailable | **정당·EDIT**(Codex 단독) — 정본 59%(2022)→67%(2023)→71%(2024), 2025 실측은 70%. '2025'→'2024' 정정 |
| 7 | SasUsDemandSeasonality | NFI 캔참치 2.2lb/년 | 정당/EDIT | false alarm/EDIT | **만장일치 EDIT** — 2.2lb는 2019값. 최신(2023 기준·2026.3 발표) 2.0lb·3위. '2.0lb/년(2023, NFI)'로 갱신 |
| 8 | SasUsDemandSeasonality | 월별 계절인덱스(7월100·2월70·1.4배) | 불명/EDIT | unavailable | **불명·EDIT**(Codex 단독) — 무출처 정성추정에 정수정밀, 2월저점이 사순절 캔수요와 충돌. 추정 라벨링·정수정밀 제거 |
| 9 | SasUsImportBarriers | 수산물 FDA 수입거부 1위·20%+ | 정당/EDIT | unavailable | **정당·EDIT**(Codex 단독) — USDA ERS 2005-2013 기준 20.5%·1위(stale). 연도+출처 명시, 단정형 완화 |
| 10 | SasUsImportBarriers | 히스타민 50→35ppm·위해 200ppm | 정당/EDIT | unavailable | **정당·EDIT**(Codex 단독) — 수치 VALID(FDA 2024 CPG/FR 2024-25315). '위해 상한'→'위해 조치기준(action level)' 표현 수정 |
| 11 | SasUsImportBarriers | SIMP 체인오브커스터디 보존 24개월 | 정당/KEEP | 정당/KEEP | **만장일치 정당·KEEP** — 50 CFR §300.324(e)·NOAA SIMP Guide 2년=24개월 일치. 정정 불필요 |
| 12 | SasUsImportBarriers | 메틸수은 1.0ppm 초과 즉시 부적합 | 정당/EDIT | unavailable | **정당·EDIT**(Codex 단독) — 1.0ppm VALID(action level), '즉시 부적합'은 과장. 'adulterated 간주 대상'으로 완화 |

**교차벤더 종합**: false alarm 확정 1건(#2, TWF 연매출 — 무조건 배제 과도). KEEP(정정 불필요) 2건(#4 수치/#11 SIMP). 나머지 9건은 EDIT/DELETE 권고로 위 P1과 일치. Grok 가용은 4/12(#1·#4·#7·#11), 그중 #1만 KEEP·나머지 EDIT/일치. **xAI 인프라 503 장애로 2모델 합의 미성립 항목이 8건** → Grok 복구 후 재대조 권장.

---

## 5. 결론·다음 단계

### 결론
- **P0 0건**: 36위젯 전부 STATIC 정직 표기로 LIVE 참칭(L-09) 없음. 데이터 형태-라벨 정합성은 양호.
- **품질 저하 본질은 a1(출처)·a3(검증성)**: 적대적 반증이 출처 과대귀속·오귀속(IOM·INTERATUN·CEVA·FMI·Springer 명의도용 포함), 차트-텍스트 정면 모순, stale 데이터 라벨 위장을 추가 적발 → 평균 -6.3.
- **자동 A-gate 통과 0/36**: 현 상태 전량 배포 보류.

### 정정 우선순위
1. **즉시 정정(★ P1 — 사실 오류·명의도용·차트모순 7건)**: SasKrByproduct(명의도용), SasPrAuctionDirect(가격선도 REFUTED), SasUsMarginWaterfall(F·다중결함), SasEuDistantFleet·SasGlWcpoSupply·SasJpAquaculture·SasEuMscGate(차트-출처 모순). 이들은 C레벨 인용 위험이 커 P0 인접.
2. **중기 정정(출처 오귀속·claim-source 미스매치)**: §3 P1 잔여 위젯 — 출처 재대조·기준연도 명기·스코프 정정.
3. **선택 정정(P2)**: syncDate ISO화, pillar 표준 매핑, W-02 단위괄호, L-01 약어 병기 — 일괄 배치 처리.

### 다음 단계
- **Grok 재대조**: xAI 503 복구 후 단일모델(Codex) 의존 8개 교차벤더 항목 재검증.
- **재채점 트리거**: ★최우선 7건 정정 후 4-Axis 재채점 → A-gate(≥85) 재평가.
- **false alarm 반영**: #2(TWF 연매출)는 '미검증 배제'를 출처 명기 포함으로 전환(보고서 외 위젯 코드 정정 대상).
- 본 보고서·CSV는 산출물 디렉토리에만 기록. 위젯 코드 수정·git 커밋은 사용자 명시 요청 시에만.
