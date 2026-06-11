<!-- 생성: 2026-06-11 전수 검토 워크플로우 (67 에이전트 · 리뷰 33유닛 → P0/P1 적대검증 → 합성) -->
<!-- 통계: 페이지 33 · 확정 179 (P0 52) · P2 174 · 기각 0 -->

# 참치왕국 대시보드 전수 검토 종합 보고서

## 1. 총평

- **검토 범위**: 33개 검토 단위(전용 대시보드 32 페이지 + 독립 라우트 6종 묶음 `/_standalone`). **확정 발견 353건 = P0 52 · P1 127 · P2 174**, 적대검증 기각 0건(PARTIAL 정정 6건 포함 전건 유지).
- **결함의 중심은 데이터가 아니라 '정직성 계층'**: 수치 무결성이 우수한 페이지(`/purse-seiner-db`, `/sashimi-steak`)조차 존재하는 반면, P0의 대다수는 가짜 LIVE 위장·신선도 위조·라벨-데이터 비동기 — 즉 "있는 데이터를 거짓으로 포장"하는 유형이다.
- **동일 메커니즘이 복붙으로 전파된 시스템 패턴**이므로, 페이지별 수선보다 아래 2절의 패턴별 일괄 수정이 압도적으로 효율적이다. P0 최다 페이지는 `/galchi`(6건, 아귀 데이터 오귀속 포함), `/_standalone`(4건), `/logistics`·`/mackerel`·`/shrimp`(각 3건).

## 2. 시스템 패턴 (핵심)

| # | 패턴 | 메커니즘 | 영향 페이지 | 일괄 수정 전략 |
|---|---|---|---|---|
| A | **가짜 LIVE/실시간 위장 (L-09)** | 정적·폴백·합성 데이터에 LIVE 배지·펄스 점·'실시간 연동중'·'[LIVE API 연동]' 텍스트 | fleet, logistics(3), value-chain(2), mackerel(2), galchi(2), shrimp(3), salmon, mangosteen, used-car, beef, korea-market, financial-risk(2), management — **약 14페이지, P0 19건** | ① 전 라우트에 L-12 `isLive:boolean` 의무화 ② 컴포넌트 LIVE 판정은 `isLive === true` 단일 기준으로 통일 ③ JSON/소스 내 '[LIVE API 연동]'·'실시간' 문구 grep 일괄 제거 스크립트 |
| B | **라우트 정직 신호 무시 — truthiness 격상** | 라우트가 `isLive:false`/`status:'STATIC'`을 선언해도 컴포넌트가 `data ? 'SYNCED' : 'STATIC'` 삼항으로 격상(STATIC 분기 도달 불가) | whelk(7곳), cashew(4곳), cassava(13위젯), cocoa(21곳), carrot, mackerel, salmon, korea-market, chicken | 동일 삼항 패턴 grep 후 `_metadata.status` 직접 소비로 L-07 일괄 치환 — 기계적 수정 가능 |
| C | **합성·난수 수치 생성 (A-01 위반)** | Math.random(research-lab TRL, used-car 환율·운임·유가, financial-risk WTI), 임의 계수(beef `us*0.85`·`\|\|500`, korea-market `×2.0`·CIF 상수, cashew `×1.2+40`, logistics FRED 비례식) | research-lab, used-car, financial-risk, beef, korea-market, cashew, logistics (+cassava 고아 라우트) | 난수·발명 상수 전면 제거. 산출 불가 값은 null + '미평가/추정' 정직 표기. 프록시 사용 시 출처·산식 cardDesc 명기 |
| D | **동일 지표 페이지 내 모순** | 같은 지표가 한 화면에서 2~4개 값(갈치 수입량 13.5/26.8/53.6천톤, 명태 러시아 의존 94.8/88/42%, 웰크 영국 52.1/30.46/60%, 연어 적자 17배, 망고스틴 1,000배 등) | galchi, pollock, whelk, salmon, pork, garlic, cocoa, mangosteen, jukkumi, chicken, carrot, flatfish, msc, squid, fleet, fleet-strategy, cashew, beef, used-car, sashimi-steak — **약 20페이지** | 지표별 단일 출처(SSOT) 확정 + 집계 스코프(HS코드·기간·모수)를 cardDesc에 의무 명기. KPI는 하드코딩 대신 위젯 데이터에서 파생 계산 |
| E | **syncDate 위조·일괄 fallback** | `\|\| '2026-05'`류 일괄 문자열(squid 60여개·jukkumi 30개·galchi 30개·cold-storage 20개·shrimp 40개), 현재시각을 갱신일로 스탬프(value-chain, cashew, mangosteen 5초 시계) | squid, jukkumi, galchi, cold-storage, flatfish, shrimp, value-chain, cashew, mangosteen, cocoa, cassava, salmon | fallback 문자열 제거(TelemetryBadge는 syncDate 부재 시 날짜를 생략하므로 제거만으로 안전) → 이후 위젯별 데이터 빈티지를 채우는 스크립트 |
| F | **시점 동결 콘텐츠의 현재형 서술** | 하드코딩 D-day(fleet), 만료 ETA(logistics 4척·unloading Gensan 5주), 과거 분기를 '현재/최근'으로(pollock 2025-Q1, pork CBOT -1d), 만료 전망 (F)/(E) 라벨(cocoa 7개월, cashew, salmon) | fleet, unloading, logistics, pollock, pork, cocoa, cashew, salmon, used-car, cassava, chicken, value-chain | 날짜 파생값(D-day·요일)은 렌더 시점 계산으로 전환, 갱신 불가 데이터는 기준일 명시 + 과거형 서술로 일괄 전환 |
| G | **차트-텍스트(SIT/제목) 비동기** | SIT·제목의 수치가 자기 차트 JSON과 충돌(garlic w8 연도 자체가 다름, carrot 수율 10배, cocoa 콘탱고↔백워데이션 정반대, mangosteen 스택 108%) | garlic(7건), carrot(6+), cocoa(4), mangosteen(2), chicken, cashew, galchi, flatfish, salmon, whelk | SIT 인용 수치를 차트 JSON에서 재검산하는 검증 스크립트 신설(파생 통계 자동 산출) + "데이터 갱신 시 텍스트 동반 갱신" 규율 |
| H | **렌더러-데이터 키 계약 파괴 → 빈 차트·영문 노출** | 신형 포맷 미구현(jukkumi 10개 'Unsupported Format'), `key` vs `dataKey` 불일치(pollock w27), bars 키 부재(galchi), 유령 막대(salmon w43), `name` prop 미전달로 영문 범례(galchi 32/33, shrimp 15+) | jukkumi, pollock, galchi, salmon, shrimp, octopus | renderChart 공용 모듈화 + `name={b.name \|\| b.key}`·`dataKey={b.key \|\| b.dataKey}` 폴백 1줄 패치, JSON 스키마 검증을 빌드 게이트에 추가 |
| I | **헤더 위젯/API 카운트 허위** | 하드코딩 숫자가 실렌더와 불일치(value-chain 93 vs 160+, salmon 45 vs 73, shrimp 16 vs 9 자기모순, octopus '0개') — 과거 audit의 120→117 정정 유형 재발 | value-chain, squid, salmon, pollock, pork, beef, carrot, msc, whelk, jukkumi, cashew, shrimp, octopus, galchi | 하드코딩 제거, `widgets.length` 등 동적 산출로 교체. 카운트 클레임을 audit 스크립트 자동 검증 대상에 편입 |
| J | **W-04 구조 전면/부분 부재** | TelemetryBadge·cardDesc·SIT/TAK 0개 페이지 존재 | unloading(12블록), research-lab(44블록), purse-seiner-db(7위젯), fleet, fleet-strategy, korea-market(라이브 3종), value-chain(Operational 33종), used-car | WidgetCard/CardHeader 래핑 일괄 적용 + 데이터 기준일 주입 (L-07) |
| K | **소스 데이터 오귀속 (종·HS코드·모수)** | 갈치 페이지 전체가 아귀(0303899060) 통관 데이터, 주꾸미 KPI=문어류 OCT 합산, 낙지=문어류 전체, 돈육 '글로벌'=중국 단독, OSH 참치·새우 가공사를 '고등어 시설'로 | galchi, jukkumi, octopus, pork, mackerel, chicken | **자동화 불가 — 개별 수정**: 원천 코드(HSK)·집계 범위 재확인 후 데이터 재수집. HS코드는 단일 출처 파일(L-04)로 관리 |

부수 패턴(P2 위주): 고아 라우트·죽은 fetch 약 14페이지, fetch 실패 시 무한 로딩(O-01) 5페이지, 인라인 TelemetryBadge 복사본 4페이지 — 위생 스프린트 1회로 일괄 정리 권장.

## 3. 페이지별 상세

| 페이지 | P0 | P1 | P2 | 대표 발견 |
|---|--:|--:|--:|---|
| /fleet | 2 | 6 | 3 | 전면 하드코딩에 '실시간 운항 중' 배지, 한 화면에 3개 보고 시점 혼재(일정 모순 4건) |
| /unloading | 1 | 7 | 3 | 3.5개월 누적을 '주간 하역량'으로 표기, W-04 신선도 표기 전무, report_date 사전식 정렬 임박 결함 |
| /logistics | 3 | 5 | 3 | 정적 위젯 3개 LIVE/Realtime, '입항 예정' 4척 전부 3~5주 과거 |
| /value-chain | 2 | 8 | 6 | /api/tuna 무조건 LIVE+오늘 스탬프, MOF 연동 사망, 헤더 93 vs 실렌더 약 160+ |
| /cold-storage | 1 | 1 | 6 | 툴팁 단위 이중 합성 — CJ대한통운 매출 10배 과소 표기 |
| /mackerel | 3 | 4 | 6 | apiSource 존재만으로 LIVE 휴리스틱, eurostat 카탈로그 핑 isLive, KPI 시장규모 1/3 축소 |
| /galchi | 6 | 6 | 4 | 아귀 HSK 데이터 위에 세운 핵심 수입 서사(중국 95.9% 허위), 범례 영문 32/33 |
| /squid | 0 | 5 | 5 | syncDate '2026-05' 일괄 fallback, 2024 수입량 207 vs 141.3천톤 모순 |
| /jukkumi | 2 | 2 | 7 | 신형 포맷 10개 'Unsupported Format' 깨짐, OCT 합산을 주꾸미 단독 KPI로 둔갑 |
| /octopus | 1 | 2 | 4 | 부재 라우트 fetch로 '총 0개 위젯' 거짓 카운트, 문어류 집계를 '낙지'로 라벨 |
| /pollock | 2 | 2 | 4 | w27 빈 차트, AI 예측 엔진 '현재 가격'=2025-Q1(4~5분기 과거) |
| /flatfish | 0 | 2 | 6 | F10 -23.7% vs 자기 차트 -41.9% 등 수치 모순 2건, 라이브 연동 전무 |
| /shrimp | 3 | 3 | 2 | KPI mock·조작 산식에 '실시간 연동중', 정적 9건 '[LIVE API 연동]' 허위 텍스트 |
| /whelk | 1 | 1 | 9 | 영국 점유율 52.1%/30.46%/시각 60% 3중 모순 |
| /salmon | 2 | 3 | 7 | 폴백 캐시 상시 LIVE 배지, 무역적자 17배 모순, SIT에 키릴 문자 혼입 |
| /cashew | 1 | 8 | 5 | 'SIT 실측:' vs 출처줄 '실측 아님' 자기모순, 39개 위젯 FAOSTAT 일괄 허위 출처 |
| /cassava | 2 | 2 | 6 | 동기화 날짜 3종 한 화면 충돌, Sankey가 헤드라인 '99.9% 의존'과 정면 모순 |
| /garlic | 2 | 7 | 5 | 구버전 data/ 정적 import로 차트-본문 모순 다발(2024 생산량 285K vs 320K) |
| /carrot | 1 | 5 | 6 | 수율 10배 단위 오류 + 면적 증감 방향 반대, SIT-차트 비동기 6개+ |
| /cocoa | 2 | 6 | 6 | 사상최고가 이중 주장($10,092 vs $12,000), 가나 80% vs 차트 18% |
| /mangosteen | 2 | 4 | 4 | 시뮬레이션 라우트에 9개 위젯 상시 LIVE, 한국 재수출 1,000배 과장(355kg→350톤) |
| /chicken | 0 | 4 | 9 | 한국 수입 점유율 3중 충돌(86/9 vs 72/21 vs 13), 시나리오에 '실측' 라벨 |
| /pork | 2 | 3 | 6 | 중국 단독 생산을 '글로벌'로 표기, 'CBOT -1d' 배지로 21개월 묵은 값 위장 |
| /beef | 1 | 3* | 8 | LIVE 경로 내부에 수입육 동결 상수·합성값(us×0.85) 혼입 (*W3 1건은 잠재 P2 재분류 권고) |
| /used-car | 2 | 2 | 5 | cardDesc 11개 한 칸씩 시프트(3건 절단), Math.random 환율·운임을 '실시간/SYNCED' 표기 |
| /seasia-oem | 0 | 2 | 6 | 자체 검증메모 '입증 불가' 판정을 카드 인증 배지로 단정 표시(reviewFlag 미렌더) |
| /fleet-strategy | 2 | 3 | 3 | 5/9 카테고리 상세 데이터 전무('검증 완료 0척'), launchDate 공란→선령·'건전' 날조 |
| /korea-market | 1 | 6 | 4 | 존재하지 않는 6월 누적 라벨, ×2.0 배수 추정·하드코딩 CIF를 '실시간'으로 포장 |
| /research-lab | 1 | 4 | 3 | 라이브 논문 TRL·상업성 점수 Math.random 생성, W-04 페이지 전체 0개 |
| /purse-seiner-db | 0 | 2 | 4 | 데이터 무결성 우수(155척 전수 검증), 단 W-04·L-01 규격 미달 |
| /msc | 0 | 4 | 6 | 연감 판본(2024 vs 2025-26) 혼용으로 핵심 KPI 4건 상호 모순 |
| /sashimi-steak | 0 | 1 | 6 | 구조 품질 상위권(68/68 W-04 완비), 對美 관세 '무관세' vs '15% 발효' 모순 1건 |
| /_standalone(6종) | 4 | 4 | 7 | financial-risk 3중 위장(LIVE+난수 차트+가짜 Gemini), management 3개월 전 공시 'DART LIVE' |
| **합계** | **52** | **127** | **174** | |

## 4. P0 전건 상세 (52건)

**/fleet (2)**
1. **가짜 '실시간 운항 중' 배지** — FleetHeroKPI.tsx:16-17 펄스 점+배지, 클로저 전체 fetch 0건·전량 일일보고 하드코딩 → 배지 제거, STATIC + syncDate '2026-06-10'('일일 업무보고 26.06.10 동기화').
2. **쉘 TAK(6/8) vs 로스터(6/10) 일정 모순 4건** — SHIN FUJI 6/15↔6/14, SEIN GALAXY 6/10↔6/11, S/JUP·P/PATH 동일 패턴. 타 에이전트의 미완 동기화 → TAK·source를 260610 보고서 기준으로 재작성.

**/unloading (1)**
3. **'주간 통합 하역량' = 2~6월 전 선박 누적 17,108MT** (실주간 3,888MT의 약 4.4배, PARTIAL 정정 반영) — UnloadingStatus.tsx:814-817 → 라벨 '누적 통합 하역량(2026년)' 정직화 또는 최근 7일 필터 합산.

**/logistics (3)**
4. **TraderStatus LIVE/Realtime** — 정적 1~5월 배열, fetch 0건 → STATIC '2026-05', cardDesc '실시간 갱신' 제거.
5. **CarrierUnloadingStatus LIVE/Realtime** — 정적 테이블 → STATIC '2026-05-25', SIT 과거형 전환.
6. **만료 '입항 예정' 4척** — 도착예정 전부 3~5주 과거, 2척은 이미 접안 기록 존재 → 최신 주차 갱신 또는 '5월 입항 실적(완료)' 라벨.

**/value-chain (2)**
7. **kpi_climate_risk telemetry 'live'** — NOAA fetch 코드 부재 → 'static'+기준일, 또는 실제 NOAA 연동 후 isLive 분기.
8. **w01_paradigm 실패 시에도 '[LIVE] 갱신: 오늘'** — 1~4월 하드코딩 + 무조건 LIVE 문자열 → 성공 여부 분기 + `isLive` 필드 출력.

**/cold-storage (1)**
9. **툴팁 단위 이중 합성** — smartFormat 키워드 단위 + 위젯 unit 중복 부착, w03 매출 12.12조를 '12,120억원'으로 10배 과소 → 단위 부착 단일화, 시리즈별 단위 매핑.

**/mackerel (3)**
10. **w24·w43 apiSource 휴리스틱 LIVE+오늘 날짜** — `|| w.apiSource` truthy 조건 → 해당 조건 제거, STATIC + 실제 빈티지.
11. **eurostat 카탈로그 핑만으로 isLive=true** — 데이터는 항상 2019-2023 FALLBACK → 실데이터 파싱 성공 시에만 true(mackerel-comtrade 패턴 이식).
12. **KPI 동적 재계산 모순** — '2023 시장규모' 타이틀에 2025Q1 분기값 $1.85B(원본 $6.09B의 1/3) → 분기/추정 행 제외, title·desc 동적 생성.

**/galchi (6)**
13. **KCS 파이프라인 전체가 아귀(0303899060) 데이터** — 실측 갈치는 0303892000(13.4천톤·오만 1위), '중국 95.9%·CIF $2.08' 서사 허위 → HSK 교체·FALLBACK 재산출·KPI/티커/intel 전면 재작성.
14. **w17 자기모순** — 부제 '중국 95% 고착' vs 자기 차트 42.8~48%, 총량 3종(13.5/26.8/53.6천톤) 충돌 → 갈치 코드 재산출 후 단일 기준 정합화.
15. **renderChart name 미전달** — 32/33 위젯 범례·툴팁 영문 키 노출 → `name={b.name || b.key}` 1줄 추가.
16. **KOSIS 위젯 LIVE 배지+표본 데이터** — healthcheck 200만으로 isLive:true → CPI 실매핑 전까지 false 고정.
17. **w_galchi_hs_class 빈 차트** — bars 키 '분류 정확도(%)'가 데이터에 부재 → 응답 키 매핑 또는 bars key를 conf로.
18. **KPI1 '위판 평균단가'에 도매가 28,500원** — 같은 페이지 위판가 10,300원과 2.8배 모순 → 제목 '도매 평균단가(KAMIS)' 정정.

**/jukkumi (2)**
19. **신형 포맷 10개 'Unsupported Format'** — renderChart가 series 분기만 구현, w21~w30 전 Pillar 깨짐 → 신형 분기 구현 또는 series 포맷 일괄 마이그레이션.
20. **KPI1 OCT 합산 16,069톤을 주꾸미 단독 둔갑** — 자기 페이지 w1 SIT가 '단일종 아님' 명시, 출처도 해수부 아닌 FAO → 정직 라벨링 또는 KMI 실측(1.6천톤)으로 교체.

**/octopus (1)**
21. **부재 라우트 /api/octopus-intelligence fetch** — 404로 헤더 '총 0개 위젯', 전 Part '0 위젯' 거짓 카운트(아래에 위젯 10개 실표시) → fetch 제거, EXTRA_BY_PILLAR 합산 카운트.

**/pollock (2)**
22. **w27 빈 차트** — bars/lines가 `dataKey` 필드인데 렌더러는 `key`만 소비 → 신형 필드 제거(완전한 series 병존) 또는 폴백 보강. 단위 (USD/t)→(RUB/kg) 정정.
23. **AI 예측 시점 동결** — '현재 가격'=2025-Q1, '다음 Q 예측'=2025-Q2(4~5분기 과거) → '최종 관측(2025-Q1)'/'모형 예측(백테스트)' 정직화 또는 동적 분기 갱신.

**/shrimp (3)**
24. **KPI3 mock $8,113 '실시간 연동중'** — isLive 미검사, 라이브/폴백 양쪽 하드코딩, 제목 '(2022)'와 자기모순 → `isLive === true` 제한, 정적값+STATIC 유지.
25. **KPI6 693×(환율/1385) 조작 산식** — USD 적자를 KRW 환율로 스케일링한 무의미 합성값에 LIVE 배지 → 치환 로직 삭제, macro 라우트에 isLive 추가.
26. **정적 9건 '[LIVE API 연동: Trade Map/World Bank/BOK…]' 허위 표기** — 해당 연동 라우트 부재(1건은 정밀화 필요) → L-07 일괄 제거 스크립트.

**/whelk (1)**
27. **영국 점유율 3중 모순** — KPI 52.1% vs SIT 30.46%($M 금액의 % 오기) vs 파이 시각 60%(기타 누락) → SIT '$30.4M(점유율 52.1%)' 정정 + '기타 $7.8M' 추가.

**/salmon (2)**
28. **KPI3·KPI6 가짜 LIVE** — 객체 truthiness만 검사, 폴백에도 '실시간 연동중', kpi3는 응답 경로도 불일치 → `isLive === true` 검사 + commodities 경로 + '/kg' 단위 정정.
29. **무역적자 17~21배 모순** — w10 -$30M vs kpi6·w15 5.1억$, 수입량 3,537 vs 76,000톤, 내러티브가 자체 데이터와 정반대 → HS 서브셋 스코프 명시 또는 전체 집계로 교체.

**/cashew (1)**
30. **추정 데이터에 'SIT 실측:' 라벨** — 같은 카드 출처줄이 '실측 아님' 명시(3개 위젯) → 선두 라벨 '추정:'/'시나리오:'로 교체.

**/cassava (2)**
31. **동기화 날짜 3종 충돌** — 헤더 05-07 vs 배지 05-15(출처 불명 하드코딩) vs JSON 06-06 → 라우트 `_metadata.lastSynced` 단일 출처화.
32. **Sankey 하드코딩** — 가나→한국이 메콩 2국과 동률(50%)로 헤드라인 '99.9% 의존'과 정면 모순 → Comtrade 실측 재산정, 계획 물량은 점선 분리.

**/garlic (2)**
33. **w8 무역수지** — 제목 '2026.03-04 누적 -$10.08M' vs 차트 2019~2023 연간(-65~-107) → 데이터 교체 또는 텍스트 복원으로 일치화.
34. **2024 생산량 285K vs 320K 동시 표시** — GarlicUsdaWidgets가 구버전 `data/` JSON 정적 import → `public/data/` 수정본으로 소스 교체(재발 방지: API 경유 통일).

**/carrot (1)**
35. **수율 10배 단위 + 면적 방향 반대** — JSON 4.47(t/ha 라벨, 실제 44.7의 1/10) vs SIT 38t/ha, 면적 -5.6% 감소인데 SIT '+6% 증가' → JSON 10배 보정 + SIT 재서술.

**/cocoa (2)**
36. **사상최고가 이중** — cardDesc $10,092(2024-12) vs SIT $12,000(2024-04, 차트에 부재) → $10,092 단일 앵커 통일.
37. **가나 80% vs 차트 18%** — SIT '가나산 80%' vs Sankey 가나 18%·코트디부아르 32%, '네덜란드' 노드 부재 → 관세청 실측 확정 후 한쪽으로 정렬.

**/mangosteen (2)**
38. **9개 위젯 상시 LIVE** — 시뮬레이션 URL 5건+순수 하드코딩, `length>0`이면 LIVE 분기 → isLive 필드 추가, 현 상태 전부 STATIC + 실제 시점.
39. **재수출 1,000배 과장** — '연 350톤' vs KCS 실측 355kg(2024), 단가·태국 물량도 불일치 → kg 스케일 재산출, 재수출 허브 서사 사실 재검증.

**/pork (2)**
40. **중국 생산량(57,948천톤)을 '글로벌'로 표기** — 같은 페이지 USDA 위젯(중국=글로벌 48%)과 정면 모순, W1 내부 라벨 충돌 → KPI·W1 '중국'으로 통일 또는 글로벌 합계로 교체.
41. **Hog-Corn 'SYNCED/CBOT -1d'** — 2024-Q3 동결 하드코딩을 어제자처럼, SIT '최근 급락' 현재형 → STATIC '자체구성 2024-Q3', 서술 과거형.

**/beef (1)**
42. **W8 LIVE 경로 내 수입육 동결·합성** — itemcode 오류로 usImport 항상 fallback 상수, 호주산은 `us*0.85` 합성식, 이대로 isLive=true → 부분 라이브 명시(partialLive), 합성 산식 삭제, 올바른 itemcode 조사.

**/used-car (2)**
43. **cardDesc 11개 off-by-one 시프트 + 3건 절단** — 전 위젯 설명문이 '다음 위젯' 내용 → 역방향 시프트 스크립트 + 절단 복원 + 관세 시뮬레이터 신규 cardDesc.
44. **Math.random 가짜 실시간** — 환율·운임·유가 난수 생성 + 'SYNCED·KCS API'·networksStatus 'Online' 하드코딩, 계산기 결과 새로고침마다 ±1.4% 변동 → 난수 전부 제거, isLive:false, STATIC+기준일 정직화.

**/fleet-strategy (2)**
45. **5/9 카테고리 상세 데이터 전무** — vessel_master.json 키 5개뿐, '전수조사 검증 완료 · 0척' 모순 표시 → 명부 보강 또는 정직한 '준비 중' fallback.
46. **명태 launchDate 공란 → 선령·상태 날조** — 빈값이 '2000'으로 대체돼 최고령 선단(51.7년)이 '평균 26.0년'+전 선박 '건전'+'(NaN년)' → null 분기('정보없음'), 빈값 제외 평균.

**/korea-market (1)**
47. **존재하지 않는 6월 누적 라벨** — 달력 월 기준 '1~6월(6개월 누적)' vs 데이터 ~2026.05, 같은 헤더의 '~2026.05'와 모순 → 데이터 실측 최신월로 라벨 산출.

**/research-lab (1)**
48. **TRL·상업성 점수 Math.random** — 새로고침마다 게이지·별점 변동 → 난수 제거, null + '미평가(신규 수집)' 배지.

**/_standalone (4)**
49. **financial-risk LIVE 배지 상시** — 무조건 렌더 + mock fallback 미감지, isLive 부재 → isLive 표준 필드 + 동적 분기 + 실패 fallback UI.
50. **financial-risk WTI 14D 차트 = Math.random** — 주석 자백된 더미 난수 → 실시계열 연동 또는 '예시(모의)' 워터마크/제거.
51. **financial-risk 'GEMINI 3 PRO ANALYSIS' 위장** — 고정 문자열 템플릿, LLM 호출 없음 → '룰 기반 리스크 메모(자동 생성)'로 라벨 정직화.
52. **management 'DART LIVE' 위장** — 3개월 전 공시 2건 하드코딩 + 펄스 점멸, 최신 dart_news(05-14) 미사용 → dart_news 렌더 + 'DART 공시(2026-05-14 동기화)' 라벨, 'XBRL 크로스체크' 배지 제거.

## 5. 수정 배치 제안

### 배치 A — L-07 스크립트 일괄 수정 가능 (기계적, 사실 확정 불요)
1. **telemetry 삼항 치환**: cocoa 21곳·whelk 7곳·cashew 4곳·cassava·carrot·korea-market — `_metadata.status` 소비 패턴으로 grep+치환.
2. **'[LIVE API 연동]'·'실시간' 문구 제거**: shrimp 9건·mackerel·value-chain·used-car JSON/소스.
3. **syncDate fallback 제거**: squid(`'2026-05'`)·jukkumi·galchi(`'KFAS 2024'`)·flatfish(`'2026-04'`)·cold-storage(`'2026.05.15'`) — 제거만으로 안전(배지 날짜 생략).
4. **renderChart name/dataKey 폴백**: galchi·shrimp·pollock 각 1~2줄.
5. **used-car cardDesc 역시프트** + ffa-report `**`→`<strong>` 치환(5곳).
6. **L-01 한글 매핑 테이블**: purse-seiner-db(국가 28·대륙·RFMO), seasia-oem, research-lab, management, mangosteen 등 — 매핑 1곳 추가로 일괄 처리.
7. **헤더 카운트 동적화**: 13개 페이지 하드코딩 숫자 → length 산출.
8. **jukkumi 신형 포맷 마이그레이션**: w21~w30 동일 구조 10개 → 변환 스크립트.

### 배치 B — 개별 수정 (원출처 확정·데이터 재수집 필요)
- galchi 아귀→갈치(0303892000) 전면 재수집·서사 재작성 | garlic data/↔public/data 소스 단일화 | fleet-strategy vessel_master 정제·보강 | mangosteen 재수출 kg 재산출 | cocoa 가나 80% 실측 확정 | beef KAMIS 수입육 itemcode 조사 | pollock·whelk·chicken·msc 등 수치 모순의 SSOT 확정 + 스코프 라벨.

### 우선순위 3단계
- **1단계 (즉시)**: P0 중 '거짓 신호 제거'형 — LIVE 배지/문구 제거·라벨 정직화·Math.random 제거·빈 차트 키 수정·cardDesc 역시프트. 대부분 수 줄 수정으로 신뢰 훼손을 즉시 차단. **+ /unloading report_date 정렬(P1이지만 6/10 데이터 입력 즉시 차트가 깨지는 임박 결함 — 1단계 편입).**
- **2단계 (단기)**: 데이터 확정이 필요한 P0/P1 — galchi 재수집, 페이지 내 수치 모순 SSOT 정렬(패턴 D 약 20페이지), 시점 동결 콘텐츠 갱신(패턴 F), L-12 isLive 라우트 표준화.
- **3단계 (상시 위생)**: P2 일괄 — L-01 한글화, W-04 보강, 고아 코드·죽은 fetch 정리, O-01 에러 상태 도입, 인라인 TelemetryBadge 복사본 제거.

## 6. 기각에서 배운 것

기각 0건 — 적대검증에서 353건 전건 유지(CONFIRMED 347 + PARTIAL 6)로 발견 파이프라인의 정밀도가 높았다. 다만 PARTIAL·정정의 공통점은 '7배→4.4배', '15개→42개', 줄번호·커밋 귀속 같은 **정량 디테일의 과장/오차**였으므로, 향후 발견 작성 시 결함 메커니즘(불변 핵심)과 정량 주장(재검산 대상)을 분리 서술하면 검증 비용이 더 줄어든다.