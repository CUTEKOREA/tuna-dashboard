#!/usr/bin/env python3
"""normalize_scorecards.py — 9개 이종 4-Axis 스코어카드 CSV를 단일 신뢰도 원장으로 정규화.

신뢰도 마스터 플랜 I-2 (Phase 0). 6종 스키마를 canonical 14열로 통일해
artifacts/trust_ledger_baseline.csv 단일 원장을 만든다. 사이트 단위 신뢰도 KPI 산출 기반.

canonical: commodity, widget_id, title, pillar, telemetry, a1, a2, a3, a4, avg, grade, source_csv, score_method, notes
- a1~a4: 출처신뢰/신선도/검증성/통합 (스키마별 컬럼명 매핑)
- avg: sashimi_new36은 adjusted_avg(적대조정후)를 정본으로 사용
- score_method: 채점법 오염 차단 컬럼
"""
import csv, os, glob

ART = os.path.join(os.path.dirname(__file__), '..', 'artifacts')

# 스키마별 컬럼 매핑: filename stem -> {canonical: source_col 또는 None}
def axis_map(a1, a2, a3, a4):
    return {'a1': a1, 'a2': a2, 'a3': a3, 'a4': a4}

# 6종 스키마 정의 (axis 컬럼명 + id 컬럼 + pillar 유무)
SCHEMAS = {
    # id,title,a1,a2,a3,a4,avg,grade,self_reliability
    'galchi':       dict(idc='id', axes=axis_map('a1','a2','a3','a4')),
    'jukkumi':      dict(idc='id', axes=axis_map('a1','a2','a3','a4')),
    # src,file,line,id,pillar,title,a1,a2,a3,a4,avg,grade,self_reliability
    'mackerel':     dict(idc='id', axes=axis_map('a1','a2','a3','a4')),
    'squid':        dict(idc='id', axes=axis_map('a1','a2','a3','a4')),
    # source,file,id,title,pillar,axis1,axis2,axis3,axis4,avg,grade
    'salmon':       dict(idc='id', axes=axis_map('axis1','axis2','axis3','axis4')),
    'shrimp':       dict(idc='id', axes=axis_map('axis1','axis2','axis3','axis4')),
    # section,comp,id,pillar,title,status,syncDate,a1_source,a1_tier,a2_fresh,a3_verify,a4_integ,avg,grade,carddesc_len
    'sashimi':      dict(idc='id', axes=axis_map('a1_source','a2_fresh','a3_verify','a4_integ'), tele='status'),
    # widget,title,pillar,telemetry,a1,a2,a3,a4,audit_avg,adjusted_avg,grade,p0_count,p1_count,p2_count
    'sashimi_new36':dict(idc='widget', axes=axis_map('a1','a2','a3','a4'), tele='telemetry', avgc='adjusted_avg'),
    # file,line,pillar,title,axis1_source,axis2_freshness,axis3_verify,axis4_completeness,avg,grade,dynamic
    'value_chain':  dict(idc='file', axes=axis_map('axis1_source','axis2_freshness','axis3_verify','axis4_completeness')),
}


def num(v):
    try:
        return round(float(str(v).strip()), 2)
    except (ValueError, TypeError):
        return ''


def main():
    rows = []
    for path in sorted(glob.glob(os.path.join(ART, '*_4axis_scores.csv'))):
        stem = os.path.basename(path).replace('_4axis_scores.csv', '')
        sc = SCHEMAS.get(stem)
        if not sc:
            print(f"  ⚠️ 미정의 스키마 건너뜀: {stem}")
            continue
        with open(path, newline='', encoding='utf-8') as fh:
            for r in csv.DictReader(fh):
                ax = sc['axes']
                avg_col = sc.get('avgc', 'avg')
                notes = ''
                if stem == 'sashimi_new36':
                    notes = f"audit_avg={num(r.get('audit_avg',''))};p0={r.get('p0_count','')};p1={r.get('p1_count','')};p2={r.get('p2_count','')}"
                rows.append({
                    'commodity': stem,
                    'widget_id': (r.get(sc['idc']) or r.get('file') or r.get('title') or '').strip(),
                    'title': (r.get('title') or '').strip(),
                    'pillar': (r.get('pillar') or '').strip(),
                    'telemetry': (r.get(sc.get('tele','')) or '').strip(),
                    'a1': num(r.get(ax['a1'], '')),
                    'a2': num(r.get(ax['a2'], '')),
                    'a3': num(r.get(ax['a3'], '')),
                    'a4': num(r.get(ax['a4'], '')),
                    'avg': num(r.get(avg_col, '')),
                    'grade': (r.get('grade') or '').strip(),
                    'source_csv': os.path.basename(path),
                    'score_method': 'forensic_4axis_audit',
                    'notes': notes,
                })

    cols = ['commodity','widget_id','title','pillar','telemetry','a1','a2','a3','a4','avg','grade','source_csv','score_method','notes']
    out = os.path.join(ART, 'trust_ledger_baseline.csv')
    with open(out, 'w', newline='', encoding='utf-8') as fh:
        w = csv.DictWriter(fh, fieldnames=cols)
        w.writeheader()
        w.writerows(rows)

    # 요약
    from collections import Counter
    per = Counter(r['commodity'] for r in rows)
    avgs = [r['avg'] for r in rows if isinstance(r['avg'], float)]
    agate = sum(1 for a in avgs if a >= 85)
    fcnt = sum(1 for a in avgs if a < 55)
    print(f"\n✅ 단일 원장 작성: artifacts/trust_ledger_baseline.csv ({len(rows)} 위젯행)")
    print(f"품목별: " + " · ".join(f"{k}:{v}" for k, v in sorted(per.items())))
    print(f"avg 보유행: {len(avgs)}/{len(rows)} | 사이트 평균: {sum(avgs)/len(avgs):.1f} | A-gate(≥85): {agate} | F(<55): {fcnt}")
    miss = sum(1 for r in rows if not isinstance(r['avg'], float))
    if miss:
        print(f"avg 결측: {miss}행 (NULL 명시)")


if __name__ == '__main__':
    main()
