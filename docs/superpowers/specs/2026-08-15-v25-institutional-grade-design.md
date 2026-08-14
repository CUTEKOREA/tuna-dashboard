# V2.5 "Institutional Grade" — 비주얼 고도화 설계서

> **작성**: 2026-08-15 (Claude Code, 사용자 합의 완료)
> **레퍼런스**: awwwards Nominee — OnlyGenius Algorithmic Trading Dashboard (ZeeFrames).
> 썸네일이 아니라 **배포 자산 실측**(onlygenius.es의 CSS 33KB·JS 310KB 분석) 기반.
> **전제**: Deep Sea Command V2(2026-08-15 스펙, UI_RULES 5장) 위에 얹는 고도화 레이어.
> V2의 히어로 존·PillTabs·전 메뉴 잠금·위젯 룰은 전부 유지된다.

---

## 0. 확정된 의사결정

| 쟁점 | 결정 |
| --- | --- |
| 색 절제 | **무채색 + 1액센트** — 배경을 순수 무채색(zinc 계열)으로, 한 화면에 commodity 액센트 1색만 |
| 수치 폰트 | **모노스페이스 도입** — KPI·테이블·티커 숫자에 tabular 모노. 한글 본문은 현행 유지 |
| 착수 시점 | 진행 중 트랙(코스모 이전·히어로 티저) 병합 후 — 충돌 방지 |

## 1. 레퍼런스 실측 요약

| 축 | OnlyGenius 실측 | 시사점 |
| --- | --- | --- |
| 폰트 | Inter + `--font-mono` 토큰 병용 | 수치=모노가 트레이딩 단말 문법의 핵심 |
| 색 | zinc 무채색 스케일(#09090b→#fafafa) + 블루 1액센트(#2563eb 계열만) | 다색이 아니라 절제가 "기관급"을 만든다 |
| 모션 | framer-motion + `@keyframes` 단 2개(glow·배경전환) | 모션은 데이터에만, 장식 모션 0 |
| 카드 | 1px 저대비 보더, 중간 radius, 그라디언트 없음 | 카드가 조용해야 숫자가 크게 들린다 |

## 2. 토큰 변경 (`--dsc-*` V2.5 확장)

### 2.1 팔레트 — 무채색 전환

```css
/* V2.5: 심해 틸 → 순수 무채색. 청록 기운 제거 */
--dsc-bg: #0a0a0b;            /* was #0a141d (틸) */
--dsc-bg-deep: #050506;
--dsc-surface: rgba(24, 24, 27, 0.72);      /* zinc-900 유리 */
--dsc-surface-border: rgba(244, 244, 245, 0.07);  /* 1px 저대비 */
--dsc-ink: #fafafa;  --dsc-ink-muted: #a1a1aa;  --dsc-ink-faint: #52525b;
```

- **Aurora 라디얼 배경·카드 헤더 그라디언트 제거.** 배경은 평평한 무채색 — 깊이는 blur·보더 대비로만.
- **한 화면 1 액센트 규칙**: 활성 commodity의 시그니처 색(D-04) 1색만 글로우·활성 탭·차트 주 시리즈에.
  보조 시리즈는 무채색 명도 단계로. 경보(rose·amber)는 예외 — 의미색이므로 유지.
- D-04 시그니처 그라디언트는 **정체성 매핑으로 존속**하되 용법이 "그라디언트 면"에서 "단색 액센트 추출"로 바뀐다
  (예: 참치 cyan→blue에서 대표색 1개를 액센트로).

### 2.2 타이포 — 수치 모노

```css
--dsc-font-mono: 'IBM Plex Mono', ui-monospace, SFMono-Regular, monospace;
```

- 적용 대상: 히어로 KPI 숫자·보조 KPI·LiveTicker·테이블 수치 열·차트 축 눈금.
- 한글 라벨·본문·SIT/TAK은 현행 산세리프 유지 — 모노는 숫자·단위·통화기호만.
- 로딩: `next/font`로 서브셋(라틴+숫자) self-host. 외부 CDN 금지(CSP·오프라인).
- HeroZone `KpiNumber`가 이미 단일 지점이므로 토큰 교체로 전 페이지 일괄 반영.

## 3. 모션 정밀화 (framer-motion 기설치 — 추가 의존성 0)

| 모션 | 사양 | 근거 |
| --- | --- | --- |
| 숫자 틱 업데이트 | 값 변경 시 이전→새값 슬라이드(80ms) + 1회 글로우 펄스. LIVE 데이터에만 | 트레이딩 티커 문법. "발광=살아있는 데이터"(V2 §5-5) 강화 |
| 차트 draw-in | 라인/영역 차트 최초 마운트 시 좌→우 드로우(600ms). Recharts `isAnimationActive` 표준화 | 레퍼런스의 equity 커브 질감 |
| 진입 스태거 | 현행 60ms 유지, 거리 12px→8px로 절제 | 모션 감소, 반응감 유지 |
| 장식 모션 제거 | 호버 리프트는 유지(-2px), 그 외 무한 반복 장식 애니메이션 금지. 히어로 발광 숨쉬기(3.6s)는 LIVE 상태에만 | 레퍼런스의 keyframes 2개 절제 |
| `prefers-reduced-motion` | 전부 존중 (V2 계승) | — |

## 4. 카드·배치 언어

- 보더: 1px `--dsc-surface-border` (저대비). 그림자 대폭 축소 — 깊이는 배경 명도차로.
- radius: 16→**12px** (카드), 히어로는 20px 유지.
- 카드 헤더의 시그니처 그라디언트 면 제거 → 좌측 3px 액센트 바 또는 아이콘 단색으로 대체.
- 스탯 행 표준화: 히어로 아래 4-up 보조 KPI 행(레퍼런스의 Current balance 행 문법)을
  `StatRow` 공용 컴포넌트로 — 기존 KpiItem 배열 재사용.
- 밀도·2열 그리드·한글 7자·단위 괄호 등 기존 룰 불변.

## 5. 적용 범위·순서 (구현은 진행 중 트랙 병합 후)

| 단계 | 내용 | 담당 |
| --- | --- | --- |
| V2.5-a | 토큰 전환(무채색·모노 폰트 로드)+HeroZone/PillTabs/StatRow 반영 — 전 페이지 일괄 효과 | CC 설계·Codex 구현 |
| V2.5-b | 운영 4페이지 정리: Aurora·그라디언트 제거, 카드 언어 교체, 숫자 틱 모션 | Codex |
| V2.5-c | 잔여 페이지(pork·cross·seiner-db·cosmo 네이티브) + LiveTicker 모노화 | Codex |
| 검수 | 각 단계 CC 독립 검수(스크린샷 diff·verify) + Grok 반증 1회(색 절제가 가독성을 해치는 지점) | CC·Grok |

- 각 단계 `npm run verify` + 데스크톱/390px 스크린샷. 배포는 명시 요청 시.
- UI_RULES 5장에 V2.5 절 추가는 전 단계 완료 후 1회.

## 6. 리스크

| 리스크 | 대응 |
| --- | --- |
| 무채색 전환이 "칙칙함"으로 읽힘 | 액센트 1색의 채도를 오히려 올려 대비 극대화. 단계-a 후 스크린샷 검수 게이트 |
| 모노 폰트 로딩 비용 | next/font self-host 서브셋(~15KB). check:bundle 게이트로 검증 |
| 스냅샷 테스트 대량 갱신 | 단계별 분할 커밋, 일괄 갱신 금지 (V2와 동일 규율) |
| 기존 위젯 400여 개의 색 하드코딩 | 전수 교체 금지 — 토큰 참조 컴포넌트(HeroZone·WidgetCard·공용 차트 색)만. 위젯 내부 하드코딩은 L-07 스크립트 대상으로 후속 분리 |
