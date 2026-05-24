# 축산 3종 통합 Forensic Audit Summary (2026-05-24)

> 평가자: Claude Opus 4.7 (Claude Code 세션)
> 기준: 8-Axis schema (4 기존 O-04 + 4 신규: Visual·Domain·Mobile·Accessibility)
> 합격선: A≥85 / B 70~84 / **C<70 즉시 archive**

## 통합 결과 표

| Dashboard | 위젯 수 | A 합격 | B 조건부 | **C archive** | 평균 Grade |
|---|---:|---:|---:|---:|:---:|
| **Chicken** | 11 | 0 (0%) | 9 (82%) | **2 (18%)** 🚫 | B (76.4) |
| **Beef** | 11 | **7 (64%)** ⭐ | 4 (36%) | 0 | A- (85.5) |
| **Pork** | 11 | **7 (64%)** ⭐ | 4 (36%) | 0 | A- (84.1) |
| **합계** | **33** | **14 (42%)** | **17 (52%)** | **2 (6%)** | B+ |

## 🚫 Archive 처리 완료 (2건)

| 위젯 | Grade | 사유 | Archive 위치 |
|---|---|---|---|
| `w_chicken_eudr_esg` | C (66.5) | 레이더 정량 산출 방법론 전무, MSCI 무관 | `_archive/api/chicken/eudr-esg/` |
| `w_chicken_risk_radar` | C (64.4) | NotebookLM 정성 분석, OIE WAHIS 미연동 | `_archive/api/chicken/risk-radar/` |

ChickenDashboard P5 ESG pillar의 widgets 배열 비움, desc에 "재구성 중" 안내.
fetch 호출에서 두 endpoint 제거 (L-03 빌드 통과 ✓).

## 🛠️ Phase 2.2 Beef LIVE schema fine-tune 완료

| Endpoint | 변경 | 효과 |
|---|---|---|
| W6 `/api/beef/korea-imports` | HSK 4자리 → **10자리 × 6 코드 병렬** (룰북 L-04) | KCS 실제 데이터 매핑 가능 |
| W7 `/api/beef/korea-supply` | KOSIS tblId `DT_114_2017_S0034` → `DT_1IZ1101` (orgId 114 → 101) | 통계청 가축통계조사 정확 매핑 시도 |
| W8 `/api/beef/hanwoo-price` | KAMIS `kindcode='00'` → **한우 '01' 1++ / 수입 '02'** | 등급별 정확 가격 |

L-03 빌드 통과 ✓ (프로덕션 검증은 deploy 후)

## ⭐ Best Practices (확산 대상)

| 위젯 | 패턴 | 다음 commodity 적용 권장 |
|---|---|---|
| Beef W3 도축장 | USDA NASS LIVE + lb→kg 환산 + partial 분기 필터 | 모든 LIVE endpoint |
| Beef W5 무역 흐름 | UN Comtrade Public Preview 무인증 + 1주 캐시 | 모든 commodity 무역 위젯 |
| Pork W1 ASF 사이클 | WOAH·CME 활용 + TAK 동적 전략 | 질병/사이클 위젯 공통 |
| Chicken `corporates` | IR 페이지 번호까지 명시 | 기업 분석 위젯 |
| 모든 commodity | data-mobile-stack 적용 (A7 평균 90점) | 모든 신규 위젯 의무 |

## ⚠️ 공통 약점 (개선 큐)

1. **A8 Accessibility 평균 70~75점** — 색맹 대비(R/G 의존), WCAG AA 미준수
   → 차트 라이브러리 패턴 채우기(stripe pattern) 일괄 적용 검토
2. **시계열 데이터 신선도 평균 75점** — 2022-2024 정적 데이터 多
   → cron 기반 분기 갱신 인프라 (Beef W3/W5 패턴)
3. **출처 신뢰성 — 자체 추정/시나리오 데이터** — 일부 위젯 (Chicken risk-radar 같은 케이스)
   → "시나리오 데이터" 시각 구분 (점선·음영) 의무화 + 출처에 "추정" 명시

## 다음 작업 (역순 확산)

| 순서 | 대상 | 예상 위젯 수 | 우선도 |
|---|---|---:|---|
| 4 | Mangosteen | ~15 | 농산 최근 완료 |
| 5 | Cocoa | ~21 | 정정 큐 기존 보유 (`_remediation_queue.md`) |
| 6 | Carrot | ~14 | 동일 |
| 7 | Garlic | ~20 | 인라인 패턴 복잡도 高 |
| 8 | Cassava | ~10 | 가장 단순 |
| 9 | Cashew | ~39 | 가장 위젯 多 |
| 10~17 | 수산 8종 | ~400 | Tuna closure 제외 |

## 산출물

- `artifacts/forensic_audit/2026-05-24/ChickenDashboard/_summary.md`
- `artifacts/forensic_audit/2026-05-24/BeefDashboard/_summary.md`
- `artifacts/forensic_audit/2026-05-24/PorkDashboard/_summary.md`
- `artifacts/forensic_audit/2026-05-24/_livestock_summary.md` (본 문서)
- `_archive/api/chicken/eudr-esg/`, `_archive/api/chicken/risk-radar/`
- `components/ChickenDashboard.tsx` (P5 widgets 비움, fetch 제거)
- `app/api/beef/{korea-imports,korea-supply,hanwoo-price}/route.ts` (schema fine-tune)
