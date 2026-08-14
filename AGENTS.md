# AGENTS.md

이 저장소에서 작업하는 5개 AI 코딩 에이전트(**Claude Code · Codex · opencode go · Grok · Hermes**)를 위한
공통 지침입니다. **작업 전 반드시 이 문서를 읽고 규칙을 따르세요.**

에이전트 간 대화 컨텍스트는 공유되지 않습니다. **파일 시스템이 유일한 공유 진실**입니다.

## 에이전트 역할 분담

다섯 에이전트는 강점이 달라 담당 작업이 나뉩니다. 커밋 태그는 이 표를 따릅니다.

| 에이전트 | 태그 | 강점 | 이 저장소에서 맡을 일 |
| --- | --- | --- | --- |
| **Claude Code** | `[CC]` | harness가 깊고 멀티파일·복잡 리팩터링에 강함. 스스로 계획을 세우고 끝까지 밀어붙이는 에이전트형 | **메인 드라이버.** 아키텍처 변경, 여러 파일에 걸친 큰 작업, 룰북·ADR·`AGENTS.md` 개정, 위젯 closure 전면 감사 |
| **Codex** | `[Codex]` | GPT 계열 end-to-end 튜닝. 속도·완성도·위임형 작업에 강함 | **범위가 명확한 작업.** 데이터 동기화, PR 준비, 백그라운드 리팩터링, 빠른 프로토타입. `/goal`처럼 목표를 못박고 맡기는 방식이 잘 맞음 |
| **opencode go** | `[OC]` | 오픈소스라 모델 선택이 자유롭고 LSP 진단을 에이전트 루프에 되먹임. 반복·정밀 작업과 비용 최적화에 강함. 로컬 실행 가능 | **정밀 제어가 필요한 작업.** 타입 에러 일괄 소거, L-07 스크립트 기반 일괄 변환, 보안 민감 코드·오프라인 작업. 설정 부담이 있으니 단발성 잡무엔 쓰지 않음 |
| **Grok** | `[Grok]` | 빠른 응답, 대안 관점 | **교차 검증·세컨드 오피니언.** 다른 에이전트가 막혔을 때 다른 접근 시도, 결론 반증 |
| **Hermes** | `[Hermes]` | 운영 데이터 파이프라인에 강함. 원자료 대조·독립 리뷰를 곁들인 꼼꼼한 동기화 | **운영 데이터 동기화.** 주간보고·냉동 운반선·위판 실적 등 원자료→화면 반영과 그 검증 (실적: `/logistics` 주간보고·리퍼 31·32주차) |

- 큰 작업은 Claude Code가 계획·분해하고, 범위가 잘린 조각을 Codex·opencode go에 넘기는 흐름이 기본입니다.
- **작성자와 검증자를 분리하세요.** 자기가 짠 코드를 자기가 승인하면 자기검증 편향이 생깁니다.
  위젯·데이터 클레임 검증은 작성하지 않은 에이전트가 맡고, 판단이 갈리면 Grok에 세컨드 오피니언을 받습니다.

## 협업 패턴 (Orca 기반)

작업 성격에 따라 아래 3가지 중 하나를 고릅니다. **세 패턴 모두 에이전트마다 worktree를 분리**해
같은 브랜치 동시 작업을 피합니다.

### 1. 경쟁 실행 — 중요하거나 정답이 애매한 작업

같은 프롬프트를 **Claude Code · Codex · opencode go** 세 곳에 fan-out한 뒤,
Orca의 **diff 비교**와 **diff 주석(annotate)** 으로 검토하고 가장 나은 것을 병합합니다.

- 적합: UI 구현, 리팩터링처럼 **결과물이 여러 갈래로 나올 수 있는** 작업
- 부적합: 정답이 하나인 작업(데이터 동기화, 버그 원인 수정) — 낭비입니다
- 병합 후 `HANDOFF.md`에 **어느 안을 왜 골랐는지**를 남깁니다. Orca 주석은 다른 에이전트가 읽지 못합니다

### 2. 역할 분담 — 큰 기능 개발

worktree를 나눠 병렬 진행합니다. 기본 배치:

| 에이전트 | 담당 |
| --- | --- |
| Claude Code | 백엔드 핵심 로직 |
| Codex | API · PR 준비 |
| opencode go | 테스트 및 정밀 수정 |
| Grok | 별도 실험적 접근 |
| Hermes | 운영 데이터 동기화·원자료 대조 |

완료는 **mobile companion 알림**으로 확인하고 **순차 병합**합니다. 동시 병합 금지 — 충돌 해결 비용이
병렬 이득을 넘습니다.

### 3. 교차 검증 — 디버깅 · 리뷰

한 에이전트가 낸 diff를 Orca **diff 주석**으로 다른 에이전트에게 리뷰시킵니다.
(예: Codex가 짠 코드를 Claude Code가 검토) 위의 «작성자 ≠ 검증자» 규율을 실행하는 구체적 수단입니다.

리뷰를 시킬 땐 **«이 결론을 반증하라»** 로 지시하세요. "검토해줘"는 동의만 돌아옵니다.
의심 지점을 미리 특정해 주고, "문제없으면 그렇게 말하라 — 억지 지적은 검증을 오염시킨다"를
함께 넣으면 false positive가 줄어듭니다.

### 에이전트 구동 함정 (2026-08-14 실측)

- **작업 대상 목록은 작업할 base에서 측정하세요.** 다른 브랜치(특히 미커밋 작업이 얹힌 worktree)에서
  뽑은 파일 목록을 넘기면 개수가 안 맞습니다. 파일 목록보다 **완료 조건**(예: `0 errors, 1 warning`)을
  지시하는 편이 안전합니다.
- **opencode go 모델별 사용 한도**: `opencode-go/qwen3.8-max`가 5시간 한도에 걸리면 리셋을 기다리지 말고
  같은 provider의 다른 모델로 갈아타세요(`opencode models`로 목록 확인). 한도는 provider가 아니라
  **모델 단위**입니다. 유료 balance 전환은 사용자 결정 사항입니다.
- **`orca terminal send --interrupt`는 opencode TUI를 종료시킵니다.** 생성만 멈추지 않습니다. TUI가 죽은
  뒤 보낸 텍스트는 **셸 명령으로 실행**됩니다. 여러 줄 지시문에 셸 명령이 섞여 있으면 그대로 돌아갑니다.
  보내기 전 `orca terminal read`로 TUI 생존을 확인하세요.
- **`--for tui-idle`은 완료 신호가 아닙니다.** 에이전트가 도구 호출 한 번을 끝낼 때마다 발화합니다.
  완료 판정은 **커밋 발생**으로 하세요 (`git rev-parse HEAD` 변화를 폴링).
- **긴 지시문은 파일에 두고 경로만 넘기세요.** 모델을 갈아타거나 재기동할 때 지시문을 다시 만들지 않아도
  됩니다. 터미널에 붙여넣는 텍스트 양이 줄어 위 사고도 예방됩니다.
- **신규 worktree의 설치 방식을 확인하세요.** 이 저장소는 **npm 전용**입니다. Orca setup 훅이 pnpm으로
  설치한 사례가 있었고, 그 상태로 돌린 `npm run verify`는 CI·Vercel과 다른 것을 잽니다.
  `ls node_modules/.pnpm`이 나오면 `rm -rf node_modules && npm ci`로 다시 까세요.

## 처음 들어왔다면 (5분 온보딩)

1. **`HANDOFF.md`** — 직전 세션의 완료/다음 단계. 무엇을 할지가 여기 있습니다.
2. **`CONTEXT.md`** — 도메인 어휘 (위젯·대시보드·SIT·TAK·TelemetryBadge·5-Pillar). 용어를 표류시키지 마세요.
3. **`COMPREHENSIVE_RULEBOOK.md`** V4.2 — 종합 규칙서 (P/R/D/W/A/O/L 조항). 모든 작업의 정답.
4. **`UI_RULES.md`** — UI/UX 디자인 시스템 (Glassmorphism, 시그니처 그라디언트, 한글 7자, Recharts).
5. **`docs/adr/`** (0001~0008) — 되돌리기 어려운 결정들. 재논쟁 금지.
6. `git log --oneline -10` — 최근 작업 흐름.

## 프로젝트 개요

- **이름:** tuna-dashboard (참치왕국 / 신라교역 글로벌 무역 인텔리전스 대시보드)
- **목적:** 농·축·수산 commodity의 공급망 데이터를 실시간 API로 수집해, C레벨 의사결정용
  위젯(차트 + SIT + TAK)으로 렌더링하는 인텔리전스 대시보드.
- **기술 스택:** Next.js 16.2 (App Router) · React 19.2 · TypeScript 5.9 (strict) ·
  Tailwind CSS 4 · Recharts 3 / ECharts 6 · Supabase · Vitest 4 · Vercel (region `icn1`)

## 명령어 (Commands)

작업 후 아래가 모두 통과해야 완료로 간주합니다. 한 방에 돌리려면 `npm run verify`.

| 목적 | 명령 |
| --- | --- |
| 설치 | `npm install` |
| 개발 서버 | `npm run dev` |
| 빌드 (L-03 배포 게이트) | `npm run build` |
| 테스트 (전체) | `npm test` |
| 테스트 (단일) | `npx vitest run __tests__/<파일>.test.ts` |
| 린트 | `npm run lint` (자동 수정: `npx eslint . --fix`) |
| 타입 체크 | `npm run typecheck` |
| 전체 게이트 | `npm run verify` |
| S-Grade UI 검증 | `python scripts/check_s_grade.py <Dashboard>.tsx ...` |
| API 캐시 정책 감사 | `npm run check:api-cache` |
| 라우트 번들 예산 | `npm run check:bundle` |

`npm run verify` = lint → typecheck → test → check:api-cache → build → check:bundle.

**git hook이 이미 강제하는 것 (우회 금지):**
- `pre-push` — `scripts/check_data_imports.py` + `npm run build` 실패 시 push 차단 (L-03).
- `pre-commit` — 의미 있는 변경에 `HANDOFF.md` 갱신이 빠지면 경고 (차단은 안 함).

## 프로젝트 구조

- `app/` — Next.js App Router. commodity별 대시보드 라우트 + `app/api/` (75개 라우트).
- `components/` — 위젯·대시보드 컴포넌트 (389개). 공용: `WidgetCard` / `TelemetryBadge` /
  `TermTooltip` / `ChartPatterns`.
- `lib/` — 공용 로직. 아래 3개는 **단일 출처(SSOT)이므로 복제 금지**:
  - `lib/data/` — 데이터 인테이크 모듈. 위젯이 JSON을 볼 수 있는 **유일한 통로** (ADR 0005).
  - `lib/contracts/` — 외부 API 응답 스키마 (kcs·market·usda-fas 등).
  - `lib/chart-standards.ts` — `truncateKoreanLabel` / `truncateXAxis` / `getSmartRotation`.
- `hooks/` — React 훅.
- `__tests__/` — Vitest 유닛·계약·아키텍처 가드 테스트.
- `e2e/specs/` — tier1~4 E2E 스펙.
- `scripts/` — 일괄 리팩토링·검증 스크립트 (222개, L-07).
- `docs/adr/` — 아키텍처 결정 기록. `docs/` — 리서치·스펙 문서.
- `public/data/` — 정제된 경량 JSON(<10MB)만. 원본 데이터셋은 커밋 금지 (L-08).

경로 별칭: `@/*` → 저장소 루트.

## 아키텍처 가드 (`__tests__/architecture-guards.test.ts`가 강제)

깨면 테스트가 실패합니다. 우회하지 말고 규칙에 맞추세요.

1. `app/`·`components/`에서 JSON **직접 import 금지** → 반드시 `lib/data/` 경유.
2. `// @ts-nocheck`, `ignoreBuildErrors: true` 금지 — 빌드 게이트를 끄지 마세요.
3. KCS/WITS HS 코드는 공유 매핑에서만. 라우트별 하드코딩 금지 (L-04).
4. `telemetry status: 'LIVE'`는 **런타임 신호로 뒷받침될 때만**. 정적 import + LIVE는 위반 (L-09).
5. API 라우트 계약 테스트 커버리지 30개 이상 유지 — 새 라우트엔 계약 테스트를 함께 추가.

## 코드 스타일

- 들여쓰기: **스페이스 2칸**. import 따옴표: **작은따옴표**.
- 네이밍: 함수 camelCase, 컴포넌트·클래스 PascalCase, 상수 UPPER_SNAKE_CASE.
  컴포넌트 파일은 PascalCase(`ShrimpDashboard.tsx`), `lib/` 모듈은 kebab-case(`chart-standards.ts`).
- 함수형 컴포넌트만. 클래스 컴포넌트 금지.
- `interface` / `type` 은 기존 파일 컨벤션을 따름 (강제하지 않음).
- 클라이언트 컴포넌트는 최상단 `"use client";`.
- 주석은 한국어로 작성. 단, 사용자에게 **노출되는 문자열은 100% 한글** (L-01).

좋은 예시:

```typescript
// ✅ 인테이크 모듈 경유 + 7자 룰 + 한글 라벨 + 에러 처리
import { getMackerelData } from '@/lib/data/mackerel';
import { truncateXAxis } from '@/lib/chart-standards';

export function buildImportSeries(hsk: string): ChartPoint[] {
  if (!/^\d{10}$/.test(hsk)) throw new Error('HSK 10자리가 필요합니다');
  const rows = getMackerelData('imports');
  return rows.map((r) => ({ label: truncateXAxis(r.origin), 수입량: r.wgtT }));
}

// ❌ JSON 직접 import + 영문 라벨 + 단위 없음 + 에러 처리 없음
import raw from '../public/data/mackerel.json';
const series = raw.map((r) => ({ label: r.origin, value: r.wgt }));
```

## 위젯 작성 규칙 (요약 — 상세는 룰북 W-04)

모든 위젯은 아래 7개를 통과해야 머지됩니다.

1. `cardDesc` 1줄 (산출 방법론·출처)
2. `TelemetryBadge` 부착 — `LIVE`/`SYNCED`/`STATIC` + `syncDate` (**정직 표기**, L-09)
3. `TakeawayBox` = SIT(2~3문장, 숫자 포함) + TAK(1~2문장, C레벨 실행 지침)
4. X·Y축·범례·툴팁 한글 100%, X축 라벨 한글 7자 초과 시 truncate + Smart Rotation
5. 단위 괄호 표기 — `(원/kg)`, `(MT)`, `($/MT)`
6. Universal 5-Pillar 중 소속 기둥 명시
7. `npm run build` 로컬 통과

### Universal 5-Pillar

1. 🐟/🌾 **원료 수급** — 생산량·기후 리스크·산지 단가
2. 🏭 **가공·생산** — 가동률·수율·인건비
3. 🚢 **물류·통관** — 운송비·콜드체인·SPS
4. 📈 **판매·수요** — 점유율·소매가 전가·대체재
5. 🌱 **ESG·지속가능성** — 탄소·혼획·동물복지·바이오 업사이클링

## 알려진 함정

- **영문 잔존 (L-01)**: 사용자 노출 문자열은 100% 한글. 약어(WCPO, HS, USD 등)는 `TermTooltip` 병기.
  사후 일괄 정리 금지 — 작성 시점에 한글화.
- **가짜 LIVE 라벨 (L-09)**: 정적 JSON + `status: 'LIVE'` 조합은 P0. 아키텍처 가드가 잡습니다.
- **API 라우트 env 단독 의존 (L-10)**: `process.env.X || ''` 금지. fallback 키를 `||` 우항에 둘 것.
- **공유 parser alias import (L-11)**: production 빌드에서 catch로 빠짐. `app/api/mackerel-kcs/route.ts`의
  inline 파싱 패턴을 따르세요.
- **`isLive: boolean` 누락 (L-12)**: 라우트 응답에 `source` 문자열만 넣지 말고 `isLive`를 표준 출력.
- **5개 이상 위젯에 걸친 동일 변경 (L-07)**: 수작업 금지. `scripts/fix_<주제>.py`로 일괄 변환 → diff 검토 → 단일 커밋.
- **`components/TunaRanching.tsx`**: `TelemetryBadge` 자체 정의가 아직 남은 유일한 파일. 손대면 공용 모듈로 교체.
- **`data/`·`_archive/`·`artifacts/`는 lint 제외 대상** — 여기 코드는 검증 안 됨. 신규 코드를 넣지 마세요.

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# 배포 프로토콜

- 모든 수정은 먼저 로컬(`npm run dev`)에만 반영합니다.
- **임의로 프로덕션/라이브 채널에 배포하지 않습니다.**
- 로컬에서 여러 수정을 확인한 뒤, 사용자의 "배포", "라이브 배포" 등 **명시적 요청이 있을 때만**
  모아서 Vercel에 반영합니다.
- 파일 삭제·git history 재작성·force push는 사전 확인 필수.

# 세션 진입·종료 규율

## 세션 시작 시
1. `HANDOFF.md` 를 먼저 읽습니다.
2. `git log --oneline -10` 으로 최근 커밋 흐름을 확인합니다.
3. `CONTEXT.md` 와 `docs/adr/` 의 어휘·결정을 참조해 작업합니다.

## 세션 종료 시
1. 의미 있는 작업(파일 변경·결정·측정·분석)을 했다면 `HANDOFF.md` 의 "완료된 것" / "다음 단계" /
   "마지막 업데이트" 타임스탬프를 갱신합니다. 파일 5개+ 수정·새 모듈·룰 변경 후에는 **필수**.
2. 커밋 메시지 끝에 「에이전트 역할 분담」 표의 식별자를 붙입니다 — `[CC]` / `[Codex]` / `[OC]` / `[Grok]` / `[Hermes]`.
   **자기 태그만 사용하고 남의 태그를 쓰지 마세요.** git 이력에는 `[AG]`(Antigravity) ·
   `[OMO]`(OpenCode+OMO 실험) 태그도 남아 있습니다. **과거 기록일 뿐 현재 운영
   대상이 아니므로 신규 커밋에 쓰지 마세요.**
3. 진행 중 작업·세션 상태는 에이전트 메모리가 아닌 `HANDOFF.md` 에 남깁니다.

## 동시 작업 금지
- 같은 브랜치에 두 에이전트가 동시 작업하지 않습니다. worktree 분리 또는 시간차 작업.
- 한 큰 작업당 worktree 1개를 권장합니다. 「협업 패턴」의 경쟁 실행·역할 분담도 같은 규칙을 따릅니다.
- 병합은 **순차**로. 여러 worktree를 동시에 병합하지 않습니다.

## 도구 의존 흔적 관리
- superpowers·grill-me 등 특정 에이전트 전용 도구, Orca diff 주석은 *결정 자체*만 `HANDOFF.md` 에
  남기고 도구 호출 흔적은 남기지 않습니다 (다른 에이전트가 읽지 못함).
