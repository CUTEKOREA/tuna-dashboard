#!/usr/bin/env python3
"""
salmon v4 위젯의 허위 LIVE 라벨 일괄 정직화 (룰북 L-07/L-09).
source/cardDesc/methodology 문자열의 '[📡 LIVE API 연동: ...]' 마커를 제거하고,
정직 telemetry(SYNCED, syncDate 2026-05)를 부여한다. 데이터(수치)는 건드리지 않음.
원본은 .bak_pre_p0 백업.
"""
import json, re, shutil
from pathlib import Path

P = Path("/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/public/data/salmon_real_data_v4.json")
d = json.loads(P.read_text(encoding="utf-8"))
shutil.copy2(P, P.with_suffix(".json.bak_pre_p0"))

# '[📡 LIVE API 연동: ...]' 또는 '[LIVE API 연동: ...]' 마커
MARKER = re.compile(r"\s*\[\s*📡?\s*LIVE API 연동[^\]]*\]")
REALTIME = re.compile(r"\s*[·,]?\s*실시간 연동중\s*")

def clean(s):
    if not isinstance(s, str):
        return s, False
    o = s
    s = MARKER.sub("", s)
    s = REALTIME.sub("", s)
    s = re.sub(r"\s*·\s*·\s*", " · ", s)        # 빈 구분자 정리
    s = re.sub(r"^\s*·\s*|\s*·\s*$", "", s)       # 양끝 구분자
    s = re.sub(r"\s{2,}", " ", s).strip()
    return s, (s != o)

fixed = []
for w in d["widgets"]:
    changed = False
    for f in ("source", "cardDesc", "methodology", "subtitle"):
        if f in w:
            w[f], c = clean(w[f]); changed = changed or c
    # telemetry 정직화
    t = w.get("telemetry")
    if t == "live" or (isinstance(t, dict) and t.get("status") in ("live", "LIVE")):
        w["telemetry"] = "synced"; changed = True
    if changed:
        if "telemetry" not in w or w.get("telemetry") in (None, "", "live"):
            w["telemetry"] = "synced"
        w.setdefault("syncDate", "2026-05")
        fixed.append(w.get("id"))

P.write_text(json.dumps(d, ensure_ascii=False, indent=2), encoding="utf-8")
json.loads(P.read_text(encoding="utf-8"))  # 재파싱 검증
# 잔존 마커 확인
remaining = sum(1 for w in d["widgets"] if re.search(r"LIVE API 연동", json.dumps(w, ensure_ascii=False)))
print(f"백업: {P.name}.bak_pre_p0")
print(f"허위 LIVE 라벨 정정: {len(fixed)}건 → {', '.join(fixed)}")
print(f"잔존 'LIVE API 연동' 위젯: {remaining} (0이어야 정상)")
