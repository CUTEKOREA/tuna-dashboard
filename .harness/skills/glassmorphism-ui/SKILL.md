---
name: glassmorphism-ui
description: "Silla Co. 글라스모피즘 UI 표준 가이드. 대시보드 위젯의 시각적 디자인, 차트 렌더링, 타이포그래피, 컬러 팔레트, 반응형 레이아웃 규칙을 정의한다. '디자인 수정', 'UI 개선', '스타일 변경', '차트 포맷' 등의 요청 시 참조."
---

# Glassmorphism UI — Silla Co. 디자인 시스템

> 상세 규칙은 Knowledge Item에서 참조:  
> `~/.gemini/antigravity/knowledge/tuna_dashboard_guidelines/artifacts/UI_RULES.md`

이 스킬은 KI의 UI 규칙을 대시보드 하네스에 통합한 래퍼입니다.

## 핵심 규칙 요약

### 1. 글라스모피즘 (Dark Mode)
```css
background: rgba(15, 23, 42, 0.6);
backdrop-filter: blur(8px);
border: 1px solid rgba(255, 255, 255, 0.05);
```

### 2. 텍스트 그라데이션 (제목)
```css
background: linear-gradient(135deg, #e2e8f0, #38bdf8);
-webkit-background-clip: text;
color: transparent;
```

### 3. 컬러 팔레트
- Emerald `#10b981` / Blue `#3b82f6` / Rose `#ef4444`
- Amber `#f59e0b` / Violet `#8b5cf6` / Slate `#94a3b8`

### 4. 차트 필수 규칙
- `<ResponsiveContainer width="100%" height="100%">` 필수
- 큰 숫자 `.toLocaleString()` + 단위 기호
- **국가명/해역명 한글 필수**
- 복합 차트(ComposedChart) 우선

### 5. 정보 구조
- TakeawayBox 2-Step: `[📊 현황 분석]` + `[⚡ Executive Takeaway]`
- InfoTooltip: `title`, `methodology`, `dataSource` 필수
- 전문 용어 → TermTooltip 래핑

### 6. 레이아웃
- CSS Grid: `repeat(auto-fit, minmax(300px, 1fr))`
- Lucide-React 아이콘 필수
- 호버 애니메이션: `transform: translateY(-2px)` + glow
