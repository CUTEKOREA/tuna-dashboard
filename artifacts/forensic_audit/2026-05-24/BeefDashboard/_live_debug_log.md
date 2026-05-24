# Beef LIVE Schema Debug Round 1 결과 (2026-05-24)

## 검증 결과 (deploy 후 Vercel logs)

### ✅ W6 korea-imports — LIVE 활성 성공
- **변경**: KCS endpoint 폐기 → UN Comtrade reporter=410 (한국 수입)
- **결과**: 미국 47.1% / 호주 46.1% / 뉴질랜드 3.5% (2025 실측, 정적 36.1% 대비 +10%p)
- **source**: `UN Comtrade Public Preview — 한국 수입 (reporter=410, HS 0201+0202, 2025)`
- **사유**: KCS `unipass.customs.go.kr/ets/index.do` endpoint 실제 미존재. UN Comtrade 우회로 100% 해결.

### ❌ W7 korea-supply — KOSIS 키 무효
- **실측 응답**: `{"err":"11","errMsg":"유효하지 않은 인증KEY입니다."}`
- **원인**: Vercel 등록된 `KOSIS_API_KEY`가 만료/무효
- **대응**: 사용자가 KOSIS Open API 키 갱신 후 Vercel env 재등록 필요
- **방법**:
  1. https://kosis.kr/openapi/index/index.jsp → 로그인 → 인증키 발급
  2. `vercel env rm KOSIS_API_KEY production` → `vercel env add KOSIS_API_KEY production` (새 키 입력)
  3. `vercel --prod` 재배포
- **endpoint 자체는 유지**: 키 갱신 후 schema 정합성 추가 검증

### ❌ W8 hanwoo-price — KAMIS 키 작동, 매핑 오류
- **실측 응답**: condition echo는 정상이나 `data.item[]` 비어있음
- **원인**: `p_itemcode=411` (한우) + `p_kindcode=01` 매핑 부정확
- **분석**: KAMIS는 한우를 등심/안심/갈비 등 부위별로 itemcode 분리 (411은 잘못된 추정)
- **다음 라운드 작업**:
  1. KAMIS "농축수산물 품목 및 등급 코드표" 직접 다운로드
  2. 한우 등심 정확한 itemcode (예: 1721, 1731 등 4자리?) + 1등급 정확한 kindcode 확인
  3. endpoint 변경: `xml.do?action=periodProductList` → `yearlySalesList` 가능성 검토
- **임시 대안**: 한우 데이터를 KOSIS 통계 또는 KAPE(축산물품질평가원) API로 대체 검토

## 결론

| 위젯 | 이전 | 현재 | 다음 액션 |
|---|---|---|---|
| W6 korea-imports | fallback | ✅ **LIVE 성공** | 검증 완료 |
| W7 korea-supply | fallback | ❌ 키 무효 진단 | **사용자 KOSIS 키 갱신** |
| W8 hanwoo-price | fallback | ❌ 매핑 오류 진단 | KAMIS 코드표 직접 조사 (별도 PR) |

## debug logger 가치

`lib/api-debug.ts`의 `logSchemaIssue`가 **결정적 진단** 제공:
- 1줄로 "키 무효" vs "매핑 오류" vs "endpoint 오류" 구분 가능
- 다른 commodity LIVE endpoint에도 즉시 재사용 가능
