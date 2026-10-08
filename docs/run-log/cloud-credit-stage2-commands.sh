#!/usr/bin/env bash
# 2026-10-08 2단계 — 자동 모드 분류기가 막은 외부 쓰기 4종. 사용자가 직접 실행한다.
# 사용: 한 줄씩 골라 실행하거나  bash docs/run-log/cloud-credit-stage2-commands.sh <단계번호>  (1~8)
set -euo pipefail
step="${1:-}"
case "$step" in
  1) # PR #1386 병합 (= Vercel 프로덕션 배포). CI 녹색·Codex 2회 통과 상태.
     gh pr merge 1386 -R CUTEKOREA/tuna-dashboard --squash --delete-branch ;;
  2) # squid 수집기 PR #1 병합 → 워크플로 재활성 → 수동 실행
     gh pr merge 1 -R CUTEKOREA/squid-data-collector --squash --delete-branch
     gh workflow enable -R CUTEKOREA/squid-data-collector 271313858
     gh workflow run -R CUTEKOREA/squid-data-collector 271313858 ;;
  3) # 자동 생성 S-Grade 회귀 이슈 일괄 close (목록은 실행 시점에 다시 뽑는다)
     gh issue list -R CUTEKOREA/tuna-dashboard --label phase-A-G-regression --state open --limit 1000 --json number -q '.[].number' \
     | while read -r i; do
         # 코멘트 없이 닫는다 — 코멘트 동반 시 GitHub 2차 제한("submitted too quickly")으로 489건에서 멈췄다(2026-10-08)
         n=0; until gh issue close "$i" -R CUTEKOREA/tuna-dashboard -r "not planned" >/dev/null 2>&1; do n=$((n+1)); [ $n -ge 5 ] && { echo "skip #$i (이미 닫혔거나 5회 실패)"; break; }; sleep 5; done
         [ $n -lt 5 ] && echo "closed #$i"; sleep 1; done ;;
  4) # 키가 평문으로 찍힌 옛 Actions 로그 삭제 (11 레포 × 10-05 이전 run). 되돌릴 수 없다.
     for r in squid cocoa garlic carrot cashew mackerel shrimp pollock salmon seafood cassava; do
       gh run list -R "cutekorea/${r}-data-collector" --limit 30 --json databaseId,createdAt \
         -q '.[] | select(.createdAt < "2026-10-05T12:00:00Z") | .databaseId' \
       | while read -r id; do gh api -X DELETE "repos/cutekorea/${r}-data-collector/actions/runs/${id}/logs" >/dev/null && echo "deleted ${r} ${id}"; done
     done ;;
  5) # 수산 수집기 강화 PR 5건 병합(Codex 리뷰 통과)
     gh pr merge 2 -R CUTEKOREA/pollock-data-collector  --squash --delete-branch
     gh pr merge 2 -R CUTEKOREA/mackerel-data-collector --squash --delete-branch
     gh pr merge 2 -R CUTEKOREA/shrimp-data-collector   --squash --delete-branch
     gh pr merge 4 -R CUTEKOREA/seafood-data-collector  --squash --delete-branch
     gh pr merge 2 -R CUTEKOREA/salmon-data-collector   --squash --delete-branch ;;
  6) # PR #1337 Next.js 16.3.8 보안 업데이트 병합 (CI 녹색·Codex 병합 가능) — = 배포
     gh pr merge 1337 -R CUTEKOREA/tuna-dashboard --squash --delete-branch ;;
  7) # PR #829 fleet 어창 스펙(8-27 → 10-08 main 병합 c429ad4b, CI 녹색·Codex 병합 가능) — = 배포
     gh pr merge 829 -R CUTEKOREA/tuna-dashboard --squash --delete-branch ;;
  8) # cron 분산 PR 10건 병합 (한 줄씩, YAML 확인) — squid 17:00 유지, 나머지 30분 간격
     for spec in pollock:3 mackerel:3 shrimp:3 salmon:3 seafood:5 cocoa:3 garlic:3 carrot:3 cashew:3 cassava:3; do
       gh pr merge "${spec##*:}" -R "CUTEKOREA/${spec%%:*}-data-collector" --squash --delete-branch && echo "merged ${spec}"
     done ;;
  *) echo "usage: $0 {1|2|3|4|5|6|7|8}"; exit 2 ;;
esac
