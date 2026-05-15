# 참치왕국 신라교역 대시보드 UI/UX 및 설계 지침서 (Tuna Dashboard Guidelines)

본 문서는 신라교역(참치왕국) 대시보드 프로젝트 진행 과정에서 확립된 핵심 UI/UX 원칙, 디자인 시스템, 그리고 데이터 표현 규칙을 정리한 가이드라인입니다. 모든 신규 페이지 및 컴포넌트 개발 시 본 규칙을 무조건 준수하여 "프리미엄 전략 인텔리전스"로서의 퀄리티를 유지해야 합니다.

---

## 1. 시각적 테마 및 디자인 시스템 (Premium Aesthetics)

### 1-1. 다크 모드 및 글래스모피즘 (Dark Mode & Glassmorphism)
- **기본 테마:** 심야/작전 상황실(War Room / DEFCON) 컨셉의 다크 테마를 기본으로 합니다. 
- **투명도 및 블러 효과:** 평면적인 단색 배경 대신 깊이감을 주기 위해 반투명 배경(`rgba(15, 23, 42, 0.6)`)과 `backdrop-filter: blur(8px)`를 조합하여 글래스모피즘(Glassmorphism) 효과를 구현합니다.
- **테두리(Border):** 굵은 선 대신 빛 반사를 모방한 얇은 테두리(`border: 1px solid rgba(255, 255, 255, 0.05)`)를 사용합니다.

### 1-2. 타이포그래피 및 텍스트 그라데이션
- **텍스트 그라데이션:** 섹션 대제목과 핵심 키워드에는 화려하고 세련된 느낌을 주는 선형 그라데이션 텍스트를 적용합니다. 
  - *Code:* `background: linear-gradient(135deg, #e2e8f0, #38bdf8); -webkit-background-clip: text; color: transparent;`
- **색상 팔레트:** 일반 채도의 원색을 촌스럽게 쓰지 않습니다. Tailwind 기본 프리미엄 색상을 지향합니다.
  - Emerald (`#10b981`), Blue (`#3b82f6`), Rose (`#ef4444`), Amber (`#f59e0b`), Violet (`#8b5cf6`), Slate (`#94a3b8`) 등.

### 1-3. 인터랙션 (Micro-interactions)
- 아이템이나 카드 호버(Hover) 시 살짝 떠오르는 애니메이션 (`transform: translateY(-2px)`) 및 Glow 효과(`box-shadow`) 적용.
- 화면 전환 및 메뉴 구성에서 렌더링될 때 부드러운 전이(`transition`) 구현 원칙.

---

## 2. 정보 구조 및 내러티브 아키텍처 (Information Architecture)

### 2-1. 현황 및 액션 플랜 2-Step 구조 (TakeawayBox 형식)
대시보드상 단순 통계치 배열은 금지됩니다. 모든 지표 차트의 하단에는 데이터의 비즈니스적 통찰을 실무 언어로 해석한 요약부(`TakeawayBox`)가 반드시 위치해야 합니다.
- **[📊 현황 분석 - Situation]:** "이 차트는 무엇을 시사하는가?" (현상, 변곡점, 위기 요소 명시)
- **[⚡ Executive Takeaway / Action Plan]:** "그래서 경영진/실무진은 무엇을 해야 하는가?" (액션 아이템 도출)

### 2-2. 툴팁(Tooltip)을 통한 전문 용어 해설 (TermTooltip 사용)
전략/수산 업계 전문 용어는 직관적 이해를 돕기 위해 툴팁화합니다. 
- **기능 구현:** 아이콘(Lucide `HelpCircle` 등) 마우스 오버 시 가이드 팝업을 표시합니다.
- **[디자인 버그 방지 규칙]:** 팝업 컨테이너는 반드시 불투명 배경(`background: #1e293b`), 하이 컨트롤 대비 글꼴색(`color: #f8fafc`), 테두리 그림자, 높은 z-index 값을 가져, 뒷배경의 복잡한 차트 선과 간섭되지 않는 **완전한 가독성**을 확보해야 합니다.

---

## 3. 데이터 시각화 및 차트 렌더링 (Recharts)

### 3-1. ResponsiveContainer 적용
화면 및 디바이스 크기가 바뀌어도 그래프 레이아웃이 무너지지 않도록 Recharts 사용 시 항상 `<ResponsiveContainer width="100%" height="100%">`로 차트를 감싸야 합니다.

### 3-2. 축(Axis), 툴팁, 포맷팅 (Data Formatting 규정)
유저는 가공되지 않은 숫자를 보는 것을 선호하지 않습니다.
- 큰 숫자는 `.toLocaleString()` 처리를 하여 3자리 콤마를 찍습니다.
- 축이나 툴팁 값의 성격에 맞게 기호(`$`, `%`, `k`, `tons`)를 반드시 결합합니다. 
- *예시 Code:* `<YAxis tickFormatter={(val) => \`\${val}k\`} />`

### 3-3. 용어의 한글화 (Korean Naming Convention)
대시보드 상 모든 텍스트—특히 **인사이트 그래프의 X축, Y축, 툴팁, 범례(Legend) 등 사용자에게 노출되는 국가명, 해역명(예: WCPO), 어종명**—은 영문 원형이 아닌 **반드시 한글로 번역하거나 병기**하여 기재해야 합니다. (예: `US` → `미국` 또는 `EU` → `유럽연합`, `W.Indian` → `서인도양`). 
데이터 오브젝트(JSON) 상의 키(Key)는 영문 변수를 그대로 쓰더라도, 화면에 렌더링 될 때에는 `name="한국"` 형태로 명시적 한글 맵핑이 필수적입니다.

### 3-4. 입체적 시각화 활용
단일 데이터 라인보다 밀도있는 인사이트를 제공하기 위해 복합 차트(`ComposedChart`)를 우선 도입합니다. (예: 바 차트 + 라인차트 오버레이)

---

## 4. 레이아웃과 아이콘 (Layout & Iconography)

- **Grid Layout (2-Column Default):** 하드 코딩된 `px` 너비나 복잡한 반응형(auto-fit)을 피하고, C-Level 임원진의 가독성을 극대화하기 위해 **1열에 2개의 위젯을 크게 배치**하는 CSS Grid (`grid-template-columns: repeat(2, 1fr)`)를 기본값으로 활용합니다.
- **Lucide-React 기반 시각화:** 메인 메뉴, 카드 헤더, 탭 이름에는 관련된 컨셉의 Lucide 아이콘을 꼭 배치하여 직관성과 퀄리티를 대폭 높입니다.
