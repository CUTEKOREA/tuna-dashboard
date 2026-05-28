#!/usr/bin/env python3
"""MackerelDashboard 위젯 일괄 메타 추출. extract_value_chain_widgets.py의 함수 재사용."""
import sys, json
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from extract_value_chain_widgets import (
    ROOT, COMP, extract_file
)


def main():
    targets = sorted({
        f for f in COMP.glob("*.tsx")
        if f.name.startswith("Mackerel")
    })

    out = []
    for f in targets:
        try:
            r = extract_file(f)
            if r["widget_count"] > 0 or r["api_calls"]:
                out.append(r)
        except Exception as e:
            out.append({"file": str(f.relative_to(ROOT)), "error": str(e)})

    artifact = ROOT / "artifacts" / "mackerel_widget_inventory.json"
    artifact.parent.mkdir(exist_ok=True)
    artifact.write_text(json.dumps(out, ensure_ascii=False, indent=2))

    total_widgets = sum(r.get("widget_count", 0) for r in out)
    total_apis = len({a for r in out for a in r.get("api_calls", [])})
    with_telemetry = sum(
        1 for r in out for w in r.get("widgets", []) if w.get("telemetry")
    )
    print(f"✓ Inventory: {artifact}")
    print(f"  Files: {len(out)} | Widgets: {total_widgets} | Telemetry: {with_telemetry} | APIs: {total_apis}")


if __name__ == "__main__":
    main()
