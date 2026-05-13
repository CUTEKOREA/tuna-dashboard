---
name: widget-reliability-audit
description: "위젯 신뢰도 포렌식 감사 프로토콜. 4축 100점 스코어링(출처 권위도, 시간적 최신성, 수치 검증 가능성, 해석 충실도)으로 대시보드 위젯의 데이터 신뢰도를 평가한다. '위젯 신뢰도 평가', '데이터 검증', '포렌식 감사', 'audit widget', '점수 매겨줘' 등의 요청 시 사용."
---

# Widget Reliability Audit — 포렌식 감사 프로토콜

> 상세 프로토콜은 Knowledge Item에서 참조:  
> `~/.gemini/antigravity/knowledge/widget_reliability_audit/artifacts/SKILL.md`

이 스킬은 KI의 감사 프로토콜을 대시보드 하네스에 통합한 래퍼입니다.

## 실행 순서

1. **컴포넌트 코드 전문 읽기** → `view_file → {Dashboard}.tsx`
2. **JSON 데이터 전량 검사** → `run_command → cat data/{commodity}_*.json`
3. **위젯 목록 작성** (W1~Wn, I1~In)
4. **4축 채점 실행** (SRC/FRS/VRF/INT, 각 25점)
5. **산출물 생성** → `_workspace/04_auditor_{commodity}_report.md`

## 특수 규칙 (대시보드 하네스 전용)

### API 뱃지 검증
- `[Live 🟢]` 뱃지가 부착된 위젯은 실제 API 엔드포인트 연동을 확인한다
- 코드에서 `fetch()` 또는 API route 호출이 없는데 Live 뱃지가 있으면 **SRC -5점 감점**

### 6-Part 구조 검증
각 위젯이 6-Part 보고 아키텍처를 준수하는지 확인:
- [ ] Part 1: 헤드라인 + InfoTooltip 존재
- [ ] Part 2: 차트 (ResponsiveContainer 래핑)
- [ ] Part 3: SIT 현황 분석
- [ ] Part 4: STRAT Executive Takeaway
- [ ] Part 5: Source Attribution
- [ ] Part 6: API/Estimate Badge

### 빌드 검증 (자동)
```bash
npm run build 2>&1 | tail -20
```
빌드 에러가 1건이라도 있으면 전체 감사 등급을 **D**로 강제 판정한다.
