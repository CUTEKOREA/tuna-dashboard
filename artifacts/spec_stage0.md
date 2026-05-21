# Stage 0 검증 위젯 Spec — 참치 산지 단가 추이 (BarChart)

> **목적**: OMO 4-Agent 무인 루프(Sisyphus → Hephaestus → Oracle → Verifier)가 V4.1 룰북 게이트를 사람 개입 없이 통과하는지 검증.
> **이 spec은 Planner(Prometheus/Gemini 3 Pro) 호출 없이 사람이 직접 작성** — Stage 0의 변수 최소화. Stage 1에서는 Planner가 spec을 생성하도록 권한 위임.
> **단일 진실 출처**: 본 spec과 충돌하는 코드는 Reviewer가 차단.

---

## 1. 위젯 정체성

| 항목 | 값 |
|---|---|
| **위젯 한글 제목** | 참치 산지 단가 추이 |
| **위젯 영문 식별자** (코드 내부) | `TunaOriginPriceTrend` |
| **귀속 Pillar** (5-Pillar) | 1. 🐟 원료 수급 (Raw Material) |
| **commodity** | 참치 (Tuna) |
| **시그니처 그라디언트** | `cyan → blue` (참치 매핑, ADR-0001 / D-04) |
| **카테고리** (OMO category) | `deep` (Gemini 3 Pro variant=high) |

## 2. 파일 위치 (예상)

```
tuna-dashboard-omo/components/TunaOriginPriceTrend.tsx          ← 신규 생성
tuna-dashboard-omo/components/TunaOriginPriceTrend.module.css   ← 신규 생성 (선택, WidgetCard가 처리하면 생략)
```

**중요**: ADR-0005 Widget Intake Module(`WidgetCard`)이 이미 ACCEPTED 상태. 신규 위젯은 **WidgetCard 컴포넌트를 사용**해야 한다 (보일러플레이트 복붙 금지). `components/WidgetCard.tsx` 임포트 후 props로 구성.

## 3. 데이터 (정적 mock — Stage 0 한정)

```typescript
const data = [
  { region: '인도양',   price: 1450, change: -3.2 },
  { region: '서태평양', price: 1380, change: +1.8 },
  { region: '동태평양', price: 1620, change: +5.4 },
  { region: '대서양',   region_full_en: 'Atlantic', price: 1520, change: -1.1 },
  { region: '지중해',   price: 1780, change: +8.7 }
];
// 단위: 원/kg
// 출처: WCPFC 2025 Q3 + IATTC 추정치 (Stage 0 mock — 실제 적용 시 Live API)
// syncDate: '2026-05-21'
// 한글 라벨 5개 모두 7자 이내 ✓ (D-05 통과)
```

**A-01 Live API First**의 정신상 mock 데이터는 Stage 0 검증 한정. Stage 1+에서는 WCPFC/IATTC API 또는 KAMIS 호출로 전환 (별도 ADR 발의).

## 4. 차트 시각화

- **차트 타입**: `BarChart` (Recharts)
- **축 매핑**:
  - X: `region` (한글 5자 이내, smart rotation 불필요)
  - Y: `price` — `tickFormatter={(v) => v.toLocaleString()}` 적용 (3-Step 콤마, UI_RULES.md 3-2)
- **단위 표기**: Y축 label 또는 cardDesc에 `(원/kg)` 명기 (W-02)
- **툴팁**: 한글 — `{region} · {price.toLocaleString()}원/kg · 전월 대비 {change > 0 ? '+' : ''}{change}%`
- **색상**: 시그니처 그라디언트 `cyan → blue` (참치). Bar fill을 단색이 아닌 SVG `linearGradient`로.
- **ResponsiveContainer**: `width="100%" height="100%"` (UI_RULES.md 3-1)

## 5. TelemetryBadge (W-04 의무)

```tsx
<TelemetryBadge status="STATIC" syncDate="2026-05-21" />
```
Stage 0에서는 `STATIC`이 정확함 (mock 데이터). Stage 1+ Live API 전환 시 `LIVE` 또는 `SYNCED`로 변경.

## 6. cardDesc (W-04 의무)

```
WCPFC·IATTC 2025 Q3 보고 + IATTC 추정치를 합산한 5대 해역별 산지 단가
```
1줄, 산출 방법론·출처를 모두 포함. 영문 약어(WCPFC, IATTC)는 첫 노출이라 TermTooltip 부착 권장.

## 7. SIT / TAK (W-03 의무)

### SIT (Situation, 2~3문장, 객관·숫자 기반)
> 5대 해역 평균 산지 단가는 1,550원/kg으로 전월 대비 +2.3%. 지중해(1,780원/kg, +8.7%)와 동태평양(1,620원/kg, +5.4%)이 상승을 견인했으나, 인도양은 -3.2%로 단가 분산이 확대 중이다.

### TAK (Takeaway, 1~2문장, C레벨 실행 지침)
> 지중해 상승이 일시적 환율 효과인지 항만 비용 구조 변화인지 30일 내 재검증 필요. 인도양 단가 약세를 활용해 Q4 원료 비축 확대를 우선 검토 — 예상 마진 갭 +2.1pp.

## 8. 룰북 게이트 체크리스트 (W-04, Reviewer가 검증)

- [ ] cardDesc 1줄 산출 방법론·출처 포함
- [ ] TelemetryBadge 부착 (`STATIC` + `syncDate=2026-05-21`)
- [ ] SIT 2~3문장, 숫자 포함
- [ ] TAK 1~2문장, 수익성·리스크 기반
- [ ] X축·Y축·범례·툴팁 100% 한글 매핑 (영문 잔존 0건)
- [ ] 단위 `(원/kg)` 명기
- [ ] 5-Pillar 중 "원료 수급" pillar 명시
- [ ] `WidgetCard` 컴포넌트 사용 (보일러플레이트 복붙 금지, ADR-0005)
- [ ] 로컬 `npm run build` 통과 (L-03)

## 9. 4-Agent 역할 매핑

| Agent | 모델 | 입력 | 출력 |
|---|---|---|---|
| **Sisyphus** (오케스트레이터) | antigravity-claude-opus-4-6-thinking | 본 spec | 작업 분해 + Hephaestus·Oracle 호출 시퀀스 |
| **Hephaestus** (워커) | antigravity-gemini-3-pro variant=high | spec + 룰북 컨텍스트 | `components/TunaOriginPriceTrend.tsx` + 커밋 |
| **Oracle** (리뷰어) | openai/gpt-4o | git diff + 본 spec의 §8 체크리스트 | review_<sha>.md (블로커/논블로커 분리) |
| **Verifier** (외부) | Antigravity IDE + Claude Code MCP | 빌드된 화면 | 스크린샷 + L-03 게이트 통과 여부 |

## 10. Ralph Loop 진입 prompt (제안)

```
ultrawork: artifacts/spec_stage0.md 에 정의된 "참치 산지 단가 추이" 위젯을
components/TunaOriginPriceTrend.tsx 로 신규 생성하라.

V4.1 룰북(CLAUDE.md → COMPREHENSIVE_RULEBOOK.md)과 UI_RULES.md, CONTEXT.md를
컨텍스트로 사용하고, ADR-0005의 WidgetCard 컴포넌트를 반드시 사용한다.

§8 체크리스트 모두 통과할 때까지 자기참조 반복하라.
완료 시 git commit (메시지 끝에 [OMO] 접미사).
```

**중요**: `ultrawork`(또는 `ulw`)를 포함하면 OMO의 Ralph Loop가 활성화됨 (README "Magic Word" 섹션).
