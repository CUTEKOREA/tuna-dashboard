# Pollock Phase 2A.2 Wave 2 — 중형 2개 파일 마이그레이션

> **목적**: Wave 1 (8 파일 완료) 패턴을 *중형 파일*에 확장. Pilot+Wave 1에서 검증된 규칙 동일 적용.
> **scope lock**: 본 spec에 정의된 **2개 파일만**. 다른 Pollock*.tsx (대형 2개: SupplyMacro·Future)는 Wave 3에서. 건드리지 말 것.

## 대상 파일 (2개)

| # | 파일 | LOC | 카드 | 추천 Pillar |
|---|---|---|---|---|
| 1 | `PollockProcessingMarginWidgets.tsx` | 520 | ~22 | **S2** 가공·생산 (Processing Margin = 가공 마진) |
| 2 | `PollockSalesValueWidgets.tsx` | 410 | ~21 | **S4** 판매·수요 (Sales Value) |

**Pillar 결정 권한**: 위 추천을 기본, Sisyphus가 파일 내용 보고 위젯별 다른 pillar 적용 가능. 단일 파일에 위젯이 5-Pillar 여러 곳에 걸치면 위젯마다 다른 pillar OK.

## 마이그레이션 규칙 (Wave 1과 동일)

### 변경 금지 (behavior preservation)
1. SIT 텍스트
2. TAK 텍스트
3. source 텍스트
4. 차트 데이터 (모든 const 배열)
5. 차트 컴포넌트 구조 (dataKey, color, fillOpacity 등)
6. icon import + 사용 위치

### 변경 (refactor)
1. JSX: 인라인 CardHeader+cardBody+TakeawayBox → `WidgetCard` 1개 컴포넌트
2. import 정리: 미사용 `SafeResponsiveContainer`·`TakeawayBox`·`TermTooltip`·`styles` 제거
3. **import default 패턴** 사용: `import WidgetCard from './WidgetCard'` (named import 금지 — Wave 1 #5-8 패턴 따름)
4. 신규 props 추가 (W-04):
   - `pillar="S<n>"`
   - `telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }}`
   - `cardDesc`: 기존 TermTooltip description 첫 1줄 추출 또는 위젯 title + 차트 의도 1줄 요약

### TermTooltip 보존
기존 `term`/`desc`가 있으면 `termTooltip={{ term, description }}` 그대로 전달.

## §X 체크리스트 (각 파일마다)

| # | 항목 |
|---|---|
| 1 | 모든 위젯 `WidgetCard` 컴포넌트 사용 |
| 2 | 모든 위젯 `pillar` 명시 |
| 3 | 모든 위젯 `telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }}` |
| 4 | 모든 위젯 `cardDesc` 1줄 |
| 5 | SIT·TAK·source·차트 데이터 1글자 변경 X |
| 6 | 미사용 import 제거 |
| 7 | `import WidgetCard from './WidgetCard'` (default import) |
| 8 | `npm run build` 본 파일 에러 0건 |
| 9 | `git diff --stat`에서 이 1개 파일만 변경 |

## 작업 순서 (Wave 1 패턴)

각 파일마다:
1. 파일 읽기 (위젯 수·구조 파악)
2. 위젯별 pillar 결정
3. Read+Write로 **직접 수정** (subagent 위임 금지, Python 스크립트 금지)
4. §X 9/9 자기검증
5. `npm run build` 또는 `npx tsc --noEmit` 본 파일 에러 0건 확인
6. `git add components/<File>.tsx && git commit -m "refactor: migrate to WidgetCard in <File>.tsx (Wave 2 #N) [OMO]"`
7. 다음 파일

2개 완료 후 HANDOFF.md *append* + 별도 commit ([OMO] 접미사, `--amend` 금지).

## 권장 토폴로지 (Antigravity 쿼터 가용 시)

```
sisyphus: google/antigravity-gemini-3.1-pro variant=high  (Wave 1 검증 패턴)
또는
sisyphus: google/antigravity-claude-opus-4-6-thinking variant=max  (17:06 KST reset 후 가능)
```

대형 파일이라 Claude Opus가 reasoning quality 더 좋으나 일일 쿼터 한도 주의.
