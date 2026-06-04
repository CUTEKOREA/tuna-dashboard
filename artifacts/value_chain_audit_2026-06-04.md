# value-chain(참치) 위젯 신뢰도 감사 — 2026-06-04 (하네스 end-to-end)

> **작성:** 2026-06-04 Claude Code 세션 `[CC]`
> **범위:** [components/TunaDashboard.tsx](../components/TunaDashboard.tsx) value-chain closure 전체
> **하네스:** `orchestrate` 스킬 + `~/.claude/agents/`(inventory-extractor·adversarial-reviewer·source-verifier) + `codex-verify`(vendor.sh `ask_codex`). **황민호 하네스 영상 적용 후 첫 풀 end-to-end 실전.**
> **선행:** [value_chain_audit_2026_05_28.md](./value_chain_audit_2026_05_28.md) (120위젯, 평균 78.7 B) — 그 정정권고 대부분 이미 적용됨.

---

## Executive Summary

### 📊 인벤토리 (Phase 1)
- **128 WidgetCard** (직전 120 → **+8**). 증가분은 audit 도구 결함 수정으로 새로 포착된 것:
  - `extract_value_chain_widgets.py` glob을 import closure 기반으로 수정 → `Ffa*` 6개(WCPO수급·자원건강도·공급집중·가공캐파·VDS·ENSO) 포착
  - 동적렌더 파서 추가 → `TunaRFMOLibrarian`·`TunaUsdaKoreaSeafood` 2개 복구
  - **즉, 직전 audit들은 이 8개를 보지 못한 채 진행됐음** (도구 맹점).

### 📊 4-Axis 점수 (Phase 2)
- 평균 **78.6 / 100 (B)** — A 41 / B 45 / C 30 / D 7 / DYN 5(동적·정적채점불가)
- ⚠️ **스코어러 한계 명시**: 신규 작성한 `score_value_chain_4axis.py`는 정적 채점이라 ① 템플릿 리터럴 cardDesc(`cardDesc={\`...${HS_LABEL_KR['...']}...\`}`)를 완전히 못 읽고 ② 동적 `.map()` 위젯은 런타임 주입이라 채점 불가. → **D 7건 중 Us*(미국 통관) 위젯들은 cardDesc에 US Census·USITC·USTR 1차출처가 명확함에도 템플릿 파싱 한계로 false-D.** 단일-스코어러 결과 맹신 금지(하네스 적대적검증 원칙). 실제 정정은 교차검증 통과분만.

### ✅ 적용된 정정 (Phase 6-7) — 4건, 모두 Codex 교차검증(정당·EDIT)
NotebookLM(AI 워크스페이스 도구)을 공신력 출처처럼 표기한 것을 제거하고 실재 1차출처만 보존 (핵심함정 #4):

| 파일 | 위치 | 변경 |
|---|---|---|
| TunaIntelInsightsB4.tsx | L161 | `…NotebookLM EU·스페인 참치 가공사 노트북 · ANFACO…` → `Atuna May 2026 News 6 sources · ANFACO-CECOPESCA 산업 통계` |
| TunaIntelInsightsB4.tsx | L287 | `NotebookLM 가나 서아프리카 참치 노트북 · WASTE2TASTE · MSC` → `WASTE2TASTE 프로젝트 · MSC 양식 표준` |
| PetFoodDashboard.tsx | L229·L504 | `NotebookLM 펫푸드 포렌식 리서치 (UUID)` → `펫푸드 산업 리서치 종합 (기업 IR·학술 기반)` |

### ✅ 직전(5/28) 권고 — 이미 적용 확인
- petfood API 허위라이브 → `ITC TradeMap 기반 추정치 (STATIC)` ✅
- compliance `SANCTIONS_API_LIVE` → 제거됨 ✅
- tuna-ranching `SYNCED` → `STATIC` ✅

### ⏭ 범위 밖 (스코프 규율 — 다른 commodity audit 대상)
NotebookLM 출처 표기가 **타 품목 파일**에도 존재(ChickenThaiInsightsA·PollockSupplyMacro·PollockProcessingMargin·ColdStorage·Cashew·Shrimp·Mackerel). 참치 closure가 아니므로 이번 정정 제외 → 해당 품목 audit에서 처리 권고.

### 🔍 후속 검토 (미정정, 신뢰도 낮음)
- `app/api/oec/route.ts` 2023 데이터 grade — 직전 audit '표현정정' 권고. OEC 글로벌 무역은 2023이 최신일 수 있어 보류(별도 확인).
- `TunaRanching.tsx:35` 인라인 TelemetryBadge 타입 소문자(`'live'|'synced'|'static'`) — 룰북 대문자 표준과 불일치(인라인 복사본 10개 중 하나, AGENTS.md 기지 함정). 타입 정의라 렌더 동작엔 무해 → 인라인 TelemetryBadge 단일모듈화 시 일괄 처리 권고.
- 스코어러 템플릿-리터럴 파싱 보강 필요(false-D 제거).

---

## Phase별 실행 (하네스 end-to-end)
- P0 베이스라인 → P1 인벤토리(inventory-extractor, 128) → P2 4-Axis(score_value_chain_4axis.py 신규) → P3 API 재점검(5/28 항목 적용 확인) → P4 클레임(NotebookLM 식별) → **P5 codex-verify(`ask_codex`로 정정案 교차검증 → 정당·EDIT)** → P6 결정 → P7 정정 적용 + 본 보고서 → P8 빌드게이트→배포(사용자 확인).

## 배포 주의 (Phase 8)
- **배포 대상은 2개 파일만**: `components/TunaIntelInsightsB4.tsx`, `components/PetFoodDashboard.tsx`.
- ⚠️ 워킹트리에 **이번 audit과 무관한 기존 변경 다수**(app/api/webhooks/unloading, app/api/unloading-db, components/PollockDraftInsights, components/ReeferMovement, .agents/* 등) — `git add`에 **절대 포함 금지**. 명시적 파일만 add.
- scripts/·artifacts/는 배포(Vercel build)에 영향 없음.

## 산출물
- 본 보고서 · `value_chain_widget_inventory.json`(128) · `value_chain_4axis_scores.csv`(128) · `scripts/score_value_chain_4axis.py`(신규)
