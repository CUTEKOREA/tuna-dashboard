## 🚨 즉시 정정 필요 (false data / 위험)
- [app/api/petfood/route.ts:31-47] `data.kpis` 객체 내 하드코딩된 값(단가, 점유율 등)의 `desc` 필드에 "ITC TradeMap 실시간", "대만 관세청 실시간" 등 허위 출처 명시 → 실제 API 연동이 없다면 "추정치" 또는 "STATIC"으로 출처/방식 표기 즉시 정정 권고
- [app/api/compliance/route.ts:74-84] 하드코딩된 `SANCTIONS_DB`에서 데이터를 매칭한 후 응답 메타데이터에 `source: 'SANCTIONS_API_LIVE'`, `grade: 'S', label: 'Live Compliance DB'`로 명시함 → 라이브 API가 아니므로 `SANCTIONS_FALLBACK` 및 'Mock DB' 라벨로 정정 권고

## ⚠️ 표현 정정 (stale / 모호한 출처)
- [app/api/tuna-ranching/route.ts:63-87] `quotaExhaustion` 및 `kpi1`, `kpi2`, `kpi5` 등에서 하드코딩된 정적 데이터(예: 소진율 85.4%)를 반환함에도 `telemetry: "SYNCED"`로 모호하게 표기 → 라이브 동기화 기능이 없다면 `telemetry: "STATIC"`으로 통일하여 혼선 방지
- [app/api/oec/route.ts:133-134] `BENCHMARKS`의 과거 정적 데이터(2023년)를 폴백으로 반환하면서 신뢰도 점수 `grade: 'A'` 부여 → 2026-05 기준 3년 전의 stale 데이터이므로 신뢰도 등급 하향 및 'Stale' 라벨 표기 고려

## ✅ 검증 통과 (라이브 API 명확)
- [app/api/hs-ping/route.ts] HS Ping 라이브 API와 로컬 DB 폴백 분리가 명확하며 `HSPING_FALLBACK` 표기 준수
- [app/api/mof-fishery/route.ts] 해수부 및 관세청 실시간 API 호출 완벽, 실패 시 `_fallback: true` 플래그 및 출처 명기 우수
- [app/api/osh/route.ts] Open Supply Hub 라이브 연동 및 폴백의 경우 'Curated Facility DB'로 출처 구분 명확
- [app/api/tuna/route.ts] 관세청, aT, Yahoo API 병렬 호출 및 실패 시 적절한 Cached/Static 라벨링 적용 완료
- [app/api/tuna-emerging-markets/route.ts] Comtrade API 기반 enrichment 기능과 정적 보고서 추정치(STATIC) 구분이 잘 되어 있음
- [app/api/tuna-extract/route.ts] 단순 정적 JSON 제공 라우트로 허위 라이브 표기 및 데이터 오류 없음
- [app/api/tuna-forecast/route.ts] FRED 연동 및 가다랑어($1,650~$2,008), 황다랑어($2,400~$2,550) 가격이 정상 범위를 준수하며 시나리오 기반 모델링 우수
- [app/api/tuna-policy-risk/route.ts] WTO 라이브 API 조회 및 STATIC 정책 영향 추정액 분리 표기 명확
- [app/api/tuna/ticker/route.ts] 다중 라이브 API(KCS, ECOS, FRED 등) 지연 없는 폴백 처리와 `isLive` 플래그 제공 우수
- [app/api/wits/route.ts] World Bank WITS 연동 및 한국/태국 참치 관세율(AKFTA 0% 등) 사실 오류 없이 정확한 Fallback 구현

## 📊 전체 요약
- 총 라우트: 14
- LIVE API 호출 라우트: 10
- mock-only 라우트: 4
- 즉시 정정 필요: 2건
