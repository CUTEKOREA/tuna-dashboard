# Tuna Dashboard Design Specification (design.md)

이 문서는 참치왕국 신라교역 대시보드(Tuna Dashboard)의 핵심 디자인 토큰(Design Token)을 정의합니다. 
W3C의 DTCG(Design Token Community Group) 표준 사상에 입각하며, **J.P. Morgan, Goldman Sachs 등 글로벌 투자은행(IB)의 "고급스럽고 효율적인 데이터 중심 UI" 원칙**을 따릅니다.
모든 AI 에이전트와 개발자는 코드를 작성할 때 이 파일의 엄격한 가이드를 최우선으로 적용해야 합니다.

---

## 1. Theme & Concept (테마 및 컨셉)
- **Aesthetic**: Institutional Precision / Data-First Flat Design (솔리드 & 정밀함)
- **Concept**: 투자은행 트레이딩 터미널 (Investment Banking Dashboard)
- **Quality**: 화려함을 배제하고 가독성, 데이터 명확성, 시각적 효율성을 극대화한 최고급 인텔리전스.

---

## 2. Colors (색상)
화려한 파스텔 톤과 반투명(rgba)을 배제하고 완벽하게 불투명한(Opaque) 고대비 색상을 사용합니다.

### 2.1 Backgrounds & Surfaces (배경 및 표면 - Opaque Solid)
- `bg-color` : `#020617` (가장 깊은 바닥 배경, Slate 950)
- `surface-1` : `#0F172A` (기본 카드/패널 배경, 불투명, Slate 900)
- `surface-2` : `#1E293B` (인사이트 카드, 모달 등 겹치는 요소, Slate 800)
- `surface-3` : `#334155` (드롭다운, 툴팁 등 최상위 요소, Slate 700)
- *규칙:* `backdrop-filter: blur` 등 글래스모피즘 효과는 절대 사용하지 않습니다.

### 2.2 Semantic Colors (데이터 의미론적 색상 - 장식용 사용 금지)
데이터의 상승/하락, 경고 등을 나타낼 때만 제한적으로 사용합니다.
- `color-info` / `accent-primary` : `#3B82F6` (파란색: 기본 정보, 액션, 선택됨)
- `color-success` / `accent-secondary` : `#10B981` (초록색: 긍정적 지표, 수익, 상승)
- `color-danger` / `accent-danger` : `#EF4444` (빨간색: 부정적 지표, 손실, 하락)
- `color-warning` / `accent-warning` : `#F59E0B` (노란색: 경고, 주의)

### 2.3 Text Colors (텍스트 색상 계층 - 고가독성)
- `text-primary` : `#F8FAFC` (제목, 핵심 데이터, 완전한 흰색에 가까움)
- `text-secondary` : `#CBD5E1` (기본 본문 텍스트)
- `text-tertiary` : `#94A3B8` (테이블 헤더, 보조 축, 캡션)
- `text-dim` : `#64748B` (비활성, 힌트 텍스트)

---

## 3. Typography & Data Density (타이포그래피 및 고밀도 데이터)

- **Fonts**: 
  - 기본 텍스트: `Inter`, `Plus Jakarta Sans` 등 깔끔한 산세리프.
  - **숫자 데이터 필수 규칙**: 모든 숫자 데이터는 반드시 `font-variant-numeric: tabular-nums;`를 적용하여 열(Column)이 정확히 정렬되도록 합니다.
- **Scale (크기 단계)**: 한 화면에 많은 데이터를 담기 위해 과도하게 큰 폰트를 피합니다.
  - `font-xs` (11px) : 차트 틱(Tick), 보조 레이블
  - `font-sm` (12px) : 테이블 셀 기본 텍스트
  - `font-base` (13px) : 본문
  - `font-md` (14px) : 탭 제목, 카드 서브헤딩
  - `font-lg` (16px) : 카드 메인 제목
  - `font-xl` (20px) : 핵심 지표(KPI) 숫자
  - `font-2xl` (24px) : 페이지 타이틀
- **Weights (굵기)**: `400`(Normal), `500`(Medium), `600`(Semi-bold)

---

## 4. Spacing (고밀도 간격 - High Density Grid)

데이터의 밀도를 높이기 위해 컴팩트한 간격을 사용합니다.
- `space-1` : `4px`
- `space-2` : `8px`
- `space-3` : `12px`
- `space-4` : `16px` (기본 패딩/마진, 이전보다 타이트함)
- `space-5` : `20px`
- `space-6` : `24px` (카드 내부 여백, 그리드 갭)

---

## 5. Radii (모서리 둥글기 - Crisp & Sharp)

둥글둥글한 캐주얼함을 배제하고 전문성을 강조하는 날렵한 모서리를 사용합니다.
- `radius-sm` : `2px` (뱃지, 차트 바, 체크박스)
- `radius-md` : `4px` (버튼, 인풋 폼)
- `radius-lg` : `8px` (메인 카드, 패널)

---

## 6. Elevation & Borders (입체감 및 테두리)

그림자(Shadow) 대신 선명한 테두리(Border)로 영역을 칼같이 구분합니다.
- **Card Default Shape**: 
  - `background`: `var(--surface-1)`
  - `border`: `1px solid #1E293B` (Slate 800)
  - `box-shadow`: 없음 (Flat design)
- **Card Hover Shape**:
  - `border`: `1px solid #334155` (Slate 700)
  - `box-shadow`: `0 4px 6px -1px rgba(0, 0, 0, 0.1)` (매우 미세한 뎁스만 추가)

---

## 7. UI Component Guidelines (UI 컴포넌트 실전 지침)

1. **상황 및 액션 플랜 2-Step 구조 (TakeawayBox)**
   - 화려한 색상 배경 대신 1px 얇은 왼쪽 보더(Left-border)와 매우 어두운 배경으로 구성하여 텍스트 내용 자체에 집중시킵니다.
2. **반응형 데이터 그리드**
   - 불필요한 차트보다는 "정렬 가능한 데이터 테이블(Data Table)"의 시인성을 높이는 것이 우선입니다. 
   - 선명한 얇은 회색 선으로 테이블의 행을 구분합니다.
3. **용어 한글화 및 포맷팅**
   - 차트 축, 범례 등은 반드시 한글로 명시합니다. 
   - 숫자 크기가 클 때는 `K`, `M`, `%`를 정확하게 포맷팅하여 공간을 절약합니다.
