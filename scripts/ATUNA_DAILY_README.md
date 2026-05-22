# Atuna 일일 자동 동기화 (ADR 0007 확장 — 사용자 요청 2026-05-22)

매일 GDrive `내 드라이브/61. Atuna/<YYYY.MM.DD>` Google Docs에 업로드된 뉴스를 **자동으로 fetch → Gemini Pro 구조화 → dashboard endpoint 반영**.

## 자산

| 파일 | 역할 |
|---|---|
| `scripts/atuna_daily_sync.sh` | 일일 동기화 스크립트 (gcloud Drive API + Gemini Pro) |
| `app/api/atuna-daily/route.ts` | 동기화 결과 노출 endpoint |
| `public/data/atuna_daily/<YYYY-MM-DD>.json` | 일자별 구조화 시그널 (git 추적) |

## 데이터 schema

```json
{
  "date": "2026-05-21",
  "summary_kr": "PNG 화산 분화로 서태평양 조업 차질 우려, 유가 상승 리스크",
  "market_signals": [{
    "type": "price|supply|demand|geopolitics|regulation|esg",
    "headline_kr": "한국어 40자",
    "detail_kr": "100자, 숫자·국가·기업명 포함",
    "impact_on_korea": "기회|위협|중립 + 50자",
    "atuna_source_title": "원문 영문 title",
    "confidence": "high|medium|low"
  }],
  "kpi_updates": [{"metric":"...","value":"...","unit":"...","note":"..."}],
  "tuna_live_patch": {
    "arbitrageRadar.note_append": "...",
    "thaiTrade.note_append": "...",
    "climateRisk.note_append": "..."
  }
}
```

## ⚠️ 1회성 셋업: gcloud Drive scope 활성화

기본 `gcloud auth print-access-token`은 `cloud-platform` scope만 — Drive API는 별도 권한 필요.

```bash
# 한 번만 실행: Drive read-only scope 추가
gcloud auth login \
  --update-adc \
  --enable-gdrive-access \
  --scopes=https://www.googleapis.com/auth/drive.readonly,https://www.googleapis.com/auth/cloud-platform

# 또는 application-default 갱신
gcloud auth application-default login \
  --scopes=openid,https://www.googleapis.com/auth/drive.readonly,https://www.googleapis.com/auth/cloud-platform

# 검증
TOKEN=$(gcloud auth print-access-token)
curl -sS "https://www.googleapis.com/drive/v3/about?fields=user" \
  -H "Authorization: Bearer $TOKEN" | head -c 200
# → user 정보 반환되면 성공
```

## 사용

```bash
# 오늘 날짜
./scripts/atuna_daily_sync.sh

# 특정 날짜
./scripts/atuna_daily_sync.sh 2026-05-21

# 자동 commit 포함
AUTO_COMMIT=1 ./scripts/atuna_daily_sync.sh

# 자동 commit + push (GH_TOKEN 필요)
AUTO_COMMIT=1 AUTO_PUSH=1 ./scripts/atuna_daily_sync.sh
```

## launchd 등록 (매일 22:00 자동)

사용자가 그날 뉴스를 다 업로드한 후 sync. plist 예시:

```xml
<!-- ~/Library/LaunchAgents/com.cutekorea.atuna-daily.plist -->
<dict>
    <key>Label</key><string>com.cutekorea.atuna-daily</string>
    <key>ProgramArguments</key>
    <array>
        <string>/bin/zsh</string>
        <string>-ic</string>
        <string>cd /Users/idong-geon/연구자동화애이전트들/tuna-dashboard &amp;&amp; AUTO_COMMIT=1 AUTO_PUSH=1 ./scripts/atuna_daily_sync.sh</string>
    </array>
    <key>StartCalendarInterval</key>
    <dict><key>Hour</key><integer>22</integer><key>Minute</key><integer>0</integer></dict>
    <key>StandardOutPath</key><string>/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/artifacts/atuna_daily/_launchd.log</string>
    <key>StandardErrorPath</key><string>/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/artifacts/atuna_daily/_launchd_err.log</string>
</dict>
```

## endpoint 사용

```
GET /api/atuna-daily            # 최근 7일 누적
GET /api/atuna-daily?days=14    # 최근 14일
GET /api/atuna-daily?date=2026-05-21  # 특정 일자
```

응답:
```json
{
  "status": "SYNCED",
  "syncDate": "2026-05-21",
  "available_dates": ["2026-05-21", "2026-05-20", ...],
  "items": [{ "date": "2026-05-21", "summary_kr": "...", "market_signals": [...] }],
  "summary": { "total_days": 7, "total_signals": 32, "latest_summary_kr": "..." }
}
```

## 비용 추정

- Gemini 2.5 Pro 추출: ~$0.015/일 (5KB 뉴스 input → 4KB 구조화 output)
- 월 ~$0.50 / paid 한도 $100 → **0.5% 사용**

## 인터랙티브 fallback (gcloud Drive scope 활성화 전 임시)

Claude Code 세션에서 사용자가 직접:

```bash
# 1. Claude가 mcp__claude_ai_Google_Drive로 fetch + Gemini 추출 (현재 작동 검증됨)
# 2. 사용자가 매일 Claude 세션 한 번 열어서 트리거
```

이는 자동화 아님이라 일시적 — gcloud scope 활성화 후 cron으로 전환 권장.

## 향후 개선

- [ ] `kpi_updates` → `/api/tuna-live`에 자동 inject (지금은 endpoint만 분리)
- [ ] Dashboard 위젯: 최근 N일 Atuna 시그널 카드 (사용자 요청 시 추가)
- [ ] 한 주 단위 summary digest (월요일 자동 생성)
- [ ] Slack/Discord webhook (impact_on_korea = '위협' 시 즉시 알림)
