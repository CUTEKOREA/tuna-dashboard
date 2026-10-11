#!/usr/bin/env python3
"""배포 게이트가 「오늘의 수치」 위젯과 같은 기준(리드 기사 figs 3개)을 검사하는지 확인한다.

핵심수치 스트립 파싱·주간 파일 upsert 규칙도 같은 스크립트에서 검증한다.
"""
import importlib.util
import json
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
spec = importlib.util.spec_from_file_location("syncdb", ROOT / "scripts" / "sync_daily_briefing.py")
sync = importlib.util.module_from_spec(spec)
sys.modules["syncdb"] = sync
spec.loader.exec_module(sync)

def _sample_day(day_date: str) -> dict:
    return {
        "date": day_date,
        "digest": [
            {"title": "Cepesca, 연료비 86% 급증"},
            {"title": "방콕 가다랑어 가격 올해 53% 상승"},
            {"title": "EU-세이셸 참치 협정, 이행 단계로"},
        ],
        "articles": [
            {
                "titleKo": f"기사 A {day_date}",
                "paragraphs": ["첫 문단.", "지침 문장이 필요하다."],
            },
            {
                "titleKo": f"기사 B {day_date}",
                "paragraphs": ["첫 문단."],
            },
            {
                "titleKo": f"기사 C {day_date}",
                "paragraphs": ["첫 문단."],
            },
        ],
    }


def test_weekly_upsert_contract() -> list[str]:
    errors: list[str] = []

    weekly = sync.load_weekly_briefing(Path("/nonexistent/weekly.json"))
    weekly = sync.upsert_weekly_day(weekly, _sample_day("2026-10-05"))
    weekly = sync.upsert_weekly_day(weekly, _sample_day("2026-10-06"))
    if weekly["weekStart"] != "2026-10-05" or weekly["weekEnd"] != "2026-10-09":
        errors.append("ISO 주 월~금 경계가 맞지 않습니다")
    if [day["date"] for day in weekly["days"]] != ["2026-10-05", "2026-10-06"]:
        errors.append("요일 추가·정렬이 맞지 않습니다")

    replaced = _sample_day("2026-10-05")
    replaced["articles"][0]["titleKo"] = "교체된 기사"
    weekly = sync.upsert_weekly_day(weekly, replaced)
    if len(weekly["days"]) != 2:
        errors.append("같은 날짜 재실행 시 중복이 생겼습니다")
    if weekly["days"][0]["articles"][0]["titleKo"] != "교체된 기사":
        errors.append("같은 날짜 재실행 시 교체되지 않았습니다")

    weekly = sync.upsert_weekly_day(weekly, _sample_day("2026-10-12"))
    if weekly["weekStart"] != "2026-10-12":
        errors.append("주가 바뀌면 weekStart 가 갱신되어야 합니다")
    if len(weekly["days"]) != 1 or weekly["days"][0]["date"] != "2026-10-12":
        errors.append("주가 바뀌면 days 가 초기화되어야 합니다")

    before = json.dumps(weekly)
    weekly = sync.upsert_weekly_day(weekly, _sample_day("2026-10-11"))
    if json.dumps(weekly) != before:
        errors.append("일요일(2026-10-11)은 주간 파일에 들어가면 안 됩니다")

    weekly = sync.upsert_weekly_day(
        sync.load_weekly_briefing(Path("/nonexistent/weekly.json")),
        _sample_day("2026-10-10"),
    )
    if weekly["days"]:
        errors.append("토요일(2026-10-10)은 주간 파일에 들어가면 안 됩니다")

    unsorted = sync.upsert_weekly_day(
        sync.load_weekly_briefing(Path("/nonexistent/weekly.json")),
        _sample_day("2026-10-07"),
    )
    unsorted = sync.upsert_weekly_day(unsorted, _sample_day("2026-10-05"))
    unsorted = sync.upsert_weekly_day(unsorted, _sample_day("2026-10-06"))
    dates = [day["date"] for day in unsorted["days"]]
    if dates != sorted(dates):
        errors.append("days 는 날짜 오름차순이어야 합니다")

    with tempfile.TemporaryDirectory() as tmp:
        weekly_path = Path(tmp) / "tuna_weekly_briefing.json"
        sync.write_json_atomically(weekly_path, unsorted)
        loaded = json.loads(weekly_path.read_text(encoding="utf-8"))
        if loaded["days"][0]["date"] != "2026-10-05":
            errors.append("원자적 쓰기 후 주간 JSON 이 깨졌습니다")

    return errors


def test_figs_parsing() -> list[str]:
    errors: list[str] = []
    row = (
        '<td width="34%"><div style="font-size:18px;font-weight:bold;">A</div>'
        '<div style="font-size:12px;">캡션 A</div></td>'
        '<td width="33%"><div style="font-size:18px;font-weight:bold;">B</div>'
        '<div style="font-size:12px;">캡션 B</div></td>'
        '<td width="33%"><div style="font-size:18px;font-weight:bold;">C</div>'
        '<div style="font-size:12px;">캡션 C</div></td>'
    )
    parsed = sync.parse_figs_row(row)
    if parsed != [
        {"value": "A", "caption": "캡션 A"},
        {"value": "B", "caption": "캡션 B"},
        {"value": "C", "caption": "캡션 C"},
    ]:
        errors.append("값·캡션 분리가 맞지 않습니다")

    html = (
        '<table style="border-collapse:collapse;margin:6px 0 0 0;"><tr>'
        + row
        + "</tr></table>"
    )
    strips = sync.extract_figs_strips(html)
    if len(strips) != 1 or len(strips[0]) != 3:
        errors.append("기사당 figs 3개 추출이 맞지 않습니다")

    bad_row = row.replace('width="33%"', 'width="32%"', 1)
    try:
        sync.parse_figs_row(bad_row)
        errors.append("셀 개수·너비가 다를 때 에러가 나야 합니다")
    except sync.BriefingSyncError:
        pass

    # 네 번째 셀을 조용히 버리면 게시판에 있는 수치가 위젯에서 사라진다.
    extra_row = row + (
        '<td width="33%"><div style="font-size:18px;font-weight:bold;">D</div>'
        '<div style="font-size:12px;">캡션 D</div></td>'
    )
    try:
        sync.parse_figs_row(extra_row)
        errors.append("셀이 3개보다 많으면 에러가 나야 합니다")
    except sync.BriefingSyncError:
        pass

    # 같은 스타일 div 가 둘이면 뒤엣것이 앞엣것을 덮어써 값이 바뀐다.
    dup_row = row.replace(
        '<div style="font-size:12px;">캡션 A</div>',
        '<div style="font-size:12px;">캡션 A</div>'
        '<div style="font-size:12px;">덧붙은 캡션</div>',
        1,
    )
    try:
        sync.parse_figs_row(dup_row)
        errors.append("같은 스타일 div 가 중복되면 에러가 나야 합니다")
    except sync.BriefingSyncError:
        pass

    return errors


def test_impact_numbers_gate() -> list[str]:
    errors: list[str] = []
    digest = [{"title": "헤드 1"}, {"title": "헤드 2"}, {"title": "헤드 3"}]
    lead_figs = [
        {"value": "1", "caption": "캡션 1"},
        {"value": "2", "caption": "캡션 2"},
        {"value": "3", "caption": "캡션 3"},
    ]
    articles = [{"titleKo": "리드", "paragraphs": ["본문."], "figs": lead_figs}]
    try:
        sync.validate_impact_numbers_gate(digest, articles)
    except sync.BriefingSyncError:
        errors.append("리드 figs 3개·다이제스트 2건 이상이면 통과해야 합니다")

    try:
        sync.validate_impact_numbers_gate(digest, [{"titleKo": "리드", "paragraphs": ["본문."]}])
        errors.append("리드 figs 없으면 게이트가 막혀야 합니다")
    except sync.BriefingSyncError:
        pass

    try:
        sync.validate_impact_numbers_gate([{"title": "헤드 1"}], articles)
        errors.append("다이제스트 1건이면 게이트가 막혀야 합니다")
    except sync.BriefingSyncError:
        pass

    return errors


def test_weekly_output_selection() -> list[str]:
    errors: list[str] = []
    with tempfile.TemporaryDirectory() as tmp:
        daily_path = Path(tmp) / "daily.json"
        args = sync.build_argument_parser().parse_args(["--output", str(daily_path)])
        expected = daily_path.with_name("tuna_weekly_briefing.json")
        if sync.weekly_output_path(args) != expected:
            errors.append("임시 일간 출력에 대한 주간 출력이 저장소를 가리킵니다")
        explicit = Path(tmp) / "separate.json"
        args = sync.build_argument_parser().parse_args(
            ["--output", str(daily_path), "--weekly-output", str(explicit)]
        )
        if sync.weekly_output_path(args) != explicit:
            errors.append("명시적 주간 출력 경로가 무시되었습니다")
    return errors


def main() -> int:
    figs_errors = test_figs_parsing()
    if figs_errors:
        for message in figs_errors:
            print(f"FAIL figs parsing: {message}", file=sys.stderr)
        return 1
    print("OK figs parsing — 값·캡션 분리, 기사당 3개, 개수 불일치 시 에러")

    gate_errors = test_impact_numbers_gate()
    if gate_errors:
        for message in gate_errors:
            print(f"FAIL impact gate: {message}", file=sys.stderr)
        return 1
    print("OK impact gate — 리드 figs 3개·다이제스트 2건 이상")

    weekly_errors = test_weekly_upsert_contract()
    if weekly_errors:
        for message in weekly_errors:
            print(f"FAIL weekly upsert: {message}", file=sys.stderr)
        return 1
    print("OK weekly upsert — 중복 교체·주 초기화·토·일 제외·정렬·원자적 쓰기")
    output_errors = test_weekly_output_selection()
    if output_errors:
        for message in output_errors:
            print(f"FAIL weekly output: {message}", file=sys.stderr)
        return 1
    print("OK weekly output — 사용자 지정 일간 출력과 주간 출력 격리")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
