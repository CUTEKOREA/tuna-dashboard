# Librarian 두 번째 실전 검증 — Pro Preview 시도 + Prompt v2/v3 실험

**일시**: 2026-05-22 (1차 검증 직후)
**목표**: Pro Preview 재검증으로 precision 80%+ 도달 + few-shot prompt 효과 측정

## 실험 매트릭스

| 실험 | 모델 | Prompt | 결과 |
|---|---|---|---|
| A (1차) | gemini-2.5-flash | v1 (원본) | 15건 검출, precision **20%** ✅ |
| A v2 | gemini-2.5-flash | v2 (강화 + self-validation) | **0건** — 너무 보수적, 진짜 위반도 reject ⚠️ |
| A2 v3 | gemini-2.5-flash | v3 (균형) | 1건 (false positive: "Modified Atmosphere"가 한글 병기됐는데 검출) |
| B v3 | gemini-2.5-pro | v3 | **429 free_tier_limit 0** ❌ |
| C v1 | gemini-2.5-pro | v1 | **429 free_tier_limit 0** ❌ |
| B31 v3 | gemini-3.1-pro-preview | v3 | **429 free_tier_limit 0** ❌ |
| B31 v1 | gemini-3.1-pro-preview | v1 | **429 free_tier_limit 0** ❌ |

## 핵심 진단: API key가 free tier에 묶임

```
* Quota exceeded for metric: generativelanguage.googleapis.com/generate_content_free_tier_input_token_count, limit: 0, model: gemini-3.1-pro
* Quota exceeded for metric: generativelanguage.googleapis.com/generate_content_free_tier_requests, limit: 0, model: gemini-3.1-pro
```

사용자는 Google AI Pro/Ultra 구독 (paid tier) 보유 상태이나, **이 API key가 묶인 Google Cloud project가 결제 정보 미연결**이라서 free_tier metric 적용. Free tier에서 Pro·Preview 모델 limit은 **0**.

### 해결 방법 (사용자 직접 작업 필요)
1. https://aistudio.google.com → **API Keys** → 해당 key 선택
2. **Set up Billing** 또는 **Upgrade to Paid Tier** 클릭
3. 결제 카드 등록 → 동일 key가 자동으로 paid tier 승격
4. Pro 모델 호출 한도가 무료 제한 외 paid 한도로 변경됨

또는 새로운 GCP project에서 paid billing 등록 + 새 API key 발급.

## Prompt 강화 효과 측정 (Flash 기준)

| Prompt 버전 | 검출 수 | 진짜 위반 | False positive | Precision |
|---|---|---|---|---|
| v1 (원본 — 간단 화이트리스트) | 15 | 3 | 11 | 20% (광역 recall 우선) |
| v2 (Few-shot + self-validation 단계 4개) | 0 | 0 | 0 | N/A (over-rejection) |
| v3 (균형 — 명확한 위반 예시 + 외래어 화이트리스트) | 1 | 0 | 1 | 0% |

→ **결론**: Flash로는 prompt 튜닝만으로 precision 80%+ 달성 어려움. Pro 모델 필수.

### Trade-off 패턴 (실측)
- **v1 (관대)**: recall 100% (3/3 진짜 위반 검출) + precision 20%
- **v2 (엄격)**: recall 0% (진짜 위반도 reject)
- **v3 (균형)**: recall 0%, false positive만 1건

Self-validation 단계 강도 ≈ recall 감소. Flash는 self-validation 추론이 부정확.

## 운영 권장 (paid tier 활성화 후)

| Pipeline | 모델 | 비용/audit | 역할 |
|---|---|---|---|
| 1차 광역 sweep | Flash + v1 (관대 prompt) | $0.003 | 가능한 위반 후보 광범위 검출 |
| 2차 precision check | Pro Preview + v3 (엄격 prompt) | $0.5 | Flash 후보 중 진짜 위반만 confirm |
| 3차 사람 검토 | Claude Code or 사람 | $0 | Pro 결과 final approval |

추정 비용: dashboard 1개 audit = Flash $0.003 + Pro $0.5 = **$0.5/audit** (paid tier 가격 기준)
→ $100/월 한도로 약 **200 audit/월** (Pro pipeline 포함)

## ADR 0007 update points

1. **Free tier 한계 명시**: API key가 묶인 project에 billing 활성화 안 되면 Pro 모델 limit 0
2. **Flash 한계 인정**: prompt 튜닝만으로 precision 80%+ 불가 (실측). Pro 필수.
3. **Multi-stage pipeline 정식 권고**: Flash sweep + Pro confirm + 사람 검토
4. **사용자 액션 아이템**: aistudio.google.com에서 billing 활성화 필요 (paid tier 효과 받으려면)

## 다음 액션 (선택)

| 옵션 | 작업 | 소요 |
|---|---|---|
| 1 | 사용자가 aistudio.google.com 결제 활성화 → Pro 검증 재시도 | 5분 |
| 2 | OpenCode 환경에서 librarian agent 실제 호출 (OMO 별도 인증 사용 가능성) | 사용자 별도 세션 |
| 3 | Flash multi-shot pipeline (한 audit을 3회 호출 + 합집합/교집합) | 30분 |
| 4 | Vertex AI endpoint 직접 호출 (OAuth, paid 자동) — 더 복잡 | 1h |
