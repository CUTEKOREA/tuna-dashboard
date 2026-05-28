#!/usr/bin/env python3
"""Filter FAOSTAT for carrot/turnip — FAO Item 426 'Carrots and turnips' (BUNDLED)."""
import csv, io, os, re, zipfile
ROOT = os.path.expanduser("~/agri_data/carrot")
RAW = os.path.join(ROOT, "faostat", "raw")
OUT = os.path.join(ROOT, "faostat", "filtered")
os.makedirs(OUT, exist_ok=True)

PAT = re.compile(r"\b(carrot|turnip)\w*", re.I)

PAIRS = [
    ("Production_Crops_Livestock_E_All_Data_(Normalized).zip", "QCL"),
    ("Production_Indices_E_All_Data_(Normalized).zip", "QI"),
    ("Value_of_Production_E_All_Data_(Normalized).zip", "QV"),
    ("Trade_CropsLivestock_E_All_Data_(Normalized).zip", "TCL"),
    ("Trade_DetailedTradeMatrix_E_All_Data_(Normalized).zip", "TM"),
    ("Prices_E_All_Data_(Normalized).zip", "PP"),
    ("FoodBalanceSheets_E_All_Data_(Normalized).zip", "FBS"),
    ("FoodBalanceSheetsHistoric_E_All_Data_(Normalized).zip", "FBSH"),
    ("SUA_Crops_Livestock_E_All_Data_(Normalized).zip", "SCL"),
]

discovered = {}; summary = []
for zname, code in PAIRS:
    zpath = os.path.join(RAW, zname)
    if not os.path.exists(zpath): continue
    with zipfile.ZipFile(zpath) as zf:
        members = [n for n in zf.namelist() if n.lower().endswith(".csv") and "flag" not in n.lower() and "noteclassif" not in n.lower()]
        if not members:
            members = [n for n in zf.namelist() if n.lower().endswith(".csv")]
        main = sorted(members, key=lambda n: -zf.getinfo(n).file_size)[0]
        with zf.open(main) as raw:
            text = io.TextIOWrapper(raw, encoding="utf-8", errors="replace", newline="")
            reader = csv.reader(text); header = next(reader)
            ic_idx = next((i for i, h in enumerate(header) if h.startswith("Item Code")), None)
            it_idx = header.index("Item")
            year_idx = header.index("Year") if "Year" in header else None
            area_idx = header.index("Area") if "Area" in header else (header.index("Reporter Countries") if "Reporter Countries" in header else None)
            out_path = os.path.join(OUT, f"{code}_carrot.csv")
            n = 0; years=set(); areas=set()
            with open(out_path,"w",newline="",encoding="utf-8") as f:
                w = csv.writer(f); w.writerow(header)
                for row in reader:
                    if len(row) <= max(ic_idx or 0, it_idx): continue
                    if PAT.search(row[it_idx]):
                        w.writerow(row); n += 1
                        discovered[(code, row[ic_idx])] = row[it_idx]
                        if year_idx is not None and len(row) > year_idx: years.add(row[year_idx])
                        if area_idx is not None and len(row) > area_idx: areas.add(row[area_idx])
            if n == 0: os.remove(out_path)
            yr = f"{min(years)}–{max(years)}" if years else "n/a"
            print(f"[{code}] carrot/turnip={n:,} areas={len(areas)} years={yr}")
            summary.append((code, n, len(areas), yr))

with open(os.path.join(OUT,"_summary.csv"),"w",newline="") as f:
    w = csv.writer(f); w.writerow(["Domain","Carrot Rows","Areas","Year Range"]); w.writerows(summary)
with open(os.path.join(OUT,"_item_codes.csv"),"w",newline="") as f:
    w = csv.writer(f); w.writerow(["Domain","Item Code","Item"])
    for (d,c), n in sorted(discovered.items()): w.writerow([d, c, n])
print("\n[discovered codes]")
seen=set()
for (d,c), n in sorted(discovered.items(), key=lambda x: int(x[0][1]) if x[0][1].isdigit() else 99999):
    if c in seen: continue
    seen.add(c); print(f"  {c}: {n}")
