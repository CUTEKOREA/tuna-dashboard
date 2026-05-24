# 📋 MackerelDashboard 5-Pillar 네비게이터 도입 기획서

> **작성**: Claude Code (2026-05-24)
> **요청**: 사용자 ("Tuna처럼 고등어 페이지도 변경하고 싶다")
> **참조**: [Tuna 네비게이터 구현체](../../components/TunaDashboard.tsx#L573)
> **준수 표준**: COMPREHENSIVE_RULEBOOK.md V4.1 §6 (Universal 5-Pillar), AGENTS.md, UI_RULES.md

## 1. 현황 (As-Is) — 진단

### 1.1 구조 문제
`components/MackerelDashboard.tsx` (810 LOC, 53 위젯 참조)는 **단일 평면 스크롤** 구조:
- ❌ 5-Pillar 라벨링 부재 (Tuna는 `SECTIONS = [S1..S5]` 메타 보유)
- ❌ 밸류체인 네비게이터 UI 부재 (Tuna L573-665)
- ❌ `activePart` state 부재 — 모든 위젯이 한 번에 렌더링 → 초기 페인트 부담
- ❌ Pork/Beef 신규 dashboard의 `PILLARS` 패턴과 불일치

### 1.2 위젯 인벤토리 (26 카드 내장 + 18 외부)
**내장 26 카드** (`title:` 짝, sub 13 + main 13):
1. 실시간 수입산 vs 국내산 차익거래 레이더
2. 고등어(HS 030354) 글로벌 관세율 비교
3. 착지원가 시뮬레이터 (MFN vs FTA)
4. 고등어 유통단계별 가격·마진 구조
5. 관세청 월별 고등어 수입 실적
6. 관세청 국가별 수입 점유율
7. EU-27 고등어 수입 실적 추이
8. 글로벌 고등어 취급 시설 매핑
9. 글로벌 고등어 교역 매트릭스
10. 고등어 가공형태별 HS 분류기
11. 복합 착지원가 시뮬레이터 (노르웨이→한국)
12. 제재 우회 리스크 레이더 (OFAC/EU)
13. 노르웨이 대체 공급망 발굴 (ImportYeti)

**외부 18 컴포넌트** (`components/Mackerel*.tsx` — 일부는 dangling, 일부는 다른 dashboard 재사용):
AfricanExportROI · AltSourcingIndex · Aquaculture · Blackhole · ClimatePredictor · FeedRatio · FilletPenetration · GhanaStrategy · KoreaSupply · MacroCycle · NorwayAlt · NorwaySpread · ProcessedWidgets · SafetyPremium · Sankey · SizePremium · SpreadWinners · StorageTurnover

## 2. 목표 (To-Be)

### 2.1 핵심 목표
1. **5-Pillar 네비게이터 도입** — Tuna와 동일한 UX (5단 클릭, activePart 필터링)
2. **위젯 13개 → 5-Pillar 매핑** — 모든 위젯이 정확히 한 pillar에 귀속 (룰북 §6)
3. **(선택)** dangling 외부 위젯 18개 중 가치 있는 것 통합 검토 (별도 PR)
4. **시그니처 그라디언트 정식화** — 고등어 신규 색상 (룰북 D-04 추가 등재 필요)

### 2.2 비목표
- 위젯 SIT/TAK 텍스트 재작성 (별도 L-01 정정 큐와 분리)
- 위젯 차트 로직 변경 (구조만 정리)
- LIVE API endpoint 신설 (별도 작업)

## 3. 5-Pillar 매핑 제안 (룰북 §6 적용)

| Pillar | 라벨 | 색상 (제안) | 매핑 위젯 (내장 13) |
|---|---|---|---|
| **S1** 🐟 원료 수급 | 어획·기후·산지 | `#0891b2` (cyan-600, 등푸른 해양) | (외부) ClimatePredictor · MacroCycle · NorwayAlt · NorwaySpread · KoreaSupply · GhanaStrategy |
| **S2** 🏭 가공·생산 | 수율·마진·가공 | `#0e7490` (cyan-700) | (4) 유통단계 마진 · (10) HS 분류기 · (외부) Aquaculture · FeedRatio · ProcessedWidgets · FilletPenetration · SizePremium |
| **S3** 🚢 물류·통관 | 관세·운임·제재 | `#155e75` (cyan-800) | (2) 글로벌 관세율 · (3) MFN/FTA 착지원가 · (11) 노르웨이→한국 착지원가 · (12) OFAC/EU 제재 레이더 · (13) ImportYeti 대체 공급망 · (8) Open Supply Hub 매핑 · (9) UN Comtrade 매트릭스 · (외부) Blackhole · AfricanExportROI · Sankey |
| **S4** 📈 판매·수요 | 수입실적·시세·차익 | `#22d3ee` (cyan-400, 차익 강조) | (1) 차익거래 레이더 · (5) KCS 월별 수입실적 · (6) 국가별 수입 점유율 · (7) EU-27 수입실적 · (외부) AltSourcingIndex · SpreadWinners · StorageTurnover |
| **S5** 🌱 ESG·지속가능성 | 안전·인증 | `#a5f3fc` (cyan-200) | (외부) SafetyPremium (확장 여지: MSC·ASC 인증) |

**룰북 §6 준수**: 5 pillar 모두 충원 (S5만 외부 1건 — 추후 신규 위젯 추천 큐)
**Tuna 패턴 일치**: `SECTIONS = [{ id, num, label, title, desc, color }]` 동일 schema

## 4. 시그니처 그라디언트 (룰북 D-04 보강 제안)

룰북 D-04에 고등어 미정의. 기존 명시:
- 참치(해양) `cyan → blue`
- 갈치/새우(연안) `emerald → teal`

**제안**:
- **고등어 (등푸른생선 — 원양 + 한·일 연근해)**: `cyan-700 → sky-500` (#0e7490 → #0ea5e9)
  - 참치와 동일 cyan 계열로 "해양" 동질성 표현
  - 참치(cyan-400→blue-500)와 명도/채도 분리하여 시각 혼동 방지
  - 핵심 차익 위젯에만 강렬한 `#22d3ee` 액센트 (S4)

대안:
- **(B) `slate-500 → cyan-500`** — 한·일 연근해 약화 + 노르웨이 등푸른 강조
- **(C) `teal-600 → cyan-400`** — 갈치와 인접하지만 청록 강조

→ **권장: (A) `cyan-700 → sky-500`** (Tuna 차별 + 등푸른 정체성)

## 5. UI 컴포넌트 사양

### 5.1 네비게이터 UI (Tuna L555-665 패턴 이식)
```
┌─────────────────────────────────────────────────────────────────┐
│ 밸류체인 네비게이터 — 아래 단계를 클릭하여 탐색하세요               │
├─────────┬─────────┬─────────┬─────────┬─────────────────────────┤
│   ❶     │   ❷     │   ❸     │   ❹     │   ❺                     │
│ 원료수급 │ 가공·생산│ 물류·통관│ 판매·수요│ ESG·지속가능성          │
│ (active │         │         │         │                         │
│  글로우) │         │         │         │                         │
└─────────┴─────────┴─────────┴─────────┴─────────────────────────┘
              ↓ (S1 클릭 시 해당 pillar 위젯만 렌더링)
   [위젯 그리드: data-mobile-stack 2-Col]
```

### 5.2 인터랙션 사양
- 호버: `transform: translateY(-2px)` + 색상 글로우
- 활성: `background: ${color}12` + `border: 1.5px solid ${color}` + 글로우 바 (Tuna L613-620)
- 모바일: `data-mobile-stack` 자동 1-Col 변환 (기존 ADR 0008 codemod 작동)
- 키보드 접근성: tab 순서 1→5, Enter/Space 활성화

### 5.3 데이터 흐름
```tsx
const [activePart, setActivePart] = useState<'S1'|'S2'|'S3'|'S4'|'S5'>('S1');

const SECTIONS = [
  { id: 'S1', num: '❶', label: '원료 수급', title: '🐟 Part I — 원료 수급', desc: '어획·기후·산지 단가', color: '#0891b2' },
  { id: 'S2', num: '❷', label: '가공·생산', ... color: '#0e7490' },
  // ... S3~S5
];

// 위젯 그리드 렌더 부분에서:
{SECTIONS.find(s => s.id === activePart)?.widgets.map(...)}
```

## 6. 작업 단계 (총 ~3h)

| Phase | 작업 | 시간 | 의존성 |
|---|---|---|---|
| **Plan 0** | 사용자 컨펌 (그라디언트·매핑·dangling 위젯 처리 방침) | — | 없음 |
| **Phase 1** | `SECTIONS` 상수 + `WIDGET_MAP` 작성 | 30분 | Plan 0 |
| **Phase 2** | 네비게이터 UI 이식 (Tuna L555-665 복제 후 색상·label 교체) | 45분 | Phase 1 |
| **Phase 3** | 기존 위젯 13개에 `pillar` prop 부여 + activePart 필터 적용 | 60분 | Phase 2 |
| **Phase 4** | (선택) dangling 외부 위젯 18개 매핑 검토 + 통합 가능 4-6개 import | 45분 | Phase 3 |
| **Phase 5** | L-03 빌드 + dev 시각 검증 + HANDOFF 갱신 | 30분 | Phase 4 |
| **Phase 6** | commit + push (Phase별 commit 분리: P1 / P2+P3 / P4 / P5) | 10분 | Phase 5 |

## 7. 리스크 & 완화

| 리스크 | 영향 | 완화책 |
|---|---|---|
| **위젯 의존성 누락** — `data` state, fetch effect 등 다른 위젯 공유 | 빌드 실패 | Phase 3 전에 fetch effect 위치 확인. 공유 데이터는 dashboard root에 유지, pillar별 자식만 props로 받음 |
| **dangling 18 위젯 통합 시 layout 깨짐** | 시각 불일치 | Phase 4를 별도 PR로 분리, 시각 검증 후 머지 |
| **외부 위젯이 다른 dashboard에서도 사용** (예: Insight3Blackhole) | breaking change | grep로 사전 확인, 통합 import만 (수정 금지) |
| **모바일 5단 네비 폭 부족** | 가독성 저하 | `data-mobile-stack` 활용 (375px 미만 1-Col 자동) |
| **그라디언트 정식 등재 누락** | 룰북 위반 | Phase 1과 함께 룰북 D-04에 고등어 정식 추가 PR |

## 8. 성공 기준

- ✅ Tuna와 동일한 5단 네비게이터 UI 렌더링
- ✅ 5 pillar 모두 최소 1 위젯 (S5 외부 위젯 1개 통합)
- ✅ activePart 전환 시 위젯 그리드 즉시 갱신 (state-driven)
- ✅ L-03 `npm run build` 통과
- ✅ 모바일 1-Col 자동 stack
- ✅ 룰북 D-04에 고등어 그라디언트 등재

## 9. 후속 작업 (이번 기획 범위 밖)

1. **L-01 정정 큐 통합** — Mackerel 컴포넌트 audit 위반 (현재 0~7건/파일) 정정과 묶어 batch PR
2. **LIVE API 확장** — KAMIS 고등어(품목코드 619) + KCS HS 030354 + Eurostat SDMX (이미 endpoint 일부 존재 — `/api/eurostat`)
3. **Forensic Audit** — 79 위젯 사용자 OpenCode sprint와 연계 (이미 plan 존재)

## 10. 결정 필요 사항 (사용자 컨펌)

다음 3건만 결정해 주시면 즉시 Phase 1 착수 가능:

1. **시그니처 그라디언트**: (A) cyan-700→sky-500 권장 / (B) slate-500→cyan-500 / (C) teal-600→cyan-400 / (D) 다른 색
2. **dangling 외부 위젯 18개**: (가) Phase 4 통합 / (나) 이번엔 skip, 별도 PR / (다) 사용 안 함 (archive)
3. **위젯 매핑 변경 의향**: 위 §3 매핑표 그대로 OK or 일부 위젯 pillar 이동 희망 (예: 특정 위젯이 다른 pillar에 적합)

답변 받으면 즉시 Phase 1 → Phase 6 일괄 실행.
