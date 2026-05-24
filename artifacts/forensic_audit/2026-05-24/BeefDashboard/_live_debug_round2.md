# Beef LIVE Schema Debug Round 2 결과 (2026-05-24)

## KOSIS 키 갱신 후 재진단

사용자가 새 KOSIS_API_KEY 제공 + Vercel 등록 + 재배포 완료.

### ✅ 키 정상 작동 확인
- 이전: `err:11 유효하지 않은 인증KEY입니다`
- 현재: `err:21 해당 통계표가 존재하지 않습니다`
- 키 자체는 정상, tblId 매핑이 잘못됨

### tblId 후보 일괄 probe 결과

| orgId | tblId | 결과 |
|---|---|---|
| 101 | DT_114051N_002, DT_1IZ1101, 등 7개 | 모두 err:21 미존재 |
| **114** | **DT_114051N_002** | **err:20 objL 필수** ← 실존! |
| 114 | DT_1IZ1101, 등 6개 | err:21 미존재 |
| 314 | 7개 | 모두 err:21 |

### 핵심 발견

- **`orgId=114, tblId=DT_114051N_002`** 통계표 존재 확인
- `objL1=ALL` 시도 → `err:20 필수요청변수값 누락 (objL)` 지속
- KOSIS는 통계표마다 분류 변수가 다르며, ALL이 항상 작동하지 않음

### 다음 라운드 작업

해당 통계표의 정확한 objL1·L2·L3 specific 값 확인 방법:
1. kosis.kr → DT_114051N_002 통계표 직접 열람 → 분류 변수명 확인
2. PublicDataReader Python 라이브러리 매핑 참조
3. KOSIS getMeta API endpoint 명세 재조사

## 현 상태

| Endpoint | 키 | tblId | 진단 | 다음 액션 |
|---|---|---|---|---|
| /api/beef/korea-supply | ✅ 유효 | ✅ 존재 (DT_114051N_002) | objL1 분류 변수 부족 | KOSIS 통계표 페이지에서 objL1 값 확인 |

## debug round 진화

logger가 단계별 결정적 진단 제공:
- err:11 (키 무효) → err:21 (통계표 무효) → err:20 (분류 변수 누락)
- 단계별 명확한 디버깅 경로 가시화
