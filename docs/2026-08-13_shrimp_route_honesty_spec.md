# `/api/shrimp` 라우트 3종 정직화 명세

> 대상: `emerging-markets` · `forecast` · `compliance`
> 근거: 2026-06-11 전 페이지 감사가 지적한 L-09(정직 LIVE) 위반. 기획서 §8 별도 티켓.
> 배경: `/shrimp` 페이지는 이미 이 라우트들을 호출하지 않는다(PR #293에서 `SHRIMP_API_SOURCES` 제거). 그래도 라우트 자체가 거짓을 반환하는 상태라 정리한다.

---

## 0. 원칙

1. **호출하지 않은 출처를 `source`에 적지 마라.**
2. **`isLive`를 반드시 출력하라** (L-12). 라이브 데이터가 실제로 응답에 쓰였을 때만 `true`.
3. **가져온 데이터를 버리면서 LIVE라고 하지 마라.** 쓰거나, 안 가져오거나 둘 중 하나다.
4. **출처 없는 계수·상수로 수치를 만들어내지 마라** (A-01). 근거를 못 대면 그 필드를 없앤다.
5. 라우트 파일을 삭제하지 마라. `architecture-guards`가 계약 수를 강제하고, 캐시 정책 라쳇이 143이다.
6. 각 상수에는 출처를 붙이거나, 붙일 수 없으면 제거한다. "KMI 연구 프레임"은 방법론 이름이지 수치의 출처가 아니다.

---

## 1. `emerging-markets` — 가져온 데이터를 버린다

### 현재 결함

```ts
if (comtradeKey) { ... if (json?.data?.length > 0) liveChitosanData = json.data.slice(0, 10); }
...
source: liveChitosanData ? "UN Comtrade + OEC (LIVE)" : "Emerging Markets (Fallback/Estimated)",
```

- `liveChitosanData`를 채우고 **응답 어디에도 쓰지 않는다.** 그런데 그 성공 여부로 `source`를 LIVE로 뒤집는다.
- 반환값 전체가 하드코딩이다 — 키토산 시장 $7.2B·CAGR 15.3%·인도 28%·중국 22%, 할랄 $28.5B, RTE $42.0B, 프리미엄 45%, 한국 부산물 12,000톤·$180M, 할랄 $25M.
- 파일 상단 주석은 "UN Comtrade, OEC, Eurostat, U.S. Census"를 쓴다고 적었지만 Comtrade 외에는 호출조차 없다.
- `isLive` 필드 없음.

### 조치

**둘 중 하나를 골라 구현하라. (A)를 우선한다.**

**(A) Comtrade 결과를 실제로 쓴다** — HS 391390(키토산 포함 세번) 수출액을 국가별로 집계해 `chitosanTrade` 필드로 반환한다.
- 그때만 `isLive: true`, `source: "UN Comtrade HS 391390"`.
- ⚠️ **HS 391390은 키토산 전용 코드가 아니다.** "기타 천연중합체 및 변성 천연중합체"이며 키토산은 그 일부다. 응답 필드와 주석에 이 한계를 명시하라. 이 수치를 "키토산 시장 규모"로 부르지 마라.
- 총계행 필터: `partner2ISO=W00 & motCode=0 & customsCode=C00`(Comtrade 공통 함정).

**(B) 호출을 제거한다** — 쓰지 않을 데이터를 가져오지 않는다. `isLive: false`, `source`에 각 상수의 실제 출처를 적는다.

### 상수 처리 (A·B 공통)

출처를 댈 수 없는 수치는 **제거하라.** 남길 것과 뺄 것을 이렇게 나눈다.

| 필드 | 처리 |
|---|---|
| `koreaOpportunity` 문장 3개 ("$180M 잠재 매출", "연 $25M 수출 잠재력", "45% 프리미엄 확보 가능") | **제거.** 산출 근거가 없는 영업 추정이다 |
| `globalMarketSize_USD_B` · `cagr_Percent` · `topProducers` share | 출처를 명시할 수 있으면 `sourceNote` 필드에 기관명·연도를 붙여 남기고, 못 대면 제거 |
| `topApplications` · `topFormats` (문자열 목록) | 수치가 아니므로 존치 가능 |

---

## 2. `forecast` — 존재하지 않는 모형

### 현재 결함

```ts
source: fredOil ? "FRED + ECOS + VAR Model (LIVE)" : "VAR Model (Fallback/Estimated)",
methodology: "KMI 수산물 무역 단기 전망모형 (VAR 5변수: CIF단가, 유가, 환율, 사료지수, ENSO)",
```

- **ECOS를 호출하지 않는다.** FRED 두 시리즈(DCOILWTICO, DEXKOUS)만 부른다.
- **VAR 모형이 아니다.** 실제 계산은 `(8113 + (유가-70)×8.5 + (환율-1385)×1.2) × 계절계수 × 1.035` 선형 산술이다.
- **5변수 중 3개가 상수다.** `feedCostIndex: 125.4`, `ensoPhase: "Neutral"`은 하드코딩이고 CIF단가도 상수 `basePrice = 8113`이다. 이 8113은 감사가 mock으로 지적한 그 값이다.
- 계수 `8.5` · `1.2` · 계절 `[1.02, 1.05, 1.03]` · 사료 `0.035` · 신뢰구간 `0.93/1.08` — **전부 출처 없는 발명값이다.**
- **예측 대상 월이 하드코딩이라 이미 과거다.** `['2026-06','2026-07','2026-08']` — 오늘은 2026-08-13이다.
- `isLive` 필드 없음.
- `historicalBenchmark` 4개 값도 출처 미표기.

### 조치

**전망 산출을 제거하라.** 이 라우트는 근거 있는 예측을 만들 수 없다.

남길 것은 **실제로 가져오는 두 계열뿐**이다.

```
{
  timestamp,
  isLive: <FRED 두 계열 중 하나라도 성공>,
  source: "FRED (DCOILWTICO, DEXKOUS)",
  macro: {
    wtiOil_USD: <실측 또는 null>,
    wtiObservedAt: <FRED가 준 관측일>,
    usdKrw: <실측 또는 null>,
    fxObservedAt: <FRED가 준 관측일>
  },
  note: "새우 가격 전망은 제공하지 않는다. 이전 구현의 VAR 모형은 실재하지 않았고 계수가 출처 없는 임의값이었다."
}
```

- **폴백에 숫자를 만들지 마라.** FRED 실패 시 `null`을 주고 `isLive: false`.
- `forecast` · `historicalBenchmark` · `feedCostIndex` · `ensoPhase` · `methodology` 필드 **전부 제거**.
- FRED 응답의 관측일(`observations[0].date`)을 함께 반환하라. 값만 주면 언제 값인지 알 수 없다.
- FRED는 결측을 `"."`로 준다. `parseFloat(".")`는 `NaN`이다. 숫자 검증을 넣어라.

---

## 3. `compliance` — 호출 없는 OFAC

### 현재 결함

```ts
source: wtoAlerts.length > 0 || mfdsAlerts.length > 0 ? "WTO + MFDS + OFAC (LIVE)" : "NTB Radar (Fallback/Estimated)",
```

- **OFAC을 호출하지 않는다.** 코드 어디에도 없다.
- WTO 또는 MFDS 중 **하나만** 성공해도 셋 다 LIVE인 것처럼 표기한다.
- `isLive` 필드 없음.
- 하위 블록에도 `source: mfdsAlerts.length > 0 ? "MFDS (LIVE)" : "MFDS (Estimated)"`가 있다. "Estimated"가 무엇을 추정한 것인지 불명확하다.
- `regulatoryRadar` 배열의 항목들(미국 반덤핑 등)이 하드코딩인지 라이브인지 구분되지 않는다.

### 조치

- `source`를 **실제 성공한 출처만** 나열하도록 바꿔라. 예: WTO만 성공 → `"WTO SPS"`. 둘 다 실패 → `"정적 스냅샷"`.
- **OFAC 문자열을 제거하라.**
- `isLive`는 WTO·MFDS 중 하나라도 응답이 실제로 반환값에 쓰였을 때만 `true`.
- 출처별 상태를 따로 노출하라: `sources: { wto: 'live'|'unavailable', mfds: 'live'|'unavailable' }`.
- `regulatoryRadar`의 각 항목에 `origin: 'live' | 'static'`을 붙여 무엇이 실측이고 무엇이 스냅샷인지 구분하라. 정적 항목에는 기준일을 넣어라.
- 하위 블록의 `"MFDS (Estimated)"`는 실제로 무엇인지에 맞게 고쳐라. 추정이 아니라 정적 스냅샷이면 그렇게 적어라.

---

## 4. 공통 요구사항

- 세 라우트 모두 최상위에 `isLive: boolean`을 둔다.
- `source`는 **호출에 성공해 응답에 실제로 반영된 출처만** 나열한다.
- 자격증명은 `app/api/_shared/env.ts`의 `optionalEnv`로 읽는다. 키가 없으면 던지지 말고 해당 출처를 `unavailable`로 처리한다. (이 라우트들은 프리렌더 대상이 아니지만 일관성을 지킨다.)
- 키 값을 로그·응답에 남기지 마라. 예외는 `e instanceof Error ? e.name : 'unknown'`만 찍는다.

## 5. 게이트

```bash
npx tsc --noEmit
npm run verify        # Vitest · API cache policy 143 · bundle budget
```

금칙 문자열 확인 — 아래가 0건이어야 한다.

```bash
grep -rnE "OFAC|VAR Model|ECOS \+|\(LIVE\)" app/api/shrimp/
```

`(LIVE)` 문자열 자체를 쓰지 마라. 상태는 `isLive` 필드로 표현한다.
