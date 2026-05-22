# Pollock Phase 2A.2 Wave 3 — 대형 2개 파일 마이그레이션 (최종)

> Wave 1·2 검증 패턴을 *대형 파일*에 확장. Pollock 100% closure.
> **scope lock**: 본 spec에 정의된 **2개 파일만**. 다른 파일은 이미 완료.

## 대상 파일 (Pollock 2A.2 최종 2개)

| # | 파일 | LOC | 카드 (추정) | 추천 Pillar |
|---|---|---|---|---|
| 1 | `PollockSupplyMacroWidgets.tsx` | 485 | ~20 | **S1** 원료 수급 (Supply Macro = 거시 공급) |
| 2 | `PollockFutureWidgets.tsx` | 389 | ~21 | **mixed** (Future 위젯들 — Sisyphus 파일 내용 보고 위젯별 pillar 결정) |

## 마이그레이션 규칙 (Wave 1·2와 동일)

### 변경 금지
1. SIT·TAK·source·차트 데이터 1글자 변경 X

### 변경
1. JSX: 인라인 → WidgetCard 1개 컴포넌트
2. **import default 패턴** `import WidgetCard from './WidgetCard'`
3. 신규 props: `pillar`, `telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }}`, `cardDesc` 1줄
4. TermTooltip 보존
5. 미사용 import 제거

## §X 체크리스트 (9항)

1. WidgetCard 사용 / 2. pillar / 3. telemetry / 4. cardDesc / 5. behavior preservation / 6. import 정리 / 7. default import / 8. tsc 통과 / 9. 단일 파일 변경

## 작업 순서

1. 파일 읽기 (대형 컨텍스트 주의)
2. 위젯별 pillar 결정
3. **subagent 위임 금지, Read+Write 직접**
4. §X 9/9 자기검증
5. `npx tsc --noEmit 2>&1 | grep <FileName>` 본 파일 에러 0건 확인
6. 별도 commit ([OMO] 접미사, --amend 금지)
7. 다음 파일

2개 완료 후 HANDOFF.md *append* (별도 commit).

## 모델: Claude Opus 4.6 thinking (variant max) — Wave 2 검증된 토폴로지 유지
