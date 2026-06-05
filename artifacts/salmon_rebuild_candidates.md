# salmon 라이브 API 재배선 후보 (마스터플랜 I-6 백로그)

- salmon 정정 중 식별 22건. illustrative→정직 STATIC으로 1차 정직화 완료, **실데이터가 존재**해 라이브 배선 시 a2(신선도)·a3(검증성) 천장 돌파 가능.
- 우선순위: 트래픽·의사결정 영향 高 + 1차 API 기존 라우트 존재 순.

## FAO (6건)
- [SalmonDashboard] w03_aqua_pie 양식 Top5 — FAO 실재
- [SalmonDashboard] w19_iceland 아이슬란드 양식 시계열 — FAO 실재(4,500% 차트정합 확인)
- [SalmonInsightWidgets] w05_cash: 양식 매출 Top 국가 (FAO 파생) — FAOSTAT 재배선 후보
- [SalmonInsightWidgets] w07_export: 수출액 Top10 (FAO 실데이터) — FAOSTAT/Comtrade 재배선 후보
- [SalmonInsightWidgets] w08_import: 수입액 Top10 (FAO 실데이터) — FAOSTAT/Comtrade 재배선 후보 (미국·EU 누락 보강 필요)
- [SalmonInsightFeedBio] SalmonInsightFeedBio — FIFO(Fish In-Fish Out)·어분/어유 의존도·대체사료 비중은 FAO FishPrice/FishStatJ 및 MOWI·BioMar 연차보고서로 실재 가능. 현재 illustrative STATIC으로 정직화, 실데이터 재배선은 후속.

## UN Comtrade (4건)
- [SalmonDashboard] w07_export 수출 Top10 — UN Comtrade 실재
- [SalmonDashboard] w08_import 수입 — UN Comtrade 실재
- [SalmonDashboard] w24_poland_hub 폴란드 가공 무역수지 — UN Comtrade 실재
- [SalmonInsightWidgets] w09_kr_import: 한국 수입량 시계열 — UN Comtrade/KCS 재배선 후보

## FAOSTAT (4건)
- [SalmonInsightWidgets] w01_paradigm: FAOSTAT 어획 vs 양식 생산량 실데이터 — FAOSTAT API 재배선 후보
- [SalmonInsightWidgets] w03_aqua_pie: FAOSTAT 2022 양식 생산 Top5 국가 실데이터 — FAOSTAT 재배선 후보
- [SalmonInsightWidgets] w11_kr_price: 글로벌 수입단가율 — FAOSTAT/KAMIS 재배선 후보
- [SalmonInsightWidgets] w12_margin: 노르웨이/글로벌 수출단가 스프레드 — FAOSTAT/Nasdaq Salmon Index 재배선 후보

## KAMIS (2건)
- [SalmonDashboard] 가격/단가 위젯군 — KAMIS 실재
- [SalmonInsightTradeDown] SalmonInsightTradeDown KR tab — real KAMIS route exists (/api/salmon/kamis with isLive field); wire live KAMIS_API_KEY + relabel telemetry to LIVE/SYNCED once freshness confirmed (currently honest STATIC)

## KCS (2건)
- [SalmonDashboard] w_fta_salmon_russia_collapse 한국 수입 구조 — KCS/Comtrade 실재
- [SalmonInsightWidgets] w10_kr_deficit: 한국 무역수지 — 관세청(KCS)/Comtrade 재배선 후보 (현재 출처를 FAO→KCS/Comtrade로 정정 완료)

## FAO FishStatJ (1건)
- [SalmonDashboard] w01_paradigm 생산량(어획 vs 양식) — FAO FishStatJ 실재

## EUMOFA (1건)
- [SalmonInsightTradeDown] SalmonInsightTradeDown EU tab — EUMOFA consumption panel is a real dataset; re-source from EUMOFA Volume/Value to upgrade from static snapshot to SYNCED with real syncDate

## Comtrade (1건)
- [SalmonForecastSimulator] SalmonForecastSimulator 전망 블록(3개월 +3.2%·신뢰도72%·변동요인) — 현재 하드코딩 illustrative. 착지원가 산출부는 이미 /api/landed-cost(Comtrade·KCS·ECOS) 실배선 완료. 전망부만 실측 단기 전망모형으로 후속 재배선 후보.

## Nasdaq Salmon Index (1건)
- [SalmonInsightGlobalSupplyPrice] SalmonInsightGlobalSupplyPrice — Nasdaq Salmon Index + Kontali spot price are real external series; simulation heuristic (basePrice*priceImpact) could be re-wired to a traceable API/intake route in a follow-up to replace the illustrative basePrice values
