# Original User Request

## Initial Request — 2026-05-30T17:59:55+09:00

참치왕국 대시보드(Next.js 16 / Recharts / Supabase)의 원료 수급 위젯 영역에 FFA 공식 데이터 기반 6개 위젯을 프로덕션 품질로 구현한다. 기존 대시보드의 디자인 시스템(Glassmorphism, WidgetCard, TakeawayBox, TelemetryBadge)을 100% 준수하면서, Atuna API 단일 출처를 FFA/SPC/NOAA 다중 출처로 확장하여 임원 대상 신뢰도를 높인다.

Working directory: /Users/idong-geon/연구자동화애이전트들/tuna-dashboard
Integrity mode: development

## Reference Material

### 프로젝트 규칙 (반드시 숙지)
- `AGENTS.md` — 에이전트 진입 규율, 5-Pillar 구조, 함정 목록
- `COMPREHENSIVE_RULEBOOK.md` — P/R/D/W/A/O/L 전체 규칙
- `UI_RULES.md` — Glassmorphism, 한글 7자 truncate, Recharts 표준
- `CONTEXT.md` — 도메인 어휘 (SIT/TAK, TelemetryBadge 등)

### 기존 위젯 패턴 참조
- `components/TunaInsightsDashboard.tsx` — 메인 Insights 대시보드 (WidgetCard 패턴 참조)
- `components/TunaCatchVolumeTrend.tsx` — 어획량 추이 차트 참조
- `components/TunaCatchBySpeciesLive.tsx` — 어종별 실시간 어획 참조
- `components/VesselVdsStatus.tsx` — VDS 상태 위젯 참조
- `components/Insight6ClimateCombo.tsx` — 기후 관련 위젯 참조
- `components/PacificEezStrategicWidget.tsx` — 태평양 EEZ 전략 위젯 참조

### FFA 데이터 소스 (파싱 대상)
- `/Users/idong-geon/agri_data/01_수산물(Seafood)/tuna/intelligence_reports/FFA/Value of WCPFC-CA tuna fisheries 2025.xlsx` — 어종/장비별 어획 가치, 2012-2024 시계열
- `/Users/idong-geon/agri_data/01_수산물(Seafood)/tuna/intelligence_reports/FFA/Compendium of Economic and Development Statistics 2024.xlsx` — 국가별 어획량·수입, 2010-2023
- `/Users/idong-geon/agri_data/01_수산물(Seafood)/tuna/intelligence_reports/FFA/Tuna Fishery Report Card 2025 - Final - rev.pdf` — 자원평가 (SB/SBF=0)
- `/Users/idong-geon/agri_data/01_수산물(Seafood)/tuna/intelligence_reports/FFA/FFA_TIN_Jan-Feb_2026.pdf` — 가격, VDS, 선단 동태
- `/Users/idong-geon/agri_data/01_수산물(Seafood)/tuna/intelligence_reports/FFA/FFA_Markets Study_2025 UPDATE.pdf` — 가공 용량, 무역 흐름

### 이미 확인된 FFA 핵심 수치 (코드에 반영할 데이터)

**2024 WCPFC 어획 데이터** (SPC/WCPFC 2025 Overview 기준 — Record Year):
- 총 어획량: 3,059,005 MT (+15% YoY, 역대 최고)
- SKJ: 2,045,720 MT (67%, +24%)
- YFT: 741,473 MT (24%, -1.5%)
- BET: 151,611 MT (5%, +4%)
- ALB: 120,201 MT (4%, +19%)

**2024 어획 가치:**
- 총 가치: $5.6B (-6% YoY)
- SKJ: $3.21B (+8%), YFT: $1.62B (-20%), BET: $0.51B (-26%), ALB: $0.29B (-5%)

**자원 상태 (전 어종 NOT overfished, NOT overfishing):**
- SKJ: SBrecent/SBF=0 = 0.51 (LRP 0.20 대비 2.55× 안전)
- YFT: 안정 (0% prob below LRP)
- BET: 안정 (0% prob below LRP, MSY ~164,640 MT)

**선단/VDS 데이터:**
- 선망 228척 (-5%), 연승 2,158척 (-3%)
- 선망 조업일 53,313일 (+2%), 투망 62,476회 (+21%)
- PIC 깃발 선망 59% (145/247)

**가격 데이터 2024:**
- Thai Import SKJ: $1,523/MT (-14% YoY)
- Yaizu SKJ: $1,466/MT (-24%)
- 선망 경제조건 지수: 111 (20년 평균 이상)
- 연승 경제조건 지수: 84 (평균 이하)

**ENSO-어장 상관:**
- 2024: El Niño→La Niña 전환기
- PNG 최대 EEZ (28% of total catch) — ENSO 주기에 따른 어장 이동 확인
- 공해 어획 12%로 급감 (역사적 25%+ 대비)

**가공 캐파 (FFA Markets Study 2025):**
- 태국 1,200,000 MT/yr (가동률 60-65%)
- 에콰도르 350,000 MT/yr
- 필리핀 250,000 MT/yr
- 인도네시아 200,000 MT/yr
- 베트남 150,000 MT/yr (급성장)
- PNG 70,000 MT/yr

## Requirements

### R1. WCPO 수급 대시보드 위젯
어종별(SKJ/YFT/BET/ALB) 어획량 현황을 시각화하는 위젯. 도넛 차트로 어종별 비중, 시계열 라인 차트로 연도별 추이(2012-2024), 총 어획량·총 가치 KPI 카드를 표시한다. 출처 배지에 "FFA/SPC" 명시. 기존 `WidgetCard` + `TakeawayBox` 패턴으로 구현.

### R2. 자원 건강도 게이지 위젯
SKJ/YFT/BET/ALB 4개 어종의 SB/SBF=0 비율을 반원형 게이지로 시각화. LRP(0.20) 기준선을 시각적으로 표시하고, 각 어종의 안전 마진(LRP 대비 배수)을 숫자로 나타낸다. "FFA/SPC 자원평가" 출처 배지.

### R3. ENSO × 어획 상관 분석 차트
NOAA ONI(Oceanic Niño Index) 시계열과 WCPO 어획량을 이중 Y축으로 오버레이하는 차트. 현재 ENSO 위상(El Niño/Neutral/La Niña)을 시각적 인디케이터로 표시하고, 어장 이동 패턴(서쪽/동쪽)을 설명 텍스트로 제공. ONI 데이터는 하드코딩 가능(2012-2024 연도별 평균).

### R4. VDS 시장 인디케이터 위젯
VDS 일당 가격, 연간 조업일수, PNA 수입 추이를 시계열 차트로 표시. 현재 가격 수준($14,000-15,000/일)과 트렌드, MPA 확대/화산 리스크 등 가격 상방 요인을 TakeawayBox에 분석. "FFA EDIS" 출처 배지.

### R5. 글로벌 가공 캐파 모니터 위젯
태국/에콰도르/필리핀/인도네시아/베트남/PNG의 연간 가공 용량과 가동률을 수평 막대 차트로 비교. 가동률 변화가 원료 수요·가격에 미치는 영향을 TakeawayBox에 분석. 기존 OEM 메뉴(VN/TH)와 연계 가능한 인사이트 포함.

### R6. 공급 집중도 리스크 위젯
PNA 국가별 어획 비중을 트리맵 또는 수평 막대로 시각화. HHI(Herfindahl-Hirschman Index) 수치를 계산·표시하고, 국가별 리스크 요인(MPA, 화산, ENSO 민감도, 정치 불안정)을 태그로 표시. TakeawayBox에 공급 분산 전략 분석.

## Acceptance Criteria

### 빌드 & 런타임
- [ ] `npm run build` 가 에러 없이 완료된다
- [ ] 로컬 dev 서버에서 6개 위젯이 모두 정상 렌더링된다 (빈 화면, 흰 박스, 에러 경계 표시 없음)
- [ ] 기존 대시보드의 다른 탭/위젯이 깨지지 않는다

### 디자인 시스템 준수
- [ ] 6개 위젯 모두 기존 `WidgetCard` 컴포넌트를 사용하거나 동일한 Glassmorphism 스타일을 적용한다
- [ ] 모든 위젯에 `TelemetryBadge`가 부착되어 있으며 출처(FFA/SPC/NOAA 등)가 명시된다
- [ ] 사용자 노출 텍스트는 100% 한글이다 (약어는 TermTooltip 사용)
- [ ] 차트 X축 라벨은 `truncateKoreanLabel(tick, 7)` 적용

### 데이터 정확성
- [ ] 위젯에 표시되는 어획량·가치·SB/SBF=0 수치가 위 "이미 확인된 FFA 핵심 수치" 섹션의 데이터와 일치한다
- [ ] 각 위젯의 TakeawayBox에 situation(현황)과 actionPlan(실행 전략)이 모두 작성되어 있다

### 통합
- [ ] 위젯들이 기존 대시보드의 적절한 위치(참치 탭 또는 value-chain 원료 수급 섹션)에 배치되어 접근 가능하다
