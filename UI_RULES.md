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

---

## 5. Deep Sea Command V2 (2026-08-15 리디자인 표준)

> 레퍼런스: Dribbble Twisty(24190386) · Vexto(27220417) · Raktor(26864675).
> 스펙 원문: `docs/superpowers/specs/2026-08-15-dashboard-redesign-design.md`.
> 위 1~4장 규칙은 전부 유효하며, 본 장은 그 위에 얹히는 페이지 셸 표준이다.

### 5-1. 히어로 존 (페이지당 정확히 1개)

| 유형 | 적용 | 컴포넌트 |
| --- | --- | --- |
| A. Vessel Ops | /fleet /unloading | `HeroZone variant="vessel"` + `VesselTopSVG` |
| B. Live Map | /logistics | `HeroZone variant="map"` |
| C. Executive KPI | /market 및 일반 대시보드 | `HeroZone variant="kpi"` |

- 배경(이미지·지도)은 슬롯 — Grok 생성 이미지 ↔ `VesselTopSVG` 폴백이 호출부 1줄로 교체돼야 한다.
- 배경을 히어로 전체(`inset 0`)에 깔지 말 것 — KPI 행과 겹친다. 위치 제한 wrapper
  (데스크톱 우측 ~68%, 모바일 상단 밴드 opacity 0.5)가 표준. (`FleetCommandCenter` 참조)
- 경고 패널(`warning` 프롭)의 권고 줄은 기존 위젯 TAK 재사용 — 새 문구 창작 금지.

### 5-2. 타이포 계층 (웨이트 대비 250 vs 700)

- 페이지 타이틀: `--dsc-title-size`(48-64px), 웨이트 250, 히어로 위에 직접.
- KPI 주인공: `--dsc-kpi-size`, 웨이트 700, `tabular-nums`, 단위 18px 병기, **nowrap**
  (소수점 포함 9자리도 390px에서 한 줄).
- 명조·세리프 헤드라인 금지 (War Room 톤 충돌).

### 5-3. 페이지 구조

```
페이지 = HeroZone 1 + 핵심 카드 4-6 + PillTabs 계층화
```

- 탭 키는 페이지 성격에 맞게 (5-Pillar 또는 업무 구분). 기존 탭이 있던 페이지만 PillTabs로 교체.
- 핵심 카드 선정: LIVE/SYNCED 우선, C레벨 의사결정 직결 순. 나머지는 탭 뒤로 — 위젯 삭제 금지.

### 5-4. 모션 (전부 `prefers-reduced-motion` 존중)

`--dsc-stagger`(60ms 진입 스태거) · `--dsc-breathe`(3.6s 발광 숨쉬기) · `--dsc-lift`(-2px 호버) ·
KPI 카운트업 1.4s (reduce 시 즉시 표시).

### 5-5. 발광 액센트 = 살아있는 데이터

- `--dsc-glow-*`는 **데이터 연동 하이라이트 전용** (해치 발광 = 적재/하역 비율, LIVE 펄스, 활성 탭).
- 장식 목적 발광 금지. `VesselTopSVG`는 intensity 0이면 발광하지 않는다.

### 5-6. 전 메뉴 세션 잠금

- 모든 페이지는 Next.js `proxy.ts`의 서버 검증을 거쳐야 하며, `DASHBOARD_OWNER_EMAIL`과 정확히 일치하는 구글 계정만 접근한다.
- 클라이언트측 게이트다 — 진짜 인증이 아니며 Supabase 로그인과 별개 층. 신규 메뉴는
  registry에 추가되는 순간 자동으로 잠금 대상이 된다.
