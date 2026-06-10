# 참치왕국 대시보드 V-Next 기획서

- **대상**: leedonggun.co.kr/market (참치왕국 War Room 대시보드)
- **작성일**: 2026-06-10
- **독자**: 제품 오너 (이동건)
- **근거**: 6개 렌즈 진단(UX/IA·데이터 신선도·성능·아키텍처·콘텐츠 가치·벤치마크), 44개 에이전트 멀티 워크플로우 — 원시 확정 발견 33건(적대적 교차검증 통과, 기각 0·정정 11) → 중복 병합 후 24건(P0 4 + P0~P1 1 + P1 19) + P2 20건
- **추가 검수**: 오케스트레이터가 핵심 주장 3건 직접 재확인 — TunaChart 죽은 import(page.tsx:15, 사용 0회) · LiveTicker 11중 10 하드코딩(환율 1476.42 "static hardcoded" 주석 실재) · /api/atuna-prices 무인증 200 OK 42,004B 수신
- **운영 전제**: 1인 운영 + AI 에이전트 보조(Claude Code + Antigravity 50:50), Next.js + Vercel Hobby, Google Cloud 유료 API(Vertex) 금지

---

## 1. 요약 (Executive Summary)

**한 줄 평가**: 시각 완성도와 데이터 수집·출처 투명성 규율(L-09 정직 라벨, 707위젯 신뢰원장)은 상용 수준에 도달했으나, **기본 진입 화면이 자기모순 수치로 그 신뢰를 스스로 깎고 있고, 이미 구축한 자동화 파이프라인이 무알림으로 죽어 있으며, 유료 소스 데이터가 무인증으로 노출**되고 있다.

**핵심 문제 3가지**:

1. **첫 화면의 자기모순** — 같은 화면에 환율 2개 값(티커 1,476 vs KPI 1,529, 3.4% 괴리), Brent 2개 값($106.2 하드코딩 vs MGO 역산 ≈$92.5), 발효 40일 지난 'D-4' 카운트다운, 8일 전 날짜의 '오늘자' 라벨이 동시 노출. LiveTicker 11개 항목 중 **10개가 하드코딩**인데 간판은 'LIVE UPDATE'. 3개 렌즈(UX·신선도·콘텐츠)가 독립적으로 같은 지점을 P0로 지목.
2. **무소음 실패 운영 구조** — Atuna Daily 자동화 파이프라인이 5월 27일 이후 사망(launchd 미적재, 소비처 0건)했는데 13일간 아무도 몰랐다. 핵심 시세는 staleDays 계산·경보가 0건. "갱신을 멈추면 아무도 모른다"가 단일 최대 운영 리스크.
3. **blur뿐인 인증 + 5중 중복 구조** — Atuna 페이월 데이터 730행이 무인증 API로 전량 노출(약관 리스크). 메뉴 정의 5~6중 중복이 이미 /beef 딥링크 회귀를 만들었고, `ignoreBuildErrors: true` + lint 비활성으로 tsc가 검출하는 에러(TS2367 2건)조차 어떤 게이트에도 연결돼 있지 않다.

**제안 방향**: 신규 데이터 수집·신규 인프라 없이, **① 첫 화면 정직화(P0 일소) → ② 죽은 파이프라인 재가동 + 실패 알림 → ③ 레지스트리 단일화·최소 테스트 그물 → ④ 기존 자산(730행 시계열·수급 위젯·API 키)을 조립한 '포지션 결정 도구'화**의 4테마. 재료는 전부 레포 안에 있다.

---

## 2. 현황 진단

### 2.1 렌즈별 핵심 발견

#### UX/IA
- 기본 랜딩 /market이 "오늘 시장이 어떤가"에 틀린 답을 줌: 모순 수치 + 8일 전 '오늘자' 라벨 (LiveTicker.tsx:15·36·42, MarketDashboard.tsx:47-48 초기 state 하드코딩이 SSR에 박힘 — 라이브 HTML curl 실측).
- 32개 평면 메뉴에 참치 동선이 3개 섹션에 분산, '중고차'가 전략 분석 섹션에 위치 (app/page.tsx:462-729, :624-629).
- ⌘K 검색 커버리지 47%(15/32) + 죽은 목적지 4건(ai-forecast·strategy·retail·ranching — 선택 시 빈 화면), 고아 페이지 1건(purse-seiner-db) (CommandPalette.tsx:26-42, page.tsx:117·119).
- 인증이 `blur(12px)` 시각효과뿐 — 무인증 curl로 /api/atuna-prices 42KB·730행 전체 수신 실측 (app/page.tsx:806-808).
- ※ 정정: "모바일 차트 화면 밖 넘침" P1은 교차검증에서 철회 — 차트는 333px로 정상 렌더, 실체는 캡션 정렬 수준의 P3 위생 결함.

#### 데이터 신선도
- atuna_prices.json: KPI 노출 허브 최대 21일 정체(yf_sey 05-20), 차트 전용 허브 41일(아비장·비고 04-30). 동기화 날짜는 UI에 정직 노출되나 **staleDays 계산·임계 경보·isLive 필드 0건** — 타 라우트 10개+는 L-12 구현, 이 라우트만 누락.
- 존재하지 않는 동기화 날짜 '2026-06-01'이 SSR 고정 노출(실제 최신 05-22 — 가짜 신선도 10일 과대표기).
- Atuna Daily 파이프라인: launchctl print → 'Could not find service'(로드 자체 안 됨), 마지막 산출 05-21, /api/atuna-daily 소비처 grep 0건. 근본 원인은 사용자 docx 업로드 중단(05-22~27 6일 연속 '파일 미발견' 후 침묵).
- /api/mgo 'live'는 실호가가 아닌 Brent×1.18×7.45 고정계수 환산 추정치인데 '싱가포르 MGO 유가·오늘자 API 연동'으로 표기, fallback은 오늘 날짜로 위장 (route.ts:33, :77-84).

#### 성능
- TTFB 60ms로 우수. 루트('/'+rewrite 30경로)는 63.8KB 프리렌더 HTML 반환. 단 **rewrites 누락 7개 경로(octopus·flatfish·pork·beef·msc·sashimi-steak·purse-seiner-db)와 robots.txt·sitemap.xml은 ssr:false 폴백 → CSR 스피너**가 첫 화면 (정정 반영).
- 죽은 import 1줄(page.tsx:15 TunaChart, JSX 사용 0회)이 recharts 342KB(gzip 98KB)를 초기 번들에 편입 — 초기 1.41MB의 24%.
- recharts 동일 청크 4벌 중복(추가 낭비분 ≈1.03MB) — Turbopack 엔트리별 청킹이 원인. '/'↔[category] 간은 캐시 적중(정정 반영).
- value-chain 탭: 진입 시 ~2.1MB raw, S2 서브탭 클릭 시 +4.23MB(petfood JSON) — 누적 2클릭 ~6MB (정정: 1클릭 기준 약 1/3).
- KeepAlivePanel 33개 무제한 누적 — 언마운트 경로 없음, 다탭 세션에서 메모리 단조 증가.

#### 아키텍처
- 메뉴 정의 5중 중복(union·validMenus×2·titles·menuKeys) + next.config rewrites(6번째 목록) → /beef 딥링크 회귀 실재. **tsc --noEmit는 TS2367 2건으로 이를 검출하나 `ignoreBuildErrors: true` + lint 비활성으로 어떤 게이트에도 미연결** (정정 반영 — "tsc로도 못 잡음"은 오류).
- gitignore된 /data를 101개 컴포넌트가 빌드타임 import → Vercel 빌드 실패 3회 재발(garlic·consignment·ReeferMovement)의 구조적 원인.
- 자동 테스트: /unloading 한정 puppeteer e2e 4스펙(수동 실행)뿐, 32메뉴 메인 라우팅은 0건. `as any` 프로젝트 전체 134곳.
- 루트 스크래치 325개·287개 git 추적. ※ 정정: .git 708MB의 원인은 스크래치(기여 ~3MB)가 아니라 도달 불가 대형 블롭(최대 2.4GB) — 히스토리 재작성 없이 `git gc --prune=now`로 회수 가능.
- 신규 품목 온보딩 = 1,149줄 단일 파일 내 7곳+ 수정. 빅뱅 분해는 불필요, 레지스트리 추출 + 렌더 루프 일반화로 충분.

#### 콘텐츠 가치
- /market = "가격 수준 4개 + 원시 차트 + 5일 묵은 뉴스 4건의 사실서술(SIT) 중복" — 방향(델타)·시점(규제 캘린더)·맥락(수급·경쟁사) 모두 부재. 페이지 수준 So What은 ROW4 actionPlan에 존재(정정 반영) — 진짜 공백은 뉴스→위젯/원문 연결 0건과 콘텐츠 동결.
- KPI 화살표 4중 3개(SKJ·YF·환율) 고정 — "갱신되지 않아 데이터 변경 시 조용히 거짓이 되는 동결 신호"(정정 표현). 라이브 값 + 동결 화살표 조합인 환율 카드는 당장 거짓 가능. 변동률(Δ%) 표시 0건.
- 의사결정 콘텐츠 4종 공백: 가격 시그널·어획/수급(FfaWcpoSupplyDashboard 등 기존 위젯 미노출)·규제 캘린더(docs/에 1차출처 14건 기보유)·경쟁사(DART 키 보유, 미사용).
- ROW2 차트: 아비장·비고 라인 04-30 조기 종료를 알리는 갭 주석 없음. ※ 정정: connectNulls 해제는 철회(주간 데이터 렌더에 필수), dot + 최종 관측일 주석으로 대체. TunaAtuna8YPrice "더 우수" 판정도 철회 — 항만별 토글이 dead key로 고장, YF 평균은 ×1.58 합성치 → 역방향(atuna_prices.json으로) 통일이 옳은 방향.

### 2.2 P0/P1/P2 통합표 (중복 발견은 병합, 렌즈 태그 병기)

| # | 등급 | 발견 (병합) | 렌즈 | 핵심 증거 | 노력 |
|---|------|------------|------|----------|------|
| 1 | **P0** | LiveTicker 11중 10 하드코딩 + 환율·Brent 동일화면 모순 + 만료 D-4 | ux·fresh·content ×3 수렴 | LiveTicker.tsx:15·33-45·73, /api/exchange 1529 실측 | S→M |
| 2 | **P0** | '오늘자' 라벨 8일 전 고정 + 실존하지 않는 동기화 날짜 SSR 노출 | ux·fresh ×2 수렴 | MarketDashboard.tsx:47-48·55, 라이브 HTML ×2 실측 | S |
| 3 | **P0** | 인증 = blur뿐, 페이월 730행 무인증 API 노출 | ux | page.tsx:806-808, 무인증 curl 42KB 수신 | M |
| 4 | **P0** | 메뉴 레지스트리 5~6중 중복 → beef 딥링크 회귀 실재, 게이트 미연결 | arch | page.tsx:117·119·129, tsc TS2367 2건, ignoreBuildErrors | M |
| 5 | **P0~P1** | rewrites 누락 7경로+SEO 파일 CSR 스피너 / 초기 번들 1.44MB | perf | BAILOUT 실측, 15청크 1,445,097B | L |
| 6 | P1 | atuna 시세 staleDays·isLive·경보 0건 (L-12 위반, 이 라우트만) | fresh | route.ts에 staleness 로직 0건 | S |
| 7 | P1 | Atuna Daily 파이프라인 사망 — launchd 미로드·소비처 0건 | fresh·content·bench ×3 수렴 | launchctl 'Could not find service', 최신 산출 05-21 | M |
| 8 | P1 | KPI 화살표 3/4 동결 + Δ% 부재 | ux·content ×2 | MarketDashboard.tsx:120-122·135-137·165-166 | S |
| 9 | P1 | /api/mgo 환산 추정치의 실호가 위장 + fallback 오늘 날짜 | fresh | route.ts:33·77-84 | S |
| 10 | P1 | ⌘K 커버리지 47% + 죽은 목적지 4건 | ux | CommandPalette.tsx:26-42 | M |
| 11 | P1 | 32개 평면 메뉴, 참치 동선 3분산 | ux | page.tsx:462-729 | M |
| 12 | P1 | 랜딩 다이제스트 수동 JSX·파이프라인 미연결 | ux·content ×2 | 뉴스 4건 'Atuna 2026.06.05' 하드코딩 ×6 | L |
| 13 | P1 | 죽은 import → recharts 342KB 초기 편입 | perf | page.tsx:15, 02-tqjx4 342,386B | S |
| 14 | P1 | recharts 4벌 중복 (추가분 ≈1.03MB) | perf | 동일 342,386B 청크 4개 md5 상이 | M |
| 15 | P1 | value-chain 2클릭 누적 ~6MB (petfood 4.2MB JSON) | perf | PetFoodMap.tsx:95 fetch 실측 | M |
| 16 | P1 | KeepAlivePanel 33개 무한 누적 | perf | KeepAlivePanel.tsx:23-31 | M |
| 17 | P1 | 신규 품목 온보딩 7곳+ 수정 | arch | dynamic import 45개·KeepAlive 33개 블록 | M |
| 18 | P1 | gitignore /data 빌드타임 import 101개 — 빌드 실패 3회 재발 원인 | arch | .gitignore:48, 고유 경로 110개 | L |
| 19 | P1 | 메인 라우팅 자동 테스트 0건 + lint 비활성 | arch | package.json:9, e2e는 /unloading 한정 | M |
| 20 | P1 | 루트 스크래치 325개 (단 .git 비대는 별건 — gc로 해결) | arch | 루트 실측, 대형 블롭 2.4GB | S |
| 21 | P1 | 의사결정 콘텐츠 4종 공백 (시그널·수급·캘린더·경쟁사) | content | MarketDashboard 전수 확인 | M |
| 22 | P1 | ROW2 차트 갭 주석·MA·이벤트 마커 부재 | content | :178-230, TakeawayBox 미부착 | S |
| 23 | P1 | 마켓 펄스·다이제스트 미노출 (※ 원인은 신규 갭이 아닌 기구현 파이프라인 휴면 — P2 운영 복구로 재분류) | bench ×2 | ADR 0007 자산 휴면 | S~M |
| 24 | P1 | 임계값 알림·오버뷰·워치리스트 부재 (Expana·Koyfin 패턴) | bench | rg 스캔 알림 채널 0건 | M |

P2 20건(반쪽 라우팅·이중 전달 47KB+42KB·재클릭 reload·JSON 번들 646KB·dead route 5개·Forensic 카드 빈 차트·/market 섬 고립·벤치마크 지수 간판화·PWA 푸시·TradingView 임베드·Vercel cron 제약 명문화 등)은 로드맵 §5에 배치.

---

## 3. 벤치마크 시사점

수산물 인텔리전스 5사(Tridge·Expana·UCN·Kontali·Atuna) + Vesper·Koyfin 조사 결과, 2025-26 공통 표준은 4종으로 수렴:

| 패턴 | 출처 | 참치왕국 현황 | 이식 방안 |
|------|------|--------------|----------|
| ① 정기 마켓 펄스 | UCN 주간 market pulse, Atuna 일일 뉴스레터 | **기구축 atuna-daily 파이프라인 휴면** (신규 갭 아님 — 정정 반영) | launchctl bootstrap 재가동 + 프론트 연결이 우선 경로. 신규 구축 불필요 |
| ② 워치리스트 + 임계값 알림 | Expana Alerts, Bloomberg Launchpad | 알림 채널 0건 | 1단계 운영자용: 로컬 파이프라인에서 ±X% 감지 → Resend 무료 100통/일. 2단계: Vercel Hobby cron(일 1회) 경량 체크 |
| ③ AI 다이제스트 | Tridge Eye(2025), Expana 통합플랫폼(2025.10), Vesper Vesbot | 파이프라인 존재하나 Vertex 호출 — **Google Cloud 청구 금지 룰 충돌** | Direct Gemini API 키(기보유 $100/월)로 전환 필수. 운영 복구(P2) 성격 |
| ④ 단일 오버뷰 모니터 | Koyfin Market Overview, Tridge Intelligence Dashboard | 25개+ 품목이 페이지별 분산, 전 품목 스캔 화면 없음 | /overview: 품목(행)×지표(현재가·MoM%·YoY%·스파크라인·갱신일·LIVE배지) 매트릭스. 기존 위젯 JSON + isLive API 재활용, 신규 데이터 0 |

**차별화 유지점**: 참치왕국의 출처 투명성 규율(isLive 정직화·STATIC 정직 라벨·trust_ledger 707위젯)은 이미 상용 수준이며 벤치마크 대비 강점. 비어 있는 것은 "데이터를 보러 오게 만드는" 리텐션 계층뿐이고, 4종 모두 Vercel Hobby 무료 한도 + 로컬 launchd 내에서 S~M 난이도로 이식 가능.

---

## 4. V-Next 제안 — 4테마

### 테마 A. 첫 화면 정직화 + 접근 통제 (P0 일소)

**목표**: 트레이더가 모순 수치 1개만 발견해도 전체를 불신한다 — 기본 진입 화면에서 거짓·모순·동결 신호를 0건으로.

| 기능 | 명세 | 노력 |
|------|------|------|
| A-1. LiveTicker 정리 2단계 | 1단계: 만료·검증불가 항목(CEPA D-4, YFT BKK $2,850 — 데이터에 yf_bkk 허브 자체 부재, Brent $106.2, BREAKING 2건) 즉시 삭제, 바인딩 가능한 MGO·환율·atuna 최신가만 잔류. 2단계: /api/exchange·/api/mgo(원시 brent 필드 추가)·/api/atuna-prices 3개 응답에서 동적 조립 + 항목별 신선도 점(LIVE/STATIC 배지 분해). D-day는 날짜 연산 + 만료 자동 제거 | S→M |
| A-2. '오늘자' 라벨 폐지 | 초기 state 가공 날짜 전부 제거 → 스켈레톤. 라벨은 응답 date 기반('API 연동 · {date} 기준'), date≠오늘이면 '오늘자' 단어 미출력. 초기값은 atuna_prices.json 실존 최신 행에서 빌드타임 주입 | S |
| A-3. KPI 동적 델타 | 이미 클라이언트에 import된 history(:14)에서 직전 비결측값 대비 Δ% 계산 → 화살표·색상 동적 부여 + 변동률 병기. 계산 불가 시 화살표 미렌더(고정보다 정직). staleDays>7이면 호박색 'N일 전' 뱃지 자동 부착 | S |
| A-4. MGO 라벨 정정 | cardDesc에 'Brent 선물 기반 환산 추정(계수 1.18×7.45)' 명시, fallback은 isLive:false + 실제 캐시 기준일. A-01(휴리스틱 금지) 최소 요건 | S |
| A-5. 인증 게이팅 실체화 | Next middleware에서 Supabase 세션 검증 → /api/* 401(페이월 소스 atuna-prices 우선). 미로그인 시 대시보드 마운트 차단, blur는 정적 '맛보기 스크린샷'으로 대체(연출 유지). 사이드바도 게이트 안으로. 공개 API는 최근 90일만 노출(약관 리스크 축소) | M |
| A-6. 단일 스냅샷 훅 | 같은 지표가 화면에 2번 나올 땐 useMarketSnapshot 1개 소스에서 파생 — 환율 이중값 류 구조적 재발 차단 | S |

### 테마 B. 무소음 실패 차단 — 파이프라인 재가동 + 신선도 자동 경보

**목표**: "갱신을 멈추면 아무도 모른다" 구조 자체를 제거. 신규 소스 확보가 아니라 기존 rclone·Gemini 경로의 복구·확장.

| 기능 | 명세 | 노력 |
|------|------|------|
| B-1. atuna-daily 재가동 | launchctl **bootstrap**(단순 reload 아님 — plist 로드 자체 안 된 상태) + 스크립트 말미 실패 시 osascript 알림 또는 healthchecks.io ping. LLM 호출은 Vertex → **Direct Gemini API 키 전환**(Google Cloud 청구 금지 룰 준수) | M |
| B-2. 업로드 누락 감지 훅 | 근본 원인은 사용자 docx 업로드 중단 — 3일 연속 누락 시 사용자 알림을 ~/.claude/harness/verify/ 패턴으로 추가 (verify_atuna_freshness.sh: >10일 경고 포함) | S |
| B-3. L-12 일괄 적용 | atuna-prices·exchange·mgo 3개 라우트에 isLive + staleDays 추가. **RELIABILITY_MASTER_PLAN I-3(빈 fallback 21건 일괄 패치)와 같은 배치로 처리** — 별도 기획 아닌 기존 마스터플랜 편승 | S |
| B-4. 다이제스트 프론트 연결 | MarketDashboard ROW3을 /api/atuna-daily?days=4 소비로 전환, 데이터 없으면 '최근 동기화 {date}' 정직 표기. 스키마는 기존 impact_on_korea 활용(so_what 신규 불필요 — 정정 반영), affected_hubs·deadline 필드만 추가. ROW4는 뉴스 재탕 대신 '주간 종합 1장'으로 통합 | M |
| B-5. 가격 추출 확장 | 구독자 자격으로 받는 일일 뉴스 docx에서 가격 인용을 Gemini 구조화 추출 → atuna_prices.json 자동 append(price_quotes 필드). atuna.com 직접 스크래핑은 약관 위반 소지로 비권장. 교차 검증: FFA Trade & Industry News(격월 무료)·태국 관세청 수입단가(월간) | M |

### 테마 C. 구조 부채 해소 — 레지스트리·게이트·성능 퀵윈

**목표**: 빅뱅 분해 없이, "같은 사실의 다중 정의"를 구조적으로 불가능하게. 신규 품목 온보딩을 7곳+ → 3개 변경 지점(레지스트리 1줄 + 컴포넌트 1개 + 데이터)으로.

| 기능 | 명세 | 노력 |
|------|------|------|
| C-1. 죽은 import 제거 | page.tsx:15 TunaChart 1줄 삭제 + MgoChartModal dynamic 전환 → gzip 98KB·파싱 342KB 즉시 절감. 시간 단위 최대 효율 퀵윈 | S |
| C-2. lib/menuRegistry.ts | `MENUS = [{id, label, section, loader, shortcut?}] as const` 단일 정의, union은 `typeof MENUS[number]['id']` 파생. 사이드바·CommandPalette·validMenus·KeepAlive·단축키·**next.config rewrites(6번째 목록 — 정정 반영)** 전부 파생. beef 회귀 자동 해소, 메뉴 관련 `as any` 4곳 제거 | M |
| C-3. 최소 테스트 그물 3종 | (a) 레지스트리 정합성 단위 테스트 1개 (b) **기존 e2e/run-tests.js + puppeteer 러너에** 32-카테고리 딥링크 스모크 추가(Playwright 신규 도입 아님 — 정정 반영) (c) lint를 경고 허용 모드로 활성화. 전면 커버리지 시도 금지 | M |
| C-4. pre-push 데이터 정합성 훅 | 'components가 import하는 data/ 경로 ⊆ git ls-files' 검증 — Vercel 빌드 실패 3회 재발 차단. 이관보다 선행 | S |
| C-5. KeepAlive LRU | 최근 2~3개 탭만 keep-alive, 초과분 언마운트. Recharts collapse 함정(L-05)과 얽히므로 C-3(b) 스모크와 같은 PR로 검증 비용 공유 | S~M |
| C-6. value-chain 페이로드 | petfood JSON은 서버 라우트에서 지역 집계만 슬라이스(클라이언트 4.2MB 원본 금지), geojson 2종 public/ 셀프호스팅 + 모듈 공유 캐시, echarts는 뷰포트 진입 시 dynamic | M |
| C-7. 라우트 세그먼트 전환 | app/(dashboard)/layout.tsx에 사이드바 RSC + 품목별 라우트 세그먼트. rewrites·ssr:false·replaceState 핵 제거, recharts 4벌 중복(Turbopack 엔트리별 청킹) 자연 해소, P2의 뒤로가기·재클릭 reload도 함께 해결. 주 단위 근본 작업 — Phase 3 | L |
| C-8. 위생 일괄 | `git gc --prune=now`(히스토리 재작성 아님 — 대형 블롭 회수, 정정 반영), 스크래치 287개 `git rm --cached` + scripts/_archive/ 이동(사용자 확인 후), puppeteer·xlsx devDependencies 이동, optimizePackageImports 추가 | S |

### 테마 D. 포지션 결정 도구화 — '읽을거리'에서 '결정 도구'로

**목표**: 트레이더의 3질문 — 방향(델타)·시점(캘린더)·맥락(수급) — 에 기존 자산 조립만으로 답하기. 신규 데이터 수집 0건.

| 기능 | 명세 | 노력 |
|------|------|------|
| D-1. 시그널 보드 | 허브별 WoW/MoM 모멘텀 + 방콕-만타 스프레드(차익거래 신호) + SKJ/YF 비율(캐너 마진 프록시) + 현재가 12개월 %ile 밴드 — 기존 730행 JSON 클라이언트 계산만으로 완성 | S |
| D-2. 규제 D-day 캘린더 | WCPFC FAD 클로저(7-9월)·UK 관세 발효(6/21)·IOTC 일정을 정직한 STATIC JSON(분기 수동 갱신)으로, 이벤트별 가격 영향 방향 화살표. 1차출처는 docs/2026_tuna_industry_sources.md 14건 기보유 | S |
| D-3. 수급 컨텍스트 패널 | FfaWcpoSupplyDashboard·FfaEnsoCatchCorrelation 등 **기존 위젯 컴팩트 재사용** + value-chain 딥링크 — /market 섬 고립 해소 겸용 | S~M |
| D-4. ROW2 차트 고도화 | 마지막 관측 이후 dot + '최종 04-30' 주석(connectNulls 해제는 철회 — 정정 반영), 3개월 MA, 규제 이벤트 ReferenceLine, TakeawayBox(%ile SIT). TunaAtuna8YPrice는 atuna_prices.json으로 **역방향 통일** + 토글 dead key 수리 | S |
| D-5. /overview 매트릭스 | 품목×핵심지표 테이블(현재가·MoM%·YoY%·스파크라인·갱신일·LIVE배지), 클릭 시 해당 대시보드. 기존 위젯 JSON + isLive 재활용 | M |
| D-6. 워치리스트 | localStorage ★ 토글 → 상단 '내 관심 품목' 우선 정렬. 계정·DB 불필요, 추후 푸시 구독 품목과 통합 | S |
| D-7. 임계값 알림 | 1단계(운영자): 로컬 파이프라인에서 전월 ±X% 감지 → Resend(무료 100통/일). 2단계: Vercel cron 일 1회 KAMIS 체크 → 웹푸시(기존 PWA Phase 1 인프라 + sw.js push 핸들러 + VAPID + Supabase 테이블 1개) | M |
| D-8. 경쟁사 분기 트래커 | 동원·사조 DART 공시(키 보유) + Thai Union IR 요약, SYNCED 분기 라벨 | M |
| D-9. 벤치마크 지수 간판화 | 방콕 SKJ CFR을 '참치왕국 벤치마크'로 명명, 홈 히어로 대형 카드(현재값+장기차트+산정방법 명시). 월간 파이프라인이 1행씩 append하는 장기 자산 | S |

---

## 5. 로드맵 (효과×노력 배치)

### Phase 1 — 즉시 (1~2주): 신뢰 회복 + 무소음 실패 차단
| 항목 | 노력 | 기대효과 |
|------|------|---------|
| A-1 1단계 (티커 거짓 항목 삭제) | S | P0 ×3렌즈 수렴 사안 즉시 완화 |
| A-2 '오늘자' 라벨 폐지 | S | SSR 허위 신선도 제거 |
| A-3 KPI 동적 델타 + stale 뱃지 | S | 첫 화면이 '방향'에 답하기 시작 |
| A-4 MGO 추정치 정직화 | S | A-01 위반 해소 |
| C-1 죽은 import 제거 | S | 초기 gzip 98KB(-24% 파싱) 즉시 절감 |
| B-1 atuna-daily bootstrap + 실패 알림 + Gemini Direct 전환 | M | 무소음 실패 구조 제거, 비용 룰 준수 |
| B-2 업로드 누락 감지 훅 | S | 운영자 행동 의존 리스크 가시화 |
| B-3 L-12 3라우트 (I-3 배치 편승) | S | 기존 마스터플랜과 중복 없이 처리 |
| C-4 pre-push 데이터 정합성 훅 | S | 빌드 실패 4회째 재발 차단 |
| C-8 git gc + 스크래치 격리(사용자 확인 후) | S | 에이전트 탐색 노이즈 감소 |
| **A-5 인증 게이팅** | M | **페이월 노출 차단 — Phase 1 내 최우선 M 작업** |

### Phase 2 — 1개월: 구조 단일화 + 랜딩 가치
| 항목 | 노력 | 기대효과 |
|------|------|---------|
| C-2 메뉴 레지스트리 + C-3 테스트 그물 (같은 PR) | M | beef 회귀 해소, 드리프트 구조적 차단, 온보딩 7곳→3곳 |
| A-1 2단계 (티커 API 합성) + A-6 스냅샷 훅 | M | 동일화면 모순 구조적 재발 차단 |
| B-4 다이제스트 프론트 연결 | M | 수동 JSX 갱신 폐지, 'Daily' 이름값 회복 |
| D-1 시그널 보드 → D-4 차트 고도화 → D-2 D-day 캘린더 | S×3 | 권장 착수 순서: 신뢰 회복 후 시그널 — 알림·경쟁사보다 선행 |
| D-3 수급 패널 + /market 딥링크 | S~M | 117위젯 심층 탭으로의 동선 0 해소 |
| D-6 워치리스트 | S | 비용 0 리텐션 |
| C-5 KeepAlive LRU (C-3 스모크와 같은 PR) | S~M | 메모리 단조 증가 차단 |
| C-6 value-chain 페이로드 | M | 2클릭 6MB → 슬라이스 응답 |
| ⌘K 레지스트리 파생 + 한글 초성 검색 | S | 커버리지 47%→100%, 죽은 목적지 0 |
| IA 재편 (참치 허브/기타 수산/농축산 접힘/운영 도구) | M | 32→첫눈에 8±2 |

### Phase 3 — 분기: 근본 전환 + 리텐션 계층
| 항목 | 노력 | 기대효과 |
|------|------|---------|
| C-7 라우트 세그먼트 전환 | L | 번들·중복·라우팅 핵·P2 다수 일괄 해소 |
| B-5 가격 추출 확장 (docx → price_quotes) | M | 수동 동기화 의존 축소, 약관 안전 경로 |
| D-5 /overview 매트릭스 | M | 벤치마크 표준 ④ 이식 |
| D-7 임계값 알림 1→2단계 | M | 벤치마크 표준 ② 이식 |
| D-8 경쟁사 DART 트래커 | M | 의사결정 콘텐츠 4종 공백 마지막 칸 |
| D-9 벤치마크 지수 간판화 | S | 장기 자산화 |
| PWA 푸시 (sw.js + VAPID) | M | Phase 1 인프라 완성분 활용 |
| 데이터 계층 이관 (101개 import → public/data/API) | L | widget-audit 사이클 편승, 품목 단위 점진 |

---

## 6. 하지 않을 것 (Non-goals)

**검증에서 배운 것** — 기각 0건이었으나 verdictNote 정정 11건이 있었다. 발견 자체는 전부 실재했지만 심각도·범위 인플레가 섞여 있었다(모바일 차트 P1 → P3 위생으로 철회, "LLM 다이제스트 미도입 P1" → 기구현 파이프라인 휴면 P2로 재분류, "첫 화면 전부 CSR 스피너" → 7개 경로 한정). 교훈: **writer≠reviewer 교차검증 단계는 V-Next에서도 유지하고, "표준 기능 부재" 주장 전에 내부 자산 전수조사를 선행**한다.

**의도적 제외**:
1. **빅뱅 분해** — 1,149줄 모놀리스·34개 1,000줄급 대시보드의 일괄 재작성 금지. 레지스트리 추출 + 루프 치환 + widget-audit 사이클 편승으로 충분 (architecture 렌즈 결론).
2. **atuna.com 직접 스크래핑** — 구독약관 위반 소지. rclone+Gemini docx 경로 확장이 권장 경로.
3. **Google Cloud 유료 API(Vertex)** — 전역 금지 룰. LLM 호출은 Direct Gemini API 키 또는 Anthropic API만.
4. **다중 사용자 임계값 설정 UI** — 1인 운영 범위 초과. 알림은 운영자용 1단계부터.
5. **본격 가격 예측 모델** — L급·범위 밖. '전망 프록시'(시즌성+ENSO+선행지표, 방향+근거 서술)로 대체하고 과대 정확도 주장 금지.
6. **STATIC→LIVE 라벨 승격** — 라우트 백엔드 수정 없는 LIVE 라벨링은 허위. 수차례 기각된 원칙("STATIC = 정직한 라벨") 유지.
7. **Koyfin식 My Views(열 구성 저장)** — 보류.
8. **git history 재작성** — 전역 지침 금지. .git 비대는 gc로 해결(정정 반영으로 재작성 필요 자체가 소멸).
9. **중복 기획 금지 영역** — 오징어 API 고도화(기존 기획서 존재), 신뢰도 6대 이니셔티브(마스터플랜 설계 완료, I-1 승인 대기), 모바일 반응형(Phase 2 브리프 발행됨), 영상 콘텐츠(Veo/Lyria 금지). 본 기획서는 이들과 겹치는 항목을 전부 "기존 트랙 편승"(B-3=I-3 배치)으로만 다룬다.

---

## 7. 리스크와 전제

| 리스크/전제 | 내용 | 완화 |
|------------|------|------|
| 사용자 행동 의존 | atuna-daily 복구해도 docx 업로드(사용자)가 멈추면 데이터 없음 — 05-22~27 6일 미발견이 사망 원인 | B-2 누락 감지 훅. 파이프라인·운영 둘 다 복구해야 'Daily' 성립 |
| Atuna 약관 | 페이월 데이터 재배포 구조가 이미 존재 — 자동화 확대 전 약관 검토 필수 | A-5 인증 게이팅 선행 + 공개 API 90일 제한 + 직접 스크래핑 배제 |
| Vercel Hobby 제약 | cron 일 1회·10초·시각 ±1h | 무거운 작업은 로컬 launchd, cron은 경량 알림 체크만. 시간 단위 필요 시 GitHub Actions schedule 우회. 이 원칙 룰북 1줄 명문화 (P2 발견) |
| 라우트 전환(C-7) 부수 위험 | KeepAlive 폐기·Recharts collapse(L-05)·display:none 함정과 얽힘 | C-3 32-URL 스모크를 전환 전 구축, 같은 PR 검증 |
| 에이전트 병용 충돌 | CC+AG가 page.tsx 단일 파일 동시 수정 → beef류 누락 재발 | C-2 레지스트리로 수정 지점 분산이 곧 완화책. 레지스트리 완료 전까지 page.tsx 동시 작업 회피 |
| 빌드 게이트 부재 기간 | ignoreBuildErrors 해제는 별도 품질 트랙 — 즉시 해제 시 기존 에러로 배포 중단 위험 | lint 경고 모드 → 점증 강화. tsc --noEmit를 pre-push에 우선 연결 |
| 배포 규율 | Vercel GitHub Integration 단절 — 수동 deploy 지속 | 사용자 명시 "배포" 요청 전 프로덕션 push 금지(전역 지침). 본 기획 전체가 이 전제 하에 로컬·프리뷰 우선 |
| 데이터 이관 과도기 | gitignore /data import 101개는 Phase 3 완료 전까지 재발 가능 | C-4 pre-push 훅이 Phase 1에 선행 배치된 이유 |
| 비용 | 신규 유료 인프라 0 전제 — Resend 무료 한도·Gemini API 기보유 $100/월·Vercel Hobby 내 | 한도 초과 조짐 시 해당 기능 보류가 기본값 |

---

*근거 한계 고지: 본 기획서의 모든 발견·수치는 2026-06-10 기준 6렌즈 진단(교차검증 정정 반영)에서만 인용했으며, 새로운 측정·주장은 추가하지 않았다.*