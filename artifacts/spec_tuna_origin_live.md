# Stage 2.1 Pilot 위젯 Spec — 참치 산지 단가 추이 (Live 데이터)

> **목적**: Stage 0 mock 위젯 `TunaOriginPriceTrend`의 *Live 버전* 생성. 본 프로젝트의 *진짜 가치*(검증된 실데이터 → 무인 위젯 생성) 증명.
> **차별점**: Stage 0은 mock 데이터(`const data = [...]` 인라인). Stage 2.1은 `public/data/tuna/origin_price_trend.json`에서 **Live API First 정신에 정합한 JSON 로딩**.
> **데이터 출처**: Atuna (글로벌 참치 시장 가격 인덱스) — Claude Code가 `~/.claude/manuals/agri_commodity_data_collection.md`를 따라 사전 수집한 자산.

---

## 1. 위젯 정체성

| 항목 | 값 |
|---|---|
| **위젯 한글 제목** | 참치 산지 단가 추이 (Live) |
| **위젯 영문 식별자** | `TunaOriginPriceTrendLive` |
| **귀속 Pillar** | S1 🐟 원료 수급 |
| **commodity** | 참치 (Tuna, Skipjack/가다랑어) |
| **시그니처 그라디언트** | `cyan → blue` (ADR-0001 / D-04) |

## 2. 파일 위치

```
components/TunaOriginPriceTrendLive.tsx          ← 신규 생성
public/data/tuna/origin_price_trend.json         ← 이미 작성됨 (Live 데이터)
```

## 3. 데이터 로딩 (⚠️ Stage 0과 결정적 차이)

```typescript
// Stage 0 (mock):
const data = [ { region: '인도양', price: 1450, change: -3.2 }, ... ];

// Stage 2.1 (Live):
import originPriceData from '../public/data/tuna/origin_price_trend.json';
const data = originPriceData.data;
```

또는 fetch API 패턴 가능 (A-01 Live API 정신에 더 정합):
```typescript
const [data, setData] = useState([]);
useEffect(() => {
  fetch('/data/tuna/origin_price_trend.json')
    .then(r => r.json())
    .then(json => setData(json.data));
}, []);
```

→ **fetch 패턴 권장** — 위젯이 mock import에 묶이지 않고, 데이터 갱신 시 .tsx 재빌드 불필요.

## 4. 차트 시각화 (Stage 0과 동일)

- **차트 타입**: `BarChart` (Recharts)
- **X축**: `region` (한글 5자 이내 — D-05 통과)
- **Y축**: `price` — `tickFormatter={(v) => v.toLocaleString()}`
- **단위**: `(USD/MT)` ← **⚠️ Stage 0과 다름** (Stage 0은 원/kg mock, Stage 2.1은 Atuna 원천 단위 USD/MT 유지 — A-02 데이터 신선도 정신상 *원천 단위 보존*이 정확)
- **툴팁**: `{region} · {price.toLocaleString()} USD/MT · 전월 대비 {change > 0 ? '+' : ''}{change}% · {asOf}`
- **색상**: 시그니처 그라디언트 `cyan(#22d3ee) → blue(#3b82f6)` SVG linearGradient
- **ResponsiveContainer**: 100%/100%

## 5. TelemetryBadge (W-04)

```tsx
<TelemetryBadge status="SYNCED" syncDate="2026-05-21" />
```
**⚠️ Stage 0의 `STATIC`이 아니라 `SYNCED`** — Atuna가 *주기적 갱신되는 외부 데이터 소스*라 `STATIC`(고정 mock) 부적절. 향후 Atuna API 직접 연동 시 `LIVE`로 격상.

## 6. cardDesc (W-04)

```
Atuna 글로벌 시장가 인덱스 5개 항구(서아프리카·서태평양·동태평양·서인도양·지중해) Skipjack 최신 단가
```
- 1줄, 산출 방법론 + 어종 명시
- TermTooltip: `Atuna · Skipjack`

## 7. SIT / TAK (W-03)

### SIT (실데이터 기반, 객관)
> 2026년 5월 기준 5개 항구 Skipjack 평균 1,659 USD/MT. **동태평양(Manta 2,000) > 서태평양(Bangkok 1,975) > 지중해(Vigo 1,600) > 서인도양(Seychelles 1,500) > 서아프리카(Abidjan 1,220)** 순. 동태평양·서태평양 단가 격차가 서아프리카 대비 ~60% 프리미엄, 어획 비용·물류 거리·가공 인프라 차이 반영.

### TAK (수익성·리스크)
> 서아프리카(Abidjan) 1,220 USD/MT는 5개 항구 중 최저 — 원물 매입 비용 측면 우위. 단 EU 항구(Vigo)·아시아 시장으로의 물류비를 더해야 실 도착가가 산출됨. Q2 어획 시즌(5-8월) 진입 전 *Abidjan 원물 + Vigo 가공* 코스트 시뮬레이션 1주 내 실행 권고.

### source
```
Atuna 시장가 인덱스 (Bangkok·Manta·Seychelles·Abidjan·Vigo, 2026-03-31~2026-05-12 latest)
```

## 8. §X 체크리스트

| # | 항목 | 비고 |
|---|---|---|
| 1 | cardDesc 1줄 산출 방법론·출처 | ✅ Atuna + 5 항구 명시 |
| 2 | TelemetryBadge **SYNCED** + 2026-05-21 | ⚠️ Stage 0 STATIC과 다름 |
| 3 | SIT 2~3문장 + 객관 숫자 | ✅ 실데이터 5개 가격 + ratio |
| 4 | TAK 1~2문장 + 수익성·리스크 | ✅ Abidjan-Vigo arbitrage 시뮬 |
| 5 | X축·툴팁·범례 100% 한글 | ✅ |
| 6 | 단위 `(USD/MT)` 명기 | ⚠️ Stage 0의 원/kg와 다름 |
| 7 | 5-Pillar S1 명시 | ✅ |
| 8 | WidgetCard 사용 + JSON fetch | ✅ |
| 9 | `npm run build` 본 파일 에러 0건 | ✅ |
| 10 (신규) | **`public/data/tuna/origin_price_trend.json` import/fetch** | ✅ Live 데이터 경로 명시 |

## 9. Stage 0 vs Stage 2.1 비교 매트릭스 (사용자 가치 증명용)

| 측면 | Stage 0 (mock) | Stage 2.1 (Live) |
|---|---|---|
| 데이터 출처 | OMO Sisyphus 추정 mock | Atuna 실시장 인덱스 |
| 단가 | 1,450·1,380·1,620·1,520·1,780 원/kg | 1,220·1,975·2,000·1,500·1,600 USD/MT |
| 변동률 | OMO 임의 | Atuna 실제 전월 대비 |
| TelemetryBadge | STATIC | SYNCED |
| Pillar 인식 | OMO 자체 결정 | 사람 검증된 spec |
| 본 프로젝트 가치 | OMO 작동 검증의 *증거물* | **즉시 운영 도입 가능** |

## 10. Ralph Loop 진입 prompt

```
ultrawork: artifacts/spec_tuna_origin_live.md 의 위젯을
components/TunaOriginPriceTrendLive.tsx 로 신규 생성한다.
ADR-0005 WidgetCard 사용. public/data/tuna/origin_price_trend.json을 fetch로 로드.
SIT/TAK는 spec 그대로 (1글자 변경 X). spec §8 체크리스트 10/10 통과까지 자기참조 반복.
완료 시 git commit (메시지 끝에 [OMO] 접미사).
```
