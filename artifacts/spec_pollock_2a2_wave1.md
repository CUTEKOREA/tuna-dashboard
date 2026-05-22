# Pollock Phase 2A.2 Wave 1 — 소형 8개 파일 마이그레이션

> **목적**: ADR-0005 WidgetCard 마이그레이션을 *연속 8개 파일*에 적용. Pilot에서 검증된 패턴(ADR-0006의 Stage 1 chaining)을 활용.
> **모델**: 직접 Gemini API (`google/gemini-2.5-pro`) — Google AI Ultra $100 한도 활용
> **검증된 가정 (Pilot 6f6e848)**: 위젯별 SIT/TAK/source/차트 데이터 **1글자도 변경 금지** + pillar/cardDesc/telemetry 신규 추가 패턴.
> **scope lock**: 본 spec에 정의된 *8개 파일만* 마이그레이션. 다른 Pollock*.tsx (중·대형 4개)는 *건드리지 말 것*.

---

## 대상 파일 (8개) + Pillar 가이드

| # | 파일 | LOC | 카드 | 추천 Pillar | 사유 |
|---|---|---|---|---|---|
| 1 | `PollockComplianceWidgets.tsx` | 172 | 5 | **S3** | 통관·규제 준수 |
| 2 | `PollockDraftInsights.tsx` | 246 | 7 | 파일 읽고 결정 | mixed (Draft = 초안 인사이트) |
| 3 | `PollockFinancialWidgets.tsx` | 177 | 5 | **S4** | 재무·시장 |
| 4 | `PollockMacroWidgets.tsx` | 170 | 5 | **S1** | 거시 수급 |
| 5 | `PollockPolicyRiskRadar.tsx` | 203 | 7 | **S3** | 정책 리스크 |
| 6 | `PollockSupplyResilience.tsx` | 181 | 7 | **S1** | 공급 회복력 |
| 7 | `PollockTradeWidgets.tsx` | 179 | 5 | **S3** | 무역·통관 |
| 8 | `PollockValueAddWidgets.tsx` | 171 | 5 | **S2** | 가공·부가가치 |

**Pillar 결정 권한**: 추천을 *기본*으로 하되, Sisyphus가 파일 내용을 읽고 위젯별로 더 적합한 pillar가 명확하면 그것으로. 단일 파일 내 위젯들이 다른 pillar에 속하면 위젯마다 다른 pillar 사용 가능.

## 마이그레이션 규칙 (Pilot과 동일)

### 변경 금지 (behavior preservation)
1. SIT 텍스트 (`situation`)
2. TAK 텍스트 (`actionPlan`)
3. source 텍스트
4. 차트 데이터 (모든 const 배열)
5. 차트 컴포넌트 구조 (Radar/Bar/Line/Composed/Pie dataKey, color, fillOpacity 등)
6. icon import + 사용 위치

### 변경 (refactor)
1. JSX 구조: 인라인 CardHeader+cardBody+TakeawayBox → `WidgetCard` 1개 컴포넌트
2. import 정리: `SafeResponsiveContainer`, `TakeawayBox`, `TermTooltip`, `styles`, 내부 `CardHeader` 함수 제거
3. `WidgetCard` import 추가
4. **신규 props 추가** (W-04 의무):
   - `pillar="S1"~"S5"` (위 가이드 또는 파일 내용 기반 결정)
   - `telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }}`
   - `cardDesc`: 기존 TermTooltip description의 첫 1줄 추출 또는 위젯 title + 차트 의도 1줄 요약

### TermTooltip 보존
기존 `term`/`desc`가 있으면 `termTooltip={{ term, description }}` 그대로 WidgetCard에 전달.

## §X 체크리스트 (각 파일마다 적용)

| # | 항목 |
|---|---|
| 1 | 모든 위젯 `WidgetCard` 컴포넌트 사용 |
| 2 | 모든 위젯 `pillar` 속성 명시 |
| 3 | 모든 위젯 `telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }}` |
| 4 | 모든 위젯 `cardDesc` 1줄 |
| 5 | SIT·TAK·source·차트 데이터 1글자 변경 X |
| 6 | 미사용 import 제거 (styles·CardHeader·SafeResponsiveContainer·TakeawayBox·TermTooltip 중 사용 안 하는 것) |
| 7 | `npm run build` 본 파일 에러 0건 |
| 8 | `git diff --stat`에서 이 1개 파일만 변경 (다른 Pollock*.tsx 0 변경) |

## 작업 순서 (자율 chaining, 8회 commit 분리)

각 파일마다:
1. 파일 읽기 (3-5 위젯 구조 파악)
2. 각 위젯 pillar 결정
3. 마이그레이션 (delegate to visual-engineering category 권장)
4. §X 8/8 자기검증
5. `npm run build` 에러 0건 확인
6. `git add components/<File>.tsx && git commit -m "refactor: migrate to WidgetCard in <FileName> (Wave 1 #N) [OMO]"`
7. 다음 파일로 이동

8번째 파일까지 완료 후 HANDOFF.md 갱신 (별도 commit, **`--amend` 사용 금지**, ADR-0006 권고대로 신규 commit으로).

## Ralph Loop 진입 prompt

```
ultrawork: artifacts/spec_pollock_2a2_wave1.md 의 지침대로
8개 파일 (PollockComplianceWidgets / PollockDraftInsights /
PollockFinancialWidgets / PollockMacroWidgets /
PollockPolicyRiskRadar / PollockSupplyResilience /
PollockTradeWidgets / PollockValueAddWidgets) 을 순차로 마이그레이션한다.

ADR-0005 WidgetCard 사용. SIT/TAK/source/차트 데이터는 1글자도 변경 금지.
각 파일마다 §X 체크리스트 8/8 통과 후 별도 commit ([OMO] 접미사).
8개 모두 완료 후 HANDOFF.md 갱신 (별도 commit, --amend 금지).

다른 중·대형 Pollock 파일(Future/ProcessingMargin/SalesValue/SupplyMacro)은
이 Wave에서 절대 건드리지 말 것.
```
