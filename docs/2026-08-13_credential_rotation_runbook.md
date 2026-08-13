# 자격증명 재발급 절차서

> 작성 2026-08-13. 대상: 공개 저장소에 노출된 API 키 전량.
> 실행 주체: **계정 소유자(대표님)**. 포털 로그인·본인인증이 필요해 위임 불가.

---

## 왜 지금 해야 하나

| 항목 | 사실 |
|---|---|
| 노출 시작 | **2026-05-13** (커밋 이력 `git log -S` 기준) |
| 노출 기간 | **92일** |
| 노출 경로 | GitHub 공개 저장소 `CUTEKOREA/tuna-dashboard` |
| 관련 커밋 | data.go.kr 키 14건 · FISHERY 키 8건 |
| 현재 상태 | **노출된 키가 지금도 운영 키이며 인증에 성공한다** (2026-08-13 점검 확인) |

코드에서는 제거했지만(PR #296) **git 히스토리에는 그대로 남는다.** 히스토리를 다시 써도 이미 공개된 값은 회수되지 않는다. 재발급만이 실질적 대응이다.

GitHub secret scanning 경보는 0건이지만, 한국 공공 API 키는 탐지 패턴에 없어 잡히지 않은 것이지 안전을 뜻하지 않는다.

---

## 순서

각 서비스마다 ① 재발급 → ② Vercel env 갱신 → ③ 검증. **한 서비스씩 끝내고 다음으로 간다.**

검증 도구:

```bash
node scripts/verify_credentials.mjs              # 전체
node scripts/verify_credentials.mjs DATA_GO_KR   # 서비스 지정
```

키 값은 출력하지 않고 설정 여부와 인증 결과만 보고한다.

---

## 1. data.go.kr — 최우선

**주의: 인증키가 계정 단위다.** 재발급하면 이 계정의 모든 오픈API에 즉시 적용된다. 아래 3개 변수와 그걸 쓰는 라우트가 **동시에** 바뀌므로 한 번에 갱신해야 한다.

| 변수 | 쓰는 곳 |
|---|---|
| `DATA_GO_KR_NEW_KEY` | 관세청 nitemtrade 계열 다수 (shrimp/mackerel/pollock/galchi/kim/salmon customs, tuna, trade-macro, macro-environment, risk-radar, tariffs, landed-cost, mof-fishery) |
| `DATA_GO_KR_COMMON_KEY` | galchi/kim customs 폴백 |
| `FISHERY_API_KEY` | consignment 동기화, fishery 라우트 |

**절차**

1. https://www.data.go.kr 로그인
2. 마이페이지 → 오픈API → **개발계정** → 인증키 관리
3. 일반 인증키 **재발급**. Encoding/Decoding 두 형태가 나오면 기존 코드가 쓰던 형태를 그대로 쓴다(현재는 Decoding 원문을 `serviceKey`에 넣고 URL 인코딩은 코드가 처리)
4. Vercel 갱신 — 아래 §6

**⚠️ 재발급 즉시 구 키가 죽는다.** Vercel 갱신 전까지 관련 라우트가 폴백으로 떨어진다. 페이지는 살아있고 `isLive: false`로 정직하게 표시된다.

---

## 2. UN Comtrade

| 변수 | 비고 |
|---|---|
| `UN_COMTRADE_PRIMARY_KEY` | 노출됨 |
| `UN_COMTRADE_SECONDARY_KEY` | 같은 구독의 보조키. **함께 재발급** |

Comtrade는 구독당 Primary/Secondary 2개를 준다. Primary만 바꾸고 Secondary를 두면 노출 위험이 남는다.

1. https://comtradedeveloper.un.org/signin 로그인
2. **Profile** → 해당 Subscription → **Regenerate** (Primary·Secondary 각각)

---

## 3. DART (금융감독원 전자공시)

| 변수 | `DART_API_KEY` |
|---|---|

1. https://opendart.fss.or.kr 로그인
2. 인증키 신청/관리 → **오픈API 이용현황** → 인증키 재발급

DART는 재발급 시 구 키가 즉시 폐기된다.

---

## 4. USDA FAS

| 변수 | `USDA_FAS_API_KEY` |
|---|---|

1. https://apps.fas.usda.gov/opendataweb/home
2. 계정 로그인 → API Key 관리에서 재발급

> 참고: 이 키를 쓰는 `/api/shrimp/usda-fas`는 공유 클라이언트가 "ESR에 수산물 없음"을 명시하고 있어 새우로는 영구히 `isLive: false`다. 재발급은 하되 새우 대시보드 복구와는 무관하다.

---

## 5. KAMIS

| 변수 | `KAMIS_API_KEY` (+ `KAMIS_CERT_ID`) |
|---|---|

1. https://www.kamis.or.kr/customer/reference/openapi_list.do
2. 로그인 → OpenAPI 인증키 재발급

`KAMIS_CERT_ID`는 아이디라 재발급 대상이 아니다. 다만 코드에 `"7849"` 기본값이 남아 있으니 실제 값과 다르면 env로 덮어쓴다.

---

## 6. US Census · PROXY_SECRET — 재발급 + **신규 등록**

이 둘은 Vercel production에 **없다**. 재발급만으로는 복구되지 않고 env 등록이 함께 필요하다.

| 변수 | 라우트 | 조치 |
|---|---|---|
| `USCENSUS_API_KEY` | `/api/tuna/us-gateway` | https://api.census.gov/data/key_signup.html 에서 신규 발급 후 등록 |
| `PROXY_SECRET` | `/api/tuna/ticker` | 임의 난수 문자열로 재설정. **프록시 서버(`KOREA_API_PROXY_URL`)의 값과 반드시 일치**시켜야 한다 |

`PROXY_SECRET`은 발급기관이 없는 자체 공유 비밀이다. 양쪽을 같이 바꿔야 한다.

---

## Vercel 환경변수 갱신

민감 변수는 CLI로 조회되지 않으므로(`[SENSITIVE]`) 갱신은 값을 직접 넣는다.

**웹 콘솔 권장** — https://vercel.com/cutekorea-3280s-projects/tuna-dashboard/settings/environment-variables

CLI를 쓴다면 이 세션에서 `!` 를 앞에 붙여 실행한다(값이 대화 기록에 남지 않게 직접 입력):

```bash
npx vercel env rm DATA_GO_KR_NEW_KEY production --yes
npx vercel env add DATA_GO_KR_NEW_KEY production
# 프롬프트에 새 키를 붙여넣는다
```

Preview 환경에도 필요한 변수가 있으면 `production` 자리에 `preview`를 넣어 반복한다. `UN_COMTRADE_PRIMARY_KEY`가 preview에 없어 PR 빌드가 깨진 이력이 있다(2026-08-13, PR #296).

**갱신 후 재배포해야 반영된다.** env 변경만으로는 기존 배포에 적용되지 않는다.

```bash
npx vercel --prod
```

---

## 검증

```bash
# 1) 새 키로 인증되는지
node scripts/verify_credentials.mjs

# 2) 프로덕션 라우트가 살아났는지
curl -s https://leedonggun.co.kr/api/shrimp/customs | python3 -m json.tool | head -20
#   → isLive: true, metrics 채워짐

# 3) 구 키가 죽었는지 — 구 키를 임시로 넣어 DEAD가 나오면 정상
DATA_GO_KR_NEW_KEY='<구 키>' node scripts/verify_credentials.mjs DATA_GO_KR
#   → ✗ DEAD — 인증키 미등록/폐기
```

3번이 `LIVE`로 나오면 재발급이 반영되지 않은 것이다.

---

## 완료 체크리스트

- [ ] data.go.kr 재발급 → `DATA_GO_KR_NEW_KEY` · `DATA_GO_KR_COMMON_KEY` · `FISHERY_API_KEY` 갱신
- [ ] UN Comtrade Primary·Secondary **둘 다** 재발급 → production·preview 갱신
- [ ] DART 재발급 → 갱신
- [ ] USDA FAS 재발급 → 갱신
- [ ] KAMIS 재발급 → 갱신
- [ ] US Census 신규 발급 → **신규 등록**
- [ ] `PROXY_SECRET` 재설정 → 프록시 서버와 양쪽 일치
- [ ] `npx vercel --prod` 재배포
- [ ] `node scripts/verify_credentials.mjs` 전 항목 LIVE
- [ ] 구 키로 실행 시 DEAD 확인

---

## 재발 방지

- 코드에는 `app/api/_shared/env.ts`의 `requireEnv`/`optionalEnv`만 쓴다. `process.env.X || '<값>'` 패턴 금지.
- 키 부재는 "API 사용 불가"로 처리한다. 가짜 키로 살아있는 척하지 않는다.
- 테스트는 `vitest.setup.ts`의 더미 값을 쓴다. 실키를 테스트에 넣지 않는다.
