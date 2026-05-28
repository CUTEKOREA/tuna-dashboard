# API 키 활용 신뢰도 향상 — 진단 보고서 (정정판)

> 2026-05-29 Claude Code · 사용자 제공 키 일람표로 정정

## 🚨 이전 진단 오류 정정

이전 진단(2026-05-28)에서 ".env.local의 키 length 2 = placeholder"라고 판단했으나, **실제로는 모든 키가 ~/.zshrc에 export 되어 있었음**. Next.js는 zshrc를 못 읽고 `.env.local`만 읽기 때문에 발생한 가짜 진단.

이번 작업으로 `.env.local`에 12개 키 동기화 완료.

## 1. 실제 작동 키 12개 (정정)

| 카테고리 | env var | length | 용도 |
|---|---|---:|---|
| 농수산 | KAMIS_API_KEY | 36 | 도매·소매가 시계열 |
| 통계 | KOSIS_API_KEY | 44 | 사료·가축·어업 통계 |
| 식품 | FIS_API_KEY | 44 | 식품산업 6대 카테고리 |
| 식품안전 | MFDS_API_KEY | 20 | HACCP·식품 인증 |
| 무역(통합) | **DATA_GO_KR_NEW_KEY** | 64 | 관세청·해수부·aT·EKAPE 공유 |
| 무역(백업) | DATA_GO_KR_COMMON_KEY | 64 | 구형 백업 |
| 글로벌 무역 | UN_COMTRADE_PRIMARY_KEY | 32 | 100/h free |
| 글로벌 백업 | UN_COMTRADE_SECONDARY_KEY | 32 | |
| 미국 농업 | USDA_FAS_API_KEY | 40 | FAS GAIN·PSD |
| 금융 공시 | DART_API_KEY | 40 | 한국 상장사 재무 |
| 한국 거시 | ECOS_API_KEY | 20 | 환율·금리·CPI |
| 미국 거시 | FRED_API_KEY | 32 | 800K+ 시리즈 |

## 2. 코드 env name 매핑 정정 필요

현재 코드가 호출하는 env name vs 실제 zshrc 등록 이름 불일치:

| 코드 호출 (잘못됨) | 실제 zshrc 이름 | 비고 |
|---|---|---|
| `process.env.KCS_API_KEY` | **`DATA_GO_KR_NEW_KEY`** | 관세청도 DATA_GO_KR 통합 |
| `process.env.COMTRADE_API_KEY` | **`UN_COMTRADE_PRIMARY_KEY`** | |
| `process.env.NASS_API_KEY` | **`USDA_FAS_API_KEY`** | FAS에 포함됨 |
| `process.env.WTO_API_KEY` | 미발급 | WTO 등록 별도 |
| `process.env.HSPING_API_KEY` | 미발급 | 자체 서비스 |
| `process.env.OSH_API_TOKEN` | 미발급 | Open Supply Hub |

→ 향후 audit 시 위 정정 매핑으로 라우트 코드 패치 가능.

## 3. 16건 mock 함정 라우트 재평가

| 등급 | 건수 | 라우트 | 발급 키 |
|---|:-:|---|---|
| 🟢 즉시 라이브 가능 | **6** | squid/kosis, galchi/kosis, squid/mfds, galchi/mfds, squid/wto (DATA_GO_KR), galchi/wto (DATA_GO_KR) | 모두 키 작동 |
| 🟢 키 정정만 필요 | **4** | mackerel-comtrade, galchi/comtrade (UN_COMTRADE), 기타 KCS_API_KEY 사용 라우트 | env name 정정 |
| 🟡 공개 API | 3 | compliance, ofac×2 | OFAC SDN public |
| 🔴 premium 필요 | 3 | importyeti, squid-forecast, squid-sourcing | 내부 ML/scraping |

→ **즉시 라이브 가능 10건** (기존 진단 2건에서 5배 증가)

## 4. 4-Axis 점수 효과 (재추정)

5 commodity 평균 78.9 → 모든 키 활용 시:
- KOSIS 2건 라이브 적용: +0.3 (이미 적용)
- DATA_GO_KR 다수 라우트: +5점 (가장 큰 효과)
- MFDS 2건: +1점
- DART 활용 위젯: +2점 (M&A·재무)
- ECOS 환율 위젯: +1점
- FRED 거시: +1점

**잠재 평균: 78.9 → ~89 (A등급)**

## 5. 다음 단계 우선순위

1. **코드 env name 정정** (16개 라우트의 process.env.* 일괄 수정) — 30분
2. **mackerel-comtrade 진짜 UN Comtrade API 파싱 구현** — 1시간
3. **galchi 6개 라우트 (kosis 외) 진짜 파싱** — 1시간
4. **squid 잔여 4개 라우트** — 1시간
5. **공개 OFAC SDN 파싱** (3건) — 30분

총 4시간 작업으로 **누적 16건 mock 함정 → 13건 라이브화** 가능 (premium 3건 제외).

## 6. 신규 메모리 인프라

- 사용자 제공 [API 키 일람표](file:///Users/idong-geon/.claude/projects/-Users-idong-geon-----------/memory/reference_korea_data_api_keys.md) — Claude 향후 세션 자동 참조

