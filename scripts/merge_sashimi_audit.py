#!/usr/bin/env python3
"""Merge deterministic 4-Axis scores with forensic credibility verdicts
into a final blended reliability scoreboard for sashimi-steak widgets."""
import json, csv, re, os

inv = json.load(open("artifacts/sashimi_widget_inventory.json", encoding="utf-8"))
forensic = json.load(open("artifacts/sashimi_forensic_raw.json", encoding="utf-8"))["result"]

def norm(c):
    c = re.sub(r"\s*\(W-?SAS.*$", "", c, flags=re.I)
    c = re.sub(r"\s*\(W-.*$", "", c)
    c = re.sub(r"\.tsx$", "", c)
    return c.strip()

# forensic per-widget keyed by normalized comp
fmap = {}
for w in forensic["widgets"]:
    fmap[norm(w.get("comp", ""))] = w

# tier -> refined a1
TIER_A1 = {"primary": 90, "secondary": 75, "internal": 60, "none": 40}

# confirmed claim-level issues (post adversarial verification) -> widget tags
CONFIRMED = {
    "SasTriadDynamics":      ("$908M vs $841M 동일지표 상충 — 유령/미커밋 출처", "EDIT"),
    "SasGlobalHotspots":     ("$908M 동일지표 라벨 불일치 (scope 미명시)", "EDIT"),
    "SasFourCountryComparison": ("$908M 동일지표 라벨 불일치 (scope 미명시)", "EDIT"),
    "SasHawaiiDomesticNiche":("$12~14/lb를 경매 '평균'으로 과대표기 (실제 평균 ~$4/lb, $12~14는 프리미엄 등급 상한)", "EDIT"),
}

rows = []
for r in inv:
    comp = r["comp"]
    f = fmap.get(comp, {})
    tier = f.get("source_tier", "")
    # refine a1 from forensic source tier when available (corrects token-match false negatives)
    a1 = TIER_A1.get(tier, r["a1"])
    a2, a3, a4 = r["a2"], r["a3"], r["a4"]
    avg = round((a1 + a2 + a3 + a4) / 4, 1)
    grade = "A" if avg >= 85 else "B" if avg >= 75 else "C" if avg >= 65 else "D"
    cred = f.get("credibility", None)
    issue, action = CONFIRMED.get(comp, ("", ""))
    rows.append(dict(
        section=r["section"], comp=comp, id=r["id"], pillar=r["pillar"], title=r["title"],
        sync=r["sync"], a1_det=r["a1"], a1=a1, a2=a2, a3=a3, a4=a4, avg=avg, grade=grade,
        tier=tier, supp=f.get("source_supports_claim",""), plaus=f.get("claim_plausible",""),
        cred=cred, flags=f.get("flags",[]), issue=issue, action=action,
    ))

SEC_ORDER = ["korea","global","us","ukth","eu","japan","price","export","outlook"]
SEC_LABEL = {"korea":"🇰🇷 한국","global":"🌍 글로벌","us":"🇺🇸 미국","ukth":"🇬🇧🇹🇭 영국/태국",
             "eu":"🇪🇺 유럽","japan":"🇯🇵 일본","price":"💰 가격/어종","export":"🎯 수출전략","outlook":"🔮 전망2030"}
rows.sort(key=lambda r:(SEC_ORDER.index(r["section"]), -r["avg"]))

# Final CSV
with open("artifacts/sashimi_4axis_scores.csv","w",newline="",encoding="utf-8") as fp:
    w=csv.writer(fp)
    w.writerow(["section","comp","id","pillar","title","syncDate",
                "a1_struct","a1_refined","a2_fresh","a3_verify","a4_integ","avg","grade",
                "src_tier","supports","plausible","forensic_cred","flags","confirmed_issue","action"])
    for r in rows:
        w.writerow([r["section"],r["comp"],r["id"],r["pillar"],r["title"],r["sync"],
                    r["a1_det"],r["a1"],r["a2"],r["a3"],r["a4"],r["avg"],r["grade"],
                    r["tier"],r["supp"],r["plaus"],r["cred"],"|".join(r["flags"]),r["issue"],r["action"]])

# Console
avg_all=round(sum(r["avg"] for r in rows)/len(rows),1)
gd={}
for r in rows: gd[r["grade"]]=gd.get(r["grade"],0)+1
cred_vals=[r["cred"] for r in rows if r["cred"] is not None]
cred_avg=round(sum(cred_vals)/len(cred_vals),1) if cred_vals else 0
print(f"=== 최종 블렌디드 스코어보드 ({len(rows)}개) ===")
print(f"4-Axis 정련 평균: {avg_all} | 등급: "+" ".join(f"{k}={gd.get(k,0)}" for k in 'ABCD'))
print(f"포렌식 credibility 평균: {cred_avg}")
print(f"a1 정련으로 상향된 위젯: "+", ".join(r['comp'] for r in rows if r['a1']>r['a1_det']))
print(f"a1 정련으로 하향된 위젯: "+(", ".join(r['comp'] for r in rows if r['a1']<r['a1_det']) or "없음"))
print()
cur=None
for r in rows:
    if r["section"]!=cur:
        cur=r["section"]
        secrows=[x for x in rows if x["section"]==cur]
        secavg=round(sum(x["avg"] for x in secrows)/len(secrows),1)
        print(f"\n━━ {SEC_LABEL[cur]} (n={len(secrows)}, 평균 {secavg}) ━━")
    star=" ⚠️CONFIRMED" if r["issue"] else ""
    cred=f"{r['cred']:>3}" if r["cred"] is not None else " - "
    print(f"  [{r['grade']}] 4ax={r['avg']:>5} cred={cred} | a1={r['a1']:>2}({r['tier'][:4]}) a2={r['a2']:>2} a3={r['a3']} a4={r['a4']:>3} | {r['comp']}{star}")

print("\n=== ⚠️ Confirmed 이슈 (적대적 재검증 통과) ===")
for r in rows:
    if r["issue"]:
        print(f"  • {r['comp']} [{r['action']}] — {r['issue']}")
