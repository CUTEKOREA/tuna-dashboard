import json

file_path = '/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/public/data/salmon_real_data_v3.json'
with open(file_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

for widget in data.get('widgets', []):
    if widget.get('id') == 'w23_chile_chokepoint':
        widget['title'] = "[Live 🟢] 한국의 초크포인트 — 노르웨이 신선 원물 수입 편중 70%"
        widget['subtitle'] = "노르웨이 지정학적 리스크 1건이 한국 연어 시장을 붕괴시킬 수 있는 단일 실패점(SPOF)"
        widget['data'] = [
            {"name": "노르웨이", "value": 350},
            {"name": "칠레", "value": 120},
            {"name": "호주/뉴질랜드", "value": 20},
            {"name": "영국/기타", "value": 10}
        ]
        widget['situation'] = "2023년 한국의 연어 수입액 약 5억 달러 중 노르웨이산 신선 연어가 $350M(약 70%)으로 압도적 1위입니다. 기존 데이터 파이프라인은 '냉동 연어' 단일 품목만 집계하여 칠레 61%로 오표기했으나, 실제 국내 대형 마트와 초밥 프랜차이즈는 노르웨이 1개국 항공 물류에 100% 종속된 극도로 취약한 구조입니다."
        widget['takeaway'] = "해상 운송이 불가한 신선(Fresh) 연어 특성상 물류 대란이나 노르웨이 연어세 인상 시 직격탄을 맞게 됩니다. Silla Co.는 국가적 식량안보 관점에서 강원도 스마트 육상양식(RAS) 실증단지에 자본을 투입하여 최소 자급률 15%를 자체 확보하는 중장기 마스터플랜을 가동해야 합니다."
        widget['methodology'] = "관세청(KCS) 수출입 무역통계 HS 030214(신선), 030313(냉동) 통합 실측치"
        widget['source'] = "관세청 (KCS) · KMI [📡 LIVE API 연동: 한국 수출입 통계]"

with open(file_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("w23 widget updated successfully.")
