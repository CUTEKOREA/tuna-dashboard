#!/usr/bin/env python3
"""오징어 주 어장(남태평양 공해)의 인가 선단을 선적국·어법으로 집계한다.

참치는 다섯 기구 등록부에서 **선사 이름**까지 뽑았다. 오징어는 그게 안 된다.

⚠ **남태평양 공해 관리기구는 소유사를 공개하지 않는다.**
  목록에도, 선박 상세 페이지에도 소유사 항목이 아예 없다. 선명·선적·제원·인가기간까지가 전부다.
  그래서 이 품목은 「해역별 선사」를 낼 수 없고 **선적국까지가 한계**다.
  선사 단위가 필요하면 한국원양산업협회 통계연보(국적선 한정)를 봐야 한다 — 그건 이미 페이지에 있다.

⚠ 채낚기(지거)선은 어법 코드로 바로 잡히지 않는다.
  등록부에 「jigger」라는 말이 없다. 오징어 채낚기는 선종 07.1.0(손줄낚시)과
  어법 09.1.0/09.2.0(손줄·장대낚시)의 조합으로 등록된다. 이 조합으로 센다.

원본: 남태평양 공해 관리기구 공개 선박등록부 (2026-08-17 내려받음)

사용법:
    python3 scripts/build_squid_ocean_fleet.py
"""
from __future__ import annotations

import collections
import csv
import json
from pathlib import Path

SRC = Path(
    "/Users/idong-geon/Library/CloudStorage/GoogleDrive-cutekorea@gmail.com/내 드라이브"
    "/agri_data/01_수산물(Seafood)/squid/00_오징어_관련자료/01_생산·자원"
    "/SPRFMO_ROV/2026-08-17/SPRFMO_ROV_all_2026-08-17.csv"
)
OUT_PATH = Path(__file__).resolve().parent.parent / "public/data/squid_ocean_fleet_v1.json"

FLAG_KO = {
    "PER": "페루", "CHN": "중국", "CHL": "칠레", "KOR": "대한민국", "PAN": "파나마",
    "TWN": "대만", "VUT": "바누아투", "LBR": "라이베리아", "AUS": "호주", "COK": "쿡제도",
    "NZL": "뉴질랜드", "ECU": "에콰도르", "RUS": "러시아", "CUW": "퀴라소", "BLZ": "벨리즈",
    "USA": "미국", "JPN": "일본", "ESP": "스페인", "FSM": "미크로네시아", "KIR": "키리바시",
}

# 선종 코드 앞자리로 성격을 가른다. 채낚기는 07(낚시류)에 들어간다.
TYPE_KO = {
    "07": "낚시류(채낚기 포함)",
    "02": "선망류",
    "12": "운반선",
    "01": "두릿그물류",
    "03": "트롤류",
    "49": "미분류",
}


def ko_flag(code: str) -> str:
    code = (code or "").strip()
    return FLAG_KO.get(code, code)


def type_group(value: str) -> str:
    head = (value or "").strip()[:2]
    return TYPE_KO.get(head, "그 밖")


def is_jigger(row: dict) -> bool:
    """오징어 채낚기(지거) — 등록부에 그 이름이 없어 조합으로 잡는다."""
    vtype = (row.get("Vessel Type") or "")
    gear = (row.get("Fishing Methods") or "")
    return vtype.startswith("07") and (gear.startswith("09.1") or gear.startswith("09.2"))


def main() -> None:
    if not SRC.exists():
        raise SystemExit(f"원본을 찾을 수 없다: {SRC}\n아카이브 README 의 수집 방법을 보라.")
    rows = list(csv.DictReader(open(SRC, encoding="utf-8-sig", errors="replace")))
    if not rows:
        raise SystemExit("원본이 비어 있다")

    # 소유사 컬럼이 생기면 이 검사가 알려 준다 — 그때는 참치처럼 선사까지 낼 수 있다
    owner_cols = [c for c in rows[0] if "own" in c.lower() or "operat" in c.lower()]
    if owner_cols:
        raise SystemExit(
            f"등록부에 소유사 컬럼이 생겼다: {owner_cols}\n"
            "참치처럼 선사 단위 집계가 가능해졌으니 이 스크립트를 고쳐라."
        )

    jig = [r for r in rows if is_jigger(r)]

    def by_flag(subset: list[dict]) -> list[dict]:
        counter = collections.Counter(ko_flag(r["Vessel Flag"]) for r in subset)
        total = sum(counter.values()) or 1
        return [
            {"선적": name, "척수": n, "비중": round(n / total * 100, 2)}
            for name, n in counter.most_common(12)
        ]

    tonnage: dict[str, list[float]] = collections.defaultdict(list)
    for r in jig:
        try:
            gt = float(r.get("Gross Tonnage") or 0)
        except ValueError:
            continue
        if gt > 0:
            tonnage[ko_flag(r["Vessel Flag"])].append(gt)
    size_rows = [
        {
            "선적": name,
            "척수": len(vals),
            "평균톤수": round(sum(vals) / len(vals), 1),
            "합계톤수": round(sum(vals)),
        }
        for name, vals in sorted(tonnage.items(), key=lambda kv: -len(kv[1]))[:10]
    ]

    payload = {
        "_meta": {
            "생성일": "2026-08-17",
            "해역": "남태평양 공해",
            "출처": "남태평양 공해 관리기구 공개 선박등록부",
            "등급": "A",
            "전체척수": len(rows),
            "채낚기추정": len(jig),
            "소유사없음": (
                "이 등록부는 **소유사를 공개하지 않는다.** 목록에도 선박 상세에도 항목이 없다. "
                "참치의 다섯 기구가 모두 소유사를 싣는 것과 달라, 오징어는 「해역별 선사」를 낼 수 없고 "
                "선적국까지가 한계다. 선사 단위는 한국원양산업협회 통계연보(국적선 한정)를 봐야 한다."
            ),
            "채낚기판정": (
                "등록부에 「채낚기」나 「지거」라는 말이 없다. 선종 07(낚시류)과 "
                "어법 09.1·09.2(손줄·장대낚시)의 조합으로 센 추정치다."
            ),
            "갱신방법": "python3 scripts/build_squid_ocean_fleet.py",
        },
        "전체선적": by_flag(rows),
        "채낚기선적": by_flag(jig),
        "채낚기톤급": size_rows,
        "선종구성": [
            {"선종": name, "척수": n}
            for name, n in collections.Counter(type_group(r["Vessel Type"]) for r in rows).most_common()
        ],
    }

    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUT_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"✅ {OUT_PATH}")
    print(f"   전체 {len(rows):,}척 · 채낚기 추정 {len(jig):,}척")
    print("   채낚기 선적: " + " · ".join(f"{r['선적']} {r['척수']}" for r in payload["채낚기선적"][:6]))
    kr = next((r for r in payload["채낚기톤급"] if r["선적"] == "대한민국"), None)
    if kr:
        print(f"   한국 채낚기 {kr['척수']}척 · 평균 {kr['평균톤수']}톤")


if __name__ == "__main__":
    main()
