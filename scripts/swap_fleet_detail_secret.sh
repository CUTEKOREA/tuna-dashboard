#!/usr/bin/env bash
# FLEET_DAILY_DETAIL_JSON 교체 — 순서가 틀리면 라이브 보호 패널이 깨진다.
#
# detailSha256Compat 은 보고일이 넘어가면 전환 창을 만들어 주지 못한다.
# lib/data/fleet-daily-detail.ts 가 digest 검사 «앞에» 상세의 보고일·집계를 대조하기 때문이다.
# 게다가 Vercel env 변경은 실행 중 배포에 반영되지 않는다 — 새 배포가 떠야 읽는다.
#
# 그래서 순서는 이것뿐이다:
#   ① PR 병합  ② Production READY  ③ 교체(이 스크립트)  ④ 재배포  ⑤ 확인
# 이 스크립트는 ③~⑤ 를 한다. ①② 는 먼저 끝내고 와야 한다.
#
#   bash scripts/swap_fleet_detail_secret.sh            # 대조 → 교체 → 재배포
#   bash scripts/swap_fleet_detail_secret.sh --check    # 대조만
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DETAIL="$ROOT/artifacts/fleet-daily-detail.json"
PUBLIC="$ROOT/lib/data/generated/fleet-daily-public.json"
[ -f "$DETAIL" ] || { echo "❌ 상세 DTO 가 없습니다: $DETAIL (scripts/sync_fleet_daily_reports.py 먼저)"; exit 1; }

# canonical SHA 는 파일 raw 해시가 아니다 - 공개 집계가 기록한 것과 같은 방식으로 다시 만든다.
read -r SHA EXPECT < <(python3 - "$DETAIL" "$PUBLIC" <<'PY'
import hashlib, json, sys
d = json.load(open(sys.argv[1], encoding="utf-8"))
canon = json.dumps(d, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
print(hashlib.sha256(canon.encode()).hexdigest(),
      json.load(open(sys.argv[2], encoding="utf-8"))["_meta"]["detailSha256"])
PY
)
echo "canonical : $SHA"
echo "공개 _meta : $EXPECT"
[ "$SHA" = "$EXPECT" ] || { echo "❌ 해시가 다릅니다 — 공개 집계와 상세 DTO 의 세대가 어긋났습니다. 교체하지 않습니다."; exit 1; }
echo "✅ 일치"
[ "${1:-}" = "--check" ] && exit 0

# ③ 교체
TMP="$(mktemp)"; trap 'rm -f "$TMP"' EXIT
python3 - "$DETAIL" > "$TMP" <<'PY'
import json, sys
print(json.dumps(json.load(open(sys.argv[1], encoding="utf-8")),
                 ensure_ascii=False, sort_keys=True, separators=(",", ":")), end="")
PY
npx vercel env rm FLEET_DAILY_DETAIL_JSON production --yes
npx vercel env add FLEET_DAILY_DETAIL_JSON production --sensitive < "$TMP"

# ④ 재배포 — env 는 새 배포에만 반영된다
URL="$(npx vercel ls tuna-dashboard --prod 2>&1 \
  | grep -o 'https://tuna-dashboard-[a-z0-9]*-cutekorea-3280s-projects.vercel.app' | head -1)"
[ -n "$URL" ] || { echo "❌ 프로덕션 배포 URL 을 찾지 못했습니다 — 수동 재배포 필요"; exit 1; }
echo "재배포: $URL"
npx vercel redeploy "$URL"

echo
echo "⑤ 남은 확인: https://leedonggun.co.kr/fleet 에서 「선박 상세 데이터가 공개 집계와 맞지 않습니다」가 사라졌는지 볼 것."
