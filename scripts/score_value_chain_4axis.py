#!/usr/bin/env python3
"""value-chain 4-Axis Forensic Audit 스코어러 (widget-audit Phase 2).
입력: artifacts/value_chain_widget_inventory.json (extract_value_chain_widgets.py 산출)
출력: artifacts/value_chain_4axis_scores.csv
룰: widget-audit SKILL 4-Axis 기준.
"""
import json, csv, re
from pathlib import Path

ROOT = Path("/Users/idong-geon/연구자동화애이전트들/tuna-dashboard")
INV = ROOT / "artifacts" / "value_chain_widget_inventory.json"
OUT = ROOT / "artifacts" / "value_chain_4axis_scores.csv"

# 1차 출처 토큰 (cardDesc에 명시되면 출처 신뢰도↑)
# 2026-06-04 보정: 미국·EU·국제기구 출처 누락으로 false D-grade 발생 → 확장.
SRC_TOKENS = ["FAO","ISSF","WCPFC","ICCAT","IATTC","FFA","MOF","해양수산부","KCS","관세청",
              "WITS","OEC","EUMOFA","Comext","USDA","NOAA","ECOS","FishStat","KFAS","KMI","KAMIS",
              "Comtrade","UN Comtrade","Atuna","KOSIS","DART","KREI","WCPO","PNA","VDS",
              "Census Bureau","US Census","USITC","USTR","Eurostat","World Bank","IFC","AfDB",
              "MSC","ANFACO","aT","농수산식품유통공사","CBP","ITC TradeMap","Bumble Bee","Thai Union"]

def axis1_source(card):
    if not card: return 50          # 동적/미상 → 중립
    hit = sum(1 for t in SRC_TOKENS if t.lower() in card.lower())
    if hit >= 2: return 95
    if hit == 1: return 80
    if len(card) >= 30: return 65    # 방법론은 있으나 1차출처 약함
    return 50

def axis2_freshness(tel):
    sd = (tel or {}).get("syncDate","") if tel else ""
    if "2026" in sd: return 95
    if "2025" in sd: return 75
    if "2024" in sd or re.search(r"real ?-?time|실시간", sd, re.I): return 70
    if re.search(r"202[0-3]|201\d", sd): return 40
    return 55                         # 미상

def axis3_verify(tel, dynamic):
    st = ((tel or {}).get("status","") or "").upper() if tel else ""
    if st == "LIVE": return 95
    if st == "SYNCED": return 80
    if st == "STATIC": return 55
    if dynamic: return 70             # 런타임 동적 부여
    return 55

def axis4_completeness(rec):
    score = 0
    if rec.get("pillar"): score += 35
    cd = rec.get("cardDesc") or ""
    if len(cd) >= 30: score += 35
    elif rec.get("dynamic"): score += 25   # 동적은 cardDesc 길이 측정 불가, 부분점
    if rec.get("telemetry"): score += 30
    return min(score, 100)

def grade(avg, dynamic=False):
    # 동적 위젯은 cardDesc/title이 런타임 주입이라 정적 채점 불가 → DYN(별도, D 아님)
    if dynamic:
        return "DYN"
    return "A" if avg>=85 else "B" if avg>=75 else "C" if avg>=65 else "D"

def main():
    data = json.loads(INV.read_text())
    rows = []
    for r in data:
        f = r["file"]
        for w in r.get("widgets", []):
            card = w.get("cardDesc")
            tel = w.get("telemetry")
            dyn = bool(w.get("dynamic"))
            a1 = axis1_source(card)
            a2 = axis2_freshness(tel)
            a3 = axis3_verify(tel, dyn)
            a4 = axis4_completeness(w)
            avg = round((a1+a2+a3+a4)/4, 1)
            rows.append({
                "file": f, "line": w["line"], "pillar": w.get("pillar") or "",
                "title": (w.get("title") or (("[동적]"+ (w.get("title_binding") or "")) if dyn else "")),
                "axis1_source": a1, "axis2_freshness": a2, "axis3_verify": a3,
                "axis4_completeness": a4, "avg": avg, "grade": grade(avg, dyn),
                "dynamic": "Y" if dyn else "",
            })
    with OUT.open("w", newline="", encoding="utf-8") as fp:
        wr = csv.DictWriter(fp, fieldnames=list(rows[0].keys()))
        wr.writeheader(); wr.writerows(rows)

    # 통계
    n = len(rows); avg_all = round(sum(r["avg"] for r in rows)/n, 1)
    from collections import Counter
    gc = Counter(r["grade"] for r in rows)
    pc = Counter(r["pillar"] for r in rows)
    print(f"✓ {OUT}")
    print(f"  위젯 {n}개 | 평균 {avg_all} ({grade(avg_all)})")
    print(f"  등급: A {gc['A']} / B {gc['B']} / C {gc['C']} / D {gc['D']} / DYN {gc['DYN']}(동적·정적채점불가)")
    print(f"  Pillar: {dict(sorted(pc.items()))}")
    print(f"  D등급(즉시정정):")
    for r in rows:
        if r["grade"] == "D":
            print(f"    - {r['file'].split('/')[-1]} L{r['line']} avg{r['avg']} :: {r['title'][:40]}")
    print(f"  동적 위젯: {sum(1 for r in rows if r['dynamic'])}개")

if __name__ == "__main__":
    main()
