#!/usr/bin/env python3
"""중서부태평양수산위원회 어선기록부에서 선박별 소유사를 받아 온다.

목록 표에는 소유사가 없고 **선박별 상세 페이지에만** 있다. 목록은 브라우저로 훑어
`WCPFC_list_2026-08-17.json` 으로 뽑아 뒀고, 이 스크립트는 그 목록의 상세를 받는다.

⚠ 브라우저 자동화로 하지 않는 이유
  상세 한 장이 130KB 다. 3,039척이면 400MB 인데, 브라우저 원격제어(CDP)는 호출 하나가
  120초에서 끊겨 수십 번으로 쪼개야 한다. 이 페이지는 **로그인이 필요 없어** 그냥 받으면 된다.

⚠ 서버를 밀어붙이면 오히려 느려진다
  동시 20으로 올렸더니 단건 응답이 218ms 에서 466ms 로 늘고 배치가 통째로 멈췄다.
  동시 6 에 요청 사이 간격을 두는 편이 결과적으로 빠르다.

사용법:
    python3 scripts/fetch_wcpfc_owners.py            # 전체
    python3 scripts/fetch_wcpfc_owners.py --limit 50 # 맛보기
"""
from __future__ import annotations

import argparse
import concurrent.futures
import json
import re
import time
import urllib.error
import urllib.request
from pathlib import Path

BASE = "https://vessels.wcpfc.int"
UA = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/131.0 Safari/537.36"
)
ARCHIVE = Path(
    "/Users/idong-geon/Library/CloudStorage/GoogleDrive-cutekorea@gmail.com/내 드라이브"
    "/agri_data/01_수산물(Seafood)/tuna/00_참치_관련자료/00_참치_자원·조업관리"
    "/RFMO_선박등록부/2026-08-17"
)
LIST_PATH = ARCHIVE / "WCPFC_list_2026-08-17.json"
OUT_PATH = ARCHIVE / "WCPFC_RFV_all_2026-08-17.json"

OWNER_RE = re.compile(r'vessel-version__vsl-owner-name[\s\S]{0,400}?field__item">([^<]*)<')
ADDR_RE = re.compile(r'vessel-version__vsl-owner-address[\s\S]{0,400}?field__item">([^<]*)<')


def labeled(html: str, label: str) -> str:
    m = re.search(rf'{re.escape(label)}<span[\s\S]{{0,200}}?field__item">([^<]*)<', html)
    return m.group(1).strip() if m else ""


def fetch(vid: str, retries: int = 3) -> str:
    url = f"{BASE}/vessel/{vid}"
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=30) as resp:
                return resp.read().decode("utf-8", "replace")
        except (urllib.error.URLError, TimeoutError, OSError):
            if attempt == retries - 1:
                return ""
            time.sleep(1.5 * (attempt + 1))
    return ""


def one(row: dict) -> dict:
    html = fetch(row["vid"])
    if not html:
        return {**row, "owner": "", "err": "fetch 실패"}
    owner = OWNER_RE.search(html)
    addr = ADDR_RE.search(html)
    return {
        **row,
        "owner": owner.group(1).strip() if owner else "",
        "ownerAddr": addr.group(1).strip() if addr else "",
        "gear": labeled(html, "Gear Type"),
        "tonnage": labeled(html, "Tonnage"),
        "built": labeled(html, "Built in Year"),
        "port": labeled(html, "Port of Registry"),
    }


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--limit", type=int, default=0)
    ap.add_argument("--workers", type=int, default=6)
    args = ap.parse_args()

    if not LIST_PATH.exists():
        raise SystemExit(f"목록이 없다: {LIST_PATH}")
    rows = json.loads(LIST_PATH.read_text(encoding="utf-8"))
    if args.limit:
        rows = rows[: args.limit]

    started = time.time()
    out: list[dict] = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=args.workers) as pool:
        for i, result in enumerate(pool.map(one, rows), 1):
            out.append(result)
            if i % 200 == 0:
                got = sum(1 for r in out if r.get("owner"))
                print(f"   {i:>5,}/{len(rows):,}  소유사 {got:,}  ({time.time()-started:.0f}s)", flush=True)

    got = sum(1 for r in out if r.get("owner"))
    fails = [r for r in out if r.get("err")]

    # 선적별 소유사 표기율 — 기구가 아니라 **나라**가 공개 수준을 정한다
    by_flag: dict[str, dict[str, int]] = {}
    for r in out:
        f = by_flag.setdefault(r.get("flag", "미상"), {"척수": 0, "소유사": 0})
        f["척수"] += 1
        if r.get("owner"):
            f["소유사"] += 1

    OUT_PATH.write_text(
        json.dumps(
            {
                "collected": "2026-08-17",
                "source": "WCPFC Record of Fishing Vessels — vessels.wcpfc.int/vessel/<VID> (공개 열람)",
                "scope": "all flags",
                "total": len(out),
                "withOwner": got,
                "note": (
                    "목록 표에는 소유사가 없어 선박별 상세를 하나씩 받았다. "
                    "소유사 표기율은 선적국마다 크게 다르다 — 원양 선단을 가진 나라는 높고 "
                    "연안 소형선이 많은 나라는 낮다."
                ),
                "byFlag": dict(sorted(by_flag.items(), key=lambda kv: -kv[1]["척수"])),
                "vessels": out,
            },
            ensure_ascii=False,
            indent=1,
        ),
        encoding="utf-8",
    )
    print(f"✅ {OUT_PATH}")
    print(f"   {len(out):,}척 · 소유사 {got:,} ({got/len(out)*100:.1f}%) · 실패 {len(fails)} · {time.time()-started:.0f}초")


if __name__ == "__main__":
    main()
