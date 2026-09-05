#!/usr/bin/env python3
"""일곱 편 조사보고서의 표 전량 → `public/data/companies/<key>_tables_v1.json`.

기존 `build_company_*.py` 는 「화면이 쓸 표만 골라 손으로 옮기고 문자열로 대조」한다.
그 방식은 표 열 몇 개까지가 한계다. 일곱 편에 표가 178개인데 그중 절반이
대시보드에 없었다 — 옮겨 적기 비용이 커서 고르다 만 것이다.

여기서는 **표를 원문에서 그대로 읽는다.** 사람이 정하는 것은 두 가지뿐이다.

1. **절 → 단계 배치** — 보고서 9~11개 절을 대시보드 6~8단계 어디에 붙일지.
2. **제외 목록** — 이미 손으로 정성껏 만든 슬롯과 겹치는 표, 그리고 부록·출처처럼
   화면에 낼 값이 없는 표.

나머지(제목·헤더·행·숫자열 정렬·설명)는 전부 원문에서 온다. 옮겨 적지 않으므로
자릿수를 틀릴 자리가 없고, 대신 **골라낸 표가 그 표가 맞는지**를 검사한다 —
절별 표 개수를 못박아 두어 원문이 개정되면 빌드가 죽는다.
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from report_tables import TableSet  # noqa: E402

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public/data/companies"


# ── 회사별 설정 ────────────────────────────────────────────────────────────
# stages: 보고서 절 → 대시보드 단계.
# drop:   이미 손으로 만든 슬롯과 겹치거나 화면에 낼 값이 없는 표. 헤더 서명으로 지정한다.
# expect: 절별 표 개수. 원문이 개정돼 표가 늘거나 줄면 여기서 잡는다.
SPECS: dict[str, dict] = {
    "frinsa": {
        "src": "docs/evidence/company-frinsa-2026-08/보고서.html",
        # 보고서 절 제목과 단계 제목을 맞춘다. 절 번호와 단계 번호는 어긋난다 —
        # 화면은 「생산」을 04, 「조달·인증」을 05로 쪼갰는데 보고서는 06절에 함께 뒀다.
        "stages": {"s1": "c01", "s2": "c02", "s3": "c03", "s4": "c03",
                   "s5": "c06", "s6": "c05", "s7": "c06", "s7b": "c06", "s8": "c07", "s9": "c08",
                   "scorr": "c09"},
        "drop": ["s1|항목 | 내용", "s2|브랜드 | 포지션", "s6|인증 | 번호", "s9|품목 | CN"],
        # 06절은 화면에서 04 생산과 05 조달·인증으로 갈린다. 공장 상세표는 생산 쪽이다.
        "move": {"s6|거점 | 법인 | 생산 품목": "c04"},
    },
    "thaiunion": {
        "src": "docs/evidence/company-thaiunion-2026-08/보고서.html",
        # 화면 05는 「지속가능성」, 06은 「재무」다. 보고서는 07 리스크·08 지속가능성 순이라
        # 그대로 뒤에 붙이면 한국 단계에 열다섯 개가 쌓인다.
        "stages": {"s1": "c01", "s2": "c02", "s3": "c03", "s4": "c04",
                   "s5": "c04", "s6": "c06", "s6b": "c06", "s7": "c06", "s8": "c05", "s9": "c07",
                   "scorr": "c08"},
        "drop": ["s1|항목 | 내용", "s1|연도 | 사건", "s1|순위 | 주주",
                 "s4|브랜드 실판매가",
                 "s6|항목 (백만 밧)", "s7|층 | 시점", "s7|품목 | 실효",
                 "s8|목표 (2030년", "s9|HS | 어종"],
    },
    "albacora": {
        "src": "docs/evidence/company-albacora-2026-08/보고서.html",
        "stages": {"s1": "c01", "s2": "c02", "s3": "c03", "s4": "c04", "s4b": "c04",
                   "s5": "c05", "s5b": "c05", "s6": "c06", "s7": "c07",
                   "scorr": "c08"},
        "drop": ["s1| | Frinsa", "s1|항목 | 내용", "s1|연도 | 사건",
                 "s2|시점 | 변동", "s2|계열·관계 법인", "s3|선명 | GT", "s3|장치 | 내용",
                 "s5|브랜드 | 성격", "s5|플랜트 | MSC", "s5|유닛 | 상태", "s5|항목 | 내용",
                 "s6|항목 | 값 | 출처·기준", "s6|시점 | 건", "s7|회사 | 가장 큰",
                 "s7|# | 축", "s7|물음 | 왜", "s7|항목 | 상태"],
    },
    "fcf": {
        "src": "docs/evidence/company-fcf-2026-08/보고서.html",
        # 07절 「독립 트레이더는 멸종했다」는 시장 구조라 03 사업구조 쪽이 맞다.
        # 리스크만 05에 남겨야 한 단계에 여덟 개가 쌓이지 않는다.
        # s3b 「그룹 법인 — 열다섯 나라에 서고 다섯만 보고한다」는 공시 경계라 02 지배구조 쪽이다.
        "stages": {"s1": "c01", "s2": "c02", "s3": "c03", "s3b": "c02",
                   "s4": "c04", "s4b": "c04", "s5": "c04",
                   "s6": "c05", "s7": "c03", "s8": "c06", "s9": "c06",
                   "s10": "c06", "s11": "c06", "sa": "c06", "sb": "c06",
                   "scorr": "c07"},
        "drop": ["s1|국가 | 법인"],
    },
    "itochu": {
        "src": "docs/evidence/company-itochu-2026-08/보고서.html",
        "stages": {"s1": "c01", "s2": "c02", "s3": "c04", "s4": "c03", "s5": "c04",
                   "s6": "c06", "s7": "c05", "s7b": "c05", "s8": "c05", "s9": "c06",
                   "scorr": "c07"},
        "drop": ["s1|항목 | 내용", "s4|기국 | 척수", "s4|# | 선명",
                 "s7|세그먼트 | FY2024", "s7|구분 | FY2024"],
    },
    "bolton": {
        "src": "docs/evidence/company-bolton-2026-08/보고서.html",
        "stages": {"s1": "c01", "s2": "c02", "s3": "c02", "s4": "c03", "s4b": "c03",
                   "s5": "c04", "s6": "c05", "s7": "c04", "s7b": "c05", "s8": "c05",
                   "s8b": "c06", "s9": "c06", "s10": "c06",
                   "scorr": "c07"},
        "drop": ["s1|항목 | 내용", "s2|항목 | Bolton Group", "s3|FY | 연결 순매출",
                 "s4|카테고리 | 2024", "s4|지역 | 2019", "s5|항목 | 1단계",
                 "s6|연도 | 조달량", "s6|어종 | 2024", "s6|어법 | 2024",
                 "s7|등록부 | 내용", "s8|명단 연도", "s9|연도 | 한국 국적선"],
    },
    "frabelle": {
        "src": "docs/evidence/company-frabelle-2026-09/보고서.html",
        # 9절이 화면 9단계와 1:1 이었는데 s8b(법원기록)가 끼어들었다.
        # 화면 단계는 늘리지 않고 s8b 를 한국 관점과 같은 칸에 붙인다.
        "stages": {**{f"s{i}": f"c{i:02d}" for i in range(1, 10)},
                   "s8b": "c08", "scorr": "c10"},
        "drop": [],
    },
    "jealsa": {
        "src": "docs/evidence/company-jealsa-2026-09/보고서.html",
        # 보고서 12절이 화면 12단계와 1:1 이다. 정정 이력은 마지막 단계에 붙인다.
        "stages": {**{f"s{i}": f"c{i:02d}" for i in range(1, 13)}, "scorr": "c13"},
        "drop": [],
    },
    "nauterra": {
        "src": "docs/evidence/company-nauterra-2026-09/보고서.html",
        # 14절이 화면 14단계와 1:1 이다. 절 id 는 s1..s14 로 연속이라 손으로 적지 않는다.
        "stages": {f"s{i}": f"c{i:02d}" for i in range(1, 15)},
        "drop": [],
    },
    "starkist": {
        "src": "docs/evidence/company-starkist-2026-09/보고서.html",
        # 14절이 화면 14단계와 1:1 이다. 정정 이력 절은 따로 없다.
        "stages": {f"s{i}": f"c{i:02d}" for i in range(1, 15)},
        "drop": [],
    },
    "jais": {
        "src": "docs/evidence/company-jais-2026-08/보고서.html",
        "stages": {"s1": "c01", "s2": "c01", "s3": "c02", "s4": "c03", "s5": "c04",
                   "s6": "c05", "s6b": "c05", "s7": "c06", "s8": "c06", "sa": "c06", "sb": "c06",
                   "scorr": "c07"},
        "drop": ["s3|회계연도 | 매출", "s4|근거 | 표기", "s4|명부 판", "s8|축 | FCF"],
    },
}


def _assert_all_sections_mapped(key: str, doc: str, spec: dict) -> None:
    """문서의 절 id 가 전부 `stages` 에 있는지 본다.

    없으면 그 절은 표도 서술도 그림도 **에러 없이 통째로 빠진다.** 실제로 세 번 났다 —
    `c01..c08` 을 손으로 적은 자리가 셋이라 절이 아홉으로 늘었을 때 두 편의 마지막 표가
    사라졌고, 2026-09-05 에는 Jealsa 정정 이력 절이 id 를 `corr` 로 붙였다가 빠졌다.
    조용한 누락을 빌드 실패로 바꾼다.
    """
    ids = re.findall(r'<section id="(s[0-9a-z]+)">', doc)
    missing = [i for i in dict.fromkeys(ids) if i not in spec["stages"]]
    if missing:
        raise SystemExit(
            f"{key}: 절 {', '.join(missing)} 이 stages 에 없다 — 그대로 두면 화면에서 사라진다. "
            f"매핑을 추가하라 (id 는 반드시 s 로 시작해야 파서가 잡는다)"
        )


def build(key: str, spec: dict) -> tuple[int, int, int]:
    src = ROOT / spec["src"]
    doc = src.read_text(encoding="utf8", errors="replace")
    _assert_all_sections_mapped(key, doc, spec)
    ts = TableSet(doc)

    per_section: dict[str, int] = {}
    hits: dict[str, int] = {d: 0 for d in spec["drop"]}
    moves: dict[str, int] = {}
    kept, dropped = [], 0
    for t in ts.all:
        per_section[t.sid] = per_section.get(t.sid, 0) + 1
        sig = " | ".join(t.head)
        matched = None
        for d in spec["drop"]:
            sid, frag = d.split("|", 1)
            if t.sid == sid and frag in sig:
                hits[d] += 1
                matched = d
        stage = spec["stages"].get(t.sid)
        # 한 절이 화면에서 두 단계로 갈리는 경우가 있다. 표 하나만 다른 단계로 보낸다.
        for m, dest in spec.get("move", {}).items():
            msid, mfrag = m.split("|", 1)
            if t.sid == msid and mfrag in sig:
                stage = dest
                moves[m] = moves.get(m, 0) + 1
        if matched or stage is None or not t.rows:
            dropped += 1
            continue
        row = t.as_json()
        row["stage"] = stage
        kept.append(row)

    # 선언이 정확히 한 표에 걸려야 한다. 0이면 낡은 선언이고, 2 이상이면 애먼 표까지 지운다.
    bad = {d: n for d, n in hits.items() if n != 1}
    if bad:
        raise SystemExit(f"{key}: 제외 선언이 표와 1:1로 안 맞는다 — {bad}")

    # 이동 선언도 정확히 한 표에 걸려야 한다.
    badm = {m: moves.get(m, 0) for m in spec.get("move", {}) if moves.get(m, 0) != 1}
    if badm:
        raise SystemExit(f"{key}: 이동 선언이 표와 1:1로 안 맞는다 — {badm}")

    expect = spec.get("expect")
    if expect and expect != per_section:
        raise SystemExit(f"{key}: 절별 표 개수가 달라졌다\n  기대 {expect}\n  실제 {per_section}")

    out = OUT / f"{key}_tables_v1.json"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps({
        "_meta": {"출처": spec["src"], "생성": "python3 scripts/build_report_tables.py",
                  "설명": "조사보고서 표를 원문에서 그대로 읽는다. 손으로 옮기지 않는다."},
        "sections": per_section,
        "tables": kept,
    }, ensure_ascii=False, indent=1) + "\n", encoding="utf8")
    return len(kept), dropped, out.stat().st_size


def main() -> int:
    only = sys.argv[1:] or list(SPECS)
    total_kept = total_all = total_bytes = 0
    for key in only:
        if key not in SPECS:
            print(f"모르는 회사: {key}", file=sys.stderr)
            return 1
        kept, dropped, size = build(key, SPECS[key])
        total_kept += kept
        total_all += kept + dropped
        total_bytes += size
        print(f"{key:<11} 표 {kept:>3}개 수록 · {dropped:>2}개 제외 · {size // 1024:>3} KB")
    print(f"{'합계':<11} 표 {total_kept}/{total_all}개 · {total_bytes // 1024} KB")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
