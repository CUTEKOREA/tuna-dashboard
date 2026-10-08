#!/usr/bin/env bash
# FLEET_PORT_SCHEDULE_JSON 등록 — 「선박 입항일정 및 선원 교대/선박 수리 계획」(보호 경로 /api/fleet/schedule).
#
# 저장소가 공개라 일정 값은 git 에 두지 않는다. 원본은 artifacts/fleet-port-schedule.json(gitignore)이고
# 프로덕션에는 이 env 로만 들어간다. Vercel env 는 새 배포에만 반영된다:
#   - 코드 병합 «전»에 등록하면 병합 배포가 바로 읽는다(재배포 불필요)
#   - 일정만 바꿀 때는 등록 후 --redeploy
#
#   bash scripts/set_fleet_port_schedule_secret.sh --check      # 검사만
#   bash scripts/set_fleet_port_schedule_secret.sh              # 검사 → 등록
#   bash scripts/set_fleet_port_schedule_secret.sh --redeploy   # 검사 → 등록 → 현재 프로덕션 재배포
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC="$ROOT/artifacts/fleet-port-schedule.json"
[ -f "$SRC" ] || { echo "❌ 원본이 없습니다: $SRC"; exit 1; }

TMP="$(mktemp)"; trap 'rm -f "$TMP"' EXIT
python3 - "$SRC" > "$TMP" <<'PY'
import json, re, sys
d = json.load(open(sys.argv[1], encoding="utf-8"))
assert set(d) == {"asOf", "printedDate", "source", "rows"}, "최상위 키가 계약과 다르다"
role = re.compile(r"^[가-힣0-9\s()·,/]+$")
for r in d["rows"]:
    for k in ("crewOn", "crewOff"):
        for x in r[k]:
            assert role.match(x), f"{r['vessel']} {k} 에 직책 외 문자열: {x!r}"
out = json.dumps(d, ensure_ascii=False, separators=(",", ":"))
assert len(out.encode()) < 32 * 1024, "32KB 초과"
print(out, end="")
PY
echo "✅ 검사 통과 ($(wc -c < "$TMP") bytes, 선박 $(python3 -c "import json,sys;print(len(json.load(open('$SRC'))['rows']))")척)"
[ "${1:-}" = "--check" ] && exit 0

npx vercel env rm FLEET_PORT_SCHEDULE_JSON production --yes >/dev/null 2>&1 || true
npx vercel env add FLEET_PORT_SCHEDULE_JSON production --sensitive < "$TMP"

if [ "${1:-}" = "--redeploy" ]; then
  URL="$(npx vercel ls tuna-dashboard --prod 2>&1 \
    | grep -o 'https://tuna-dashboard-[a-z0-9]*-cutekorea-3280s-projects.vercel.app' | head -1)"
  [ -n "$URL" ] || { echo "❌ 프로덕션 배포 URL 을 찾지 못했습니다"; exit 1; }
  npx vercel redeploy "$URL"
fi
echo "남은 확인: https://leedonggun.co.kr/fleet → 선박·수역 탭 「입항 일정 · 선원 교대 · 수리 계획」"
