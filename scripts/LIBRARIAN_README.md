# Librarian audit 운영 가이드 (ADR 0007 구현)

자동 L-01 영문 잔존 검사 도구. Vertex AI Gemini 2.5 Pro/Flash 사용. 어제 ADR 0006/0007 fallback 토폴로지의 실측 검증 완료 (precision 80%+, 비용 $0.009/audit).

## 파일

| 파일 | 역할 |
|---|---|
| `librarian_audit.sh` | 단일 파일 audit (CLI 1회 호출) |
| `librarian_daily_audit.sh` | 일간 전수 audit (모든 dashboard + insight 파일) |
| `librarian_daily.launchd.plist` | macOS launchd 등록용 (매일 09:00) |

## 사전 요구

1. **gcloud CLI** + 결제 활성 GCP project
   ```bash
   gcloud auth login
   gcloud config set project <YOUR-PROJECT-ID>
   ```
2. **Vertex AI API 활성화** (대부분 자동)
3. (선택) `LIBRARIAN_PROMPT` env로 prompt 파일 지정 (기본: `/tmp/librarian_prompt_v3.txt`)

## 사용 — 단일 파일

```bash
# Pro 2.5 (precision 80%+, $0.006-0.05/audit)
LIBRARIAN_PROMPT=/tmp/librarian_prompt_v3.txt \
  ./scripts/librarian_audit.sh \
  components/PorkWidgets.tsx \
  artifacts/audit_pork.json

# Flash (cheap sweep, $0.003/audit)
./scripts/librarian_audit.sh data/carrot_insights.js audit_carrot.json gemini-2.5-flash
```

## 사용 — 일간 전수

```bash
# DRY_RUN: 대상 파일 list만 확인
DRY_RUN=1 ./scripts/librarian_daily_audit.sh

# 정상 실행 (Pro, budget $1.0)
./scripts/librarian_daily_audit.sh

# Flash 광역 sweep (cheap, $0.3 cap)
BUDGET_USD=0.3 MODEL=gemini-2.5-flash ./scripts/librarian_daily_audit.sh
```

결과:
- `artifacts/daily_audit/<YYYY-MM-DD>/summary.md` — 통합 보고서
- `artifacts/daily_audit/<YYYY-MM-DD>/<file>.json` — 파일별 detail

## launchd 등록 (매일 09:00 자동 실행)

```bash
# 1. plist 복사
cp scripts/librarian_daily.launchd.plist \
   ~/Library/LaunchAgents/com.cutekorea.librarian-daily.plist

# 2. load
launchctl load ~/Library/LaunchAgents/com.cutekorea.librarian-daily.plist

# 3. 즉시 1회 실행 (테스트)
launchctl start com.cutekorea.librarian-daily

# 4. 상태 확인
launchctl list | grep librarian

# 5. 로그 확인
tail -f artifacts/daily_audit/_launchd_stdout.log
tail -f artifacts/daily_audit/_launchd_stderr.log

# 제거
launchctl unload ~/Library/LaunchAgents/com.cutekorea.librarian-daily.plist
rm ~/Library/LaunchAgents/com.cutekorea.librarian-daily.plist
```

## cron 대안 (Linux 또는 launchd 안 쓸 때)

```cron
# crontab -e
0 9 * * * cd /Users/idong-geon/연구자동화애이전트들/tuna-dashboard && BUDGET_USD=0.5 MODEL=gemini-2.5-pro ./scripts/librarian_daily_audit.sh >> artifacts/daily_audit/_cron.log 2>&1
```

## 비용 가이드 (실측)

| 단일 audit | Flash | Pro 2.5 |
|---|---|---|
| 평균 1 파일 (4KB) | $0.003 | $0.006 |
| 큰 dashboard (30KB) | $0.02 | $0.05 |
| 전수 122 파일 batch | ~$0.4 | ~$3-5 |

$100/월 paid 한도 시:
- Flash 단독: 약 11,000 audit/월
- Pro 2.5 단독: 약 1,500 audit/월
- Stage 1 Flash + Stage 2 Pro pipeline: 약 11,000 audit/월

## Prompt 버전

- `v1` (`/tmp/librarian_prompt.txt`): 간단 화이트리스트. recall 우선 — Flash sweep용.
- `v3` (`/tmp/librarian_prompt_v3.txt`): few-shot + 외래어 한글 화이트리스트. precision 80%+ — Pro 권장.

(스크립트가 prompt 파일 없으면 v3를 자동 생성)

## 사람 검토 워크플로우

1. 일간 cron 실행 → `summary.md` 생성
2. 위반 수 많은 top 3 파일 식별
3. 각 파일별 detail JSON 열어 violation list 확인
4. 진짜 위반 vs false positive 분류
5. 진짜 위반만 Claude Code 또는 직접 정정
6. 재audit → 0건 또는 감소 확인 후 commit

## 향후 개선

- [ ] Stage 1 (Flash) → Stage 2 (Pro re-check) 자동 chaining (precision·비용 균형)
- [ ] Git diff 기반 부분 audit (변경 파일만)
- [ ] Webhook/Slack 알림 (위반 수 임계 초과 시)
- [ ] False positive 패턴 누적 → 자동 화이트리스트 학습
