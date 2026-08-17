#!/bin/bash
# 로컬 아카이브 기준 데이터 재생성 일괄 실행.
#
# 이 스크립트는 **수집을 하지 않는다** — 아카이브(Google Drive)에 이미 받아 둔
# 원자료로 public/data/*.json 을 다시 만들 뿐이다. 원자료 재수집(관세청 XML,
# 등록부, FAO)은 docs/runbook_data_refresh.md 의 수동 절차를 먼저 밟아야 한다.
#
# 사용법:  bash scripts/refresh_local.sh          # 재생성 + verify
#          bash scripts/refresh_local.sh --no-verify
set -euo pipefail
cd "$(dirname "$0")/.."

BUILDERS=(
  # 연보 (연 1회 — 새 연보 전사 후)
  scripts/build_kofa_fleet.py
  scripts/build_kofa_insights.py
  scripts/build_kofa_series.py
  # 등록부 (분기 — 아카이브 재수집 후)
  scripts/build_tuna_ocean_operators.py
  scripts/build_tuna_carrier_fleet.py
  scripts/build_fleet_db.py
  scripts/build_purse_seiner_data.py
  scripts/build_squid_ocean_fleet.py
  # 관세청·FAO 파생 (월/연)
  scripts/fix_whelk_legacy_series.py
  # 큐레이션 (원본 위젯 번들 변경 시)
  scripts/curate_tuna_industry_widgets.py
  scripts/curate_squid_industry_widgets.py
)

failed=()
for builder in "${BUILDERS[@]}"; do
  echo "── python3 $builder"
  if ! python3 "$builder"; then
    failed+=("$builder")
    echo "❌ $builder 실패 — 게이트가 잡았다. 원자료를 확인하라."
  fi
done

if [ ${#failed[@]} -gt 0 ]; then
  echo ""
  echo "실패 ${#failed[@]}건: ${failed[*]}"
  exit 1
fi

if [ "${1:-}" != "--no-verify" ]; then
  echo "── npm run verify"
  npm run verify
fi

echo "✅ 재생성 완료. git diff 로 변화를 검토한 뒤 커밋하라 — 자동 커밋은 하지 않는다."
