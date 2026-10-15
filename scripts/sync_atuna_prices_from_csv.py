#!/usr/bin/env python3
"""Atuna 공개 시세 CSV 8종을 data/atuna_prices.json 에 합친다 (정기 동기화용).

Atuna 가격 페이지의 차트가 읽는 CSV(`wp-content/uploads/<name>.csv`)는 로그인 없이 받아진다.
이 스크립트는 그 CSV 와 저장소 계열을 행 단위로 대조해
  · 저장소에 없는 날짜만 추가하고
  · 이미 있는 날짜의 값이 다르면 **아무것도 쓰지 않고 종료코드 3** 으로 멈춘다(정정은 사람이 본다)
  · 저장소에만 있는 행(브리핑 기사에서 넣은 만타 8/25 등)은 건드리지 않는다.
추가가 있으면 `__tests__/atuna-prices-data.test.ts` 의 계열별 최신값 단정도 같이 고친다.

  python3 scripts/sync_atuna_prices_from_csv.py --fetch            # CSV 받아서 반영
  python3 scripts/sync_atuna_prices_from_csv.py --csv-dir <폴더>     # 받아 둔 CSV 로 반영
  python3 scripts/sync_atuna_prices_from_csv.py --csv-dir <폴더> --dry-run

종료코드: 0 반영(또는 변동 없음) · 3 기존 값 불일치 · 4 CSV 수집·형식 실패
요약은 표준출력 마지막 줄의 `SUMMARY {json}` 으로도 낸다(워크플로가 커밋 메시지에 쓴다).
"""

from __future__ import annotations

import argparse
import json
import re
import sys
import tempfile
import time
import urllib.request
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PRICES = ROOT / 'data/atuna_prices.json'
TEST = ROOT / '__tests__/atuna-prices-data.test.ts'
SERIES = {
    'skjbkk': 'skj_bkk', 'skjmnt': 'skj_mnt', 'skjabj': 'skj_abj', 'skjvig': 'skj_vig',
    'skjsey': 'skj_sey', 'yfvig': 'yf_vig', 'yfabj': 'yf_abj', 'yfsey': 'yf_sey',
}
LABEL = {
    'skj_bkk': '방콕 SKJ', 'skj_mnt': '만타 SKJ', 'skj_abj': '아비장 SKJ', 'skj_vig': '비고 SKJ',
    'skj_sey': '세이셸 SKJ', 'yf_vig': '비고 YF', 'yf_abj': '아비장 YF', 'yf_sey': '세이셸 YF',
}
URL = 'https://www.atuna.com/wp-content/uploads/{}.csv'
CRAWL_DELAY_S = 10  # robots.txt Crawl-delay


def fetch(dest: Path) -> None:
    dest.mkdir(parents=True, exist_ok=True)
    for i, name in enumerate(SERIES):
        if i:
            time.sleep(CRAWL_DELAY_S)
        req = urllib.request.Request(URL.format(name), headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=60) as r:
            (dest / f'{name}.csv').write_bytes(r.read())


def read_csv(path: Path) -> dict[str, float]:
    lines = path.read_text(encoding='utf-8-sig').strip().splitlines()
    if not lines or not lines[0].lower().startswith('date,value'):
        raise ValueError(f'{path.name}: 머리글이 date,value 가 아님 ({lines[:1]})')
    out: dict[str, float] = {}
    for line in lines[1:]:
        dt, val, *_ = line.split(',')
        out[datetime.strptime(dt.strip(), '%d-%m-%Y').date().isoformat()] = float(val)
    if len(out) < 50:
        raise ValueError(f'{path.name}: 행이 {len(out)}개뿐 — 잘린 파일로 본다')
    return out


def update_test(latest: dict[str, tuple[str, float]], changed: set[str]) -> None:
    src = TEST.read_text(encoding='utf-8')
    for key in changed:
        date, price = latest[key]
        pat = re.compile(rf"(expect\(latestForKey\(rows, '{key}'\)\)\.toEqual\(\{{ date: ')[^']+(', price: )[\d.]+( \}}\);)")
        src, n = pat.subn(rf"\g<1>{date}\g<2>{price:g}\g<3>", src)
        if n != 1:
            raise SystemExit(f'테스트 최신값 단정을 찾지 못함: {key}')
    TEST.write_text(src, encoding='utf-8')


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument('--csv-dir', type=Path)
    ap.add_argument('--fetch', action='store_true')
    ap.add_argument('--dry-run', action='store_true')
    a = ap.parse_args()
    if not a.csv_dir and not a.fetch:
        ap.error('--csv-dir 또는 --fetch 가 필요하다')
    csv_dir = a.csv_dir or Path(tempfile.mkdtemp(prefix='atuna-csv-'))
    try:
        if a.fetch:
            fetch(csv_dir)
        csv = {SERIES[n]: read_csv(csv_dir / f'{n}.csv') for n in SERIES}
    except Exception as e:  # noqa: BLE001 — 수집 실패는 반영 없이 알린다
        print(f'CSV 수집·형식 실패: {e}')
        return 4

    raw = PRICES.read_text(encoding='utf-8')
    rows = json.loads(raw)
    have = {(k, r['date']): v for r in rows for k, v in r.items() if k != 'date'}

    mismatch, added = [], []
    for key, series in csv.items():
        for date, value in series.items():
            old = have.get((key, date))
            if old is None:
                added.append((date, key, value))
            elif abs(old - value) > 1e-6:
                mismatch.append((key, date, old, value))

    if mismatch:
        for key, date, old, value in mismatch:
            print(f'불일치 {LABEL[key]} {date}: 저장소 {old:g} ≠ CSV {value:g}')
        print('SUMMARY ' + json.dumps({'status': 'mismatch', 'mismatch': len(mismatch)}, ensure_ascii=False))
        return 3

    if not added:
        print('변동 없음')
        print('SUMMARY ' + json.dumps({'status': 'nochange'}, ensure_ascii=False))
        return 0

    for date, key, value in sorted(added):
        prev = max((d for (k, d) in have if k == key and d < date), default=None)
        pv = have.get((key, prev)) if prev else None
        pct = f' ({(value / pv - 1) * 100:+.1f}%)' if pv else ''
        print(f'추가 {LABEL[key]} {date} ${value:,.0f}{pct}')

    if a.dry_run:
        print('SUMMARY ' + json.dumps({'status': 'dry-run', 'added': len(added)}, ensure_ascii=False))
        return 0

    rows.extend({'date': d, k: v} for d, k, v in added)
    rows.sort(key=lambda r: r['date'])  # 같은 날짜 안에서는 기존 순서를 지킨다(안정 정렬)
    PRICES.write_text(json.dumps(rows, ensure_ascii=False, indent=2) + ('\n' if raw.endswith('\n') else ''), encoding='utf-8')

    latest: dict[str, tuple[str, float]] = {}
    for r in rows:
        for k, v in r.items():
            if k != 'date' and (k not in latest or r['date'] >= latest[k][0]):
                latest[k] = (r['date'], v)
    update_test(latest, {k for _, k, _ in added})

    summary = ', '.join(f'{LABEL[k]} {d} ${v:,.0f}' for d, k, v in sorted(added))
    print('SUMMARY ' + json.dumps({'status': 'added', 'added': len(added), 'text': summary}, ensure_ascii=False))
    return 0


if __name__ == '__main__':
    sys.exit(main())
