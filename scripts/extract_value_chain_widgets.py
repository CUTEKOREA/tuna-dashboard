#!/usr/bin/env python3
"""
value-chain (TunaDashboard) 위젯 일괄 메타 추출 v2.
ADR-0005 WidgetCard 패턴 (props: pillar, cardDesc, unit, telemetry, takeaway) 지원.
출력: artifacts/value_chain_widget_inventory.json
"""
import json
import re
from pathlib import Path

ROOT = Path("/Users/idong-geon/연구자동화애이전트들/tuna-dashboard")
COMP = ROOT / "components"


def find_widgetcards(src: str):
    """파일 내 모든 <WidgetCard ...> JSX 블록을 추출."""
    widgets = []
    # WidgetCard 시작 위치
    for m in re.finditer(r"<WidgetCard\b", src):
        start = m.start()
        # 매칭 짝 찾기 (간단히: JSX 닫힘 />) or </WidgetCard>)
        # 같은 깊이에서 첫 번째 '/>'까지
        depth = 0
        i = start
        block_end = None
        while i < len(src):
            if src[i:i+2] == "<W":
                depth += 1
            elif src[i:i+2] == "/>" and depth == 1:
                block_end = i + 2
                break
            elif src[i:i+2] == "</":
                depth -= 1
                if depth == 0:
                    # find next >
                    block_end = src.index(">", i) + 1
                    break
            i += 1
        if block_end is None:
            # fallback: 1000자 청크
            block_end = min(start + 5000, len(src))
        block = src[start:block_end]
        line_no = src[:start].count("\n") + 1
        widgets.append({"line": line_no, "block": block})
    return widgets


def parse_prop(block: str, prop_name: str, max_len: int = 800):
    """단순 prop= 값 추출 (string, template, object 일부)."""
    # title="..." 또는 title={`...`} 또는 title={"..."}
    patterns = [
        rf'{prop_name}=\s*"([^"]{{1,{max_len}}})"',
        rf"{prop_name}=\s*'([^']{{1,{max_len}}})'",
        rf"{prop_name}=\s*\{{\s*[`'\"]([^`'\"]{{1,{max_len}}})[`'\"]\s*\}}",
    ]
    for p in patterns:
        m = re.search(p, block, re.S)
        if m:
            return m.group(1).strip()
    return None


def parse_telemetry(block: str):
    """telemetry={{ status: 'LIVE', syncDate: '...' }} 파싱."""
    m = re.search(
        r"telemetry=\s*\{\{[^}]*?status:\s*['\"`](\w+)['\"`][^}]*?syncDate:\s*['\"`]([^'\"`]+)['\"`]",
        block,
        re.S,
    )
    if m:
        return {"status": m.group(1), "syncDate": m.group(2)}
    return None


def parse_takeaway(block: str):
    """takeaway={{ situation: '...', actionPlan: '...' }} 파싱."""
    # situation: `template` 또는 'string'
    m_sit = re.search(
        r"situation:\s*[`'\"]((?:[^`'\"]|\\.){10,4000})[`'\"]",
        block,
        re.S,
    )
    m_tak = re.search(
        r"actionPlan:\s*[`'\"]((?:[^`'\"]|\\.){10,4000})[`'\"]",
        block,
        re.S,
    )
    if m_sit or m_tak:
        return {
            "situation": (m_sit.group(1)[:1500] if m_sit else None),
            "actionPlan": (m_tak.group(1)[:1500] if m_tak else None),
        }
    return None


def extract_file(filepath: Path):
    src = filepath.read_text()
    file_rel = str(filepath.relative_to(ROOT))

    # WidgetCard 블록들
    blocks = find_widgetcards(src)
    widget_records = []
    for b in blocks:
        rec = {
            "line": b["line"],
            "title": parse_prop(b["block"], "title", 200),
            "pillar": parse_prop(b["block"], "pillar", 10),
            "cardDesc": parse_prop(b["block"], "cardDesc", 500),
            "unit": parse_prop(b["block"], "unit", 100),
            "telemetry": parse_telemetry(b["block"]),
            "takeaway": parse_takeaway(b["block"]),
        }
        if rec["title"] or rec["cardDesc"]:
            widget_records.append(rec)

    # API 호출 추출 (fetch path)
    api_calls = sorted(set(re.findall(
        r"fetch\(\s*['\"`](\/api\/[^'\"`?]+)",
        src,
    )))

    # 외부 import URL (출처 단서)
    external_urls = sorted(set(re.findall(
        r"https?:\/\/[^\s\"'<>)]+",
        src,
    )))[:20]

    return {
        "file": file_rel,
        "widget_count": len(widget_records),
        "widgets": widget_records,
        "api_calls": api_calls,
        "external_urls": external_urls,
    }


def main():
    # 대상: Tuna* + value-chain에 import되는 외부 파일들
    targets = sorted({
        f for f in COMP.glob("*.tsx")
        if (f.name.startswith("Tuna")
            or f.name in {
                "PacificEezStrategicWidget.tsx",
                "PetFoodDashboard.tsx",
                "UsTunaImportWidget.tsx",
                "UsTunaMarketShareWidget.tsx",
                "UsPolicyImpactWidget.tsx",
                "UsPollockDetourWidget.tsx",
            })
    })

    out = []
    for f in targets:
        try:
            r = extract_file(f)
            if r["widget_count"] > 0 or r["api_calls"]:
                out.append(r)
        except Exception as e:
            out.append({"file": str(f.relative_to(ROOT)), "error": str(e)})

    artifact = ROOT / "artifacts" / "value_chain_widget_inventory.json"
    artifact.parent.mkdir(exist_ok=True)
    artifact.write_text(json.dumps(out, ensure_ascii=False, indent=2))

    total_widgets = sum(r.get("widget_count", 0) for r in out)
    total_apis = len({a for r in out for a in r.get("api_calls", [])})
    with_telemetry = sum(
        1 for r in out for w in r.get("widgets", []) if w.get("telemetry")
    )
    with_takeaway = sum(
        1 for r in out for w in r.get("widgets", []) if w.get("takeaway")
    )

    print(f"✓ Inventory written: {artifact}")
    print(f"  Files with widgets: {len(out)}")
    print(f"  Total WidgetCard instances: {total_widgets}")
    print(f"  With TelemetryBadge: {with_telemetry}")
    print(f"  With Takeaway: {with_takeaway}")
    print(f"  Unique API routes: {total_apis}")


if __name__ == "__main__":
    main()
