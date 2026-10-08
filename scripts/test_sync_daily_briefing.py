#!/usr/bin/env python3
"""배포 게이트가 「오늘의 수치」 위젯과 같은 기준으로 수치를 세는지 확인한다.

게이트가 위젯보다 느슨하면 화면은 빈 채로 파이프라인만 OK 를 찍는다 —
2026-09-29·10-01 회차가 「SIAL 파리 2026」 같은 연도 하나로 통과해 그렇게 나갔다.

주간 파일 upsert 규칙(중복 교체·주 초기화·토·일 제외·날짜 정렬)도 같은 게이트에서 검증한다.
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

# 위젯 정본과 같은 판정이어야 하는 표본. False = 위젯이 못 뽑는 것.
CASES = [
    ("SIAL 파리 2026", False),                        # 연도만 — 옛 게이트는 열렸다
    ("중국산 급감 속 EU 날개다랑어 수입 감소", False),   # 숫자 없음
    ("채낚기선 20척 이탈", False),                      # 「척」은 위젯 단위 목록에 없다
    ("Cepesca, 연료비 86% 급증", True),
    ("방콕 가다랑어 가격 올해 53% 상승", True),
    ("EUR 30억 3,000만 수출", True),
    ("상반기 64,782 M/T", True),
    ("USD 2,500만 계약", True),
    ("대형 선망선 어획능력 3% 증가", True),
]


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
    pattern = sync.widget_number_token_pattern()
    bad = [(t, bool(pattern.search(t)), want) for t, want in CASES if bool(pattern.search(t)) != want]
    for title, want in CASES:
        hit = pattern.search(title)
        print(f"{'HIT ' + hit.group() if hit else '--':<12} {title}")
    if bad:
        for title, got, want in bad:
            print(f"FAIL {title!r}: got {got}, want {want}", file=sys.stderr)
        return 1
    print(f"OK sync_daily_briefing 게이트 — 위젯 정본과 {len(CASES)}케이스 일치")

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
