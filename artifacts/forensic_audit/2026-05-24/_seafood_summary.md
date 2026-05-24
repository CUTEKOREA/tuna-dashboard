# 수산물 8종 통합 Forensic Audit Summary (2026-05-24)

> 평가자: Claude Opus 4.7 (Claude Code 세션)
> 기준: 8-Axis schema
> 진행: 역순 (Salmon → Whelk → Shrimp → Pollock → Jukkumi → Squid → Galchi → Mackerel)
> Tuna closure (~2026-06-04)는 제외

## 통합 결과 표

| Dashboard | 위젯 평가 | A 합격 | B 조건부 | **C archive** | LIVE | 평균 Grade |
|---|---:|---:|---:|---:|---:|:---:|
| **Salmon** | 18 | 5 (28%) | 13 (72%) | 0 | 3 | B+ (82.4) |
| **Whelk** | 15 | 6 (40%) | 9 (60%) | 0 | 1 | B+ (84.2) |
| **Shrimp** | 18 | 8 (44%) | 10 (56%) | 0 | **9** | A- (84.4) |
| **Pollock** | 17 | 5 (29%) | 12 (71%) | 0 | 0 | B+ (82.5) |
| **Jukkumi** | 16 | 2 (13%) | 14 (87%) | 0 | 0 | B (81.6) |
| **Squid** | 19 | 7 (37%) | 12 (63%) | 0 | **8** | B+ (84.0) |
| **🏆 Galchi** | 15 | **11 (73%)** ⭐⭐⭐ | 4 (27%) | 0 | **14** | **A- (86.3)** |
| **Mackerel** | 17 | 7 (41%) | 10 (59%) | 0 | 0 | B+ (83.1) |
| **합계** | **135** | **51 (38%)** | **84 (62%)** | **0 (0%)** | **35** | **B+** |

## 🏆 최고 품질 — Galchi (A- 86.3)

**전체 18 commodity 통합 최고**:
- LIVE 14 endpoint = 거의 모든 위젯 실시간 데이터
- KFAS 학술 + 정부 통계 + 무역 통계 3중 cross-check
- A 합격 73% (11/15 위젯)

→ **Galchi 패턴이 다른 commodity LIVE 확산의 골드 스탠다드**

## ⭐ 모범 위젯 Top 10

| 순위 | 위젯 | Dashboard | 점수 | 강점 |
|---|---|---|---:|---|
| 1 | 한·일 연근해 어획 -53% | Mackerel | **90.0** | 통계청 + NPFC + 국립수산과학원 3중 1차 자료 |
| 2 | 글로벌 어획 (Galchi) | Galchi | 89.4 | FAOSTAT LIVE |
| 3 | ENSO 바이오매스 (페루) | Squid | 88.8 | FAOSTAT 정량 |
| 4 | Top 10 양식국 + KFAS BFT | Shrimp | 89.4 | FAOSTAT + 학술 LIVE |
| 5 | 글로벌 어획 추이 + 미·러 헤게모니 | Pollock | 88.1 | FAOSTAT 1차 |
| 6 | 한국 수입/글로벌 교역/HSK 시뮬 | Galchi | 88.1 | LIVE 트리플 |
| 7 | 글로벌 양식 패러다임 + Top 5 | Shrimp | 88.1 | FAOSTAT |
| 8 | 미·러 헤게모니 + Loligo 시즌 | Squid | 88.1 | 도메인 정확 |
| 9 | 글로벌 어획 추이 | Mackerel | 88.1 | FAOSTAT |
| 10 | Illex 2024 시즌 | Squid | 87.5 | LIVE 실측 |

## ⚠️ 정정 권장 위젯

| 위젯 | Dashboard | 점수 | 약점 |
|---|---|---:|---|
| 어종별 비중 (Easyfish/Tridge) | Mackerel | 71.9 | 상업 보고서 의존, FAO Capture로 교체 |
| PollockRiskScorecard 정성 추정 | Pollock | 72.5 | WOAH/OECD 1차 자료 보강 |
| KFAS 3D 수리미/3D 새우 (정성) | Pollock/Shrimp | 76.3 | 학술 인용 보강 |

## 누계 (축산 3 + 농산 6 + 수산 8 = 18 commodity / 247 위젯)

| 분야 | 위젯 | A | B | C | 평균 |
|---|---:|---:|---:|---:|:---:|
| 축산 3종 | 33 | 14 (42%) | 17 (52%) | 2 (6%) | B+ |
| 농산 6종 | 79 | 24 (30%) | 55 (70%) | 1 (1.3%) | B+ |
| 수산 8종 | 135 | 51 (38%) | 84 (62%) | 0 (0%) | B+ |
| **합계 17 commodity** | **247** | **89 (36%)** | **156 (63%)** | **3 (1.2%)** | **B+** |

(Tuna는 closure 2026-06-04 이후 별도 평가)

## ⭐ Best Practice 확산 (재확인)

1. **Galchi 14 LIVE endpoint** — KCS/KAMIS/KOSIS/Comtrade 4중 LIVE
2. **Mackerel Pilot (한·일 어획 90점)** — 통계청+NPFC+국립수산과학원 3중 1차 자료
3. **Shrimp 9 LIVE + KFAS** — 학술 + LIVE 조합
4. **Squid 8 LIVE** — FAOSTAT + KFAS + OFAC

## 공통 약점 (전체 9 commodity 동일)

1. **A8 평균 70~75** — 색맹 대비 부족
2. **시나리오/추정 데이터 시각 구분** 부족
3. **상업 보고서 (Tridge, Easyfish) 의존** — FAO/IRP 1차 자료 교체 권장
4. **KFAS 정성 분석 위젯** (3D 수리미/3D 새우 등) — 학술 인용 강화 필요

## 산출물

- artifacts/forensic_audit/2026-05-24/{8 seafood dashboards}/_summary.md
- artifacts/forensic_audit/2026-05-24/_seafood_summary.md (본 문서)
- artifacts/forensic_audit/2026-05-24/_livestock_summary.md
- artifacts/forensic_audit/2026-05-24/_agri_summary.md

## 다음 작업

| 우선 | 작업 | 시간 |
|---|---|---:|
| Mid | Mackerel 어종별 비중 (71.9) FAO Capture 교체 | 30분 |
| Mid | Pollock RiskScorecard (72.5) 정량 재구성 | 30분 |
| Low | 전체 A8 색맹 패턴 codemod (일괄 적용) | 1시간 |
| Future | Tuna closure 풀린 후 (~2026-06-04) Tuna ~80 위젯 | 2시간 |
