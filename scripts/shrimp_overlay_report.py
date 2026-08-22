#!/usr/bin/env python3
"""새우 산업 해부 보고서의 발견을 /shrimp 위젯으로 얹는다.

현행 24위젯은 세계 축에 몰려 있고 한국 국내 축(생산·가공·업체·재무)이 거의 없다.
보고서가 새로 연 네 자리를 그 공백에 넣는다. **5-Pillar 를 깨지 않는다**(룰북 6장 MUST)
— 오징어의 F 섹션 방식을 쓰지 않고 기존 S1~S4 안에 붙인다.

입력은 Drive 의 `02_출처원본/*.json`(읽기 전용). 출력은 커밋된 v4 JSON 에 멱등 upsert.
같은 id 가 있으면 갈아 끼우고 없으면 뒤에 붙인다 — 재실행해도 중복되지 않는다.
"""
import json, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DRIVE = ('/Users/idong-geon/Library/CloudStorage/GoogleDrive-cutekorea@gmail.com/내 드라이브/'
         'agri_data/01_수산물(Seafood)/shrimp/8_한국_새우_산업_해부/02_출처원본')
TARGET = f'{ROOT}/public/data/shrimp_real_data_v4.json'


def load(name):
    with open(f'{DRIVE}/{name}', encoding='utf-8') as fh:
        return json.load(fh)


def build():
    mof = load('mof_processing_shrimp.json')          # 해수부 지정통계
    proc = load('processing_2025.json')                # 식약처 생산실적 집계
    spec = load('species_from_ingredients.json')       # 원재료 필드 종 판정
    fin = load('top100_financials.json')               # 가공 상위 재무
    ment = load('listed_shrimp_mentions.json')         # 상장사 공시 「새우」
    kos = load('kosis_domestic.json')                  # 국내 생산 종별

    W = []

    # ── S2 · 두 공식 원장이 어긋난다 ────────────────────────────────
    T_mfds = proc['total'] / 1000
    y24 = mof['by_year']['2024']
    sido_mof = dict(mof['sido_2024'])
    sido_mfds = dict(proc['addr'])
    tot_mfds = proc['total']
    def pick(d, k, tot):
        return round(d.get(k, 0) / tot * 100, 1)
    regions = ['부산광역시', '충청남도', '경기도', '인천광역시', '전라남도']
    W.append({
        'id': 'w30_two_ledgers',
        'title': '두 공식 원장의 가공 지역 (%)',
        'subtitle': '해수부 지정통계와 식약처 생산실적이 1위 시도를 서로 다르게 센다',
        'chartType': 'bar', 'pillar': 'S2', 'telemetry': 'SYNCED',
        'syncDate': '해수부 2024년 · 식약처 2025년',
        'source': 'KOSIS 해양수산부 수산물가공업통계(DT_MLTM_5002733), 식품안전나라 생산실적',
        'sourceQuote': (f"해수부 2024 합계 {y24['q']/1000:,.0f}톤 · "
                        f"식약처 2025 합계 {T_mfds:,.0f}톤 · 부산 해수부 "
                        f"{pick(sido_mof,'부산광역시',y24['q'])}% vs 식약처 "
                        f"{pick(sido_mfds,'부산광역시',tot_mfds)}%"),
        'sit': (f"해수부 원장에서는 부산이 {pick(sido_mof,'부산광역시',y24['q'])}%로 압도하는데, "
                f"식약처 원장에서는 충남이 {pick(sido_mfds,'충청남도',tot_mfds)}%로 앞서고 부산은 "
                f"{pick(sido_mfds,'부산광역시',tot_mfds)}%로 내려간다. 두 부처가 각자 신고를 받은 "
                '대상만 세기 때문이다 — 해수부는 수산물가공업 신고 사업장, 식약처는 식품제조가공업의 품목제조보고다.'),
        'strat': '어느 쪽이 틀린 것이 아니라 제도가 대상을 나눠 갖고 있다. 한 원장만 보면 지역 구조를 반대로 읽는다.',
        'xKey': '시도',
        'bars': [{'key': '해수부', 'name': '해수부 수산물가공업통계', 'color': '#38bdf8'},
                 {'key': '식약처', 'name': '식약처 생산실적', 'color': '#f59e0b'}],
        'data': [{'시도': r.replace('광역시', '').replace('특별자치도', '').replace('도', ''),
                  '해수부': pick(sido_mof, r, y24['q']),
                  '식약처': pick(sido_mfds, r, tot_mfds)} for r in regions],
        'unit': '%', 'yUnit': '%',
    })

    # ── S2 · 해수부는 생산액을 공표한다 ────────────────────────────
    W.append({
        'id': 'w31_mof_processing_value',
        'title': '새우 가공 생산량과 생산액 (톤 · 억 원)',
        'subtitle': '식약처 원장에 없는 생산액이 해수부 지정통계에는 있다',
        'chartType': 'composed', 'pillar': 'S2', 'telemetry': 'SYNCED',
        'syncDate': '해양수산부 수산물가공업통계 2020~2024',
        'source': 'KOSIS 해양수산부 수산물가공업통계(DT_MLTM_5002733)',
        'sourceQuote': ' · '.join(f"{y} {v['q']/1000:,.0f}톤/{v['v']/1000/100:,.0f}억원"
                                  for y, v in sorted(mof['by_year'].items())),
        'sit': (f"2024년 새우 계열 가공은 {y24['q']/1000:,.0f}톤 · {y24['v']/1000/100:,.0f}억 원이고 "
                f"단가는 킬로그램당 {y24['unit_price']:,.0f}원이다. 2022년 "
                f"{mof['by_year']['2022']['v']/1000/100:,.0f}억 원에서 2년 만에 "
                f"{(1-y24['v']/mof['by_year']['2022']['v'])*100:.0f}% 줄었다."),
        'strat': '가공 단계의 값을 공개 자료로 볼 수 있는 유일한 자리다. 업체별로는 갈리지 않고 시군구까지만 열린다.',
        'xKey': '연도',
        'bars': [{'key': '수량', 'name': '생산량(톤)', 'color': '#38bdf8'}],
        'lines': [{'key': '단가', 'name': '단가(원/kg)', 'color': '#f43f5e'}],
        'data': [{'연도': y, '수량': round(v['q'] / 1000),
                  '생산액': round(v['v'] / 1000 / 100), '단가': round(v['unit_price'])}
                 for y, v in sorted(mof['by_year'].items())],
        'unit': '톤 · 원/kg', 'yUnit': '톤',
    })

    # ── S3 · 공시와 신고가 어긋난다 ────────────────────────────────
    imp = {'이마트': 271, '씨제이프레시웨이': 270, '동원산업': 140, '대상': 86,
           '씨제이제일제당': 35, '한성기업': 14, '농심': 12, '롯데웰푸드': 0}
    rows = [{'회사': k, '공시 언급': ment.get(k, {}).get('count', 0) or 0, '직수입 신고': v}
            for k, v in imp.items()]
    W.append({
        'id': 'w32_listed_disclosure_gap',
        'title': '상장사 공시 「새우」와 직수입 신고 (회 · 건)',
        'subtitle': '공시에 없다고 다루지 않는 것은 아니다',
        'chartType': 'bar', 'pillar': 'S3', 'telemetry': 'SYNCED',
        'syncDate': 'DART 2025년 사업보고서 · 식약처 신고 2023~2026년 8월',
        'source': 'DART 사업보고서 원문, 식약처 수입식품 공개포털 신고 원장',
        'sourceQuote': ('동원산업 공시 0회 · 신고 140건(페루·에콰도르) / '
                        '이마트 0회 · 271건 / 롯데웰푸드 14회 · 0건'),
        'sit': ('새우를 독립 품목으로 금액까지 공시하는 상장사는 없다. 동원산업은 사업보고서에 '
                '「새우」가 0회지만 신고 140건을 냈고, 이마트는 0회에 271건으로 가장 많다. '
                '반대로 롯데웰푸드는 14회 나오지만 직수입은 0건이다 — 국내 유통 단계에서 받는다.'),
        'strat': '공시만으로 조달 구조를 읽으면 반대로 읽는다. 위생 신고 원장을 겹쳐야 실제 경로가 보인다.',
        'xKey': '회사',
        'bars': [{'key': '직수입 신고', 'name': '직수입 신고(건)', 'color': '#38bdf8'},
                 {'key': '공시 언급', 'name': '사업보고서 「새우」(회)', 'color': '#f59e0b'}],
        'data': rows, 'unit': '건 · 회', 'yUnit': '건',
    })

    # ── S4 · 종은 위생 원장에서 갈린다 ────────────────────────────
    tot_s = spec['identified']
    W.append({
        'id': 'w33_species_from_ingredients',
        'title': '수입 신고 종별 구성 (%)',
        'subtitle': '관세 세번은 종을 안 세지만 위생 원장의 원재료 칸은 센다',
        'chartType': 'pie', 'pillar': 'S4', 'telemetry': 'SYNCED',
        'syncDate': '식약처 신고 2023~2026년 8월',
        'source': '식약처 수입식품 공개포털 신고 원장의 「원재료」·「제품명」 문자열 판정',
        'sourceQuote': (f"전체 {spec['total_rows']:,}건 중 종 판정 {tot_s:,}건"
                        f"({spec['rate']*100:.1f}%) · " +
                        ' · '.join(f'{k} {v:,}' for k, v in spec['species'][:4])),
        'sit': (f"2023년 이후 신고 {spec['total_rows']:,}건 가운데 {tot_s:,}건, "
                f"{spec['rate']*100:.1f}%의 종이 갈린다. 흰다리새우가 "
                f"{spec['species'][0][1]/tot_s*100:.1f}%다. **신고 건수이지 물량이나 금액이 아니다** "
                '— 원장에 중량 칸이 없어 물량으로 옮길 방법이 없다.'),
        'strat': '종 × 금액은 여전히 만들어지지 않는다. 종을 아는 원장에는 금액이 없고 금액을 아는 원장에는 종이 없다.',
        'xKey': '종',
        'data': [{'종': k, 'value': round(v / tot_s * 100, 1)}
                 for k, v in spec['species'] if v / tot_s >= 0.001],
        'unit': '%', 'yUnit': '%',
    })
    return W


def main():
    with open(TARGET, encoding='utf-8') as fh:
        d = json.load(fh)
    new = build()
    idx = {w['id']: i for i, w in enumerate(d['widgets'])}
    added = replaced = 0
    for w in new:
        if w['id'] in idx:
            d['widgets'][idx[w['id']]] = w
            replaced += 1
        else:
            d['widgets'].append(w)
            added += 1
    with open(TARGET, 'w', encoding='utf-8') as fh:
        json.dump(d, fh, ensure_ascii=False, indent=1)
    import collections
    per = collections.Counter(w.get('pillar') for w in d['widgets'])
    print(f'추가 {added} · 갱신 {replaced} · 총 {len(d["widgets"])}위젯')
    print('기둥별: ' + ' · '.join(f'{k} {v}' for k, v in sorted(per.items(), key=lambda x: str(x[0]))))
    live = [w['id'] for w in d['widgets'] if w.get('telemetry') == 'LIVE']
    print(f'LIVE 배지: {len(live)}개' + (f' {live}' if live else ' (룰북 L-09 준수)'))
    return 0


if __name__ == '__main__':
    sys.exit(main())
