#!/usr/bin/env python3
"""SquidDashboard 위젯 일괄 메타 추출 + JSON v4 인벤토리."""
import sys, json
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from extract_value_chain_widgets import ROOT, COMP, extract_file


def main():
    targets = sorted({
        f for f in COMP.glob("*.tsx")
        if f.name.startswith("Squid")
    })

    out = []
    for f in targets:
        try:
            r = extract_file(f)
            if r["widget_count"] > 0 or r["api_calls"]:
                out.append(r)
        except Exception as e:
            out.append({"file": str(f.relative_to(ROOT)), "error": str(e)})

    (ROOT / "artifacts" / "squid_widget_inventory.json").write_text(
        json.dumps(out, ensure_ascii=False, indent=2)
    )

    # JSON 위젯
    js_path = ROOT / "public/data/squid_real_data_v4.json"
    if js_path.exists():
        d = json.loads(js_path.read_text())
        widgets = d.get("widgets", [])
        extracted = []
        for w in widgets:
            extracted.append({
                "id": w.get("id"),
                "title": w.get("title"),
                "subtitle": (w.get("subtitle") or "")[:300],
                "unit": w.get("unit"),
                "reliability": w.get("reliability"),
                "source": (w.get("source") or "")[:200],
                "chartType": w.get("chartType"),
                "sit_len": len(w.get("sit") or ""),
                "strat_len": len(w.get("strat") or ""),
                "logic_len": len(w.get("logic") or ""),
                "data_rows": len(w.get("data") or []),
            })
        (ROOT / "artifacts" / "squid_json_widgets.json").write_text(
            json.dumps({
                "json_file": "public/data/squid_real_data_v4.json",
                "total_kpis": len(d.get("kpis", {})),
                "total_widgets": len(widgets),
                "widgets": extracted,
            }, ensure_ascii=False, indent=2)
        )
        print(f"JSON 위젯: {len(widgets)}")

    total_widgets = sum(r.get("widget_count", 0) for r in out)
    total_apis = len({a for r in out for a in r.get("api_calls", [])})
    with_telemetry = sum(
        1 for r in out for w in r.get("widgets", []) if w.get("telemetry")
    )
    print(f"TSX files: {len(out)} | Widgets: {total_widgets} | Telemetry: {with_telemetry} | APIs: {total_apis}")


if __name__ == "__main__":
    main()
