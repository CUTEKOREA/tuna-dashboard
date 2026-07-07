from __future__ import annotations

import json
import re
import unicodedata
from pathlib import Path

from bs4 import BeautifulSoup


SOURCE_DIR = Path("/Users/idong-geon/자료수집/수산물 가공공장")
OUT = Path("/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/data/seasia_oem_ma_candidates.json")


def find_source(prefix: str) -> Path:
    matches = [
        path
        for path in SOURCE_DIR.glob("*.html")
        if unicodedata.normalize("NFC", path.name).startswith(prefix)
        and ".backup" not in unicodedata.normalize("NFC", path.name)
    ]
    if matches:
        return sorted(matches, key=lambda p: len(unicodedata.normalize("NFC", p.name)))[0]
    raise FileNotFoundError(prefix)


def table_rows(table):
    rows = table.find_all("tr")
    if not rows:
        return [], []
    headers = [cell.get_text(" ", strip=True) for cell in rows[0].find_all(["th", "td"])]
    data = []
    for row in rows[1:]:
        cells = [cell.get_text(" ", strip=True) for cell in row.find_all(["td", "th"])]
        if len(cells) == len(headers):
            data.append(dict(zip(headers, cells)))
    return headers, data


def company_name(raw: str) -> str:
    raw = re.sub(r"\s+등기번호.*$", "", raw).strip()
    raw = re.sub(r"\s+일본 본사.*$", "", raw).strip()
    return raw


def int_from(pattern: str, text: str) -> int:
    match = re.search(pattern, text or "")
    return int(match.group(1).replace(",", "")) if match else 0


def grade_from(text: str) -> str:
    text = (text or "").strip()
    return text.split()[0] if text else "미분류"


def grade_score(grade: str, note: str = "") -> float:
    if "제외" in grade or "중복" in grade:
        return 0
    if grade == "상":
        base = 5
    elif "상" in grade and "중" in grade:
        base = 4.4
    elif grade == "중":
        base = 3.1
    elif "중" in grade:
        base = 2.5
    elif "하" in grade:
        base = 1.0
    else:
        base = 1.5
    if "우선" in note:
        base += 1.2
    if "대형" in note or "공식" in note:
        base += 0.4
    return base


def screening_from_grade(grade: str) -> str:
    if "제외" in grade:
        return "제외"
    if "상" in grade:
        return "우선"
    if "중" in grade:
        return "관찰"
    if "하" in grade:
        return "보류"
    return "확인필요"


def parse_thailand() -> dict:
    path = find_source("태국_44개사_전체_심층프로파일")
    soup = BeautifulSoup(path.read_text(encoding="utf-8"), "html.parser")
    tables = soup.find_all("table")
    _, note_rows = table_rows(tables[0])
    _, rows = table_rows(tables[1])

    companies = []
    for row in rows:
        rank = int(row["#"])
        reg = re.search(r"등기번호\s*([0-9]+)", row["회사/등기번호"])
        shipments = int_from(r"(\d+)선", row["한국 거래처(선적)"])
        buyers = int_from(r"·\s*(\d+)사", row["한국 거래처(선적)"])
        grade = grade_from(row["등급·비고"])
        note = row["등급·비고"][len(grade):].strip()
        companies.append(
            {
                "rank": rank,
                "country": "태국",
                "name": company_name(row["회사/등기번호"]),
                "registration": reg.group(1) if reg else "",
                "location": row["소재·설립"],
                "ownership": row["지배구조·상장"],
                "scale": row["규모·캐파"],
                "products": row["품목"],
                "certifications": row["인증"],
                "finance": row["재무"],
                "koreaTrade": row["한국 거래처(선적)"],
                "shipments": shipments,
                "buyers": buyers,
                "grade": grade,
                "screening": screening_from_grade(grade),
                "note": note,
                "score": round(grade_score(grade, note) + min(shipments / 160, 1.4), 2),
            }
        )

    grade_counts: dict[str, int] = {}
    for row in companies:
        grade_counts[row["grade"]] = grade_counts.get(row["grade"], 0) + 1

    top = sorted(
        [row for row in companies if row["screening"] != "제외"],
        key=lambda row: (row["score"], row["shipments"]),
        reverse=True,
    )[:12]

    return {
        "sourceFile": str(path),
        "title": "태국 수산물 가공회사 44개 법인 심층 프로파일",
        "totalCompanies": len(companies),
        "totalShipments": sum(row["shipments"] for row in companies),
        "priorityCount": sum(1 for row in companies if row["screening"] == "우선"),
        "watchCount": sum(1 for row in companies if row["screening"] == "관찰"),
        "excludedCount": sum(1 for row in companies if row["screening"] == "제외"),
        "gradeCounts": grade_counts,
        "sourceNotes": note_rows,
        "topCandidates": top,
        "topByShipment": sorted(companies, key=lambda row: row["shipments"], reverse=True)[:10],
    }


def parse_vietnam() -> dict:
    path = find_source("베트남_수산물가공_MA후보_비교보고서")
    soup = BeautifulSoup(path.read_text(encoding="utf-8"), "html.parser")
    tables = soup.find_all("table")
    _, note_rows = table_rows(tables[0])
    _, toplist = table_rows(tables[1])
    _, deep_rows = table_rows(tables[2])
    _, ranking_rows = table_rows(tables[3])
    _, full_rows = table_rows(tables[4])

    top_candidates = []
    for row in toplist:
        top_candidates.append(
            {
                "rank": int(row["#"]),
                "country": "베트남",
                "name": row["회사"],
                "summary": row["요지"],
                "koreaTrade": row["주요 한국 거래처(선적)"],
                "grade": row["등급"],
                "screening": "우선",
                "score": round(grade_score(row["등급"], row["요지"]) + 1.0, 2),
            }
        )

    deep_profiles = [
        {
            "name": row["회사/세번·DL"],
            "location": row["소재·설립"],
            "ownership": row["지배구조"],
            "scale": row["규모·캐파"],
            "products": row["품목·가공"],
            "certifications": row["인증"],
            "finance": row["재무"],
            "koreaTrade": row["한국 거래처(top)"],
            "grade": row["등급"],
        }
        for row in deep_rows
    ]

    full = []
    for row in full_rows:
        full.append(
            {
                "rank": int(row["#"]),
                "country": "베트남",
                "name": row["제조업소(통관표기)"],
                "shipments": int_from(r"(\d+)", row["선적"]),
                "productGroup": row["품목군"],
                "screening": row["스크리닝"],
                "note": row["보강 메모"],
                "koreaTrade": row["한국 거래처(선적건수) — 전량"],
            }
        )

    screening_counts: dict[str, int] = {}
    product_counts: dict[str, int] = {}
    for row in full:
        screening_counts[row["screening"]] = screening_counts.get(row["screening"], 0) + 1
        product_counts[row["productGroup"]] = product_counts.get(row["productGroup"], 0) + 1

    return {
        "sourceFile": str(path),
        "title": "베트남 수산물 가공회사 M&A 후보 비교보고서",
        "totalManufacturers": len(full),
        "totalShipments": sum(row["shipments"] for row in full),
        "priorityCount": screening_counts.get("우선", 0),
        "watchCount": screening_counts.get("중", 0),
        "excludedCount": screening_counts.get("제외", 0),
        "screeningCounts": screening_counts,
        "productGroupCounts": product_counts,
        "sourceNotes": note_rows,
        "topCandidates": top_candidates,
        "deepProfiles": deep_profiles,
        "ranking": ranking_rows,
        "topByShipment": sorted(full, key=lambda row: row["shipments"], reverse=True)[:12],
    }


def main() -> None:
    thailand = parse_thailand()
    vietnam = parse_vietnam()
    data = {
        "updatedAt": "2026-07-07",
        "methodNote": "로컬 HTML 보고서 2건에서 표를 파싱해 /seasia-oem 대시보드용 요약 JSON으로 변환. 통관 선적·한국 거래처는 원문값 보존, M&A 등급은 원문 등급/스크리닝 기준.",
        "sources": [
            {
                "label": thailand["title"],
                "path": thailand["sourceFile"],
                "scope": "태국 44개 법인 심층 프로파일",
            },
            {
                "label": vietnam["title"],
                "path": vietnam["sourceFile"],
                "scope": "베트남 294개 제조업소 전수 스크리닝",
            },
        ],
        "thailand": thailand,
        "vietnam": vietnam,
        "combined": {
            "totalEntities": thailand["totalCompanies"] + vietnam["totalManufacturers"],
            "totalShipments": thailand["totalShipments"] + vietnam["totalShipments"],
            "priorityCandidates": thailand["priorityCount"] + vietnam["priorityCount"],
            "watchCandidates": thailand["watchCount"] + vietnam["watchCount"],
            "excludedOrLowFit": thailand["excludedCount"] + vietnam["excludedCount"],
        },
    }
    OUT.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    print(OUT)
    print("thailand", thailand["totalCompanies"], thailand["totalShipments"])
    print("vietnam", vietnam["totalManufacturers"], vietnam["totalShipments"])
    print("combined", data["combined"])


if __name__ == "__main__":
    main()
