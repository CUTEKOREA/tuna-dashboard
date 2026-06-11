# 영국 참치 관세 한시 철폐 — 참치왕국 위젯 영향 매핑 (2026-06-09)

> 오케스트레이션: orchestrate 패턴1(출처검증 파이프라인)+패턴2(병렬 fan-out 7)+패턴5(점수합성).
> 1차출처 검증: [`docs/2026_uk_tuna_tariff_sources.md`](../2026_uk_tuna_tariff_sources.md) (gov.uk 14건, 신선도 100%).

## 0. 핵심 — 뉴스 주장 대비 1차출처 정정 (★ 편집 전 반드시 반영)

| 항목 | 사용자 뉴스 주장 | gov.uk 1차 확정 | 판정 |
|---|---|---|---|
| 철폐 전 MFN 세율 | **24%** | **참치캔 1604.14 = 20%, 신선 0302 = 20%, 냉동필레 0304.87 = 18%** (24%는 EU 잔재) | ❌ 반증 — 24% 쓰지 말 것 |
| 시행일 | 2026-06-21 | gov.uk "coming weeks"로만 표기, **정확 일자 1차 미확정** | ⚠ 불확실 — "2026 하반기"로 |
| 종료일 | 2028-12 | **2028-12-31** | ✅ 확정 |
| 적용 품목 | 캔·로인·신선/냉동 | **+ 활어(0301 94/95), 냉동필레(0304.87)까지 더 넓음** | ✅+α |
| 원산지 무관 | 모든 원산지 | erga omnes 확정 (Undercurrent: "all exporting countries, not only Maldives") | ✅ 확정 |
| 특혜국 마진소멸 | 몰디브·에콰도르·모리셔스·가나 | DCTS/EPA 특혜마진 소멸 확정 (부수 derogation은 별개 유지) | ✅ 확정 |
| "몰디브 20% 철폐" | — | **별개의 선행 사건**(몰디브 한정, ~2026-05-21) → 후속 전원산지 정지에 흡수·무력화 | ℹ 2건 구분 |

**미해결 갭**: 시행 commencement 일자, 발효 SI 번호. → legislation.gov.uk(uksi 2026) 공포 추적 권장.

## 1. 블래스트 반경 요약
- 검토 universe: 이벤트 키워드 포함 **116 파일** (참치직속 53 / 사시미 47 / MSC 16).
- 7개 fan-out 에이전트 심층판독 결과 **반영필요 = 38 위젯** (P0 10 · P1 16 · P2 12).
- 3개 메뉴: `value-chain(참치)` · `sashimi-steak(사시미/스테이크)` · `msc(MSC 전략)`.

## 2. P0 — 직접·핵심 (관세 비대칭/FTA 우위 전제가 붕괴, 즉시 정정) 10건

| 위젯 | 파일:라인 | 메뉴 | 무엇이 틀어졌나 |
|---|---|---|---|
| 영국 참치 수입 공급국 & 관세 비대칭 | SasUkSupplierTariff.tsx:25 (data 14-19) | 사시미 | "태국 MFN 20% 핸디캡 vs 특혜국 0%(57%)" 비대칭 전제 소멸 → tariff 전부 0%로 |
| 🇬🇧 영국 — MSC 주도 시장 & FTA 우위 | SasUkMarket.tsx:26,35,39,43 | 사시미 | "Korea-UK FTA 18%→0% = 동남아 대비 결정적 우위" 무효(전원산지 0%) |
| 한국 두 경로 분기(태국원물 vs 영국직수출) | SasKrDualRoute.tsx:30 | 사시미 | "태국 20% 우회 = 20%p 우위(경로B)" 핵심가치 소멸 |
| 수출 진입요건 체크리스트 | SasExportChecklist.tsx:28,95 | 사시미 | UK칼럼 "FTA 18%→0% 결정적 우위" 한시 무효 |
| 한국 공장 수출 파트너 전략 | SasExportPartnerStrategy.tsx:29 | 사시미 | 영국 tariff란 "MFN 18% 회피 결정적 우위" 무효 |
| 베트남/동남아 OEM 파트너십 전략 | TunaVietnamOemStrategy.tsx:64,22,57 | 참치 | 차트 "태국 EU 20.5% vs 베트남 0%"+Tariff-Hopping 논거, UK 0% 누락 |
| 유럽 Big5 리테일·MSC 매트릭스(영국 행) | EuroTunaWidgets.tsx:98,356-417 | 참치 | 영국 캔시장(GBP 4.28억·PB·MSC) 스냅샷이 면세로 곧 낡음 |
| EU CATCH 물류 병목 현실화 | TunaAtunaMayNews.tsx:94-115 | 참치 | "영국, 몰디브 20% 철폐"→실제는 전원산지 0%(선행 몰디브건 흡수). 정정·확장 |
| Insight 12. 관세회피 밸류체인 진화 | TunaInsightsDashboard.tsx:582-623 | 참치 | 美 상호관세만, 태국·베트남 캔의 신규 UK 무관세 판로 누락 |
| 유럽 MSC vs 비MSC 소매가 비교 | MscEuropeRetailPrices.tsx:10,47,55 | MSC | 영국 비MSC 진입가 하락→MSC 프리미엄 격차 전제 변동 |

## 3. P1 — 간접·중요 (특혜잠식·가격·공급망 재편 반영) 16건

| 위젯 | 파일:라인 | 메뉴 |
|---|---|---|
| 태국 참치 무역량/주요 수출대상국 | ThaiTunaTradeStats.tsx:72,114,165,196 | 참치 |
| 공장별 생산·보관(마진율 인덱스) | CanneryStatusCharts.tsx:69,99,152 | 참치 |
| N1. 태평양 가공허브(PNG) 원가율 | TunaPngHubStrategy.tsx:27,51-60 | 참치 |
| 글로벌 가공 캐파 모니터 | FfaGlobalProcessingCapacity.tsx:66,70,128 | 참치 |
| WITS 수입 관세율 벤치마크 | TunaTradeIntelWidgets.tsx:50,72-87 | 참치 |
| UFLPA 후 동남아·중국 가공국 수출추이 | UsPolicyImpactWidget.tsx:30,55 | 참치 |
| Insight 1. 차익거래 마진 레이더 | TunaInsightsDashboard.tsx:141-180 | 참치 |
| Insight 2. 가공허브 패권 지도 | TunaInsightsDashboard.tsx:182-222 | 참치 |
| 나우루 스위치 — 중국 캐너리 온쇼어링 | TunaNewInsightsA.tsx:37-85 | 참치 |
| 0% 특혜관세(GSP+) 차익 | TunaOperationalIntelWidgets.tsx:842,152 | 참치 |
| 방콕 원어가 하락과 미국 통제력 | TunaAtunaMayNews.tsx:37-69 | 참치 |
| EU 캔참치 밸류체인 맵(ATQ 무관세 로인) | EuroTunaWidgets.tsx:121,252 | 참치 |
| 영국 참치 채널 이원화 | SasUkChannelSplit.tsx:33 | 사시미 |
| 태국 원료조달 & EU 관세 핸디캡 | SasThaiSourcing.tsx:23 | 사시미 |
| 영국 참치 쇼퍼 행동 변화 | MscUkShopperTrends.tsx:108,116 | MSC |
| 어구별 MSC 인증 어획량 추이(폴앤라인) | MscGearTypeTrends.tsx:76,161 | MSC |

## 4. P2 — 배경·낮음 (선택적 주석) 12건

| 위젯 | 파일:라인 | 메뉴 |
|---|---|---|
| 글로벌 통상정책 충격 스코어카드 | TunaPolicyRiskRadar.tsx:72 | 참치 |
| FTA 관세차익 최적화 매트릭스 | TunaPolicyRiskRadar.tsx:131 | 참치 |
| OEC 글로벌 가공허브 단가 비교 | TunaTradeIntelWidgets.tsx:108 | 참치 |
| [가공패권] 태국·스페인 통조림 제국 | TunaProcessedWidgets.tsx:105 | 참치 |
| EU 역외 참치캔 최대 수입국 | EuroTunaWidgets.tsx:84,126 | 참치 |
| 글로벌 브랜드 MSC 소싱 스코어보드 | EuroTunaWidgets.tsx:103,209 | 참치 |
| EPO 어획급감·미 파우치 지각변동 | TunaAtunaMayNews.tsx:71-92 | 참치 |
| 환율-착지원가 민감도 분석 | TunaForecastWidgets.tsx:163-218 | 참치 |
| 태국 수산 ESG 리스크 | SasThaiEsgRisk.tsx:30 | 사시미 |
| 리테일러 MSC 전환 현황 | MscRetailerSkuMonitor.tsx:85 | MSC |
| PB×MSC 침투율 매트릭스 | MscPbNbMatrix.tsx:55 | MSC |
| 유통채널별 MSC 침투율 | MscRetailChannelPenetration.tsx:55 | MSC |

## 5. 다음 단계 (중간검수 게이트)
- 본 리스트는 **식별만** 완료. 실제 편집은 사용자 확인 후 진행.
- 편집 시 §0 정정 강제: **24% 금지(20%/18% 사용)**, 시행일 "2026 하반기(일자 미정)", 종료 2028-12-31, 활어·냉동필레 포함, 몰디브 선행건과 구분.
