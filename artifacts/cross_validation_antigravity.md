```markdown
## A. 출처 충돌
- [TunaAtunaMayNews.tsx:L38] 2026년 5월 가다랑어 산지가 $1,850 주장 → 출처 ⑩(미국 관세 쇼크웨이브 분석)에 따르면 $1,845는 2025년 8월 최고점이며 2025년 4분기 이후 급락함 → 2026년 현재가로 오표기된 데이터 수정 권고
- [TunaCannedMarketShare.tsx:L58] 2025년 상반기 기준 통조림 점유율 표기 → 출처 ⑬(한국경제 2026-03)에서 2026년 동원참치 점유율 80% 돌파 최신 지표와 충돌 → 2026년 지표로 업데이트 권고

## B. Stale (2026 갱신 가능)
- [PacificEezStrategicWidget.tsx:L122] WCPFC 2024 기반 EEZ 전략 표기 → 출처 ④(WCPFC CMM 2025-02, 2026년 2월 발효) 열대참치 보존관리조치로 갱신 권고
- [TunaTacMonitor.tsx:L88] IOTC/ICCAT 2025 기반 쿼터 소진율 표기 → 출처 ⑦(IOTC-2026-S30-INF04) 최신 관리절차 데이터로 갱신 권고
- [TunaEsgRiskRadar.tsx:L40] 2025-11 기준 인도네시아 ESG 리스크 → 출처 ②(ISSF 2026 State of Global Tuna Sustainability)의 2026 EM/FAD 지표로 갱신 권고
- [TunaNewInsightsA.tsx:L39] EUMOFA 2024 기반 중국 온쇼어링 점유율 표기 → 출처 ⑧(FFA 2026년 2월 보고서)의 신규 아시아 기업 역학 데이터로 교체 권고

## C. 잘못된 인용
- [TunaIntelInsightsB4.tsx:L244] 동원·사조 RAS 시스템 출처를 "NotebookLM 가나 노트북"으로 명시 → 개인 AI 툴 워크스페이스 명칭은 공신력 있는 출처가 아니므로 공식 기업 공시나 전문지 인용으로 전면 수정 권고

## D. 의심 outlier
- [TunaKmiFtaBluefinInsights.tsx:L238] 국내 양식 +667% 폭증 주장 → 분기 대비 양식 생산량이 단기 7배 가까이 증가하는 것은 생물학적/물리적 상식선에서 명백한 이상치이므로 원본 데이터 재검증 권고
- [TunaJapan2050Insights.tsx:L447] 사시미 3-Tier 가격 매트릭스 14배 격차 주장 → 등급 간 단가 격차 14배는 일반적인 프리미엄 스프레드를 크게 벗어나므로 화폐 단위 혼동 또는 기준점(통조림 vs 최고급 오마카세) 오류 여부 검토 권고
- [PetFoodDashboard.tsx:L533] 환율 1바트 절상 시 순이익 -10% 감소 주장 → 단일 환율 변동 단위 대비 이익률 민감도가 극단적으로 과대계상되었을 확률이 높음

## 종합 평가
- 117건 중 문제 발견: 총 10건 (충돌 2, Stale 4, 잘못된 인용 1, 이상치 3)
- 가장 위험한 3건: 
  1. [TunaIntelInsightsB4.tsx:L244] AI 툴(NotebookLM)을 공식 출처로 기재한 치명적 무결성 훼손
  2. [TunaAtunaMayNews.tsx:L38] 2025년도 최고점 가격($1,845)을 2026년 실시간 지표로 노출하는 시장 정보 왜곡
  3. [TunaKmiFtaBluefinInsights.tsx:L238] 생물학적 한계를 벗어난 양식 생산량 단기 +667% 표기 오류
- Phase 5 Codex 독립검증 대상으로 권고하는 3건: 위 가장 위험한 3건을 최우선으로 검증 파이프라인에 회부할 것을 권고함.
```
