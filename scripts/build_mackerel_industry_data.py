#!/usr/bin/env python3
"""고등어 밸류체인 집계 — 축은 **크기 등급**과 **국산 대 수입**이다.

참치는 어법(선망/연승)이, 오징어도 어법(채낚기/트롤)이 축이었다. 고등어는 다르다.
총허용어획량 배분이 2011~2024년 내내 **대형선망 하나뿐**이라 어법이 축이 될 수 없다.
같은 자료에서 오징어가 네 업종 914척으로 갈리는 것과 대조된다.

대신 두 축이 실측으로 잡힌다.
  1. **크기 등급** — 위판에서 상·중·하 단가가 2.8배 벌어지는데 물량의 85.7%가 「하」다.
  2. **국산 대 수입** — 노르웨이 의존도가 5년간 오히려 올랐다.

⚠ 이 품목의 함정 셋
  1. **필터본을 그대로 쓰면 안 된다.** "mackerel" 문자열로 넓게 잡은 파일에는
     전갱이·삼치·임연수어·인도고등어, 심지어 청상아리까지 섞인다.
     반드시 Scomber 속으로 재필터한다. FAO ASFIS 2026.1 기준 Scomber 는 SCOMBRIDAE,
     Decapterus(전갱이류)는 CARANGIDAE 로 다른 과다.
  2. **위판 자료의 「위판금액」은 총액이 아니라 원/kg 단가다.** 총액으로 읽으면
     단가가 0.1원/kg 같은 값이 나온다.
  3. **국산 등급(상·중·하)과 노르웨이 등급(600g 미만)은 다른 체계다.** 직접 비교할 수 없다.

사용법:
    python3 scripts/build_mackerel_industry_data.py
"""
from __future__ import annotations

import collections
import csv
import json
from pathlib import Path

BASE = Path(
    "/Users/idong-geon/Library/CloudStorage/GoogleDrive-cutekorea@gmail.com/내 드라이브"
    "/agri_data/01_수산물(Seafood)/mackerel"
)
FAO_KOREA = BASE / "6_고등어_플레이북/sales/kmong/data_pack/FAO_1995_2024_Korea_Scomber.csv"
KCS_YTD = BASE / "6_고등어_플레이북/sales/kmong/data_pack/KCS_2026M01_M05_mackerel_exact_hsk.csv"
WIPAN = BASE / "00_고등어_관련자료/03_무역·가격/wipan/2026-08-16/MOF_busan_fishmarket_wipan.csv"

OUT_PATH = Path(__file__).resolve().parent.parent / "public/data/mackerel_industry_v1.json"
MIN_EXPECTED_YEAR = 2024

# Scomber 속만. 이름에 mackerel 이 붙는다고 다 고등어가 아니다.
SPECIES_KO = {
    "MAS": "고등어",           # Scomber japonicus — 국산 주력
    "MAA": "망치고등어",        # Scomber australasicus
    "MAC": "대서양고등어",      # Scomber scombrus — 노르웨이산
    "MAZ": "고등어류 미분류",
}

AREA_KO = {
    "61": "북서태평양",
    "71": "중서태평양",
    "87": "남동태평양",
    "51": "서인도양",
    "77": "중동태평양",
    "41": "남서대서양",
}

COUNTRY_KO = {
    "노르웨이": "노르웨이",
    "중국": "중국",
    "네덜란드": "네덜란드",
    "베트남": "베트남",
    "태국": "태국",
    "일본": "일본",
    "영국": "영국",
    "아일랜드": "아일랜드",
}


def read_korea_catch() -> tuple[list[dict], list[dict], dict]:
    """한국 Scomber 어획 — 종별·해역별. 원양 비중이 얼마나 작은지 드러난다."""
    if not FAO_KOREA.exists():
        raise SystemExit(f"원본을 찾을 수 없다: {FAO_KOREA}")
    rows = [
        r
        for r in csv.DictReader(open(FAO_KOREA, encoding="utf-8-sig"))
        if r.get("MEASURE") == "Q_tlw" and (r.get("VALUE") or "").strip()
    ]
    years = sorted({int(r["PERIOD"]) for r in rows})
    latest = years[-1]
    if latest < MIN_EXPECTED_YEAR:
        raise SystemExit(f"원본이 낡았다: 최신 {latest} < {MIN_EXPECTED_YEAR}")

    # 종별 시계열
    ts: dict[int, dict[str, float]] = collections.defaultdict(dict)
    for r in rows:
        y = int(r["PERIOD"])
        ko = SPECIES_KO.get(r["SPECIES.ALPHA_3_CODE"], r["SPECIES.Name_En"])
        ts[y][ko] = ts[y].get(ko, 0) + float(r["VALUE"])
    timeline = [
        {"연도": str(y), **{k: round(v) for k, v in sorted(ts[y].items())}} for y in sorted(ts)
    ]

    # 최신연도 해역별 — 연근해와 원양을 가른다
    cur = [r for r in rows if int(r["PERIOD"]) == latest]
    area = collections.Counter()
    for r in cur:
        area[AREA_KO.get(r["AREA.CODE"], f"해역 {r['AREA.CODE']}")] += float(r["VALUE"])
    total = sum(area.values()) or 1
    areas = [
        {"해역": k, "어획량": round(v), "비중": round(v / total * 100, 2)}
        for k, v in area.most_common()
    ]

    meta = {
        "기준연도": latest,
        "출처": "FAO FishStat 2026.1.0 — 한국 Scomber 속 (1995~2024)",
        "등급": "A",
        "합계": round(total),
        "원양비중": round(
            sum(v for k, v in area.items() if k != "북서태평양") / total * 100, 2
        ),
        "주의": (
            "Scomber 속만 세었다. 「mackerel」 이름이 붙는다고 다 고등어가 아니다 — "
            "전갱이·삼치·임연수어가 같은 영문명을 쓴다."
        ),
    }
    return timeline, areas, meta


# ⚠ 「갈고등어」는 별개 어종이 아니라 **고등어의 최소 크기 등급**이다 (2026-08-17 정정).
#
#   처음에는 전갱이과 Decapterus muroadsi 의 표준국명이라는 이유로 뺐다. 그 표준국명 자체는
#   맞다 — 국가생물종목록이 그렇게 적는다. 그러나 **부산공동어시장 위판 통계의 그 항목은
#   그 물고기가 아니다.** 이 시장은 고등어를 소고·소소고·갈고 같은 크기 등급으로 나누고,
#   갈고등어는 대개 200g 이하 치어를 가리킨다. 국립수산과학원도 이 이름을 고등어 방언으로 싣는다.
#
#   빼고 세면 물량의 91%가 사라져 「최하 등급이 78%」라는 그림이 나온다. 실제로는
#   **갈고등어가 91%**이고 고등어 「하」는 7%다. 결론(대부분이 가장 싼 구간)은 같지만
#   숫자가 완전히 달라진다.
EXCLUDE_NAMES: set[str] = set()

# 크기 순서. 화면에서 작은 것부터 큰 것으로 세운다.
GRADE_ORDER = ["갈고등어", "고등어 하", "고등어 중", "고등어 상", "망치고등어"]


def read_wipan() -> tuple[list[dict], dict]:
    """부산 위판 — 등급별 물량과 단가. 「위판금액」은 총액이 아니라 원/kg 이다."""
    if not WIPAN.exists():
        return [], {}
    agg: dict[str, dict[str, float]] = collections.defaultdict(
        lambda: {"물량": 0.0, "단가합": 0.0, "건수": 0}
    )
    excluded: dict[str, float] = collections.defaultdict(float)
    dates: list[str] = []
    with open(WIPAN, encoding="euc-kr", errors="replace") as handle:
        for r in csv.DictReader(handle):
            name = (r.get("상품명") or "").strip()
            if "고등어" not in name:
                continue
            # 「갈고등어」는 이름에 고등어가 붙지만 전갱이과라 Scomber 속이 아니다.
            # 물량이 커서(위판 건수 1위) 넣으면 등급 구조가 통째로 왜곡된다.
            if name in EXCLUDE_NAMES:
                excluded[name] += float(r.get("위판중량") or 0)
                continue
            try:
                qty = float(r.get("위판중량") or 0)
                unit = float(r.get("위판금액") or 0)  # 원/kg
            except ValueError:
                continue
            if qty <= 0 or unit <= 0:
                continue
            day = (r.get("위판일자") or "").strip()
            if day:
                dates.append(day)
            e = agg[name]
            e["물량"] += qty
            e["단가합"] += unit * qty  # 물량가중
            e["건수"] += 1

    total_qty = sum(v["물량"] for v in agg.values()) or 1

    def order(name: str) -> int:
        return GRADE_ORDER.index(name) if name in GRADE_ORDER else len(GRADE_ORDER)

    rows = [
        {
            "등급": k,
            # 「갈고등어」는 시장 이름이라 무엇인지 함께 적는다
            "설명": "고등어 최소형 (대개 200g 이하)" if k == "갈고등어" else "",
            "물량": round(v["물량"]),
            "비중": round(v["물량"] / total_qty * 100, 2),
            "가중평균단가": round(v["단가합"] / v["물량"]),
            "건수": v["건수"],
        }
        for k, v in sorted(agg.items(), key=lambda kv: order(kv[0]))
    ]
    span = f"{min(dates)}~{max(dates)}" if dates else "구간 미상"
    meta = {
        "구간": span,
        "출처": f"해양수산부 부산 위판장 실적 ({span})",
        "등급": "A",
        "단위주의": (
            "원자료의 「위판금액」 컬럼은 총액이 아니라 **원/kg 단가**다. "
            "총액으로 읽으면 단가가 0.1원/kg 같은 값이 나온다."
        ),
        "체계주의": (
            "국산 등급(상·중·하)과 노르웨이 등급(600g 미만 등)은 서로 다른 체계라 "
            "직접 비교할 수 없다."
        ),
        "정정": (
            "「갈고등어」를 등급에 포함했다(2026-08-17). 처음에는 전갱이과 표준국명이라는 이유로 "
            "뺐으나, **부산공동어시장 위판 통계의 그 항목은 고등어의 최소 크기 등급**(대개 200g 이하)이다. "
            "이 시장은 고등어를 소고·소소고·갈고 같은 크기로 나누고 국립수산과학원도 이 이름을 "
            "고등어 방언으로 싣는다. 빼고 세면 물량의 91%가 사라진다."
        ),
    }
    return rows, meta


def read_imports() -> tuple[list[dict], dict]:
    """관세청 통관 — 원산지 구성. 노르웨이 의존도가 드러난다."""
    if not KCS_YTD.exists():
        return [], {}
    agg: dict[str, dict[str, float]] = collections.defaultdict(lambda: {"금액": 0.0, "물량": 0.0})
    with open(KCS_YTD, encoding="utf-8-sig") as handle:
        for r in csv.DictReader(handle):
            name = (r.get("statCdCntnKor1") or "").strip()
            if not name or name == "-":
                continue
            try:
                usd = float(r.get("impDlr") or 0)
                kg = float(r.get("impWgt") or 0)
            except ValueError:
                continue
            if usd <= 0:
                continue
            agg[name]["금액"] += usd
            agg[name]["물량"] += kg

    total = sum(v["금액"] for v in agg.values()) or 1
    rows = [
        {
            "원산지": COUNTRY_KO.get(k, k),
            "수입액": round(v["금액"] / 1e6, 2),
            "수입량": round(v["물량"] / 1000),
            "비중": round(v["금액"] / total * 100, 2),
            "단가": round(v["금액"] / (v["물량"] / 1000)) if v["물량"] else 0,
        }
        for k, v in sorted(agg.items(), key=lambda kv: -kv[1]["금액"])
    ][:10]
    meta = {
        "구간": "2026년 1~5월",
        "출처": "관세청 통관 (HSK 10자리 정확 일치)",
        "등급": "A",
        "합계": round(total / 1e6, 1),
    }
    return rows, meta


def main() -> None:
    timeline, areas, catch_meta = read_korea_catch()
    grades, wipan_meta = read_wipan()
    imports, import_meta = read_imports()

    payload = {
        "_meta": {
            "생성일": "2026-08-17",
            "주제": "고등어 — 크기 등급과 국산 대 수입",
            "축": (
                "어법은 축이 아니다. 총허용어획량 배분이 2011~2024년 내내 대형선망 "
                "하나뿐이다. 크기 등급과 원산지가 이 품목을 가른다."
            ),
            "갱신방법": "python3 scripts/build_mackerel_industry_data.py",
        },
        "한국어획": {"_meta": catch_meta, "시계열": timeline, "해역": areas},
        "위판등급": {"_meta": wipan_meta, "rows": grades},
        "수입원산지": {"_meta": import_meta, "rows": imports},
    }

    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUT_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"✅ {OUT_PATH} ({OUT_PATH.stat().st_size / 1024:,.0f} KB)")
    print(f"   한국 어획 {catch_meta['기준연도']}년 {catch_meta['합계']:,} t · 원양 비중 {catch_meta['원양비중']}%")
    if grades:
        print("   위판 등급:", " · ".join(f"{g['등급']} {g['비중']}% {g['가중평균단가']:,}원/kg" for g in grades[:4]))
    if imports:
        print(f"   수입 {import_meta['합계']}백만USD ({import_meta['구간']}) · " +
              " · ".join(f"{r['원산지']} {r['비중']}%" for r in imports[:3]))


if __name__ == "__main__":
    main()
