#!/usr/bin/env python3
"""하역 일일보고 한 날치를 `public/data/unloading/local_db.json` 에 덧붙인다.

이 원장이 화면의 정본이다. `/api/unloading-db` 가 이 파일을 읽고,
`UnloadingStatus` 는 DB 값으로 정적 원장을 **덮어쓴다** — 정적 원장에 같은 항차를
따로 적으면 화면에 뜨지 않는 죽은 사본이 된다.

출처 4종과 그 쓰임:
  ⓐ .xls  「일일 하역결과보고」  — 원선×어종 하역량·누계. `source_workbook_sha256`
  ⓑ .xlsx 「일일하역량 현황」    — 하역처 배분·예정량.   `status_workbook_sha256`
  ⓒ .txt  「하역 업무 보고」     — 작업시간·어창온도·명일계획
  ⓓ .jpg  하역사(THAICEN) 수기  — 조정량(검량 차이).    `source_sha256`

⚠ **조정량은 ⓓ 수기 보고서에만 있고 기계로 읽을 수 없다.** `--daily-adjustment` 로
  받아서, 직전 누적조정과 더한 값이 수기 보고서의 「UP TO DATE TOTAL +」 와 맞는지
  사람이 확인해야 한다. 스크립트는 산술만 보증한다.

실행:
  python3 scripts/append_unloading_day.py <폴더> --vessel sein-venus \\
      --date 8/19 --daily-adjustment 3.01
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
import unicodedata
from pathlib import Path

import openpyxl
import xlrd

# .xls 일자 시트의 행 배치. 원선마다 YF·SJ·계 세 줄, 비고는 YF 줄에 붙는다.
SOURCE_ROWS = {'S/SPR': 7, 'S/PIO': 10, 'N/STAR': 13, 'N/SUN': 16}
TOTAL_YF = 19
COL = {'reported': 3, 'discharged': 4, 'cumulative': 5, 'balance': 6, 'remark': 7}


def nfc(s: str) -> str:
    return unicodedata.normalize('NFC', s)


def find(folder: Path, stamp: str, needle: str, suffix: str) -> Path | None:
    """macOS 파일명은 NFD 라 NFC 패턴이 glob 으로 걸리지 않는다."""
    n, want = nfc(needle), suffix.lower()
    hits = [f for f in folder.iterdir()
            if f.suffix.lower() == want and n in nfc(f.name) and nfc(f.name).startswith(stamp)]
    return sorted(hits, key=lambda f: nfc(f.name))[-1] if hits else None


def sha256(p: Path) -> str:
    return hashlib.sha256(p.read_bytes()).hexdigest()


def num(v) -> float:
    return round(float(v), 3) if isinstance(v, (int, float)) else 0.0


def hatch_key(h: str) -> tuple:
    m = re.match(r'#(\d+)-([A-Z])', h)
    return (int(m.group(1)), m.group(2)) if m else (99, h)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument('folder')
    ap.add_argument('--vessel', required=True, help='local_db.json 의 vessel_id')
    ap.add_argument('--date', required=True, help='예: 8/19')
    ap.add_argument('--daily-adjustment', type=float, required=True,
                    help='하역사 수기 보고서의 그날 조정량(톤). 검량 차이라 기계로 읽을 수 없다')
    ap.add_argument('--hatch-split', action='append', default=[],
                    help='원선이 어창 둘 이상을 쓴 날의 어창별 하역량. '
                         '.xls 는 원선 단위까지만 적어 기계로 가를 수 없다. '
                         '예: "S/PIO:#1-A=80.670,#1-B=41.170"')
    ap.add_argument('--db', default='public/data/unloading/local_db.json')
    args = ap.parse_args()

    folder = Path(args.folder)
    mo, day = (int(x) for x in args.date.split('/'))
    stamp = f'2026{mo:02d}{day:02d}'

    src = {
        'xls': find(folder, stamp, '일일 하역결과보고', '.xls'),
        'xlsx': find(folder, stamp, '일일하역량 현황', '.xlsx'),
        'txt': find(folder, stamp, '하역 업무 보고', '.txt'),
        'jpg': find(folder, stamp, 'Silla-Daily discharging report', '.jpg'),
    }
    missing = [k for k, v in src.items() if v is None]
    if missing:
        print(f'{stamp} 원본 없음: {", ".join(missing)}', file=sys.stderr)
        return 1

    db = json.loads(Path(args.db).read_text(encoding='utf-8'))
    vessel = next((v for v in db['unloading_vessels'] if v['vessel_id'] == args.vessel), None)
    if vessel is None:
        print(f'원장에 {args.vessel} 이 없다', file=sys.stderr)
        return 1
    prior = [r for r in db['unloading_reports'] if r['vessel_id'] == args.vessel]
    if any(r['report_date'] == args.date for r in prior):
        print(f'{args.date} 는 이미 원장에 있다 — 덧붙이지 않는다', file=sys.stderr)
        return 1
    last = prior[-1]

    # ── ⓐ .xls 일자 시트 ─────────────────────────────────────────────
    wb = xlrd.open_workbook(src['xls'])
    sheet = f'{mo:02d}-{day:02d}'
    if sheet not in wb.sheet_names():
        print(f'{src["xls"].name} 에 {sheet} 시트가 없다', file=sys.stderr)
        return 1
    ws = wb.sheet_by_name(sheet)
    title = str(ws.cell_value(2, 0))
    if not re.search(rf'{mo:02d}월\s*{day:02d}일', title):
        print(f'시트 본문 일자가 다르다: {title!r}', file=sys.stderr)
        return 1

    errors: list[str] = []
    lanes = {}
    for name, r in SOURCE_ROWS.items():
        yf = {k: num(ws.cell_value(r, c)) for k, c in COL.items() if k != 'remark'}
        sj = {k: num(ws.cell_value(r + 1, c)) for k, c in COL.items() if k != 'remark'}
        tot = {k: num(ws.cell_value(r + 2, c)) for k, c in COL.items() if k != 'remark'}
        for k in ('reported', 'discharged', 'cumulative'):
            if round(yf[k] + sj[k], 2) != round(tot[k], 2):
                errors.append(f'{name}/{k}: YF+SJ {yf[k] + sj[k]} ≠ 계 {tot[k]}')
        remark = str(ws.cell_value(r, COL['remark'])).strip()
        lanes[name] = {'total': tot, 'hatches': re.findall(r'#\d+-[A-Z]', remark),
                       'done': '하역완료' in remark}

    gy = {k: num(ws.cell_value(TOTAL_YF, c)) for k, c in COL.items() if k != 'remark'}
    gs = {k: num(ws.cell_value(TOTAL_YF + 1, c)) for k, c in COL.items() if k != 'remark'}
    gt = {k: num(ws.cell_value(TOTAL_YF + 2, c)) for k, c in COL.items() if k != 'remark'}

    daily, cumulative = gt['discharged'], gt['cumulative']
    reported_total = gt['reported']

    # 자기점검: 원선 합 = 총계 / 어종 합 = 총계 / 직전 누계와 이어지는가
    for k in ('reported', 'discharged', 'cumulative'):
        s = round(sum(l['total'][k] for l in lanes.values()), 2)
        if s != round(gt[k], 2):
            errors.append(f'총계/{k}: 원선 합 {s} ≠ 계 {gt[k]}')
    if round(gy['discharged'] + gs['discharged'], 2) != round(daily, 2):
        errors.append(f"어종 합 {gy['discharged'] + gs['discharged']} ≠ 일일 {daily}")
    if round(last['cumulative_amount'] + daily, 2) != round(cumulative, 2):
        errors.append(f"누계가 이어지지 않는다: 직전 {last['cumulative_amount']} + {daily} ≠ {cumulative}")
    if round(reported_total, 2) != round(vessel['reported_total'], 2):
        errors.append(f"본선보고 총량이 원장과 다르다: {reported_total} vs {vessel['reported_total']}")

    # ── ⓑ .xlsx 하역처 배분 ──────────────────────────────────────────
    aws = openpyxl.load_workbook(src['xlsx'], data_only=True)['일별 하역량 ']
    rows = list(aws.iter_rows(values_only=True))
    consignee, cur = [], ''
    for v in rows[2]:
        if v:
            cur = str(v).strip()
        consignee.append(cur)
    lane_cols = [(i, consignee[i], str(rows[3][i]).strip())
                 for i in range(len(rows[3]))
                 if str(rows[3][i] or '').strip() in SOURCE_ROWS]
    target = f'{day:02d}.{mo:02d}.2026'
    arow = next((r for r in rows[5:] if isinstance(r[0], str) and r[0].strip() == target), None)
    if arow is None:
        errors.append(f'하역량 현황표에 {target} 행이 없다')
        allocs = []
    else:
        allocs = [{'consignee': cn, 'sourceVessel': sv, 'amount': round(arow[i] / 1000, 3)}
                  for i, cn, sv in lane_cols
                  if isinstance(arow[i], (int, float)) and arow[i]]
        s = round(sum(a['amount'] for a in allocs), 2)
        if s != round(daily, 2):
            errors.append(f'하역처 배분 합 {s} ≠ 일일 하역량 {daily}')

    # ── ⓒ .txt 작업시간·온도·명일 ────────────────────────────────────
    body = src['txt'].read_text(encoding='utf-8')
    hm = re.search(r'하역작업은\s*([\d:]+)\s*~\s*([\d:]+)', body)
    if not hm:
        errors.append('업무보고에서 작업시간을 읽지 못했다')
    temps = [(t.strip(), float(lo), float(hi)) for t, lo, hi in re.findall(
        r'\*\s*([A-Z/]+\(#[\d\-A-Z]+\))\s*\n\s*-\s*어창 개방 측정온도는\s*'
        r'(-?[\d.]+)℃\s*~\s*(-?[\d.]+)℃', body)]
    if not temps:
        errors.append('업무보고에서 어창온도를 읽지 못했다')
    nxt = re.search(r'명일\((\d+)/(\d+)\)(?:은)?\s*약\s*([\d,]+)톤', body)
    nxt_date = re.search(r'명일\((\d+)/(\d+)\)', body)

    if errors:
        print('원본 대조 실패:', file=sys.stderr)
        for e in errors:
            print('  -', e, file=sys.stderr)
        return 1

    # ── 조정량 ──────────────────────────────────────────────────────
    cum_adj = round((last.get('cumulative_adjustment_amount') or 0) + args.daily_adjustment, 2)
    remaining = round(reported_total - cumulative, 2)

    # ── 행 만들기 ────────────────────────────────────────────────────
    # 어창별 하역량. `.xls` 는 원선 단위까지만 적는다 — 원선이 어창 둘을 썼으면
    # 가를 근거가 없으므로 **추정하지 않고 멈춘다.** 균등분할이나 배분표 유용은
    # 그럴듯한 숫자를 만들어 낼 뿐이다.
    split: dict[str, dict[str, float]] = {}
    for spec in args.hatch_split:
        name, rest = spec.split(':', 1)
        split[name.strip()] = {
            h.strip(): float(a) for h, a in (part.split('=') for part in rest.split(','))
        }
    active = {n: l for n, l in lanes.items() if l['total']['discharged'] > 0 and l['hatches']}
    for name, l in active.items():
        if len(l['hatches']) > 1 and name not in split:
            errors.append(
                f'{name} 이 어창 {len(l["hatches"])}곳({", ".join(l["hatches"])})을 썼는데 '
                f'어창별 하역량이 없다 — --hatch-split "{name}:{"=,".join(l["hatches"])}=" 로 넘길 것'
            )
        if name in split and round(sum(split[name].values()), 2) != round(l['total']['discharged'], 2):
            errors.append(f'{name} 어창별 합 {sum(split[name].values())} ≠ 원선 하역량 '
                          f'{l["total"]["discharged"]}')
    if errors:
        print('원본 대조 실패:', file=sys.stderr)
        for e in errors:
            print('  -', e, file=sys.stderr)
        return 1

    def hold_str(name: str, l: dict) -> str:
        amounts = split.get(name) or {l['hatches'][0]: l['total']['discharged']}
        inner = ','.join(f'{h}:{amounts[h]:.3f}' for h in sorted(amounts, key=hatch_key))
        return f'{name}({inner})'

    holds = ', '.join(
        hold_str(n, l) for n, l in
        sorted(active.items(), key=lambda kv: hatch_key(sorted(kv[1]['hatches'], key=hatch_key)[0]))
    )

    by_consignee: dict[str, list] = {}
    for a in allocs:
        by_consignee.setdefault(a['consignee'], []).append(a)
    allocations = []
    for cn, items in by_consignee.items():
        loads = []
        for a in items:
            hs = sorted(lanes[a['sourceVessel']]['hatches'], key=hatch_key)
            loads.append({'source_vessel': a['sourceVessel'],
                          'hatch': hs[0] if len(hs) == 1 else ','.join(hs),
                          'amount': a['amount']})
        allocations.append({'consignee': cn,
                            'amount': round(sum(l['amount'] for l in loads), 3),
                            'loads': loads})

    report = {
        'id': f'{args.vessel}-{mo}-{day}',
        'vessel_id': args.vessel,
        'report_year': 2026,
        'report_date': args.date,
        'work_time': f'{hm.group(1)} ~ {hm.group(2)}',
        'target_holds': holds,
        'consignee': ' · '.join(by_consignee),
        'allocations': allocations,
        'observations': [
            {'source_vessel': t.split('(')[0],
             'hatch': t.split('(')[1].rstrip(')'),
             'temperatures_c': [lo, hi]}
            for t, lo, hi in temps
        ],
        'daily_amount': daily,
        'cumulative_amount': cumulative,
        'species_amounts': {'SJ': gs['discharged'], 'YF': gy['discharged']},
        'remaining_amount': remaining,
        'daily_adjustment_amount': args.daily_adjustment,
        'cumulative_adjustment_amount': cum_adj,
        'adjusted_remaining_amount': round(remaining + cum_adj, 2),
        'next_day': (
            {'kind': 'work', 'date': f'{int(nxt.group(1))}/{int(nxt.group(2))}',
             'planned_mt': int(nxt.group(3).replace(',', ''))}
            if nxt else
            {'kind': 'work',
             'date': f'{int(nxt_date.group(1))}/{int(nxt_date.group(2))}' if nxt_date else None,
             'planned_mt': None,
             'reason': '원자료에 명일 하역 계획이 기재되지 않았습니다'}
        ),
        'quality_notes': ' '.join(
            f'{t} - 어창 개방 측정온도는 {lo:.1f}℃ ~ {hi:.1f}℃ 입니다.' for t, lo, hi in temps),
        'source_sha256': sha256(src['jpg']),
        'source_workbook_sha256': sha256(src['xls']),
        'status_workbook_sha256': sha256(src['xlsx']),
        'created_at': f'2026-{mo:02d}-{day:02d}T22:00:00+09:00',
    }

    db['unloading_reports'].append(report)
    for s in db['unloading_species']:
        if s['vessel_id'] != args.vessel:
            continue
        s['actual_amount'] = gs['cumulative'] if s['species_id'] == 'SJ' else gy['cumulative']
        s['updated_at'] = report['created_at']
    vessel['species_breakdown_as_of'] = f'2026-{mo:02d}-{day:02d}'
    vessel['updated_at'] = report['created_at']
    done = [n for n, l in lanes.items() if l['done']]
    vessel['species_breakdown_note'] = (
        f'{args.date} 일일 결과보고 XLS에서 어종별 일일·누적 물량을 확인했고 '
        f'일일하역량 현황 XLSX로 교차 확인했습니다. 개별 어창별 어종 분해는 제공되지 않습니다.'
        + (f' 원선 {len(done)}척({", ".join(sorted(done))}) 하역완료.' if done else '')
    )

    Path(args.db).write_text(json.dumps(db, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

    print(f"{args.date} 반영 · 일일 {daily:,.2f} · 누계 {cumulative:,.2f}/{reported_total:,.0f} MT "
          f"({cumulative / reported_total * 100:.1f}%) · 잔량 {remaining:,.2f}")
    print(f"  조정 {args.daily_adjustment:+.2f} → 누적조정 {cum_adj:+.2f} · "
          f"조정잔량 {report['adjusted_remaining_amount']:,.2f}")
    print(f"  ⚠ 수기 보고서의 「UP TO DATE TOTAL +」 가 {cum_adj:+.2f} 인지 눈으로 확인할 것")
    print(f"  어종 누계 SJ {gs['cumulative']:,.2f} · YF {gy['cumulative']:,.2f}")
    if done:
        print(f"  하역완료 원선: {', '.join(sorted(done))}")
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
