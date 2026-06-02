#!/usr/bin/env python3
"""4-Axis Forensic Audit extractor/scorer for sashimi-strategy widgets.
Reads all components/sashimi-strategy/Sas*.tsx, extracts WidgetCard metadata,
computes 4-axis reliability scores per widget-audit skill rubric (O-04).
"""
import re, os, csv, json, sys

WIDGET_DIR = "components/sashimi-strategy"

# Section mapping (from SashimiSteakDashboard.tsx render order)
SECTION_MAP = {
    "korea":  ["SasKoreaProductionStructure","SasKoreaJapanDependency","SasKoreaMajorCompanies",
               "SasKoreaFoodserviceD2C","SasKoreaMedBftImports","SasKoreaTradeDecade"],
    "global": ["SasTriadDynamics","SasFourCountryComparison","SasMarketKPIs","SasGlobalHotspots"],
    "us":     ["SasSupplyChainSplit","SasCoTreatmentImpact","SasUsSupplierOrigin",
               "SasUsSushiPokeMarket","SasHawaiiDomesticNiche"],
    "ukth":   ["SasUkMarket","SasThailandHub"],
    "eu":     ["SasBluefinRanchingEconomics","SasEuQuotaProduction","SasDomesticRetailTrend",
               "SasEuFreshVsCanned","SasEuImportSegmentation"],
    "japan":  ["SasToyosuAuction","SasJapanDemandDecline","SasQuotaVolatility","SasTraceabilityRatings"],
    "price":  ["SasSpeciesPriceTier","SasSashimiPriceLadder","SasHedonicPriceFactors"],
    "export": ["SasExportPartnerStrategy","SasExportChecklist"],
    "outlook":["SasGlobalOutlook2030"],
}
SECTION_LABEL = {
    "korea":"🇰🇷 한국","global":"🌍 글로벌","us":"🇺🇸 미국","ukth":"🇬🇧🇹🇭 영국/태국",
    "eu":"🇪🇺 유럽","japan":"🇯🇵 일본","price":"💰 가격/어종","export":"🎯 수출전략","outlook":"🔮 전망2030",
}
COMP_SECTION = {c: s for s, comps in SECTION_MAP.items() for c in comps}

# Recognized 1차(primary) source tokens → axis1=90. Else 60.
PRIMARY_SOURCES = [
    # UN / global stat
    "comtrade","oec","wits","fao","faostat","fishstat","globefish",
    # US gov
    "us census","census bureau","census","usda","noaa","nmfs","nass","ers","fas","fda",
    "seafood watch","simp","monterey bay",
    # company IR (primary for own figures)
    "thai union","balfegó","balfego","dongwon","동원","maruha","nissui",
    # RFMO
    "iccat","wcpfc","iattc","iotc","ccsbt","issf",
    # Korea official / IR
    "kcs","관세청","mof","해수부","해양수산부","kmi","해양수산개발원","kamis","kosis","kfas",
    "수협","dart","fis","fips","mfds","식약처","통계청","무역협회","kita","kati","mabik",
    # EU
    "eumofa","eurostat","comext","cbi","stecf","gfcm",
    # Japan
    "maff","농림수산성","수산청","toyosu","도요스","jetro",
    # Certification / industry primary
    "msc","asc","marine stewardship",
    # Market research (secondary-but-named, still credit partial via separate tier)
]
# Secondary/market-research named (credit 75, not full 90)
SECONDARY_SOURCES = [
    "globaldata","mordor","grand view","marketsandmarkets","statista","euromonitor",
    "imarc","fortune business","research and markets","technavio","ibisworld","rabobank",
    "undercurrent","intrafish","seafoodsource","atuna","globefish research",
]

def grab(field, txt):
    """Extract a single-quoted or double-quoted prop value."""
    # prop="..."  OR prop='...'  OR prop: '...' / "..."
    m = re.search(field + r'\s*[:=]\s*"((?:[^"\\]|\\.)*)"', txt)
    if m: return m.group(1)
    m = re.search(field + r"\s*[:=]\s*'((?:[^'\\]|\\.)*)'", txt)
    if m: return m.group(1)
    return ""

def grab_telemetry(txt):
    m = re.search(r"telemetry=\{\{(.*?)\}\}", txt, re.S)
    block = m.group(1) if m else ""
    status = grab("status", block)
    sync   = grab("syncDate", block)
    return status, sync

def grab_source(txt):
    # source field inside takeaway={{ ... source: "..." }}
    m = re.search(r"source\s*:\s*\"((?:[^\"\\]|\\.)*)\"", txt)
    if m: return m.group(1)
    m = re.search(r"source\s*:\s*'((?:[^'\\]|\\.)*)'", txt)
    if m: return m.group(1)
    return ""

def axis1_source(carddesc, source):
    blob = (carddesc + " " + source).lower()
    for tok in PRIMARY_SOURCES:
        if tok in blob:
            return 90, "primary"
    for tok in SECONDARY_SOURCES:
        if tok in blob:
            return 75, "secondary"
    return 60, "weak/none"

def axis2_fresh(sync):
    s = sync.strip()
    # conservative = anchor on the STARTING year of any range
    if s.startswith("2026"): return 95
    if s.startswith("2025"): return 75   # incl '2025-26'
    if s.startswith("2024"): return 70   # incl '2024-25'
    if s.startswith("2023"): return 40
    if re.match(r"^202[0-2]", s): return 40
    return 55  # unknown → treat as static baseline

def axis3_verify(status):
    st = status.upper()
    if "LIVE" in st: return 95
    if "SYNCED" in st: return 80
    if "STATIC" in st: return 55
    return 70  # 동적/기타

def axis4_integration(pillar, carddesc, status):
    has_pillar = bool(pillar.strip())
    has_tel    = bool(status.strip())
    desc_ok    = len(carddesc.strip()) >= 30
    if has_pillar and has_tel and desc_ok: return 100
    if has_pillar and has_tel and carddesc.strip(): return 90  # cardDesc present but <30
    if has_pillar and has_tel: return 80
    return 70

def grade(avg):
    if avg >= 85: return "A"
    if avg >= 75: return "B"
    if avg >= 65: return "C"
    return "D"

rows = []
for fn in sorted(os.listdir(WIDGET_DIR)):
    if not fn.startswith("Sas") or not fn.endswith(".tsx"): continue
    comp = fn[:-4]
    path = os.path.join(WIDGET_DIR, fn)
    txt = open(path, encoding="utf-8").read()
    wid      = grab("id", txt)
    title    = grab("title", txt)
    pillar   = grab("pillar", txt)
    carddesc = grab("cardDesc", txt)
    status, sync = grab_telemetry(txt)
    source   = grab_source(txt)
    a1, a1tier = axis1_source(carddesc, source)
    a2 = axis2_fresh(sync)
    a3 = axis3_verify(status)
    a4 = axis4_integration(pillar, carddesc, status)
    avg = round((a1+a2+a3+a4)/4, 1)
    g = grade(avg)
    rows.append(dict(section=COMP_SECTION.get(comp,"?"), comp=comp, id=wid, pillar=pillar,
                     title=title, status=status, sync=sync, carddesc=carddesc, source=source,
                     a1=a1, a1tier=a1tier, a2=a2, a3=a3, a4=a4, avg=avg, grade=g,
                     desclen=len(carddesc.strip())))

# Order by section nav order
sec_order = list(SECTION_MAP.keys())
rows.sort(key=lambda r: (sec_order.index(r["section"]) if r["section"] in sec_order else 99, -r["avg"]))

# CSV
os.makedirs("artifacts", exist_ok=True)
with open("artifacts/sashimi_4axis_scores.csv","w",newline="",encoding="utf-8") as f:
    w = csv.writer(f)
    w.writerow(["section","comp","id","pillar","title","status","syncDate",
                "a1_source","a1_tier","a2_fresh","a3_verify","a4_integ","avg","grade","carddesc_len"])
    for r in rows:
        w.writerow([r["section"],r["comp"],r["id"],r["pillar"],r["title"],r["status"],r["sync"],
                    r["a1"],r["a1tier"],r["a2"],r["a3"],r["a4"],r["avg"],r["grade"],r["desclen"]])

# JSON inventory (for downstream cross-validation)
with open("artifacts/sashimi_widget_inventory.json","w",encoding="utf-8") as f:
    json.dump(rows, f, ensure_ascii=False, indent=2)

# Console report
print(f"총 위젯: {len(rows)}개\n")
gd = {}
for r in rows: gd[r["grade"]] = gd.get(r["grade"],0)+1
avg_all = round(sum(r["avg"] for r in rows)/len(rows),1)
print(f"전체 평균: {avg_all}점 | 등급분포: " + " ".join(f"{k}={gd.get(k,0)}" for k in "ABCD") + "\n")

cur = None
for r in rows:
    if r["section"] != cur:
        cur = r["section"]
        print(f"\n━━━ {SECTION_LABEL[cur]} ({sum(1 for x in rows if x['section']==cur)}개) ━━━")
    print(f"  [{r['grade']}] {r['avg']:>5} | a1={r['a1']:>2}({r['a1tier'][:4]}) a2={r['a2']:>2} a3={r['a3']:>2} a4={r['a4']:>3} | {r['pillar']} | {r['comp']}")
    print(f"          {r['title'][:60]}")
