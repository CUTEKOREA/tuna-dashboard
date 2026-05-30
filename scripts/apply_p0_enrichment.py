#!/usr/bin/env python3
"""
P0 위젯 보완 일괄 적용 (agri_data enrichment, 2026-05-30) — 룰북 L-07.

워크플로우 value-chain-p0-editspecs 의 편집 스펙(완성 위젯 JSON)을
public/data/tuna_real_data_v3.json 에 반영한다.
- applyTarget=='json': action edit → id로 위젯 교체 / action new → 배열에 추가
- applyTarget=='route': 스킵 (route.ts 는 별도 수동 Edit)
원본은 .bak_pre_p0 로 백업.
"""
import json, shutil, sys
from pathlib import Path

REPO = Path("/Users/idong-geon/연구자동화애이전트들/tuna-dashboard")
DATA = REPO / "public/data/tuna_real_data_v3.json"
SPECS_OUT = Path(sys.argv[1]) if len(sys.argv) > 1 else None

if not SPECS_OUT or not SPECS_OUT.exists():
    sys.exit(f"스펙 출력 파일 경로 필요: {SPECS_OUT}")

specs = json.loads(SPECS_OUT.read_text(encoding="utf-8"))["result"]["specs"]
doc = json.loads(DATA.read_text(encoding="utf-8"))
widgets = doc["widgets"]
idx = {w.get("id"): i for i, w in enumerate(widgets)}

# 백업
backup = DATA.with_suffix(".json.bak_pre_p0")
shutil.copy2(DATA, backup)

before = len(widgets)
edited, added, skipped = [], [], []

for s in specs:
    if s.get("error"):
        skipped.append(f"{s['widgetId']} (스펙 실패)")
        continue
    if s["applyTarget"] != "json":
        skipped.append(f"{s['widgetId']} (target={s['applyTarget']}, 별도 처리)")
        continue
    w = json.loads(s["widgetJson"])
    wid = w["id"]
    if s["action"] == "edit":
        if wid in idx:
            widgets[idx[wid]] = w
            edited.append(wid)
        else:
            widgets.append(w); added.append(f"{wid} (edit인데 미존재 → 추가)")
    elif s["action"] == "new":
        if wid in idx:
            widgets[idx[wid]] = w; edited.append(f"{wid} (new인데 존재 → 교체)")
        else:
            widgets.append(w); added.append(wid)

DATA.write_text(json.dumps(doc, ensure_ascii=False, indent=2), encoding="utf-8")

print(f"백업: {backup.name}")
print(f"위젯 수: {before} → {len(widgets)}")
print(f"편집({len(edited)}): {', '.join(edited)}")
print(f"추가({len(added)}): {', '.join(added)}")
print(f"스킵({len(skipped)}): {', '.join(skipped)}")
