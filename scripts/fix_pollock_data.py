#!/usr/bin/env python3
"""Fix W13 and W18 data errors in pollock_real_data_v3.json"""
import json

with open('public/data/pollock_real_data_v3.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

for w in data['widgets']:
    # FIX W13: Korea import totals and partner breakdown
    if w['id'] == 'w13':
        w['subtitle'] = '180,559톤 중 171,165톤이 러시아산. 미국(4.2%), 일본(0.7%) 대안 부재'
        w['data'] = [
            {"name": "러시아", "value": 171165},
            {"name": "미국", "value": 7654},
            {"name": "일본", "value": 1276},
            {"name": "중국", "value": 314},
            {"name": "캐나다", "value": 148},
            {"name": "기타", "value": 2}
        ]
        w['sit'] = '2023년 한국 명태 수입 180,559톤 중 러시아 171,165톤(94.8%), 미국 7,654톤(4.2%), 일본 1,276톤(0.7%)으로 러시아 단일국 의존도가 94.8%에 달합니다. 이는 전 세계 수산물 교역에서 유례가 없는 극단적 집중도이며, 기존 추정치(91.8%)보다 더 심각한 수준입니다.'
        w['strat'] = '미국 MSC 인증 명태의 수입 비중을 현시점 4.2%에서 15% 이상으로 확대하고, 캐나다·노르웨이 등 NATO 우방국으로 공급 다변화를 추진해야 합니다. 러시아 의존도 80% 이하가 최소 안전 임계값입니다.'
        print("✅ W13 fixed: total 180,559t, Russia 94.8%")
    
    # FIX W18: Korea = Republic of Korea only (exclude DPRK)
    if w['id'] == 'w18':
        # Correct Korea values from CSV (Republic of Korea only)
        korea_correct = {
            '2010': 46795, '2011': 48793, '2012': 39026, '2013': 24342,
            '2014': 31624, '2015': 20014, '2016': 20129, '2017': 23498,
            '2018': 9, '2019': 23915, '2020': 27196, '2021': 27779,
            '2022': 21591, '2023': 24503, '2024': 28999
        }
        for dp in w['data']:
            yr = dp.get('year', '')
            if yr in korea_correct:
                dp['한국'] = korea_correct[yr]
        
        w['sit'] = '2024년 러시아 1,927,938톤(전체의 55.3%), 미국 1,425,044톤(40.8%), 일본 123,600톤(3.5%), 한국 28,999톤(0.8%)입니다. 2010년대 초반까지 미·러 50:50이었던 구도가 완전히 러시아 독주로 전환되었으며, 한국은 전체 어획의 0.8%에 불과합니다.'
        print("✅ W18 fixed: Korea values corrected to Republic of Korea only")
    
    # FIX W7: SIT text "30%" → "2배 이상"
    if w['id'] == 'w7_usa_russia_unitprice':
        w['situation'] = '조업 강도만 높은 러시아산의 1톤당 무역 단가 대비, 완벽한 자원 관리와 친환경(MSC) 인증 꼬리표를 붙인 미국산 명태의 수출 평균 단가는 2배 이상(+106%) 프리미엄이 붙어 판매되고 있습니다.'
        print("✅ W7 SIT fixed: 30% → 2배 이상(+106%)")

    # FIX W10: China surimi 미세 보정
    if w['id'] == 'w10_surimi_top3':
        w['data'][0]['생산량'] = 1542991
        print("✅ W10 fixed: China surimi 1,540,348 → 1,542,991")

# Update KPI4 to match corrected W13
data['kpis']['kpi4']['value'] = '94.8%'
data['kpis']['kpi4']['desc'] = '180,559톤 중 171,165톤이 러시아산'
print("✅ KPI4 fixed: 91.8% → 94.8%")

with open('public/data/pollock_real_data_v3.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("\n🎯 All fixes applied successfully.")
