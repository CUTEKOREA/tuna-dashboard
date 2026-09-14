#!/usr/bin/env python3
"""품목 산업해부 보고서의 표 전량 → `lib/data/<품목>-tables.json`.

기업 편은 `build_report_tables.py` 가 같은 일을 한다. 품목 편은 두 가지가 달라
따로 둔다.

1. **보고서 절 번호가 대시보드 단계와 1:1 이 아니다.** 기업 편은 절이 곧 단계인데
   품목 편은 보고서 15~19장을 대시보드 8~15단계에 눌러 담는다. 그 배치는 사람이 정한다.
2. **표에 캡션이 없는 품목이 있다.** 참치 양식 편은 `<caption>` 을 쓰고 명태 편은
   안 쓴다. 그래서 제목은 `report_tables.Table.title()` 의 폴백에 맡긴다 —
   표 바로 앞 소제목이 있으면 그것, 없으면 헤더 서명이다.

사람이 정하는 것은 **절→단계 배치**와 **제외 목록** 둘뿐이고, 표의 내용은 원문에서
그대로 읽는다. 옮겨 적지 않으므로 자릿수를 틀릴 자리가 없다.

    python3 scripts/build_commodity_tables.py pollock <보고서.html>

검사: 단계별 표 개수를 화면에 찍는다. 원문이 개정돼 표가 늘거나 줄면 눈에 띈다.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from report_tables import Table, parse  # noqa: E402

ROOT = Path(__file__).resolve().parents[1]

# 품목별 절→단계 배치. 보고서 절 번호(sid 의 뒤 두 자리)를 대시보드 단계 키로 옮긴다.
# 한 단계에 여러 절이 붙는다. 여기 없는 절의 표는 버린다 — 부록·출처가 그렇다.
LAYOUT: dict[str, dict[str, str]] = {
    "pollock": {
        "02": "s01",  # 왜 이 구조가 됐나 → 자원
        "05": "s01",  # 자원
        "07": "s02",  # 원양 세 척
        "03": "s03",  # 2022년의 산과 그 뒤의 시장
        "04": "s03",  # 러시아산 원물과 미국산 연육
        "06": "s04",  # 수입 명의
        "08": "s05",  # 가공 1,740곳
        "09": "s05",  # 품목별 가공 지도
        "10": "s05",  # 가공 업체 순위
        "11": "s06",  # 겹치는 42곳
        "12": "s08",  # 재무
        "13": "s07",  # 값
        "14": "s07",  # 제도 — 명태 대시보드는 8단계라 값 단계에 붙인다
    },
    "mackerel": {
        # 보고서 15장 → 대시보드 9단계. 고등어 편은 제도(03)가 한 장을 통째로 쓰고
        # 수입(04·05)이 둘로 갈려 있어 명태와 배치가 다르다.
        # 단계 키와 제목의 짝: s01 자원 · s02 어획 · s03 위판 · s04 수입 ·
        # s05 수입 창구 · s06 제도 · s07 수출 · s08 유통 · s09 명부.
        # (「종 - 무엇을 고등어라 부르는가」는 s04 안의 절이라 단계 키가 없다)
        "02": "s01",  # 왜 지금인가 → 자원
        "06": "s02",  # 국내에서 잡히는 것 → 어획
        "03": "s06",  # 누가 얼마를 정하는가 → 제도
        "04": "s04",  # 물량과 단가가 갈라진다 → 수입
        "05": "s04",  # 무너지는 조달선 88% → 수입
        "07": "s07",  # 나가는 쪽이 더 크다 → 수출
        "08": "s05",  # 누구 명의로 들어오나 → 수입 창구
        "09": "s09",  # 집계표 밖의 가공 → 명부
        "10": "s08",  # 산지에서 소비자까지 → 유통
        "11": "s09",  # 명의는 크고 사업은 작다 → 명부
        "12": "s06",  # 어디서 칸이 비는가 → 제도
    },
    "squid": {
        # 보고서 19장 → 대시보드 15단계. 「기후와 자원 변동」·「지속가능성」·「한국의 자리」는
        # s07 안의 절이라 단계 키가 없다(제목 18개 · 키 15개).
        # 16장(전략 — 인수를 가정한 실행 검토)은 대응 단계가 없어 싣지 않는다.
        "02": "s01",  # 원인 — 왜 비싸지는가 → 자원
        "19": "s02",  # 세계 — 한국은 어디쯤 서 있나 → 어장
        "03": "s06",  # 시장 — 물량과 단가 → 교역과 통관
        "18": "s07",  # 수급 — 값은 무엇에 반응하는가 → 가격과 소비
        "05": "s09",  # 산지 — 위판 원장 5개년
        "04": "s10",  # 조달선 → 조달선과 수입 주체
        "06": "s10",  # 수입 주체
        "07": "s11",  # 원양
        "08": "s12",  # 가공 규모
        "09": "s12",  # 가공 지역
        "10": "s12",  # 가공 업소
        "11": "s13",  # 연결
        "12": "s13",  # 재무
        "17": "s13",  # 경쟁 — 누가 이기고 있는지
        "13": "s14",  # 값
        "14": "s15",  # 제도
        "15": "s15",  # 자료의 한계
    },
    "shrimp": {
        # 보고서 14장 → 대시보드 13단계. 대시보드 s01~s03·s05(역전·종·산지·아르헨티나)는
        # 세계 편이라 보고서에 대응 표가 없고 손으로 만든 차트만 있다.
        "02": "s04",  # 이 구조의 내력 → 한국
        "03": "s06",  # 물량과 금액의 이별 → 수입 창구
        "04": "s07",  # 조달선 세 나라
        "06": "s07",  # 수입 명의 624곳 → 조달선
        "05": "s08",  # 국내 생산과 한 종뿐인 양식
        "07": "s08",  # 수입 의존 · 자급률
        "08": "s09",  # 가공 규모와 새우젓
        "09": "s09",  # 가공 지역
        "10": "s09",  # 가공 업체 1,090곳
        "11": "s10",  # 수입과 가공의 교집합 → 재무(두 층)
        "12": "s10",  # 두 층으로 가려진 재무
        "13": "s11",  # 부두에서 도매장까지 → 값 사슬
        "14": "s12",  # 제도 — 세번에 종이 없다
    },
}

# 화면에 낼 값이 없거나 이미 손으로 만든 차트와 겹치는 표. 헤더 서명으로 지목한다.
EXCLUDE: dict[str, list[tuple[str, ...]]] = {
    "pollock": [
        ("순", "업체", "2023"),  # 상위 100 업체 — 100행이라 화면에 안 맞는다
    ],
    "shrimp": [
        # 대시보드가 이미 손으로 옮겨 둔 표와 값·열이 같은 것. 같은 값이 한 페이지에 두 번 뜬다.
        # (조달선 교역국·가공 상위는 추출본이 열·행이 더 많아 남긴다)
        ("순", "수입업체", "신고 건수"),  # = 「수입 명의 상위 10곳」
        ("단계", "값", "기준"),  # = 「CIF에서 도매까지」
    ],
}


# 이보다 긴 표는 화면 카드에 안 맞는다. 명태 상위 100업체(100행)·오징어 가공 상위
# 100개사(88행)가 걸린다. 같은 헤더의 요약표(5행)는 남아야 하므로 서명이 아니라 행수로 거른다.
MAX_ROWS = 40


def _excluded(t: Table, rules: list[tuple[str, ...]]) -> bool:
    if len(t.rows) > MAX_ROWS:
        return True
    joined = " | ".join(t.head)
    return any(all(s in joined for s in sig) for sig in rules)


def build(commodity: str, src: Path) -> dict:
    layout = LAYOUT[commodity]
    exclude = EXCLUDE.get(commodity, [])
    tables = parse(src.read_text(encoding="utf-8"))

    out: dict[str, dict] = {}
    dropped_sec: dict[str, int] = {}
    dropped_ex = 0
    for t in tables:
        sec = t.sid.removeprefix("s") if t.sid.startswith("s") else t.sid
        stage = layout.get(sec)
        if stage is None:
            dropped_sec[sec] = dropped_sec.get(sec, 0) + 1
            continue
        if _excluded(t, exclude):
            dropped_ex += 1
            continue
        out.setdefault(stage, {"tables": []})["tables"].append(t.as_json())

    print(f"{commodity}: 표 {len(tables)}개 파싱")
    for stage in sorted(out):
        n = len(out[stage]["tables"])
        print(f"  {stage}  표 {n:2d}")
    if dropped_sec:
        print(f"  배치 없는 절에서 버린 표: {dropped_sec}")
    if dropped_ex:
        print(f"  제외 목록으로 버린 표: {dropped_ex}")
    return out


def main() -> int:
    if len(sys.argv) < 3:
        print(__doc__)
        return 2
    commodity, src = sys.argv[1], Path(sys.argv[2])
    if commodity not in LAYOUT:
        print(f"배치가 없는 품목이다: {commodity}. LAYOUT 에 추가하라.")
        return 2
    if not src.exists():
        print(f"보고서가 없다: {src}")
        return 2
    data = build(commodity, src)
    dst = ROOT / f"lib/data/{commodity}-tables.json"
    dst.write_text(json.dumps(data, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(f"→ {dst.relative_to(ROOT)}  {dst.stat().st_size:,} bytes")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
