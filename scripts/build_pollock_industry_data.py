#!/usr/bin/env python3
"""명태 밸류체인 집계 — 축은 **잡지 않고 먹는 생선**이다.

고등어는 크기 등급, 골뱅이는 종, 새우는 양식 대 자연산이 축이었다. 명태는 다르다.
연근해 어획이 2019년부터 0이고 법으로도 잡을 수 없다. 국내 공급은
  1. **원양 국적선 3척** — 한·러 어업위원회 할당 한 장이 상한이다.
  2. **수입** — 러시아 원물(동태·명란·북어·필렛)과 미국 연육. 둘이 95%다.
그래서 축은 「원양 할당」과 「수입 제품 구성」이고, 가공(황태·코다리·명란젓·연육)과
재고(KMI 관측)가 그 뒤를 받는다.

⚠ 이 품목의 함정 셋
  1. **「pollock」 문자열 필터는 세이스(POK)·대서양폴록(POL)을 섞는다.** FAO 는 ALK 단독.
  2. **세 축을 한 표에 섞지 않는다.** FAO 생물중량 / 관세청 10자리 제품중량 / 식약처 품목유형.
  3. **연육 「889건」은 신고 건수이지 물량이 아니다.** 어묵(1604.20)은 명태 전용 세번이 아니다.

입력은 보고서 「한국 명태 산업 해부」 02_출처원본(Drive). 없으면 작업 폴더(/tmp/kr_pollock)로 폴백.
사용법:
    python3 scripts/build_pollock_industry_data.py
"""
from __future__ import annotations

import csv
import json
from datetime import date
from pathlib import Path

DRIVE = Path(
    "/Users/idong-geon/Library/CloudStorage/GoogleDrive-cutekorea@gmail.com/내 드라이브"
    "/agri_data/01_수산물(Seafood)/pollock/8_한국_명태_산업_해부/02_출처원본"
)
LOCAL = Path("/tmp/kr_pollock")
OUT = Path(__file__).resolve().parent.parent / "public/data/pollock_industry_v1.json"
MIN_EXPECTED_YEAR = 2024


def src(name: str) -> Path:
    for p in (DRIVE / name, LOCAL / "src" / name, LOCAL / "v2" / "src" / name):
        if p.exists():
            return p
    raise FileNotFoundError(name)


def load_json(name: str):
    return json.load(open(src(name), encoding="utf-8"))


def world_catch():
    d = load_json("fishstat_ALK_capture.json")
    cby = d["country_by_year"]
    world = d["world_by_year"]
    names = {
        "Russian Federation": "러시아",
        "United States of America": "미국",
        "Japan": "일본",
        "Democratic People's Republic of Korea": "북한",
        "Republic of Korea": "한국",
    }
    rows = []
    for y in range(1986, 2025):
        row = {"연도": y, "세계": round(world[str(y)])}
        for en, ko in names.items():
            row[ko] = round(cby.get(en, {}).get(str(y), 0))
        rows.append(row)
    latest = rows[-1]
    ranking = sorted(
        [(ko, latest[ko]) for ko in names.values()] + [("캐나다", round(cby.get("Canada", {}).get("2024", 0)))],
        key=lambda kv: -kv[1],
    )
    total = latest["세계"]
    return {
        "_meta": {
            "출처": "FAO FishStat 2026.1.0 어획량(생물중량, 종 코드 ALK)",
            "기준연도": 2024,
            "세계합계": total,
            "한국": latest["한국"],
            "한국비중": round(100 * latest["한국"] / total, 2),
            "러미비중": round(100 * (latest["러시아"] + latest["미국"]) / total, 1),
            "주의": "POK(세이스)·POL(대서양폴록) 제외. 한국 2018년은 FAO 보고 누락(9톤)이라 원양통계 23,993톤과 다르다",
        },
        "시계열": rows,
        "국가": [{"국가": k, "어획량": v, "비중": round(100 * v / total, 2)} for k, v in ranking if v > 0],
    }


def quota():
    rows = [
        {"연도": 2020, "할당": 28800, "어획": 27196, "입어료": 375},
        {"연도": 2021, "할당": 28400, "어획": 27779, "입어료": 375},
        {"연도": 2022, "할당": 28500, "어획": 21591, "입어료": 375},
        {"연도": 2023, "할당": 28500, "어획": 28432, "입어료": 388},
        {"연도": 2024, "할당": 29000, "어획": 28999, "입어료": 388},
        {"연도": 2025, "할당": 29200, "어획": 29199, "입어료": 388},
        {"연도": 2026, "할당": 26200, "어획": 6346, "입어료": 395, "비고": "1~6월 누계. 추가 신청 한도 5,300톤은 명령 제485호로 배정(톤수 비공개)"},
    ]
    return {
        "_meta": {
            "출처": "해양수산부 보도자료(2020·2021), 수협중앙회 제33·34차 결과보고, 러시아 연방수산청 이행명령(2022 제138호·2023 제271호·2024 제176호·2026 제130호), 원양어업통계조사·원양어업생산동향",
            "단위": "톤, 달러/톤",
            "북양트롤": 3,
            "주의": "2025 할당은 합의 한도 30,000톤 중 실제 배정 29,200톤. 2026 어획은 1~6월 누계라 연환산하지 않는다",
        },
        "rows": rows,
    }


def imports():
    short = {
        "0302550000": "생태",
        "0303670000": "동태",
        "0303912010": "명란",
        "0304750000": "필렛",
        "0304941000": "연육",
        "0305531000": "북어",
    }
    rows = list(csv.DictReader(open(src("kcs_pollock_hs10_by_code_year.csv"), encoding="utf-8")))
    by_year: dict[str, dict] = {}
    for r in rows:
        if r["classification"] != "dedicated":
            continue
        y = r["year"]
        d = by_year.setdefault(y, {"연도": "2026(1~7월)" if y == "2026" else int(y), "합계금액": 0.0, "합계물량": 0.0})
        v = float(r["import_value_usd"]) / 1e6
        w = float(r["import_weight_kg"]) / 1e3
        d["합계금액"] += v
        d["합계물량"] += w
        k = short.get(r["hsCd"])
        if k:
            d[f"{k}_물량"] = round(w)
            d[f"{k}_금액"] = round(v, 1)
    out = []
    for y in sorted(by_year):
        d = by_year[y]
        d["합계금액"] = round(d["합계금액"], 1)
        d["합계물량"] = round(d["합계물량"])
        out.append(d)
    latest = next(d for d in out if d["연도"] == 2025)
    return {
        "_meta": {
            "출처": "관세청 수출입무역통계, 명태 전용 10자리 세번 9개 합산",
            "구간": "2023~2026년 1~7월",
            "단위": "톤, 백만 달러",
            "기준연도": 2025,
            "합계금액": latest["합계금액"],
            "합계물량": latest["합계물량"],
            "동태물량비중": round(100 * latest["동태_물량"] / latest["합계물량"], 1),
            "주의": "2026년은 1~7월 누계. 연환산하지 않는다. 합계에는 표에 없는 소액 세번(연육 기타 등)이 포함된다",
        },
        "rows": out,
    }


def origins():
    rows = list(csv.DictReader(open(src("kcs_pollock_by_country_2024_2025_2026ytd.csv"), encoding="utf-8")))
    out = []
    for r in rows:
        if r["period"] != "2025" or float(r["import_value_usd"]) < 1e5:
            continue
        name = {"러시아 연방": "러시아"}.get(r["country_name"], r["country_name"])
        out.append({
            "원산지": name,
            "수입액": round(float(r["import_value_usd"]) / 1e6, 1),
            "수입량": round(float(r["import_weight_kg"]) / 1e3),
            "비중": round(float(r["value_share_pct"]), 1),
            "단가": round(float(r["unit_value_usd_per_kg"]), 2),
        })
    out.sort(key=lambda x: -x["수입액"])
    return {
        "_meta": {"출처": "관세청 수출입무역통계 2025년, 전용 세번 9개", "구간": "2025년", "단위": "백만 달러, 톤, 달러/kg, %"},
        "rows": out,
    }


def processing():
    s = load_json("mfds_pollock_summary.json")
    cats = ["명란젓", "코다리", "명태(기타)", "황태", "연육", "북어"]
    rows = []
    for c in cats:
        row = {"품목": c}
        for y in ("2023", "2024", "2025"):
            b = s["by_year"][y]["by_category"].get(c, {})
            row[y] = round(b.get("production_t", 0))
            if y == "2025":
                row["업체"] = b.get("company_count", 0)
        rows.append(row)
    tot = {y: round(s["by_year"][y]["pollock_included"]["production_t"]) for y in ("2023", "2024", "2025")}
    firms = s["by_year"]["2025"]["pollock_included"]["company_count"]
    fc = {y: round(s["by_year"][y]["fish_cake_all_excluded"]["production_t"]) for y in ("2023", "2024", "2025")}
    return {
        "_meta": {
            "출처": "식품안전나라 생산실적 I0300 (품목명 기준, 어묵·타어종 연육 제외)",
            "기준연도": 2025,
            "합계": tot,
            "업체": firms,
            "어묵": fc,
            "주의": "2024년 명란젓 23,646톤 가운데 8,869톤은 한 업체의 신고로 앞뒤 해의 100배다. 원장은 정정되지 않았다",
        },
        "rows": rows,
    }


def stock():
    d = load_json("kmi_pollock_monthly.json")["monthly"]
    rows = []
    issues = sorted(d.items())
    for i, (issue, v) in enumerate(issues):
        y, m = int(issue[:4]), int(issue[5:])
        # N월호 = N-1월 수치. 다음 호의 「전월」 값이 있으면 그것이 수정치라 그쪽을 쓴다
        dm = f"{y if m > 1 else y - 1}-{(m - 1) if m > 1 else 12:02d}"
        stock = v.get("stock_t")
        if i + 1 < len(issues):
            nxt = issues[i + 1][1]
            if nxt.get("stock_prev_t"):
                stock = nxt["stock_prev_t"]
        if stock:
            rows.append({"월": dm, "재고": stock, "수입": v.get("imp"), "소비": v.get("cons")})
    return {
        "_meta": {
            "출처": "한국해양수산개발원 수산업관측센터 대중성 어종 월보(명태 재고량 동향·수급표)",
            "구간": f"{rows[0]['월']}~{rows[-1]['월']}",
            "단위": "톤",
            "주의": "재고는 국립수산물품질관리원 분기 공표값을 토대로 한 추정치. 월보 N월호 = N-1월 말 수치. 수입·소비는 KMI 원물 환산 기준이라 관세청 제품중량과 다르다",
        },
        "rows": rows,
    }


def main() -> int:
    data = {
        "_meta": {
            "생성일": date.today().isoformat(),
            "보고서": "한국 명태 산업 해부 (2026-08, 2판)",
            "축": "원양 할당 · 수입 제품 구성 · 가공 품목 · 재고",
        },
        "세계어획": world_catch(),
        "원양할당": quota(),
        "수입세번": imports(),
        "수입원산지": origins(),
        "가공품목": processing(),
        "재고": stock(),
    }
    assert data["세계어획"]["_meta"]["기준연도"] >= MIN_EXPECTED_YEAR
    OUT.write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"wrote {OUT} ({OUT.stat().st_size:,} bytes) · 세계 {data['세계어획']['_meta']['세계합계']:,} · 수입 2025 ${data['수입세번']['_meta']['합계금액']}M · 가공 {data['가공품목']['_meta']['합계']} · 재고 {len(data['재고']['rows'])}개월")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
