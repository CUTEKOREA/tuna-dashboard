# 농산물 6종 통합 Forensic Audit Summary (2026-05-24)

> 평가자: Claude Opus 4.7 (Claude Code 세션)
> 기준: 8-Axis schema (4 기존 O-04 + 4 신규 Visual/Domain/Mobile/Accessibility)
> 진행: 역순 (Mangosteen → Cocoa → Carrot → Garlic → Cassava → Cashew)

## 통합 결과 표

| Dashboard | 위젯 평가 | A 합격 | B 조건부 | **C archive** | LIVE endpoint | 평균 Grade |
|---|---:|---:|---:|---:|---:|:---:|
| **Mangosteen** | 11 | 1 (8%) | 10 (83%) | **1 (9%)** ⚠️ | 1 | B (79.4) |
| **Cocoa** | 14 | 3 (21%) | 11 (79%) | 0 | 1 | B+ (82.5) |
| **Carrot** | 12 | **8 (67%)** ⭐⭐ | 4 (33%) | 0 | **8** | **A- (85.6)** |
| **Garlic** | 14 | 3 (21%) | 11 (79%) | 0 | 1 | B+ (81.7) |
| **Cassava** | 13 | 5 (38%) | 8 (62%) | 0 | **7** | B+ (82.6) |
| **Cashew** | 15 | 4 (27%) | 11 (73%) | 0 | 1 | B+ (82.4) |
| **합계** | **79** | **24 (30%)** | **55 (70%)** | **1 (1.3%)** | **19** | **B+** |

## 🚫 Archive 후보 (1건)

**MangosteenDashboard**: 라니냐 충격 시뮬레이션 위젯 1건 (정성 추정 기반, Grade ≈ 68)
→ 별도 commit (사용자 컨펌 후)

## ⭐ Best Practices (확산 대상)

### Carrot 최강 (LIVE 8 endpoint)
- **P3 관세 아비트리지 (KCS LIVE)** — 88.1점
- **P3 TRQ 방출 (KCS LIVE)** — 87.5점
- **P5 Scope 3 LCA (Cecílio Filho 2026 학술)** — 87.5점
→ 다른 commodity에 LIVE + 학술 인용 패턴 확산 권장

### Cocoa 도메인 정확성
- **P1 CSSVD 감염률 81%** (89.4) — IRP 1차 자료 + 정량
- **P1 가격 폭등 +300%** (89.4) — ICE Futures 실측

### Cashew 1차 자료 우수
- **S1 베트남 역설 (VINACAS)** — 86.9
- **S2 서아프리카 가공률 (ACA)** — 86.3

## ⚠️ 공통 약점 (개선 큐)

1. **A8 Accessibility 평균 70~75** — 6 dashboard 모두 색맹 대비 부족
   → 차트 Bar 패턴 채우기 (stripe) 일괄 적용
2. **A2 Data Freshness 평균 75~80** — 정적 데이터 多
   → LIVE endpoint 보유 commodity (Carrot/Cassava) 패턴 확산
3. **추정 데이터 시각 구분** — 사이클 시뮬·What-If 위젯 시각적 구분 부족
   → 점선·음영·"추정" 배지 의무화

## 누계 (축산 3종 + 농산 6종)

| 분야 | 위젯 평가 | A 합격 | B 조건부 | C archive | 평균 |
|---|---:|---:|---:|---:|:---:|
| 축산 3종 | 33 | 14 (42%) | 17 (52%) | 2 (6%) | B+ |
| **농산 6종** | **79** | **24 (30%)** | **55 (70%)** | **1 (1.3%)** | **B+** |
| **합계** | **112** | **38 (34%)** | **72 (64%)** | **3 (2.7%)** | **B+** |

## 다음 작업 (역순 확산)

| 순서 | 대상 | 위젯 추정 | 비고 |
|---|---|---:|---|
| 1 | Mangosteen archive 1건 처리 | 1 | 사용자 컨펌 후 |
| 2 | Salmon Forensic Audit | ~47 | 수산 시작 |
| 3 | Whelk | ~25 | |
| 4 | Shrimp | ~75 | |
| 5 | Pollock | ~57 | |
| 6 | Jukkumi | ~30 | |
| 7 | Squid | ~80 | 가장 큼 |
| 8 | Galchi | ~36 | |
| 9 | Mackerel | ~53 | |
| 10 | Tuna closure 풀린 후 (~2026-06-04) | ~80 | |

## 산출물

- artifacts/forensic_audit/2026-05-24/MangosteenDashboard/_summary.md
- artifacts/forensic_audit/2026-05-24/CocoaDashboard/_summary.md
- artifacts/forensic_audit/2026-05-24/CarrotDashboard/_summary.md
- artifacts/forensic_audit/2026-05-24/GarlicDashboard/_summary.md
- artifacts/forensic_audit/2026-05-24/CassavaDashboard/_summary.md
- artifacts/forensic_audit/2026-05-24/CashewDashboard/_summary.md
- artifacts/forensic_audit/2026-05-24/_agri_summary.md (본 문서)
