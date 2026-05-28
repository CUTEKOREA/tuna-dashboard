# API 라이브 활용 진척 보고서

> 2026-05-29 Phase 1+2 부분 완료 진단

## 1. 키 작동 매트릭스 (실 호출 검증)

| API | 키 길이 | 호출 결과 | 라이브화 |
|---|---:|---|:-:|
| DATA_GO_KR_NEW_KEY | 64 | ✅ Newtrade/nitemtrade 정상 (HS 030354 79건 / 0303899060 호주 등) | ✅ |
| KOSIS_API_KEY | 44 | ✅ statisticsList 정상 | ✅ |
| FRED_API_KEY | 32 | ✅ PCU311111311111 485건 정상 | ✅ |
| UN_COMTRADE_PRIMARY_KEY | 32 | ✅ HS 030354 mackerel 2023 정상 | ✅ |
| ECOS_API_KEY | 20 | ⚠️ 키 작동, 미래 날짜로 "데이터 없음" | 일부 |
| KAMIS_API_KEY | 36 | ⚠️ 응답 받음, `data: ["001"]` (p_cert_id 'silla_co' 미스매치?) | 추가 디버깅 |
| MFDS_API_KEY | 20 | ❌ "인증키 유효하지 않습니다" | 미발급 |

## 2. 적용 완료 라우트

### Phase 1 (env name 정정 + 공유 라이브러리)
- ✅ 28개 라우트 env name 정정 (커밋 `54f8391`)
- ✅ 공유 healthcheck 라이브러리 ([app/api/_shared/healthcheck.ts](../app/api/_shared/healthcheck.ts))
- ✅ 공유 parser 라이브러리 ([app/api/_shared/parsers.ts](../app/api/_shared/parsers.ts))

### Phase 2-A (KCS XML 파싱)
- ✅ galchi/kcs: HS 0303899060 nitemtrade 라이브 (커밋 `a3aa00e`)
- ✅ pollock-kcs: HS 030367 nitemtrade 라이브
- 기존 작동 라우트 (mackerel-kcs, salmon/kcs): 이미 XML 파싱 구현, env 정정으로 즉시 활성화

## 3. 미완료 (추가 작업 필요)

### Phase 2-B (KAMIS)
- ⚠️ galchi/kamis: 코드 구조 OK, `p_cert_id` 확인 필요
- KAMIS 등록 시 사용한 ID 필요 (현재 코드 "silla_co" hardcoded)

### Phase 2-C (JSON 라우트)
- 🟢 ECOS·FRED·UN_COMTRADE 라우트 (현재 코드는 mock fallback) → 실제 응답 파싱 코드 추가 필요
- ❌ MFDS 라우트: 키 미발급, fallback 유지

### Phase 2-D (위젯 매핑)
- 라우트가 라이브 데이터 반환 후 → 위젯 컴포넌트의 chart data 형식과 매핑
- 가장 큰 작업 (위젯 데이터 구조마다 다름)

## 4. 잠재 효과 (현재 vs 완전 라이브)

| 단계 | 적용 라우트 | 4-Axis 평균 효과 |
|---|---:|:-:|
| 현재 (Phase 1+2-A) | 4 (galchi/pollock/mackerel/salmon kcs) | 평균 +1.5점 |
| Phase 2 완료 시 | 10~13 | +5~8점 |
| 위젯 매핑까지 | 전체 LIVE | +10~13점 → ~90 (A) |

## 5. 사용자 결정 필요 사항

1. **KAMIS p_cert_id** — 등록 시 사용한 사용자 ID 알려주세요 (silla_co 외 다른 ID?)
2. **MFDS API 키 재발급** — [식품안전나라 Open API](https://openapi.foodsafetykorea.go.kr) 회원가입 후 키 요청
3. **Vercel 환경변수 등록 완료 여부 재확인** — 라이브 사이트에서 작동 검증
4. **위젯 매핑 작업 우선순위** — 어느 위젯부터 라이브 데이터 연결할지

## 6. 다음 batch 권고

| 우선 | 작업 | 효과 | 시간 |
|:-:|---|---|---|
| 1 | ECOS 통계 ID 정확화 + 라우트 파싱 추가 | 환율·CPI 라이브 | 30분 |
| 2 | UN_COMTRADE 라우트 4건 (mackerel/galchi/tuna/squid) 응답 파싱 | 글로벌 무역 라이브 | 1시간 |
| 3 | FRED 거시 라우트 파싱 | 미국 거시 라이브 | 30분 |
| 4 | KAMIS p_cert_id 수정 후 라이브 | 가격 위젯 라이브 | 사용자 확인 후 |
| 5 | 위젯 매핑 (라이브 데이터 → 차트) | 최종 효과 | 3시간 |

