# HANDOFF — 현재 작업 상태

> 🌊 **2026-05-27 — KMI FTA 분기별 인사이트 8 commodity 라이브 배포** [CC]:
> - **출처**: KMI 「FTA체결국 수산물 수입동향」 2021 Q1 ~ 2026 Q1 (21개 분기 PDF 교차분석)
> - **신규 위젯 20개** (이번 세션 4 commodity):
>   - Galchi 5개: 수입국 5년 대전환·오만 +154%·에콰도르 경유무역·드레스 갈치 대체·산지별 단가 ([components/GalchiDashboard.tsx](components/GalchiDashboard.tsx) 인라인 newWidgets)
>   - Squid 5개: 페루 +1,458% 메가회복·자급률 26.8% 보상·단가-물량 디커플링·국가별 분기 단가·조미·자숙 비중 ([components/SquidDashboard.tsx](components/SquidDashboard.tsx))
>   - Pollock 5개: 러시아 92→78%·가공 형태 시프트·2022→23 -47.3% 채찍·미국 +48.1%·러시아 vs 미국 단가 ([public/data/pollock_real_data_v4.json](public/data/pollock_real_data_v4.json))
>   - Salmon 5개: 공급망 대전환·러시아 -84.8% 절벽·신선 피레트 신등장·칠레 +32.3%·액-물량 디커플링 ([public/data/salmon_real_data_v4.json](public/data/salmon_real_data_v4.json))
> - **데이터 확장 2건**: Squid `w2_korea_supply` 2024-25 추가, Pollock `w4_korea_crisis`·`w7_usa_russia_unitprice` 실측 교체
> - **직전 세션 미커밋분 동반 배포**: MackerelFTAQuarterly·JukkumiFTAQuarterly·ShrimpFTAQuarterly·WhelkFTAQuarterly 4개 컴포넌트 + Dashboard import 연결
> - **L-03 통과** ✓ (4.2s, 117 정적 페이지), **W-04 체크리스트** 전 위젯 통과 (cardDesc·TelemetryBadge SYNCED 2026-04·SIT/TAK·source·X축 한글 ≤7자·단위 괄호)
> - **PDF→TXT 변환물 캐시**: `~/agri_data/공통(General)/kmi_fta_quarterly/md/` (21개 .txt, 향후 commodity 분석에 재활용 가능)
>
> 🇯🇵 **2026-05-27 — Kawamoto 2026 일본 사시미 수요 절벽 6 위젯 신규 탭** [CC]:
> - **신규 컴포넌트**: `components/TunaJapan2050Insights.tsx` (6 위젯 export)
>   - ① InsightJapanDemandCliff — 2022→2050 수요 절벽 (Pillar 4, ComposedChart)
>   - ② InsightPerCapitaGamma — 1인당 감마 모델 (Pillar 4, LineChart + ReferenceLine)
>   - ③ InsightSegmentDecline — 사시미/가츠오부시/캔 차등 감소 (Pillar 4, MultiLine)
>   - ④ InsightSupplyStructure2022 — 어법×수입 분해 (Pillar 1, Vertical BarChart)
>   - ⑤ InsightPriceTier — 3-Tier JPY/kg 매트릭스 (Pillar 4, Vertical BarChart)
>   - ⑥ InsightCohortDoubleShock — 1인당×인구 곱셈 충격 (Pillar 5, ComposedChart)
> - **TunaInsightsDashboard.tsx 통합**: 7번째 탭 `japan2050` (보라색 테마, CalendarClock 아이콘)
> - **데이터 출처**: Kawamoto T (2026) Fisheries Science, DOI 10.1007/s12562-026-01984-9 (CC-BY 4.0 Open Access). 모든 수치 LWE 환산. 핵심 전망: 2050 총 사시미 수요 112천 톤(-69%), 1인당 0.775kg(-86%), 일본 인구 104.7M(-16%).
> - **자료 아카이브**: `docs/2026_tuna_industry_sources.md` (2026년 발행 14건 인덱스). PDF 원본은 `docs/sources/2026_tuna/`에 다운로드 후 .gitignore (L-08).
> - **L-03 빌드 통과** ✓ (4.1s, 117 정적 페이지 OK)
> - **W-04 체크리스트**: cardDesc·TelemetryBadge·SIT/TAK·Pillar 매핑·X축 7자·단위 괄호·source 인용 모두 통과
>
> 📝 **2026-05-27 — SIT/TAK 톤 강화 메가 세션 (89 위젯, 6 commits push)** [CC]:
> - **사용자 의도 확립**: SIT = 신입사원도 이해할 수 있게 자세하게(전문용어 풀네임 정의 + 본질 1문장 + 굵은 숫자 묶음 + 메타 통찰), TAK = C레벨 임원이 놀랄 엣지(재정의 통념 뒤집기 + 3단계 액션 + 패러다임 전환). ReactNode `<div><p>` 형식, WidgetCard.TakeawayProps `string|ReactNode` 확장 활용
> - **완료 commodity 5개 (89 위젯)**:
>   - 752d75f L-01 영문 잔존 6건 (TunaChart Import/Export Volume, SalmonLiveTicker Fed Rate)
>   - a9699ce **Mangosteen 14위젯** — ENSO·TRQ·1-MCP·FOPL·VHT·RCEP·MAP·잔토닌 등 도메인 풀네임 정의
>   - b7841ea **Garlic 17위젯** — WSC·KAMIS·HORECA·TRQ·SCFI·FRA·NDF·Post-harvest Loss·EV/EBITDA Multiple·Contraction Quadrant·CPE·EPR·K-ETS·Value Migration·CV 등
>   - 7dacad8 **Cocoa 20위젯** — CSSVD·COCOBOD·Stocks-to-Grindings·Butter/Powder Ratio·Backwardation/Contango·EUDR·CBE/CBS·Fine or Flavor·Shrinkflation·Origin Grinding·WTP·Cosmeceutical·JIC·Rolling Hedge 등
>   - 012e824 **Carrot 28위젯** — VKFTA·TCU·PLS·IQF·MA·Bass Diffusion·CDD·LTV·Smile Curve·QoE·FAOSTAT SCL·Expeller·Scope 3·KAMIS Wholesale Cycle·OEC HHI 등
>   - 3345919 **Cashew 4 inline 위젯** + WidgetSpec type 확장 — RCN·Origin Grinding·SCFI·CNSL·SAF 등
> - **환경 정리**: main 13 ahead push 완료 (이전 SIT/TAK 177 위젯), 머지된 omo/* 12 브랜치 정리
> - **Skip 결정**: UsedCar 8 / PetFood 17 / Whelk 27 / Shrimp 57 — 이미 직전 Phase D 톤(영문 동격·PE 전문 용어·TermTooltip)이 강하게 적용된 상태로 사용자 결정에 따라 보류
> - **잔여 미작업 (외부 데이터 파일 패턴)**: Beef·Pork (`beefData.ts`/`porkData.ts` import), Cassava·Galchi·Jukkumi (`w.sit`/`w.strat` 외부 데이터) — 데이터 파일 구조 분석부터 별도 세션에서 진행 권장
> - **누적**: 89 위젯 SIT/TAK 신입사원 친화 + C레벨 엣지 톤으로 재작성, 모두 main push 완료, L-03 빌드 통과 6/6
>
> 🚑 **2026-05-24 — A8 codemod 회귀 핫픽스: 패턴 URL → Okabe-Ito 솔리드 색상 (107 파일)**:
> - **원인**: `<pattern fill="currentColor">`는 부모 SVG element의 CSS color 의존. Recharts `<Bar>`는 임의 props(`color`)를 SVG로 forward하지 않아 currentColor가 미설정 → 다크 테마에서 차트가 투명/검정으로 렌더링되는 회귀 발생 (커밋 ba1a882 부작용, Carrot S1 등 노출).
> - **수정**: `scripts/revert_a11y_bar_fills.py` 신설 (`fill="url(#a11y-X)" color={Y}` → `fill={Y}` 일괄 변환) + `getA11yBarProps()` 반환을 솔리드 Okabe-Ito 색상으로 단순화 (Cell-loop 호환).
> - **보존**: `<ChartPatternDefs />`, ChartPatterns import — 휴면 코드로 유지 (향후 v2에서 색별 명명 패턴으로 재활용).
> - **결과**: 모든 Bar = 원본 brand color 또는 A11Y_PALETTE 솔리드 회귀. 색맹 친화성(Okabe-Ito 검증)은 유지, WCAG 1.4.1은 텍스트 라벨/툴팁/legend 다중 표현으로 보완.
> - L-03 빌드 통과 ✓ (4.4s)
>
> ♿ **2026-05-24 — A8 색맹 대비 codemod **전체 commodity 18 종 完적용** (누계 96 파일, ~250+ Bar)**:
> - **스크립트 개선** (`scripts/fix_a11y_charts.py`): BarChart\b 단어 경계 (BarChart2/3 Lucide 아이콘 오탐 차단) + 멀티라인 opening tag 지원 + self-closing 자동 skip
> - **Low 8 commodity** 일괄 적용:
>   - Tuna 30+ widget files (Dashboard·Insights·Operational·Trade·Ranching 등)
>   - Mangosteen / Cashew / Cassava / Garlic / Carrot / Jukkumi (단일-Bar 위젯 포함)
>   - Whelk / 잔여 Mackerel·Pollock·Salmon 위젯 / Market·PetFood·UsedCar·Fleet 보조 dashboard
> - **누계** (3 phase 통합): 18 commodity + 보조 dashboard = 96 component 파일
> - **WCAG 2.1 SC 1.4.1** (Use of Color) **전사 준수 완료**
> - L-03 빌드 통과 ✓ (4.0s, 117 정적 페이지 OK)
>
> ♿ **2026-05-24 — A8 색맹 대비 codemod Mid 4종 추가 확산 (40 파일, ~150 Bar)**:
> - **신설 스크립트** `scripts/fix_a11y_charts.py` (L-07 패턴): import 자동 추가 + `<ChartPatternDefs />` 자동 삽입 + Bar fill→pattern URL 변환 (per-chart 인덱스 로테이션, Cell-loop 자동 skip)
> - **Squid**: Dashboard 렌더러 + 18 widget files (Tab1-5 + 13 individual widgets)
> - **Shrimp**: Dashboard 렌더러 + 6 widget files (Tab1-4, Tab45, InsightWidgets)
> - **Pollock**: Dashboard 렌더러 + 14 widget files
> - **Cocoa**: CocoaDashboard (23 inline Bars 일괄)
> - **누계** (High + Mid): 60 파일, ~190 Bar 차트 패턴 부착
> - L-03 빌드 통과 ✓ (4.0s)
>
> ♿ **2026-05-24 — A8 색맹 대비 codemod High 4종 확산 완료 (20 파일, ~40 차트)**:
> - **Foundation**: `components/ChartPatterns.tsx` (Okabe-Ito 8-color + 5종 SVG pattern + `getA11yBarProps`)
> - **시범 3 위젯**: Beef W2/W3 + Pork W7 (커밋 2dbd66d)
> - **High 4종 확산** (커밋 65c1f8c, 17 파일):
>   - Chicken: Dashboard 렌더러 (Bar+Composed), ThaiInsightsA/B (Cell-loop + 2-Bar), EmpiricalInsights (인건비 + 계란 stacked)
>   - Galchi: Dashboard 렌더러 (Bar+Composed)
>   - Mackerel: Dashboard 렌더러, FeedRatio (식용/사료 stacked), ProcessedWidgets (Chile/Peru/기타 3-stack), SafetyPremium (Cell-based 국가구분)
>   - Salmon: Dashboard 4 렌더러 경로, InsightFeedBio (marine/alt/fifo), InsightWidgets (vertical+horizontal), InsightTradeDown/SmartColdChain/Processing/MarginSqueeze/LogisticsResilience (2-Bar 비교)
> - **정책**: 단일-Bar 위젯은 제외 (다중 시리즈 비교에서만 WCAG 1.4.1 의미 있음)
> - **WCAG 2.1 SC 1.4.1** (Use of Color) 준수 — 색상 + 패턴 이중 표현
> - L-03 빌드 통과 ✓
> - **잔여 작업 (Mid/Low 우선순위)**: Squid/Shrimp/Pollock/Cocoa (Mid, ~40 Bar) + 나머지 8 commodity (Low, ~50 Bar) — 가이드 `docs/plans/a8_accessibility_codemod.md`
>
> 🔬 **2026-05-24 — 17 commodity 247 위젯 8-Axis Forensic Audit 全완료**:
> - **축산 3종** (33 위젯): A14·B17·**C2** archive (Chicken risk-radar + eudr-esg)
> - **농산 6종** (79 위젯): A24·B55·C1
> - **수산 8종** (135 위젯): A51·B84·C0 (Tuna closure 제외)
> - **누계**: 247 위젯, A 89 (36%) · B 156 (63%) · C 3 (1.2%) — 평균 B+
> - **🏆 최고**: **Galchi (A- 86.3, A 73%, LIVE 14 endpoint)** — 다른 commodity 확산 골드 스탠다드
> - **Best 위젯 1위**: Mackerel "한·일 어획 -53%" 90.0점 (통계청+NPFC+국립수산과학원 3중 1차 자료)
> - 산출물: artifacts/forensic_audit/2026-05-24/{17 dashboards}/_summary.md + _livestock/_agri/_seafood_summary.md
>
> 🔬 **2026-05-24 — 축산 3종 8-Axis Forensic Audit 완료 (역순 검증 시작)**:
> - **기획서**: `docs/plans/livestock_3_widget_verification.md` (8-Axis schema 신설 4 추가: Visual·Domain·Mobile·Accessibility)
> - **결과 33 위젯**: A합격 14 (42%) · B조건부 17 (52%) · **C archive 2 (6%)**
> - **Chicken** (B 76.4) — risk-radar + eudr-esg **archive** (`_archive/api/chicken/`), 정성 추정·OIE 미연동 사유
> - **Beef** (A- 85.5) ⭐ — LIVE schema fine-tune: KOSIS tblId 정정, KAMIS 등급 분리, KCS HSK 10자리 매핑 (L-04)
> - **Pork** (A- 84.1) ⭐ — 정적 11 위젯, FAOSTAT 매핑 우수, W2/W3/W9/W10 시계열 갱신 필요
> - 산출물: `artifacts/forensic_audit/2026-05-24/{Chicken,Beef,Pork}Dashboard/_summary.md` + `_livestock_summary.md`
> - L-03 빌드 통과 ✓
>
> 🥩 **2026-05-24 — 축산 3종 5-Pillar 네비게이터 일괄 도입 (Pork/Beef/Chicken) — 18 commodity 全완료**:
> - **Pork**: PILLARS.map → activePart filter (pink #f43f5e → emerald #10b981)
> - **Beef**: PILLARS.map → activePart filter (red→rose→amber, 룰북 D-04 등재)
> - **Chicken**: PILLARS.map → activePart filter (amber→orange→red, 룰북 D-04 등재)
> - 모두 동일 패턴 (PILLARS.filter + 동일 네비게이터 UI)
> - L-03 빌드 통과 ✓
> - **누적 18 commodity 전체 네비게이터 적용 완료** (수산 8 + 농산 6 + 축산 3 + Tuna 원형)
>
> 🌾 **2026-05-24 — 농산물 6종 5-Pillar 네비게이터 일괄 도입 (Cashew/Cassava/Garlic/Carrot/Cocoa/Mangosteen)**:
> - **Cashew**: SECTIONS.map → activePart filter (nut amber #f59e0b → #78350f)
> - **Cassava**: SECTIONS.map → activePart filter (yellow CASSAVA_THEME 보존)
> - **Garlic**: 인라인 Section 1-5 → conditional wrap × 5 (yellow/amber #eab308 → #854d0e)
> - **Carrot**: 인라인 Section 1-5 → conditional wrap × 5 (orange #ea580c → #c2410c)
> - **Cocoa**: 인라인 Part 1-5 → conditional wrap × 5 (brown #92400e → #78350f)
> - **Mangosteen**: 인라인 Pillar 1-5 → conditional wrap × 5 (purple→fuchsia→pink #7e22ce → #f43f5e)
> - 모두 L-03 빌드 통과 ✓
>
> 🐠 **2026-05-24 — SalmonDashboard 5-Pillar 네비게이터 도입 (renderSection 함수형 패턴)**:
> - SALMON_SECTIONS 메타 추가 (5 pillar + pillarKey 매핑: raw/proc/logis/sales/esg)
> - activePart state ('S1' 기본) + 네비게이터 UI
> - renderSection 함수 호출을 `{activePart === 'SN' && renderSection(...)}` 형태로 조건부 변경
> - **Extra Module 자연 통합**: Module C(forecast/착지원가)는 S1 활성 시, Module E(policy/정책)는 S5 활성 시 같이 표시
> - 룰북 D-04에 연어 등재: pink-rose (#fb7185 → #be123c, 살색 컨셉)
> - 같이 등재: 명태(cyan-600→sky-500), 골뱅이(amber→brown), 주꾸미(오징어와 두족류 공통)
> - L-03 빌드 통과 ✓
>
> 🐚 **2026-05-24 — WhelkDashboard 5-Pillar 네비게이터 도입 (인라인 JSX 패턴)**:
> - SECTIONS 메타 추가 (5 pillar, amber/orange 그라디언트 — 골뱅이 껍데기 컨셉)
> - **인라인 JSX 패턴 처리**: SECTIONS array 추출 불가능 (위젯이 직접 JSX 작성) → 각 Pillar 헤더+위젯 그룹을 `{activePart === 'SN' && (<>...</>)}` 형태로 conditional wrap
> - 5개 boundary 수정: P1→P2, P2→P3, P3→P4, P4→P5, P5 종료
> - **KFAS 학술 인텔리전스 섹션** (kfasWidgets dynamic)은 모든 pillar 공통 표시 유지
> - 그라디언트: S1 #fbbf24 → S5 #92400e (amber → brown)
> - L-03 빌드 통과 ✓
>
> 🦐 **2026-05-24 — ShrimpDashboard 5-Pillar 네비게이터 도입**:
> - SECTIONS 메타 신규 작성 (inline 5 section → 단일 정의)
> - 75+ 위젯 5-Pillar 매핑 (각 pillar별 widgets 배열)
> - activePart state + 네비게이터 UI + 단일 활성 section
> - 그라디언트: emerald → teal (룰북 D-04 새우 등재 활용)
> - **Uncategorized fallback 처리**: S4 활성 시에만 "기타 분석" sub-section 자동 표시 (미매핑 위젯 손실 방지)
> - 위젯 카운트 뱃지 추가
> - L-03 빌드 통과 ✓
>
> ❄️ **2026-05-24 — PollockDashboard 5-Pillar 네비게이터 도입**:
> - PILLARS 메타에 num/label 추가 (id=P1~P5, customInject 보존)
> - activePart state ('P1' 기본) + 네비게이터 UI + 단일 활성 section 렌더
> - 시그니처 그라디언트: 한류 cyan→indigo 보존 (P1 #0891b2 → P5 #0ea5e9)
> - customInject 외부 컴포넌트 (PollockConcentrationIndex/AlternativeSourcing/FtaTariffMatrix 등 10개) 그대로 작동
> - 위젯 카운트 뱃지 추가 (filter + customInject 합산)
> - L-03 빌드 통과 ✓
>
> 🐙 **2026-05-24 — JukkumiDashboard 5-Pillar 네비게이터 도입 + 사이드바 아이콘 정규화**:
> - JukkumiDashboard: SECTIONS+PILLAR_WIDGET_IDS+activePart+네비 UI (Squid 패턴 복제)
> - 시그니처 그라디언트: purple → pink (오징어와 두족류 일관)
> - 사이드바 메뉴 아이콘 정규화:
>   - 주꾸미: `ScanSearch size=28 strokeWidth=2.2 margin=-3` (가는 돋보기) → `Octagon size=18` (8각형, 다른 메뉴와 시각 통일)
>   - 다른 어종 아이콘(Snowflake/Shrimp/Shell/Waves)과 솔리드 균형 회복
> - L-03 빌드 통과 ✓
>
> 🦑 **2026-05-24 — SquidDashboard 5-Pillar 네비게이터 도입 (Mackerel/Galchi 패턴 확산)**:
> - SECTIONS 메타에 num/label 추가 (id/color는 이미 있음)
> - PILLAR_WIDGET_IDS 추출 (80 위젯 5-Pillar 분류 보존)
> - activePart state + 네비게이터 UI + 단일 활성 section 렌더
> - 시그니처 그라디언트: purple → pink (룰북 D-04 기존 등재 활용)
>   - S1 #8b5cf6 / S2 #a855f7 / S3 #d946ef / S4 #ec4899 / S5 #f43f5e
> - 위젯 카운트 뱃지 추가 (예: "20 위젯")
> - L-03 빌드 통과 ✓
>
> 🐟 **2026-05-24 — GalchiDashboard 5-Pillar 네비게이터 도입 (Mackerel 패턴 확산)**:
> - 동일 패턴 이식: SECTIONS 메타에 `id/num/label/color/iconComp` 필드 추가, `activePart` state, 네비게이터 UI
> - 시그니처 그라디언트: emerald → teal (룰북 D-04 기존 등재 활용)
>   - S1 `#10b981` (emerald-500) / S2 `#14b8a6` (teal-500) / S3 `#0d9488` (teal-600) / S4 `#5eead4` (teal-300) / S5 `#99f6e4` (teal-200)
> - 이미 SECTIONS+pillar 구조 존재 → 평면 스크롤만 활성 단일 section으로 교체 (코드 ~25줄 수정)
> - L-03 빌드 통과 ✓
>
> 🐟 **2026-05-24 — MackerelDashboard 5-Pillar 네비게이터 도입**:
> - **Tuna 패턴 이식**: `밸류체인 네비게이터` UI + `activePart` state + 5단 클릭 필터링
> - **SECTIONS 메타** 추가 (S1~S5, num/label/title/desc/color/icon)
> - **PILLAR_WIDGET_IDS** 매핑 (기존 5 Part 위젯 id 그대로 재사용)
> - **Phase 4 통합**: dangling 외부 위젯 6개 import (KoreaSupply/NorwayAlt/ClimatePredictor → S1, Aquaculture → S2, AfricanExportROI → S3, SafetyPremium → S5)
> - **시그니처 그라디언트 정식 등재**: 룰북 D-04에 `cyan-700 → sky-500` 추가 (Tuna `cyan→blue`와 명도 분리)
> - **기획서**: `docs/plans/mackerel_pillar_navigator.md`
> - **빌드**: L-03 통과 ✓
>
> 🐂 **2026-05-24 — BeefDashboard 신규 commodity 추가**:
> - **위젯 11개** (Pork 동일 구조, 5-Pillar 매핑) — S1 원료(W1,W2) · S2 가공(W3,W4) · S3 물류(W5,W6) · S4 판매(W7,W8,W9) · S5 ESG(W10,W11)
> - **시그니처 그라디언트**: `red → rose → amber` (#dc2626 → #e11d48 → #f59e0b, 한우 마블링 컨셉)
> - **아이콘**: Lucide `Beef`, 사이드바 위치: Chicken → Pork → **Beef**
> - **데이터 출처**: FAOSTAT QCL Item 867 + USDA NASS Slaughter + MLA Industry Stats + UN Comtrade HS 0201/0202 + KCS TM + KOSIS/KREI + KAMIS + WOAH WAHIS + FAO LEAP + USDA AMS + Nielsen
> - **KPI 6개**: 글로벌 생산 73,862천톤 / 한국 1인당 14.5kg / 수입 521천톤 (미·호 83.7%) / 한우 vs 호주 1.94배 / 탄소 99.5kg / 자급률 36.9%
> - **L-03 빌드 통과** ✓
> - **다음**: 시각 검증 (`npm run dev` → sidebar "소고기 (Beef)") · LIVE API 연동 후속 (USDA PSD + WOAH WAHIS API)
>
> 🟢 **2026-05-23 — Librarian 일간 audit 전수 가동 완료 (3.5 Flash, Tier 1 paid)**:
> - **전체**: 122 파일 / 546 위반 / $0.329 / **에러 0** / ~32분 (1929s)
> - **clean (위반 0건)**: 20 파일 (16%) — 평균 4.5 위반/파일
> - **상위 5 정정 우선순위**: CocoaDashboard (21) · SquidTab1Widgets (20) · WhelkDashboard (18) · TunaKfasResearch (18) · PollockSupplyMacroWidgets / CarrotDashboard (각 14)
> - **위치**: `artifacts/daily_audit/2026-05-23/summary.md` + 122 JSON
> - **검증된 토폴로지**: Gemini Direct API 유료 Tier 1 / `gemini-3.5-flash` / `max_tools=0` / budget cap $1.0
> - **잔여 무료 크레딧**: $99.67 / $100 (월) — 일간 자동 가동 ~300회 여유
> - **이전 시도**: `2026-05-23_v1_freetier_failed` (Tier 0, 18/122에서 429), `2026-05-22_v2.5flash_backup` (구 모델, 백업)
> - **다음**: 상위 5 파일 L-01 패턴 정정 → launchd 등록 → ADR 0007 갱신
>
> 🔬 **2026-05-23 — Forensic Audit Pilot (Mackerel 5 위젯, Claude Opus 4.7 prototype)**:
> - schema·grade·remediation 검증 완료 (commit `dbc0842`)
> - 평균 86.8 (B+) — w04 한·일 어획 감소 = 96 (모범, 3중 1차 자료), w03 어종 비중 = 69 C (1차 자료 부재)
> - 79 위젯 전수 sprint는 사용자 OpenCode `sisyphus`/`hephaestus` 호출 대기 (Antigravity `/auth` 필요)
> - 계획서: `artifacts/forensic_audit/_plan.md`
>
> 📱 **2026-05-22 — 모바일 PWA 4-Phase 작업 개시 (Sisyphus=Claude Code)**:
> - **Phase 1 완료 (CC, L-03 빌드 통과 ✓)**: `public/manifest.json`, `public/sw.js` (네트워크-first API + cache-first static + navigate fallback), `public/icons/{192,512,maskable-512,apple-touch-180}.png` (tuna 마스코트 기반), `components/PWARegister.tsx` (production-only SW 등록), `app/layout.tsx` 메타 확장 (viewport.themeColor `#0f172a`, manifest, appleWebApp standalone, icons).
> - **Phase 2 완료 (CC Plan B — Hephaestus 역할 겸임, L-03 빌드 통과 ✓)**: `scripts/fix_mobile_grid.py` 신규 (L-07 idempotent codemod), `app/globals.css` 하단 1줄 (`@media (max-width:768px) [data-mobile-stack] { grid-template-columns: 1fr !important }`), 54개 파일 / 141 sites JSX 태그에 `data-mobile-stack` 속성 부착 (`repeat(N,1fr)` N≥2 + `'1fr 1fr ...'` 변형). Tuna 9 파일 26 sites 포함 — attribute-only 변경으로 ADR 0008 closure 동결 본의와 무관. **상세 브리프**: [MOBILE_PWA_PHASE2_BRIEF.md](MOBILE_PWA_PHASE2_BRIEF.md) (작업 후 `_archive/handoffs/`로 이동 예정).
> - **Phase 3 예정 (Librarian)**: ~100+ 위젯 long-context audit → "모바일 ≤375px에서 깨질 가능성 높은 위젯 TOP 20" 리포트 → Hephaestus 후속 수정.
> - **Phase 4 예정 (Oracle)**: 머지 직전 S-Grade 4-Axis 채점.

> 🆕 **2026-05-22 cont. — 그룹 A 마이그레이션 완료 + 잉여 섹션 일괄 제거**:
> - **PorkWidgets 11 위젯** (S1/S2/S3/S4/S5 pillar 매핑) `ec89689`
> - **CashewStrategy 전체** (4 hardcoded section S1/S2/S3/S5 + dynamic widgets.slice loop, renderCashewWidget 헬퍼 추출) `b97c64e`
> - **ADR 0008 신설**: FleetStrategyMatrix·SEAsiaOEM·RetailPOS·StrategyIntel은 dashboard-level pattern으로 ADR-0005 제외 결정. 별도 트랙으로 분리. `5d9f42f`
> - **신입직원 교육 + AI Market Intelligence 챗봇 섹션 일괄 제거** (13 파일, -948 lines): Mackerel `95b630e`, Salmon·Squid·Shrimp·Whelk·Pollock·UsedCar·Cashew·TunaRanchingEducation·ColdStorage 본체 + PetFood·Tuna·TunaRanching·TunaExtract orphan state 정리 `0ede013`. CassavaDashboard는 별개 전략 컨텐츠로 유지.
> - build pass ✓
> - 잔여 즉시 가능 작업: **CashewStrategy L-01 영문 잔존 동반 수정**(Exposure·Margin Spread·Drawdown·Forward·FX Rate·Tail Risk·Value-up 등), 혼합 파일 진짜 잔존 위젯 3건(Mackerel L911·Salmon L659·PetFood L112), Tuna closure 13개(~2026-06-04 중단), 4 dashboard-level (ADR 0008 트랙)


> 💰 **AI 자원 분배 토폴로지** ([ADR 0006](docs/adr/0006-omo-stage0-trial.md) + [ADR 0007](docs/adr/0007-librarian-role.md)):
> - **Claude Max20** ($200/월) → Claude Code 매뉴얼 (사람 1:1, `[CC]`)
> - **Google AI Ultra**:
>   - Antigravity OAuth → OMO Sisyphus(`claude-opus-4-6-thinking`) · Hephaestus(`gemini-3-pro`)
>   - **Direct API ($100/월 무료)** → **Librarian** (`gemini-3.5-flash` / `gemini-3.1-pro-preview`, `max_tools=0`)
> - **OpenAI** ($10) → OMO Oracle (`gpt-4o`, 독립 채점)
>
> Antigravity Claude 락 (6-10/일) 발생 시: ① Antigravity Gemini 3.1 Pro → ② Librarian (락 무관)
> 잔여 Gemini Direct API capacity: 어제 작업 부하 기준 월 ~$2/100 (98% 미사용) — 일간 자동 audit·PDF 변환·뉴스카드에 배분 권장
> 세부 자원 위치 + Librarian 작업 카탈로그: [ADR 0007](docs/adr/0007-librarian-role.md)

> 🚨 **ANTIGRAVITY 공지 (2026-05-21~2026-06-04)**: ADR-0005 (Widget Intake Module) 마이그레이션 진행 중. **Tuna 33개 위젯 closure 동일 파일 작업 1~2주 일시 중단** 요청. 다른 commodity (Mackerel/Squid/Salmon/Pollock 등) 작업은 OK. 자세한 사항은 [docs/adr/0005-widget-intake-module.md](docs/adr/0005-widget-intake-module.md) 참조.

> 어느 에이전트(Claude Code / Antigravity / 그 외)에서 세션을 시작하든 이 파일을 먼저 읽으세요. 직전 세션이 끝낸 지점과 다음 단계가 적혀 있습니다.
>
> **마지막 업데이트**: 2026-05-24 (Claude Code 세션 — BeefDashboard 신규 commodity 11 위젯 추가)

---

## 🟢 2026-05-22 — 누적 PR 머지 현황 (main 브랜치 통합 완료)

OMO 마이그레이션 12개 PR이 모두 main에 머지됨. main HEAD = `0fb686a`.

| PR | Branch | Merge commit | 내용 |
|----|--------|--------------|------|
| #13 | omo/pollock-2a2 | `1b688bb` | Pollock Phase 2A.2 (13 widgets) |
| #14 | omo/salmon | `8684c2f` | Salmon Pilot+Wave1~3 (13 widgets) |
| #15 | omo/squid | `3c9601d` | Squid 80 widgets |
| #16 | omo/chicken | `4c1c7c1` | Chicken 5/12 sub-widgets |
| #17 | omo/singles | `70ab178` | Cassava/Jukkumi/TunaExtract/Mangosteen |
| #18 | omo/singles-codex | `bab4b5b` | Garlic 18 + Cocoa 22 + Whelk 29 + Carrot 30 + Galchi + FalklandSquid 2 + WidgetCard ReactNode 완화 |
| #25 | omo/mackerel | `a6d3d92` | Mackerel Wave 1~4 |
| #27 | omo/petfood | `3272be4` | PetFood 22 widgets |
| #29 | experiment/omo-stage0 | `12ef178` | Tuna Stage 0/1/2 신규 위젯 8개 |
| #31 | omo/small-dashes | `0b23ea9` | Small dashboards 일괄 |
| #33 | omo/remaining-dashes | `2cf95ea` | ColdStorage·Pollock·Chicken·FalklandSquid widget3 등 4 dashboard |
| #35 | omo/final-dashes | `13d2cdc` | Market 2 Forensic insight widgets |

### 추가 main HEAD 작업 (PR 없이 직접 머지)
- `0fb686a` Atuna KPI 라이브 API endpoint 신설 + 한글화
- `9fb3418` Market 4 카드 + 2 Forensic widget + TunaInsights 2 takeaway 갱신
- `09e1584` Shrimp + KoreaConsignment + Logistics → WidgetCard (3 dashboard 일괄)
- `e359142` PetFood 22 widgets → WidgetCard (L-07 일괄 변환)

**WidgetCard 사용 파일**: 161개

---

## 🎯 2026-05-22 — 진짜 잔여 작업 (재식별)

### A. 비-Tuna 미마이그레이션 dashboard (WidgetCard 0 사용 + ds-card 잔존)
다음 파일은 WidgetCard 호출이 0건, ds-card 잔존 → 마이그레이션 필요:
- `components/SEAsiaOEMDashboard.tsx` (5)
- `components/CashewStrategy.tsx` (5)
- `components/RetailPOS.tsx` (6)
- `components/SquidValueChainMargin.tsx` (4)
- `components/SquidFuelBEP.tsx` (4)
- `components/StrategyIntel.tsx` (2)
- `components/FleetStrategyMatrix.tsx` (2)
- `components/PacificEezStrategicWidget.tsx` (3)

### B. Tuna closure (⚠️ 2026-06-04까지 작업 중단)
ANTIGRAVITY 공지 유효 (~2026-06-04). 다음 파일은 **건드리지 말 것**:
- `TunaOperationalIntelWidgets.tsx` (61)
- `TunaRanching.tsx`, `TunaExecutiveInsights.tsx`, `TunaVietnamOemStrategy.tsx`, `TunaAquacultureExpansion.tsx`, `TunaLandingCost.tsx`, `TunaAquaValue.tsx`
- `Insight3Blackhole.tsx`, `Insight4Middlemen.tsx`, `Insight5JumboLeap.tsx`, `Insight6ClimateCombo.tsx`, `Insight7SpreadWinners.tsx`, `Insight9TunaVsSquidCombo.tsx`

### C. 혼합 파일 ds-card 잔존 (부분 마이그레이션 완료, 잔존 분석 필요)
WhelkDashboard·SquidDashboard·MarketDashboard·GalchiDashboard·ShrimpDashboard·MackerelDashboard·PetFoodDashboard·CarrotDashboard·KoreaConsignmentDashboard·MackerelStrategy·SalmonDashboard 등. 대부분 framework wrapper(KPI Row, Section header) 잔존일 가능성 — 위젯별 정밀 분석 후 결정.

### D. 인프라·운영 항목
- **gh CLI 인증 만료** (HTTP 401) → `gh auth login` 필요
- **PAT `ghp_Yzz8C...` 폐기·재발급** → https://github.com/settings/tokens (사용자 직접)

---

## 🆕 2026-05-21 OMO Stage 1 검증 위젯 #1 (Antigravity 세션)

### TunaCatchVolumeTrend.tsx 신규 생성
- **spec**: `artifacts/spec_stage1.md` 위젯 #1 (참치 어획량 추이)
- **pillar**: S1 🐟 원료 수급
- **구현**: ADR-0005 WidgetCard 사용, LineChart (Recharts), SVG linearGradient cyan→blue stroke
- **§X 체크리스트**: 9/9 통과 (cardDesc·TelemetryBadge STATIC·SIT 2문장·TAK 2문장·한글 100%·단위 천 톤·Pillar S1·WidgetCard·빌드)
- **빌드**: 내 파일 에러 0건, tsc --noEmit 통과
- **TermTooltip**: WCPFC·IATTC 약어에 한글 풀네임 해설 부착
- **커밋**: `4389e80` `feat(widget): 참치 어획량 추이 위젯 신규 생성 (Stage 1 검증 #1) [OMO]`

### 다음 단계
- Stage 1 위젯 #2~#5 순차 생성 (spec_stage1.md 참조)
- 대시보드에 Stage 0+1 위젯 삽입 → 화면 렌더링 확인 (Verifier 역할)

---

## 2026-05-21 OMO Stage 0 검증 위젯 (Antigravity 세션)

### TunaOriginPriceTrend.tsx 신규 생성
- **spec**: `artifacts/spec_stage0.md` (사람 작성, 4-Agent 무인 루프 검증용)
- **pillar**: S1 🐟 원료 수급
- **구현**: ADR-0005 WidgetCard 사용, BarChart (Recharts), SVG linearGradient cyan→blue
- **§8 체크리스트**: 9/9 통과 (cardDesc·TelemetryBadge STATIC·SIT 2문장·TAK 2문장·한글 100%·단위 원/kg·Pillar S1·WidgetCard·빌드)
- **빌드**: 내 파일 에러 0건 (기존 49건은 carrot/mangosteen data 누락 — 기존 이슈)
- **TermTooltip**: WCPFC·IATTC 약어에 한글 풀네임 해설 부착

---

## 🆕 2026-05-21 Antigravity Phase 2A.2 — Pollock 100% closure

### Wave 2 (Pollock 중형 2파일 완료)
- `components/PollockProcessingMarginWidgets.tsx` (12개 위젯, 520→456줄) — S2 가공·생산 중심, pillar 배분: S1(2), S2(5), S3(3), S4(1), S5(1)
- `components/PollockSalesValueWidgets.tsx` (10개 위젯, 410→379줄) — S4 판매·수요 전체
- `WidgetCard` default import, `pillar`/`telemetry`/`cardDesc` 완비, `termTooltip` 보존 (원본에 있던 4개 위젯)
- SIT/TAK/source/차트 데이터 원본 1글자 변경 없이 보존
- 미사용 import 제거: `SafeResponsiveContainer`, `TakeawayBox`, `TermTooltip`, `styles`, `CardHeader` 로컬 컴포넌트
- `npm run build` Pollock 에러 0건, `git diff --stat` 각 1개 파일만 변경 확인
- 커밋: `72f6930` (Wave 2 #1), `c474d7e` (Wave 2 #2)

### Wave 1 (Pollock 소형 4파일 완료)
- `components/PollockPolicyRiskRadar.tsx`, `components/PollockSupplyResilience.tsx`, `components/PollockTradeWidgets.tsx`, `components/PollockValueAddWidgets.tsx` 마이그레이션 완료 (ADR-0005 적용).
- `WidgetCard`로 100% 교체, `pillar` 식별 및 할당(S1/S2/S3), `telemetry`, `cardDesc` 등 요구사항 충족.
- 모든 위젯별 데이터, 텍스트(TakeawayBox 포함)는 원본 1글자도 변경 없이 보존.

### Pilot (Pollock)
- `components/PollockPolicyFinanceWidgets.tsx` (3개 위젯) 마이그레이션 완료 (ADR-0005 적용).
- `WidgetCard`로 교체, `pillar="S3"`, `telemetry`, `cardDesc` 등 요구사항 충족. 데이터와 텍스트는 원본 그대로 보존.
- 커밋: `[OMO]` 접미사

## 🆕 2026-05-21 진행 요약 (Claude Code 세션)

---

## 🆕 2026-05-22 — 단일파일 commodity 4종 마이그레이션 완료

### 진척 (omo/singles-codex on omo-codex worktree)
- **Whelk 29/29** (W14/15/16/17/18/23/24/28 완료) — `f99f0e7`·`3ba66b7`
- **Carrot 30/30** (파이썬 스크립트 L-07 일괄 변환, -487 lines) — `b37d306`
- **Galchi renderWidgetCard** (5 pillar 다이나믹 매핑, -41 lines) — `adfc4bb`
- **FalklandSquid 2/3** (table widget3는 ds-card 유지 — 비차트 구조) — `41e2f9c`
- `omo/singles-codex` HEAD = `41e2f9c`
- **PR #18**: 5 commodity 통합 (Garlic 18 + Cocoa 22 + Whelk 29 + Carrot 30 + Galchi + FalklandSquid 2 + WidgetCard ReactNode 완화)

### 다음 단계
1. PR #18 머지 (사용자 검토)
2. table 구조 widget (FalklandSquid widget3) WidgetCard 적용 방안 검토 — customBody slot 활용 가능
3. 남은 dashboard 측정 (Reefer / Mackerel / Pollock 잔여 등)

> 🔬 **OMO 통합 검증 완료** (별도 worktree 2개):
>
> **Tuna 신규 위젯 8개** (`tuna-dashboard-omo/`, 브랜치 `experiment/omo-stage0`) — ADR-0006 ACCEPTED + 누적 갱신:
> - Stage 0 mock 1개 (`TunaOriginPriceTrend` BarChart) — 커밋 `6161965`
> - Stage 1 mock 5개 자율 chaining (Catch·Species·Yield·ColdChain·MarketShare) — `ca99799`→`9ae12af`
> - **Stage 2.1 Live 1개** (`TunaOriginPriceTrendLive` — Atuna 5 항구 USD/MT) — `f526c44`
> - **Stage 2.2 Live 1개** (`TunaCatchBySpeciesLive` — FishStat 3 어종 8년) — `b66df1e`
> - ADR-0006 final state — `560c23a`
> - Preview 페이지: `tuna-dashboard-omo/app/omo-preview/page.tsx` (port 3001)
>
> **Pollock 마이그레이션 9 파일** (`tuna-dashboard-omo-pollock/`, 브랜치 `omo/pollock-2a2`) — Phase 2A.2 진척:
> - Pilot 1 (`PollockPolicyFinanceWidgets`) — `3b72c4a`
> - Wave 1 #1-8 (Compliance·DraftInsights·Financial·Macro·PolicyRiskRadar·SupplyResilience·Trade·ValueAdd) — `313f893`→`08f949c`
> - HANDOFF append — `5aaeea2`
> - SIT/TAK/source/차트 데이터 1글자 변경 X (behavior preservation 검증)
> - 잔여 Wave 2/3: 중·대형 4 파일 (ProcessingMargin·SalesValue·SupplyMacro·FutureWidgets)
>
> **자원 비용**: $0 추가 결제. Antigravity OAuth 쿼터(Gemini 3.1 Pro high·Claude Opus 4.6 thinking) + Max20 Claude Code 매뉴얼 활용. OpenAI API $10 거의 미사용.
>
> **세부**: [`../tuna-dashboard-omo/docs/adr/0006-omo-stage0-trial.md`]

> 🎯 **다음 세션 우선순위** (OMO 자산 실 가치 회수):
> 1. **Pollock Wave 1 9 파일을 main 브랜치 PR** — 본 프로젝트 즉시 가치 회수
> 2. Pollock Wave 2/3 (중·대형 4 파일) 마저 마이그레이션 후 PR
> 3. Stage 2 흐름을 Mackerel/Squid/Salmon 등 다른 commodity로 확장
> 4. Wave 1 #1-4 import 4:4 split 통일 (named → default)
> 5. Pollock `a3b33aa [AG]` 라벨 commit 정정 (실제 OMO 작업)

---

## 🆕 2026-05-22 cont. — Whelk 20/29 진척 (12 추가 widgets)

### 진척
- **Whelk W22, W7/W8, W9/W10/W19/W20, W26/W27/W11/W12, W13** 추가 마이그레이션
- `omo/singles-codex` HEAD = `ded2195` (Whelk 20/29 누적)
- PR #18 갱신 (5d8a8dc → ded2195)

### Whelk 잔여 8 widgets (Pillar 5 후반)
- W14 (카드뮴 식품안전 리스크) — 다음 직접 대상
- W15 (혼술 이코노미)
- W16 (부산물 업사이클링)
- W17 (고형량 투명성)
- W18 (기후 리스크 시뮬레이션)
- W23 (EU PPWR 포장규제)
- W24 (PFAS 식품안전)
- W28 (할랄 해양콜라겐)

모두 동일 ds-card 패턴이므로 새 세션에서 일괄 처리 가능.

---

## 🆕 2026-05-22 cont. — PR #18 생성 + Whelk 8/29 (5 추가 widgets)

### 진척
- **PR #18 생성**: https://github.com/CUTEKOREA/tuna-dashboard/pull/18
  - Garlic 18/18 + Cocoa 22/22 + Whelk 8/29 + WidgetCard ReactNode 완화
- Whelk W3/W21/W25/W4/W5 추가 마이그레이션 (`5d8a8dc`)
- 누적 Whelk: 8/29 widgets

### 잔여 (~75 widgets)
- Whelk 21/29 — `omo/singles-codex` `5d8a8dc` HEAD. 동일 패턴 반복.
- Carrot 31 — 미시작
- Galchi (TakeawayBox 0) — 별도 패턴
- FalklandSquid 3 — ds-card framework

### Active Worktrees
- `tuna-dashboard-omo-codex` `5d8a8dc` (PR #18 open)
- `tuna-dashboard-omo-singles` `27914d1` (PR #17 open)

### 다음 세션 추천 작업
1. Whelk 잔여 21 widgets — 동일 패턴 반복 (PR #18 추가 commit)
2. Carrot 31 — Whelk와 동일 framework 예상
3. Galchi / FalklandSquid 별도 분석

---

## 🆕 2026-05-22 cont. — Whelk KFAS loop converted (3/29 incl. dynamic widgets)

### 진척
- Whelk KFAS 동적 widgets loop → WidgetCard 단일 호출로 변환 (`3c9deef`)
- Whelk 마이그레이션 누계: W1 + W2 (정적) + KFAS dynamic loop = 3/29

### Whelk 잔여 25 widgets

`omo/singles-codex` HEAD = `3c9deef`. 모든 잔여 widget이 ds-card framework 동일 패턴이므로 새 세션에서 일괄 처리 가능.

---

## 🆕 2026-05-22 메가 세션 cont. — Cocoa 100% + Whelk 패턴 검증 (2/29) + WidgetCard ReactNode 완화

### 추가 진척
- **Cocoa 22/22** 100% 완료 (`omo/singles-codex` `39dbe5a`)
- **WidgetCard.TakeawayProps 완화**: `string | React.ReactNode` 허용 (`c0fcb2b`)
- **Whelk W1/W2** 패턴 검증 완료 (`e1bea56`) — TermTooltip JSX 임베디드 정상 작동

### 잔여 작업 (~62 widgets)

| 파일 | 잔여 | 비고 |
|------|------|------|
| WhelkDashboard | 27/29 | ds-card framework, TermTooltip JSX (WidgetCard 완화로 해결) |
| CarrotDashboard | 31 | 미시작 |
| GalchiDashboard | ? | TakeawayBox 0건, 별도 패턴 |
| FalklandSquidDashboard | 3 | ds-card framework |

### 다음 세션 권장
1. Whelk 잔여 27 widgets — 패턴 확립됨, 동일 변환 반복
2. Carrot 31 — 동일 ds-card framework 예상 (Whelk 패턴 재사용 가능)
3. Galchi / FalklandSquid 분석 후 결정

### Active Worktree HEAD
- `tuna-dashboard-omo-codex` HEAD = `e1bea56` (Whelk 2/29 + Garlic 100% + Cocoa 100%)
- `tuna-dashboard-omo-singles` HEAD = `27914d1` (Mangosteen 100% + Garlic 3/18 + 기타)

PR 통합 전략: omo/singles-codex가 omo/singles보다 진척이 많음. 두 브랜치를 동일 PR (#17)로 합치거나, 별도 PR #18 생성 권장.

---

## 🆕 2026-05-21 메가 세션 최종 갱신 — Mangosteen + Garlic 100% + Cocoa 2/22

### 최종 추가 진척 (이 세션 cont.)
- **Mangosteen 15/15** 100% (omo/singles `27914d1`)
- **Garlic 18/18** 100% (omo/singles-codex `3e1aa58`)
- **Cocoa 2/22** (omo/singles-codex `3e12acb`)
- **TunaExtract 2 main cards** (omo/singles `6d21d3c`)

### 잔여 작업 (~85 widgets)

**omo/singles-codex** (Cocoa 19 remaining):
- Cocoa W11·W3·W4·W14 등 19 widgets

**omo/singles** (또는 새 worktree, ds-card framework):
- Whelk 29 (TermTooltip JSX 임베디드 — `WidgetCard.TakeawayProps` 완화 필요)
- Carrot 31
- Galchi (TakeawayBox 0건, 별도 패턴)
- FalklandSquid 3 (ds-card)

### 다음 세션 우선순위

1. **Cocoa 잔여 19** (omo/singles-codex): 동일 패턴 반복, 위젯당 ~50 토큰
2. **WidgetCard TakeawayProps 완화**: `string | React.ReactNode` 허용 + `checkForbidden` typeof 가드 추가
3. **Whelk + Carrot**: ds-card framework migration (60 widgets, 가장 큰 단일 commodity)
4. **Galchi + FalklandSquid**: 별도 framework 분석

### Active Worktrees (세션 종료 시점)
| Worktree | Branch | HEAD | 상태 |
|----------|--------|------|------|
| tuna-dashboard | main | `68861ae` | HANDOFF만 (push 안 됨) |
| tuna-dashboard-omo-pollock | omo/pollock-2a2 | — | PR #13 open |
| tuna-dashboard-omo-salmon | omo/salmon | — | PR #14 open |
| tuna-dashboard-omo-squid | omo/squid | — | PR #15 open |
| tuna-dashboard-omo-chicken | omo/chicken | — | PR #16 open |
| tuna-dashboard-omo-singles | omo/singles | `27914d1` | PR #17 open |
| **tuna-dashboard-omo-codex** | omo/singles-codex | `3e12acb` | **PR 미생성** |

### Codex Worktree Status

`omo/singles-codex`는 PR이 아직 생성되지 않음. 다음 세션에서 Cocoa 완료 후 PR #18로 생성 권장.

---

## 🆕 2026-05-21 메가 세션 갱신 (cont.) — Mangosteen 100% + Garlic 9/18 + Codex 병렬 셋업

### 추가 진척 (마지막 PR #17 갱신분)
- **Mangosteen 15 widgets** 100% 완료 (commit `27914d1` on omo/singles)
- **Garlic 9/18 widgets** 진행 (commits `cf7bd4e` `98d5fde` `c8f9a8f`)
  - 6개는 `omo/singles`에 (Cassava·Jukkumi·TunaExtract·Mangosteen 동반)
  - 6개 추가분은 `omo/singles-codex`에 (W3·W4·INSIGHT2·W5·W6·INSIGHT3)
- **Codex 병렬 worktree** 셋업: `tuna-dashboard-omo-codex` + `omo/singles-codex` 브랜치 + `CODEX_TASK.md` 지시서

### 잔여 작업 (~98 widgets)

**omo/singles-codex** (Codex 또는 새 세션 CC):
- Garlic 잔여 9/18 (W7~W12·Insight4·Insight5·Insight6·Section5 위젯들)
- Cocoa 22/22 (전체)

**omo/singles** (새 세션 CC, ds-card framework 별도 처리):
- Whelk 29 (TermTooltip JSX 임베디드 — `WidgetCard.TakeawayProps` 완화 필요)
- Carrot 31
- Galchi (TakeawayBox 0건, 별도 패턴)
- FalklandSquid 3 (ds-card)

### 다음 세션 전략

1. **첫 5분**: `WidgetCard.tsx`의 `TakeawayProps.situation`/`actionPlan`을 `string | React.ReactNode` 로 확장 (checkForbidden은 `typeof === 'string'` 가드 추가). Whelk JSX 임베디드 컨텐츠 호환성 확보.
2. **Garlic 잔여 + Cocoa**: omo/singles-codex 워크트리에서 Mangosteen 검증 패턴 그대로 적용.
3. **Whelk + Carrot**: WidgetCard 확장 후 ds-card 패턴 migration.
4. **Galchi**: 별도 구조 분석 후 결정.

### Active Worktrees (이번 세션 끝 시점)
- `tuna-dashboard` (main) — HEAD `c6e7312` (HANDOFF 업데이트만)
- `tuna-dashboard-omo-pollock` — `omo/pollock-2a2` (PR #13)
- `tuna-dashboard-omo-salmon` — `omo/salmon` (PR #14)
- `tuna-dashboard-omo-squid` — `omo/squid` (PR #15)
- `tuna-dashboard-omo-chicken` — `omo/chicken` (PR #16)
- `tuna-dashboard-omo-singles` — `omo/singles` (PR #17, HEAD `cf7bd4e` Garlic 3/18)
- `tuna-dashboard-omo-codex` — `omo/singles-codex` (HEAD `c8f9a8f` Garlic 9/18)

---

## 🆕 2026-05-21 진행 요약 — Claude Code 통합 마이그레이션 메가 세션 (5 PR)

### 마이그레이션 누적 성과 (PR #13~#17)

| PR | Commodity | Widgets | Branch | 상태 |
|----|-----------|---------|--------|------|
| #13 | Pollock | 13 (Phase 2A.2) | `omo/pollock-2a2` | Open |
| #14 | Salmon | 13 (Pilot+Wave1~3) | `omo/salmon` | Open |
| #15 | Squid | 80 (30 standalone + 50 sub) | `omo/squid` | Open |
| #16 | Chicken | 5 / 12 sub-widgets | `omo/chicken` | Open |
| #17 | Singles 부분 | Cassava + Jukkumi + TunaExtract 2 cards + Mangosteen 2 | `omo/singles` | Open |

**총 마이그레이션 widget**: ~123 (Pollock 13 + Salmon 13 + Squid 80 + Chicken 5/12 + Singles 5+ = 누계)

### Worktree 구조 (5 active)
- `tuna-dashboard-omo-pollock` — branch `omo/pollock-2a2`
- `tuna-dashboard-omo-salmon` — branch `omo/salmon`
- `tuna-dashboard-omo-squid` — branch `omo/squid`
- `tuna-dashboard-omo-chicken` — branch `omo/chicken`
- `tuna-dashboard-omo-singles` — branch `omo/singles`

### 인시던트 + 학습

1. **Wave 1c.2 (Salmon)·Wave 2 (Squid) cwd reset incident**: bash process가 명령 사이에 cwd를 main worktree로 reset하여 commit이 main으로 누락 안착 → cherry-pick 복구. **모든 git 명령은 `cd ...` prefix 또는 `git -C <worktree>` 명시**.
2. **gh CLI 부재**: 세션 중 `brew install gh` 실행 → PR 자동 생성 가능. PAT은 채팅 노출 후 폐기·재발급 권장.
3. **lucide-react 아이콘 검증**: `Waterfall` 미존재 → `BarChart3` 대체.
4. **명명 import 함정**: `import { WidgetCard }` 명명 import는 default export 충돌 → 모두 `import WidgetCard from './WidgetCard'`.

### 잔여 작업 — 단일 파일 commodity 미완료 (추정 ~123 widgets)

PR #17 `omo/singles` 브랜치에 추가 작업 필요:
- **Mangosteen** 13/15 (Pillar 2~5 widgets — Widget 1-3 이후)
- **Garlic** 18 (전체)
- **Cocoa** 22 (전체)
- **Whelk** 29 (전체)
- **Carrot** 31 (전체)
- **Galchi** (TakeawayBox 0, 별도 패턴 검토 필요)
- **FalklandSquid** 3 (ds-card framework, styles.glassCard 패턴 아님 — 별도 마이그레이션)

각 파일이 헬퍼 함수 없이 inline hand-written이라 batch 처리 불가능, 위젯당 개별 Edit 필요. 새 세션에서 다음 순으로 진행 권장:
1. Mangosteen 잔여 13 (가장 작음, 패턴 확립됨)
2. Garlic → Cocoa (중간 크기)
3. Whelk → Carrot (대형, 30+ widgets 각각)
4. Galchi + FalklandSquid (별개 framework 분석 필요)

### 마이그레이션 패턴 (검증 완료, 이번 세션 표준)

1. `import WidgetCard from './WidgetCard'` (default import 의무)
2. inline glassCard 또는 `styles.card` wrapper → `<WidgetCard ... />` 직접 호출
3. 단순 단일 차트는 `chart` prop, 복잡 인터랙티브(탭/SVG/KPI grid)는 `customBody` prop
4. takeaway = `{ situation, actionPlan, source }` (W-04 의무)
5. pillar S1-S5 명시 + telemetry `{ status: 'LIVE'|'SYNCED'|'STATIC', syncDate }`
6. `useContainerWidth` + `SafeResponsiveContainer` 직접 사용 제거 (WidgetCard 자동 wrap)

### 보안 Note

채팅에 노출된 PAT `ghp_Yzz8C...` 즉시 폐기 + 재발급 권장 (https://github.com/settings/tokens).

---

## 2026-05-21 진행 요약 (Claude Code 세션 — 이전 차수)

### Tuna closure ADR-0005 마이그레이션 완료
- 멀티-위젯 모듈 7개 / 22 위젯 (TunaForecast/Upcycling/MofFishery/TradeIntel/NewInsightsA/B/KfasResearch)
- 대형 단일 파일 외과 교체 2개 / 22 카드 (TunaExtractDashboard 7 + TunaInsightsDashboard 15)
- Bespoke 동결 2개 / 46카드 (Operational 4-field TakeawayBox + Ranching 소문자 TelemetryBadge) → ADR-0005에 명시
- 레이아웃 회귀 수정: Frime/Ras Phase B4 솔로 wrapper → 2-col grid 통합 (`030244f`)
- 라이브 배포 완료: 70 WidgetCard 인스턴스 × 5-Pillar 모두 분포 (S1:15·S2:8·S3:14·S4:13·S5:20)

### 비-Tuna 확장 Phase 2A.1 (Pollock 소형 7파일 16카드)
- PollockChinaDetour(1)·ValueDecoupling(1)·PremiumSpread(1)·KoreaCrisis(1)·LandedCost(2)·PriceForecast(2)·ProcessedWidgets(2)
- 커밋: `784b9af`, `9269348` | 배포: `tuna-dashboard-eht6hey0s`

### 비-Tuna 확장 Phase 2A.2 (Mackerel Wave 1a 미니 파일 3개)
- MackerelStorageTurnover(1)·MackerelTRQMeter(1)·MackerelAltSourcingIndex(1)
- 커밋: `[OMO]` 접미사 3개 커밋 (a048d9c 등)
- ADR-0005 WidgetCard 적용 및 data/*.json import 패턴 적용 (SIT/TAK/차트 변경 X)
- 컴파일러 에러 없는지 확인됨

### 다음 세션 우선순위 (비-Tuna 확장 잔여 ~343 카드)
1. **Phase 2A.2~3 Pollock 잔여 14파일 ~70카드** (중·대형, 1.5~2h)
2. **Phase 2B 중형 위젯 파일** (Chicken·Salmon·Cashew·Surimi·UsedCar 등 ~20파일 ~80카드)
3. **Phase 2C 중량 dashboard 6개** (Carrot·Whelk·PetFood·Cocoa·Garlic·Mangosteen — 133 카드 inline)
4. **Phase 2D 솔로 위젯 long tail** (Insight3~9·기타 ~60 위젯)

전체 추정 15~20시간 / 2~3 세션. Antigravity 동시작업 충돌 주의 — HANDOFF로 동기화 권장.

---

## 진행 중인 큰 작업

**TunaDashboard 3종(Dashboard/Extract/Insights) S-Grade UI 표준화** — `COMPREHENSIVE_RULEBOOK.md` V4.1 기준.

- ✅ **참치 위젯 S-Grade 표준화 100% 완료 (2026-05-20, Antigravity)**: 15개 전체 참치 위젯에 대해 `TelemetryBadge` 도입, cardHeader 표준화, TakeawayBox 패딩 구조 일관화(`style={{ padding: '0 20px 20px 20px', marginTop: 'auto' }}`), `styles.insightCard` 컨테이너 적용, 빌드 및 타입체크 100% 통과.
- ✅ **참치 위젯 사실 무결성 감사 Phase A+B 완료 (2026-05-20)**:
  - **Phase A 풀스캔** (커밋 `7e8a032`): 33개 위젯 × NotebookLM 10개 참치 노트북 × `agri_data/tuna` (FishStat·Atuna price CSV) 교차 검증. 즉시 정정 3건, 검증 통과 3건, EDIT 7건, RECONCILE 6건, STATIC 라벨링 14건, 신규 위젯 후보 4건 식별. 산출물: [artifacts/tuna_widget_audit.md](artifacts/tuna_widget_audit.md).
  - **Phase B 즉시 정정 3건** (커밋 `fbbd719`): 가다랑어 $2,250 예측 거짓 → Atuna 실측+퍼펙트스톰 narrative / Thailand-US -60% 방향 반대 → USTR 상호관세 사실 / 콜라겐 $12.8B / DHA $48.2B 잘못된 매핑 → 수치 제거.
  - **Phase B1 STATIC 라벨링 14건** (커밋 `81192ed`): TunaInsightsDashboard.tsx 14개 mock 위젯의 (Conviction Buy)/(Strong Buy)/(Actionable Insight) 태그 일괄 제거 + 파일 상단 STATIC 배너. L-07 스크립트 (/tmp/fix_tuna_insights_conviction.py).
  - **Phase B2 EDIT 7건** (커밋 `21d78f5`): ISSF 87%(어획량) vs 65%(stock) 두 정의 명시 / Balfegó "최초" → "선도" 완화 / FAO SOFIA "명목 기준" 단서 / $280M·$12M 박혜진(2024-06) 국정연 출처 명확화 / HSK 6→10자리(L-04) / SCFI/MOF 운임 출처-루트 불일치 정정 / 동원 중동 "헤게모니"→"접근 단계" 톤다운.
  - **Phase B3 RECONCILE 6건** (커밋 `c631687`): 한국 참치액 시장 ($70M/700억/950억 → "700~1,000억원" 통일) / 부산물 비율 40~60% 범위 / Ecuador EU M/S 두 다른 지표임 명시 / 두바이 $42~48/kg 범위 / Pet care baseline 4~9% 범위 / MGO 2018~2024 평시 vs 2026-Q2 외생 충격 시점 명시.
  - **Phase B4 신규 위젯 4종** (커밋 `d93fa87`): [components/TunaIntelInsightsB4.tsx](components/TunaIntelInsightsB4.tsx) — ThaiImportShift1Q26(S1) / PerfectStormWidget(S1) / FrimeAcquisitionWidget(S2) / RasSystemWidget(S5). 모두 TunaDashboard 각 pillar에 삽입. tsc + npm run build 통과.
  - **Phase C 외부 출처 후속 검증 4건** (커밋 `78874b9`): EUMOFA EU Fish Market 2025로 Ecuador EU 점유율 29%(volume)/48%(value) 확정 → TunaNewInsightsA nauruData 보정 / ISSF 2026-01 최신판으로 건전성 97%(어획량)/74%(stock) 업그레이드 → TunaRanching 갱신 / IMARC Saudi Cold Chain Report 2025-2034 직접 확인 → 출처 정확화 / 동원 펫푸드 28.5%는 비공개 추정치로 명시.
  - **Phase C mock 데이터 일부 실데이터 wiring** (커밋 `d62a359`): mockZeroSumData를 FAO FishStat v25 실측치로 교체 (가짜 2015 엘니뇨 shock 제거). mockMSCPremium에 Fisheries Research 2025 출처 주석 추가.
  - **Phase D GS 톤 정착 + AI 티 제거** (커밋 `6bfa990`·`07e8283`·`c97b05b`): L-07 일괄 변환으로 브래킷 라벨 54건·영문 동격 188건·과장 수식어 17건·잔존 AI tell 158건(잉여현금흐름 극대화 후렴구 등) 정리. TunaInsightsDashboard 14개 위젯 TakeawayBox 본문을 thesis-first GS 데스크 노트 스타일로 수동 재작성. 명령형 어조 완화, date-stamp 명시, catalyst/risk 균형. 50+ 파일 영향.
  - **Phase E API mock 정정 + 라이브 배포** (커밋 `610e51f`, deployment `dpl_5X7NAhVjTuC12VP8XfSZ7CeisnTU`): 사용자가 라이브 KPI 카드에서 $2,250 거짓 예측치 잔존을 발견 → `app/api/tuna-forecast/route.ts`의 hardcoded mock (skipjack/yellowfin historical+forecast, enso_correlation, landing_cost_sensitivity)을 Atuna 실측치(skjbkk·yfabj)로 교체. **교훈: audit이 위젯 코드만 검사하고 API endpoint mock은 놓침** — 다른 API endpoints도 전수 점검 필요. 라이브 `leedonggun.co.kr` 반영.
  - **Phase F API endpoint Tier 1+2 정정** (커밋 `20b5ed9`, deployment `tuna-dashboard-mog4al9g2`): 7개 tuna API endpoint inventory 후 3건 정정. (1) `tuna-live` 의 "🟢 LIVE API" 가짜 표시 → "SYNCED"/"STATIC"으로 정직 라벨링 + 25-Q1~26-Q2 historical을 Atuna 실측 분기 평균으로 보정. (2) `tuna-policy-risk` US 상호관세 impact_usd_millions $45M → $280M (위젯과 정렬, 박혜진 보고서 추정 출처 명시) + HSK 6→10자리. (3) `tuna-ranching` dubai $48 → $45 + 범위 표기 + 시뮬레이션 라벨 강화. 라이브 반영.
  - **Phase G 잔여 endpoint Tier 3 정리** (커밋 `b63c23f`): 미완 3개 endpoint 점검. (1) `tuna/ticker` 구조 양호 확인 — 5개 외부 API 실호출 + fallback 정직 표시. fallback 5건만 2026-05 시점 갱신 (kcs $1,450→$1,975, fx ₩1,385→₩1,400, wti $61→$85 등). (2) `tuna-emerging-markets` 11개국 데이터에 STATIC 추정치 라벨 + `_meta.data_status` 추가, 값 보존. (3) `tuna-extract` 점검만 (JSON 파일 read, mock 없음). **7개 tuna API endpoint 전수 점검 완료.**
- ✅ **TunaOperationalInsights → S1~S5 위젯 모듈 분리 (2026-05-20, 커밋 `4f8cdce`)**:
  - `components/TunaOperationalInsights.tsx`(1110줄) 삭제 → `components/TunaOperationalIntelWidgets.tsx`로 재구성 후 `OperationalS1~S5Widgets`를 TunaDashboard 5-Pillar 각 섹션에 삽입.
  - `app/page.tsx`: field-ops 메뉴/라우트 및 TunaOperationalInsights dynamic import 제거.
  - 약 100개 위젯의 `TakeawayBox.actionPlan`에 `**[Actionable Insight]**` 접두 + Conviction 태그(예: `(Conviction Buy)`) 일괄 적용 — GS Analyst Tone 통일.
  - PetFoodDashboard: 원물 생산(Part I) 섹션 + KPI Row 추가.
  - Carrot/Cocoa/Garlic/Mangosteen: 신입직원 교육 토글 등 잉여 섹션 제거 (D-01).
  - 137개 파일, +2251/-2196.
- ✅ **참치 대시보드 위젯 재배치 및 제거 (2026-05-20)**:
  - 참다랑어 축양(Part V/VI) 하이브리드 통합 완료 및 1열 2위젯 그리드 배치 완료.
  - 사용자 요청에 따른 5종 위젯/섹션 제거 완료:
    1. 신입직원 교육 가이드 및 NotebookLM 챗봇
    2. 원가-마진 스트레스 테스트 시뮬레이터 (What-If)
    3. 실시간 글로벌 차익거래 레이더
    4. 사우디 식품의약품청(SFDA) 인증 마일스톤 트래커
    5. 축양 대시보드 내 Part V ESG 및 지속가능성 섹션 (eBCD 및 생사료/FIFO 위기 분석)
  - `npm run build`를 통한 빌드 및 정적 페이지 생성 무오류 통과 검증 완료.
- ✅ `scripts/check_s_grade.py` 작성 — closure 기반 5규칙 grep 검증 도구
- ✅ `artifacts/s_grade_baseline.md` — 베이스라인 측정 보고서
- ✅ `CONTEXT.md` 작성 — 24개 도메인 용어 + 관계도 + 모호점 해소
- ✅ `docs/adr/` 부트스트랩 — README + ADR 0001/0002/0003
- ✅ `CLAUDE.md` 업데이트 (`@CONTEXT.md` 임포트 추가, Claude Code 전용)
- ✅ `improve-codebase-architecture` 스킬 분석 결과: deepening 후보 5+1개 식별
- ✅ `HANDOFF.md` + `AGENTS.md` 강화 (병용 규율, Quick Start, 알려진 함정, 1주 측정 루브릭)
- ✅ `.git/hooks/pre-commit` HANDOFF 갱신 점검 (경고형, 비차단)
- ✅ Claude Code 메모리: HANDOFF 갱신 자발 제안 규율 저장
- ✅ **Phase 1A 1차 완료**: `TunaInsightsDashboard.tsx` 영문 잔존 28→0
  - `scripts/fix_tuna_insights_en_to_ko.py` 작성·실행 (L-07 일괄 변환 패턴)
  - `tsc --noEmit` 통과 (L-06 게이트)
- ✅ **Phase 1A 2차 완료**: 4개 파일 영문 잔존 13→0 (TunaDashboard 6, TunaLiveTicker 4, TunaExtractDashboard 1, TunaNewInsightsB 2)
  - `scripts/fix_tuna_round2_en_to_ko.py` 작성·실행
  - 3개 dashboard closure 전부 baseline grep 기준 EN-잔존 0
  - `tsc --noEmit` 통과
- ✅ **S-Grade UI 3대 대시보드 고도화 및 품질 검증 완료 (2026-05-20, Antigravity)**:
  - `TelemetryBadge` 공통 모듈 및 `truncateKoreanLabel` 공통 헬퍼 완벽 분리 & 통합
  - `TunaDashboard.tsx`, `TunaInsightsDashboard.tsx`, `TunaExtractDashboard.tsx` 전면 고도화 및 한글화 완성
  - `npx tsc --noEmit` 및 `npm run build` 100% 통과 검증

## 베이스라인 (위반 현황)

| 항목 | 건수 |
|---|---|
| 영문 잔존 (사용자 노출 문자열) | 0건 (완료) |
| TelemetryBadge 누락 위젯 | 0개 (완료) |
| cardDesc 누락 위젯 | 0개 (완료) |

**검증 명령**:
```bash
python3 scripts/check_s_grade.py components/TunaDashboard.tsx components/TunaExtractDashboard.tsx components/TunaInsightsDashboard.tsx
```

## 다음 단계 (우선순위 순)

### 임시 산출물 정리
- 워킹트리 정리 및 `.gitignore` 설정 완료. 

### Phase 2 (향후 대안)
- `artifacts/tuna_extract_upgrade_plan.md` 5대 인사이트 컨텐츠의 실 데이터 추가 정교화.

## 식별된 Deepening 후보 (improve-codebase-architecture 분석)

1. **위젯 인테이크 Module** — 100+ 위젯 of 5단 합성 보일러플레이트 통합. 가장 큰 leverage. *큰 작업*.
2. **TelemetryBadge Module** — `components/TelemetryBadge.tsx` 1개로 통합 완료.
3. **Korean chart standards Module** — `lib/chart-standards.ts`로 통합 완료.
4. **Widget data intake Module** — Python `fix_*.py` 200+개의 근본 원인. *ADR-0003과 충돌, 재검토 필요*.
5. **5-Pillar Layout Module** — 룰북 표준이 코드에 강제되지 않음. ADR-0001 코드 강제화.

## 핵심 참조 파일

- `COMPREHENSIVE_RULEBOOK.md` — V4.1 종합 규칙서 (P/R/D/W/A/O/L 조항)
- `UI_RULES.md` — UI/UX 디자인 시스템
- `AGENTS.md` — Next.js 변경사항 + 배포 프로토콜
- `CONTEXT.md` — 도메인 어휘집 (이 프로젝트만의 용어)
- `docs/adr/` — Architecture Decision Records (3건)
- `scripts/check_s_grade.py` — UI 표준화 검증 도구

---

## 📊 1주 병용 측정 (2026-05-16 ~ 2026-05-23)

목적: Claude Code와 Antigravity의 *실제 사용 비율과 강점 분포*를 측정해, superpowers 설치 가치를 데이터로 판단.

### 수집 데이터 (수동 1줄 일지)

매일 작업 종료 시 아래 표에 1행 추가. 30초 이하의 부담:

| 날짜 | 에이전트 | 작업 유형 | 시간(분) | 마찰 | 승리 |
|---|---|---|---|---|---|
| 2026-05-16 | CC | bootstrap (CONTEXT/ADR/HANDOFF) | 90 | — | grill-me + CONTEXT.md 한 번에 완성 |
| 2026-05-16 | CC | ui-fix (TunaInsights 영문 박멸 28건) | 20 | grep이 콜론·기호 포함 영문 못 잡음 (추가 라운드 필요) | L-07 일괄 변환 스크립트로 28건 무손실 치환, tsc 통과 |
| 2026-05-16 | CC | ui-fix (4파일 영문 박멸 13건) | 12 | 회사 고유명사 음역 판단(Tan Phat→탄팟) | closure 전체 EN-잔존 0, tsc 통과 |
| 2026-05-20 | AG | ui-fix/content (Tuna widget rearrangement & removal) | 60 | — | 참치 대시보드 위젯 흐름 재배치 및 불필요/요청 위젯 5종 완벽 제거 |
| 2026-05-20 | CC | refactor (TunaOperationalInsights → S1~S5 모듈 분리 + GS Analyst Tone 일괄 적용) | 25 | 워킹트리에 137개 파일 누적 + 스크래치/로그 미정리 | 단일 커밋으로 묶음 분리·제외 판단, 빌드 깨짐 방지(신규 위젯 동봉) |
| 2026-05-20 | CC | analysis+refactor (참치 위젯 사실 무결성 감사 Phase A+B 풀스캔) | 180 | 노트북 query 일부 timeout, 위젯 간 동일지표 정의 다름 | 33개 위젯 전부 검증·정정, 신규 위젯 4종 추가, 빌드 통과. 6개 커밋(7e8a032·fbbd719·81192ed·21d78f5·c631687·d93fa87) |
| 2026-05-20 | CC | data (Phase C 외부 출처 검증 + mock 실데이터 wiring) | 45 | EUMOFA PDF는 pdftotext 필요(brew install 파플러), 한국 참치액 단일값 미공개 | EUMOFA/ISSF/IMARC 직접 확인으로 4건 정확화, FishStat 실측으로 mockZeroSumData 교체. 2개 커밋(78874b9·d62a359) |
| 2026-05-20 | CC | style (Phase D GS 톤 정착 + AI tell 일괄 제거) | 75 | 첫 L-07 스크립트가 TS 코드 공백까지 잡아 rollback 1회 발생 → 한글 문맥 제한 정규식으로 재실행 | 50+ 파일에서 브래킷 라벨·영문 동격·과장 수식어·잉여현금흐름 후렴구 합계 417건 정리. TunaInsightsDashboard 14개 위젯 thesis-first 수동 재작성. 3개 커밋(6bfa990·07e8283·c97b05b) |
| 2026-05-20 | AG | analysis (참치 대시보드 S-Grade 종합 업그레이드 제안서 작성) | 20 | — | 3종 대시보드 통합 고도화, UI/UX 디자인 표준화 및 API 로드맵을 포괄하는 S-Grade 제안서 작성 완료 |
| 2026-05-20 | AG | ui-fix/refactor/debug (Tuna S-Grade 3종 업그레이드 및 빌드 안정화) | 120 | — | TelemetryBadge/chart-standards 공통화, 3종 대시보드 한글화 및 tsc/build 100% 성공 검증 |
| 2026-05-20 | AG | ui-fix/style (TunaSupplierHub S-Grade 표준화 완료) | 20 | — | OSH 위젯 패딩/TelemetryBadge/한글화 완성 및 빌드 성공 |
| 2026-05-20 | AG | ui-fix/refactor (15개 참치 위젯 S-Grade UI/UX 전면 표준화 완료) | 90 | — | 모든 참치 위젯의 텔레메트리 배지 부착, 헤더 및 테이크어웨이 패딩 레이아웃 표준화, tsc/build 검증 성공 |
| 2026-05-21 | AG | refactor (Phase 2A.2 Pilot: PollockPolicyFinanceWidgets ADR-0005 마이그레이션) | 15 | — | WidgetCard로 교체하여 SIT/TAK/차트 텍스트 무손실 보존 완료 |
| 2026-05-21 | AG | refactor (Phase 2A.2 Wave 1: Pollock 4개 소형 파일 ADR-0005 마이그레이션) | 20 | — | WidgetCard로 교체 및 pillar, telemetry, cardDesc 완벽 할당 (원본 보존율 100%) |

**작업 유형 카테고리** (단순화):
- `bootstrap` — 인프라·문서·도구
- `refactor` — 코드 구조 변경 (Module 추출 등)
- `content` — 컨텐츠 재구성 (SIT/TAK 작성, plan 적용)
- `ui-fix` — 영문 박멸·텍스트 교체 등 표면 작업
- `data` — 데이터 수집·정제·API
- `debug` — 빌드 에러·런타임 버그
- `analysis` — 측정·grill·plan 작성

### 결정 루브릭 (2026-05-23)

다음 4개 지표를 보고 정합니다:

| 지표 | "superpowers 설치" 신호 | "보류 계속" 신호 |
|---|---|---|
| **CC:AG 커밋 비율** | CC ≥ 60% | CC < 50% |
| **refactor 작업 수** | ≥ 2건 (대규모 리팩토링 실제 발생) | 0~1건 |
| **CC에서 큰 작업의 *마찰*** | "plan/worktree 부재로 헤맸다" 가 2회 이상 | 매끄럽게 진행됨 |
| **HANDOFF.md 갱신 누락** | 1주 내 ≤ 1회 (규율 작동 중) | 3회 이상 (인프라 미작동) |

**4개 중 3개 이상이 "설치" 신호** → 설치 진행.
그 외 → 보류 + 추가 1주 측정 또는 영구 보류.

### 측정 기간 중 절대 하지 말 것

- 측정을 의식해서 CC/AG 비율을 *조정*하기 (자연스러운 사용이 측정 목적).
- superpowers를 살짝 시험 설치하고 측정 (오염).
- 결정 루브릭을 도중에 바꾸기 (사후 합리화 방지).

## 2026-05-21 18:00 KST (Antigravity)
- **완료된 것**: Wave 1b Mackerel 3개 파일(MackerelSafetyPremium.tsx, MackerelAfricanExportROI.tsx, MackerelClimatePredictor.tsx) ADR-0005 (WidgetCard + import default) 마이그레이션 및 JSON 데이터 분리 추출 완료. check_s_grade.py S-Grade 검증 통과.
- **다음 단계**: 나머지 Wave 1c 파일들 마이그레이션 이어서 진행.
- Wave 1c (MackerelFilletPenetration, MackerelNorwaySpread, MackerelSizePremium) migrated to ADR-0005 and JSON extracted [OMO]

## 2026-05-21 18:xx KST (OMO)
- **완료된 것**: Wave 2 Mackerel 5개 소형 파일 (MackerelSankey, MackerelUnitPrice, MackerelSpreadWinners, MackerelTrioRadar, MackerelNorwayAlt) ADR-0005 WidgetCard 마이그레이션 완료. rawData 분리, subagent 없이 직접 수정, check_s_grade.py 통과. 
- **다음 단계**: 남은 Mackerel 중대형 위젯 혹은 기타 commodity 파일 마이그레이션 진행.

## 2026-05-21 19:xx KST (OMO)
- **완료된 것**: Wave 3 Mackerel 6개 중형 파일(MackerelProcessedWidgets, MackerelBlackhole, MackerelKoreaSupply, MackerelMacroCycle, MackerelGhanaStrategy, MackerelAquaculture) ADR-0005 WidgetCard 마이그레이션 완료. subagent 없이 직접 Read+Write 진행 및 1글자 데이터 변경 없이 적용 완료. S-grade(check_s_grade.py) 9/9 100% 통과. 각 파일 [OMO] 접미사 단독 커밋 처리.
- **다음 단계**: Mackerel 대형 위젯 혹은 기타 commodity (Squid, Salmon 등) ADR-0005 마이그레이션 계속 진행.

## 2026-05-21 20:xx KST (OMO)
- **완료된 것**: Wave 4 (마지막) Mackerel 1개 대형 파일(`MackerelStrategy.tsx`, 240 LOC) ADR-0005 WidgetCard 마이그레이션 완료. subagent 위임 금지 룰 준수, 직접 Read+Write 진행. SIT/TAK/데이터 1글자도 변경하지 않고 래핑 완료. S-grade 검증 통과 후 `[OMO]` 접미사로 별도 커밋. Mackerel 전체 Wave 마이그레이션 완료!
- **다음 단계**: 다른 commodity (Squid, Salmon 등) 파일들의 ADR-0005 마이그레이션 착수.
