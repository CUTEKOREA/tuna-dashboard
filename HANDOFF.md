# HANDOFF — 현재 작업 상태

> 🚨 **ANTIGRAVITY 공지 (2026-05-21~2026-06-04)**: ADR-0005 (Widget Intake Module) 마이그레이션 진행 중. **Tuna 33개 위젯 closure 동일 파일 작업 1~2주 일시 중단** 요청. 다른 commodity (Mackerel/Squid/Salmon/Pollock 등) 작업은 OK. 자세한 사항은 [docs/adr/0005-widget-intake-module.md](docs/adr/0005-widget-intake-module.md) 참조.

> 어느 에이전트(Claude Code / Antigravity / 그 외)에서 세션을 시작하든 이 파일을 먼저 읽으세요. 직전 세션이 끝낸 지점과 다음 단계가 적혀 있습니다.
>
> **마지막 업데이트**: 2026-05-21 (Claude Code + OMO 통합 세션 — **Stage 0/1/2.1/2.2 모두 통과 + Pollock Pilot/Wave 1 마이그레이션 9 파일 + 본 디렉터리 0 영향**)

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
| 2026-05-20 | CC | data (Phase C 외부 출처 검증 + mock 실데이터 wiring) | 45 | EUMOFA PDF는 pdftotext 필요(brew install poppler), 한국 참치액 단일값 미공개 | EUMOFA/ISSF/IMARC 직접 확인으로 4건 정확화, FishStat 실측으로 mockZeroSumData 교체. 2개 커밋(78874b9·d62a359) |
| 2026-05-20 | CC | style (Phase D GS 톤 정착 + AI tell 일괄 제거) | 75 | 첫 L-07 스크립트가 TS 코드 공백까지 잡아 rollback 1회 발생 → 한글 문맥 제한 정규식으로 재실행 | 50+ 파일에서 브래킷 라벨·영문 동격·과장 수식어·잉여현금흐름 후렴구 합계 417건 정리. TunaInsightsDashboard 14개 위젯 thesis-first 수동 재작성. 3개 커밋(6bfa990·07e8283·c97b05b) |
| 2026-05-20 | AG | analysis (참치 대시보드 S-Grade 종합 업그레이드 제안서 작성) | 20 | — | 3종 대시보드 통합 고도화, UI/UX 디자인 표준화 및 API 로드맵을 포괄하는 S-Grade 제안서 작성 완료 |
| 2026-05-20 | AG | ui-fix/refactor/debug (Tuna S-Grade 3종 업그레이드 및 빌드 안정화) | 120 | — | TelemetryBadge/chart-standards 공통화, 3종 대시보드 한글화 및 tsc/build 100% 성공 검증 |
| 2026-05-20 | AG | ui-fix/style (TunaSupplierHub S-Grade 표준화 완료) | 20 | — | OSH 위젯 패딩/TelemetryBadge/한글화 완성 및 빌드 성공 |
| 2026-05-20 | AG | ui-fix/refactor (15개 참치 위젯 S-Grade UI/UX 전면 표준화 완료) | 90 | — | 모든 참치 위젯의 텔레메트리 배지 부착, 헤더 및 테이크어웨이 패딩 레이아웃 표준화, tsc/build 검증 성공 |

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
