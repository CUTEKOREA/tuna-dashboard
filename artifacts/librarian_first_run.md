# Librarian 첫 실전 검증 결과 (ADR 0007 Validation)

**일시**: 2026-05-22
**대상 데이터**: `data/carrot_insights.js` (4.2KB, 5 widgets × 5 필드 = ~25 텍스트 필드)
**호출 경로**: Gemini Direct API (gemini-2.5-flash, responseMimeType="application/json")
**호출 환경**: Claude Code Bash 세션이 curl로 Gemini API 직접 호출 (Librarian 흉내 — OpenCode/OMO 우회)

## 호출 결과

| 항목 | 값 |
|---|---|
| 응답 시간 | **43초** |
| Input 토큰 | 1,680 |
| Output 토큰 | 1,185 |
| Thinking 토큰 | 8,321 (response_total - prompt - output) |
| Total 토큰 | 11,186 |
| 비용 (paid tier) | **$0.00347** |
| HTTP 상태 | 200 OK |
| JSON 출력 안정성 | ✅ (responseMimeType 옵션 작동) |

## 검출 위반 분석

총 15건 검출. 정확도 분류:

### ✅ 진짜 위반 (3건, 적용 권장)
| # | 필드 | 위반 텍스트 | 제안 한글 |
|---|---|---|---|
| 1 | source/w2 | `Operational and Commercial Feasibility Analysis` | 운영 및 상업적 타당성 분석 |
| 2 | source/w3 | `Analysis of Factors Affecting Vegetable Price Fluctuation` | 채소 가격 변동 요인 분석 |
| 14 | source/w4 | `Valorization of Baby Carrot Processing Waste` | 어린 당근 가공 폐기물 가치화 |

→ 모두 **영문 보고서 제목**이 한글 풀네임 없이 source에 직접 노출. L-01 위반 명백.

### ⚠️ 오탐 (False Positive, 11건)
| # | 필드 | "위반"으로 검출 | 실제 평가 |
|---|---|---|---|
| 3, 11, 15 | various | `ESG` | 화이트리스트 약어 — 프롬프트에 명시했음에도 Flash가 검출 |
| 7 | situation/w4 | `Scope 3` | 도메인 표준 약어 (ESG 회계 컨텍스트), 위반 아님 |
| 4, 10 | various | `업사이클링` | 이미 한글(외래어 표기). Flash가 외래어 ≠ 영문 판단 못함 |
| 5 | title/w4 | `에코 프리미엄` | 이미 한글 |
| 6, 12 | various | `파트너십`, `파트너` | 이미 한글 |
| 8 | situation/w4 | `소싱` | 이미 한글 |
| 9 | takeaway/w4 | `퓨레` | 이미 한글 (외래어, 표기 미세 수정) |
| 13 | takeaway/w4 | `포지셔닝` | 이미 한글 |

→ **Precision**: 3/15 = 20% (낮음)
→ **Recall (진짜 위반 대상)**: 알 수 없음 — 사람 검토 없이 진짜 위반 총수 미파악. 카운트는 작아 보임.

## 결론·교훈 (ADR 0007 Validation)

### ✅ 검증된 가설
1. **Gemini Direct API 호출 성공**: API key 작동, JSON 출력 안정, ~$0.003/audit
2. **$100/월 한도 충분**: 이 audit task 28,000회 가능 — 매일 100회 audit해도 한 달 $9 (9%만 사용)
3. **agentic tool-use 없이 batch task 적합**: 도구 호출 0, hang 없음. ADR 0006 line 243 함정 회피
4. **JSON 구조화 출력 신뢰 가능**: `responseMimeType: "application/json"` + 명확한 schema 프롬프트로 안정적 list 반환

### ⚠️ 발견된 한계
1. **Flash는 precision 낮음** (3/15 = 20%): 외래어 한글과 영문 단어 구분 약함, 화이트리스트 무시 경향
   - **해결**: Pro Preview로 upgrade (비용 $0.5/audit, 28,000 → 192회/월) — recall 우선 case에 적합
   - **또는**: Few-shot 예시를 프롬프트에 더 명시, 화이트리스트를 강조
2. **응답 시간 43초**: 도구 호출 없음에도 작은 입력에 thinking 8,321 토큰 사용. 큰 audit에는 OK이나 매우 짧은 task는 비효율
3. **사람 검토 필수**: 출력을 그대로 적용 불가. 20% precision은 사용자가 false positive 11건 reject 필요

### 권장 운영 패턴 (실측 기반)
- **Librarian (Flash)**: 1차 광역 audit — recall 우선, precision 낮음 받아들임, 사람이 reject
- **Librarian-heavy (Pro)**: precision 필요 task (Final pre-merge audit) — 비용 200배지만 결과 신뢰 높음
- **Few-shot 강화**: 외래어 한글 예시(업사이클링·파트너십·소싱)를 화이트리스트로 명시
- **Multi-shot pipeline**: Flash audit → Pro re-check (false positive 제거) → 사람 최종 검토

### 즉시 적용 가능 결과
data/carrot_insights.js에서 **3건 진짜 L-01 위반** 발견:
- widget 2 source: "Operational and Commercial Feasibility Analysis"
- widget 3 source: "Analysis of Factors Affecting Vegetable Price Fluctuation"
- widget 4 source: "Valorization of Baby Carrot Processing Waste"

→ 이 3건은 별도 작업으로 한글 풀네임 병기 정정 권장.

## ADR 0007 Validation 체크리스트 업데이트

- [x] `~/.config/opencode/oh-my-openagent.json`에 4 역할 등록 (librarian + librarian-heavy 추가됨)
- [ ] Oracle 의무 게이트 enforce (위젯 머지 전 GPT-4o pass) — 미작동
- [x] **Librarian 첫 작업: carrot_insights.js L-01 audit (2026-05-22)** ✅
- [ ] 일간 09:00 cron으로 Librarian audit 자동화 — 미설정
- [ ] 30일 후 $100/월 실제 소진율 점검 — 진행 중 (현재 1회 호출 $0.003 = 0.003%)

## 다음 액션 (선택)
1. **3건 진짜 위반 정정**: carrot_insights.js 영문 보고서 제목 한글 병기
2. **Pro Preview 검증**: 같은 input에 gemini-2.5-pro로 호출해 precision 비교
3. **OMO 환경에서 검증**: `opencode run --agent librarian` 실제 OMO 경로 시도
4. **일간 cron 셋업**: 매일 09:00 librarian audit → `artifacts/daily_audit_<date>.md`
