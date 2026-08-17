#!/usr/bin/env python3
"""Grok 보강 응답 -> seasia_processors.json 에 병합.

**원본 값을 덮어쓰지 않는다.** 보강분은 셀의 `enrich` 필드에 따로 붙고, 화면에서
원본과 구분해 보인다. 조사자가 「불가」로 남긴 판단과 나중에 찾아낸 값은 다른 것이며,
섞어 두면 원본이 무엇을 확인했고 무엇을 못 했는지가 사라진다.

'확인불가' 응답은 값으로 취급하지 않는다 — 그 자체가 «공개 출처에 없다»는 관측이라
`unresolved` 로 센다. 빈칸을 추정으로 메우지 않기 위한 장치다.
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "public/data/bangkok/seasia_processors.json"
RESP = Path(sys.argv[1] if len(sys.argv) > 1 else "/tmp/seasia-grok")

# 응답 항목 번호 → 원본 열 이름. 나라마다 열 이름이 조금 다르다.
FIELD_MAP = {
    "1": ("지배구조·상장", "지배구조"),
    "2": ("규모·캐파",),
    "3": ("인증",),
    "4": ("재무",),
}

NA = ("확인불가", "확인 불가", "없음")

# 판별식이 못 가르는 칸의 사람·검증자 판정. Codex 적대 검증(2026-08-17)이 156개 경계
# 칸을 훑어 잡아낸 오분류다. 전부 한 방향 — 첫 문장이 요청 항목을 부정하고, 뒤 문장의
# 숫자는 «어디를 뒤졌는지»(제출연도·법인번호·부가세 본점 수)이지 찾은 값이 아니다.
#
# 휴리스틱을 더 조이는 길도 있었지만 그러면 사실이 숫자가 아닌 칸(인증 승인번호,
# 지배구조 지분·임원)까지 40칸 가까이 함께 버려졌다. 규칙은 느슨하게 두고 판정만 박는다.
VERIFIED_UNRESOLVED = {
    ("CHOCKSAMUT MARINE", "재무"),
    ("SURAT SEAFOODS (SRT Foods)", "재무"),
    ("P.T. FOODS PROCESSING", "재무"),
    ("DAEDONG (THAILAND)", "재무"),
    ("G.B. GLOBAL", "재무"),
    ("RATCHAPAT INTERFOODS", "재무"),
    ("RATCHAPAT INTERFOODS", "규모·캐파"),
    ("HANA FOOD SERVICE", "규모·캐파"),
    ("AN DAI PHAT", "인증"),
    ("RED SEA INTERNATIONAL", "인증"),
}



def slugify(s: str) -> str:
    s = re.sub(r"[^A-Za-z0-9]+", "-", s).strip("-").lower()
    return s[:44] or "x"


def parse(text: str) -> dict[str, dict]:
    """'1) 제목' 블록마다 값/출처/조회일 세 줄을 뽑는다.

    헤더가 '**1) …**' 로 굵게 오는 응답과 '1) …' 로 맨몸으로 오는 응답이 섞인다.
    굵은 것만 잡았다가 베트남 4개사를 통째로 놓쳤다 — 줄머리에서 번호만 본다.
    """
    out: dict[str, dict] = {}
    # 헤더가 '**1) …**' 로 굵게 오는 응답과 '1) …' 로 맨몸으로 오는 응답이 섞인다.
    # 맨몸 정규식을 먼저 쓰면 값 안의 '2)' 같은 줄머리에서도 잘려 굵은 헤더 응답이 깨진다.
    # 굵은 쪽을 우선하고, 한 블록도 못 잡았을 때만 맨몸으로 내려간다.
    blocks = re.split(r"\*\*\s*([1-4])\)\s*[^*]*\*\*", text)
    if len(blocks) < 3:
        blocks = re.split(r"^\s*([1-4])\)\s*", text, flags=re.M)
    # blocks = [머리말, '1', 본문, '2', 본문, ...]
    for i in range(1, len(blocks) - 1, 2):
        num, body = blocks[i], blocks[i + 1]
        def grab(label: str) -> str:
            # 응답이 '- 값:' 으로 올 때도 있고 '값:' 으로 올 때도 있다. 대시를 필수로
            # 잡았다가 40건을 통째로 놓칠 뻔했다 — 있으면 먹고 없으면 넘어간다.
            # 종료 조건도 다음 라벨이 나오는 지점으로 잡는다(대시 유무와 무관).
            m = re.search(
                rf"^\s*-?\s*{label}\s*:\s*(.+?)(?=^\s*-?\s*(?:값|출처|조회일)\s*:|\Z)",
                body, re.S | re.M)
            if not m:
                return ""
            v = re.sub(r"\s+", " ", m.group(1)).strip()
            return re.sub(r"\*\*", "", v)   # 강조 마크업은 값이 아니다
        val, src, day = grab("값"), grab("출처"), grab("조회일")
        if not val:
            continue
        out[num] = {"value": val, "source": src, "checkedOn": day or "2026-08-17"}
    return out


def main() -> int:
    if not RESP.exists():
        print(f"응답 폴더 없음: {RESP}", file=sys.stderr)
        return 1
    doc = json.loads(DATA.read_text(encoding="utf8"))

    # 잘린 응답(사고과정만 있고 답이 없는 것)을 완결로 치면 그 회사는 조용히 누락된다.
    # 발주 스크립트도 같은 검사를 하지만 여기서 한 번 더 거른다 — 두 곳이 어긋나면
    # 병합 쪽이 이긴다. 데이터에 들어가는 것은 이쪽이기 때문이다.
    all_files = sorted(RESP.glob("*.txt"))
    files = [f for f in all_files
             if "조회일" in f.read_text(encoding="utf8", errors="replace")]
    truncated = [f.stem for f in all_files if f not in files]
    by_slug = {f.stem: f for f in files}
    print(f"응답 {len(all_files)}건 중 완결 {len(files)}건"
          + (f" · 잘림 {len(truncated)}건 {truncated[:5]}" if truncated else ""),
          file=sys.stderr)

    filled = unresolved = matched = 0
    overridden: set[tuple[str, str]] = set()
    skipped: list[str] = []

    for country, rep in doc["countries"].items():
        for row in rep["profiles"]:
            cell = row.get("회사/등기") or row.get("회사/세번·DL") or {}
            name = (cell.get("v") or "").strip()
            if not name:
                continue
            f = by_slug.get(slugify(name))
            if not f:
                skipped.append(name)
                continue
            parsed = parse(f.read_text(encoding="utf8", errors="replace"))
            if not parsed:
                skipped.append(name + " (파싱 실패)")
                continue
            matched += 1
            for num, keys in FIELD_MAP.items():
                got = parsed.get(num)
                if not got:
                    continue
                target = next((k for k in keys if k in row), None)
                if target is None:
                    continue
                v = got["value"]
                # '확인불가'는 값이 아니라 관측이다. 원본 태그를 지우지 않는다.
                #
                # 판정이 까다롭다. 응답이 «정확액 확인불가. 다만 매출 구간은 …» 처럼
                # 부정으로 시작하면서 뒤에 실제로 찾은 값을 붙이는 경우가 흔하다.
                # 그건 보강이다. 반대로 부정어만 있고 숫자·고유명사가 하나도 없으면
                # 못 찾은 것이다 — 문장 길이가 아니라 «건질 게 있느냐»로 가른다.
                # 숫자 유무로 가르면 «모두 확인불가. 본점 1곳» 의 1 에 걸려 새어나간다.
                # 부정어 앞에 오는 첫 절이 요청 항목을 통째로 부정하는지를 본다 —
                # «A·B·C 모두 확인불가» 는 못 찾은 것이고, «A 는 확인불가. B 는 …» 는 일부 찾은 것이다.
                first = re.split(r"[.。]\s", v, maxsplit=1)[0]
                total_deny = bool(re.search(r"(모두|전부|일체|전혀)\s*확인\s*불가", first)) \
                    or first.strip() in NA \
                    or bool(re.fullmatch(r"[^.]{0,60}?확인\s*불가[.\s]*", first))
                rest = v[len(first):].strip(" .·,")
                salvage = len(rest) > 20 and bool(re.search(r"\d", rest))
                if (name, target) in VERIFIED_UNRESOLVED:
                    total_deny, salvage = True, False
                    overridden.add((name, target))
                if total_deny and not salvage:
                    row[target]["enrich"] = {
                        "status": "확인불가",
                        "note": v,
                        "source": got["source"],
                        "checkedOn": got["checkedOn"],
                        "by": "Grok 4.6",
                    }
                    unresolved += 1
                else:
                    row[target]["enrich"] = {
                        "status": "보강",
                        "value": v,
                        "source": got["source"],
                        "checkedOn": got["checkedOn"],
                        "by": "Grok 4.6",
                    }
                    filled += 1

    doc["meta"]["enrichment"] = {
        "by": "Grok 4.6 (ask_grok_verified)",
        "runOn": "2026-08-17",
        "companiesQueried": len(files),
        "companiesMatched": matched,
        "cellsFilled": filled,
        "cellsUnresolved": unresolved,
        "policy": "원본 값과 신뢰도 태그는 그대로 둔다. 보강분은 셀의 enrich 필드에 따로 붙고 "
                  "화면에서 구분해 보인다. '확인불가'는 값으로 세지 않고 «공개 출처에 없다»는 "
                  "관측으로 기록한다 — 빈칸을 추정으로 메우지 않기 위한 장치다.",
        "skipped": skipped,
        "truncatedResponses": truncated,
        "verifiedUnresolved": sorted(f"{a} · {b}" for a, b in overridden),
        "verifiedBy": "Codex 적대 검증 2026-08-17 — 경계 156칸 전수, 오분류 10칸 정정 "
                      "(전부 보강→확인불가 방향. 잘못 버린 칸 0)",
    }

    DATA.write_text(json.dumps(doc, ensure_ascii=False, indent=1), encoding="utf8")
    print(f"매칭 {matched}개사 · 보강 {filled}칸 · 확인불가 {unresolved}칸 "
          f"(검증자 정정 {len(overridden)}칸)", file=sys.stderr)
    stale = VERIFIED_UNRESOLVED - overridden
    if stale:
        print(f"⚠ 적용 안 된 정정 {len(stale)}건: {sorted(stale)}", file=sys.stderr)
    if skipped:
        print(f"미매칭 {len(skipped)}건: {skipped[:6]}", file=sys.stderr)
    print(f"-> {DATA} ({DATA.stat().st_size // 1024}KB)", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
