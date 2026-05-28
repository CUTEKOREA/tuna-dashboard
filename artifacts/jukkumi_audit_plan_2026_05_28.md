# 주꾸미(Jukkumi) 페이지 위젯 신뢰도·유효성 감사 — 기획서

> **작성:** 2026-05-28 Claude Code
> **타겟:** [https://leedonggun.co.kr/jukkumi](https://leedonggun.co.kr/jukkumi)
> **skill:** [/widget-audit](file:///Users/idong-geon/.claude/skills/widget-audit/SKILL.md)
> **선행:** 참치 17 · 고등어 11 · 오징어 26 · 갈치 8 = 누적 62건 정정

---

## 1. 사전 파악

### 1.1 규모 (소형)
- 메인: [JukkumiDashboard.tsx](../components/JukkumiDashboard.tsx) (24.4 KB) + [JukkumiFTAQuarterly.tsx](../components/JukkumiFTAQuarterly.tsx)
- JSON: `jukkumi_real_data_v1.json` — **8 KPI + 30 위젯**
- **API 라우트: 0개** (전용 API 없음, JSON 데이터만)
- 5-Pillar: 두족류 시그니처 그라디언트 (purple → pink)

### 1.2 5-Pillar
- S1 🌊 원료 수급 — 글로벌 원물 소싱, 연안 자원량
- S2 🏭 가공·생산 — HMR 가공 수율, 제조 원가율
- S3 ⚓ 물류·통관 — FTA 발 물류 원가, 통관 리스크
- S4 📊 판매·수요 — 유통 채널별 단가, 탄력성
- S5 🛡️ ESG — 콜드체인 병원성, 보건 안전

### 1.3 기존 audit
- daily_audit 2026-05-22~27 (6일치) — 위반 **2건** (다른 commodity 대비 매우 적음)
- forensic_audit 2026-05-24
- audit_top5 Pro 없음

### 1.4 도메인 특이성
- **종**: Octopus ocellatus (Webfoot octopus), 한국 토속종, 봄철(3~5월) 알밴 주꾸미 성수기
- **양식 거의 없음** — 자연산 위주
- **수입처**: 베트남·중국·태국·인도네시아
- **소비 채널**: HMR(가정간편식)·외식(주꾸미볶음)
- **자원 위기**: 한국 연안 어획 감소 (남획·기후)

---

## 2. 다른 commodity와 차이

| 차원 | 참치 | 고등어 | 오징어 | 갈치 | **주꾸미** |
|---|---|---|---|---|---|
| 위젯 수 | 120 | 103 | 156 | 28 | **30** |
| API 라우트 | 14 | 3 | 8 | 14 | **0** |
| 컴포넌트 LOC | 989 | 55KB | 64.8KB | 56.8KB | **24.4KB** |
| 도메인 함정 예상 | 어종 | 노르웨이 의존 | 종 4종 혼동·PEF M&A | API mock 시스템 함정 | **HMR 가공·자원 위기** |

→ **가장 작은 규모**. audit 1~1.5시간 안에 완결 가능. Phase 3(API) 생략, Phase 4(클레임)에 집중.

---

## 3. Audit 플랜 (8 phase 축약)

### Phase 0~1: 베이스라인 + 인벤토리
- daily_audit 2건 정독 + JSON 30 위젯 메타 추출

### Phase 2: 4-Axis 점수
- Jukkumi src_terms: KOSIS·KAMIS·MOF·KCS·FAO·해수부·수협·통계청·KMI·KFAS·국립수산과학원·HMR·외식산업

### Phase 3: **생략** (API 라우트 0)

### Phase 4.1: 출처 아카이브 신규 작성 (목표 10건, 작은 규모)
- WebSearch × 4: 한국 주꾸미 어획 통계, HMR 시장, 수입처(베트남·중국), 자원 위기
- Grok CLI × 1 (선택): 2025-2026 동향

### Phase 4.2: 클레임 교차 (Antigravity Flash medium variant)
- 30 위젯 + 출처 → 단일 호출 (입력 ~25KB)

### Phase 5: Codex 독립 검증 (의심 3~5건)

### Phase 6: 위젯 삭제·이동 결정
- 후보 검토: 미래 시나리오·법적 리스크·스코프 불일치

### Phase 7: 정정 + 보고서 + L-03

### Phase 8: 자동 push

---

## 4. 에이전트 활용

| 단계 | 모델 | 비용 |
|---|---|---|
| Phase 0~2 | Claude + Python | $0 |
| Phase 4.1 | WebSearch × 4 + (Grok 선택) | $0 |
| Phase 4.2 | Antigravity Gemini 3 Flash medium (foreground 호출) | $0 (OAuth) |
| Phase 5 | Codex GPT-5.5 | $0 |
| Phase 6~7 | Claude | $0 |

**총 비용 $0 / 시간 1~1.5시간**

### 적용된 학습
- **Antigravity foreground 호출 필수** (background hang 재발 방지)
- **variant medium/high 명시** (large input 안정성)
- **Grok 무응답 시 즉시 WebSearch 폴백**
- **isLive: true 하드코딩 grep** — 누적 17건 시스템 함정, API 0개라 이번엔 N/A

---

## 5. 디폴트 결정 (이전과 동일)

| # | 항목 | 디폴트 |
|---|---|---|
| A | 출처 아카이브 | 신규 (10건 목표) |
| B | JSON 위젯 | 전체 (30개) |
| C | 삭제 기준 | 옵션 C (적극) |
| D | 배포 | 자동 push |
| E | JSON 추출 | Python 직접 |

---

## 6. 산출물

1. `artifacts/jukkumi_audit_2026_05_28.md` — 종합 보고서
2. `artifacts/jukkumi_widget_inventory.json` + `jukkumi_json_widgets.json`
3. `artifacts/jukkumi_4axis_scores.csv`
4. `artifacts/jukkumi_combined_audit_antigravity.md`
5. `docs/2026_jukkumi_industry_sources.md` (~10건)
6. `scripts/extract_jukkumi_widgets.py`

---

## 7. 위험

| 위험 | 완화책 |
|---|---|
| 주꾸미 글로벌 자료 부족 (한국 토속종) | 한국 중심 출처(KMI·KFAS·해수부) 위주 + 베트남·중국 보조 |
| Antigravity hang 재발 | foreground 호출 + variant 명시 + 30KB 이하 입력 |
| Grok 무응답 | WebSearch만으로 진행 |

---

## 8. 진행 동의

**"진행"** 한 마디면 Phase 0부터 시작합니다.

옵션 변경 원하시면 알려주세요.
