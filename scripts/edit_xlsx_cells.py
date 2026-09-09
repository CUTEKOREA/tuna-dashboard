#!/usr/bin/env python3
"""xlsx 셀 값을 zip 안 sheet XML 에서 직접 고친다.

openpyxl 로 저장하면 차트 18개·도형 16개가 사라진다. 대상 셀이 든 sheet XML 만
문자열 치환하고 나머지 엔트리는 원본 바이트 그대로 다시 담는다."""
import re, shutil, sys, zipfile
from pathlib import Path

def sheet_paths(zf):
    wb = zf.read('xl/workbook.xml').decode('utf-8')
    rels = zf.read('xl/_rels/workbook.xml.rels').decode('utf-8')
    rid2t = dict(re.findall(r'<Relationship Id="([^"]+)"[^>]*Target="([^"]+)"', rels))
    out = {}
    for name, rid in re.findall(r'<sheet name="([^"]+)"[^>]*r:id="([^"]+)"', wb):
        t = rid2t[rid].lstrip('/')
        out[name] = t if t.startswith('xl/') else f'xl/{t}'
    return out

def set_cell(xml: str, ref: str, value) -> tuple[str, str]:
    """<c r="REF">…</c> 의 값을 바꾼다. 없으면 같은 행에 삽입."""
    val = '' if value is None else str(value)
    m = re.search(rf'<c r="{ref}"(?P<attrs>[^>]*?)(?P<close>/>|>(?P<body>.*?)</c>)', xml, re.S)
    if not m:
        raise SystemExit(f'{ref}: 셀을 찾지 못했습니다')
    old = m.group(0)
    attrs = re.sub(r'\s+t="[^"]*"', '', m.group('attrs'))   # 숫자로 쓰므로 t 속성 제거
    body = m.group('body') or ''
    keep_f = re.search(r'<f[^>]*>.*?</f>|<f[^>]*/>', body, re.S)
    if value is None:
        new = f'<c r="{ref}"{attrs}/>'
    else:
        inner = (keep_f.group(0) if keep_f else '') + f'<v>{val}</v>'
        new = f'<c r="{ref}"{attrs}>{inner}</c>'
    return xml.replace(old, new, 1), old

def main():
    src = Path(sys.argv[1]); edits = eval(sys.argv[2])   # {sheet: {ref: value}}
    tmp = src.with_suffix('.tmp.xlsx')
    with zipfile.ZipFile(src) as zin:
        paths = sheet_paths(zin)
        targets = {paths[s]: e for s, e in edits.items()}
        items = [(i, zin.read(i.filename)) for i in zin.infolist()]
    out = []
    for info, data in items:
        if info.filename in targets:
            xml = data.decode('utf-8')
            for ref, v in targets[info.filename].items():
                xml, old = set_cell(xml, ref, v)
                print(f'  {info.filename} {ref}: {old} -> {v}')
            data = xml.encode('utf-8')
        elif info.filename == 'xl/workbook.xml':
            xml = data.decode('utf-8')
            if 'fullCalcOnLoad' not in xml:
                if '<calcPr' in xml:
                    xml = re.sub(r'<calcPr([^>]*?)/>', r'<calcPr\1 fullCalcOnLoad="1"/>', xml, count=1)
                else:
                    xml = xml.replace('</workbook>', '<calcPr fullCalcOnLoad="1"/></workbook>')
                print('  workbook.xml: fullCalcOnLoad=1 (열 때 전체 재계산)')
            data = xml.encode('utf-8')
        out.append((info, data))
    with zipfile.ZipFile(tmp, 'w', zipfile.ZIP_DEFLATED) as zo:
        for info, data in out:
            zi = zipfile.ZipInfo(info.filename, date_time=info.date_time)
            zi.compress_type = info.compress_type
            zi.external_attr = info.external_attr
            zo.writestr(zi, data)
    shutil.move(tmp, src)
    print('저장 완료:', src.name)

main()
