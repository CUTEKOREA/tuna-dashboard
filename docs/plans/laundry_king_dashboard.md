# 세탁 인텔리전스 대시보드 기획서 (가칭 `/laundry`)

> **작성:** 2026-08-01 KST [CC]
> **상태:** 기획 초안 (구현 착수 전, 확정 필요 결정 4건 있음)
> **소스 채널:** 유튜브 `세탁왕` — https://www.youtube.com/channel/UCbZgEt3x0FNp7aTEP-xIFEw
> **관련:** ADR 0001(5-Pillar) · ADR 0005(Widget Intake) · ADR 0007(Librarian) · ADR 0008(Dashboard-level Pattern) · 룰북 V4.2 L-01/L-09/L-10/L-12

---

## 0. 먼저 짚을 전제 (읽고 시작하세요)

1. **채널 실물 확인 미완.** 검색으로 `세탁왕` 채널(`UCbZgEt3x0FNp7aTEP-xIFEw`)을 특정했으나, YouTube가 자동 조회를 403으로 차단해 **영상 목록·업로드 주기·주제 분포를 실측하지 못했습니다.** 동명 유사 채널(세탁쟁이·세탁예술가·거성세탁소·판돌이와 냥이의 홈세탁소)이 다수 존재합니다. → **Phase 0에서 채널 URL 확정 후 실측**하며, 본 기획서의 위젯 인벤토리는 "세탁 도메인이 커버해야 할 축"을 기준으로 설계했고 실제 영상 분포에 따라 Phase 1에서 가감합니다.
2. **본 대시보드는 남의 콘텐츠를 재료로 씁니다.** 기존 commodity 대시보드는 공공 API(KCS·FAO·USDA)가 원천이라 인용 이슈가 없었지만, 이번은 특정 창작자의 저작물입니다. 요약·데이터화는 인용 범위로 가능하나 **자막 원문 대량 전재는 금지**, 모든 항목에 **원본 영상 링크 + 타임스탬프 역참조**를 의무화합니다 (§11).
3. **룰북의 페르소나(P-01 PEF C레벨)와 5-Pillar(ADR 0001)는 commodity 공급망 전제**입니다. 세탁은 생활정보 도메인이라 그대로는 안 맞습니다. 재논쟁이 아니라 **도메인 아날로그 매핑**으로 처리하고, ADR 0009로 명문화합니다 (§3).

---

## 1. 결론 요약

**참치왕국 사이드바에 붙이지 않고, `/laundry` 독립 공개 라우트로 만듭니다** (`/bni-global` 선례). 유튜브 `세탁왕` 채널의 영상 자막을 인제스트해 **"원단 × 오염 × 처치"의 구조화 지식베이스(KB)**로 만들고, 그 KB를 룰북 표준 위젯(차트 + cardDesc + SIT/TAK + TelemetryBadge) 15개와 인터랙티브 도구 2개로 렌더링합니다.

핵심 결정 3가지:

| # | 결정 | 근거 |
|---|---|---|
| D1 | **독립 라우트 `/laundry`** (사이드바 미등록) | 참치왕국 = 농·축·수산 B2B 브랜드. 생활 세탁정보는 브랜드 문맥이 다름. `/bni-global` 분리 선례(2026-07-06) 그대로 적용 |
| D2 | **세탁 5-Pillar 아날로그 매핑** (원단 → 약제 → 공정 → 트러블 → 비용·보관) | ADR 0001의 5단 구조는 유지하되 도메인 어휘만 치환. 구조 자체를 깨지 않음 |
| D3 | **정적 KB 기반 = TelemetryBadge `SYNCED`** (LIVE 아님) | L-09 정직 라벨. 런타임 YouTube API를 호출하는 "최신 영상" 위젯 1개만 `LIVE` + `isLive` 필드 (L-12) |

---

## 2. 제품 정의

### 2.1 누가 쓰는가

| 페르소나 | 질문 | 대시보드가 주는 답 |
|---|---|---|
| **1차: 일반 소비자** | "이 얼룩, 이 옷, 지금 뭘 해야 하나?" | 얼룩 진단기 → 처치 프로토콜 + 근거 영상 |
| **2차: 세탁 자영업자** | "손님한테 뭘 근거로 설명하나? 어디서 사고가 나나?" | 소재별 손상 리스크·실패 사례 랭킹·비용 구조 |

룰북 W-03의 SIT/TAK 2-Step은 유지하되 **TAK의 화법을 "C레벨 수익성 지침" → "실행 지침"으로 치환**합니다. 예: `TAK: 흰 면 티는 60℃ + 산소계 표백제 30분 침지가 손상 대비 회수율이 가장 높다. 40℃ 이하 세탁은 황변 누적을 못 막는다.`

### 2.2 무엇이 아닌가

- 세탁소 예약/견적 서비스 아님 (거래 기능 없음)
- 세탁왕 채널의 미러 사이트 아님 (영상 임베드 나열 금지 — 구조화된 지식만 제공하고 원본으로 되돌려 보냄)

---

## 3. 세탁 5-Pillar (ADR 0001 아날로그 매핑)

| # | commodity 원본 | 세탁 도메인 | 다루는 것 |
|---|---|---|---|
| S1 | 원료 수급 | 🧺 **원단·의류 진단** | 소재별 특성, 케어라벨 기호, 수축·이염·변형 리스크 |
| S2 | 가공·생산 | 🧴 **세제·약제** | 세제 유형(중성/약알칼리/산소계/염소계/효소), pH, 투입량, 수온 |
| S3 | 물류·통관 | 🌀 **세탁·건조 공정** | 코스·수온·탈수 RPM·건조 방식·다림질 온도 |
| S4 | 판매·수요 | 🧼 **얼룩·트러블 해결** | 얼룩 유형별 처치, 골든타임, 사고 복구 |
| S5 | ESG·지속가능성 | 💰 **비용·보관·환경** | 회당 비용, 자가 vs 위탁 손익분기, 계절 보관, 미세플라스틱 |

> **ADR 0009 필요.** "commodity가 아닌 도메인에 5-Pillar를 적용할 때의 매핑 규칙 + 페르소나 치환"을 결정으로 남깁니다. 이걸 안 남기면 다음 세션에서 "세탁이 왜 5-Pillar를 쓰냐" 또는 "왜 TAK가 수익성 얘기를 안 하냐"로 재논쟁이 납니다.

---

## 4. 데이터 파이프라인

```
YouTube 채널 (세탁왕)
  │  ① 영상 목록      youtube/v3 playlistItems (uploads 플레이리스트)
  │  ② 자막 확보      ⚠️ captions.download는 채널 소유자 OAuth 전용 → yt-dlp --write-auto-sub 경로 사용
  ▼
raw/laundry_king/<videoId>.{json,vtt}      (git 미커밋 — L-08)
  │  ③ 구조화 추출    Librarian(ADR 0007, max_tools=0) 배치 — 자막 → 클레임 JSON
  ▼
data/laundry_king_kb.json                  (정제 KB, <10MB → public/data/ 동시 배치)
  │  ④ 인테이크        lib/data/laundry.ts (타입 + 파생 집계) — 위젯의 직접 JSON import 금지
  ▼
components/Laundry*.tsx (위젯 15) + /api/laundry/* (집계·최신영상)
```

### 4.1 KB 스키마 (초안)

```ts
// lib/data/laundry.ts
export interface LaundryClaim {
  id: string;                    // 'clm_0142'
  pillar: 'S1' | 'S2' | 'S3' | 'S4' | 'S5';
  fabric: FabricKey[];           // ['면', '린넨'] — 해당 없으면 []
  soil: SoilKey[];               // ['커피', '피지·땀']
  method: MethodKey[];           // ['산소계 침지', '효소 세제 전처리']
  params: {                      // 수치 주장은 전부 여기로 (검증 대상)
    tempC?: [number, number];
    minutes?: [number, number];
    spinRpm?: number;
    doseNote?: string;
  };
  successRate?: number;          // 0~1, 채널이 명시한 경우만
  risk?: RiskKey[];              // ['수축', '이염', '변색']
  warning?: string;              // 안전 경고 (염소계+산성 혼합 금지 등)
  claimSource: 'channel' | 'standard';   // ⚠️ 환각 방지 핵심 필드
  evidence: {
    videoId: string;
    title: string;
    publishedAt: string;         // ISO
    startSec: number;            // 타임스탬프 역참조 의무
  };
  verified: 'confirmed' | 'unverified';  // 수치 주장 2차 검증 여부
}
```

- `claimSource`가 핵심입니다. **채널이 실제로 말한 것**과 **일반 표준(KS K 0021 케어라벨, 제조사 권장)**을 필드로 분리하지 않으면, LLM 추출 단계에서 상식이 섞여 들어와 "세탁왕이 그렇게 말했다"고 오표기됩니다 (참치 코퍼스 스터디에서 실제 발생한 음역·오독 사고와 동형).
- `verified: 'unverified'`인 수치 주장은 UI에서 회색 처리 + "미검증" 배지.

### 4.2 스크립트

| 파일 | 역할 |
|---|---|
| `scripts/fetch_laundry_king_videos.mjs` | 채널 uploads 목록 + 메타데이터 수집 (YouTube Data API v3) |
| `scripts/fetch_laundry_king_captions.sh` | yt-dlp 자막 수집 (자동자막 포함), raw/ 저장 |
| `scripts/build_laundry_king_kb.mjs` | 자막 → Librarian 배치 추출 → KB JSON 생성 + 스키마 검증 |
| `scripts/verify_laundry_claims.mjs` | 수치 주장(온도·시간·RPM)이 물리적 상식 범위인지 rule check |

### 4.3 API 라우트

| 라우트 | 성격 | Telemetry |
|---|---|---|
| `/api/laundry/kb` | 정적 KB 서빙 + 집계 | `SYNCED` (KB 생성일) |
| `/api/laundry/uploads` | 런타임 YouTube API — 최신 업로드 5건 | `LIVE` + `isLive: boolean` (L-12) |

> **룰북 L-10과의 충돌 1건 — 의도적 미적용.** L-10은 `process.env.KEY || '하드코딩키'` fallback을 요구하지만, YouTube API 키는 이번에 새로 발급하는 키이므로 **저장소에 커밋하지 않습니다.** 대신 키 부재 시 `isLive: false` + 캐시된 KB의 최신 영상으로 graceful degrade 합니다. (L-10의 취지는 "Vercel env 미반영 시에도 화면이 죽지 않게"이고, 그 취지는 캐시 fallback으로 동일하게 달성됩니다.)

---

## 5. 위젯 인벤토리 (15종)

모두 WidgetCard(ADR 0005) 준수: `title` 순수 한글(W-01) · `cardDesc` 1줄 · `TelemetryBadge` · SIT 2~3문장 / TAK 1~2문장 · 단위 괄호(W-02) · X축 한글 7자(D-05).

### S1 🧺 원단·의류 진단

| ID | 위젯 | 차트 | 데이터 | TAK 방향 |
|---|---|---|---|---|
| W1 | 소재별 손상 리스크 지도 | Heatmap (원단 × 수축/이염/보풀/변형) | `fabric` × `risk` 클레임 빈도 | 리스크 3개 이상 겹치는 소재는 무조건 위탁 |
| W2 | 케어라벨 기호 해독표 | 인터랙티브 그리드 | KS K 0021 / ISO 3758 (`claimSource: 'standard'`) | 물세탁 금지 기호 오독이 사고 1순위 |
| W3 | 채널 소재 커버리지 | Treemap | 영상 수 × 소재 | 커버리지 낮은 소재는 KB 신뢰도 하향 표기 |

### S2 🧴 세제·약제

| ID | 위젯 | 차트 | 데이터 | TAK 방향 |
|---|---|---|---|---|
| W4 | 세제 유형 × 오염 적용 매트릭스 | Heatmap | `method` × `soil` | 단백질 오염에 고온 = 고착. 효소 세제 + 미온수 |
| W5 | 수온-세정력-손상 트레이드오프 | ComposedChart (세정력 라인 + 손상위험 바) | `params.tempC` 분포 | 60℃는 면·흰옷 한정, 혼방은 40℃ 상한 |
| W6 | 세제 과투입 경보 | 랭킹 Bar | 채널 반복 경고 빈도 | 과투입은 잔류·냄새의 주범, 표기량의 70%로 시작 |

### S3 🌀 세탁·건조 공정

| ID | 위젯 | 차트 | 데이터 | TAK 방향 |
|---|---|---|---|---|
| W7 | 코스별 시간·탈수 비교 | ComposedChart (분 + RPM) | `params.minutes`, `spinRpm` | 강탈수는 구김·손상 비용이 건조 시간 절감분을 초과 |
| W8 | 건조 방식 비교 | Radar (손상·시간·냄새·전기료) | `method` 파생 | 실내 자연건조는 냄새 리스크 1순위 — 순환 필수 |
| W9 | 소재별 다림질 온도 | Range Bar (℃ 구간) | `params.tempC` (S3 한정) | 합성섬유는 당포 없이 직접 접촉 금지 |

### S4 🧼 얼룩·트러블 해결 (핵심 pillar)

| ID | 위젯 | 차트 | 데이터 | TAK 방향 |
|---|---|---|---|---|
| W10 | 얼룩 × 처치법 성공률 매트릭스 | Heatmap | `soil` × `method` × `successRate` | 유성·색소성은 처치 순서가 성패를 가름 |
| W11 | 골든타임 곡선 | Line (경과시간 → 제거율) | 채널 언급 시간 축 | 24시간 경과 시 제거율 급락 — 즉시 물 흡착이 최선 |
| W12 | 세탁 사고 원인 랭킹 | Bar (이염·수축·변색·보풀) | `risk` 빈도 | 이염 사고의 대부분은 분류 실패 — 색상 3분류 고정 |

### S5 💰 비용·보관·환경

| ID | 위젯 | 차트 | 데이터 | TAK 방향 |
|---|---|---|---|---|
| W13 | 자가세탁 vs 위탁 손익분기 | Scatter (비용 × 실패 리스크) | 아이템별 파생 | 리스크 상위 사분면 아이템만 위탁하면 연간 비용 최소 |
| W14 | 회당 세탁 비용 구조 | Stacked Bar (전기+수도+세제, 원) | 공공요금 단가 × 코스 | 야간·통합 세탁으로 회수 가능한 연간 절감액 제시 |
| W15 | 계절 보관 & 미세플라스틱 | Gauge + 체크리스트 | `claimSource` 혼합 | 압축보관은 복원 불가 구김 유발 — 통기 커버 권장 |

> **메타 위젯 1개 추가 권장:** `W0. 지식베이스 신선도` — 인제스트한 영상 수 / 최신 업로드일 / 미검증 클레임 비율. 정직성 장치이자 L-09 대응.

---

## 6. 인터랙티브 도구 2종 (ADR 0008 제외 패턴 B)

차트+SIT/TAK 위젯이 아니라 **도구**이므로 WidgetCard로 감싸지 않습니다. `scripts/check_s_grade.py`의 `DASHBOARD_LEVEL_PATTERN_FILES` 화이트리스트에 등재합니다.

### T1 얼룩 진단기 (`LaundryStainTriage.tsx`)
캐스케이드 선택: **얼룩 유형 → 원단 → 경과 시간 → 세탁 가능 여부(케어라벨)** → 단계별 처치 프로토콜 출력.
- 출력에는 **근거 영상 링크 + 타임스탬프**를 항상 동반 (인용 정당성 + 신뢰도)
- 위험 조합(염소계 + 산성 세제 등)은 **빨간 경고 배너**로 차단
- 해당 KB 항목이 `unverified`면 "미검증" 배지 노출

### T2 케어라벨 해독기 (`LaundryCareLabelDecoder.tsx`)
기호 5종(물세탁/표백/건조/다림질/드라이) 선택 → 허용 공정 요약 + 금지 사항. `claimSource: 'standard'`만 사용(표준 기반이라 채널 인용 불필요).

---

## 7. UI 규격

- **Glassmorphism 다크 베이스 유지** (`bg-gray-900/95` + `bg-white/5 backdrop-blur-md`) — UI_RULES 1-1 그대로
- **시그니처 그라디언트 제안: `sky-300 → indigo-500` (#7dd3fc → #6366f1)** — 물·거품 연상. 낙지(indigo→violet)와 인접하지만 **독립 라우트라 같은 사이드바에서 경합하지 않습니다.** 사이드바 편입 결정 시 재지정 필요
- 아이콘: lucide `WashingMachine`(있으면) / `Droplets` / `Shirt` / `Sparkles` / `Wind`
- 레이아웃: 2열 그리드 기본(UI_RULES 4), 모바일 1열. **모바일 비중이 commodity 대시보드보다 훨씬 높은 도메인**이므로 T1 진단기는 모바일 퍼스트로 설계
- X축 한글 7자 초과 라벨 4개 이상 → `angle={-45}` + 하단 마진 40~60px (L-02). 소재명("아세테이트", "폴리에스터")이 7자 경계에 몰려 있으니 Phase 2에서 실측 필요
- 전문 용어(pH, 산소계 표백, TCE, 웨트클리닝)는 TermTooltip

---

## 8. 파일·라우트 구조

```
app/laundry/page.tsx                       신규 — 독립 셸 (bni-global 패턴)
app/laundry/page.module.css                신규
app/api/laundry/kb/route.ts                신규 — SYNCED
app/api/laundry/uploads/route.ts           신규 — LIVE + isLive
components/LaundryDashboard.tsx            신규 — 5-Pillar 합성 진입점
components/LaundryFabricWidgets.tsx        신규 — W1~W3
components/LaundryChemistryWidgets.tsx     신규 — W4~W6
components/LaundryProcessWidgets.tsx       신규 — W7~W9
components/LaundryStainWidgets.tsx         신규 — W10~W12
components/LaundryCostWidgets.tsx          신규 — W13~W15
components/LaundryStainTriage.tsx          신규 — T1 (도구)
components/LaundryCareLabelDecoder.tsx     신규 — T2 (도구)
components/RouteScopedGlobalWidgets.tsx    수정 — /laundry에서 참치 전역 위젯 숨김
lib/data/laundry.ts                        신규 — 인테이크 모듈 + 타입
data/laundry_king_kb.json                  신규 (git 미추적 → 배포 시 public/data/ 동시 배치)
public/data/laundry_king_kb.json           신규 — 배포 포함
scripts/fetch_laundry_king_videos.mjs      신규
scripts/fetch_laundry_king_captions.sh     신규
scripts/build_laundry_king_kb.mjs          신규
scripts/verify_laundry_claims.mjs          신규
scripts/check_s_grade.py                   수정 — 도구 2종 화이트리스트
app/sitemap.ts                             수정 — /laundry 공개 라우트 등재
docs/adr/0009-non-commodity-domain-mapping.md  신규
__tests__/laundry-kb.test.ts               신규 — 스키마·evidence 필수·claimSource 계약
__tests__/dashboard-registry.test.ts       수정 — /laundry는 sitemap에만, 사이드바엔 없음
```

**사이드바·`VALID_MENUS`·`DASHBOARD_PANEL_ORDER`는 건드리지 않습니다** (D1).

---

## 9. 룰북 준수 매트릭스

| 조항 | 대응 |
|---|---|
| L-01 영문 잔존 0 | 사용자 노출 100% 한글. `pH`·`RPM`·`℃`만 화이트리스트, 첫 노출 TermTooltip |
| L-09 정직 LIVE | 정적 KB 위젯 15개 전부 `SYNCED` + KB 생성일. `LIVE`는 `/api/laundry/uploads` 1건뿐 |
| L-12 isLive 표준 | uploads 라우트가 `isLive: boolean` 출력, fallback 분기도 `isLive: false` 명시 |
| L-10 fallback 키 | **의도적 미적용** — 키 커밋 대신 캐시 fallback (§4.3) |
| L-03 빌드 게이트 | Phase별 `npm run typecheck` + `npm run build` 통과 후 커밋 |
| L-08 데이터 git 금지 | `raw/` 자막 전량 미커밋. KB는 <10MB 확인 후 `public/data/`만 |
| W-04 위젯 체크리스트 | 15개 전부 cardDesc·Telemetry·SIT/TAK·단위·pillar 명시 |
| O-04 Forensic Audit | 4-Axis 중 "출처 신뢰도"는 단일 채널 의존이라 상한이 있음 → `claimSource: 'standard'` 교차 보강으로 방어 |
| ADR 0005 | 위젯 15개 WidgetCard, 도구 2개 제외(ADR 0008 패턴 B) |
| P-03 무관용 | 미검증 클레임을 "확정"처럼 렌더하지 않음 — `verified` 필드가 UI에 직결 |

---

## 10. 실행 계획

| Phase | 산출물 | 검증 게이트 | 예상 |
|---|---|---|---|
| **0. 확정** | 채널 URL 확정 · 인용 정책 · ADR 0009 초안 · YouTube API 키 발급 | 사용자 승인 | 0.5d |
| **1. 인제스트** | 스크립트 4종 · KB JSON · `lib/data/laundry.ts` · 스키마 테스트 | `npm test`(KB 계약) · KB 항목 수·미검증 비율 리포트 | 1.5d |
| **2. 셸 + 핵심 위젯** | `/laundry` 라우트 · S1(W1~W3) · S4(W10~W12) | typecheck · build · Puppeteer(overflow 0, error 0) | 1.5d |
| **3. 잔여 위젯** | S2·S3·S5 (W4~W9, W13~W15) + W0 | build · `check_s_grade.py` · L-01 grep | 1.5d |
| **4. 인터랙티브 도구** | T1 진단기 · T2 해독기 · 근거 영상 패널 | 모바일 Puppeteer · 위험 조합 경고 렌더 확인 | 1d |
| **5. 마감** | HANDOFF 갱신 · `npm run verify` 전체 | lint·typecheck·test·api-cache·build·bundle | 0.5d |

합계 약 **6.5일**. 배포는 로컬 검증 후 사용자 명시 요청 시에만 (Deployment Protocol).

---

## 11. 리스크와 완화

| 리스크 | 심각도 | 완화 |
|---|---|---|
| **저작권·인용 범위** | 높음 | 요약·데이터화만, 자막 전재 금지. 전 항목 원본 링크+타임스탬프. 채널명·출처 상단 명시. 상업적 노출 전 채널 사전 동의 권장 |
| **자막 확보 경로** | 높음 | `captions.download`는 **채널 소유자 OAuth 전용** — 제3자는 불가. `yt-dlp --write-auto-sub` 경로로 대체하되 자동자막 오인식 감안. 실패 시 Whisper STT |
| **화학 안전** | 높음 | 염소계+산성 혼합 등 위험 조합은 KB 레벨에서 `warning` 필수, UI에서 차단 배너. 피부·의료 관련 주장은 KB 제외 |
| **LLM 추출 환각** | 중간 | `claimSource` 필드 분리 + `verified` 2차 검증 + `verify_laundry_claims.mjs` 물리 범위 rule check. 참치 코퍼스 스터디의 음역·오독 사고 재발 방지 |
| **단일 출처 편향** | 중간 | 한 채널의 노하우 = 한 사람의 의견. 표준(KS/ISO) 대조 항목을 `standard`로 병기하고, 충돌 시 양쪽 표기 |
| **채널 특정 오류** | 중간 | Phase 0에서 사용자가 채널 URL 확정. 잘못된 채널로 6일 태우는 사고 방지 |
| **YouTube API 쿼터** | 낮음 | 10,000 units/day. 목록 수집은 1회성 배치, 런타임 호출은 uploads 1건 + ISR 캐시 |

---

## 12. 확정이 필요한 결정 4건

1. **채널이 맞습니까?** `https://www.youtube.com/channel/UCbZgEt3x0FNp7aTEP-xIFEw` (세탁왕). 다른 채널이면 URL을 알려주세요.
2. **주 사용자는?** 일반 소비자 1차 / 세탁 자영업자 병행 — 본 기획은 소비자 우선 + 운영자 보조로 설계했습니다.
3. **배치 위치는?** 독립 라우트 `/laundry` 권장 (D1). 참치왕국 사이드바에 "생활 인텔리전스" 섹션을 신설해 넣는 안도 가능하나 브랜드 문맥이 흐려집니다.
4. **자막 인제스트를 자동화합니까?** 자동(yt-dlp + LLM 추출, 6.5일) vs 수동 큐레이션(핵심 영상 30~50편만 손으로 정리, 3일·정확도 상승·확장성 하락).

---

## 부록 — 참고한 검색 출처

- [세탁왕 - YouTube](https://www.youtube.com/channel/UCbZgEt3x0FNp7aTEP-xIFEw)
- [세탁설의 배워서 바로 써먹는 세탁의 기술 (플레이리스트)](https://www.youtube.com/playlist?list=PLov1pvgWoT0K7XKfVzE5l19g4dEm_q3Pj)
- [세탁예술가](https://www.youtube.com/channel/UCiGo241Z22vhmFXCoyD5VuA) · [세탁쟁이](https://www.youtube.com/channel/UC4w3nwfb-ACspzdn1AIsVuQ) · [거성세탁소](https://www.youtube.com/channel/UCxVlaG8i_IXwcvTNVHUOc2g) (동명 유사 채널 — 혼동 주의)
