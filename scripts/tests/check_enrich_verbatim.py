#!/usr/bin/env python3
"""보강 값이 원응답에 글자 그대로 있는지 기계로 검사한다.

날조 검사는 판단이 아니라 대조다 — LLM 에 시킬 일이 아니다. 값·출처가 응답
텍스트에 포함되지 않으면 병합 과정에서 생겨난 것이고, 그건 곧 없는 사실이다.
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / "public/data/bangkok/seasia_processors.json"
# 기본 경로는 저장소 안이다. /tmp 에 의존하면 다른 에이전트나 CI 에서 못 돌고,
# 그러면 161개 주장을 아무도 재검증할 수 없다 — 원응답이 유일한 근거다.
RESP = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "docs/evidence/seasia-grok-2026-08-17"


def norm(s: str) -> str:
    """병합기와 같은 정규화를 쓴다. 병합기는 값에서 '**' 강조를 떼므로 원문에서도
    떼야 한다 — 안 그러면 멀쩡한 값 96칸이 전부 불일치로 나온다(검사기가 틀린 것)."""
    return re.sub(r"\s+", " ", s.replace("**", "")).strip()


def slug(s: str) -> str:
    return (re.sub(r"[^A-Za-z0-9]+", "-", s).strip("-").lower())[:44] or "x"


def main() -> int:
    if not RESP.exists():
        print(f"원응답 폴더 없음: {RESP} — 검사 건너뜀", file=sys.stderr)
        return 0
    doc = json.loads(DATA.read_text(encoding="utf8"))
    bad: list[str] = []
    checked = nosrc = 0

    for rep in doc["countries"].values():
        for row in rep["profiles"]:
            name = ((row.get("회사/등기") or row.get("회사/세번·DL") or {}).get("v") or "").strip()
            f = RESP / f"{slug(name)}.txt"
            if not name or not f.exists():
                continue
            body = norm(f.read_text(encoding="utf8", errors="replace"))
            for key, cell in row.items():
                e = cell.get("enrich")
                if not e:
                    continue
                checked += 1
                txt = e.get("value") or e.get("note") or ""
                if norm(txt) not in body:
                    bad.append(f"{name} · {key} · 값이 응답에 없음: {txt[:60]}")
                src = e.get("source", "")
                if e["status"] == "보강" and not src.strip():
                    nosrc += 1
                    bad.append(f"{name} · {key} · 보강인데 출처 없음")
                elif src.strip() and norm(src) not in body:
                    bad.append(f"{name} · {key} · 출처가 응답에 없음: {src[:60]}")

    print(f"보강 셀 {checked}칸 대조 · 불일치 {len(bad)}건")
    for b in bad[:15]:
        print("  ", b)
    return 1 if bad else 0


if __name__ == "__main__":
    raise SystemExit(main())
