# V2.5 무채색+1액센트 전환 반증

> 태그: `[Grok]` · 2026-08-15 · 코드 수정 없음 (리포트만)
> 스펙: `docs/superpowers/specs/2026-08-15-v25-institutional-grade-design.md`
> (이 worktree에는 미포함. `origin/docs/v25-institutional-spec` / PR #350에서 원문 대조)
> 전제: Deep Sea Command V2 셸 위에 얹는 고도화. 위젯 하드코딩 색은 스펙 §6대로 V2.5-a에서 안 건드린다.
> 이 문서는 **최종 상태**(한 화면 1액센트 + 보조 시리즈 무채색 명도 + L-07)가 깨지는 지점을 본다.

판정 기준: 실제 파일·라인으로 재현되지 않으면 위험으로 올리지 않는다.

---

## 1. 다품목 식별성 — 판정: **무해**

질문: D-04 시그니처가 "한 화면 1액센트"로 줄면 `/cross-intelligence`에서 품목 시리즈가 안 보이는가.

**안 무너진다.** 그 화면은 처음부터 품목을 D-04 색으로 안 그린다.

근거:

- 히트맵 열은 `참치·연어·새우·닭고기·돼지고기·마늘` 6개다 (`lib/data/cross-commodity-intelligence.ts:119-139`, `components/CrossCommodityIntelligence.tsx:24`).
- 화면 식별은 **한글 라벨**이다 (`CrossCommodityIntelligenceDashboard.tsx:203-215`). 셀 배경은 `scoreColor(score)` — `#ef4444 / #f59e0b / #38bdf8 / #10b981` 점수 4단 (`:54-58`, `:213`).
- 대체 압력·포트폴리오도 `from → to` 문자열 + 점수바이지, 참치 cyan / 연어 pink 같은 D-04 매핑이 없다 (`:179-188`, `:230-238`).
- 레지스트리 액센트는 이 메뉴가 `gold` (`lib/dashboard-registry.ts:44`). 본문 색과 무관하다.

스펙 §2.1은 경보(rose·amber)를 예외로 남긴다. 점수 ≥75는 이미 그 예외 색이다. 중·저점(cyan·emerald)을 액센트/명도로 접어도 열 라벨이 남아서 품목은 읽힌다. 히트맵은 원래 명도 계단으로도 성립한다.

히어로 KPI가 액센트 4색(`#38bdf8 / #f59e0b / #10b981 / #ef4444`, `:95-125`)인 것은 "1액센트" 위반이지만, 품목 ID가 아니라 지표 장식이다. 접어도 라벨(`최대 대체 압력` 등)이 남는다.

잔여(이 관점의 위험으로 올리지 않음): 돼지고기 위젯의 단백질 3축 막대는 D-04에 가까운 3색이다 — 돼지고기 `#f43f5e` / 수산물 `#06b6d4` / 가금류 `#eab308` (`PorkWidgets.tsx:173`). 그룹 막대라 위치+범례로 3축은 버틴다. 2축 비교(`Insight9TunaVsSquidCombo.tsx:37-42`, 오징어 `#f97316` vs 참치 `#06b6d4`)도 1액센트+회색 한 줄로 충분하다.

완화안: 해당 없음. 스펙에 한 줄만 박으면 된다 — **다품목 화면의 색은 점수·경보고, 품목 ID가 아니다. 히트맵에 D-04 품목색을 입히지 말 것.**

---

## 2. 경보 위계 — 판정: **위험**

질문: 무채색 바탕에서 rose/amber가 과하게 튀어 매 화면이 경보처럼 읽히는가.

`/logistics` 기준 **그렇다.** 원인은 경보가 많아서가 아니라, **경보가 아닌 것까지 경보색**이기 때문이다.

근거:

- 히어로 `WarningPanel`은 상시 마운트다. 제목 `#fda4af`, 본문 `#fecdd3`, 면 `--dsc-warn-bg: rgba(69,26,33,0.72)`, 테두리 `--dsc-warn-border: rgba(244,63,94,0.28)` (`HeroZone.tsx:114-116`, `app/globals.css:194-195`). `/logistics`는 조건 없이 `warning={{ title: '입항 상태 재확인', ... }}` (`LogisticsDashboard.tsx:114-118`).
- 지도 운반선 마커 4개는 전원 amber `#f59e0b` + 글로우다 (`:81-92`). 예외가 아니라 **존재 표시**다.
- 운영 예외 관제판 4행 (`LogisticsOperationsPanel.tsx:17-46`): `즉시 확인` 2 · `금주 확인` 1 · `정보 상충` 1. 배지 색은 rose / amber / blue (`LogisticsCommandCenter.module.css:255-257`). 조치 칸은 에메랄드 좌측 바 (`:266-273`).
- 현행 배경은 틸-차콜 + Aurora 청록 (`globals.css:157-164`, `--dsc-bg: #0a141d`). 스펙 §2.1은 이를 `#0a0a0b` 평평한 zinc로 바꾸고 Aurora를 제거한다. 남은 채색은 거의 rose/amber뿐이다.

지금 화면은 cyan 글로우가 rose를 상쇄한다. 무채색이 되면 히어로 패널 + 마커 4 + 긴급 배지 2가 **첫 화면의 채색 전부**가 된다. 관제판의 본래 목적인 "예외 우선"과, "전부 경보로 보인다"는 실패는 다르다. 실패는 **상시 rose 크롬 + 비예외 amber 마커**가 진짜 예외(창고 포화, 입항 미확인)와 같은 무게로 붙는 것이다.

같은 패턴의 증폭:

- `TelemetryBadge` SYNCED = `#f59e0b` (`TelemetryBadge.tsx:22`). 의미는 "동기화됨"이지 경계가 아니다. 무채색 화면에서 카드마다 amber 점이 생기면 관제판 배지와 같은 신호로 읽힌다.
- `/market` 티커 접두 배지는 `#ef4444 → #f59e0b` 그라디언트 (`LiveTicker.module.css:50-51`). 장식인데 스펙이 남기는 경보 예외에 걸려 살아남는다.

완화안 1개: **rose/amber는 상태 전이가 있는 예외에만.** `/logistics` 히어로 `warning`은 미확인 입항이 있을 때만. 운반선 마커는 zinc/액센트(데이터). `TelemetryBadge` SYNCED는 slate로 고정(LIVE만 액센트). 티커 접두는 무채색 배지.

---

## 3. 모노 폰트 한글 혼용 — 판정: **위험**

질문: 숫자만 IBM Plex Mono(라틴+숫자 서브셋)로 바꿀 때 한글 라벨과 baseline·자간이 깨지는가.

**깨지는 지점이 이미 코드에 있다.** 스펙 §2.2는 "모노는 숫자·단위·통화기호만, 한글 본문은 산세리프"인데, 구현 부착점이 한글을 같은 런에 넣는다.

근거:

- `HeroZone` `KpiNumber`는 숫자와 단위를 **같은 nowrap span**에 둔다 (`HeroZone.tsx:65-91`). 단위는 18px, 숫자는 `--dsc-kpi-size`(최대 ~72px, `globals.css:184-186`).
- 살아 있는 한글 단위: 통합 인텔리전스 `(점)` `(건)` (`CrossCommodityIntelligenceDashboard.tsx:97-113`), 선망선 DB `(개국)` `(개사)` `(척)` (`PurseSeinerDashboard.tsx:36-41`), 물류 `(척)` (`LogisticsDashboard.tsx:110`). 라틴 단위 `(MT)` `($/MT)` `(M/T)`와 한 컴포넌트에 섞인다.
- 스펙·V2.5-a 지시는 이 컴포넌트에 `--dsc-font-mono`를 건다. 스택은 `'IBM Plex Mono', ui-monospace, SFMono-Regular, monospace` — Hangul 글리프가 없다. 부모에 모노를 주면 `(점)`은 시스템 폴백. 72px Plex Mono 700과 18px 폴백 산세리프가 한 줄에서 baseline이 갈라진다.
- `LiveTicker`는 이미 항목 전체에 모노 스택을 깐다 (`LiveTicker.module.css:86`). 라벨은 `SKJ 방콕` · `MGO 싱가포르` · `연결 중` (`LiveTicker.tsx:142-166`, `:178`). 값만 바꾸면 괜찮은데, 현재 구조는 라벨까지 같은 `font-family`다.
- 테이블은 더 심하다. `VesselStatusTables.tsx:7-12` 상태 셀은 `"일간 어획: 30톤 / 누적 선적: 210톤"`처럼 **한글+숫자가 한 텍스트 노드**다. `UnloadingHistory.tsx:533`은 `` `${formatMt(actual)} MT` `` 옆에 `<small>` 한글 근거, `:535`는 `{n}건`. 셀 단위 모노는 한글 접미를 끌고 들어가고, 숫자만 감싸려면 파서가 필요하다.

`tabular-nums`는 이미 있다 (`HeroZone.tsx:72`, `LiveTicker.module.css:111`). 모노를 안 넣어도 자릿수는 선다. 모노의 이득은 글리프 폭이지, 지금 깨지는 혼용 런을 감수할 정도는 아니다.

완화안 1개: **모노는 숫자 런에만 래퍼.** `KpiNumber`는 `CountUp`만 `fontFamily: var(--dsc-font-mono)`. 단위 span은 Pretendard + `tabular-nums`. 한글 단위 `(점)(건)(척)(개국)`은 모노 금지. 티커는 `.value`만 모노, `.label`은 현행 산세리프. 테이블은 순수 수치 열만. `30톤` 같은 혼합 노드에 모노 금지.

---

## 4. 차트 시리즈 수 — 판정: **위험**

질문: Recharts 5+ 시리즈를 무채색 명도만으로 나눌 수 있는가.

**없다.** 스펙 §2.1 "보조 시리즈는 무채색 명도 단계로"가 이 코드베이스의 상위 차트와 정면 충돌한다.

실측(컴포넌트 안 차트 블록에서 `<Line|Bar|Area>` 개수):

| 시리즈 | 파일 | 구분 수단(현재) |
| ---: | --- | --- |
| 8 | `FleetCharts.tsx:105-112` | 월별 스택 8색 (lemon/aqua/orchid/`#ce7a2c`/`#ff98ba`/`#c084fc`/`#4ade80`/`#22d3ee`) |
| 7 | `PorkWidgets.tsx:115-118` | 국가 라인 7색 (`#f43f5e` `#3b82f6` `#10b981` `#eab308` `#ec4899` `#06b6d4` `#f97316`) |
| 6 | `TunaUsLoinImports.tsx:50-55` | 원산지 스택 Area 6색 |
| 6 | `ReeferFreightChart.tsx:9-15, 150-155` | 목적국 라인 6색 (info/warning/danger/white/violet/success) |
| 5 | `MarketDashboard.tsx:407-411` | SKJ 5허브 (`#38bdf8` `#2dd4bf` `#f472b6` `#facc15` `#fb923c`, 점선 2개) |
| 5 | `TraderStatus` / `TraderImportChart` | 트레이더 5막대 |

배경 `#0a0a0b`에서 2px 스트로크가 서로와 배경에 동시에 대비를 가지려면 쓸 수 있는 회색은 대략 3~4단(`#52525b / #a1a1aa / #d4d4d8 / #fafafa`). 5번째부터 인접 시리즈가 붙는다. 스택 Area는 더 심하다 — 명도만 다른 인접 면은 경계가 사라진다.

`/market` SKJ 5허브는 운영 화면의 본전이다. 점선 2개는 이미 썼고(`skj_abj`, `skj_vig`), 남는 레버는 색뿐이다. 무채색 명도로 바꾸면 방콕/만타/세이셸이 같은 선으로 읽힌다. `FleetCharts` 8개월 스택은 범례를 외우지 않으면 월 기여를 못 본다.

위젯 내부 색은 V2.5-a에서 안 바뀐다(스펙 §6). 그래도 규칙이 L-07까지 그대로면 위 차트는 전부 실패작이다.

완화안 1개: **명도 전용은 시리즈 ≤3.** 4+는 고정 범주 팔레트(액센트 1 + 슬레이트 2 + 기존 semantic 2 + 점선/해치)를 스펙 예외로 남긴다. 스택은 색 또는 `ChartPatternDefs` 해치 중 하나를 의무. `/market` SKJ·YF, `FleetCharts` 월 스택, `PorkWidgets` 7개국, `TunaUsLoinImports`는 L-07 제외 목록.

---

## 가장 위험한 지점 1개

**차트 시리즈 규칙(§2.1 보조=무채색 명도)이 5+ 시리즈 운영 차트를 읽지 못하게 만드는 것.**

다품목 ID는 이 화면에서 색에 의존하지 않아 버틴다. 경보 과잉과 모노 혼용은 국소 수정(마커/배지 의미 축소, 숫자 런만 모노)으로 줄일 수 있다. 시리즈 규칙은 스펙 문장 하나가 `/market` 현물 비교와 `/fleet` 월별 스택을 동시에 죽인다. 구현 전에 예외를 박지 않으면 L-07이 가장 비싼 차트를 먼저 깎는다.

V2.5-a(토큰·HeroZone·StatRow만)는 위젯 색을 안 바꾸므로 당장 차트가 죽지는 않는다. 검수 때 막을 것은 구현이 아니라 **규칙 문구**다.
