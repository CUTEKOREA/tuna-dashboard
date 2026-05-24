# BeefDashboard LIVE API 키 가이드

> 소고기 대시보드 11 위젯의 LIVE 데이터 연동을 위한 외부 API 키 등록 가이드.
> 각 API는 키 미설정 시 정적 fallback 데이터로 자동 대체되므로 단계적 활성화 가능.

## 진행 상황

| 위젯 | 데이터 소스 | endpoint | 키 환경변수 | 상태 |
|---|---|---|---|---|
| W1 글로벌 생산 추이 | FAOSTAT QCL | `/api/beef/global-production` | (없음, 무인증) | ✅ LIVE 활성 |
| W2 Top 5 생산국 | FAOSTAT QCL | `/api/beef/global-production` (통합) | (없음, 무인증) | ✅ LIVE 활성 |
| **W3 도축장 가동률** | **USDA NASS QuickStats** | `/api/beef/slaughter-rate` | **`NASS_API_KEY`** | ⏸️ 키 등록 대기 |
| W4 사료 곡물가 | CME (유료) | — | — | ❌ 정적 영구 |
| W5 글로벌 무역 흐름 | UN Comtrade | (예정) | `COMTRADE_API_KEY` (기존 보유) | 🟡 endpoint 작성 가능 |
| W6 한국 수입 파트너 | KCS Open API | (예정) | `KCS_API_KEY` | ⏸️ |
| W7 한국 수급 구조 | KOSIS Open API | (예정) | `KOSIS_API_KEY` | ⏸️ |
| W8 한우 가격 갭 | KAMIS API | (예정) | `KAMIS_API_KEY` | ⏸️ |
| W9 광우병 리스크 | WOAH WAHIS (API 없음) | — | — | ❌ CSV 캐시 영구 |
| W10 탄소 발자국 | FAO LEAP (학술 고정) | — | — | ❌ 정적 영구 |
| W11 프리미엄 시장 | USDA AMS Retail (CSV) | — | — | 🟡 fetch 캐시 가능 |

## W3 — USDA NASS QuickStats 키 등록 가이드

### 1. 무료 키 발급 (5분)

1. **등록 페이지**: <https://quickstats.nass.usda.gov/api>
2. **이메일 입력** → 즉시 발급된 키가 이메일로 도착
3. 받은 키는 `36자 영숫자 하이픈` 형식 (예: `1A2B3C4D-5678-90AB-CDEF-1234567890AB`)
4. **요청 제한**: 1일 50,000 호출 / 분당 100 호출 (개인용 충분)

### 2. 로컬 환경 등록

`.env.local`에 다음 1줄 추가:

```env
NASS_API_KEY=발급받은_36자_키
```

### 3. Vercel 프로덕션 등록

```bash
vercel env add NASS_API_KEY production
# 프롬프트에 키 붙여넣기 → 저장
vercel --prod  # 재배포
```

또는 Vercel 대시보드 → Settings → Environment Variables → Add → `NASS_API_KEY`.

### 4. 동작 확인

```bash
# 로컬 dev
npm run dev
curl -s http://localhost:3000/api/beef/slaughter-rate | jq .isLive
# true 반환 → LIVE 활성

# source 확인
curl -s http://localhost:3000/api/beef/slaughter-rate | jq .source
# "USDA NASS QuickStats API (미국 LIVE) + MLA 호주 정적"
```

### 5. NASS QuickStats 쿼리 명세 (참고)

사용 중인 정확한 short_desc:
- 도축 두수: `CATTLE, INCL CALVES - SLAUGHTERED, COMMERCIAL - HEAD`
- 도체중: `CATTLE, DRESSED WEIGHT - MEASURED IN LB / HEAD`

필터: `agg_level_desc=NATIONAL`, `freq_desc=QUARTERLY`, `year__GE=2024`

추가 가능한 series (향후 위젯 확장 시):
- `CATTLE - INVENTORY` (재고)
- `CATTLE, FED - PRICE RECEIVED, MEASURED IN $ / CWT` (생체 가격)
- `CATTLE - SLAUGHTERED, FEDERALLY INSPECTED` (연방 인증 도축)

## fallback 동작 보증

NASS_API_KEY 미설정 또는 API 응답 실패 시:
1. endpoint가 `isLive: false`, `source: "NASS_API_KEY 미설정 — 정적 미러"` 반환
2. 위젯 TelemetryBadge가 `STATIC` 빨강 → `LIVE` 초록으로 자동 전환됨
3. SIT 텍스트는 최신 데이터(LIVE) 기준으로 동적 생성 — fallback일 때도 정상 동작

## 다음 단계 (확장 후보)

| 우선순위 | 위젯 | 키 | 등록 URL |
|---|---|---|---|
| **High** | W7 한국 수급 | `KOSIS_API_KEY` | <https://kosis.kr/openapi/> |
| **High** | W8 한우 가격 | `KAMIS_API_KEY` | <https://www.kamis.or.kr/customer/reference/openapi_list.do> |
| Mid | W5 무역 흐름 | (기존) `COMTRADE_API_KEY` | — |
| Mid | W6 한국 수입 | `KCS_API_KEY` | <https://unipass.customs.go.kr/openapi/> |
| Low | W11 프리미엄 | 없음 (CSV) | USDA AMS Retail Lamb-Beef Report |
