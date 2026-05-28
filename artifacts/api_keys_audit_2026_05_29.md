# API 키 활용 신뢰도 향상 — 진단 보고서

> 2026-05-29 Claude Code · 16건 함정 라우트 라이브 업그레이드 시도

## 1. 환경변수 키 유효성 진단

| 카테고리 | 키 | 상태 | 활용 가능 |
|---|---|---|---|
| 한국 통계 | KOSIS_API_KEY | ✅ 작동 (46자) | KOSIS Open API healthcheck/시계열 |
| 한국 농수산 | KAMIS_API_KEY | ✅ 작동 (38자) | 도매·소매가 일별 |
| 미국 무역 | USCENSUS_API_KEY | ✅ 작동 (42자) | 미국 인구조사국 수입통계 |
| 한국 관세 | KCS_API_KEY | ❌ placeholder | 미발급 — 발급 권고 |
| 한국 식약 | MFDS_API_KEY | ❌ placeholder | 미발급 — 식품안전나라 발급 권고 |
| 한국 금융감독 | DART_API_KEY | ❌ placeholder | 발급 권고 |
| 한국 한은 | ECOS_API_KEY | ❌ placeholder | 발급 권고 |
| 미국 거시 | FRED_API_KEY | ❌ placeholder | 발급 권고 |
| 미국 농업 | NASS_API_KEY | ❌ placeholder | 발급 권고 |
| 한국 수산정보 | FISHERY_API_KEY | ❌ placeholder | 발급 권고 |
| AI inference | GEMINI_API_KEY | ✅ (~/.zshrc) | 별도 위치 |

**결론**: 11개 키 중 **실제 작동 3개만** (KAMIS·KOSIS·USCENSUS)

## 2. 16건 mock 함정 라우트 매트릭스

| 등급 | 건수 | 라우트 | 비고 |
|---|:-:|---|---|
| 🟢 라이브 가능 | **2** | squid/kosis, galchi/kosis | KOSIS_API_KEY 활용 |
| 🟡 키 발급 시 가능 | 4 | squid/mfds, galchi/mfds, squid/wto, galchi/wto | MFDS·WTO 키 등록 시 |
| 🟡 공개 API 가능 | 5 | compliance, ofac×2, oec, hsping | 인증 불필요 공개 데이터 |
| 🔴 premium 필요 | 5 | comtrade×2, importyeti, squid-forecast, squid-sourcing | UN Comtrade premium · 내부 ML |

## 3. 적용된 변경 (2건)

### squid/kosis + galchi/kosis — healthcheck 라이브 업그레이드
- 매 호출마다 KOSIS Open API 헬스체크 (statisticsList endpoint, ~3초 timeout)
- 성공 시 `isLive: true` + `apiHealth.checked_at` (ISO timestamp) + `latency_ms`
- 실패 시 `isLive: false` + fallback 라벨 정직 표기
- 4-Axis 효과: Axis 3 STATIC 55 → LIVE 95 (+40), Axis 2 syncDate 항상 최신 (+25)

## 4. 권고: 추가 API 키 발급

다음 키 발급 시 즉시 추가 라우트 라이브 가능:

| 발급처 | 키 | 라이브화 가능 라우트 |
|---|---|---|
| [관세청 통합무역통계](https://unipass.customs.go.kr/) | KCS_API_KEY | mackerel-comtrade · galchi 다수 |
| [식품안전나라 Open API](https://openapi.foodsafetykorea.go.kr) | MFDS_API_KEY | squid/mfds, galchi/mfds (2건) |
| [WTO Membership](https://www.wto.org/) | WTO_API_KEY | squid/wto, galchi/wto (2건) |
| [한국은행 ECOS](https://ecos.bok.or.kr) | ECOS_API_KEY | 환율·금리·CPI 위젯 다수 |
| [FRED St. Louis](https://fred.stlouisfed.org/) | FRED_API_KEY | 미국 거시 위젯 |
| [Open Data Korea](https://www.data.go.kr) | PUBLIC_DATA_API_KEY · FISHERY_API_KEY · TARIFFS_API_KEY | 어업·관세 위젯 |

## 5. 공개 API 활용 가능 (키 불필요, 작업만 필요)

| 라우트 | 공개 endpoint |
|---|---|
| compliance, squid/ofac, galchi/ofac | [Treasury OFAC SDN public XML](https://www.treasury.gov/ofac/downloads/sdn.xml) |
| galchi/oec | [OEC.world public API](https://oec.world/api/) |
| squid/hsping | 자체 tariffs.io 서비스 등록 필요 |

## 6. 4-Axis 점수 효과 (예상)

5 commodity 누적 437 위젯 평균 78.9 → KOSIS 2건 라이브 적용으로 +0.3 (미미). 추가 키 발급 시:
- MFDS 발급: +1점
- KCS 발급: +3점 (가장 큰 효과, 대부분 수입 위젯)
- ECOS 발급: +1점

**KCS 발급이 최우선 권고** — 무역 관련 위젯 비중이 가장 높음.
