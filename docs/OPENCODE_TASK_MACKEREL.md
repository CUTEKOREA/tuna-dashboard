# OpenCode 작업지시서 — 고등어 provenance 렌더 계층

- 발행: 2026-08-13
- 담당: OpenCode
- 브랜치: `mackerel/opencode-provenance`
- 선행 문서: [MACKEREL_REVAMP_PLAN_2026-08-13.md](./MACKEREL_REVAMP_PLAN_2026-08-13.md)

---

## 0. 파일 소유권 (절대 규약)

이 브랜치에서는 **신규 파일 3개만 만든다. 기존 파일은 한 줄도 고치지 않는다.**

생성 대상:

```
components/WidgetProvenance.tsx     신규
components/MackerelWidgetV2.tsx     신규
lib/data/mackerel-v2.ts             신규
```

**읽기만 하고 절대 수정 금지** (다른 담당자가 동시 편집 중):

```
components/Mackerel*.tsx            ← Codex 담당
components/MackerelDashboard.tsx    ← Codex → Claude 순차 담당
components/WidgetCard.tsx           ← 공용. 읽어서 그대로 쓴다
lib/data/mackerel.ts                ← Claude 담당
scripts/mackerel/**                 ← Claude 담당
data/mackerel/**                    ← Claude 산출물. 읽기만
public/data/mackerel_real_data_v13.json
```

기존 파일에 손대야 할 이유가 생기면 고치지 말고 지시서에 코멘트로 남길 것.
결선(대시보드에 실제로 꽂는 작업)은 Claude가 마지막에 한다.

---

## 1. 입력 데이터 계약

Claude의 ETL이 `data/mackerel/` 에 아래 5개 번들을 낸다. **파일명은 고정이다.**

```
data/mackerel/_bundle_S1.json
data/mackerel/_bundle_S2.json
data/mackerel/_bundle_S3.json
data/mackerel/_bundle_S4.json
data/mackerel/_bundle_S5.json
```

현재 S1에 5개, S3에 2개가 들어 있고 나머지는 빈 배열이다. **빈 번들도 정상이며 크래시 없이 처리해야 한다.**
Claude가 빌더를 추가하면 같은 파일에 위젯이 늘어난다. 파일 개수·이름은 변하지 않는다.

### 번들 스키마

```jsonc
{
  "pillar": "S1",
  "widgets": [ /* 아래 위젯 객체 배열 */ ]
}
```

### 위젯 객체 스키마

```jsonc
{
  "id": "s1_korea_production",
  "title": "한국 생산량·자급률",
  "subtitle": "자급률 = 어획 ÷ (어획 + 수입). 2024년 76.1%. …",
  "chartType": "Composed",        // Area | Line | Bar | Composed | Pie | Radar
  "stacked": true,                // 선택. 없으면 false
  "xKey": "year",                 // Pie/Radar 에는 없을 수 있다
  "unit": "톤 / %",

  // 아래 3개는 차트 종류에 따라 있거나 없다. 없으면 빈 배열로 취급.
  "areas": [{ "key": "태평양참고등어", "color": "#0ea5e9" }],
  "bars":  [{ "key": "어획", "color": "#0ea5e9" }],
  "lines": [{ "key": "자급률", "color": "#ef4444", "yAxisId": "right" }],

  "data": [{ "year": "2024", "어획": 125448, "수입": 39454, "자급률": 76.1 }],

  "sit":   "2024년 자급률은 76.1%로 …",     // SIT — 현황 분석
  "strat": "'자급률 위기'는 사실과 다르다 …", // TAK — 액션 플랜

  "provenance": {
    "source_id": "FAO_FISHSTAT_GLOBAL_PRODUCTION",
    "publisher": "FAO",
    "series": "FishStat Global Production",
    "period": "2019-2024",
    "extract_date": "2026-08-12",
    "input_files": ["11_분석·가공데이터/collections/2026-08-12/fao_filtered/mackerel_capture.csv"],
    "input_sha256": ["9f2c…64자"],
    "method": "script",             // script | manual_extract | api_live
    "grade": "A",                   // A | B | C
    "rebuild": "python scripts/mackerel/build.py s1_korea_production",
    "note": "자급률 정의 A 확정(2026-08-13). …"   // 빈 문자열일 수 있다
  }
}
```

실제 샘플은 `data/mackerel/s1_korea_production.json` 을 직접 열어볼 것.

---

## 2. 작업 A — `components/WidgetProvenance.tsx`

위젯 하나의 `provenance` 블록을 사람이 3초 안에 읽을 수 있게 렌더한다.
**이 대시보드의 존재 이유가 "이 숫자 어디서 나왔냐에 답하는 것"이므로 이 컴포넌트가 핵심이다.**

### 인터페이스

```tsx
export interface ProvenanceData {
  source_id: string;
  publisher: string;
  series: string;
  period: string;
  extract_date: string;
  input_files: string[];
  input_sha256: string[];
  method: 'script' | 'manual_extract' | 'api_live';
  grade: 'A' | 'B' | 'C';
  rebuild: string;
  note?: string;
}

export default function WidgetProvenance({ provenance }: { provenance: ProvenanceData }): JSX.Element;
```

### 표시 규칙

한 줄 요약을 항상 보이게 하고, 상세는 클릭 시 펼친다.

```
접힘:  [A] FAO · FishStat Global Production · 2019-2024 · 2026-08-12 수집        ⌄
```

| 요소 | 규칙 |
|---|---|
| 등급 배지 | `A` = emerald `#10b981` / `B` = amber `#f59e0b` / `C` = rose `#ef4444` |
| `grade: 'C'` | 배지 옆에 **`추정`** 라벨을 반드시 함께 표시. 생략 불가 |
| `method: 'manual_extract'` | **`수동추출`** 라벨 표시. 자동 수집인 척 보이면 안 된다 |
| `method: 'api_live'` | `실시간` 라벨 |
| 펼침 시 | `input_files` 전체 경로, `input_sha256` 앞 12자, `rebuild` 커맨드, `note` |
| `rebuild` | 복사 가능하게 `<code>` 로. 복사 버튼은 만들지 말 것(불필요) |
| `note` | 빈 문자열이면 해당 줄을 렌더하지 않는다 |

### 등급 의미 (툴팁으로 노출)

- **A** — 1차출처를 스크립트로 기계 추출. 재실행하면 같은 값이 나온다.
- **B** — 1차출처지만 PDF 등에서 수동 추출. 재현에 사람 손이 필요하다.
- **C** — 추정·시뮬레이션 또는 2차출처. 가정이 바뀌면 값이 바뀐다.

### 스타일

- `UI_RULES.md` 준수. 다크 글래스모피즘, 얇은 테두리 `rgba(255,255,255,0.05)`.
- 툴팁을 쓴다면 `TermTooltip` 의 규칙을 따를 것 — 불투명 배경 `#1e293b`, 높은 z-index. 차트 선이 비쳐 보이면 안 된다.
- 새 CSS 파일을 만들지 말고 인라인 스타일 또는 기존 `WidgetCard.module.css` 클래스를 재사용한다.

---

## 3. 작업 B — `components/MackerelWidgetV2.tsx`

번들의 위젯 객체 1개를 받아 `WidgetCard` + Recharts 로 렌더한다.

### 인터페이스

```tsx
export default function MackerelWidgetV2({
  widget,
  pillar,
}: {
  widget: MackerelWidget;      // lib/data/mackerel-v2.ts 에서 export 한 타입
  pillar: 'S1' | 'S2' | 'S3' | 'S4' | 'S5';
}): JSX.Element;
```

### 매핑 규칙

기존 `components/WidgetCard.tsx` 의 props 를 그대로 쓴다. **WidgetCard 를 고치지 말 것.**

| 위젯 필드 | WidgetCard prop |
|---|---|
| `title` | `title` |
| `subtitle` | `cardDesc` |
| — | `pillar` (인자로 받은 값) |
| `sit` / `strat` | `takeaway={{ situation: sit, actionPlan: strat, source: <출처 문자열> }}` |
| `provenance` | `telemetry` 로 변환 + `<WidgetProvenance>` 를 차트 하단에 배치 |
| `data` + `chartType` | `chart={<…/>}` |

`telemetry` 변환 규칙:

```tsx
telemetry={{
  status: provenance.method === 'api_live' ? 'LIVE'
        : provenance.method === 'script'   ? 'SYNCED'
        : 'STATIC',
  syncDate: provenance.period,                    // 데이터 기간. 수집일이 아니다
  source: `${provenance.publisher} ${provenance.series}`,
}}
```

`takeaway.source` 는 `` `${publisher} ${series} (${period}, ${extract_date} 수집)` `` 로 만든다.

### 차트 렌더

`chartType` 별 분기. Recharts 사용. 기존 대시보드의 차트 코드를 참고하되 **복사해 오지 말고 최소한으로 작성**한다.

| chartType | 컴포넌트 | 비고 |
|---|---|---|
| `Area` | `AreaChart` + `Area` | `stacked: true` 면 `stackId="1"` |
| `Line` | `LineChart` + `Line` | `dot={false}`, `strokeWidth={2}` |
| `Bar` | `BarChart` + `Bar` | `stacked` 동일 규칙 |
| `Composed` | `ComposedChart` | `bars` → `Bar`, `lines` → `Line` |
| `Pie` | `PieChart` + `Pie` | `xKey` 없음. `data` 를 `{name, value}` 로 간주 |
| `Radar` | `RadarChart` + `Radar` | |

공통 요구:

- `SafeResponsiveContainer` 로 감쌀 것 (기존 컴포넌트, 그대로 import)
- 계열의 `color` 값을 그대로 쓴다. 색을 새로 정하지 말 것
- `yAxisId: 'right'` 가 있는 계열이 하나라도 있으면 우측 Y축을 추가
- `data` 가 빈 배열이면 차트 대신 `데이터 없음` 플레이스홀더

### 하지 말 것

- 위젯 데이터 값 가공·보정 금지. 받은 그대로 그린다.
- 위젯별 특수 분기 금지. `chartType` 스위치 하나로만 처리한다.
- 새 색상 팔레트 도입 금지.

---

## 4. 작업 C — `lib/data/mackerel-v2.ts`

번들 5개를 로드하는 얇은 계층. 기존 `lib/data/mackerel.ts` 의 정적 import 패턴을 따른다.

```ts
import s1 from '../../data/mackerel/_bundle_S1.json';
import s2 from '../../data/mackerel/_bundle_S2.json';
// … S3~S5

export type Pillar = 'S1' | 'S2' | 'S3' | 'S4' | 'S5';

export interface MackerelProvenance { /* 2절 스키마 그대로 */ }
export interface MackerelWidget { /* 2절 스키마 그대로 */ }

/** 해당 파트의 위젯 목록. 빈 배열일 수 있다. */
export function getPillarWidgets(pillar: Pillar): MackerelWidget[];

/** id 로 단건 조회. 없으면 undefined. */
export function getWidget(id: string): MackerelWidget | undefined;

/** 전체 위젯 수. 대시보드 헤더 카운터용. */
export function widgetCount(): number;
```

**요구사항**

- 타입은 이 파일에서 정의하고 export 한다. 다른 파일이 여기서 import 한다.
- 번들 5개를 모두 정적 import 한다. 동적 import·fetch 금지 (기존 패턴과 다르면 안 된다).
- `data` 배열 원소는 키가 위젯마다 달라 `Record<string, string | number>` 로 둔다.
- 런타임 검증·zod 도입 금지. 데이터는 빌드 시점에 Python 검증기가 이미 통과시킨 것이다.

---

## 5. 검증 게이트

머지 전 아래가 모두 통과해야 한다. 출력을 PR 본문에 붙일 것.

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

추가 확인:

```bash
# 기존 파일을 건드리지 않았는지 — 신규 3개만 나와야 한다
git diff --name-only main...HEAD
# 기대 출력:
#   components/MackerelWidgetV2.tsx
#   components/WidgetProvenance.tsx
#   lib/data/mackerel-v2.ts
```

**빈 번들 처리 확인**: 현재 S2·S4·S5 번들은 `widgets: []` 다.
`getPillarWidgets('S2')` 가 빈 배열을 반환하고 예외를 던지지 않아야 한다.

---

## 6. 커밋 규약

```
feat(mackerel): add provenance rendering layer

Adds WidgetProvenance (source/grade/rebuild display), MackerelWidgetV2
(bundle widget -> WidgetCard + Recharts), and mackerel-v2 data loader.
Grade C widgets are labelled as estimates and manual extracts are marked
as such, so no widget can present a derived figure as a measured one.

New files only; no existing file modified.
```

---

## 7. 완료 보고 형식

```
신규 파일: 3 (기존 파일 수정 0건 — git diff 출력 첨부)
chartType 지원: Area / Line / Bar / Composed / Pie / Radar
빈 번들 처리: S2·S4·S5 예외 없이 통과
lint / typecheck / test / build: 전부 통과 (출력 첨부)
소유권 위반: 없음
```
