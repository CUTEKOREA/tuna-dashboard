# 지표 SSOT 감사 실측 (P3-8, 2026-08-17)

> Explore 에이전트 전수 정찰 결과의 요약본. 다음 라운드(L-07 일괄 교체)의 입력.

## 중복 실측 (상위 3 + 후보)

| 지표 | 흩어진 곳 | 갈라진 정책 |
| --- | --- | --- |
| 증감률 (cur-prev)/prev*100 | 인라인 38건(~20파일) + 로컬 헬퍼 3종 | 0분모 가드 4종 (prev>0 / !==0 / abs / 없음) |
| 진행률 actual/reported | 7파일 17라인 | 클램프 4종 — **같은 선박이 간트 106% vs 상태판 100%** |
| kg→톤·cifPerKg | 공용 `app/api/_shared/kcs-client.ts` 존재하나 galchi·pollock·mackerel·salmon 4라우트 자체 재구현. kg→톤만 14파일 | 동일 복붙 |
| 일평균 (4위) | 5곳 | 분모 정의 3종 (작업일 / 양수일 / 전체 길이) |
| $/MT 스케일 추정 클램프 | 3곳 복붙 | 틀리면 1000배 오차 |

## 이번 라운드에 한 것

- `lib/metrics.ts` 신설 — `pctChange`(0분모=null 고정), `progressPct`(기본 무클램프 —
  초과는 사실, 게이지만 clampMax 명시). 정책 주석에 고정.
- 파일럿 교체 2곳 (충돌 없는 자기 소유 파일): FleetHeroCommand·UnloadingVoyageGantt.
- 리니지: `scripts/widget_lineage.py` + `docs/lineage/` + 가드 테스트 (closure 147 ·
  위젯 100 · 데이터 54, `--impact <json>` 조회 지원).

## 다음 라운드 백로그 (L-07 스크립트 대상)

1. 증감률 38건 → `pctChange` 일괄 교체 (`scripts/fix_pct_change.py`) — 0분모 정책 통일.
2. 진행률 17라인 → `progressPct` — **정책 결정 필요**: 상태판 min(100) 클램프를 유지할지
   (surplus 은폐) 소유자 확인 후 통일.
3. KCS 4라우트 → `_shared/kcs-client.ts` 집계 함수로 교체 (순수 삭제).
4. 일평균 분모 정의 통일, $/MT 스케일 클램프 공용화.
