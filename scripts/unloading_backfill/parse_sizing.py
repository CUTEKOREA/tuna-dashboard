"""SIZING PDF(SAP Form ZMMR014) → 사이즈 구성 JSON (결정론적, API 미사용).

    rclone copy "gdrive:11. 태국/012. 하역 업무" artifacts/unloading_backfill/src/sizing \
        --ignore-case --include "/**/SIZING*.pdf"
    python scripts/unloading_backfill/parse_sizing.py

SAP 양식이 아닌 파일(스캔·구형 SizingReport)은 non_sap 목록으로 남겨 비전 추출로 넘긴다.
"""
import json
import re
import subprocess
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "artifacts/unloading_backfill/src/sizing"
OUT = ROOT / "artifacts/unloading_backfill/sizing_sap.json"
TOL = 0.0011

SPECIES = {"SKIPJACK": "SJ", "YELLOWFIN": "YF", "BIGEYE": "BET", "ALBACORE": "ALB"}
SIZE_ROW = re.compile(r"^\s*(([A-Z]+)\b[A-Z0-9 ./\-~()]*?)\s{2,}([\d.,]+(?:\s+[\d.,]+)*)\s*$")
TOTAL_ROW = re.compile(r"^\s*Total\s+([\d.,]+(?:\s+[\d.,]+)*)\s*$")


def nfc(s):
    return unicodedata.normalize("NFC", str(s))


def field(text, label):
    m = re.search(rf"{label}\s*\n?.*?:\s*(.+)", text)
    return re.split(r"\s{2,}", m.group(1).strip())[0] if m else None


def header_value(text, zh, en):
    m = re.search(rf"{zh}\s*:?\s+(.+?)(?:\s{{2,}}|\n)", text)
    if m and m.group(1).strip() not in (en,):
        return m.group(1).strip()
    return None


def to_num(s):
    return float(s.replace(",", ""))


def parse(path):
    info = subprocess.run(["pdfinfo", str(path)], capture_output=True, text=True).stdout
    if "ZMMR014" not in info:
        return None
    text = subprocess.run(["pdftotext", "-layout", str(path), "-"], capture_output=True, text=True).stdout
    order = re.search(r"Order No:\s*(\d+)", text)
    invoice = re.search(r"INVOICE No:\s*(\S+)", text)
    vessel = header_value(text, "船名:", "Name of Vessel")
    carrier = header_value(text, "運輸船名:", "Name of Carrier")
    discharge = re.search(r"目的地卸貨日期:\s+(\d{4}/\d{2}/\d{2})~(\d{4}/\d{2}/\d{2})", text)
    lines, totals, problems = [], None, []
    in_table = False
    for row in text.splitlines():
        if "Type of Fish" in row:
            in_table = True
            continue
        if not in_table:
            continue
        t = TOTAL_ROW.match(row)
        if t:
            totals = [to_num(x) for x in t.group(1).split()]
            break
        m = SIZE_ROW.match(row)
        if m:
            nums = [to_num(x) for x in m.group(3).split()]
            grade = re.sub(r"\s+", " ", m.group(1)).strip()
            lines.append({"species": SPECIES.get(m.group(2), "OTHER"), "grade": grade, "mt": nums[-1], "lots": nums[:-1] or nums})
    if not lines or totals is None:
        problems.append("사이즈 행 또는 Total 행 없음")
    else:
        line_sum = sum(x["mt"] for x in lines)
        if abs(line_sum - totals[-1]) > TOL:
            problems.append(f"행 합 {line_sum:.4f} ≠ Total {totals[-1]:.4f}")
        for x in lines:
            if len(x["lots"]) > 1 and abs(sum(x["lots"]) - x["mt"]) > TOL:
                problems.append(f"{x['grade']}: 로트 합 {sum(x['lots']):.4f} ≠ {x['mt']:.4f}")
    return {
        "file": nfc(path.relative_to(SRC)),
        "folder": nfc(path.parent.relative_to(SRC)),
        "order_no": order.group(1) if order else None,
        "invoice_no": invoice.group(1) if invoice else None,
        "fishing_vessel": vessel,
        "carrier": carrier,
        "discharge_start": discharge.group(1).replace("/", "-") if discharge else None,
        "discharge_end": discharge.group(2).replace("/", "-") if discharge else None,
        "lines": [{k: v for k, v in x.items() if k != "lots"} for x in lines],
        "total_mt": totals[-1] if totals else None,
        "problems": problems,
    }


def main():
    files = sorted(p for p in SRC.rglob("*") if p.suffix.lower() == ".pdf")
    parsed, non_sap = [], []
    for p in files:
        r = parse(p)
        if r is None:
            non_sap.append(nfc(p.relative_to(SRC)))
        else:
            parsed.append(r)
    seen, unique, dupes = {}, [], 0
    for r in parsed:
        key = r["order_no"] or r["file"]
        if key in seen:
            dupes += 1
            continue
        seen[key] = r
        unique.append(r)
    OUT.write_text(json.dumps({"documents": unique, "non_sap": non_sap}, ensure_ascii=False, indent=2), encoding="utf-8")
    bad = [r for r in unique if r["problems"]]
    print(f"SAP {len(parsed)}개 (Order No 중복 {dupes} 제거 → {len(unique)}) · 검증 실패 {len(bad)} · 비SAP {len(non_sap)}")
    for r in bad[:15]:
        print("  ⚠", r["file"], r["problems"])
    missing = [r["file"] for r in unique if not (r["fishing_vessel"] and r["carrier"] and r["discharge_start"])]
    print(f"헤더 누락 {len(missing)}", missing[:5])
    print(f"총 {sum(r['total_mt'] or 0 for r in unique):,.3f} MT")


if __name__ == "__main__":
    main()
