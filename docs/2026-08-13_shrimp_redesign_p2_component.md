# /shrimp 전면 개편 — 컴포넌트 리팩터 명세 (P2·P3)

> 대상: `components/ShrimpDashboard.tsx` (715줄)
> 전제: P1이 `public/data/shrimp_real_data_v4.json`을 이미 생성했다 (위젯 21 + KPI 6, 모든 위젯에 `pillar` 필드 보유)
> 원칙: 5-Pillar 구조·5탭 유지. 신규 렌더러 0.

---

## 0. 절대 규칙

1. **5탭 구조를 깨지 마라.** 룰북 6장(Universal 5-Pillar)은 예외 없는 MUST다. `activePart` useState와 `renderWidgetCard`의 pillar 파라미터가 `'S1'|'S2'|'S3'|'S4'|'S5'` 리터럴 유니온으로 고정돼 있으니 그대로 둔다.
2. **공용 컴포넌트를 재구현하지 마라.** `WidgetCard` · `TelemetryBadge`(named export) · `ChartPatterns`의 `getA11yBarProps` · `TermTooltip` · `lib/chart-standards.ts`의 `truncateXAxis`를 그대로 쓴다.
   - ⚠️ `ChartPatterns`의 `getPatternFill`은 쓰지 마라. Recharts `<Bar>`에서 투명 렌더 버그가 확인돼 솔리드로 회귀했다. `getA11yBarProps(index)`만 사용.
   - ⚠️ `components/ShrimpWidgetCommon.tsx`를 import하지 마라. 여기 export된 `WidgetCard`는 표준 `WidgetCard`와 이름만 같은 레거시(telemetry 옵셔널·cardDesc 없음)다. 이 파일은 Squid 대시보드가 쓰므로 삭제도 하지 마라.
3. **`lib/dashboard-registry.ts`·`app/[category]/page.tsx`·`app/page.tsx`는 무변경.** shrimp는 이미 배선돼 있다.
4. **API 라우트 파일(`app/api/shrimp/*`)을 삭제하지 마라.** `__tests__/architecture-guards.test.ts`가 라우트 계약 최소 32개를 강제한다. 이번엔 컴포넌트 쪽 호출만 정리한다.
5. 새 CSS 모듈을 만들지 마라. 현행은 `WidgetCard` 경유로 `TunaInsightsDashboard.module.css`를 쓴다.

---

## 1. PILLARS 단일 배열로 통합

지금은 위젯 배치 정보가 두 곳으로 갈라져 있다.

- `SECTIONS` 배열 (145~156행) — pillar별 위젯 id 목록
- `EXTRA_BY_PILLAR` 맵 (22~28행) — pillar별 주입 컴포넌트

pillar를 재배치할 때 두 군데를 고쳐야 하고, 한쪽만 고치면 위젯이 미분류 폴백으로 샌다. `components/PollockDashboard.tsx`의 `PILLARS` 패턴을 그대로 가져와 하나로 합친다.

```ts
const PILLARS = [
  { id: 'S1', num: '❶', label: '원료 수급', title: '🦐 제1기둥 — 원료 수급',
    desc: '...', color: '#10b981', icon: Anchor,
    widgets: [...], customInject: [] },
  ...
] as const;
```

**pillar별 위젯 id (v4 기준, 21개)**

| pillar | 위젯 id | 수 |
|---|---|--:|
| S1 | `w01_paradigm_shift`, `w02_top10_by_source`, `w03_species_concentration`, `w04_argentina_landings`, `w50_kfas_bft_pathogen` | 5 |
| S2 | `w03_processing`, `w_proc1_type_production`, `w08_processing_reversal`, `w09_feed_vs_processing_margin` | 4 |
| S3 | `w10_world_exporters`, `w11_ecuador_monthly`, `w12_reprocessing_hubs`, `w13_kr_import_by_stage` | 4 |
| S4 | `w14_top_import_markets`, `w15_pinksheet_nominal`, `w16_spain_exw_ladder`, `w_kr_shrimp_origin_price`, `w_proc2_kr_import_type` | 5 |
| S5 | `w_india_shaphari`, `w_vn_traceability_risk`, `w21_cert_landscape` | 3 |

> 실제 id는 P1이 생성한 `public/data/shrimp_real_data_v4.json`에서 읽어 확인하라. 위 표와 다르면 **JSON이 정본**이다.

`customInject`: S3에만 `ShrimpFTAQuarterly` 1개. 나머지는 빈 배열.

**미분류 폴백 제거**: 현행은 S4 활성 시 미매핑 위젯을 "기타 분석"으로 떨어뜨린다(624~626행, 648~658행). v4는 21개 전부 `pillar` 필드를 갖고 PILLARS와 1:1 대응하므로 이 폴백은 불필요하다. 다만 **조용히 지우지 말고**, 미매핑 위젯이 있으면 개발 콘솔에 경고를 남기는 형태로 바꿔라 — 회귀 감지용.

**pillar 값의 출처**: v4 위젯이 `pillar` 필드를 직접 갖는다. `renderWidgetCard(w)`가 `w.pillar`를 쓰도록 바꾸고, 호출부에서 섹션 id를 넘기던 방식은 없앤다. (현행 v3는 pillar 필드가 0개라 `scripts/extract_shrimp_widgets.py`가 전건 `None`을 반환하는 상태다 — 이 리팩터로 그 스크립트가 처음으로 유의미해진다.)

---

## 2. renderChart 이중 분기 정리

`renderChart`가 NEW FORMAT(`xKey`/`bars`/`lines`/`areas`)과 OLD FORMAT(`xAxis`/`series`)을 각각 완전한 switch로 갖고 있어 약 150줄이 중복이다.

**정리하되 동작을 바꾸지 마라.** 특히:

- NEW FORMAT switch에는 `pie`·`area`·`bar`·`composed`만 있고 **`line`이 없다**. `line`은 OLD FORMAT 분기에만 존재한다.
- v4에서 `line` 차트는 `w15_pinksheet_nominal` **하나뿐이고, P1이 이 위젯을 OLD FORMAT(`xAxis`+`series`)으로 emit한다.** 따라서 NEW FORMAT에 `line`을 추가할 필요가 없다.
- 정리 방향: 두 포맷을 렌더 직전에 공통 중간 표현(`{xKey, series:[{key,name,color,type}]}`)으로 정규화한 뒤 switch를 하나만 남기는 것. 이렇게 하면 `line`이 양쪽에서 자연히 동작하고 중복도 사라진다.
- **정규화 후 기존 위젯이 동일하게 렌더되는지 반드시 확인하라.** 특히 `composed`의 이중축(`hasDualAxis` / `yAxisId="right"`) 로직, `pie`의 `percent > 0.03` 라벨 조건, `area`의 `linearGradient` id 생성 규칙.

**신규 렌더러 금지.** 생키·히트맵·표를 새로 만들지 마라. v4에는 그런 차트가 없다.

**`chartType: "none"` 처리**: `w21_cert_landscape`는 차트가 없고 `customBody` 배열만 갖는다. `WidgetCard`의 `customBody` prop으로 렌더하고 `chart` prop은 넘기지 마라. `components/ShrimpFTAQuarterly.tsx`가 같은 패턴의 모범이니 참고하라.

---

## 3. 부분월 데이터 포인트 표시

`w04_argentina_landings`의 8월 데이터 포인트는 `partial: true` 플래그를 갖는다. 8/1~8/4 나흘치라 7월(45,552 t) 옆에 같은 색 막대로 그리면 -93% 붕괴 착시가 생긴다.

`<Bar>`에 `<Cell>`을 써서 `partial === true`인 포인트만 회색(`var(--text-secondary)`)으로 칠하고, x축 라벨은 JSON이 준 `8월(1~4일)`을 그대로 쓴다. 카드 `cardDesc`에도 부분월임이 나오도록 P1이 subtitle을 채워 두었다.

---

## 4. 데이터 소스 교체

- `fetch('/data/shrimp_real_data_v3.json')` → `fetch('/data/shrimp_real_data_v4.json')`
- v3 파일은 지우지 마라 (P5 전후 회귀 비교에 쓴다).

---

## 5. P3 — 정직화 (같은 파일에서 이어서)

현행 헤더는 "9개 API 응답"을 세지만, **fetch하는 9개 중 실제 렌더에 쓰이는 건 4개(`customs`·`sourcing-sim`·`kamis`·`macro`)뿐이고 나머지 5개는 응답을 버린 채 카운터만 올린다.** v4는 21개 위젯 전부 SYNCED/STATIC이라 이 4개마저 소비자가 없어진다.

따라서:

1. **`SHRIMP_API_SOURCES` 배열(31~41행)과 그것을 소비하는 `useEffect`의 `Promise.all` fetch 블록을 전부 제거한다.** `apiData` state도 제거.
2. **헤더의 "N개 API 응답" 배지를 제거한다**(420~428행). 대신 데이터 빈티지 배지로 교체: `FishStat 2026.1.0 · 2024년 기준`.
3. **"관세/환율 충격 시뮬레이터" 블록 전체를 제거한다**(480~525행). 근거:
   - `simBaseMargin = 15.0`은 코드에 박힌 가정치이고 `(15 - (환율-1385)/100 - 관세)` 산식은 출처 없는 합성값이다 (룰북 A-01 위반).
   - 이 페이지의 목적은 **산업의 이해**이지 조달 시뮬레이션이 아니다.
   - 시뮬레이터가 사라지면 `simExchangeRate`·`simTariff`·`simBaseMargin` state와 `macro` 라우트 소비도 함께 사라진다.
4. `displayWidgets` 매핑에서 `apiData.customs` / `apiData.sourcing` 바인딩 블록(218~244행)을 제거한다. v4는 정적 스냅샷이 정본이다.
5. `renderWidgetCard`의 `honestStatus` 계산은 유지하되, v4가 `telemetry`를 `SYNCED`/`STATIC`으로 직접 주므로 그 값을 그대로 신뢰하도록 단순화한다. **`LIVE`로 승격시키는 경로를 남기지 마라.**

> 라우트 파일 자체는 남긴다. `customs` 라우트의 L-04 위반(`hsSgn='030617'` 6자리 — KCS는 HSK 10자리 의무)과 `emerging-markets`·`forecast`·`compliance`의 L-09 위반은 **별도 티켓**이다. 이번 P3는 컴포넌트가 거짓 라벨을 노출하지 않게 하는 것까지다.

---

## 6. 완료 게이트

```bash
npm run verify        # lint → typecheck → test → api-cache → build → bundle
npm run dev           # 육안 확인
```

육안 체크리스트:
- [ ] 5탭 전부 전환되고 각 탭에 3~5개 위젯
- [ ] "기타 분석(uncategorized)" 섹션이 **나타나지 않음**
- [ ] `w15_pinksheet_nominal`이 "Unsupported"가 아니라 실제 line 차트로 렌더
- [ ] `w04_argentina_landings`의 8월 막대가 회색 + `8월(1~4일)` 라벨
- [ ] `w21_cert_landscape`가 차트 없이 목록으로 렌더
- [ ] LIVE 배지 0개, 헤더에 "N개 API 응답" 문구 없음, 시뮬레이터 없음
- [ ] 헤더 위젯 수 표기가 실렌더 수와 일치 (하드코딩 금지 — `displayWidgets.length` 파생)

```bash
grep -n "SHRIMP_API_SOURCES\|시뮬레이터\|simBaseMargin\|LIVE API 연동\|실시간 연동중" components/ShrimpDashboard.tsx
# → 0건이어야 함
```
