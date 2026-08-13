#!/usr/bin/env python3
"""Phase 0 — 고등어 위젯 원장 생성.

렌더되는 위젯 90건(JSON 83 + TSX 7) + 죽은 TSX 16건을 한 표로 모으고,
각각에 4-Axis 점수 / 데이터 최신연도 / 아카이브 소스 매핑 / 판정안을 붙인다.

출력: docs/mackerel_widget_ledger.csv
"""
import csv
import json
import re
import sys
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DASH = ROOT / "components" / "MackerelDashboard.tsx"
V13 = ROOT / "public" / "data" / "mackerel_real_data_v13.json"
INV = ROOT / "artifacts" / "mackerel_widget_inventory.json"
OUT = ROOT / "docs" / "mackerel_widget_ledger.csv"

# ── 아카이브 소스 원장(source_registry.csv)의 source_id ↔ 위젯 키워드 ──
# 위에 있을수록 우선. 첫 매치 하나만 채택한다.
SOURCE_MAP = [
    ("ICES_ATLANTIC_MACKEREL", ["ices", "tac", "쿼터", "자원평가", "자원량", "어획권고", "북동대서양"]),
    ("NPFC_CHUB_MACKEREL", ["npfc", "태평양참고등어", "북태평양"]),
    ("MSC_MACKEREL_FISHERIES", ["msc", "인증", "지속가능", "esg", "iuu", "남획"]),
    ("MFDS_IMPORTED_FOOD", ["부적합", "검역", "식품안전", "방사능", "후쿠시마", "위생", "haccp", "잔류"]),
    ("KCS_NITEMTRADE", ["관세청", "kcs", "통관", "hs10", "trq", "보세", "체화"]),
    ("USDA_GATS_US_IMPORTS", ["미국", "usda", "amazon", "walmart", "kroger", "북미"]),
    ("NORWEGIAN_SEAFOOD_EXPORTS", ["노르웨이", "norway", "nsc"]),
    ("KMI_FISHDATA_PRICE", ["kamis", "소매", "국내 가격", "도매", "산지", "위판", "공동어시장", "소비자"]),
    ("EUMOFA_MARKET", ["eumofa", "유럽", "네덜란드", "가치사슬", "가격 피라미드"]),
    ("FAO_GLOBEFISH_SMALL_PELAGICS", ["globefish", "소형부어류"]),
    ("KMI_FISHERIES_OUTLOOK", ["fta", "전망", "outlook"]),
    ("FAO_FISHSTAT_TRADE_PP", ["가공", "필렛", "통조림", "훈제", "염장", "어분", "fishmeal", "surimi", "hmr", "자반"]),
    ("FAO_FISHSTAT_TRADE_PARTNERS", ["파트너", "상대국", "국가별 수출", "국가별 수입", "매트릭스", "플로우", "sankey", "중계", "목적지", "수출시장"]),
    ("UN_COMTRADE_HS", ["comtrade", "hs 03", "030354", "030244", "160415"]),
    ("FAO_FISHSTAT_TRADE", ["수출", "수입", "무역", "교역", "단가", "trade", "관세"]),
    ("FAO_FISHSTAT_CAPTURE", ["어획", "조업", "capture", "어종", "scomber", "연근해"]),
    ("FAO_FISHSTAT_GLOBAL_PRODUCTION", ["양식", "aquaculture", "생산", "자급률"]),
]

# ── 중복 묶음(기획서 4.3) ──
MERGE_GROUPS = {
    "블랙홀·신흥시장": ["블랙홀", "신흥", "emerging"],
    "네덜란드 중계무역": ["네덜란드"],
    "아프리카 수출": ["아프리카", "가나", "나이지리아", "ghana", "nigeria"],
    "노르웨이 의존": ["노르웨이", "norway"],
}

SRC_TOKENS = [
    "FAO", "FishStat", "ICES", "NPFC", "MSC", "EUMOFA", "GLOBEFISH", "USDA", "NOAA",
    "UN Comtrade", "Comtrade", "KCS", "관세청", "MOF", "해양수산부", "KMI", "KAMIS",
    "KOSIS", "통계청", "MFDS", "식약처", "OEC", "WITS", "Eurostat", "ECOS", "SOFIA",
    "OECD", "INFOFISH", "Seafish", "NSC", "Norwegian Seafood", "수협", "KATI", "aT",
]


def axis1_source(text):
    if not text:
        return 50
    hit = sum(1 for t in SRC_TOKENS if t.lower() in text.lower())
    if hit >= 2:
        return 95
    if hit == 1:
        return 80
    if len(text) >= 30:
        return 65
    return 50


def axis2_freshness(year):
    if year is None:
        return 55
    if year >= 2026:
        return 95
    if year == 2025:
        return 75
    if year == 2024:
        return 70
    return 40


def axis3_verify(status):
    return {"LIVE": 95, "SYNCED": 80, "STATIC": 55}.get((status or "").upper(), 55)


def axis4_completeness(pillar, desc, has_source):
    score = 0
    if pillar:
        score += 35
    if desc and len(desc) >= 30:
        score += 35
    if has_source:
        score += 30
    return min(score, 100)


def grade(avg):
    return "A" if avg >= 85 else "B" if avg >= 75 else "C" if avg >= 65 else "D"


def latest_year(widget):
    """위젯 data 배열에서 가장 큰 연도를 찾는다. 없으면 None."""
    years = []
    for row in widget.get("data") or []:
        if not isinstance(row, dict):
            continue
        for v in row.values():
            for m in re.finditer(r"\b(19[89]\d|20[0-4]\d)\b", str(v)):
                years.append(int(m.group(1)))
    # subtitle/source의 연도는 데이터 범위가 아니라 발행연도일 수 있어 후순위
    if not years:
        blob = f"{widget.get('subtitle', '')} {widget.get('source', '')}"
        years = [int(m.group(1)) for m in re.finditer(r"\b(20[0-4]\d)\b", blob)]
    return max(years) if years else None


def map_source(text):
    low = text.lower()
    for source_id, kws in SOURCE_MAP:
        if any(k in low for k in kws):
            return source_id
    return ""


def merge_group(text):
    low = text.lower()
    hits = [g for g, kws in MERGE_GROUPS.items() if any(k in low for k in kws)]
    return hits[0] if hits else ""


def verdict(rendered, source_id, year, group, dup_count):
    if not rendered:
        return "DELETE", "렌더되지 않는 죽은 컴포넌트"
    if group and dup_count >= 2:
        return "MERGE", f"'{group}' 중복 {dup_count}건 — 기간·정의 통일 후 통합"
    if source_id and (year or 0) >= 2024:
        return "KEEP", "아카이브 소스 매핑 + 2024년 이후 데이터"
    if source_id:
        return "EDIT", f"{source_id} 로 재생성 필요 (현재 최신 {year or '미상'})"
    if (year or 0) >= 2024:
        return "EDIT", "데이터는 최신이나 아카이브 소스 매핑 실패 — 출처 보강 필요"
    return "DELETE", f"아카이브 근거 없음 + 데이터 {year or '미상'}년"


def parse_pillar_map():
    src = DASH.read_text()
    m = re.search(r"PILLAR_WIDGET_IDS[^=]*=\s*\{(.*?)\n\};", src, re.S)
    out = {}
    for pillar, body in re.findall(r"(S\d):\s*\[(.*?)\]", m.group(1), re.S):
        for wid in re.findall(r"'([^']+)'", body):
            out[wid] = pillar
    return out


def parse_rendered_tsx():
    src = DASH.read_text()
    return set(re.findall(r"^import (Mackerel\w+) from", src, re.M))


def main():
    pillar_of = parse_pillar_map()
    rendered_tsx = parse_rendered_tsx()
    v13 = json.loads(V13.read_text())
    inventory = json.loads(INV.read_text()) if INV.exists() else []

    rows = []

    # ── JSON 위젯 ──
    for w in v13["widgets"]:
        wid = w["id"]
        # 소스·중복 매핑은 위젯의 '주제'만 본다. sit/strat 서사까지 넣으면 과탐한다.
        topic = f"{w.get('title') or ''} {w.get('subtitle') or ''}"
        rows.append({
            "kind": "JSON",
            "ref": f"public/data/mackerel_real_data_v13.json#{wid}",
            "id": wid,
            "pillar": pillar_of.get(wid, ""),
            "rendered": "Y" if wid in pillar_of else "N",
            "title": w.get("title", ""),
            "chart": w.get("chartType", ""),
            "current_source": (w.get("source") or "")[:120],
            "self_reliability": w.get("reliability", ""),
            "latest_year": latest_year(w),
            "telemetry_status": "STATIC",
            "desc": w.get("subtitle") or "",
            "has_source": bool(w.get("source")),
            "_topic": topic,
        })

    # ── TSX 위젯 ──
    inv_by_file = {r["file"]: r for r in inventory}
    for path in sorted((ROOT / "components").glob("Mackerel*.tsx")):
        name = path.stem
        if name == "MackerelDashboard":
            continue
        rel = f"components/{path.name}"
        rec = inv_by_file.get(rel, {})
        widgets = rec.get("widgets") or [{}]
        for w in widgets:
            tel = w.get("telemetry") or {}
            desc = w.get("cardDesc") or ""
            sync = str(tel.get("syncDate") or "")
            yrs = [int(m.group(1)) for m in re.finditer(r"\b(20[0-4]\d)\b", sync + " " + desc)]
            rows.append({
                "kind": "TSX",
                "ref": f"{rel}:{w.get('line', '')}",
                "id": name,
                "pillar": w.get("pillar") or "",
                "rendered": "Y" if name in rendered_tsx else "N",
                "title": w.get("title") or name,
                "chart": "",
                "current_source": sync[:120],
                "self_reliability": "",
                "latest_year": max(yrs) if yrs else None,
                "telemetry_status": tel.get("status") or "",
                "desc": desc,
                "has_source": bool(tel),
                "_topic": f"{w.get('title') or name} {desc}",
            })

    # ── 매핑·중복 판정 ──
    for r in rows:
        r["archive_source_id"] = map_source(r["_topic"])
        r["merge_group"] = merge_group(r["title"]) if r["rendered"] == "Y" else ""

    group_counts = Counter(r["merge_group"] for r in rows if r["merge_group"])

    for r in rows:
        a1 = axis1_source(f"{r['desc']} {r['current_source']}")
        a2 = axis2_freshness(r["latest_year"])
        a3 = axis3_verify(r["telemetry_status"])
        a4 = axis4_completeness(r["pillar"], r["desc"], r["has_source"])
        avg = round((a1 + a2 + a3 + a4) / 4, 1)
        r.update(axis1=a1, axis2=a2, axis3=a3, axis4=a4, avg=avg, grade=grade(avg))
        v, why = verdict(
            r["rendered"] == "Y", r["archive_source_id"], r["latest_year"],
            r["merge_group"], group_counts.get(r["merge_group"], 0),
        )
        r["verdict"] = v
        r["reason"] = why

    cols = ["kind", "ref", "id", "pillar", "rendered", "title", "chart",
            "latest_year", "telemetry_status", "self_reliability", "current_source",
            "archive_source_id", "merge_group",
            "axis1", "axis2", "axis3", "axis4", "avg", "grade", "verdict", "reason"]
    OUT.parent.mkdir(exist_ok=True)
    with OUT.open("w", newline="", encoding="utf-8-sig") as f:
        wtr = csv.DictWriter(f, fieldnames=cols, extrasaction="ignore")
        wtr.writeheader()
        wtr.writerows(rows)

    # ── 요약 ──
    live = [r for r in rows if r["rendered"] == "Y"]
    print(f"✓ 원장: {OUT.relative_to(ROOT)}  (총 {len(rows)}행 / 렌더 {len(live)})")
    print(f"  4-Axis 평균(렌더분): {round(sum(r['avg'] for r in live) / len(live), 1)}")
    print("  등급:", dict(sorted(Counter(r["grade"] for r in live).items())))
    print("  판정:", dict(sorted(Counter(r["verdict"] for r in rows).items())))
    print("  아카이브 매핑:", f"{sum(1 for r in live if r['archive_source_id'])}/{len(live)}")
    by_src = Counter(r["archive_source_id"] for r in live if r["archive_source_id"])
    for k, v in by_src.most_common():
        print(f"    {k:36s} {v}")
    unmapped = [r for r in live if not r["archive_source_id"]]
    print(f"  미매핑 렌더 위젯 {len(unmapped)}건:", [r["id"] for r in unmapped][:20])

    # ── 병합 검토용: 같은 아카이브 소스를 공유하는 위젯끼리 묶어 눈으로 보게 한다 ──
    clusters = defaultdict(list)
    for r in live:
        clusters[r["archive_source_id"] or "(미매핑)"].append(r)
    md = ["# 고등어 위젯 병합 검토표", "",
          f"기준: {len(live)}건 렌더. 같은 아카이브 소스를 쓰는 위젯을 한 묶음으로 본다.",
          "3건 이상 묶인 곳이 중복이 몰린 지점이다.", ""]
    for src, items in sorted(clusters.items(), key=lambda kv: -len(kv[1])):
        md.append(f"## {src} — {len(items)}건")
        md.append("")
        md.append("| id | pillar | 최신연도 | 등급 | 판정 | 제목 |")
        md.append("|---|---|---:|---|---|---|")
        for r in sorted(items, key=lambda x: (x["pillar"], x["id"])):
            md.append(f"| {r['id']} | {r['pillar']} | {r['latest_year'] or '-'} | "
                      f"{r['grade']} | {r['verdict']} | {r['title'][:60]} |")
        md.append("")
    mpath = ROOT / "docs" / "mackerel_merge_candidates.md"
    mpath.write_text("\n".join(md), encoding="utf-8")
    print(f"✓ 병합 검토표: {mpath.relative_to(ROOT)}")


if __name__ == "__main__":
    sys.exit(main())
