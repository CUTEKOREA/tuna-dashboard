#!/usr/bin/env python3
"""
농산물 품목 데이터 수집 오케스트레이터 v2
===========================================
사용법: 상단 CONFIG만 수정 후 `python3 agri_collector.py` 실행
모든 단계를 단일 프로세스에서 순차 처리합니다.
"""
import csv
import zipfile
import json
import io
import os
import sys
import glob
import subprocess
from datetime import datetime

# ============================================================
# ★ CONFIG — Claude가 품목별로 이 부분만 수정
# ============================================================
CONFIG = {
    "name_kr": "당근",
    "name_en": "Carrots",
    "scientific": "Daucus carota",
    "slug": "carrots",
    "item_codes": {426},  # 426=Carrots and turnips
    "hs_code": "0706.10",
    # FBS 집계 코드 — 채소류(Vegetables)
    "fbs_aggregate_codes": {2918, 2928},
    # PSD 미수록
    "psd_categories": [],
    # WB 검색어
    "psd_search_terms": ["carrot", "turnip"],
}

# FBS 집계 코드 참조표 (Claude가 품목 카테고리에 맞게 선택)
FBS_AGGREGATE_REFERENCE = {
    "견과류":   {2912, 2551},
    "유지작물": {2913, 2914},
    "곡물":     {2905, 2511},
    "과일":     {2919, 2625},
    "채소류":   {2928, 2918},
    "두류":     {2911, 2546},
    "서류":     {2907},
    "향신료":   {2923},
    "음료작물": {2924},
    "섬유작물": {2925},
}

# PSD 카테고리 URL (해당 카테고리만 선별 다운로드)
PSD_URLS = {
    "tree_nuts": "https://apps.fas.usda.gov/psdonline/downloads/psd_tree_nuts_csv.zip",
    "oilseeds":  "https://apps.fas.usda.gov/psdonline/downloads/psd_oilseeds_csv.zip",
    "grains":    "https://apps.fas.usda.gov/psdonline/downloads/psd_grains_csv.zip",
    "cotton":    "https://apps.fas.usda.gov/psdonline/downloads/psd_cotton_csv.zip",
    "dairy":     "https://apps.fas.usda.gov/psdonline/downloads/psd_dairy_csv.zip",
    "sugar":     "https://apps.fas.usda.gov/psdonline/downloads/psd_sugar_csv.zip",
    "tobacco":   "https://apps.fas.usda.gov/psdonline/downloads/psd_tobacco_csv.zip",
    "coffee":    "https://apps.fas.usda.gov/psdonline/downloads/psd_coffee_csv.zip",
    "livestock": "https://apps.fas.usda.gov/psdonline/downloads/psd_livestock_and_meat_csv.zip",
    "poultry":   "https://apps.fas.usda.gov/psdonline/downloads/psd_poultry_csv.zip",
}

# FAOSTAT 도메인 정의
FAOSTAT_DOMAINS = [
    ("QCL",  "Production_Crops_Livestock_E_All_Data_(Normalized).zip",   "생산·면적·단수"),
    ("QI",   "Production_Indices_E_All_Data_(Normalized).zip",           "생산 지수"),
    ("QV",   "Value_of_Production_E_All_Data_(Normalized).zip",          "생산 가치"),
    ("TCL",  "Trade_CropsLivestock_E_All_Data_(Normalized).zip",         "무역(국가)"),
    ("TM",   "Trade_DetailedTradeMatrix_E_All_Data_(Normalized).zip",    "양자 무역"),
    ("PP",   "Prices_E_All_Data_(Normalized).zip",                       "생산자 가격"),
    ("FBS",  "FoodBalanceSheets_E_All_Data_(Normalized).zip",            "식량수급표 2010~"),
    ("FBSH", "FoodBalanceSheetsHistoric_E_All_Data_(Normalized).zip",    "식량수급표 ~2013"),
    ("SCL",  "SUA_Crops_Livestock_E_All_Data_(Normalized).zip",          "공급-이용 계정"),
    ("FO",   "Forestry_Production_and_Trade_E_All_Data_(Normalized).zip","산림(해당시만)"),
]

# World Bank 표준 농업 지표
WB_STANDARD = {
    "AG.PRD.CROP.XD": "Crop production index",
    "AG.PRD.FOOD.XD": "Food production index",
    "AG.LND.AGRI.ZS": "Agricultural land (% of land area)",
    "AG.LND.ARBL.HA": "Arable land (hectares)",
    "TX.VAL.AGRI.ZS.UN": "Agri raw materials exports (%)",
    "TM.VAL.AGRI.ZS.UN": "Agri raw materials imports (%)",
}

# China 중복 제거 (351=China 집계, 41=China mainland 실사용)
EXCLUDE_AREA_CODES = {351}

# ============================================================
# 유틸리티
# ============================================================
BASE_DIR = os.path.expanduser(f"~/agri_data/{CONFIG['slug']}")
LOG_FILE = os.path.join(BASE_DIR, "collect.log")

def log(msg):
    ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    line = f"{ts} {msg}"
    print(line, flush=True)
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(line + "\n")

def curl_download(url, out_path, timeout=120):
    """curl로 파일 다운로드. (code, size) 반환."""
    r = subprocess.run(
        ["curl", "-sL", "-k", "-o", out_path, "-w", "%{http_code}", url],
        capture_output=True, text=True, timeout=timeout
    )
    code = r.stdout.strip()
    size = os.path.getsize(out_path) if os.path.exists(out_path) else 0
    return code, size

def curl_json(url, timeout=60):
    """curl로 JSON 가져오기."""
    try:
        r = subprocess.run(
            ["curl", "-sk", url], capture_output=True, text=True, timeout=timeout
        )
        if r.returncode == 0 and r.stdout.strip():
            return json.loads(r.stdout)
    except Exception as e:
        log(f"  curl_json 오류: {e}")
    return None

def find_main_csv(zf):
    csvs = [n for n in zf.namelist() if n.lower().endswith('.csv')]
    return max(csvs, key=lambda n: zf.getinfo(n).file_size) if csvs else None

def get_item_code_col(header):
    for c in ["Item Code", "Item Code (CPC)", "ItemCode"]:
        if c in header:
            return c
    for h in header:
        if "item" in h.lower() and "code" in h.lower():
            return h
    return None

# ============================================================
# STEP 0: 폴더 생성
# ============================================================
def step0_prepare():
    log("[STEP0] 폴더 구조 생성")
    for d in ["faostat/raw", "faostat/filtered", "usda_psd", "worldbank"]:
        os.makedirs(os.path.join(BASE_DIR, d), exist_ok=True)
    log(f"[STEP0] 완료: {BASE_DIR}")

# ============================================================
# STEP 1: FAOSTAT
# ============================================================
def step1_faostat():
    log("[STEP1] === FAOSTAT 시작 ===")
    raw_dir = os.path.join(BASE_DIR, "faostat/raw")
    filt_dir = os.path.join(BASE_DIR, "faostat/filtered")
    base_url = "https://bulks-faostat.fao.org/production"
    item_codes = CONFIG["item_codes"]
    fbs_codes = CONFIG.get("fbs_aggregate_codes", set())
    results = []

    # 1.2 다운로드
    for domain, filename, desc in FAOSTAT_DOMAINS:
        url = f"{base_url}/{filename}"
        out = os.path.join(raw_dir, f"{domain}_{filename}")
        log(f"[DOWNLOAD] {domain} ({desc})")
        try:
            code, size = curl_download(url, out)
            if code == "200" and size > 1024:
                log(f"[DOWNLOAD] {domain}: OK ({size/1024/1024:.1f}MB)")
            else:
                log(f"[DOWNLOAD] {domain}: SKIP (HTTP {code}, {size}B)")
                if os.path.exists(out):
                    os.remove(out)
                continue
        except Exception as e:
            log(f"[DOWNLOAD] {domain}: ERROR ({e})")
            continue

        # 1.3 필터링
        try:
            with zipfile.ZipFile(out, 'r') as zf:
                main_csv = find_main_csv(zf)
                if not main_csv:
                    log(f"[FILTER] {domain}: CSV 없음")
                    continue
                with zf.open(main_csv) as f:
                    text_f = io.TextIOWrapper(f, encoding='utf-8', errors='replace')
                    reader = csv.DictReader(text_f)
                    header = reader.fieldnames
                    if not header:
                        continue
                    item_col = get_item_code_col(header)
                    if not item_col:
                        log(f"[FILTER] {domain}: Item Code 컬럼 없음")
                        continue

                    matched, aggregated = [], []
                    countries, years = set(), set()

                    for row in reader:
                        try:
                            c = int(row.get(item_col, "").strip().strip('"').strip("'"))
                        except (ValueError, AttributeError):
                            continue
                        if c in item_codes:
                            matched.append(row)
                            countries.add(row.get("Area", row.get("Reporter Countries", "")))
                            y = row.get("Year", "")
                            if y: years.add(y)
                        if domain in ("FBS", "FBSH") and fbs_codes and c in fbs_codes:
                            aggregated.append(row)

                    # 직접 매칭 저장
                    if matched:
                        p = os.path.join(filt_dir, f"{domain}_{CONFIG['slug']}.csv")
                        with open(p, 'w', newline='', encoding='utf-8') as of:
                            w = csv.DictWriter(of, fieldnames=header)
                            w.writeheader(); w.writerows(matched)
                        yr = f"{min(years)}~{max(years)}" if years else "N/A"
                        log(f"[FILTER] {domain}: {len(matched)}행, {len(countries)}개국, {yr}")
                    else:
                        yr = "N/A"
                        log(f"[FILTER] {domain}: 직접 매칭 0행")

                    # FBS 집계 저장
                    if aggregated and domain in ("FBS", "FBSH"):
                        p = os.path.join(filt_dir, f"{domain}_{CONFIG['slug']}_aggregate.csv")
                        with open(p, 'w', newline='', encoding='utf-8') as of:
                            w = csv.DictWriter(of, fieldnames=header)
                            w.writeheader(); w.writerows(aggregated)
                        log(f"[FILTER] {domain}_aggregate: {len(aggregated)}행")

                    results.append({
                        "domain": domain, "desc": desc,
                        "rows": len(matched), "countries": len(countries),
                        "year_range": yr, "agg": len(aggregated)
                    })
        except zipfile.BadZipFile:
            log(f"[FILTER] {domain}: 손상된 ZIP")
        except Exception as e:
            log(f"[FILTER] {domain}: ERROR ({e})")

    # _summary.csv
    sp = os.path.join(filt_dir, "_summary.csv")
    with open(sp, 'w', newline='', encoding='utf-8') as f:
        w = csv.writer(f)
        w.writerow(["Domain", "Desc", "Rows", "Countries", "Year Range", "Aggregate"])
        for r in results:
            w.writerow([r["domain"], r["desc"], r["rows"], r["countries"], r["year_range"], r["agg"]])

    # 1.5 Sanity Check
    sanity_check(filt_dir)
    log("[STEP1] === FAOSTAT 완료 ===")
    return results

def sanity_check(filt_dir):
    qcl = os.path.join(filt_dir, f"QCL_{CONFIG['slug']}.csv")
    if not os.path.exists(qcl):
        log("[SANITY] QCL 없음, 스킵")
        return
    prod = {}
    max_y = 0
    with open(qcl, 'r', encoding='utf-8') as f:
        for row in csv.DictReader(f):
            el = row.get("Element", "")
            if "Production" not in el or "Index" in el:
                continue
            try:
                y = int(row["Year"])
                ac = int(row.get("Area Code", row.get("Area Code (M49)", "0")).strip("'\""))
                v = float(row["Value"]) if row.get("Value") else 0
            except (ValueError, KeyError):
                continue
            if ac >= 5000 or ac in EXCLUDE_AREA_CODES:
                continue
            if y > max_y:
                max_y = y
                prod = {}
            if y == max_y:
                prod[row.get("Area", "")] = v
    top5 = sorted(prod.items(), key=lambda x: x[1], reverse=True)[:5]
    log(f"[SANITY] {max_y}년 생산 Top 5:")
    for i, (c, v) in enumerate(top5, 1):
        log(f"  {i}. {c}: {v:,.0f} tonnes")

# ============================================================
# STEP 2: USDA PSD
# ============================================================
def step2_usda_psd():
    log("[STEP2] === USDA PSD 시작 ===")
    psd_dir = os.path.join(BASE_DIR, "usda_psd")
    cats = CONFIG.get("psd_categories", [])

    if not cats:
        log("[STEP2] PSD 사전 스크리닝: 해당 품목군 미수록 → 스킵")
        with open(os.path.join(psd_dir, "NOT_AVAILABLE.txt"), 'w') as f:
            f.write(f"USDA PSD {CONFIG['name_kr']}({CONFIG['name_en']}) 미수록\n")
            f.write("=" * 60 + "\n\n")
            f.write(f"사유: PSD는 곡물/유지작물/면화/당류/커피/견과류/축산/유제품/담배/가금만 수록.\n")
            f.write(f"      {CONFIG['name_kr']}은(는) 해당 품목군에 속하지 않음.\n\n")
            f.write("대안: FAOSTAT TCL/TM (무역), SCL (공급이용), PP (가격) 활용.\n")
        log("[STEP2] NOT_AVAILABLE.txt 생성")
        log("[STEP2] === USDA PSD 완료 ===")
        return

    terms = CONFIG.get("psd_search_terms", [CONFIG["name_en"].lower()])
    found = False

    for cat in cats:
        url = PSD_URLS.get(cat)
        if not url:
            continue
        tmp = os.path.join(psd_dir, f"_tmp_{cat}.zip")
        log(f"[PSD] {cat} 다운로드 중...")
        code, size = curl_download(url, tmp, timeout=60)
        if code != "200" or size < 1024:
            log(f"[PSD] {cat}: HTTP {code}, 스킵")
            if os.path.exists(tmp): os.remove(tmp)
            continue
        try:
            with zipfile.ZipFile(tmp) as zf:
                main_csv = find_main_csv(zf)
                if not main_csv:
                    continue
                with zf.open(main_csv) as f:
                    tf = io.TextIOWrapper(f, encoding='utf-8', errors='replace')
                    reader = csv.DictReader(tf)
                    header = reader.fieldnames
                    matched = []
                    for row in reader:
                        comm = row.get("Commodity_Description", "").lower()
                        if any(t.lower() in comm for t in terms):
                            matched.append(row)
                    if matched:
                        out = os.path.join(psd_dir, f"PSD_{CONFIG['slug']}_{cat}.csv")
                        with open(out, 'w', newline='', encoding='utf-8') as of:
                            w = csv.DictWriter(of, fieldnames=header)
                            w.writeheader(); w.writerows(matched)
                        log(f"[PSD] {cat}: {len(matched)}행 매칭!")
                        found = True
                    else:
                        log(f"[PSD] {cat}: 매칭 0건")
        except Exception as e:
            log(f"[PSD] {cat}: 오류 {e}")
        finally:
            if os.path.exists(tmp): os.remove(tmp)

    if not found:
        with open(os.path.join(psd_dir, "NOT_AVAILABLE.txt"), 'w') as f:
            f.write(f"USDA PSD {CONFIG['name_kr']} 매칭 0건\n")
            f.write(f"검사 카테고리: {', '.join(cats)}\n")
            f.write(f"검색어: {', '.join(terms)}\n")
        log("[PSD] 전체 매칭 0건 → NOT_AVAILABLE.txt")

    log("[STEP2] === USDA PSD 완료 ===")

# ============================================================
# STEP 3: World Bank
# ============================================================
def step3_worldbank():
    log("[STEP3] === World Bank 시작 ===")
    wb_dir = os.path.join(BASE_DIR, "worldbank")

    # 3.1 Indicators 검색
    log("[WB] Indicators 검색")
    url = "https://api.worldbank.org/v2/indicator?format=json&per_page=20000&source=2"
    data = curl_json(url)
    direct = []
    if data and len(data) > 1 and data[1]:
        kws = [CONFIG["name_en"].lower()] + CONFIG.get("psd_search_terms", [])
        for ind in data[1]:
            nm = (ind.get("name", "") or "").lower()
            for kw in kws:
                if kw in nm:
                    direct.append({"code": ind["id"], "name": ind.get("name", "")})
                    break
    log(f"[WB] 직접 매칭: {len(direct)}건")

    # 3.2 직접 매칭 다운로드
    for ind in direct:
        cnt = wb_download_indicator(wb_dir, ind["code"], ind["name"])
        log(f"[WB] {ind['code']}: {cnt}행")

    # 3.3 표준 지표
    log("[WB] 표준 농업 지표 다운로드")
    for code, name in WB_STANDARD.items():
        cnt = wb_download_indicator(wb_dir, code, name)
        log(f"[WB] {code}: {cnt}행")

    # 3.4 Pink Sheet
    wb_pink_sheet(wb_dir)
    log("[STEP3] === World Bank 완료 ===")

def wb_download_indicator(wb_dir, code, name):
    url = f"https://api.worldbank.org/v2/country/all/indicator/{code}?format=json&per_page=20000"
    data = curl_json(url)
    if not data or len(data) < 2 or not data[1]:
        return 0
    out = os.path.join(wb_dir, f"{code.replace('.','_')}.csv")
    count = 0
    with open(out, 'w', newline='', encoding='utf-8') as f:
        w = csv.writer(f)
        w.writerow(["Country", "CountryCode", "Year", "Value", "Indicator", "Name"])
        for r in data[1]:
            if r.get("value") is not None:
                w.writerow([r.get("country",{}).get("value",""), r.get("countryiso3code",""),
                            r.get("date",""), r["value"], code, name])
                count += 1
    if count == 0 and os.path.exists(out):
        os.remove(out)
    return count

def wb_pink_sheet(wb_dir):
    log("[WB] Pink Sheet 확인")
    urls = [
        "https://thedocs.worldbank.org/en/doc/74e8be41ceb20fa0da750cda2f6b9e4e-0050012026/related/CMO-Historical-Data-Monthly.xlsx",
        "https://thedocs.worldbank.org/en/doc/5d903e848db1d1b83e0ec8f744e55570-0350012021/related/CMO-Historical-Data-Monthly.xlsx",
    ]
    tmp = os.path.join(wb_dir, "_pinksheet.xlsx")
    found_xlsx = False
    for url in urls:
        code, size = curl_download(url, tmp, timeout=60)
        if code == "200" and size > 1024:
            found_xlsx = True
            break

    kw = CONFIG["name_en"].lower()
    found_item = False
    if found_xlsx:
        try:
            with zipfile.ZipFile(tmp) as zf:
                if "xl/sharedStrings.xml" in zf.namelist():
                    with zf.open("xl/sharedStrings.xml") as f:
                        if kw in f.read().decode('utf-8', errors='replace').lower():
                            found_item = True
                            log(f"[WB] Pink Sheet에 {kw} 발견!")
        except Exception as e:
            log(f"[WB] Pink Sheet 파싱 오류: {e}")

    if os.path.exists(tmp):
        os.remove(tmp)

    if not found_item:
        with open(os.path.join(wb_dir, "pinksheet_NOT_AVAILABLE.txt"), 'w') as f:
            f.write(f"Pink Sheet에 {CONFIG['name_kr']}({CONFIG['name_en']}) 미수록\n")
            f.write("Pink Sheet는 에너지/금속/곡물/유지작물 위주.\n")
            f.write("대안: FAOSTAT PP (생산자 가격) 활용.\n")
        log("[WB] Pink Sheet 미수록 → NOT_AVAILABLE.txt")

# ============================================================
# STEP 4: README 생성
# ============================================================
def step4_readme(fao_results=None):
    log("[STEP4] README.md 생성")
    slug = CONFIG["slug"]
    filt_dir = os.path.join(BASE_DIR, "faostat/filtered")
    wb_dir = os.path.join(BASE_DIR, "worldbank")
    psd_dir = os.path.join(BASE_DIR, "usda_psd")

    # 파일 존재 여부 확인
    psd_avail = not os.path.exists(os.path.join(psd_dir, "NOT_AVAILABLE.txt"))
    ps_avail = not os.path.exists(os.path.join(wb_dir, "pinksheet_NOT_AVAILABLE.txt"))
    wb_csvs = glob.glob(os.path.join(wb_dir, "*.csv"))
    wb_rows = 0
    for wc in wb_csvs:
        with open(wc, 'r') as f:
            wb_rows += sum(1 for _ in f) - 1

    lines = [
        f"# {CONFIG['name_kr']}({CONFIG['name_en']}) 농산물 데이터 수집\n",
        f"> 학명: *{CONFIG['scientific']}*  ",
        f"> 수집일: {datetime.now().strftime('%Y-%m-%d')}  ",
        f"> FAOSTAT Item Code: {CONFIG['item_codes']}  ",
        f"> HS Code: {CONFIG['hs_code']}\n",
        "## 가용성 매트릭스\n",
        "| 소스 | 가용 | 행수 | 비고 |",
        "|------|------|------|------|",
    ]

    if fao_results:
        for r in fao_results:
            st = "✅" if r["rows"] > 0 else ("△" if r["agg"] > 0 else "❌")
            rows = f'{r["rows"]:,}' if r["rows"] > 0 else (f'{r["agg"]:,} (집계)' if r["agg"] > 0 else "-")
            lines.append(f'| FAOSTAT {r["domain"]} | {st} | {rows} | {r["desc"]}, {r["year_range"]} |')

    lines.append(f'| USDA PSD | {"✅" if psd_avail else "❌"} | - | {"수록" if psd_avail else "미수록"} |')
    lines.append(f'| World Bank | △ | {wb_rows:,} | 보조 지표 {len(wb_csvs)}개 |')
    lines.append(f'| Pink Sheet | {"✅" if ps_avail else "❌"} | - | {"수록" if ps_avail else "미수록"} |')
    lines.append("")

    readme_path = os.path.join(BASE_DIR, "README.md")
    with open(readme_path, 'w', encoding='utf-8') as f:
        f.write("\n".join(lines))
    log(f"[STEP4] README.md 생성 완료")

# ============================================================
# MAIN
# ============================================================
if __name__ == "__main__":
    step0_prepare()
    fao_results = step1_faostat()
    step2_usda_psd()
    step3_worldbank()
    step4_readme(fao_results)
    log(f"[COMPLETE] {CONFIG['name_kr']}({CONFIG['name_en']}) 전체 수집 완료")
    log(f"[COMPLETE] 폴더: {BASE_DIR}")
