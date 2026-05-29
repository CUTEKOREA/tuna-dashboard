# 🥜 캐슈너트 (Cashew, Anacardium occidentale) Audit Report

**일자:** 2026-05-29
**Agent:** Claude Opus 4.7 [CC] + WebSearch (11회)
**범위:** 3 TSX (CashewStrategy 570l 핵심 + Intelligence 95l + Cartoon 108l) + 1 API + 1 JSON (39 위젯)
**HS Codes:** 0801.32 (in-shell) / 0801.31 (kernel)
**시그니처 그라디언트:** (전용 미정 — 농산물 후속 정의 권장)
**농산물 첫 audit** (수산물 10 + 축산물 1 + 농산물 1)

---

## 1. 사전 인벤토리

| 카테고리 | 수량 |
|---|---|
| TSX 컴포넌트 | 3 (Strategy·Intelligence·Cartoon) |
| WidgetCard | 3 (CashewStrategy만 보유) |
| API 라우트 | 1 (app/api/cashew/route.ts) |
| JSON 데이터 | cashew_data.json (39 위젯 + KPI) |
| 라이브 페이지 | `/cashew` (200) |

---

## 2. 4-Axis Forensic Audit

### 🚨 핵심 발견 — L-09 시스템적 함정 27번째 누적

**`app/api/cashew/route.ts`가 정적 JSON 로드 후 `"실시간 텔레메트리 데이터 주입 (오버라이드)"` 주석과 함께 4개 위젯에 하드코딩 데이터 주입.**

```typescript
// 정정 전 (정직성 위반)
// 2. 신규 위젯용 실시간 텔레메트리 데이터 주입 (오버라이드)
data.d_vietnam_paradox = [
  { year: "2021", exportVolume: 57, importVolume: 280 },  // ← 하드코딩
  ...
];
```

→ 룰북 L-09 위반. **참치 1 · 고등어 1 · 오징어 8 · 갈치 6 · 연어 9 · 골뱅이 1 · 캐슈 1 = 누적 27건**.

### Mock 트랩 (위젯 코드)

| 패턴 | 결과 |
|---|---|
| Math.random | 0건 ✅ |
| isLive: true 하드코딩 | 0건 ✅ |
| LIVE 라벨 + JSON import | 0건 (위젯) ✅ |
| 영문 잔여 | 10건 (모두 API/기관 약어 — L-01 화이트리스트 허용) |

### TSX 진단

| 파일 | lines | WidgetCard | telemetry |
|---|---|---|---|
| CashewStrategy.tsx | 570 | 3 | 1 (2건 누락) |
| CashewIntelligence.tsx | 95 | 0 | - |
| CashewCartoon.tsx | 108 | 0 | - |

영문 잔여 10건 대부분 라우트 상태 표시용 약어 (FAOSTAT, KCS API, KAMIS API, DART API, MFDS API, VINACAS, USDA FAS, World Bank, JRC/EFI) — 룰북 L-01 화이트리스트.

---

## 3. 정정 (3건)

| # | 파일 | 정정 | 카테고리 |
|---|---|---|---|
| 1 | `app/api/cashew/route.ts` | "실시간 텔레메트리 데이터 주입" → "정적 fallback 오버라이드 (L-09 정직)" | **P0 (L-09)** |
| 1 | 동일 | `_metadata: { isLive: false, status: "STATIC", source: "정적 JSON + fallback 오버라이드" }` 추가 | P0 |
| 2 | 출처 아카이브 | docs/2026_cashew_industry_sources.md 신설 (14건) | P1 |

CashewStrategy.tsx telemetry 누락 2건은 prop multi-line 패턴이라 정규식 자동 부여 실패. 별도 작업.

---

## 4. 4-Axis 점수 변화 (추정)

| Axis | Before | After |
|---|---|---|
| 출처 신뢰도 | 80 (VINACAS·FAOSTAT 표기) | 88 (출처 14건 보강) |
| 데이터 신선도 | 75 | 85 (2026 출처) |
| 검증 가능성 | 65 (허위 "실시간" 표기) | 85 (L-09 정직) |
| 통합 완성도 | 70 | 78 |
| **평균** | **72.5** | **84** ✅ S-Grade |

---

## 5. Multi-Agent 활용

| 에이전트 | 호출 | 효과 |
|---|---|---|
| Claude Opus 4.7 | 전체 | L-09 27번째 함정 즉시 발견 + 정정 |
| WebSearch | 11회 | 출처 14건 (VINACAS·서아프리카·EUDR) |
| Antigravity / Codex / Grok | **0회** | 명확한 패턴 |

---

## 6. 누적 12 commodity 비교

| Commodity | 위젯 | 정정 | 4-Axis |
|---|---|---|---|
| 참치~골뱅이 (수산 10) | 703 | 203 | 78.6 → 88.2 |
| 닭고기 (축산물 1) | 18 | 2 | 81 → 85 |
| **캐슈너트 (농산물 1)** | **42** | **3** | **72.5 → 84** |
| **누계** | **763** | **208** | **78.7 → 88.0** |

---

## 7. 핵심 인사이트 (commodity 카테고리별 패턴)

| 카테고리 | L-09 함정 발견율 |
|---|---|
| **수산물 10건** | 26건 (평균 2.6건/commodity) |
| **축산물 1건** | 0건 |
| **농산물 1건** | 1건 (캐슈) |

→ **수산물이 가장 시스템적 함정 누적률 높음**. 농산물·축산물은 audit 부담 낮음.

캐슈너트의 1건 L-09는 수산물 패턴 (`route.ts` 정적 데이터 + "실시간" 표기)과 동일.

---

## 8. 잔존 개선

1. CashewStrategy 위젯 telemetry 2건 부여 (multi-line prop 대응)
2. JSON v1 39 위젯의 telemetry/pillar 메타 부여
3. EUDR 캐슈 차기 확대 시 ESG 위젯 신설
4. VINACAS 라이브 API 연동 (현재 정적 JSON only)
