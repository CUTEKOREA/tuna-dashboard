#!/usr/bin/env python3
"""태평양(서·중부) 참치 운반선 선단을 WCPFC 인가 등록부에서 집계한다.

환적 단계(03)는 밸류체인에서 가장 안 보이는 구간이다. 등록부에는 이 구간을 움직이는
배가 그대로 실려 있다 — 선종 FISH CARRIER 로 표시된 운반선과 그 소유사.

⚠ 이 집계는 **서·중부태평양 한 기구**의 인가 목록이다. 동태평양(IATTC)은 운반선을
  어선 등록부(RVR)와 분리된 별도 목록으로 관리해 여기 포함되지 않는다.
  「태평양 전체」로 읽지 마라 — 다만 참치 환적의 대부분은 서·중부에서 일어난다.

⚠ 개인 이름으로 등록된 소유주는 「개인 소유」로 묶는다. 원표기를 남기지 않는다
  (build_tuna_ocean_operators.py 와 같은 규율).

원본: WCPFC Record of Fishing Vessels (2026-08-17 수집, 아카이브 보관)

사용법:
    python3 scripts/build_tuna_carrier_fleet.py
"""
from __future__ import annotations

import collections
import json
import re
from pathlib import Path

SRC = Path(
    "/Users/idong-geon/Library/CloudStorage/GoogleDrive-cutekorea@gmail.com/내 드라이브"
    "/agri_data/01_수산물(Seafood)/tuna/00_참치_관련자료/00_참치_자원·조업관리"
    "/RFMO_선박등록부/2026-08-17/WCPFC_RFV_all_2026-08-17.json"
)
OUT = Path(__file__).resolve().parent.parent / "public/data/tuna_carrier_fleet_v1.json"

FLAG_KO = {
    "Philippines": "필리핀", "Panama": "파나마", "Japan": "일본",
    "Korea (Republic of)": "대한민국", "China": "중국", "Bahamas": "바하마",
    "Indonesia": "인도네시아", "Chinese Taipei": "대만", "Vanuatu": "바누아투",
    "Thailand": "태국", "Singapore": "싱가포르", "Liberia": "라이베리아",
    "Kiribati": "키리바시", "Vietnam": "베트남", "United States of America": "미국",
}

# build_tuna_ocean_operators.py 와 같은 판별 규율 (최소 복제)
CORPORATE_MARKS = (
    "LTD", "LIMITED", "INC", "CORP", "COMPANY", "CO.", "S.A", "SA DE CV", "GMBH",
    "KAISHA", "KAISYA", "GAISHA", "KABUSHIKI", "GYOGYO", "SUISAN", "SHIPPING",
    "FISHERY", "FISHERIES", "FISHING", "PT.", "PT ", "AS", "A/S", "LLC", "VENTURES",
    "CORPORATION", "INDUSTRIAL", "INTERNATIONAL", "MARINE", "ENTERPRISES",
)
PERSON_COMMA = re.compile(r"^[A-Z][A-Za-z'’\-]+,\s*[A-Z][A-Za-z'’\- ]+$")
PERSON_INITIAL = re.compile(r"^[A-Z][a-zA-Z'’\-]+\s+[A-Z]\.\s+[A-Z][a-zA-Z'’\-]+$")


def is_individual(name: str) -> bool:
    text = (name or "").strip()
    if not text:
        return False
    if any(mark in text.upper() for mark in CORPORATE_MARKS):
        return False
    return bool(PERSON_COMMA.match(text) or PERSON_INITIAL.match(text))


def normalize(name: str) -> str:
    text = (name or "").strip().upper()
    text = text.replace("&AMP;", "&")
    text = re.sub(r"[.,'’]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    # 같은 회사의 표기 흔들림(SEIN SHIPPING CO , LTD / CO LTD)을 하나로
    text = re.sub(r"\bCO\s*LTD\b", "CO LTD", text)
    return text


def main() -> None:
    if not SRC.exists():
        raise SystemExit(f"원본을 찾을 수 없다: {SRC}")
    doc = json.loads(SRC.read_text(encoding="utf-8"))
    rows = doc.get("vessels") or []
    if not rows:
        raise SystemExit("등록부 vessels 가 비어 있다")

    carriers = [r for r in rows if "CARRIER" in (r.get("type") or "").upper()]
    if len(carriers) < 200:
        raise SystemExit(f"운반선이 {len(carriers)}척뿐이다 — 선종 표기가 바뀌었는지 원본을 확인하라")

    by_flag = collections.Counter(FLAG_KO.get(r.get("flag", ""), r.get("flag", "")) for r in carriers)

    owners: dict[str, dict] = {}
    individual = 0
    for r in carriers:
        raw = (r.get("owner") or "").strip()
        if not raw:
            continue
        if is_individual(raw):
            individual += 1
            continue
        key = normalize(raw)
        entry = owners.setdefault(key, {"표기": raw, "척수": 0, "국적": collections.Counter()})
        entry["척수"] += 1
        entry["국적"][FLAG_KO.get(r.get("flag", ""), r.get("flag", ""))] += 1

    top = sorted(owners.values(), key=lambda e: -e["척수"])[:12]

    payload = {
        "_meta": {
            "생성일": "2026-08-17",
            "출처": "WCPFC 인가 선박 등록부 (선종 FISH CARRIER)",
            "등급": "A",
            "전체운반선": len(carriers),
            "범위": (
                "서·중부태평양 한 기구의 인가 목록이다. 동태평양(IATTC)은 운반선을 별도 목록으로 "
                "관리해 여기 없다. 참치 환적의 대부분이 서·중부에서 일어나므로 대표성은 있으나 "
                "「태평양 전체」 집계는 아니다."
            ),
            "개인소유": individual,
            "갱신방법": "python3 scripts/build_tuna_carrier_fleet.py",
        },
        "국적별": [
            {"국적": k, "척수": n} for k, n in by_flag.most_common(10)
        ],
        "소유사상위": [
            {
                "회사": e["표기"].replace("&AMP;", "&"),
                "척수": e["척수"],
                "주국적": e["국적"].most_common(1)[0][0],
            }
            for e in top
        ],
    }
    OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"✅ {OUT}")
    print(f"   운반선 {len(carriers)}척 · 소유사 {len(owners)}곳 · 개인 소유 {individual}척")
    print("   상위: " + " · ".join(f"{e['표기'][:20]} {e['척수']}" for e in top[:5]))


if __name__ == "__main__":
    main()
