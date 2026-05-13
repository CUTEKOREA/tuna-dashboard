#!/usr/bin/env python3
import json

with open('public/data/pollock_real_data_v3.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

api_mapping = {
    'w1_global_catch': '[출처: NOAA Fisheries API / FAOSTAT API 연동]',
    'w3_diverging': '[출처: NOAA Fisheries API / Global Fishing Watch API 연동]',
    'w6_inflation_unitprice': '[출처: 관세청 OpenAPI / 글로벌 해운 운임 API 연동]',
    'w13': '[출처: 관세청 OpenAPI / KMI OpenAPI 연동]',
    'w14': '[출처: EUMOFA API / UN Comtrade API 연동]',
    'w15': '[출처: UN Comtrade API / 관세청 OpenAPI 연동]',
    'w16': '[출처: EUMOFA API / UN Comtrade API 연동]',
    'w25_processing_bottleneck': '[출처: 글로벌 해운 운임 API (Xeneta) / UN Comtrade API 연동]',
    'w27_substitute_spread': '[출처: KAMIS API / KOSIS API 연동]',
    'w29_eu_derisk_pivot': '[출처: EUMOFA API / UN Comtrade API 연동]',
    'w30_traceability_risk': '[출처: EUMOFA API / UN Comtrade API 연동]',
    'w32_sst_fleet_matrix': '[출처: NOAA SST API / Global Fishing Watch API 연동]',
    'w33_arbitrage_tracker': '[출처: 관세청 OpenAPI / KAMIS API 연동]'
}

for w in data['widgets']:
    if w['id'] in api_mapping:
        api_text = api_mapping[w['id']]
        
        # Methodology 업데이트
        current_methodology = w.get('methodology', '')
        if '[출처:' not in current_methodology:
            w['methodology'] = f"{api_text} {current_methodology}"
        else:
            import re
            w['methodology'] = re.sub(r'\[출처:.*?\]', api_text, current_methodology)
            if api_text not in w['methodology']:
                w['methodology'] = f"{api_text} {w['methodology']}"
        
        # 타이틀에 Live 🟢 뱃지 추가 (신규 2개는 유지, 기존 위젯은 추가)
        if '[Live 🟢]' not in w.get('title', ''):
            w['title'] = f"[Live 🟢] {w.get('title', '')}"

with open('public/data/pollock_real_data_v3.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("✅ API sources and Live badges added to widgets.")
