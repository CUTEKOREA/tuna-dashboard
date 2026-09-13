#!/usr/bin/env python3
"""마루 업소조회 내려받기 → 페루 제조소 등록 상태 스냅숏.

`public/data/squid_peru_supply_v1.json` 의 공장 14곳에 식약처 해외제조업소 등록 상태를 붙인다.
보고서 데이터에는 신고 건수·능력·직원은 있어도 **등록이 살아 있는지**가 없었다.

내려받기는 브라우저로 한다(로그인 불필요). 절차는 silla-mcp `docs/maru-runbook.md`.
  국가 = 페루, 식품종류는 비운 채 조회 → 엑셀다운로드

    python3 scripts/sync_maru_registry_status.py ~/Downloads/해외제조업소*.xlsx

보고서는 약칭(`MIK CARPE`)을, 등록부는 정식명(`MIK CARPE S.A.C.`)을 쓴다. 그래서 **접두 일치**로 잇되
후보가 여러 갈래면 붙이지 않고 `모호` 로 남긴다 — 엉뚱한 회사의 등록정보를 붙이는 쪽이 더 나쁘다.
"""
from __future__ import annotations

import json
import re
import sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SUPPLY = ROOT / "public/data/squid_peru_supply_v1.json"
OUT = ROOT / "public/data/maru_registry_status_v1.json"

# 파서 파일만 직접 읽는다. 패키지로 import 하면 __init__ 이 MCP SDK 를 끌어와 여기서는 실패한다.
import importlib.util  # noqa: E402

MARU_PY = Path.home() / "silla-mcp/packages/trade-fishery/src/silla_mcp/trade_fishery/maru.py"
if not MARU_PY.is_file():
    print(f"파서를 못 찾았다: {MARU_PY} — silla-mcp 저장소가 있어야 한다", file=sys.stderr)
    raise SystemExit(2)
_spec = importlib.util.spec_from_file_location("maru", MARU_PY)
maru = importlib.util.module_from_spec(_spec)
# dataclass 가 자기 모듈을 sys.modules 에서 찾는다. 먼저 등록하지 않으면 exec 중에 터진다.
sys.modules["maru"] = maru
_spec.loader.exec_module(maru)

# 등록부가 「기한 없음」을 이 날짜로 적는다. 유효로 읽되 화면에는 날짜를 보여주지 않는다.
SENTINEL = "9999-12-31"


def status_for(plant: str, index: list[tuple[str, dict]]) -> dict:
    key = maru.normalize_name(plant)
    hits = [row for norm, row in index if norm.startswith(key)]
    if not hits:
        return {"상태": "등록부에 없음", "만료일": None, "등록줄": 0, "등록명": None}

    names = {row["maker"] for row in hits}
    # 접두가 여러 회사에 걸리면(예: 「PESQUERA」) 붙이지 않는다.
    stems = {re.sub(r"(SAC|SA|EIRL|SRL)$", "", maru.normalize_name(n)) for n in names}
    if len(stems) > 1:
        return {"상태": "모호", "만료일": None, "등록줄": len(hits), "등록명": sorted(names)[:3]}

    today = date.today().isoformat()
    live = [r for r in hits if not r["expires_on"] or r["expires_on"] >= today]
    lapsed = [r for r in hits if r["expires_on"] and r["expires_on"] < today]
    # 지난 날짜와 앞으로의 기한을 한 칸에 섞지 않는다. 섞으면 「1줄 만료(최근 2028-10-24)」 같은 말이 나온다.
    lapsed_dates = sorted(r["expires_on"] for r in lapsed)
    upcoming = sorted(r["expires_on"] for r in live if r["expires_on"] and r["expires_on"] != SENTINEL)
    return {
        "상태": "유효" if live else "만료",
        "만료일": lapsed_dates[-1] if lapsed_dates else None,
        "유효기한": upcoming[0] if upcoming else None,
        "등록줄": len(hits),
        "만료된줄": len(lapsed),
        "등록명": sorted(names)[0],
    }


def main(paths: list[str]) -> int:
    rows: list[dict] = []
    for path in paths:
        rows += [r for r in maru.parse(path) if r["country"] == "페루"]
    if not rows:
        print("페루 행이 없다. 국가=페루로 받은 파일인지 확인한다.", file=sys.stderr)
        return 1
    index = [(maru.normalize_name(r["maker"]), r) for r in rows]

    plants = json.loads(SUPPLY.read_text(encoding="utf-8"))["공장"]
    out = {
        "_meta": {
            "출처": "식품의약품안전처 수입식품정보마루 해외제조업소 조회(국가=페루, 로그인 불필요)",
            "조회일": date.today().isoformat(),
            "등록부_행수": len(rows),
            "대조": "보고서 약칭 → 등록부 정식명 접두 일치. 후보가 갈리면 「모호」로 남긴다",
            "주의": "「만료」는 등록 만료일이 지났다는 뜻이지 위법이라는 뜻이 아니다. 갱신이 반영되기 전일 수 있다",
        },
        "공장": {p["공장"]: status_for(p["공장"], index) for p in plants},
    }
    OUT.write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    got = sum(1 for v in out["공장"].values() if v["상태"] in {"유효", "만료"})
    expired = sum(1 for v in out["공장"].values() if v["상태"] == "만료")
    print(f"{OUT.relative_to(ROOT)} — 공장 {len(plants)}곳 중 대조 {got}곳 · 만료 {expired}곳")
    return 0


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(__doc__, file=sys.stderr)
        raise SystemExit(2)
    raise SystemExit(main(sys.argv[1:]))
