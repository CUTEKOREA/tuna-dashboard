# Beef LIVE Schema Debug Round 3 결과 (2026-05-24)

## KAMIS 키 + cert_id + 한우 코드 매핑 검증

### ✅ 한우 LIVE 활성 성공

사용자가 새 KAMIS_API_KEY + 계정 정보 제공:
- `p_cert_key`: `f3557f2e-fe2e-4609-9fc7-b01492beb192`
- `p_cert_id`: `cutekorea`

코드 매핑 검증 (KAMIS URL 직접 추출):
| 파라미터 | 이전 (오류) | 검증 후 (정상) |
|---|---|---|
| itemcategorycode | 100 | **500** (축산물) |
| itemcode | 411 (3자리) | **4304** (한우, 4자리) |
| kindcode | 01 | **27** |
| productrankcode | 04 | **1** |

**LIVE 응답** (2025년 7월~10월):
- 25-07: 2,687원/100g
- 25-10: 2,757원/100g
- 단위 100g — kg 환산 시 26,870~27,570원/kg (도매가 합리적 범위)

### ⏸️ 수입쇠고기 매핑 미해결

- `itemcode=4307` 시도 → KAMIS condition echo는 정상이나 `data.item[]` 비어있음
- 정확한 수입쇠고기 itemcode는 별도 KAMIS 페이지 직접 조회 필요
- **임시 대응**: 한우만 LIVE, 수입육은 FALLBACK 정적 값 유지
- source 라벨: `KAMIS API (한우 4304/27 LIVE + 수입육 fallback)` 정확 표기

## 진화 트랙

| Round | 상태 | 핵심 진단 |
|---|---|---|
| 1 | err: KAMIS 응답 부족 | 시도 1차 (logger 없음) |
| 2 | KAMIS condition echo, data.item[] 비어있음 | itemcode 411/kind 01 오류 식별 |
| **3** | **한우 LIVE 활성** | itemcategorycode 500, itemcode 4304, kindcode 27 검증 |

## 잔여 작업

| 항목 | 우선도 | 시간 |
|---|---|---:|
| KAMIS 수입쇠고기 정확한 itemcode 조사 (미국산 4307? 4308?) | Mid | 별도 PR |
| KAMIS 단위 표준화 (100g vs kg) — 차트 라벨 정정 | Low | 5분 |
| KOSIS `DT_114051N_002` objL1 분류 변수 정확한 값 | Mid | 별도 PR |

## debug logger 가치 (최종)

3 라운드 모두 logger가 결정적 진단 제공:
- Round 1: 키 무효 (err 11) → 사용자 갱신
- Round 2: 키 정상, tblId 미존재 (err 21) → DT_114051N_002 실존 확인
- Round 3: condition echo + data.item[] 빈 응답 → itemcode 매핑 오류 → URL 추출로 정정

logger 없었다면 단순 fallback 메시지만 봤을 것 — 진단 불가.
