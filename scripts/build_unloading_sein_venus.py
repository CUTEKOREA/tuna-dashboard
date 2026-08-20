#!/usr/bin/env python3
"""SEIN VENUS 방콕 하역 항차(2026-08) 집계.

출처 3종을 쓰되 **정본은 회사 자체 일일 하역결과보고(.xls)** 다.
  ⓐ .xls  「일일 하역결과보고」 — 일자별 시트. 원선×어종별 본선보고량·하역량·누계·잔량.
  ⓑ .xlsx 「일일하역량 현황」   — 하역처(TUM·ISA·GPZ·MMP·PTY·GFF)×원선 배분과 예정량.
  ⓒ .txt  「하역 업무 보고」    — 작업시간·어창온도. **3일치(8/14·18·19)만 존재**.

⚠ **하역사(THAICEN) 수기 보고서(.jpg)는 수치를 가져오지 않는다.** 칸별 BALANCE 가
  자기 CARGO PLAN − G'TOTAL 과 맞지 않고(#3 부호까지 어긋남) 수기라 판독도 불확실하다.
  선석·입항일만 쓰고, 대조 실패 사실은 _meta 에 남긴다.

⚠ **이 항차는 진행 중이다.** 누계를 최종 실적으로 쓰면 안 된다.

실행: python3 scripts/build_unloading_sein_venus.py <폴더> [--out public/data/unloading]
"""
from __future__ import annotations

import argparse
import datetime as dt
import json
import re
import sys
from pathlib import Path

import unicodedata

import openpyxl
import xlrd


def find(folder: Path, needle: str, suffix: str) -> list[Path]:
    """macOS 파일명은 NFD 정규화라 NFC 패턴이 glob 으로 걸리지 않는다."""
    n = unicodedata.normalize('NFC', needle)
    return sorted(
        (f for f in folder.iterdir()
         if f.suffix.lower() == suffix and n in unicodedata.normalize('NFC', f.name)),
        key=lambda f: unicodedata.normalize('NFC', f.name),
    )

# .xls 시트의 행 배치. 원선마다 YF·SJ·계 세 줄이고, 비고는 YF 줄에 붙는다.
SOURCE_ROWS = {'S/SPR': 7, 'S/PIO': 10, 'N/STAR': 13, 'N/SUN': 16}
TOTAL_ROW = 19  # 계 블록 시작(YF)
COL = {'reported': 3, 'discharged': 4, 'cumulative': 5, 'balance': 6, 'remark': 7}


def num(v) -> float:
    return round(float(v), 3) if isinstance(v, (int, float)) else 0.0


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument('folder')
    ap.add_argument('--out', default='public/data/unloading')
    args = ap.parse_args()
    folder = Path(args.folder)

    xls_files = find(folder, '일일 하역결과보고', '.xls')
    if not xls_files:
        print('일일 하역결과보고 .xls 를 찾지 못했다', file=sys.stderr)
        return 1
    xls = xls_files[-1]  # 누적 파일이라 최신본에 전 일자가 들어 있다

    wb = xlrd.open_workbook(xls)
    sheets = [s for s in wb.sheet_names() if re.fullmatch(r'\d{2}-\d{2}', s) and not s.startswith('00')]
    errors: list[str] = []

    days = []
    for sn in sheets:
        ws = wb.sheet_by_name(sn)
        title = str(ws.cell_value(2, 0))
        m = re.search(r'(\d{4})년\s*(\d{2})월\s*(\d{2})일', title)
        if not m:
            errors.append(f'{sn}: 하역일자를 읽지 못했다 — {title!r}')
            continue
        date = dt.date(int(m.group(1)), int(m.group(2)), int(m.group(3)))
        if date.strftime('%m-%d') != sn:
            errors.append(f'{sn}: 시트명과 본문 일자가 다르다 ({date})')

        lanes = []
        for src, r in SOURCE_ROWS.items():
            yf = {k: num(ws.cell_value(r, c)) for k, c in COL.items() if k != 'remark'}
            sj = {k: num(ws.cell_value(r + 1, c)) for k, c in COL.items() if k != 'remark'}
            tot = {k: num(ws.cell_value(r + 2, c)) for k, c in COL.items() if k != 'remark'}
            # 자기점검 ①: 어종 두 줄의 합이 그 원선의 「계」 줄과 같아야 한다
            for k in ('reported', 'discharged', 'cumulative', 'balance'):
                if round(yf[k] + sj[k], 2) != round(tot[k], 2):
                    errors.append(f'{sn}/{src}/{k}: YF {yf[k]} + SJ {sj[k]} ≠ 계 {tot[k]}')
            remark = str(ws.cell_value(r, COL['remark'])).strip()
            hatches = re.findall(r'#\d+-[A-Z]', remark)
            lanes.append({
                'sourceVessel': src,
                'hatches': hatches,
                'done': '하역완료' in remark,
                'reported': tot['reported'],
                'discharged': tot['discharged'],
                'cumulative': tot['cumulative'],
                'balance': tot['balance'],
                'species': {'YF': yf['discharged'], 'SJ': sj['discharged']},
                'speciesCum': {'YF': yf['cumulative'], 'SJ': sj['cumulative']},
            })

        gy = {k: num(ws.cell_value(TOTAL_ROW, c)) for k, c in COL.items() if k != 'remark'}
        gs = {k: num(ws.cell_value(TOTAL_ROW + 1, c)) for k, c in COL.items() if k != 'remark'}
        gt = {k: num(ws.cell_value(TOTAL_ROW + 2, c)) for k, c in COL.items() if k != 'remark'}

        # 자기점검 ②: 원선 4척의 합이 「계」 블록과 같아야 한다
        for k in ('reported', 'discharged', 'cumulative', 'balance'):
            s = round(sum(l[k] for l in lanes), 2)
            if s != round(gt[k], 2):
                errors.append(f'{sn}/총계/{k}: 원선 합 {s} ≠ 계 {gt[k]}')

        # 자기점검 ③: 잔량 = 누계 − 본선보고량
        if round(gt['cumulative'] - gt['reported'], 2) != round(gt['balance'], 2):
            errors.append(f"{sn}: 잔량 {gt['balance']} ≠ 누계 {gt['cumulative']} − 보고 {gt['reported']}")

        days.append({
            'date': date.isoformat(),
            'label': f'{date.month}/{date.day}',
            'weekday': '월화수목금토일'[date.weekday()],
            'lanes': [l for l in lanes if l['discharged'] > 0 or l['done']],
            'allLanes': lanes,
            'daily': gt['discharged'],
            'cumulative': gt['cumulative'],
            'balance': gt['balance'],
            'species': {'YF': gy['discharged'], 'SJ': gs['discharged']},
            'speciesCum': {'YF': gy['cumulative'], 'SJ': gs['cumulative']},
            'speciesReported': {'YF': gy['reported'], 'SJ': gs['reported']},
        })

    days.sort(key=lambda d: d['date'])

    # 하역이 없던 날은 원자료에 시트 자체가 없다. **0 톤 하역과 다르다** —
    # 0 으로 채우면 「그날 일했는데 못 실었다」로 읽힌다. 결측으로 남긴다.
    first = dt.date.fromisoformat(days[0]['date'])
    last_d = dt.date.fromisoformat(days[-1]['date'])
    have = {d['date'] for d in days}
    gaps = []
    cur = first
    while cur <= last_d:
        if cur.isoformat() not in have:
            gaps.append({'date': cur.isoformat(), 'label': f'{cur.month}/{cur.day}',
                         'weekday': '월화수목금토일'[cur.weekday()]})
        cur += dt.timedelta(days=1)

    # 자기점검 ④: 일일 하역량을 누적하면 마지막 누계가 나와야 한다
    running = round(sum(d['daily'] for d in days), 2)
    if running != round(days[-1]['cumulative'], 2):
        errors.append(f"일일 합 {running} ≠ 최종 누계 {days[-1]['cumulative']}")

    # ── ⓑ 하역처 배분 ────────────────────────────────────────────────
    xlsx = find(folder, '일일하역량 현황', '.xlsx')[-1]
    aws = openpyxl.load_workbook(xlsx, data_only=True)['일별 하역량 ']
    rows = list(aws.iter_rows(values_only=True))
    # 2행 하역처 / 3행 원선 / 4행 계획량
    consignee, cur = [], ''
    for i, v in enumerate(rows[2]):
        if v:
            cur = str(v).strip()
        consignee.append(cur)
    plan = []
    for i, src in enumerate(rows[3]):
        s = str(src).strip() if src else ''
        if s in SOURCE_ROWS and isinstance(rows[4][i], (int, float)):
            plan.append({'consignee': consignee[i], 'sourceVessel': s,
                         'plannedMt': round(rows[4][i] / 1000, 3)})
    plan_total = round(sum(p['plannedMt'] for p in plan), 3)

    # 일자별 하역처 배분. 「SUB」 열은 소계라 배분으로 세면 이중계상이다.
    lane_cols = [(i, consignee[i], str(rows[3][i]).strip())
                 for i in range(len(rows[3]))
                 if str(rows[3][i] or '').strip() in SOURCE_ROWS]
    by_date: dict[str, list[dict]] = {}
    sched: dict[str, float] = {}
    for row in rows[5:]:
        if not row or not isinstance(row[0], str) or not re.fullmatch(r'\d{2}\.\d{2}\.\d{4}', row[0].strip()):
            continue
        d, mo, yr = row[0].strip().split('.')
        key = f'{int(mo)}/{int(d)}'
        by_date[key] = [
            {'consignee': cn, 'sourceVessel': sv, 'amountMt': round(row[i] / 1000, 3)}
            for i, cn, sv in lane_cols
            if isinstance(row[i], (int, float)) and row[i]
        ]
        # 12번 열이 예정량(Scheduled load). 실적과 견주는 유일한 계획치다.
        if isinstance(row[12], (int, float)):
            sched[key] = round(row[12] / 1000, 3)

    # 자기점검 ⑤: 하역처 계획 합 = 본선보고 총량
    reported_total = days[-1]['allLanes'][0]['reported'] and round(
        sum(l['reported'] for l in days[-1]['allLanes']), 3)
    if plan_total != reported_total:
        errors.append(f'하역처 계획 합 {plan_total} ≠ 본선보고 총량 {reported_total}')

    # ── ⓒ 작업시간·어창온도 (있는 날만) ───────────────────────────────
    notes = {}
    for txt in find(folder, '하역 업무 보고', '.txt'):
        body = txt.read_text(encoding='utf-8')
        dm = re.search(r'하역 업무 보고 \((\d+)/(\d+)\)', body)
        if not dm:
            continue
        key = f'{int(dm.group(1))}/{int(dm.group(2))}'
        hm = re.search(r'하역작업은\s*([\d:]+)\s*~\s*([\d:]+)', body)
        temps = [{'target': t.strip(), 'range': f'{lo}℃ ~ {hi}℃'}
                 for t, lo, hi in re.findall(
                     r'\*\s*([A-Z/]+\(#[\d\-A-Z]+\))\s*\n\s*-\s*어창 개방 측정온도는\s*'
                     r'(-?[\d.]+)℃\s*~\s*(-?[\d.]+)℃', body)]
        nxt = re.search(r'명일\([\d/]+\)(?:은)?\s*약\s*([\d,]+)톤', body)
        notes[key] = {
            'workingHours': f'{hm.group(1)} ~ {hm.group(2)}' if hm else None,
            'temperatures': temps,
            'nextDayPlanMt': int(nxt.group(1).replace(',', '')) if nxt else None,
        }

    for d in days:
        allocs = by_date.get(d['label'])
        if allocs is None:
            errors.append(f"{d['label']}: 하역처 배분표에 해당 일자가 없다")
            continue
        a = round(sum(x['amountMt'] for x in allocs), 2)
        if a != round(d['daily'], 2):
            errors.append(f"{d['label']}: 하역처 배분 합 {a} ≠ 일일 하역량 {d['daily']}")

    if errors:
        print('원본 대조 실패:', file=sys.stderr)
        for e in errors[:30]:
            print('  -', e, file=sys.stderr)
        return 1

    last = days[-1]
    lanes_final = last['allLanes']
    sp_sum = round(last['speciesReported']['YF'] + last['speciesReported']['SJ'], 2)
    if sp_sum != round(reported_total, 2):
        print(f'어종 보고량 합 {sp_sum} ≠ 총 보고량 {reported_total}', file=sys.stderr)
        return 1
    out = {
        '_meta': {
            '선박': 'M/V SEIN VENUS',
            '하역지': 'BANGKOK, THAILAND',
            '선석': '41',
            '입항일': '2026-08-06',
            '판매처': 'FCF CO.,LTD',
            '출처': '신라교역 방콕사무소 일일 하역결과보고 (.xls) · 일일하역량 현황 (.xlsx) · 하역 업무 보고 (.txt)',
            '등급': 'A',
            '기준일': last['date'],
            '진행상태': '하역 진행 중 — 누계를 최종 실적으로 쓰지 않는다',
            '주의': (
                '하역사(THAICEN) 수기 일일보고서는 칸별 BALANCE 가 자기 CARGO PLAN − 누계와 '
                '맞지 않고(#3 은 부호까지 어긋남) 수기라 판독도 불확실하다. 선석·입항일 외에는 '
                '쓰지 않았다.'
            ),
            '무하역일': (
                '하역 기록이 없는 날: '
                + ' · '.join(f"{g['label']}({g['weekday']})" for g in gaps)
                + '. 원자료에 해당 일자 시트가 없다 — 0 톤 하역이 아니라 기록 없음이다. '
                '일요일 두 날은 휴무로 보이나 원자료가 사유를 적지 않았다.'
            ),
            '결측': (
                f'작업시간·어창온도는 업무보고 문서가 있는 {len(notes)}일치({" · ".join(sorted(notes))})만 있다. '
                '나머지 날은 원자료에 없어 비워 둔다.'
            ),
            '갱신방법': 'python3 scripts/build_unloading_sein_venus.py <폴더>',
        },
        '요약': {
            '본선보고총량': reported_total,
            '하역누계': last['cumulative'],
            '잔량': round(reported_total - last['cumulative'], 3),
            '하역일수': len(days),
            '진척률': round(last['cumulative'] / reported_total * 100, 1),
            # 어종 구성이 본선보고와 어긋난다. 합계만 보면 안 보이는 자리라 따로 낸다.
            '어종': {
                sp: {
                    '보고': last['speciesReported'][sp],
                    '누계': last['speciesCum'][sp],
                    '차이': round(last['speciesCum'][sp] - last['speciesReported'][sp], 3),
                }
                for sp in ('YF', 'SJ')
            },
        },
        '원선별': [
            {'원선': l['sourceVessel'], '보고': l['reported'], '누계': l['cumulative'],
             '잔량': round(l['reported'] - l['cumulative'], 3), '완료': l['done']}
            for l in lanes_final
        ],
        '무하역일': gaps,
        '하역처계획': plan,
        '일자별': [
            {**{k: d[k] for k in ('date', 'label', 'weekday', 'daily', 'cumulative', 'species')},
             '원선': [{'원선': l['sourceVessel'], '어창': l['hatches'], '하역량': l['discharged'],
                      '완료': l['done']} for l in d['lanes']],
             '하역처': by_date.get(d['label'], []),
             '예정량': sched.get(d['label']),
             **(notes.get(d['label']) or {'workingHours': None, 'temperatures': [], 'nextDayPlanMt': None})}
            for d in days
        ],
    }

    outdir = Path(args.out)
    outdir.mkdir(parents=True, exist_ok=True)
    (outdir / 'sein_venus_2026_08.json').write_text(
        json.dumps(out, ensure_ascii=False, indent=1), encoding='utf-8')

    print(f"하역일 {len(days)}일 · 누계 {last['cumulative']:,.3f} / {reported_total:,.0f} MT "
          f"({out['요약']['진척률']}%) · 잔량 {out['요약']['잔량']:,.3f} MT")
    print(f"원선 완료 {sum(1 for l in lanes_final if l['done'])}/4 · "
          f"작업시간 기록 {len(notes)}일")
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
