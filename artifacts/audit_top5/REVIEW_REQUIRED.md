# Top 5 Dashboard L-01 Audit — 사람 검토 필요 위반 (2026-05-22)

**Pro 2.5 audit + 빈도 ≥3 token 12건 자동 정정 후 잔여**

## 자동 정정 완료 (12건)

| Token | 변환 | 적용 |
|---|---|---|
| `CapEx` | 자본적 지출(CapEx) | PetFood ×1 |
| `ICCO Quarterly Bulletin` | ICCO 분기별 회보(ICCO Quarterly Bulletin) | Cocoa ×3 |
| `GPM` | 매출총이익률(GPM) | PetFood ×3 |
| `PB` | 자체 브랜드(PB) | PetFood ×5 |

## Pro Audit 통합 결과

| Dashboard | 검출 (high) | 비용 |
|---|---|---|
| CarrotDashboard | 46 (44) | $0.075 |
| PetFoodDashboard | 50 (48) | $0.069 |
| CocoaDashboard | 29 (27) | $0.052 |
| GalchiDashboard | 15 (10) | $0.037 |
| MackerelDashboard | 38 (33) | $0.054 |
| **합계** | **178 (162)** | **$0.287** |

## 잔여 156 unique 위반 (사람 검토)

대부분이 단일 노출이라 자동 일괄 변환 적합 X. 다음 카테고리 별로 검토 필요:

### A. 영문 보고서·논문 제목 (자동 정정 안전 가능)
한글 풀네임 + 영문 원제 병기 패턴.
예: `Atlantic Cocoa Initiative 2025 Outlook` → `대서양 코코아 이니셔티브 2025 전망(Atlantic Cocoa Initiative 2025 Outlook)`

각 파일에서 정확한 영문 구절은 audit JSON 참조:
- `artifacts/audit_top5/<file>_pro.json`

### B. 영문 단어 단독 (도메인 표준 vs 미번역)
도메인 표준 (FAOSTAT QCL/FBS/TM, HS Code 등)은 화이트리스트 추가 후보. 일반 영문 단어는 한글로 정정.

### C. False positive (Pro도 잡음)
일부 한글 외래어·고유명사도 위반으로 검출되는 경우 — 사람 검토에서 reject.

## 권장 정정 흐름

1. 각 dashboard 별로 audit JSON 열기
2. high confidence 위반만 추출 → top 5-10 정정
3. Pro 재audit으로 효과 검증
4. 잔여는 정기 주간 audit cron에 위임

## 비용 누적 (Top 5 정정 트랙)

- 5 dashboard Pro audit: **$0.287**
- 누적 (이번 세션 전체): ~$0.78 / paid $100 한도의 0.78%

## 다음 액션 후보

| 우선순위 | 작업 | 시간 |
|---|---|---|
| 1 | 각 dashboard 별 high confidence top 5 수동 정정 (5×30분 = 2.5h) | 2-3h |
| 2 | 영문 보고서 제목만 일괄 정정 (Python script) — 안전성 검증 후 | 1h |
| 3 | 일간 cron audit에 위임 — 매일 정기 검출 + 누적 patch | 자동 |
| 4 | dashboard-by-dashboard slow improvement (별도 세션) | iterative |
