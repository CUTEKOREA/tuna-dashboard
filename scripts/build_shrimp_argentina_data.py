#!/usr/bin/env python3
"""아르헨티나 홍새우 조사 보고서 2종 → `public/data/shrimp_argentina.json`.

원자료는 사내 조사보고서다 (`docs/evidence/shrimp-argentina-2026-08/`).
- korea_2026-08-11.md — 아르헨티나 홍새우를 한국에서 어디에 놓을 것인가
- asean_2026-08-12.md — 아르헨티나 원물을 동남아 3국에서 가공해 한국으로

**수치는 손으로 옮긴다. 다만 옮긴 것이 맞는지는 기계가 본다.** 보고서가 서술형이라
표 파서를 붙이면 문장 속 수치를 통째로 놓친다. 그래서 값은 여기 적되, 내보내기 전에
**모든 수치 문자열이 보고서 원문에 그대로 있는지** 대조한다. 하나라도 없으면 중단한다.
옮겨 적다 자릿수를 틀리는 것이 이 작업의 실패 모드이고, 그건 판단이 아니라 대조로 잡힌다.

⚠ 측정 경계: 이 단계의 수치는 **통관·수출 기준**이라 새우 페이지의 다른 단계(FAO 생산
   통계)와 더할 수 없다. 중량 기준이 다르다. 화면에도 그렇게 밝힌다.
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EV = ROOT / "docs/evidence/shrimp-argentina-2026-08"
OUT = ROOT / "public/data/shrimp_argentina.json"

KOREA = EV / "korea_2026-08-11.md"
ASEAN = EV / "asean_2026-08-12.md"

# ── 산지: 아르헨티나 어획·수출 ──────────────────────────────────────────────
CATCH = [
    {"연도": 2018, "어획": 255000, "구분": "FAO 어획"},
    {"연도": 2020, "어획": 184000, "구분": "FAO 어획"},
    {"연도": 2024, "어획": 222000, "구분": "FAO 어획"},
    {"연도": 2025, "어획": 187000, "구분": "정부 양륙"},
]

# 2025년 양륙 경로. 선상동결과 육상가공은 다른 상품이라 SKU 를 나눠야 한다.
LANDING_2025 = [
    {"경로": "연안·근해 선어선", "물량": 138742, "비중": 74.2},
    {"경로": "냉동 tangonero", "물량": 48284, "비중": 25.8},
]

# ── 한국: 2026년 1~5월 관세청 HS 030617 ────────────────────────────────────
KOREA_IMPORTS = [
    {"원산지": "중국", "물량": 9863, "금액": 71.48, "단가": 7.25},
    {"원산지": "베트남", "물량": 8472, "금액": 72.46, "단가": 8.55},
    {"원산지": "페루", "물량": 3609, "금액": 26.90, "단가": 7.45},
    {"원산지": "말레이시아", "물량": 1458, "금액": 13.62, "단가": 9.34},
    {"원산지": "인도", "물량": 1512, "금액": 10.15, "단가": 6.71},
    {"원산지": "아르헨티나", "물량": 1015, "금액": 12.75, "단가": 12.56},
    {"원산지": "태국", "물량": 602, "금액": 7.35, "단가": 12.22},
    {"원산지": "에콰도르", "물량": 778, "금액": 3.95, "단가": 5.07},
]

# ── 가공경로: 식약처 공개 조회행 (물량이 아니다) ───────────────────────────
ROUTES = [
    {
        "국가": "태국",
        "건수": 155,
        "공장수": 4,
        "수입사수": 4,
        "역할": "공급선 다변화·제품폭",
        "공장": ["KF Foods", "Thai Spring Fish", "Chocksamut Marine", "Thai Union"],
        "공장건수": [73, 63, 16, 3],
        "수입사": ["부일", "롯데상사", "씨케이글로벌", "갓텐코리아"],
        "검증": "실재",
    },
    {
        "국가": "인도네시아",
        "건수": 152,
        "공장수": 1,
        "수입사수": 2,
        "역할": "기존 경로 재현·빠른 파일럿",
        "공장": ["PT. Mega Marine Pride"],
        "공장건수": [152],
        "수입사": ["씨케이글로벌", "부일"],
        "검증": "실재",
    },
    {
        "국가": "베트남",
        "건수": 0,
        "공장수": 0,
        "수입사수": 0,
        "역할": "고도 가공 후보 — 검증 전",
        "공장": [],
        "공장건수": [],
        "수입사": [],
        "검증": "미입증",
    },
]

# 아르헨티나 → 3국 원료 수출 (거울통계). 늘어난다는 가정을 버리게 하는 숫자다.
HUB_FLOW = [{"연도": 2021, "합계": 12504}, {"연도": 2025, "합계": 8007}]

HUB_2025 = [
    {"국가": "태국", "물량": 4198},
    {"국가": "베트남", "물량": 2543},
    {"국가": "인도네시아", "물량": 1266},
]

# ── 한국 수입업체 공개기록 (점유율이 아니라 기록 활동도) ───────────────────
IMPORTERS = [
    {"업체": "씨케이글로벌(주)", "건수": 146, "비중": 39.1},
    {"업체": "(주)부일", "건수": 116, "비중": 31.1},
    {"업체": "롯데상사(주)", "건수": 63, "비중": 16.9},
    {"업체": "주식회사 지앤원인터네셔널", "건수": 18, "비중": 4.8},
    {"업체": "(주)토키오인터네셔널", "건수": 11, "비중": 2.9},
]

# ── FTA 원산지 기준. 단순가공으로는 문턱을 못 넘는다 ───────────────────────
ORIGIN_RULES = [
    {"협정": "한–베트남 FTA", "hs0306": "완전생산(WO)", "hs1605": "CC 또는 역내가치 40%"},
    {"협정": "한–아세안 FTA", "hs0306": "완전획득", "hs1605": "역내가치 35% (FOB)"},
    {"협정": "한–인도네시아 CEPA", "hs0306": "세번변경(CC)", "hs1605": "CC 또는 역내가치 40%"},
]

META = {
    "source": "신라교역 사내 조사보고서 2종 — 아르헨티나 홍새우 한국시장(2026-08-11)·아세안 3국 가공(2026-08-12)",
    "measurementBoundary": (
        "이 단계에는 두 종류의 자료가 섞여 있다. 어획 계열(2018~2024)은 앞 단계와 같은 FAO "
        "생산 통계라 이어서 읽을 수 있고, 한국 수입·2025년 양륙·식약처 기록은 통관·행정 신고 "
        "기준이라 생산 통계에 더하거나 견줄 수 없다. 평균 신고단가도 소매가·FOB 견적·동일규격 "
        "비교가격이 아니다. HS 030617 은 종별 코드가 아니라 이 물량이 전부 Pleoticus muelleri "
        "라는 것도 증명하지 못한다."
    ),
    "recordCaveat": (
        "식약처 공개 조회행 건수는 물량이 아니라 화면에 나타난 기록 빈도다. 시장점유율이나 "
        "수입량 순위로 읽으면 안 된다."
    ),
}


def _numbers(obj) -> list[str]:
    """JSON 안의 수치를 대조용 문자열로 편다."""
    out: list[str] = []
    if isinstance(obj, dict):
        for v in obj.values():
            out += _numbers(v)
    elif isinstance(obj, list):
        for v in obj:
            out += _numbers(v)
    elif isinstance(obj, (int, float)) and not isinstance(obj, bool):
        out.append(obj)
    return out


def _variants(n) -> list[str]:
    """보고서가 같은 수를 여러 표기로 쓴다 — 1,015 / 12.56 / **25만5천**.

    한글 수사를 빼먹었다가 어획량 7건을 통째로 「원문에 없음」으로 잡았다. 검사기가
    맞고 데이터가 틀린 줄 알았는데 반대였다 — 대조 후보가 모자랐던 것이다.
    """
    if isinstance(n, float):
        return [f"{n:g}", f"{n:,.2f}", f"{n:.2f}"]
    out = [str(n), f"{n:,}"]
    if n >= 10000:
        man, rest = divmod(n, 10000)
        if rest == 0:
            out.append(f"{man}만")
        elif rest % 1000 == 0:
            out.append(f"{man}만{rest // 1000}천")
        else:
            out.append(f"{man}만{rest:,}")
    return out


def main() -> int:
    for f in (KOREA, ASEAN):
        if not f.exists():
            print(f"근거 보고서 없음: {f}", file=sys.stderr)
            return 1
    corpus = KOREA.read_text(encoding="utf8") + ASEAN.read_text(encoding="utf8")

    payload = {
        "meta": META,
        "catch": CATCH,
        "landing2025": LANDING_2025,
        "koreaImports": KOREA_IMPORTS,
        "routes": ROUTES,
        "hubFlow": HUB_FLOW,
        "hub2025": HUB_2025,
        "importers": IMPORTERS,
        "originRules": ORIGIN_RULES,
    }

    # 옮겨 적은 수치가 보고서에 실제로 있는지 대조한다. 자릿수를 틀리는 것이
    # 이 작업의 실패 모드이고, 그건 판단이 아니라 대조로 잡힌다.
    # 이 검사가 무엇을 증명하고 무엇을 증명하지 못하는지 분명히 해 둔다.
    #   증명한다  — 이 값과 같은 문자열이 보고서 어딘가에 있다.
    #   증명 못 한다 — 그 값이 **이 항목의** 값인지. 문맥은 보지 않는다.
    # 그래서 태국 155 를 152 로 틀리면 다른 행의 152 때문에 통과한다. 문맥까지
    # 대조하려면 보고서 파서를 만들어야 하는데, 서술형 원문이라 그 파서가 더 잘 틀린다.
    # 대신 **검사한 개수와 건너뛴 개수를 정직하게 보고**하고, 문맥이 필요한 항목은
    # 아래 라벨 동반 검사로 따로 잡는다.
    missing = []
    checked = skipped = 0
    for n in _numbers(payload):
        if isinstance(n, int) and (n < 10 or 1900 < n < 2100):
            skipped += 1  # 연도·한 자리 카운트는 아무 데나 있어 대조가 무의미하다
            continue
        checked += 1
        if not any(v in corpus for v in _variants(n)):
            missing.append(n)
    if missing:
        print(f"⚠ 보고서에 없는 수치 {len(missing)}건: {missing[:12]}", file=sys.stderr)
        return 1

    # 라벨 동반 검사 — 값이 «그 라벨과 같은 문장 안에» 있는지 본다. 존재만 보는
    # 위 검사가 놓치는 자리 바꿈(태국 155 ↔ 인니 152)을 여기서 잡는다.
    pairs = [(r["국가"], r["건수"]) for r in ROUTES if r["건수"]]
    for label, value in pairs:
        # 간격을 좁게 잡는다. 40자를 주면 "태국 155건, 인도네시아 152건" 한 문장 안에서
        # 태국과 152 가 함께 걸려 자리 바꿈을 못 잡는다.
        pat = re.compile(rf"{label}[^.。\n]{{0,4}}{value:,}")
        if not pat.search(corpus):
            print(f"⚠ 라벨 동반 대조 실패: {label} {value:,}건", file=sys.stderr)
            return 1

    # 목록과 개수는 서로 맞아야 한다. 한 자리 수라 원문 대조가 건너뛰는 자리이고,
    # 실제로 공장수를 틀려도 위 검사가 통과했다.
    for r in ROUTES:
        if r["공장수"] != len(r["공장"]) or r["수입사수"] != len(r["수입사"]):
            print(
                f"⚠ {r['국가']} 개수와 목록 불일치: 공장 {r['공장수']}≠{len(r['공장'])}"
                f" · 수입사 {r['수입사수']}≠{len(r['수입사'])}",
                file=sys.stderr,
            )
            return 1
        if len(r["공장건수"]) != len(r["공장"]) or sum(r["공장건수"]) != r["건수"]:
            print(
                f"⚠ {r['국가']} 공장별 건수 합 {sum(r['공장건수'])} ≠ 전체 {r['건수']}",
                file=sys.stderr,
            )
            return 1

    # 한국 수입표는 보고서가 밝힌 전체와 맞아야 한다 — 8개국이 전량은 아니다.
    arg = next(r for r in KOREA_IMPORTS if r["원산지"] == "아르헨티나")
    share_qty = arg["물량"] / 27848 * 100
    if not (3.5 < share_qty < 3.8):
        print(f"⚠ 아르헨티나 물량 비중 {share_qty:.2f}% — 보고서의 3.65%와 어긋난다", file=sys.stderr)
        return 1

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=1), encoding="utf8")
    print(
        f"-> {OUT} ({OUT.stat().st_size // 1024}KB) · 원문 대조 {checked}개 통과"
        f" · 건너뜀 {skipped}개(연도·한 자리) · 라벨 동반 대조 {len(pairs)}건 통과",
        file=sys.stderr,
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
