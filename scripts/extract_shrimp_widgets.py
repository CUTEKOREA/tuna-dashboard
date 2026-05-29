#!/usr/bin/env python3
"""ShrimpDashboard 위젯 일괄 메타 추출."""
import sys, json
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from extract_value_chain_widgets import ROOT, COMP, extract_file


def main():
    targets = sorted({f for f in COMP.glob("*.tsx") if f.name.startswith("Shrimp")})
    out = []
    for f in targets:
        try:
            r = extract_file(f)
            if r["widget_count"] > 0 or r["api_calls"]:
                out.append(r)
        except Exception as e:
            out.append({"file": str(f.relative_to(ROOT)), "error": str(e)})
    (ROOT / "artifacts" / "Shrimp_widget_inventory.json").write_text(
        json.dumps(out, ensure_ascii=False, indent=2)
    )

    # JSON 위젯 데이터 (v4 우선)
    for fname in ["shrimp_real_data_v3.json", "shrimp_real_data_v2.json"]:
        js_path = ROOT / "public/data" / fname
        if js_path.exists():
            d = json.loads(js_path.read_text())
            widgets = d.get("widgets", [])
            extracted = []
            for w in widgets:
                extracted.append({
                    "id": w.get("id"),
                    "title": w.get("title"),
                    "subtitle": (w.get("subtitle") or "")[:300],
                    "telemetry": w.get("telemetry"),
                    "syncDate": w.get("syncDate"),
                    "source": w.get("source"),
                    "pillar": w.get("pillar"),
                })
            (ROOT / "artifacts" / f"Shrimp_json_widgets_{fname.replace('.json','')}.json").write_text(
                json.dumps(extracted, ensure_ascii=False, indent=2)
            )
            print(f"  ✓ {fname}: {len(widgets)} 위젯 추출")

    print(f"\n총 TSX: {len(out)} 파일")
    print(f"inventory → artifacts/Shrimp_widget_inventory.json")


if __name__ == "__main__":
    main()
