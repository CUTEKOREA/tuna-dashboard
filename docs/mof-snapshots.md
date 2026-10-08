# 공공 API 스냅숏 갱신 절차

대시보드의 위판·무역수지·운임·등록상태 네 자리는 `public/data/*.json` 스냅숏을 읽는다.
화면이 API 를 직접 부르지 않는다 — 위판은 하루가 16,456행이고 공표도 두세 달 늦어
매 요청마다 뒤로 훑어야 한다.

## 무엇이 무엇을 만드나

| 스크립트 | 산출 | 화면 |
|---|---|---|
| `scripts/sync_mof_auction.py [일수]` | `mof_auction_daily_v1.json` | 위판 일별 단가 (오징어·고등어·문어·새우) |
| `scripts/sync_mof_trade.py [개월수]` | `mof_trade_monthly_v1.json` | 월별 무역수지 (6개 품목) |
| `scripts/sync_landed_cost_trend.py [개월수]` | `landed_cost_trend_v1.json` | 항로 운임 × 환율 (오징어) |
| `scripts/sync_maru_registry_status.py <엑셀>` | `maru_registry_status_v1.json` | 페루 제조소 등록 상태 |

앞의 셋은 API 라서 명령 한 줄이면 된다. 넷째만 브라우저로 파일을 받아야 한다.

## 돌리는 법

키는 `~/.config/silla-mcp/.env` 에 있고 클라이언트는 `~/silla-mcp` 에 있다. 그래서 그쪽에서 돌린다.

```bash
cd ~/silla-mcp
uv run python ~/tuna-dashboard/scripts/sync_mof_auction.py 28
uv run python ~/tuna-dashboard/scripts/sync_mof_trade.py 18
uv run python ~/tuna-dashboard/scripts/sync_landed_cost_trend.py 24
```

위판 28일치는 5~10분 걸린다(어종 5종 × 날짜별 조회). 나머지 둘은 1분 안쪽이다.

등록 상태는 파일을 먼저 받는다 — 절차는 `~/silla-mcp/docs/maru-runbook.md`,
`안전정보 > 제품 및 업체검색 > 업체조회 > 해외제조업소`, **국가 = 페루, 식품종류는 비운 채**.

```bash
cd ~/silla-mcp
uv run python ~/tuna-dashboard/scripts/sync_maru_registry_status.py ~/Downloads/해외제조업소*.xlsx
```

## 얼마나 자주

- **위판** — 일별이라 가장 빨리 낡는다. 주 1회면 충분하다.
- **무역수지·운임** — 월별이고 공표가 두세 달 늦다. 월 1회.
- **등록 상태** — 등록 갱신이 드물다. 분기 1회, 또는 페루 조달 건이 생길 때.

## 함정

- **위판 어종 필터가 부분일치다.** 「오징어」가 갑오징어류까지 잡는다. 스크립트는 표준명별로 갈라 담고,
  화면은 물량 상위 네 종만 그린다. 캡션에 어느 종을 그렸는지 적힌다.
- **주말·공휴일은 위판이 없다.** 결과코드 03 이 오고 스크립트는 빈 날로 넘긴다. 0 으로 채우지 않는다 —
  차트도 `connectNulls={false}` 로 선을 끊는다.
- **운임 단위는 천원/2TEU** 다(40피트 컨테이너 1대, 원화). 달러도 톤당도 아니다.
- **환율은 일별만 있다.** ECOS 731Y001 에 월 주기가 없어(INFO-200) 스크립트가 월평균을 낸다.
- **등록 상태는 접두 일치**다. 보고서는 약칭을, 등록부는 정식명을 쓴다. 접두가 여러 회사에 걸리면
  붙이지 않고 「모호」로 남긴다 — 엉뚱한 회사의 등록정보를 붙이는 쪽이 더 나쁘다.
- 스냅숏이 낡으면 캡션의 기간 표기도 같이 낡는다. 캡션은 `_meta.기간` 을 읽으니 갱신하면 따라온다.
