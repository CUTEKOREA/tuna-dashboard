#!/usr/bin/env python3
"""
수산물 P0 위젯 보완 일괄 적용 (범용, 룰북 L-07).
사용: python3 apply_seafood_p0.py <editspecs_output.json> <data_json_path>

editspecs 워크플로우 출력의 result.specs 를 data JSON 의 .widgets 에 반영:
- applyTarget=='json' & action edit → id로 교체 / new → 추가
- applyTarget=='route' → 스킵(별도 처리)
원본은 .bak_pre_p0 백업.
"""
import json, shutil, sys
from pathlib import Path

if len(sys.argv) < 3:
    sys.exit("사용: apply_seafood_p0.py <specs_output.json> <data_json>")
OUT, DATA = Path(sys.argv[1]), Path(sys.argv[2])
if not OUT.exists() or not DATA.exists():
    sys.exit(f"파일 없음: {OUT if not OUT.exists() else DATA}")

specs = json.loads(OUT.read_text(encoding="utf-8"))["result"]["specs"]
doc = json.loads(DATA.read_text(encoding="utf-8"))
widgets = doc["widgets"]
idx = {w.get("id"): i for i, w in enumerate(widgets)}

shutil.copy2(DATA, DATA.with_suffix(".json.bak_pre_p0"))
before = len(widgets)
edited, added, skipped = [], [], []

for s in specs:
    if s.get("error"):
        skipped.append(f"{s['widgetId']}(스펙실패)"); continue
    if s.get("applyTarget") != "json":
        skipped.append(f"{s['widgetId']}(target={s.get('applyTarget')})"); continue
    w = json.loads(s["widgetJson"])
    wid = w["id"]
    if s["action"] == "edit":
        if wid in idx: widgets[idx[wid]] = w; edited.append(wid)
        else: skipped.append(f"{wid}(edit인데 JSON에 없음→스킵, TSX/route 동적 위젯 추정)")
    else:  # new
        if wid in idx: widgets[idx[wid]] = w; edited.append(f"{wid}(new→존재,교체)")
        else: widgets.append(w); added.append(wid)

DATA.write_text(json.dumps(doc, ensure_ascii=False, indent=2), encoding="utf-8")
print(f"백업: {DATA.name}.bak_pre_p0")
print(f"위젯 수: {before} → {len(widgets)}")
print(f"편집({len(edited)}): {', '.join(edited)}")
print(f"추가({len(added)}): {', '.join(added)}")
if skipped: print(f"스킵({len(skipped)}): {', '.join(skipped)}")
