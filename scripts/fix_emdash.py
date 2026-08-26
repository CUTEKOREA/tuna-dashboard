# -*- coding: utf-8 -*-
"""em dash(U+2014) 일괄 제거 (L-07) — 2026-08-26 사용자 지시.

규칙:
- .ts/.tsx: 주석(// 라인, /* */ 블록) **밖**의 모든 — 를 - 로. 공백은 보존
  (" — " → " - ", 빈값 placeholder '—' → '-'). URL 의 // 는 주석으로 보지 않음.
- .json (data/, public/data/): 전량 — → - (JSON 에 주석 없음).
- en dash(–)·기타 대시는 건드리지 않는다.

사용: python3 scripts/fix_emdash.py [--dry]
"""
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
DRY = "--dry" in sys.argv
EM = "—"


def fix_ts(text: str) -> str:
    """주석 밖 — 만 치환. 문자열('  "  `)과 템플릿 ${} 를 인식해
    문자열 내 /* // 시퀀스(정규식·글롭·URL)로 주석 판정이 오염되지 않게 한다."""
    out = []
    i, n = 0, len(text)
    st = "code"          # code | line | block | s1 | s2 | tpl
    tpl_depth = []       # 템플릿 중첩: ${ 로 code 복귀 시 스택
    while i < n:
        c = text[i]
        nx = text[i + 1] if i + 1 < n else ""
        if st == "code":
            if c == "/" and nx == "/":
                st = "line"; out.append("//"); i += 2; continue
            if c == "/" and nx == "*":
                st = "block"; out.append("/*"); i += 2; continue
            if c == "'":
                st = "s1"
            elif c == '"':
                st = "s2"
            elif c == "`":
                st = "tpl"
            elif c == "}" and tpl_depth:
                tpl_depth.pop(); st = "tpl"
            out.append("-" if c == EM else c); i += 1; continue
        if st == "line":
            if c == "\n":
                st = "code"
            out.append(c); i += 1; continue
        if st == "block":
            if c == "*" and nx == "/":
                st = "code"; out.append("*/"); i += 2; continue
            out.append(c); i += 1; continue
        # 문자열 상태들 — 내부 — 는 치환 대상
        if c == "\\":
            out.append(c + nx); i += 2; continue
        if st == "s1" and c == "'":
            st = "code"
        elif st == "s2" and c == '"':
            st = "code"
        elif st == "tpl":
            if c == "`":
                st = "code"
            elif c == "$" and nx == "{":
                tpl_depth.append(1); st = "code"; out.append("${"); i += 2; continue
        out.append("-" if c == EM else c); i += 1; continue
    return "".join(out)


def run():
    n_files = n_hits = 0
    targets = []
    for d in ("app", "components", "lib", "hooks", "__tests__", "e2e"):
        targets += sorted((ROOT / d).rglob("*.ts")) + sorted((ROOT / d).rglob("*.tsx"))
    ts_set = set(targets)
    for d in ("data", "public/data"):
        targets += sorted((ROOT / d).rglob("*.json"))
    for p in targets:
        try:
            text = p.read_text(encoding="utf-8")
        except (UnicodeDecodeError, OSError):
            continue
        if EM not in text:
            continue
        new = fix_ts(text) if p in ts_set else text.replace(EM, "-")
        hits = text.count(EM) - new.count(EM)
        if hits:
            n_files += 1
            n_hits += hits
            if not DRY:
                p.write_text(new, encoding="utf-8")
    print(f"{'[dry] ' if DRY else ''}치환 {n_hits}건 / {n_files}파일 (주석 잔존 제외)")


if __name__ == "__main__":
    run()
