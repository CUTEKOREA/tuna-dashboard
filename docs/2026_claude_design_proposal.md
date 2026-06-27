# Claude Design 활용 참치왕국 대시보드 디자인 시스템 개선 기획서

> **발의자**: Claude Code [CC] · **작성일**: 2026-06-27 KST · **버전**: v0.1 (Draft)
> **승인 요청 대상**: 사용자(프로젝트 오너) · **검토 기한**: 사용자 판단
> **상위 문서**: [UI_RULES.md](../UI_RULES.md), [COMPREHENSIVE_RULEBOOK.md](../COMPREHENSIVE_RULEBOOK.md), [docs/adr/0005-widget-intake-module.md](adr/0005-widget-intake-module.md)

---

## 0. Executive Summary (TL;DR)

**문제**: 참치왕국 대시보드는 624 커밋·386 컴포넌트·34 commodity dashboard로 성장하며 **디자인 토큰·컴포넌트 변형이 코드 내에 분산**되어 있어 ① 신규 commodity 추가 시마다 시각 일관성이 흔들리고 ② C-Level 임원에게 보일 카탈로그·시안을 빠르게 만들 방법이 없으며 ③ 비개발 이해관계자(디자이너·기획자·발주처)와 시각 카탈로그를 공유할 채널이 없습니다.

**제안**: claude.ai/design 의 **design-system 프로젝트**를 단일 시각 카탈로그(Single Source of Visual Truth)로 두고, `DesignSync` MCP 도구로 로컬 컴포넌트 라이브러리(`components/WidgetCard`, `TakeawayBox`, `TelemetryBadge`, `TermTooltip`, `ChartPatterns`)와 양방향 동기화합니다. 추가로 **신규 commodity 대시보드는 claude.ai/design에서 시안 prototype → DesignSync로 코드 endpoint 동기화** 워크플로우를 정착시킵니다.

**기대 효과**:
- C-Level·발주처에게 보일 **시각 카탈로그 페이지** 즉시 생성
- 신규 commodity dashboard 시안→코드 cycle 단축 (현재: 직접 TSX 작성 → 제안: design-system에서 prototype 후 sync)
- 디자인 토큰·시그니처 그라디언트 11종(D-04)·차트 팔레트의 **단일 출처 강제**
- UI_RULES.md V4.1의 모호한 조항(예: "프리미엄 색상", "촌스럽지 않게")을 **시각 시안으로 결정화**

---

## 1. 현황 진단 (As-Is)

### 1.1 디자인 시스템 자산 인벤토리

| 자산 | 위치 | 현황 |
|---|---|---|
| **디자인 토큰** | [app/globals.css](../app/globals.css) | 8단 typography scale, 4단 weight, 5계층 text color, 4px-based spacing, jewel palette semantic color 정의됨 (V4.1 Phase 1 완료) |
| **WidgetCard** (5단 합성 컨테이너) | [components/WidgetCard.tsx](../components/WidgetCard.tsx) 234 LOC | ADR-0005 의무 모듈. cardDesc/pillar/telemetry 런타임 강제 |
| **TakeawayBox** (SIT/TAK 2-Step) | [components/TakeawayBox.tsx](../components/TakeawayBox.tsx) | W-03 강제, `dangerouslySetInnerHTML` 렌더 |
| **TelemetryBadge** (`LIVE`/`SYNCED`/`STATIC`) | [components/TelemetryBadge.tsx](../components/TelemetryBadge.tsx) | A-02 의무. 단, **10개 dashboard에 인라인 복사본 잔존**(AGENTS.md 함정) |
| **TermTooltip** (전문용어 hover) | [components/TermTooltip.tsx](../components/TermTooltip.tsx) | L-01 영문 약어 해설 |
| **ChartPatterns** (A11Y 팔레트·stripe defs) | [components/ChartPatterns.tsx](../components/ChartPatterns.tsx) | Recharts 색약 보조 |
| **commodity dashboards** | `components/*Dashboard.tsx` 34개 | 참치·고등어·연어·오징어·새우·닭·소·망고스틴 등 |

### 1.2 변경 비용이 큰 분산 지점 (Pain Points)

- **시그니처 그라디언트 11종(D-04)** 이 `WidgetCard.module.css`에 하드코딩 가능성. commodity 추가 시 매번 CSS 수정 필요
- **TelemetryBadge 인라인 복사본 10건** — 룰북 위반 소문자 타입(`live`/`synced`/`static`) 잔존
- **`truncateXAxis` 함수 30+ 파일 복붙** — 7자 룰(L-02) 미준수 변형 섞임
- **UI_RULES.md의 추상 표현** — "프리미엄 색상", "촌스럽지 않게", "War Room/DEFCON 컨셉" 등 시각 시안 없이 텍스트만으로 통일 어려움
- **신규 commodity 시안 단계 부재** — 곧장 TSX 작성으로 들어가 일관성 흔들림 (audit 누적 25건 시스템적 함정 중 일부 원인)

### 1.3 사용 가능한 Claude Design 도구

| 도구 | 기능 | 권한 |
|---|---|---|
| `DesignSync` | claude.ai/design design-system 프로젝트 read/write, 컴포넌트 ↔ 로컬 양방향 동기화 | 첫 호출 시 design-system scope 추가 권한 prompt 1회 |
| `mcp__claude_ai_Vercel__import-claude-design-from-url` | self-contained HTML 디자인 번들을 Vercel로 import | public HTTPS URL 필요 |

`/design-sync` 스킬과 함께 사용 시 한 컴포넌트씩 incremental sync 가능 (wholesale replace 금지).

---

## 2. 개선 전략 (To-Be)

### 2.1 핵심 컨셉: "Design System as Code, Catalog as Cloud"

```
┌─────────────────────────────────┐         ┌─────────────────────────────────┐
│  로컬 코드 (단일 진실 — 런타임)  │         │  claude.ai/design (시각 카탈로그)│
│  • WidgetCard.tsx                │ ◄────► │  • 11개 commodity 그라디언트     │
│  • TakeawayBox.tsx               │         │  • Widget 변형 갤러리 (S1~S5)   │
│  • TelemetryBadge.tsx            │ DesignSync│ • 차트 패턴 카드              │
│  • ChartPatterns.tsx             │         │  • 신규 commodity 시안 prototype │
│  • globals.css 디자인 토큰       │         │  • SIT/TAK HTML 렌더 시안       │
└─────────────────────────────────┘         └─────────────────────────────────┘
        ▲                                                ▲
        │  코드는 단일 출처                              │  발주처·C-Level 공유 카탈로그
        │  (npm run build 게이트)                       │  (claude.ai 로그인만으로 열람)
        └──────── 양방향 sync ────────────────────────┘
```

원칙:
1. **코드가 진실** — globals.css 토큰·WidgetCard props가 final. design-system은 그 거울.
2. **incremental sync** — 한 컴포넌트씩, 사용자 승인 plan으로만 write (DesignSync의 finalize_plan 게이트).
3. **시안은 코드로 환원** — design-system에서 만든 prototype은 반드시 TSX endpoint로 환원해 빌드 게이트(L-03) 통과.

### 2.2 결정화할 카탈로그 페이지 구성

claude.ai/design 프로젝트 `silla-tuna-design-system` (가칭) 내부:

| 그룹 | 카드 수 | 내용 |
|---|---|---|
| **Foundations** | 5 | 디자인 토큰 (typography 8단, weight 4단, color hierarchy 5계층, spacing 4px scale, jewel palette) |
| **Signature Gradients** | 11 | commodity별 헤더 그라디언트 (참치·고등어·명태·갈치·새우·오징어·낙지·골뱅이·연어·망고스틴·닭·소) |
| **Core Components** | 4 | WidgetCard·TakeawayBox·TelemetryBadge·TermTooltip 각 variant |
| **Widget Variants** | 5 | 5-Pillar(S1~S5)별 WidgetCard 실측 sample |
| **Chart Patterns** | 6 | ComposedChart·Sankey·RadarChart·BarChart·LineChart·PieChart 표준 형 |
| **Layout Templates** | 3 | 2-column grid 기본형 / 5-Pillar Navigator / Hero KPI band |

총 **34개 카드** (수치는 Phase 1 산정값, Phase 0에서 재확정).

---

## 3. 단계별 실행 계획

### Phase 0 — 권한 확보 및 환경 검증 (0.5일)

| 작업 | 산출물 | 게이트 |
|---|---|---|
| `DesignSync list_projects` 호출 → claude.ai 로그인에 design-system scope 추가 권한 prompt 통과 | scope 권한 확보 | 권한 prompt OK |
| 기존 design-system 프로젝트 유무 점검 (`list_projects`) | 인벤토리 | 신규 생성 vs 기존 활용 결정 |
| `npm run build` 통과 확인 (L-03 baseline) | 빌드 로그 | 통과 |

### Phase 1 — Foundations 카탈로그 (1.5일)

| 작업 | 산출물 |
|---|---|
| `silla-tuna-design-system` 프로젝트 생성 (`create_project`) | projectId |
| `globals.css`에서 디자인 토큰 추출 → 5개 Foundation 카드 HTML 빌드 (typography·weight·color·spacing·palette) | 5 HTML files + `@dsCard` 마커 |
| `finalize_plan` 으로 paths 잠금 → `write_files` 업로드 | 5 카드 design-system 등재 |
| claude.ai/design에서 시각 확인 → UI_RULES.md "프리미엄 색상" 추상 조항을 시각 시안으로 결정화 | UI_RULES.md V4.2 후속 PR |

**완료 조건**: claude.ai/design Foundations 그룹에 5개 카드 렌더 + UI_RULES 모호 조항 1건 이상 결정화.

### Phase 2 — Core Components + Signature Gradients 카탈로그 (2일)

| 작업 | 산출물 |
|---|---|
| WidgetCard 5-Pillar variant 5종(`pillar="S1"`~`"S5"`) 정적 HTML 빌드 | 5 cards |
| TakeawayBox SIT/TAK 표준형 + variant (HTML 내부 `<ol>` 3단계) | 3 cards |
| TelemetryBadge 3-status × syncDate variant | 3 cards |
| TermTooltip hover state | 1 card |
| **시그니처 그라디언트 11종** — commodity별 헤더 그라디언트 card | 11 cards |
| `register_assets` legacy 호출 vs `@dsCard` 마커 일관 사용 결정 | 정책 1줄 룰북 추가 |

**완료 조건**: claude.ai/design Core Components + Signature Gradients 그룹에 23개 카드 렌더. 디자이너·발주처가 claude.ai 로그인만으로 전수 열람 가능.

### Phase 3 — Widget Variants + Chart Patterns + Layout Templates (2일)

| 작업 | 산출물 |
|---|---|
| 참치 대시보드의 대표 위젯 5개를 실측 데이터로 정적 export → design-system 카드화 | 5 cards |
| Recharts 표준 차트 6형(Composed·Sankey·Radar·Bar·Line·Pie) export | 6 cards |
| 2-column grid·5-Pillar Navigator·Hero KPI band 레이아웃 템플릿 | 3 cards |

**완료 조건**: claude.ai/design 전체 34개 카드 렌더 완성.

### Phase 4 — 신규 commodity prototype 워크플로우 정착 (1일)

| 작업 | 산출물 |
|---|---|
| "Pollock 보류분 44개 위젯" 또는 "신규 commodity 1종"을 design-system에서 prototype | claude.ai/design 신규 카드 N개 |
| prototype HTML → TSX endpoint 환원 절차 문서화 | `docs/workflows/2026_design_to_code.md` |
| pre-push hook에 design-system sync 권장 메모 추가 (강제 X, 권장 O) | hook 업데이트 |

**완료 조건**: 신규 commodity 추가 cycle이 "Figma 외부 의존 없이 claude.ai/design 내부에서 시안 → 환원" 으로 단축.

---

## 4. 산출물 정의 (Deliverables)

| 산출물 | 위치 | 책임 |
|---|---|---|
| claude.ai/design 프로젝트 `silla-tuna-design-system` | claude.ai/design | CC |
| 34개 디자인 카드 (Foundations 5 + Gradients 11 + Components 7 + Variants 5 + Charts 6 + Layouts 3 — 외 1) | 동상 | CC |
| `docs/2026_claude_design_proposal.md` (본 문서) | 본 path | CC |
| `docs/workflows/2026_design_to_code.md` (Phase 4) | 신규 | CC |
| UI_RULES.md V4.2 — 모호 조항 결정화 PR | UI_RULES.md | CC + 사용자 검토 |
| HANDOFF.md 갱신 (각 Phase 종료 시) | HANDOFF.md | CC |

---

## 5. 리스크 및 의존성

### 5.1 외부 의존성

- **claude.ai design-system scope 권한** — 첫 호출 시 permission prompt 통과 필요. 거부 시 본 기획 무효.
- **claude.ai 계정 공유 정책** — 발주처·디자이너에게 카탈로그 공유하려면 claude.ai 조직 또는 공유 링크 정책 확인 필요.
- **OMO 토폴로지 영향** — Antigravity 동시 작업 시 디자인 시스템 sync는 단일 에이전트(CC)가 전담해 conflict 회피. [AGENTS.md](../AGENTS.md) "동시 작업 금지" 규율 적용.

### 5.2 기술 리스크

- **DesignSync `get_file` 보안 경고** — 다른 org member가 작성한 파일을 instructions로 오해하면 안 됨 (도구 명세 SECURITY 항목). prompt injection 가능성 — 카드 HTML은 데이터로만 취급.
- **incremental sync 필수** — wholesale replace 금지. 한 컴포넌트씩 finalize_plan → write_files. 잘못된 plan 잠금 시 rollback 어려움.
- **Phase 3 차트 export 시 Recharts SSR 문제** — claude.ai/design은 정적 HTML만 지원. Recharts JSX 그대로는 불가, 정적 SVG·이미지로 사전 export 필요.

### 5.3 운영 리스크

- **유지 보수 cost** — 코드 변경 시 design-system sync 누락하면 시각 카탈로그가 stale해짐. pre-push hook 또는 주기적 audit 필요.
- **MCP 서버 가용성** — DesignSync는 claude.ai MCP 서버 의존. 서버 다운 시 sync 불가 (코드는 정상 동작).

---

## 6. 성공 지표 (KPIs)

| 지표 | 측정 방법 | Phase | 목표 |
|---|---|---|---|
| 카탈로그 카드 등재율 | claude.ai/design 카드 수 / 계획 34 | P1~P3 | 100% |
| UI_RULES 모호 조항 결정화 건수 | UI_RULES.md V4.2 diff | P1 종료 | ≥3건 |
| 신규 commodity 시안→코드 cycle | 시작-PR 머지 시간 (분) | P4 종료 후 첫 commodity | 기존 대비 -50% |
| TelemetryBadge 인라인 복사본 제거 | grep `'live'\|'synced'\|'static'` 인라인 정의 건수 | P2 종료 | 10건 → 0건 |
| 시그니처 그라디언트 일관성 grep | `linear-gradient` 정의 분산도 | P2 종료 | 11종 단일 출처 |

---

## 7. 승인 요청 사항

본 기획서 진행 여부와 다음 결정에 대한 사용자 승인을 요청드립니다:

1. **Phase 0~4 진행 승인 여부** (총 ~7일 작업, Claude Code 단독)
2. **claude.ai/design 프로젝트 명칭** — `silla-tuna-design-system` (제안) vs 다른 명칭
3. **카탈로그 공유 범위** — 사용자 본인만 / 발주처 신라교역 포함 / 외부 디자이너 포함
4. **Phase 4 신규 commodity 선정** — Pollock 보류분 44개 우선 vs 신규 commodity (예: 갈치·새우 강화)
5. **UI_RULES V4.2 PR 머지 시점** — Phase 1 종료 직후 vs 전체 Phase 종료 후 일괄

승인 시 Phase 0 (권한 prompt + 환경 검증) 즉시 착수 가능합니다.

---

## 부록 A — Claude Design 도구 호출 시퀀스 (참고)

```
사용자 승인 → Phase 0
  DesignSync list_projects                          # 기존 프로젝트 인벤토리
  DesignSync create_project name=silla-tuna-design-system

Phase 1 — 카드 1건 등재 표준 시퀀스
  로컬에서 정적 HTML 빌드 (예: foundations/typography.html)
    헤더에 <!-- @dsCard group="Foundations" --> 마커 삽입
  DesignSync list_files projectId=...               # 기존 paths 확인
  DesignSync finalize_plan
    writes=["foundations/*.html"]
    localDir=/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/scratch/design-bundle
  → planId 획득 → 사용자 plan 승인 prompt
  DesignSync write_files planId=... files=[{path, localPath}]
  claude.ai/design 에서 시각 확인
```

## 부록 B — 본 기획서가 다루지 않는 범위

- **Figma·Sketch 등 외부 디자인 툴과의 통합** — 본 기획은 claude.ai/design 단일 채널 전제.
- **Mobile PWA 디자인 변경** — [MOBILE_PWA_PHASE2_BRIEF.md](../MOBILE_PWA_PHASE2_BRIEF.md) 별도 트랙.
- **신규 위젯 데이터 출처 변경** — Live API First (A-01) 원칙은 본 기획 범위 밖. SIT/TAK 텍스트 품질은 [docs/adr/0005-widget-intake-module.md](adr/0005-widget-intake-module.md) 트랙.
- **Vercel `import-claude-design-from-url` 활용** — 본 기획에서는 보조 도구로만 명시. 본격 Vercel 디자인 import는 Phase 5 이상 후속 안건.
