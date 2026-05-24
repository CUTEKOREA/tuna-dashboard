# Beef LIVE Schema Debug Round 4 결과 (2026-05-24)

## (A) KAMIS 수입쇠고기 + 단위 정합

### ✅ 단위 정합 적용
- KAMIS 한우는 100g 단위 → kg 단위(× 10) 환산 적용
- 차트에서 한우 26,870~27,570원/kg 표시 (도매가 합리적 범위)
- source 라벨: `KAMIS API (한우 4304/27 LIVE, kg 환산, ...)`로 명시

### ⏸️ 수입쇠고기 itemcode 미해결
- 4307 시도 → 데이터 없음 (잘못된 코드)
- 인접 코드(4305, 4306, 4308 등) 추가 probe 필요
- 정확한 매핑은 KAMIS 도매 카탈로그 페이지 직접 조회 또는 코드표 다운로드 필요
- **임시 대응**: 수입육은 FALLBACK 정적 값 유지 + source 라벨에 명시

## (B) KOSIS objL1 specific 값 조사

### 발견
- `DT_114051N_002`는 `objL1=ALL` **미지원**
- `getMeta` method 시도 (type=OBJ_L1, OBJ_L2, ITM_L1, ITM, KOR) 모두 `err:20`
- PublicDataReader 예시 (`tblId=DT_MLTM_2086`)는 `objL1=ALL` 지원 — 통계표마다 다름

### 결론
- KOSIS `DT_114051N_002`는 분류 변수 specific 값 필수
- 정확한 값 확인 경로:
  1. KOSIS 사이트 로그인 → 통계표 페이지 → "분류" 메뉴에서 코드 확인 (가장 정확)
  2. 또는 PublicDataReader Python 라이브러리의 `get_param_data` 메서드 활용
  3. KOSIS 개발가이드 PDF (10MB+) 직접 다운로드 후 메타 API 명세 확인

### 별도 라운드 분리
- 통계표 추정 분류 변수: 가축종류(한우/육우/돼지/닭) × 시도 × 항목
- 사용자가 통계표 페이지 직접 로그인 후 분류 코드 추출 필요

## 최종 상태 (Round 4)

| 위젯 | LIVE | 진단 결과 |
|---|---|---|
| W5 trade-flow | ✅ | UN Comtrade Public Preview |
| **W6 korea-imports** | ✅ | UN Comtrade 한국 reporter (KCS 우회) |
| **W8 hanwoo-price** | 🟡 부분 | 한우 LIVE + 수입육 fallback + kg 환산 |
| W3 slaughter-rate | ✅ | USDA NASS |
| W7 korea-supply | ❌ | KOSIS objL1 specific 값 필요 (사용자 통계표 페이지 로그인) |
| W1+W2 global-production | 🟡 | FAOSTAT timeout 변덕 |

## debug logger 가치 4 라운드 진화

| Round | 진단 |
|---|---|
| 1 | err:11 KOSIS 키 무효 |
| 2 | err:21 → err:20 tblId 실존, objL 누락 |
| 3 | KAMIS condition echo, itemcode 매핑 오류 → 4304/27/1 발견 |
| 4 | KAMIS 단위 100g 발견 → kg 환산, KOSIS getMeta 5가지 type 모두 err:20 |

logger 없었다면 4 라운드 모두 fallback 메시지만 보고 정확한 진단 불가능.
