#!/usr/bin/env python3
"""parse_script.py — 파일럿 숏폼 스크립트(.md)의 컷별 제작표를 구조화 JSON으로 파싱.

영상 자동화 파이프라인 1단계. 다운스트림(내레이션·비주얼·조립)이 이 JSON을 소비.
입력: artifacts/pilot_script_*.md 의 마크다운 컷 테이블
출력: out/<name>/cuts.json — [{id, idx, start, end, dur, visual_en, narration_kr, subtitle}]
"""
import json, re, sys, os


def parse_time(s):
    """'0–4s' / '0-4s' / '45s' → (start, end) 초"""
    s = s.replace('–', '-').replace('s', '').strip()
    if '-' in s:
        a, b = s.split('-', 1)
        return float(a or 0), float(b or 0)
    v = float(s or 0)
    return v, v


def clean(cell):
    """마크다운 셀 정리: **bold**·*italic*·따옴표 제거, 공백 정규화."""
    c = cell.strip()
    c = re.sub(r'\*\*([^*]+)\*\*', r'\1', c)   # bold
    c = re.sub(r'\*([^*]+)\*', r'\1', c)       # italic
    c = c.strip().strip('"“”').strip()
    return re.sub(r'\s+', ' ', c)


def parse(md_path):
    rows = []
    with open(md_path, encoding='utf-8') as f:
        for line in f:
            if not line.lstrip().startswith('|'):
                continue
            cols = [c.strip() for c in line.strip().strip('|').split('|')]
            if len(cols) < 5:
                continue
            # 첫 칸이 컷번호(숫자 시작 또는 CTA)인 행만
            head = clean(cols[0])
            if not re.match(r'^(\d|CTA|\*\*\d)', head):
                continue
            time_raw = clean(cols[1])
            start, end = parse_time(time_raw)
            rows.append({
                'id': head,
                'start': start, 'end': end, 'dur': round(max(end - start, 0.5), 1),
                'visual_en': clean(cols[2]),
                'narration_kr': clean(cols[3]),
                'subtitle': clean(cols[4]),
            })
    for i, r in enumerate(rows):
        r['idx'] = i
    return rows


def main():
    md = sys.argv[1] if len(sys.argv) > 1 else os.path.join(
        os.path.dirname(__file__), '..', '..', 'artifacts', 'pilot_script_tuna_extract.md')
    name = os.path.splitext(os.path.basename(md))[0]
    outdir = os.path.join(os.path.dirname(__file__), 'out', name)
    os.makedirs(outdir, exist_ok=True)
    cuts = parse(md)
    out = os.path.join(outdir, 'cuts.json')
    json.dump(cuts, open(out, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
    total = cuts[-1]['end'] if cuts else 0
    narr = sum(len(c['narration_kr']) for c in cuts)
    print(f"✅ 파싱: {len(cuts)}컷 · 총 {total:.0f}초 · 내레이션 {narr}자 → {out}")
    for c in cuts:
        print(f"  [{c['id']:>6}] {c['start']:.0f}-{c['end']:.0f}s | 내레이션: {c['narration_kr'][:38]}")


if __name__ == '__main__':
    main()
