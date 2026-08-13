# Codex 작업지시서 — 고등어 대시보드 죽은 코드 제거

- 발행: 2026-08-13
- 담당: Codex
- 브랜치: `mackerel/codex-deadcode`
- 선행 문서: [MACKEREL_REVAMP_PLAN_2026-08-13.md](./MACKEREL_REVAMP_PLAN_2026-08-13.md), [mackerel_consolidation.csv](./mackerel_consolidation.csv)

---

## 0. 파일 소유권 (절대 규약)

이 브랜치에서 **수정 가능한 파일은 아래뿐이다.**

```
components/Mackerel*.tsx          ← 삭제 및 수정 대상
```

**읽기만 하고 절대 수정 금지** (다른 담당자가 동시에 편집 중):

```
lib/data/mackerel.ts              ← Claude 담당
data/**                           ← Claude 담당
scripts/mackerel/**               ← Claude 담당
public/data/mackerel_real_data_v13.json   ← OpenCode 담당
components/WidgetCard.tsx         ← 공용 컴포넌트, 변경 금지
components/MackerelStrategy.module.css    ← 20개 대시보드가 공유. 삭제 금지
```

위반 시 머지 거부. 필요하면 수정하지 말고 지시서에 코멘트로 남길 것.

---

## 1. 작업 A — 죽은 컴포넌트 16개 삭제

### 배경

`components/Mackerel*.tsx` 24개 중 `MackerelDashboard.tsx`가 import하는 것은 7개뿐이다.
나머지 16개는 어디서도 렌더되지 않는 약 1,554 LOC의 죽은 코드다.
전수 grep으로 외부 참조가 없음을 확인했다.

### 삭제 대상 (16 파일)

| # | 파일 | LOC | 외부 참조 |
|---|---|---:|---|
| 1 | `components/MackerelAltSourcingIndex.tsx` | 46 | 없음 |
| 2 | `components/MackerelBlackhole.tsx` | 120 | 없음 |
| 3 | `components/MackerelFeedRatio.tsx` | 50 | 없음 |
| 4 | `components/MackerelFilletPenetration.tsx` | 59 | `lib/data/mackerel.ts`에 **동명 데이터셋 키**만 존재 (컴포넌트 참조 아님) |
| 5 | `components/MackerelGhanaStrategy.tsx` | 181 | 없음 |
| 6 | `components/MackerelMacroCycle.tsx` | 147 | 없음 |
| 7 | `components/MackerelNorwaySpread.tsx` | 60 | 상동 (데이터셋 키만) |
| 8 | `components/MackerelProcessedWidgets.tsx` | 123 | 없음 |
| 9 | `components/MackerelSankey.tsx` | 82 | 없음 |
| 10 | `components/MackerelSizePremium.tsx` | 58 | 상동 (데이터셋 키만) |
| 11 | `components/MackerelSpreadWinners.tsx` | 94 | 없음 |
| 12 | `components/MackerelStorageTurnover.tsx` | 47 | 없음 |
| 13 | `components/MackerelTrioRadar.tsx` | 91 | 없음 |
| 14 | `components/MackerelTRQMeter.tsx` | 50 | 없음 |
| 15 | `components/MackerelUnitPrice.tsx` | 90 | 없음 |
| 16 | `components/MackerelStrategy.tsx` | 256 | **컴포넌트 import 0건.** 20개 파일이 참조하는 건 `MackerelStrategy.module.css` 뿐 |

### 주의 3가지

1. **`MackerelStrategy.module.css`는 삭제하지 말 것.** `.tsx`만 삭제한다.
   20개 대시보드(Salmon·Chicken·Carrot·Cocoa·Pollock 등)가 이 CSS 모듈을 import한다.
   CSS를 지우면 고등어와 무관한 대시보드 20개가 동시에 깨진다.

2. **`lib/data/mackerel.ts`의 데이터셋 키는 건드리지 말 것.**
   `filletPenetration` / `norwaySpread` / `sizePremium` 은 컴포넌트가 아니라 JSON 데이터셋 이름이다.
   컴포넌트 삭제 후 이 키들이 미사용이 되지만, 정리는 Claude가 한다.

3. **삭제 전 재확인.** 각 파일에 대해 아래를 돌려 자기 자신 외 참조가 없는지 확인하고 결과를 PR 본문에 붙일 것.

   ```bash
   grep -rn "<컴포넌트명>" --include="*.ts" --include="*.tsx" --include="*.js" . \
     | grep -v node_modules | grep -v "components/<컴포넌트명>.tsx"
   ```

---

## 2. 작업 B — 잔존 7개 컴포넌트 정리

`MackerelDashboard.tsx`가 실제로 렌더하는 7개다. 이들은 **삭제하지 않는다.**

| 파일 | pillar | 통합 후 귀속 (consolidation.csv 참조) |
|---|---|---|
| `MackerelKoreaSupply.tsx` | S1 | `s1_korea_production` 에 흡수 예정 |
| `MackerelNorwayAlt.tsx` | S1 | `s1_import_origin_mix` 에 흡수 예정 |
| `MackerelClimatePredictor.tsx` | S1 | `s1_sst_climate` 에 흡수 예정 |
| `MackerelAquaculture.tsx` | S2 | `s2_aquaculture` 에 흡수 예정 |
| `MackerelAfricanExportROI.tsx` | S3 | `s3_africa_roi` 에 흡수 예정 |
| `MackerelFTAQuarterly.tsx` | S3 | `s3_fta_quarterly` 에 흡수 예정 |
| `MackerelSafetyPremium.tsx` | S4 | `s3_mfds_safety` 에 흡수 예정 |

### 이번에 할 것 — 텔레메트리 정직화만

Claude의 ETL이 대체 데이터를 만들 때까지 이 7개는 화면에 남는다.
그동안 **표기가 실제보다 최신인 것처럼 보이지 않게** 한다.

각 컴포넌트의 `<WidgetCard telemetry={...}>` 를 아래 규칙으로 정정한다.

```tsx
// 규칙: syncDate 는 '데이터의 최신 연도'를 쓴다. 컴포넌트를 마지막으로 고친 날짜가 아니다.
telemetry={{
  status: 'STATIC',
  syncDate: '2023',                       // 실제 data 배열의 최신 연도
  source: 'FAO FishStat Capture 2024',    // 1차 출처명. 없으면 '출처 미확인'
}}
```

| 파일 | 현재 표기 | 정정 후 `syncDate` | 비고 |
|---|---|---|---|
| `MackerelKoreaSupply.tsx` | STATIC / 연도 없음 | `'2023'` | 자급률 수치는 건드리지 말 것 — Claude가 76.1%로 재계산 중 |
| `MackerelNorwayAlt.tsx` | 텔레메트리 없음 | `'2023'` + `status: 'STATIC'` 신규 추가 | 현재 4-Axis D등급의 원인 |
| `MackerelClimatePredictor.tsx` | STATIC / `'2024 (NOAA)'` | `'2024'`, source `'NOAA SST'` | **본문에 "추정" 명시 추가** — 예측 모델이다 |
| `MackerelAquaculture.tsx` | STATIC / `'2023'` | 유지 | 이미 정직함 |
| `MackerelAfricanExportROI.tsx` | STATIC / `'2024-03'` | `'2024'` + **"추정" 명시** | SCFI 가정 기반 시뮬레이션 |
| `MackerelFTAQuarterly.tsx` | STATIC / `'KMI ... 수동 추출'` | 유지 | 이미 정직함. 건드리지 말 것 |
| `MackerelSafetyPremium.tsx` | STATIC / 연도 없음 | `'2023'` | |

**"추정" 명시 방법**: `cardDesc` 문자열 끝에 ` (추정치 — 가정 기반 시뮬레이션)` 를 덧붙인다.
새 컴포넌트나 새 배지를 만들지 말 것. 문자열만 고친다.

### 하지 말 것

- 차트 로직·데이터 값 변경 금지. 숫자는 Claude가 아카이브에서 재생성한다.
- WidgetCard 패턴으로의 대규모 리팩터 금지. 이 7개는 어차피 흡수·폐기된다.
- 새 컴포넌트 신설 금지.

---

## 3. 검증 게이트

머지 전 아래 4개가 모두 통과해야 한다. 결과를 PR 본문에 붙일 것.

```bash
npm run lint
npm run typecheck
npm test
npm run build          # L-03 빌드 게이트
```

추가로:

```bash
# 삭제 후 고아 import 가 남지 않았는지
grep -rn "Mackerel\(AltSourcingIndex\|Blackhole\|FeedRatio\|FilletPenetration\|GhanaStrategy\|MacroCycle\|NorwaySpread\|ProcessedWidgets\|Sankey\|SizePremium\|SpreadWinners\|StorageTurnover\|TrioRadar\|TRQMeter\|UnitPrice\)" \
  --include="*.tsx" --include="*.ts" . | grep -v node_modules
# → 결과 0줄이어야 한다

# CSS 모듈이 살아 있는지
test -f components/MackerelStrategy.module.css && echo "CSS 보존 OK"

# 20개 대시보드가 여전히 빌드되는지는 npm run build 가 커버한다
```

---

## 4. 커밋 규약

```
chore(mackerel): remove 16 unrendered widget components

MackerelDashboard renders only 7 of 24 Mackerel components. The other 16
(~1,554 LOC) have no import anywhere in the repo. Verified by grep across
ts/tsx/js. MackerelStrategy.module.css is retained — 20 other dashboards
import it.
```

```
chore(mackerel): correct telemetry sync dates on surviving widgets

syncDate now reflects the latest year present in each widget's data array
rather than the last edit date. Simulation-based widgets are labelled as
estimates in cardDesc.
```

---

## 5. 완료 보고 형식

PR 본문에 아래를 채울 것.

```
삭제: 16 파일 / __ LOC
잔존 7개 telemetry 정정: __ 파일
grep 고아 참조: 0줄 (출력 첨부)
lint / typecheck / test / build: 전부 통과 (출력 첨부)
소유권 위반: 없음
```
