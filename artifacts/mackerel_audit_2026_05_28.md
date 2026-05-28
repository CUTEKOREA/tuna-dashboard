# 고등어 페이지 위젯 신뢰도·유효성 감사 — Multi-Agent Edition

> **작성:** 2026-05-28 Claude Code 세션 (오케스트레이션)
> **범위:** [components/MackerelDashboard.tsx](../components/MackerelDashboard.tsx) 5-Pillar 전체 (TSX 24 + JSON 79 = **103 위젯**)
> **검증 채널:** Claude Opus 4.7(메인) + Antigravity Gemini 3.1 Pro(API/교차) + Codex GPT-5.5(독립검증)
> **비용:** $0 (AI Ultra + Claude Max OAuth + ChatGPT Plus)
> **선행 사례:** [value_chain_audit_2026_05_28.md](./value_chain_audit_2026_05_28.md) (참치, 120→117, 17건 정정)

---

## Executive Summary

### 📊 전체 등급
- **평균 4-Axis 점수: 78.0 / 100 (B등급)**
- A등급(85+): 22개 (21%)
- B등급(75~84): 45개 (44%)
- C등급(65~74): 29개 (28%)
- **D등급(<65): 7개 (7%) ← TSX 위젯, 즉시 정정 필요**

### 🚨 즉시 정정 권고 (P0, 2건)

#### API 라우트
1. **[app/api/mackerel-comtrade/route.ts:33-34](../app/api/mackerel-comtrade/route.ts#L33)** — `FALLBACK_FLOW` 하드코딩 데이터에 `isLive = true` 표기 + "UN Comtrade API (실시간)" 라벨 → **허위 라이브 출처** (참치 audit `SANCTIONS_API_LIVE` 패턴 재발견)
   - **권고:** `isLive = true` 제거, 실제 API 응답 파싱 또는 `STATIC_FALLBACK` 라벨 정직 표기

2. **[components/MackerelFTAQuarterly.tsx:193](../components/MackerelFTAQuarterly.tsx#L193)** — KMI 보고서 PDF 수동 추출 정적 데이터에 `SYNCED/2026-05` 텔레메트리 오용
   - **권고:** `STATIC + 'KMI Report PDF 수동 추출'`로 정정

### ⚠️ 표현 정정 권고 (P1, 3건)

3. **MackerelAquaculture.tsx:188** — STATIC/2023 stale 데이터에 S2 부여 → 2026 데이터 갱신 또는 등급 하향
4. **MackerelBlackhole.tsx:97** — 2019~2023 데이터에 S4 부여 → 2025~2026 무역 지표로 갱신
5. **MackerelKoreaSupply.tsx:109** — 2023 자급률에 S4 부여 → 2025 통계청 데이터로 갱신

### 🔬 클레임 충돌 (Phase 4 Antigravity 발견, 핵심 4건)

| ID | 위젯 | 위젯 주장 | 출처 (아카이브) | 권고 |
|---|---|---|---|---|
| **w14** | 노르웨이 수입 의존도 | subtitle "52%", 자체 data ~67% | 외부 출처 80~90% | **EDIT** — 내부 일관성 회복 + 외부 출처 반영 |
| **w52** | 아프리카 수출 +167% | +167% (subtitle) | 2023 +63% YoY / 2025 +83.4% | **EDIT** — 기간 명시 (누적 vs YoY) 또는 수치 재검증 |
| **w10/18/36** | 네덜란드 중계무역 | 중계무역 마진 분석 | EUMOFA: 네덜란드 = 훈제 가공 주력 | **EDIT** — 양립 가능, cardDesc에 가공+중계 동시 명시 |
| **w02** | 어획 상위 5개국 | 인도·러시아 포함 | 출처: 한·일·중·EU 핵심 | **EDIT** — 어종별 분리(Atlantic vs Pacific chub) 필요 |

### ✅ 검증 통과
- **mackerel-ticker.ts** — ECOS·KAMIS·KCS 실제 외부 API 정상 통신, Fallback 분기 명확
- **mackerel-kcs.ts** — 관세청 API + `totalWgt > 0` Live 상태 검증 우수

---

## 1. 인벤토리 (Phase 1)

### 1.1 5-Pillar 위젯 분포 (4-Axis 점수 포함)

| 출처 | 위젯 수 | A | B | C | D | 평균 |
|---|---:|---:|---:|---:|---:|---:|
| TSX (Mackerel*.tsx 24개) | 24 | 1 | 4 | 12 | **7** | 68.0 |
| JSON (mackerel_real_data_v13.json) | 79 | 21 | 41 | 17 | 0 | 81.0 |
| **합계** | **103** | **22** | **45** | **29** | **7** | **78.0** |

### 1.2 D등급 TSX 위젯 7개 (모두 동일 패턴)
모두 **a1=60 (출처 키워드 부족) + a2=40 (syncDate 연도 부재) + a3=55 (STATIC)** — 표기 보강만으로 즉시 B 등급 회복 가능:

| 파일 | 라인 | 평균 | 제목 |
|---|---|---|---|
| MackerelAquaculture.tsx | 188 | 63.8 | 양식 고등어의 부상과 블루오션 |
| MackerelBlackhole.tsx | 97 | 63.8 | "고등어 블랙홀" 신흥 시장 발굴 |
| MackerelKoreaSupply.tsx | 109 | 63.8 | 🇰🇷 한국 고등어 자급률 위기 모니터 |
| MackerelMacroCycle.tsx | 124 | 63.8 | 글로벌 고등어 호황/불황 사이클 |
| MackerelProcessedWidgets.tsx | 80 | 61.2 | 칠레-페루 어분(Fishmeal) 제국의 탄생 |
| MackerelProcessedWidgets.tsx | 100 | 61.2 | 중국의 스텔스 싹쓸이 (블랙홀) |
| MackerelSafetyPremium.tsx | 32 | 63.8 | 후쿠시마 지정학적 안전 프리미엄 |

### 1.3 API 라우트
- 3개 Mackerel 전용: comtrade · ticker · kcs
- 8개 공통: compliance · eurostat · fishery · hs-ping · import-yeti · oec · osh · tariffs (참치와 공유)

### 1.4 자체 reliability 100점 vs 4-Axis 격차
- JSON 위젯 53/79가 자체 reliability **100점** — 외부 4-Axis 평가는 그 중 21건이 B/C
- **격차 원인:** 자체 reliability는 데이터 완성도 위주, 4-Axis는 출처·신선도·검증성도 평가
- 권고: JSON 위젯의 `reliability` 필드는 명시적으로 4-Axis 룰북에 맞춰 재산정 필요 (별도 작업)

---

## 2. 4-Axis 점수 분포

### 2.1 평가 기준 (참치와 동일 + Mackerel src_terms 확장)
- **Axis 1 (출처 신뢰도):** FAO·ISSF·FishStat·NEAFC·ICES·IMR·NOAA·EUMOFA·USDA·MOF·KCS·WITS·OEC·ECOS·KAMIS·KFAS·KMI·KOSIS·INFOFISH·KATI·한국무역협회·해양수산부·관세청·수협·부산공동어시장·NPFC·FAS·SOFIA·OECD
- **Axis 2 (데이터 신선도):** syncDate 연도 (2026 95 / 2025 75 / 2024·Real-time 70 / 2023↓ 40)
- **Axis 3 (검증 가능성):** TelemetryBadge (LIVE 95 / SYNCED 80 / STATIC 55 / 동적 70) + JSON reliability 보정
- **Axis 4 (통합 완성도):** pillar + cardDesc/subtitle(30자↑) + source/telemetry 존재

### 2.2 자체 reliability 100점이지만 4-Axis C등급 (Antigravity 의심 우선순위)
9건 — 모두 subtitle에 1차 출처 명확하지 않거나 source 표기 길이 부족:
- w18 네덜란드 중계무역 단가 마크업 / w31 EU-아프리카 단가 양극화 / w34 콜드체인 차익거래 / w36 네덜란드 중개무역 / w52 아프리카 수출 급증 / w53 HMR 이커머스 / w55 선원 인권 / w58 EU 수출 방향 / w62 EU→아시아 해상운임

---

## 3. API 라우트 mock audit (Phase 3, Antigravity Pro)

### 3.1 즉시 정정 2건 (Executive Summary 참조)
### 3.2 표현 정정 3건
- MackerelAquaculture/Blackhole/KoreaSupply STATIC/2023 stale + 등급 부적합
### 3.3 검증 통과 2건
- mackerel-ticker · mackerel-kcs

상세: [artifacts/mackerel_combined_audit_antigravity.md](./mackerel_combined_audit_antigravity.md)

---

## 4. 클레임 교차 검증 (Phase 4, Antigravity × 출처 15건)

### 4.1 출처 충돌 4건 (Executive Summary 참조)

### 4.2 Stale 5건 — 2026 갱신 가능
- MackerelAquaculture · MackerelKoreaSupply · MackerelProcessedWidgets · MackerelMacroCycle · MackerelSafetyPremium
- 출처 아카이브 #1·#3·#9·#13 활용 → 2026 NEAFC TAC, ICES 권고, NPFC catch limit, Peru 어분 등으로 갱신

### 4.3 잘못된 인용 2건
- MackerelFTAQuarterly SYNCED 오용
- mackerel-comtrade 허위 Live (P0 1번과 동일)

### 4.4 의심 outlier 2건
- **w42 노르웨이 TAC 감축**: ICES -70% vs 합의 -48% vs 독자 -52% 격차 — 단일 수치 시뮬레이션 위험
- **w66 영국산 수입 +100%**: 작은 base에서의 100% 성장은 절대량 미미 — 의사결정 가치 낮음

상세: [artifacts/mackerel_combined_audit_antigravity.md](./mackerel_combined_audit_antigravity.md)
출처 아카이브: [docs/2026_mackerel_industry_sources.md](../docs/2026_mackerel_industry_sources.md) (15건)

---

## 5. 독립 검증 (Phase 5, Codex GPT-5.5)

### Codex 판정 (5건)

| # | 의혹 | Codex 판정 | 권고 |
|---|---|---|---|
| 1 | w14 노르웨이 의존도 52% 내부 불일치 | **정당** | **EDIT** — subtitle/데이터/외부 출처 기준 일관화 |
| 2 | w52 아프리카 수출 +167% | **정당** | **EDIT** — 다년 누적 vs 단년 YoY 구분, 기간 명시 |
| 3 | mackerel-comtrade 허위 Live | **정당** | **EDIT** — 코드 주석에 "demo인데 Live로 표시" 인정, isLive=false |
| 4 | 네덜란드 중계무역 vs 훈제가공 | **false alarm** | **KEEP** — 양립 가능 (가공 후 재수출), Antigravity 과도 분류 |
| 5 | w66 영국산 수입 +100% | **정당** | **EDIT** — 낮은 base 저기저 효과 명시 |

### Multi-Agent 합의
- **4건 EDIT 정당 / 1건 false alarm 기각** (네덜란드)
- Antigravity의 의심 적중률 80% — 단일 모델 의존보다 vendor 교차가 효과적

---

## 6. 위젯 삭제·이동 결정 (Phase 6)

### 6.1 스코프 점검 결과
- **스코프 불일치 위젯 없음** (참치의 UsPollockDetour 같은 케이스 부재)
- 모든 TSX 위젯이 고등어 공급망 맥락 (가나·노르웨이·중국·페루·후쿠시마 등 모두 고등어 무역 관련)

### 6.2 법적 리스크 위젯
- 참치의 "다크 트레이딩 의심 경로" 같은 IUU 의심 시각화 위젯 부재
- JSON w50 "IUU 불법어업 규제 준수 레이더"는 추상 지수라 안전

### 6.3 미래 시나리오 mock
- w05 "고등어 양식 전환 가능성 평가" 1건 — B등급, 실제 산업 동향 분석 (참치의 비건/배양육과 달리 의사결정 가치 있음)
- **삭제 대상 아님**

### 6.4 결정
**참치와 달리 삭제·이동 대상 없음.** 정정·보강 위주 진행. 위젯 총수 103 → 103 (변동 없음).

---

## 7. 우선순위 액션 플랜

### P0 (즉시, 24시간 내) — 2건
1. `app/api/mackerel-comtrade/route.ts:33-34` 허위 `isLive = true` 제거 + STATIC 라벨
2. `components/MackerelFTAQuarterly.tsx:193` SYNCED → STATIC

### P1 (1주 내) — 7건
3~5. MackerelAquaculture/Blackhole/KoreaSupply syncDate + 출처 보강 (D등급 4건 즉시 회복)
6. w14 노르웨이 의존도 subtitle 52% → 자체 데이터 vs 외부 출처 일관화
7. w52 아프리카 수출 +167% → 기간 명시 (누적 vs YoY 구분)
8. w10/18/36 네덜란드 중계무역 + 훈제가공 양립 표기
9. w02 어획 상위 5개국 → Atlantic/Pacific chub 분리

### P2 (의심 검토, 별도 작업)
10. w42 노르웨이 TAC 감축 단일 수치 → 시나리오 3개(과학·합의·독자) 동시 표기
11. w66 영국산 수입 +100% → 절대량 표기 추가, 기저효과 명시
12. 자체 reliability 필드 4-Axis 룰북 맞춰 재산정 (53개 100점 위젯)

### P3 (D등급 표기 보강 일괄)
13. MackerelMacroCycle/ProcessedWidgets/SafetyPremium 등 D등급 7개 cardDesc + syncDate에 출처 키워드·연도 명시 (즉시 B등급 회복)

---

## 8. Multi-Agent 토폴로지 (비용 $0)

| 단계 | 모델 | 비용 |
|---|---|---|
| Phase 0 베이스라인 정리 | Claude (직접) | $0 |
| Phase 1 (TSX + JSON 인벤토리) | Claude + Python | $0 |
| Phase 2 4-Axis 점수 | Claude + Python | $0 |
| Phase 3+4.2 결합 audit (API + 클레임 vs 15 출처) | **Antigravity Gemini 3.1 Pro** (1회, 56KB 입력) | $0 (AI Ultra) |
| Phase 4.1 출처 아카이브 (15건) | **WebSearch (Claude 내장)** × 5 | $0 |
| Phase 5 독립 검증 (5건) | **Codex GPT-5.5** (1회) | $0 (ChatGPT Plus) |
| Phase 6~7 결정·정정·보고서 | Claude | $0 |

**Antigravity false alarm 차단:** Codex 독립 검증으로 [대기 중] 건 기각/확인.

---

**Generated by Claude Code multi-agent orchestration. Cost: $0.**
