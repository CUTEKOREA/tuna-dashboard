# 일간 Librarian Audit — 2026-05-23

- **모델**: `gemini-3.5-flash`
- **대상 파일**: 122개
- **총 위반 검출**: 105건
- **누적 비용**: $0.07676

## 파일별 결과

| 파일 | 위반 | 비용 | 시간 |
|---|---:|---:|---:|
| `artifacts/daily_audit/2026-05-23/components_CarrotDashboard.json` | 15 | $0.01222 | 54초 |
| `artifacts/daily_audit/2026-05-23/components_CashewStrategy.json` | 6 | $0.00455 | 15초 |
| `artifacts/daily_audit/2026-05-23/components_CassavaDashboard.json` | 4 | $0.00326 | 18초 |
| `artifacts/daily_audit/2026-05-23/components_ChickenCorporateWidget.json` | 0 | $0.00067 | 4초 |
| `artifacts/daily_audit/2026-05-23/components_ChickenDashboard.json` | 3 | $0.00341 | 18초 |
| `artifacts/daily_audit/2026-05-23/components_ChickenEmpiricalInsights.json` | 1 | $0.00127 | 9초 |
| `artifacts/daily_audit/2026-05-23/components_ChickenPartsWidget.json` | 0 | $0.00081 | 4초 |
| `artifacts/daily_audit/2026-05-23/components_ChickenThaiInsightsA.json` | 13 | $0.00396 | 22초 |
| `artifacts/daily_audit/2026-05-23/components_ChickenThaiInsightsB.json` | 17 | $0.00509 | 24초 |
| `artifacts/daily_audit/2026-05-23/components_CocoaDashboard.json` | 8 | $0.00753 | 36초 |
| `artifacts/daily_audit/2026-05-23/components_ColdStorageDashboard.json` | 7 | $0.00673 | 33초 |
| `artifacts/daily_audit/2026-05-23/components_FalklandSquidDashboard.json` | 0 | $0.00371 | 9초 |
| `artifacts/daily_audit/2026-05-23/components_GalchiDashboard.json` | 3 | $0.00478 | 25초 |
| `artifacts/daily_audit/2026-05-23/components_GarlicDashboard.json` | 4 | $0.00577 | 34초 |
| `artifacts/daily_audit/2026-05-23/components_Gtc2026Insights.json` | 8 | $0.00315 | 23초 |
| `artifacts/daily_audit/2026-05-23/components_JukkumiDashboard.json` | 6 | $0.00363 | 14초 |
| `artifacts/daily_audit/2026-05-23/components_KoreaConsignmentDashboard.json` | 6 | $0.00426 | 14초 |
| `artifacts/daily_audit/2026-05-23/components_LogisticsDashboard.json` | 4 | $0.00196 | 26초 |

## 다음 단계 권장
- 위반 수가 많은 파일 (top 3)을 사람 검토 → 정정 PR
- false positive 패턴이 반복되면 prompt 화이트리스트에 추가
- 위반 0건 dashboard는 audit 주기 일 → 주 단위로 완화 가능