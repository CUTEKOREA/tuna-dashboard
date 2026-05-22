# Stage 2.2 Pilot 위젯 Spec — 참치 어종별 글로벌 어획량 추이 (Live)

> **Stage 2.2 진입 증명**: 사용자 한 줄 트리거로 Claude Code가 Phase A(데이터 추출)+B(spec)+C(OMO 호출)+D(검증·preview)까지 연속 실행.
> **데이터**: FAO FishStat `Capture_Quantity_tuna66.csv` (175K rows) → 가다랑어·황다랑어·눈다랑어 8년 집계 → `public/data/tuna/catch_by_species.json`.

## 위젯 정체성

| 항목 | 값 |
|---|---|
| 위젯 한글 제목 | 참치 어종별 글로벌 어획량 추이 (Live) |
| 영문 식별자 | `TunaCatchBySpeciesLive` |
| Pillar | S1 🐟 원료 수급 |
| 차트 타입 | `LineChart` (Recharts) — 3-series (가다랑어·황다랑어·눈다랑어) × 8년 |
| 시그니처 그라디언트 | 3개 시리즈에 cyan→blue→purple 그라디언트 적용 |

## 파일 위치

```
components/TunaCatchBySpeciesLive.tsx          ← 신규
public/data/tuna/catch_by_species.json         ← 이미 작성됨 (FishStat Capture Q_tlw)
```

## 데이터 로딩

```typescript
useEffect(() => {
  fetch('/data/tuna/catch_by_species.json')
    .then((r) => r.json())
    .then((json) => setData(json.data));
}, []);
```

데이터 shape:
```typescript
interface CatchEntry {
  year: string;
  가다랑어: number;  // 톤
  황다랑어: number;
  눈다랑어: number;
}
```

## 차트 시각화

- **차트 타입**: `LineChart` 3-line (Recharts)
- **X축**: `year` (2015~2022, 한글 4자 이내)
- **Y축**: 톤 단위, `tickFormatter={(v) => (v / 1000000).toFixed(1) + 'M'}` (백만톤 약식)
- **단위**: `(톤, live weight)` — FishStat 원천 단위 보존
- **라인 색상**:
  - 가다랑어 (Skipjack, 상위) → `#22d3ee` (cyan)
  - 황다랑어 (Yellowfin) → `#3b82f6` (blue)
  - 눈다랑어 (Bigeye, 하위) → `#8b5cf6` (purple)
- **툴팁**: 한글 — `{year}년 · {species} {value.toLocaleString()}톤`
- **Legend**: 한글 어종명 (가다랑어·황다랑어·눈다랑어)

## TelemetryBadge (W-04)

```tsx
telemetry={{ status: 'SYNCED', syncDate: '2026-05-21' }}
```

## cardDesc (W-04)

```
FAO FishStat 2015-2022 Capture Quantity (Q_tlw, 톤 live weight) 기반 3대 참치 어종 어획량 시계열
```

## TermTooltip

```tsx
termTooltip={{
  term: 'FishStat · Q_tlw',
  description: 'FishStat는 FAO의 수산물 생산 통계 데이터베이스. Q_tlw는 살아있는 무게 환산 톤 단위 어획량.'
}}
```

## SIT / TAK

### SIT
> 2022년 기준 가다랑어 3,061,304톤(전 어종 61%) · 황다랑어 1,563,619톤(31%) · 눈다랑어 357,628톤(7%) — 가다랑어가 양적 압도. 2015-2022 8년간 가다랑어는 ~3M톤 박스권 안정, 황다랑어는 1.4-1.6M톤 점진 증가, 눈다랑어는 자원 회복 우려로 0.35M톤 박스권.

### TAK
> 가다랑어 의존도 60%+ = ENSO·라니냐 한 사건이 글로벌 공급 60% 직격. 황다랑어 비중 30%대를 35%+로 끌어올리는 *어획권 다변화* 전략이 단기 수익성보다 *장기 공급 안정성*에 결정적. 신라교역 차원에서 황다랑어 어획권 보유 선사와 5년 장기 공급 계약 검토.

### source
```
FAO FishStat Capture Statistics 2015-2022 (Q_tlw, 자료수집 매뉴얼 v28.4 §2 FishStat 3 zip)
```

## §X 체크리스트

| # | 항목 |
|---|---|
| 1 | cardDesc 1줄 (FAO FishStat 출처) |
| 2 | TelemetryBadge `SYNCED` |
| 3 | SIT 2~3문장 + 숫자 (3대 어종 + ratio) |
| 4 | TAK 1~2문장 + 전략 제안 (어획권 다변화) |
| 5 | X축·Y축·툴팁·legend 100% 한글 |
| 6 | 단위 `(톤, live weight)` |
| 7 | Pillar S1 |
| 8 | WidgetCard + fetch JSON |
| 9 | `npm run build` 본 파일 에러 0건 |
| 10 | `public/data/tuna/catch_by_species.json` import/fetch |

## Ralph Loop 진입 prompt (Stage 2.2 자동 호출 예정)

```
ultrawork: components/TunaCatchBySpeciesLive.tsx 를 신규 생성한다.
spec: artifacts/spec_tuna_catch_live.md.
ADR-0005 WidgetCard 사용. public/data/tuna/catch_by_species.json을 fetch로 로드.
SIT/TAK는 spec 그대로 1글자 변경 X.
subagent 위임 금지. Read+Write 직접 작성.
spec §X 체크리스트 10/10 통과까지 자기참조 반복.
완료 시 git commit ([OMO] 접미사). 다른 파일 건드리지 말 것.
```
