#!/usr/bin/env python3
"""`FalklandSquidDashboard.tsx` 안에 박힌 선박별 실적 → `public/data/`.

원본은 신라교역 사내 자료(포클랜드 수역 오징어 조업선 실적)이고, 773줄짜리 컴포넌트
안에 JSON 리터럴로 들어 있었다. 위젯이 데이터를 직접 들고 있으면 갱신도 검증도 안 되고
아키텍처 가드(ADR 0005 — 위젯은 lib/data/ 경유)에도 어긋난다.

이 스크립트는 **한 번 옮기기 위한 것**이다. 옮기고 나면 원본은 인테이크를 쓰므로
다시 돌릴 일이 없다 — 다만 다음 어기 자료가 같은 형태로 오면 그대로 쓴다.
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "components/FalklandSquidDashboard.tsx"
OUT = ROOT / "public/data/falkland_squid_vessels_v1.json"


def grab(name: str, text: str) -> list[dict]:
    """JSON 표기와 JS 객체 표기가 섞여 있다 — 한쪽은 키에 따옴표가 없다.

    JS 를 실행해 파싱하는 대신 따옴표만 붙여 JSON 으로 읽는다. 값에 콜론이 들어가면
    깨지므로, 줄머리의 식별자 뒤 콜론만 골라 바꾼다.
    """
    m = re.search(rf"const {name} = (\[.*?\n\]);", text, re.S)
    if not m:
        raise SystemExit(f"{name} 블록을 못 찾았다")
    # 키가 줄머리에 오기도 하고 `{ ` 뒤에 붙기도 한다. 앞이 여는 중괄호나 쉼표인
    # 식별자만 골라 따옴표를 씌운다 — 값 안의 콜론은 건드리지 않는다.
    body = re.sub(r'([{,]\s*)([A-Za-z_$][\w$]*)\s*:', r'\1"\2":', m.group(1))
    body = re.sub(r",(\s*[\]}])", r"\1", body)  # 후행 쉼표
    return json.loads(body)


def main() -> int:
    text = SRC.read_text(encoding="utf8")
    vessels = grab("vesselData", text)
    companies = grab("companyData", text)

    # 이 자료에는 **두 가지 중량**이 들어 있다.
    #   · 판(pan) × 20 = 명목 환산중량. 회사 집계가 이 방식으로 계산돼 있다.
    #   · totalKg      = 실중량. 30척 중 17척이 환산값과 다르다(세인9호 -16,360kg).
    # 처음엔 이 차이를 오류로 보고 검사가 막았는데, 둘 다 진짜 값이고 재는 것이 다르다.
    # 그래서 회사 집계는 **환산 기준으로** 대조하고, 실중량과의 차이는 따로 기록한다.
    nominal: dict[str, int] = {}
    actual: dict[str, int] = {}
    for v in vessels:
        nominal[v["company"]] = nominal.get(v["company"], 0) + v["totalPan"] * 20
        actual[v["company"]] = actual.get(v["company"], 0) + v["totalKg"]
    bad = [
        f"{c['name']}: 집계 {c['totalKg']:,} ≠ 환산합 {nominal.get(c['name'], 0):,}"
        for c in companies
        if nominal.get(c["name"]) != c["totalKg"]
    ]
    if bad:
        print("⚠ 회사 집계가 환산합과 어긋난다:", *bad, sep="\n  ", file=sys.stderr)
        return 1

    # 회사 집계에 빠진 회사가 있는지. 있으면 화면의 회사 표가 선단 전체를 못 담는다.
    missing = sorted(set(nominal) - {c["name"] for c in companies})
    if missing:
        print(f"⚠ 선박은 있는데 회사 집계에 없는 회사: {missing}", file=sys.stderr)

    # 월별 합이 누계와 맞는지. 표에서 옮겨 적을 때 한 칸 밀리면 여기서 걸린다.
    months = ("m12", "m1", "m2", "m3", "m4", "m5")
    off = [v["name"] for v in vessels if sum(v[m] for m in months) != v["totalPan"]]
    if off:
        print(f"⚠ 월별 합 ≠ 누계판: {off[:6]}", file=sys.stderr)
        return 1

    gap = sum(actual.values()) - sum(nominal.values())
    payload = {
        "_meta": {
            "출처": "신라교역 사내 자료 — 포클랜드 수역 오징어 조업선 실적",
            "성격": "선박별·회사별 조업실적. 공개 통계로는 이 층위가 나오지 않는다",
            "단위": (
                "누계수량은 판(pan). totalKg 는 실중량이고 판×20(명목 환산)과 다르다 — "
                "30척 중 17척에서 어긋나며 최대 -1.7%다. 회사 집계는 환산 기준으로 계산돼 있다."
            ),
            "기간": "12월~5월 어기",
            "척수": len(vessels),
            "회사수": len(companies),
            "측정경계": (
                "포클랜드 수역 한 어기의 실적이다. 해양수산부 원양어업통계조사의 "
                "오징어채낚기 연간 생산량(전 해역)과 범위가 달라 직접 견줄 수 없다."
            ),
            "실중량과환산차": gap,
            "갱신방법": "python3 scripts/extract_falkland_vessels.py",
        },
        "vessels": vessels,
        "companies": companies,
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=1), encoding="utf8")
    total = sum(v["totalKg"] for v in vessels)
    print(
        f"-> {OUT} ({OUT.stat().st_size // 1024}KB) · 선박 {len(vessels)}척 · "
        f"회사 {len(companies)}개 · 합계 {total / 1000:,.0f}톤",
        file=sys.stderr,
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
