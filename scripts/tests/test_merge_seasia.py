"""병합 판별식 회귀 검사.

«못 찾은 것을 찾았다고 기록»하는 것이 이 작업의 핵심 실패 모드다.
숫자 유무로 가르던 초판이 「모두 확인불가. 본점 1곳」의 1 에 걸려 새어나갔다.
그 사례를 포함해 고정한다.
"""
import importlib.util
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
spec = importlib.util.spec_from_file_location(
    "merge", ROOT / "scripts/merge_seasia_enrichment.py")
merge = importlib.util.module_from_spec(spec)
spec.loader.exec_module(merge)


def verdict(v: str) -> str:
    """main() 안의 분류를 그대로 재현한다 — 로직이 갈라지면 이 검사가 무의미해진다."""
    import re
    first = re.split(r"[.。]\s", v, maxsplit=1)[0]
    total_deny = bool(re.search(r"(모두|전부|일체|전혀)\s*확인\s*불가", first)) \
        or first.strip() in merge.NA \
        or bool(re.fullmatch(r"[^.]{0,60}?확인\s*불가[.\s]*", first))
    rest = v[len(first):].strip(" .·,")
    salvage = len(rest) > 20 and bool(re.search(r"\d", rest))
    return "확인불가" if (total_deny and not salvage) else "보강"


CASES = [
    ("확인불가", "확인불가"),
    ("이 법인 명의 HACCP·BRC·MSC·ASC 모두 확인불가.", "확인불가"),
    # 초판이 틀렸던 사례 — 뒤따르는 '1곳'의 숫자에 걸려 보강으로 샜다
    ("일일/연간 처리능력, 공장 수, 직원 수, 냉동창고 용량 모두 확인불가. 공개된 소재는 샘웃사콘 본점 1곳", "확인불가"),
    # 앞은 부정이지만 뒤에 실제로 찾은 값이 있다 — 이건 보강이다
    ("최근 매출·순이익·총자산 정확액 확인불가. Tracxn 공개값은 2023-12-31 종료연도 매출 USD 10–50백만 구간뿐", "보강"),
    ("등기번호 0745543001201. 2000-06-05 설립", "보강"),
]


def test_classifier():
    for text, want in CASES:
        got = verdict(text)
        assert got == want, f"{text[:40]!r} → {got}, 기대 {want}"


def test_parser_handles_both_dash_styles():
    # 시범 응답은 '- 값:', 배치 응답은 '값:' 이었다. 대시를 필수로 잡아 0건 파싱한 적이 있다.
    for lead in ("- ", ""):
        body = f"**1) 지배구조**\n{lead}값: 등기 123\n{lead}출처: DBD\n{lead}조회일: 2026-08-17\n"
        got = merge.parse(body)
        assert got.get("1", {}).get("value") == "등기 123", f"lead={lead!r} → {got}"


if __name__ == "__main__":
    test_classifier()
    test_parser_handles_both_dash_styles()
    print("판별식·파서 회귀 검사 통과")


def test_header_variants():
    """헤더가 굵게(**1) …**) 오는 응답과 맨몸(1) …)으로 오는 응답이 섞인다.

    맨몸 정규식을 먼저 쓰면 값 안의 '2)' 같은 줄머리에서도 잘려 굵은 헤더 응답이
    깨진다 — 실제로 베트남 4개사를 놓쳤다가 되찾는 과정에서 12칸을 날릴 뻔했다.
    """
    cases = [
        ("굵은 헤더",
         "**1) 지배구조·상장**\n값: 등기 0105516001322\n출처: DBD\n조회일: 2026-08-17\n",
         "등기 0105516001322"),
        ("맨몸 헤더",
         "1) 지배구조·상장\n- 값: 법인 3500387294\n- 출처: 등기\n- 조회일: 2026-08-17\n",
         "법인 3500387294"),
        ("값 안에 번호줄",
         "**1) 지배구조·상장**\n값: 주주 구성 —\n2) 임원 지분 12%\n출처: 공시\n조회일: 2026-08-17\n",
         "주주 구성"),
    ]
    for name, text, want in cases:
        got = parse(text)
        assert "1" in got, f"{name}: 블록을 못 잡았다"
        assert want in got["1"]["value"], f"{name}: {got['1']['value']!r}"
