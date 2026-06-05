# Vercel 프로덕션 env 키 설정 — 진짜-LIVE 활성화 가이드

> 목적: rebuild로 위젯은 "API live면 SYNCED/LIVE, fallback이면 STATIC"을 정직 표시하도록 완료됨.
> 실제로 **LIVE가 되려면 Vercel 프로덕션 env에 API 키**가 있어야 함. 로컬 `.env.local`엔 이미 키가 있으니 Vercel로 복사하면 됨.
> ⚠️ 시크릿 값은 이 문서에 적지 않음. 값은 본인 `.env.local`/`~/.zshrc`에 있음.

## 우선순위 (영향도 = 사용 라우트 수)

| 키 | 라우트 | 언락 | .env.local |
|---|---|---|---|
| **DATA_GO_KR_NEW_KEY** | 26 | KCS/관세청 무역·통관 (최대 언락) | ✅ 준비됨 |
| **UN_COMTRADE_PRIMARY_KEY** | 12 | 글로벌 무역흐름 | ✅ |
| **KAMIS_API_KEY** | 10 | 농수산물 시세 | ✅ |
| **FRED_API_KEY** | 8 | 환율·거시 | ✅ |
| **ECOS_API_KEY** | 7 | 한국은행 거시 | ✅ |
| USDA_FAS / KOSIS / MFDS / USCENSUS / ITA | 1~3 | 농무부·통계청·식약처·센서스 | ✅ |
| ⚠️ KAMIS_CERT_ID | 10 | KAMIS 인증ID (현재 하드코딩 '7849' 폴백) | ❌ 미보유 |
| ⚠️ WTO_API_KEY | 6 | WTO 관세 | ❌ |
| ⚠️ NOAA_TOKEN | 1 | 해양 기후 | ❌ |

→ **DATA_GO_KR_NEW_KEY 하나만 설정해도 26개 라우트(가장 큰 비중)가 프로덕션 LIVE 후보**가 됨.

## 설정 방법 (택1)

### 방법 A — Vercel 대시보드 (가장 쉬움, 클릭)
1. vercel.com → tuna-dashboard 프로젝트 → **Settings → Environment Variables**
2. **Import .env** 버튼 → 로컬 `.env.local` 붙여넣기 (또는 위 키들만 개별 추가)
3. Environment = **Production** 체크 → Save
4. 다음 배포부터 적용 (또는 Redeploy)

### 방법 B — Vercel CLI (제가 push 대행)
```bash
npm i -g vercel          # CLI 설치
vercel login             # ← 대화형 OAuth, 사용자가 직접 (제가 못 함)
vercel link              # tuna-dashboard 프로젝트 연결
# 이후 제가 .env.local 키를 vercel env add로 일괄 push
```
**`vercel login`만 해주시면, 그 다음 단계(link + 일괄 env push + redeploy)는 제가 실행합니다.**

## 누락 키 (별도 발급 필요)
- **KAMIS_CERT_ID**: KAMIS 가입 시 발급되는 인증ID. 현재 라우트는 '7849' 하드코딩 폴백 → 본인 ID 확보 시 KAMIS 시세 LIVE.
- **WTO_API_KEY** / **NOAA_TOKEN**: 각 기관 무료 발급. 미보유 시 해당 라우트는 honest STATIC 유지(기만 아님).

## 검증
설정·재배포 후:
```bash
curl -s https://leedonggun.co.kr/api/mackerel-kcs | python3 -c "import json,sys;print('isLive',json.load(sys.stdin).get('isLive'))"
# isLive True 면 프로덕션 LIVE 성공
```
