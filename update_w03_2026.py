import json

with open('public/data/tuna_real_data_v3.json', 'r') as f:
    data = json.load(f)

for w in data['widgets']:
    if w['id'] == 'w03_pie':
        w['title'] = "[글로벌 패권] 국가별 가다랑어/황다랑어 조업량 Top 5 점유율 (2026E)"
        w['situation'] = "2026년 추정치 기준 인도네시아, 베트남, 한국, 에콰도르, 일본이 글로벌 가다랑어 및 황다랑어 조업 물량의 절대다수를 점유 중. 특히 인도네시아가 최대 생산국으로 군림하며 글로벌 조업 패권이 아시아 연안국으로 집중되는 현상이 가속화됨."
        w['methodology'] = "2022년 확정치 및 2024~2026년 WCPFC/IATTC 항만 하역 데이터를 융합하여 상위 5개국 추정치(E)를 시각화."
        w['desc_tooltip'] = "2026년 추정치(E) 기준 글로벌 참치 조업량 상위 5개국 점유율입니다."
        w['source'] = "FAO FishStatJ & WCPFC 2026(E) 예비 집계"
        w['sit'] = w['situation']

with open('public/data/tuna_real_data_v3.json', 'w') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("w03_pie updated successfully.")
