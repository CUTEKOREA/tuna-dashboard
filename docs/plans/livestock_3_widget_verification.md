# 📋 축산 3종 위젯 검증·보완 기획서 (Pork → Beef → Chicken)

> **작성**: Claude Code (2026-05-24)
> **요청**: 사용자 ("그래프 출력 상태, 데이터 근거 신뢰성, 현황 분석·실행 전략 전문성 역순 검증")
> **기준**: COMPREHENSIVE_RULEBOOK.md V4.1 **O-04** Forensic Audit 4-Axis + 본 기획 신설 **2-Axis (Visual·Domain)**
> **참조**: [forensic_audit/_plan.md](../../artifacts/forensic_audit/_plan.md) (기존 인프라)

---

## 1. 현황 (As-Is)

### 1.1 인벤토리

| Commodity | 파일 | 위젯 수 (추정) | LIVE endpoint 보유 | 검증 이력 |
|---|---|---:|---|---|
| **Pork** | `components/PorkWidgets.tsx` + `PorkDashboard.tsx` + `porkData.ts` | **11** (W1~W11) | 없음 (정적) | 없음 |
| **Beef** | `components/BeefWidgets.tsx` + `BeefDashboard.tsx` + `beefData.ts` | **11** (W1~W11) | **6 endpoint** (W1·W2·W3·W5·W6·W7·W8) | 없음 |
| **Chicken** | `components/Chicken*.tsx` (6 파일: Dashboard·CorporateWidget·PartsWidget·EmpiricalInsights·ThaiInsightsA·ThaiInsightsB) | **~10** (Dashboard widgets) + 추가 외부 컴포넌트 5개 | 11 endpoint (`/api/chicken/*`) | 없음 |
| **합계** | | **~32 위젯** | 17 endpoint | — |

### 1.2 알려진 약점

이전 작업에서 관측된 잠재 이슈:
1. **Pork**: 모두 정적 fallback, LIVE 호출 없음 → Data Freshness 낮음
2. **Beef**: LIVE endpoint 6개 중 W3·W5만 실제 LIVE, W6·W7·W8은 schema 미세 차이로 fallback (이전 검증)
3. **Chicken**: API endpoint 11개 존재하지만 대부분 정적 JSON 서빙 (실제 외부 fetch 아님)
4. **공통**: 4-Axis Forensic Audit 미수행 (Mackerel만 Pilot 5건)

---

## 2. 목표 (To-Be)

### 2.1 핵심 목표
1. 축산 3종 32 위젯에 대해 **6-Axis 평가** 수행 (기존 O-04 4-Axis + 본 기획 Visual·Domain 2-Axis)
2. 각 위젯에 대해 **유지 / 보완 / 폐기·재작성** 의사결정
3. **C-Level PEF 임원 시각** (룰북 P-01, P-02)의 SIT·TAK 도메인 전문성 보강
4. **그래프 시각 품질** 일관성 회복 (잘림·축 누락·범례·색상)
5. **데이터 출처 1차 자료 우선** (FAOSTAT QCL/FBS, USDA PSD, KOSIS, KAMIS, OEC, KCS) — 상업 보고서 60점 cap

### 2.2 비목표
- 위젯 추가 / pillar 재매핑 (별도 작업)
- LIVE API 신규 endpoint (별도 작업 — `docs/api_keys/beef_live_apis.md` 참조)
- 위젯 통합·분할 (별도 PR)

---

## 3. 검증 6-Axis Schema (4 기존 + 2 신규)

룰북 O-04 (4-Axis)에 본 기획 **Visual·Domain 2-Axis** 추가.

### 3.1 기존 4-Axis (Forensic Audit)

| Axis | 점수 기준 | 평가 evidence |
|---|---|---|
| **A1. Source Reliability** | 1차 자료(FAOSTAT/USDA/KOSIS) 100 / 2차 기관(KREI/MLA) 75 / 상업 보고서(Tridge) 60 / 추정 40 / 미상 0 | source 필드 명시, URL 유효성 |
| **A2. Data Freshness** | <6개월 100 / <1년 75 / <2년 50 / >2년 25 / 미상 0 | syncDate vs 발행 시점 |
| **A3. Verifiability** | NotebookLM/외부 cross-check 100 / 부분 70 / paid wall 30 / 불가 0 | 1차 출처 첨부·인용 가능성 |
| **A4. Integration Completeness** | SIT 수치 = chart 데이터 = TAK 정합 100 / 부분 60 / 모순 0 | 위젯 내 데이터·문장 정합성 |

### 3.2 **신규 4-Axis** (본 기획 보강 — 사용자 컨펌 (b))

| Axis | 점수 기준 | 평가 evidence |
|---|---|---|
| **A5. Visual Output 품질** | X·Y축 라벨 한글 7자 이하 / 범례·툴팁 일치 / 색상 대비 충분 / 잘림 없음 100 / 일부 위반 60 / 다수 위반 0 | UI_RULES.md §3 (Recharts), 룰북 D-05 (한글 7자 + smart rotation), L-05 (ResponsiveContainer collapse) |
| **A6. Domain Expertise (C-Level PEF)** | SIT 수치 구체성 + TAK 수익성/리스크 기반 액션 + 산업 용어 정확성 100 / 일반론 60 / 평면 진술 0 | 룰북 P-01 (수익성 중심) · P-02 (유통·물류 혁신) · W-03 (SIT 2~3문장 + TAK 1~2문장) |
| **A7. Mobile UX** | data-mobile-stack 적용 + 375px 1-Col 정상 + 차트 가로 스크롤 없음 + 폰트 ≥10px 100 / 일부 위반 60 / 다수 위반 0 | ADR 0008 mobile codemod, viewport 375px 검증 |
| **A8. Accessibility** | 색맹 대비(R/G 의존 X, 패턴 보완) + 텍스트 대비 WCAG AA(4.5:1) + 인터랙티브 키보드 접근 100 / 일부 위반 60 / 다수 위반 0 | WCAG 2.1 AA, 대비 분석기, 색약 시뮬레이션 |

### 3.3 합격선

- **합격 (Grade A)**: **8-Axis** 평균 ≥ 85
- **조건부 (Grade B)**: 70~84 → 정정 후 재검증
- **즉시 archive (Grade C/D/F)**: < 70 → **위젯 폐기 + archive 폴더로 이동** (사용자 컨펌 (i))
- **재작성 후보**: archive 위젯은 별도 신규 위젯 작성 큐로 분류

---

## 4. 작업 범위 (역순)

사용자 요청 역순 = 가장 최근 작업한 것부터 → **Chicken → Beef → Pork**.

| 순번 | Commodity | 위젯 수 | 예상 시간 | 우선순위 |
|---|---|---:|---:|---|
| 1차 | **Chicken** | ~15 | 60분 | High (API 다수, 검증 시급) |
| 2차 | **Beef** | 11 | 45분 | High (최근 LIVE 작업, fine-tune 필요) |
| 3차 | **Pork** | 11 | 45분 | Mid (정적, 도메인 보강만) |
| **합계** | | **~37 위젯** | **~150분** | |

---

## 5. 검증 방법론 (Pipeline)

### 5.1 단계별 작업

```
[Phase 0] 인벤토리 추출
   ↓
[Phase 1] 그래프 시각 검증 (Browser MCP 또는 수동 dev 서버)
   - 사이드바 클릭 → 각 pillar 활성화 → 위젯 5단 순회 → 스크린샷
   - X축 라벨 잘림, 범례 한글, ResponsiveContainer collapse 등 체크
   ↓
[Phase 2] 데이터 출처 신뢰성 검증 (Librarian 또는 수동)
   - source 필드 추출 → FAOSTAT/USDA/KOSIS/KAMIS 등 1차 자료 매핑
   - 발행 시점 (syncDate) vs 현재 (2026-05-24) 신선도 계산
   ↓
[Phase 3] SIT/TAK 도메인 전문성 검증 (Claude Opus 4.7)
   - 산업 용어 정확성 (예: ASF·BSE·NSP·HACCP·EUDR·MFN·FTA·HSK)
   - SIT 수치 구체성 (단위·연도·등급)
   - TAK 수익성/리스크 기반 액션 명시
   ↓
[Phase 4] 6-Axis 점수 산출 → 위젯별 grade·verdict·remediation 큐
   ↓
[Phase 5] 즉시 정정 (수정 가능 항목)
   - 한글 라벨 7자 초과 → truncate or smart rotation
   - 출처 1차 자료 보강 (FAOSTAT 링크 추가)
   - SIT/TAK 영문 단독 → 한글화
   ↓
[Phase 6] commit + push + 프로덕션 배포 + HANDOFF 갱신
```

### 5.2 산출물 형식

각 위젯당 1 JSON 파일:
```json
{
  "widget_id": "W1_ASFCycle",
  "dashboard": "PorkDashboard",
  "title": "글로벌 생산량 및 질병(ASF) 사이클",
  "evaluated_at": "2026-05-24",
  "evaluator": "Claude Opus 4.7 (Claude Code 세션)",
  "axes": {
    "source_reliability": { "score": 90, "evidence": "FAOSTAT QCL Item 1035 명시", "issues": [] },
    "data_freshness": { "score": 75, "evidence": "2024 데이터, 1년 경과", "issues": [] },
    "verifiability": { "score": 90, "evidence": "FAOSTAT 공개 DB cross-check 가능", "issues": [] },
    "integration_completeness": { "score": 100, "evidence": "SIT 수치 = chart 데이터 정합", "issues": [] },
    "visual_output": { "score": 80, "evidence": "X축 한글 OK, 가격 지수 우축 범례 OK", "issues": ["연도 라벨 X축 너비 약간 밀착"] },
    "domain_expertise": { "score": 85, "evidence": "ASF 사이클 + WOAH·CME 인용, TAK 실행 가능", "issues": [] }
  },
  "score_avg": 87,
  "grade": "A",
  "verdict": "approve",
  "remediation": ["X축 마진 확보 권장"]
}
```

저장 위치: `artifacts/forensic_audit/2026-05-24/{Pork|Beef|Chicken}Dashboard/{widget_id}.json`

각 dashboard별 `_summary.md`:
- 위젯 grade 분포 표
- 4-Axis 평균
- 발견 패턴 (best practices + 정정 필요)
- 정정 큐 (우선순위 정렬)

---

## 6. 보완 액션 분류

### 6.1 자동 정정 가능 (Phase 5 즉시 실행)
- 한글 라벨 7자 초과 → `formatXAxis` truncate
- 영문 단독 → 한글(약어) 병기 (L-01)
- 단위 누락 → 괄호 표기 `(천 톤)`, `(USD/kg)`
- syncDate 갱신
- source 1차 출처 링크 보강

### 6.2 수동 정정 필요 (별도 commit)
- SIT 수치 구체성 부족 → 도메인 데이터 추가 조사 + 재작성
- TAK 일반론 → C-Level PEF 시각 실행 액션으로 재작성
- 차트 종류 부적절 → Bar↔Line↔Composed 전환

### 6.3 위젯 폐기 / 재작성 (Grade < 70)
- 1차 자료 부재 + 정량 근거 부족 → 위젯 archive 후 신규 위젯 작성
- 차트 데이터·SIT·TAK 모순 → 데이터 재수집 후 전면 재작성

---

## 7. 작업 단계 (총 ~3.5h, Phase별 commit 분리)

| Phase | 작업 | 시간 | 산출물 |
|---|---|---:|---|
| **0** | 사용자 컨펌 (본 기획서) | — | — |
| **1.1** | Chicken 6 파일 위젯 인벤토리 + 6-Axis 평가 | 45분 | `artifacts/forensic_audit/2026-05-24/ChickenDashboard/*.json` + `_summary.md` |
| **1.2** | Chicken 즉시 정정 + commit | 15분 | `fix(chicken): forensic 6-axis 보강` commit |
| **2.1** | Beef 11 위젯 6-Axis 평가 (LIVE schema 재검토 포함) | 30분 | `BeefDashboard/*.json` + `_summary.md` |
| **2.2** | Beef 즉시 정정 + KOSIS/KAMIS/KCS schema 수정 | 30분 | `fix(beef): forensic + LIVE schema` commit |
| **3.1** | Pork 11 위젯 6-Axis 평가 | 30분 | `PorkDashboard/*.json` + `_summary.md` |
| **3.2** | Pork 즉시 정정 + 도메인 보강 | 20분 | `fix(pork): forensic 도메인 보강` commit |
| **4** | 통합 summary + HANDOFF 갱신 + 프로덕션 배포 | 10분 | `artifacts/forensic_audit/2026-05-24/_livestock_summary.md` |

---

## 8. 리스크 & 완화

| 리스크 | 영향 | 완화책 |
|---|---|---|
| **수동 평가 주관성** | grade 일관성 저하 | 본 기획 6-Axis schema 엄격 적용, 평가 evidence 필수 |
| **위젯 폐기 시 사용자 영향** | UX breaking change | Grade<70 위젯은 즉시 폐기 안 함, "조건부 차단" 표시 후 사용자 컨펌 후 재작성 |
| **LIVE schema 수정 시 fallback 깨짐** | 프로덕션 에러 | fallback 보존 + L-03 빌드 게이트 통과 후만 push |
| **시간 초과** | Phase 4 못 끝남 | Chicken Phase 1 완료 시점에 진행도 보고 + 사용자 결정 |

---

## 9. 성공 기준

- ✅ 축산 3종 32 위젯 6-Axis 평가 완료
- ✅ 평균 grade A (≥85) 달성 위젯 비율 ≥ 70%
- ✅ Grade C 이하 위젯 식별 + 정정 큐 commit
- ✅ 즉시 정정 가능 항목 (한글·단위·출처) 모두 반영
- ✅ L-03 빌드 통과 + 프로덕션 배포
- ✅ `_livestock_summary.md`로 패턴·best practice 추출 (다음 commodity 적용)

---

## 10. 다음 단계 (역순 확산 로드맵)

축산 3종 완료 후 본 기획의 6-Axis schema·pipeline을 다음 순서로 적용:

| 순서 | 대상 | 위젯 수 | 우선도 사유 |
|---|---|---:|---|
| 4 | Mangosteen | ~15 | 농산 최근 완료 |
| 5 | Cocoa | ~21 | 정정 큐 기존 보유 |
| 6 | Carrot | ~14 | 정정 큐 기존 보유 |
| 7 | Garlic | ~20 | 인라인 패턴 복잡도 高 |
| 8 | Cassava | ~10 | 가장 단순 |
| 9 | Cashew | ~39 | 가장 위젯 多 |
| 10~17 | 수산 8종 | ~400 | Tuna closure 제외 |

---

## 11. 결정 필요 사항 (사용자 컨펌)

다음 3건 컨펌 후 Phase 1.1 (Chicken) 즉시 착수:

1. **검증 6-Axis schema OK?** (4 기존 + 2 신규 Visual·Domain)
   - (a) 그대로 OK
   - (b) Axis 추가 (예: Mobile UX, Accessibility)
   - (c) 가중치 조정 (Visual·Domain 비중 ↑)

2. **위젯 폐기 임계값?**
   - (i) Grade < 70 → 즉시 archive (제 의견)
   - (ii) Grade < 60 → 즉시 archive (관대)
   - (iii) 폐기 안 함, 모두 보존 + 정정만

3. **LIVE schema 동시 수정?**
   - (가) Beef KOSIS/KAMIS/KCS schema 수정 같이 진행 (시간 +30분)
   - (나) Forensic만, schema는 별도 PR
   - (다) Beef LIVE는 건드리지 않음

3건 답변 받으면 Phase 1.1 (Chicken) 즉시 착수.
