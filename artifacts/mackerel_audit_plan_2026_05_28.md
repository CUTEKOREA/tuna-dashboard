# 고등어 페이지 위젯 신뢰도·유효성 감사 — 기획서

> **작성:** 2026-05-28 Claude Code
> **타겟:** [https://leedonggun.co.kr/mackerel](https://leedonggun.co.kr/mackerel) ← `MackerelDashboard.tsx`
> **선행 사례:** [value_chain_audit_2026_05_28.md](./value_chain_audit_2026_05_28.md) (참치, 120→117 위젯, 17건 정정)
> **목적:** 참치와 동일한 4-Axis Multi-Agent audit을 고등어 5-Pillar 전체 위젯에 적용

---

## 1. 사전 파악 (Discovery 결과)

### 1.1 페이지 구조
- 메인 컴포넌트: [MackerelDashboard.tsx](../components/MackerelDashboard.tsx) (55 KB, 1,500+ LOC)
- 5-Pillar (S1~S5) — 참치와 동일 구조
- 시그니처 그라디언트: 등푸른 원양 `cyan-700 → sky-500` (참치 cyan→blue와 차별)

### 1.2 위젯 인벤토리 (추정)
[MackerelDashboard.tsx:47-51](../components/MackerelDashboard.tsx#L47) `pillarMap`에서:
| Pillar | ID 기반 위젯 | 전용 컴포넌트 위젯 | 총 |
|---|---:|---:|---:|
| S1 원료 수급 | 17 | 3 (KoreaSupply·NorwayAlt·ClimatePredictor) | ~20 |
| S2 가공·생산 | 16 | 1 (Aquaculture) | ~17 |
| S3 물류·통관 | 33 | 2 (FTAQuarterly·AfricanExportROI) | ~35 |
| S4 판매·수요 | 19 | 0 | ~19 |
| S5 ESG | 8 | 1 (SafetyPremium) | ~9 |
| **합계** | **93** | **7** | **~100** |

- `components/Mackerel*.tsx` 총 24개 파일
- JSON 데이터 기반 위젯이 절반 이상 (id: `w01`~`w75`, `w_busan_procurement` 등)

### 1.3 API 라우트
- `app/api/mackerel-comtrade/route.ts` (2 KB) — UN Comtrade
- `app/api/mackerel-ticker/route.ts` (8.6 KB) — 가격 ticker
- `app/api/mackerel-kcs/route.ts` (5 KB) — 관세청

### 1.4 기존 audit 인프라 (참치보다 풍부)
- [artifacts/audit_top5/MackerelDashboard_pro.json](./audit_top5/MackerelDashboard_pro.json) — Pro audit (위반 카운트)
- [artifacts/forensic_audit/2026-05-23/](./forensic_audit/) + 2026-05-24/MackerelDashboard
- **artifacts/daily_audit/2026-05-22~27/** — **12개 위젯 매일 자동 audit** (Gemini Flash 기반 librarian)
  - 위반 사례: "글로벌 commodity 수출국→수입국 흐름" → "원자재(commodity)" 한글화 제안 등
- 즉, **기본 위반 L-01(영문 잔존) 같은 룰북 위반은 이미 추적 중**

### 1.5 출처 아카이브 — **부재**
- 참치는 [docs/2026_tuna_industry_sources.md](../docs/2026_tuna_industry_sources.md) (14건) 있었음
- **고등어는 `2026_mackerel_industry_sources.md` 같은 외부 출처 아카이브 없음** → 교차 검증의 기준 부재

---

## 2. 참치 audit과의 핵심 차이 (Mackerel-Specific)

| 차원 | 참치 (선행) | 고등어 (이번) |
|---|---|---|
| 기존 audit | 없음 (이번이 첫 풀스캔) | **daily_audit 4일치 + forensic 2일치 + pro 1건 누적** |
| 위젯 시스템 | 100% inline TSX (ADR-0005 WidgetCard) | **inline TSX + JSON-driven 혼재** — 클레임이 JSON 파일에 있음 |
| 출처 아카이브 | 14건 docs/ 있음 | **부재** — 만들거나 대체 |
| 핵심 도메인 함정 | 가다랑어 가격 $2,250 false data 사고 | (불명, audit 진행 중 발견) |
| 시그니처 그라디언트 | cyan → blue | cyan-700 → sky-500 |
| NotebookLM 컨텍스트 | 참치 노트북 10개 | 고등어/노르웨이 노트북 (미확인) |

### 2.1 새로운 함정 (예상)
- **JSON 데이터 위젯 ~75개** — TSX cardDesc만 보면 안 됨. `public/data/mackerel_*.json` 안의 `widget.cardDesc`/`source` 필드도 audit 대상
- **노르웨이/페로 어획 쿼터** — NEAFC, ICES, IMR(노르웨이 해양연구소) 데이터 최신성
- **러시아 어획 비중** — 제재 후 KCS 데이터에서 변동, 최신화 필요
- **부산 위판가** — KAMIS·수협 실시간 vs 추정치 구분
- **고등어 자숙 vs 신선 vs 통조림** — 가공별 가격 격차

---

## 3. 제안 Audit 플랜 (참치와 동일 구조 + 고등어 보정)

### Phase 0: 기존 audit 베이스라인 정리 (NEW, 참치엔 없었음)
- [ ] `daily_audit/2026-05-27/` 12개 위젯 위반 카운트 집계 → 이미 처리된 것 식별
- [ ] `audit_top5/MackerelDashboard_pro.json` 위반 패턴 정리
- [ ] `forensic_audit/2026-05-23~24/` 결정사항 추출
- **목적:** 중복 작업 회피, 이번 라운드는 **차이분 + 신규 발견**만

### Phase 1: 인벤토리 (Phase 1 — 참치 동일)
- [ ] [MackerelDashboard.tsx](../components/MackerelDashboard.tsx) 모든 import + pillarMap 추출
- [ ] `Mackerel*.tsx` 24개 파일의 WidgetCard 메타 일괄 추출 ([scripts/extract_value_chain_widgets.py](../scripts/extract_value_chain_widgets.py) 재사용·확장)
- [ ] **JSON 데이터 파일** (`public/data/mackerel_*.json`) 안의 widget cardDesc/source 필드도 별도 추출 — 참치 audit엔 없던 단계
- [ ] API 호출 fetch path 전수 수집

### Phase 2: 4-Axis 점수 (Phase 2 — 참치 동일)
- 출처 신뢰도(`KAMIS·KCS·MOF·NEAFC·ICES·IMR·노르웨이수산국·FAO·EUMOFA`) src_terms 확장
- 신선도(syncDate 연도)
- 검증 가능성(LIVE/SYNCED/STATIC)
- 통합 완성도(pillar + cardDesc + telemetry)

### Phase 3: API 라우트 mock audit (Antigravity Pro 1회)
- 3개 라우트(comtrade·ticker·kcs) 합 ~16 KB → Antigravity 쿼터 차감 **$0**
- 참치 audit에서 발견한 패턴 적용: 허위 라이브 출처·SYNCED 오용·grade 과대 적용

### Phase 4: 클레임 교차 검증 (Antigravity Pro 1회) — **출처 아카이브 옵션 필요**
- 옵션 A: **고등어 2026 출처 아카이브 신규 작성** (Antigravity로 web search → 14건 수집 → `docs/2026_mackerel_industry_sources.md`) — 추가 1시간
- 옵션 B: **기존 NotebookLM 고등어 노트북 활용** (있다면) + 공통 RFMO 출처(NEAFC·ICES) — 빠름
- 옵션 C: 출처 비교 없이 **사실성 일반 점검만** (이상치·내부 일관성)

### Phase 5: Codex 독립 검증 (의심 5건)
- Antigravity가 제기한 critical 의심 → 실제 코드 발췌 → Codex GPT-5.5 writer-reviewer 패턴

### Phase 6: 신뢰도 정리 결정 (Phase 6 — 참치 옵션 C 적용 사례)
- D등급 위젯(있다면) 삭제
- 스코프 불일치(예: 고등어 dashboard에 다른 어종 위젯) 이동/제거
- 법적 리스크 위젯(IUU 의심 등) 익명화 또는 삭제

### Phase 7: 정정 적용 + L-03 빌드 + commit
- 참치와 동일 형식 보고서: [artifacts/mackerel_audit_2026_05_28.md](./mackerel_audit_2026_05_28.md)
- 산출물: `mackerel_widget_inventory.json`, `mackerel_4axis_scores.csv`, 보조 `mackerel_api_routes_audit_antigravity.md`·`mackerel_cross_validation_antigravity.md`

### Phase 8: 배포 (사용자 명시 요청 시)

---

## 4. Multi-Agent 토폴로지 (참치와 동일, 비용 $0)

| 단계 | 모델 | 비용 |
|---|---|---|
| Phase 0~2 (정리·인벤토리·점수) | Claude Opus 4.7 + Python 스크립트 | $0 (Max 20x) |
| Phase 3 API audit (3 라우트, ~16 KB) | Antigravity Gemini 3.1 Pro | $0 (AI Ultra) |
| Phase 4 클레임 교차 (100 위젯, 출처 ~?건) | Antigravity Gemini 3.1 Pro | $0 (AI Ultra) |
| (옵션 A 시) 출처 아카이브 수집 | Antigravity Gemini 3.1 Pro + web search | $0 |
| Phase 5 독립 검증 (의심 5건) | Codex GPT-5.5 | $0 (ChatGPT Plus) |
| Phase 6~7 정리·정정·보고서 | Claude (이 세션) | $0 |

**예상 비용: $0 (Gemini API $100 충전금 미사용)**
**예상 시간: 2~3시간** (참치 1.5~2시간보다 약간 증가 — JSON 데이터 위젯 + 출처 아카이브 작성 시)

---

## 5. 결정 사항 (사용자 승인 필요)

### A. 출처 아카이브 처리 방식
- **(추천) A**: 고등어 2026 출처 아카이브 신규 작성 — 향후 재사용 가능, +1시간
- **B**: NotebookLM 고등어 노트북 활용 — 노트북 ID 알려주시면 작업
- **C**: 출처 교차검증 생략, 사실성·내부 일관성만 — 빠르지만 깊이 ↓

### B. JSON 데이터 위젯 처리 범위
- **(추천) 전체**: TSX + JSON 모두 audit — 완전성, 본 작업 의의 충실
- 옵션 축소: TSX inline만 — 빠르지만 ~75개 JSON 위젯 누락

### C. Phase 6 위젯 삭제·이동 기준
- **(추천) 참치와 동일**: 옵션 C 수준 (스코프 불일치 + 법적 리스크 + 미래 시나리오 mock)
- 옵션 보수: 옵션 A (스코프 불일치만)

### D. 배포 (Phase 8) 사전 동의 여부
- **(추천)** 정정 적용 후 보고서 보고 → 배포 의사 재확인
- 옵션 자동: build 통과 시 자동 push

---

## 6. 산출물 예상

1. **[artifacts/mackerel_audit_2026_05_28.md](./mackerel_audit_2026_05_28.md)** — 종합 보고서 (참치와 동일 형식)
   - Executive Summary (즉시 정정·표현 정정·검증 통과)
   - 5-Pillar 분포 + 4-Axis 평균
   - P0~P4 액션 플랜
2. **[artifacts/mackerel_widget_inventory.json](./mackerel_widget_inventory.json)** — 위젯 메타 (TSX + JSON 합본)
3. **[artifacts/mackerel_4axis_scores.csv](./mackerel_4axis_scores.csv)** — 위젯별 등급
4. **[artifacts/mackerel_api_routes_audit_antigravity.md](./mackerel_api_routes_audit_antigravity.md)** — 3 라우트 audit
5. **[artifacts/mackerel_cross_validation_antigravity.md](./mackerel_cross_validation_antigravity.md)** — 출처 교차검증
6. (옵션 A 시) **[docs/2026_mackerel_industry_sources.md](../docs/2026_mackerel_industry_sources.md)** — 신규 출처 아카이브

---

## 7. 위험 요소 (Risk Assessment)

| 위험 | 확률 | 영향 | 완화책 |
|---|:-:|:-:|---|
| JSON 데이터 위젯 메타 추출 정규식 실패 | 중 | 중 | 참치에서 검증된 패턴 + JSON 별도 파서 |
| Antigravity 쿼터 소진 (AI Ultra 락) | 저 | 중 | Gemini Direct API 폴백 (`ask-gemini`) — $100 충전금 |
| 출처 아카이브 부재로 false positive 증가 | 중 | 중 | Codex 독립 검증 강화 (의심 건 모두 회부) |
| MackerelDashboard.tsx 1500 LOC 부분 수정 후 빌드 깨짐 | 중 | 고 | L-03 게이트 + Edit 최소화 + 변경 후 즉시 build |
| 기존 daily_audit 결과 일부 미반영 (중복 작업) | 저 | 저 | Phase 0에서 사전 정리 |

---

## 8. 사용자 결정 요청

다음 4개 문항 답변 부탁:

1. **출처 아카이브 처리** (5장 A 항목): A·B·C 중 어느 것?
   - B 선택 시: NotebookLM 고등어 노트북 ID 알려주세요
2. **JSON 데이터 위젯 포함 범위** (5장 B): 전체 vs TSX만?
3. **위젯 삭제·이동 기준** (5장 C): 참치와 동일 vs 보수적?
4. **배포 사전 동의** (5장 D): 정정 후 재확인 vs 자동 push?

답변 주시면 Phase 0부터 즉시 시작합니다.

---

**기획서 끝. 승인 대기.**
