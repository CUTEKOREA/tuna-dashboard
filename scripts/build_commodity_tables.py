#!/usr/bin/env python3
"""품목 산업해부 보고서의 표 전량 → `lib/data/<품목>-tables.json`.

기업 편은 `build_report_tables.py` 가 같은 일을 한다. 품목 편은 두 가지가 달라
따로 둔다.

1. **보고서 절 번호가 대시보드 단계와 1:1 이 아니다.** 기업 편은 절이 곧 단계인데
   품목 편은 보고서 16장을 대시보드 8~9단계에 눌러 담는다. 그 배치는 사람이 정한다.
2. **표에 캡션이 없는 품목이 있다.** 참치 양식 편은 `<caption>` 을 쓰고 명태 편은
   안 쓴다. 그래서 제목은 `report_tables.Table.title()` 의 폴백에 맡긴다 —
   표 바로 앞 소제목이 있으면 그것, 없으면 헤더 서명이다.

사람이 정하는 것은 **절→단계 배치**와 **제외 목록** 둘뿐이고, 표의 내용은 원문에서
그대로 읽는다. 옮겨 적지 않으므로 자릿수를 틀릴 자리가 없다.

    python3 scripts/build_commodity_tables.py pollock <보고서.html>

검사: 단계별 표 개수를 화면에 찍는다. 원문이 개정돼 표가 늘거나 줄면 눈에 띈다.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from report_tables import Table, parse  # noqa: E402

ROOT = Path(__file__).resolve().parents[1]

# 품목별 절→단계 배치. 보고서 절 번호(sid 의 뒤 두 자리)를 대시보드 단계 키로 옮긴다.
# 한 단계에 여러 절이 붙는다. 여기 없는 절의 표는 버린다 — 부록·출처가 그렇다.
LAYOUT: dict[str, dict[str, str]] = {
    "pollock": {
        "02": "s01",  # 왜 이 구조가 됐나 → 자원
        "05": "s01",  # 자원
        "07": "s02",  # 원양 세 척
        "03": "s03",  # 2022년의 산과 그 뒤의 시장
        "04": "s03",  # 러시아산 원물과 미국산 연육
        "06": "s04",  # 수입 명의
        "08": "s05",  # 가공 1,740곳
        "09": "s05",  # 품목별 가공 지도
        "10": "s05",  # 가공 업체 순위
        "11": "s06",  # 겹치는 42곳
        "12": "s08",  # 재무
        "13": "s07",  # 값
        "14": "s07",  # 제도 — 명태 대시보드는 8단계라 값 단계에 붙인다
    },
}

# 화면에 낼 값이 없거나 이미 손으로 만든 차트와 겹치는 표. 헤더 서명으로 지목한다.
EXCLUDE: dict[str, list[tuple[str, ...]]] = {
    "pollock": [
        ("순", "업체", "2023"),  # 상위 100 업체 — 100행이라 화면에 안 맞는다
    ],
}


def _excluded(t: Table, rules: list[tuple[str, ...]]) -> bool:
    joined = " | ".join(t.head)
    return any(all(s in joined for s in sig) for sig in rules)


def build(commodity: str, src: Path) -> dict:
    layout = LAYOUT[commodity]
    exclude = EXCLUDE.get(commodity, [])
    tables = parse(src.read_text(encoding="utf-8"))

    out: dict[str, dict] = {}
    dropped_sec: dict[str, int] = {}
    dropped_ex = 0
    for t in tables:
        sec = t.sid.removeprefix("s") if t.sid.startswith("s") else t.sid
        stage = layout.get(sec)
        if stage is None:
            dropped_sec[sec] = dropped_sec.get(sec, 0) + 1
            continue
        if _excluded(t, exclude):
            dropped_ex += 1
            continue
        out.setdefault(stage, {"tables": []})["tables"].append(t.as_json())

    print(f"{commodity}: 표 {len(tables)}개 파싱")
    for stage in sorted(out):
        n = len(out[stage]["tables"])
        print(f"  {stage}  표 {n:2d}")
    if dropped_sec:
        print(f"  배치 없는 절에서 버린 표: {dropped_sec}")
    if dropped_ex:
        print(f"  제외 목록으로 버린 표: {dropped_ex}")
    return out


def main() -> int:
    if len(sys.argv) < 3:
        print(__doc__)
        return 2
    commodity, src = sys.argv[1], Path(sys.argv[2])
    if commodity not in LAYOUT:
        print(f"배치가 없는 품목이다: {commodity}. LAYOUT 에 추가하라.")
        return 2
    if not src.exists():
        print(f"보고서가 없다: {src}")
        return 2
    data = build(commodity, src)
    dst = ROOT / f"lib/data/{commodity}-tables.json"
    dst.write_text(json.dumps(data, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(f"→ {dst.relative_to(ROOT)}  {dst.stat().st_size:,} bytes")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
