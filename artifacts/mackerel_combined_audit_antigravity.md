```markdown
# 작업 A: API 라우트 audit

## 🚨 즉시 정정 필요
- [mackerel-comtrade.ts:33-34] 하드코딩된 `FALLBACK_FLOW` 데이터를 그대로 응답하면서 주석("For demonstration...")과 함께 `isLive = true` 처리 및 'UN Comtrade API (실시간)' 라벨을 부여함 (허위 라이브 출처 표기).
- [MackerelFTAQuarterly.tsx:193] KMI 보고서 원문 PDF 21건에서 수동으로 추출한 정적 시계열 데이터에 `SYNCED/2026-05` 텔레메트리 라벨을 오용함.

## ⚠️ 표현 정정
- [MackerelAquaculture.tsx:188] `STATIC/2023` (Stale 데이터)임에도 고등급(S2) 부여. 데이터 최신화 또는 등급 하향 조정 필요.
- [MackerelBlackhole.tsx:97] 2019→2023 데이터 기준(`STATIC/2023`)에 S4 부여. 최신 무역 지표로 갱신 필요.
- [MackerelKoreaSupply.tsx:109] 2023년 수치 기준(`STATIC/2023`) 자급률 진단에 S4 부여.

## ✅ 검증 통과
- [mackerel-ticker.ts] ECOS, KAMIS, KCS 실제 외부 API와 정상 통신하며 Fallback 분기 처리가 명확하게 구현됨.
- [mackerel-kcs.ts] 관세청 API 연동 정상 파싱 및 `totalWgt > 0` 조건부 Live 상태 검증 로직 양호.

# 작업 B: 위젯 클레임 교차 검증

## A. 출처 충돌 (최대 5건)
- [w14] 노르웨이 수입 의존도: 위젯은 의존도를 52%로 주장하나, 아카이브 #4는 한국 총 수입 중 노르웨이 비중을 80~90%로 명시함.
- [w10/w18/w36] 네덜란드 중계무역 마진: 위젯은 네덜란드를 재수출 중계 허브로 묘사하나, 아카이브 #12(EUMOFA)는 네덜란드를 훈제(Smoked) 가공 주력 국가로 분류함.
- [w52] 아프리카 수출 급증: 위젯은 167% 급증으로 표기했으나, 아카이브 #10에 따르면 수출액 증가율은 +63%(2023), +83.4%(2025)로 수치 충돌.
- [w02] 상위 5개국 어획량 집중도: 위젯은 인도, 러시아를 글로벌 5강에 포함했으나, 아카이브 #7의 대서양/태평양 핵심 어종 분포(한·일·중·유럽)와 불일치함.

## B. Stale (최대 5건)
- [S2] MackerelAquaculture.tsx: 2023년 기준 정적 데이터 (아카이브 글로벌 시장 성장 동향으로 2026년 갱신 가능).
- [S4] MackerelKoreaSupply.tsx: 2023년 데이터 기반 진단.
- [P1] MackerelProcessedWidgets.tsx: 2023년 칠레/페루 어분 제국 탄생 (아카이브 #13 2026년 페루 TAC 2.51M MT 수치로 갱신 가능).
- [S4] MackerelMacroCycle.tsx: 2023년까지의 어획량/무역 단가 사이클.
- [S4] MackerelSafetyPremium.tsx: `STATIC/2023-Q4` 기준 후쿠시마 안전 프리미엄 분석 지표.

## C. 잘못된 인용 (최대 3건)
- [MackerelFTAQuarterly] 수동 취합한 PDF 추출 데이터에 `SYNCED` 자동화 라벨 허위 인용.
- [mackerel-comtrade 관련 위젯] 내부 하드코딩 Fallback 배열을 UN Comtrade Premium Live 데이터인 것처럼 허위 인용.

## D. 의심 outlier (최대 3건)
- [w42] 노르웨이 TAC 쿼터 감축: ICES 과학 권고(-70%), 합의치(-48%), 독자 쿼터(-52%) 간의 격차가 극심하여, 단일 수치 기반 시뮬레이션 적용 시 심각한 왜곡 위험.
- [w66] 한-영 FTA 수혜 영국산 수입 급증 (+100%): 노르웨이(80~90%)의 지배적 점유율 구조 아래에서, 물량이 적은 영국산의 100% 증가 기저효과를 대체 소싱 부상으로 과대 해석했을 가능성.

# 종합

- 즉시 정정 필요 (P0): 2건
- 표현 정정 (P1): 3건
- 가장 위험한 5건: mackerel-comtrade 허위 Live 라벨 표기, w14 노르웨이 수입 의존도 수치 오류, MackerelFTAQuarterly SYNCED 오용, w10 네덜란드 훈제가공 누락, w52 아프리카 수출 수치 뻥튀기
- Codex 독립 검증 후보 5건: w02 상위 5개국 어획량 지표 적합성, w42 노르웨이 TAC 쿼터 감축 파급 시뮬레이션, w10 네덜란드 중계무역 vs 가공 수익 모델, w52 아프리카 수출 증가율 산출 근거, w66 영국산 수입 급증 기저효과 검증
```
