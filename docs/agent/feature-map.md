# 피처 맵 — 에이전트가 이 제품을 찾아가는 지도

이 문서는 **에이전트가 먼저 읽는 문서**다. 사람용 설명서가 아니다.
「어느 주소로 가면 그 화면이 나오나 · 그 화면의 숫자는 어디서 오나 · 어디서 발을 헛디디나」만 적는다.

- **자동 구역**(아래 표식 사이)은 `node scripts/feature_map.mjs --write` 가 코드에서 뽑아 쓴다. 손으로 고치지 마라.
- **함정·증거 구역**은 사람이 쓴다. 생성기가 덮어쓰지 않는다.
- 어긋나면 `npm run verify` 가 실패한다(`check:feature-map`).

<!-- BEGIN GENERATED — scripts/feature_map.mjs. 손으로 고치지 마라 -->

_생성: `node scripts/feature_map.mjs --write` · 메뉴 23개 · 정적 라우트 10개 · API 158개_

## 화면 — 어떻게 도달하나

`app/[category]/page.tsx` 가 `app/page.tsx` 를 통째로 다시 불러 그리는 단일 페이지 구조다.
그래서 아래 키는 전부 `https://leedonggun.co.kr/<키>` 로 열린다. 목록에 없는 키는 404 다.

| 키 (URL) | 화면 | 구역 | 접근 |
|---|---|---|---|
| `/market` | 시장 동향 | 운영 | 공개 |
| `/fleet` | 선단 운영 | 운영 | 운영 권한 |
| `/port-intel` | 부산 입출항 | 운영 | 운영 권한 · 숨김 |
| `/logistics` | 물류·가공 | 운영 | 운영 권한 |
| `/unloading` | 하역 현황 | 운영 | 운영 권한 |
| `/panofi` | 파노피 | 운영 | 공개 |
| `/cosmo` | 코스모 | 운영 | 공개 |
| `/bangkok-office` | 방콕사무소 | 운영 | 운영 권한 |
| `/gmts` | GMTS 주간보고 | 운영 | 운영 권한 |
| `/mail` | 메일 | 운영 | 관리자 · 숨김 |
| `/tuna-industry` | 참치 | 시장 이해 | 공개 |
| `/squid-industry` | 오징어 | 시장 이해 | 공개 |
| `/mackerel-industry` | 고등어 | 시장 이해 | 공개 |
| `/whelk-industry` | 골뱅이 | 시장 이해 | 공개 |
| `/shrimp-industry` | 새우 | 시장 이해 | 공개 |
| `/pollock-industry` | 명태 | 시장 이해 | 공개 |
| `/octopus-industry` | 문어 | 시장 이해 | 공개 |
| `/tunafarm-industry` | 참치 양식 | 시장 이해 | 공개 |
| `/tuna-anatomy` | 참치 해부 | 시장 이해 | 공개 |
| `/company-anatomy` | 기업 해부 | 전략 | 공개 |
| `/pork` | 돼지고기 | 축산 | 숨김 |
| `/cross-intelligence` | 통합 인텔리전스 | 전략 | 공개 |
| `/purse-seiner-db` | 선단 DB | 전략 | 공개 |

## 정적 라우트 (카테고리 키와 별개)

`/bni-global` · `/design-lab` · `/falkland` · `/ffa-report` · `/financial-risk` · `/management` · `/manual` · `/omo-preview` · `/squid` · `/squid-v5`


### 은퇴한 주소 — 열면 404 (19개)

`page.tsx` 가 `notFound()` 한 줄만 들고 있다. 폴더가 보인다고 화면이 있는 게 아니다.

`/beef` · `/cashew` · `/cassava` · `/flatfish` · `/fleet-strategy` · `/galchi` · `/jukkumi` · `/kim` · `/korea-market` · `/mackerel` · `/mail` · `/octopus` · `/pollock` · `/research-lab` · `/salmon` · `/shrimp` · `/used-car` · `/value-chain` · `/whelk`

## API

158개.

<details><summary>전체 목록</summary>

- `/api/atuna-daily`
- `/api/atuna-prices`
- `/api/beef/global-production`
- `/api/beef/hanwoo-price`
- `/api/beef/korea-imports`
- `/api/beef/korea-supply`
- `/api/beef/slaughter-rate`
- `/api/beef/trade-flow`
- `/api/beef/usda-fas`
- `/api/bni-global`
- `/api/carrot/arbitrage`
- `/api/carrot/dashboard`
- `/api/carrot/fao`
- `/api/carrot/kamis`
- `/api/carrot/trq`
- `/api/carrot/w1-spread`
- `/api/carrot/w20-phyto`
- `/api/cashew`
- `/api/cashew/kcs`
- `/api/cashew/usda-fas`
- `/api/cassava`
- `/api/cassava/arbitrage`
- `/api/cassava/cbot`
- `/api/cassava/dfi`
- `/api/cassava/early-warning`
- `/api/cassava/esg`
- `/api/cassava/noaa`
- `/api/chicken/arbitrage`
- `/api/chicken/corporates`
- `/api/chicken/eggs`
- `/api/chicken/feed-cost`
- `/api/chicken/global-export`
- `/api/chicken/global-production`
- `/api/chicken/parts`
- `/api/chicken/processing`
- `/api/chicken/trade-shift`
- `/api/chicken/usda-fas`
- `/api/cocoa/dashboard`
- `/api/cold-storage/widget`
- `/api/compliance`
- `/api/comtrade`
- `/api/consignment`
- `/api/cron/weekly-briefing`
- `/api/cross-commodity-intelligence`
- `/api/dart-insight`
- `/api/eurostat`
- `/api/exchange`
- `/api/financial-risk`
- `/api/fishery`
- `/api/flatfish/kcs`
- `/api/fleet/daily`
- `/api/galchi/comtrade`
- `/api/galchi/hsping`
- `/api/galchi/importyeti`
- `/api/galchi/intel`
- `/api/galchi/kamis`
- `/api/galchi/kcs`
- `/api/galchi/kosis`
- `/api/galchi/mfds`
- `/api/galchi/noaa`
- `/api/galchi/oec`
- `/api/galchi/ofac`
- `/api/galchi/osh`
- `/api/galchi/tariffs`
- `/api/galchi/wto`
- `/api/garlic/widget`
- `/api/generate-rfq`
- `/api/hermes`
- `/api/hs-ping`
- `/api/import-yeti`
- `/api/jukkumi-intelligence`
- `/api/jukkumi/kcs`
- `/api/kim/customs`
- `/api/kim/customs-seasoned`
- `/api/landed-cost`
- `/api/logistics/congestion`
- `/api/logistics/freight`
- `/api/logistics/trader-import`
- `/api/mackerel-comtrade`
- `/api/mackerel-kcs`
- `/api/mackerel-ticker`
- `/api/mackerel/dart`
- `/api/macro-environment`
- `/api/mail/company-smtp/send`
- `/api/mail/gmail/callback`
- `/api/mail/gmail/connect`
- `/api/mail/gmail/disconnect`
- `/api/mail/gmail/message`
- `/api/mail/gmail/messages`
- `/api/mail/gmail/send`
- `/api/mail/gmail/trash`
- `/api/mail/gmail/trash-batch`
- `/api/mail/mfa/enroll`
- `/api/mail/mfa/verify`
- `/api/mail/status`
- `/api/mangosteen/dashboard`
- `/api/mgo`
- `/api/mof-fishery`
- `/api/octopus/kcs`
- `/api/oec`
- `/api/operation-access`
- `/api/osh`
- `/api/petfood`
- `/api/pollock-forecast`
- `/api/pollock-kcs`
- `/api/pollock-landed-cost`
- `/api/pollock-policy-risk`
- `/api/pollock-supply-chain`
- `/api/pollock/dart`
- `/api/research`
- `/api/risk-radar`
- `/api/salmon/comtrade`
- `/api/salmon/dart`
- `/api/salmon/kamis`
- `/api/salmon/kcs`
- `/api/salmon/usda-fas`
- `/api/shrimp/compliance`
- `/api/shrimp/customs`
- `/api/shrimp/dart`
- `/api/shrimp/emerging-markets`
- `/api/shrimp/esg-radar`
- `/api/shrimp/forecast`
- `/api/shrimp/kamis`
- `/api/shrimp/krungsri`
- `/api/shrimp/macro`
- `/api/shrimp/sourcing-sim`
- `/api/shrimp/usda-fas`
- `/api/stocks`
- `/api/tariffs`
- `/api/trade-macro`
- `/api/tuna`
- `/api/tuna-emerging-markets`
- `/api/tuna-extract`
- `/api/tuna-forecast`
- `/api/tuna-live`
- `/api/tuna-local`
- `/api/tuna-policy-risk`
- `/api/tuna-ranching`
- `/api/tuna/comtrade-race`
- `/api/tuna/dart`
- `/api/tuna/insider-signal`
- `/api/tuna/kamis-basket`
- `/api/tuna/test-proxy`
- `/api/tuna/ticker`
- `/api/tuna/us-gateway`
- `/api/tuna/usda-fas`
- `/api/typhoon`
- `/api/unloading-db`
- `/api/unloading-history`
- `/api/us-census`
- `/api/us-ita`
- `/api/used-car`
- `/api/webhooks/unloading`
- `/api/whelk/dart`
- `/api/whelk/kcs`
- `/api/whelk/live`
- `/api/wits`
- `/api/wto`

</details>

<!-- END GENERATED -->

## 함정 — 여기서 발을 헛디딘다

아래는 전부 **실제로 걸려 본 것**이다. 추측은 안 적는다.

### 1. 폴더가 있다고 화면이 있는 게 아니다
`app/kim/page.tsx` 는 존재하지만 본문이 `notFound()` 한 줄이다. 주소를 열면 404 다.
자동 구역의 「은퇴한 주소」 목록을 먼저 보라. 19개가 그렇다.

### 2. 라우트 정본은 `lib/dashboard-registry.ts` 다
`app/` 폴더 이름으로 라우트를 짐작하지 마라. 카테고리 화면은 전부
`app/[category]/page.tsx` 하나가 그린다. 메뉴 키 목록이 곧 열리는 주소다.

### 3. 로컬 서버로는 화면을 못 본다
`npm run dev` 는 뜨지만 `/` 가 **503**으로 막힌다 — 「접속 보안 설정이 완료되지 않았습니다」
(`app/auth/start/route.ts`). 프로덕션 시크릿이 없어서다. 화면 확인은 라이브 + 로그인 세션으로만 된다.

### 4. 라이브 화면 확인은 Aside 로만 된다
운영 화면은 로그인 뒤에 있다. `curl` 은 307 로 튕기고, 헤드리스 브라우저는 세션이 없다.
`scripts/verify_live.mjs` 가 사용자의 Aside 세션을 빌려 읽는다.

### 5. Aside 는 자기 세션 폴더 밖으로 파일을 못 쓴다
스크린샷 경로를 저장소 절대경로로 주면 `Path escapes session roots` 로 조용히 실패한다.
세션 폴더에 찍고 나서 복사해야 한다(`verify_live.mjs` 가 그렇게 한다).

### 6. SPA 라 화면이 늦게 그려진다
페이지를 연 직후 DOM 을 읽으면 위젯이 0개로 나온다. 배지가 붙을 때까지 기다려야 한다
(최대 25초). `/market` 은 배지 없이 그려지는 화면이라 0 이 정상이다.

### 7. 작업 트리가 다른 세션과 공유된다
`~/tuna-dashboard` 에는 다른 세션의 미커밋 변경이 늘 섞여 있다. `git stash` 를 쓰면 남의 것까지
집는다. **`git worktree` 를 `origin/main` 에서 따서 작업하고**, 남이 스테이지한 파일이 있으면
`git commit --only -- <경로>` 로 내 것만 커밋한다.

### 8. 기준일(`syncDate`) 형식이 통일돼 있지 않다
581개를 세어 보면 `YYYY-MM-DD` 240 · `YYYY-MM` 76 · 연도만 166 · 어기 표기(`2025-26`) 41,
그리고 날짜가 아닌 것 58(`참고용 (Reference Only)`, `KCS` 등). 나이 판정은
`lib/sync-freshness.ts` 가 **보수적으로**(연도만 있으면 그 해 1월 1일) 읽는다.

### 9. Vercel 은 main 만 빌드한다
`vercel.json` 의 `git.deploymentEnabled` 가 `{"**": false, "main": true}` 다. PR 미리보기는
안 뜬다. 화면 확인이 필요하면 병합 뒤 라이브에서 하거나 `vercel` CLI 로 수동 배포한다.

## 증거 — 「됐습니다」 대신 무엇을 남기나

```bash
node scripts/verify_live.mjs /logistics /unloading --json artifacts/live-evidence/run.json
```

화면마다 **배지 수 · 신선도 분포(최신·오래됨·기준일 미상) · 스크린샷**을 남긴다.
스크린샷은 `artifacts/live-evidence/<화면>.png` 로 떨어지고 git 에는 안 올라간다(.gitignore).

배포 기록(HANDOFF)에는 이 숫자를 붙인다. 「반영했습니다」가 아니라
「`/logistics` 배지 7개, 18개월 초과 0건, 스크린샷 첨부」가 사실 보고다.
