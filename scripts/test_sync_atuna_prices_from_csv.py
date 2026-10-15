"""sync_atuna_prices_from_csv 자가 점검 — python3 scripts/test_sync_atuna_prices_from_csv.py"""
import json
import shutil
import sys
import tempfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import sync_atuna_prices_from_csv as m  # noqa: E402

ROWS = [{'date': '2026-01-01', k: 100.0} for k in m.SERIES.values()]
TEST_SRC = ''.join(f"expect(latestForKey(rows, '{k}')).toEqual({{ date: '2026-01-01', price: 100 }});\n" for k in m.SERIES.values())


def run(tmp: Path, csv_rows: dict[str, list[str]]) -> int:
    csv = tmp / 'csv'
    csv.mkdir(exist_ok=True)
    for name in m.SERIES:
        lines = ['date,value,difference'] + [f'{d:02d}-12-2025,90,0%' for d in range(1, 31)] + [f'{d:02d}-11-2025,90,0%' for d in range(1, 31)]
        lines += ['01-01-2026,100,0%'] + csv_rows.get(name, [])
        (csv / f'{name}.csv').write_text('\n'.join(lines))
    sys.argv = ['x', '--csv-dir', str(csv)]
    return m.main()


with tempfile.TemporaryDirectory() as t:
    tmp = Path(t)
    m.PRICES, m.TEST = tmp / 'p.json', tmp / 't.ts'
    base = [{'date': f'2025-{mo}-{d:02d}', k: 90.0} for k in m.SERIES.values() for mo, last in (('11', 30), ('12', 30)) for d in range(1, last + 1)]
    m.PRICES.write_text(json.dumps(base + ROWS))
    m.TEST.write_text(TEST_SRC)

    # 새 행 하나 → 추가되고 테스트 최신값이 따라간다
    assert run(tmp, {'skjbkk': ['15-01-2026,120,20%']}) == 0
    rows = json.loads(m.PRICES.read_text())
    assert {'date': '2026-01-15', 'skj_bkk': 120.0} in rows
    assert "latestForKey(rows, 'skj_bkk')).toEqual({ date: '2026-01-15', price: 120 })" in m.TEST.read_text()
    assert "latestForKey(rows, 'skj_mnt')).toEqual({ date: '2026-01-01', price: 100 })" in m.TEST.read_text()

    # 기존 날짜 값이 다르면 아무것도 쓰지 않고 3
    before = m.PRICES.read_text()
    assert run(tmp, {'skjbkk': ['15-01-2026,999,0%']}) == 3
    assert m.PRICES.read_text() == before

    # 같은 CSV 를 다시 넣으면 변동 없음
    assert run(tmp, {'skjbkk': ['15-01-2026,120,20%']}) == 0
    assert m.PRICES.read_text() == before

print('ok')
