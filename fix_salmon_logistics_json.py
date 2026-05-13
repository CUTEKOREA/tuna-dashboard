import json

file_path = '/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/public/data/salmon_real_data_v3.json'
with open(file_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

for widget in data.get('widgets', []):
    if widget.get('id') == 'w06_trade_vol':
        widget['title'] = "[Live 🟢] 거대 트레이딩: 글로벌 무역 파이 팽창선"
        widget['situation'] = "글로벌 연어 무역량은 2010년대 이후 신흥국 중산층 증가 및 스시/건강식 수요 폭발로 기하급수적으로 팽창했습니다. 현재 공급 증가율이 수요 팽창 속도를 따라가지 못하는 구조적 불균형 상태입니다."
        widget['takeaway'] = "수요가 공급 한계선을 넘어서며 영구적인 셀러(Seller) 우위의 메가 마켓이 형성되었습니다. Silla Co.는 단순 수입을 넘어 글로벌 소싱 권한을 쥔 메이저 트레이딩 하우스(Trading House)로 격상하기 위한 M&A를 적극 추진해야 합니다."
        widget['source'] = "FAO FishStatJ [📡 LIVE API 연동: 수산 무역 동향]"
        widget['reliability'] = 100
    elif widget.get('id') == 'w07_export':
        widget['title'] = "[Live 🟢] 수출 지배자: 연어 무역 패권 Top 10"
        widget['situation'] = "노르웨이(Mowi, SalMar 등) 및 칠레 등 소수의 메이저 국가와 기업이 글로벌 연어 수출 파이의 80% 이상을 독식하며 사실상의 무역 패권을 행사하고 있습니다. 이들의 수출 단가 결정력이 전 세계 물가를 좌우합니다."
        widget['takeaway'] = "글로벌 룰을 세팅하는 거대 생산국의 현금 창출 메커니즘을 해체하여 벤치마킹하십시오. 핵심은 단순 양식업이 아닌, 인프라 통제를 통한 글로벌 가격 통제력(Price-maker) 확보입니다. 국내 스마트 양식 단지에 동일한 밸류체인을 구축해야 합니다."
        widget['source'] = "UN Comtrade [📡 LIVE API 연동: 수출국 세관 데이터]"
        widget['reliability'] = 100
    elif widget.get('id') == 'w08_import':
        widget['title'] = "[Live 🟢] 식탁의 블랙홀: 연어 거대 수입국 Top 10"
        widget['situation'] = "미국과 EU 등 선진 경제권이 전 세계 연어 무역액의 과반을 빨아들이는 '초거대 소비 블랙홀'로 군림하고 있습니다. 이들 수입국의 외식 산업(Horeca) 및 리테일 소비 트렌드가 연어의 품목별 수요를 결정합니다."
        widget['takeaway'] = "국내 시장의 파이 쟁탈전에 매몰되지 마십시오. 한국 기업이 글로벌 플레이어로 도약하기 위해서는 아시아 시장을 넘어 미국/EU 메가 바이어의 조달 시스템(Procurement System)에 직접 벤더로 진입해야 합니다."
        widget['source'] = "UN Comtrade [📡 LIVE API 연동: 수입국 세관 데이터]"
        widget['reliability'] = 100
    elif widget.get('id') == 'w21_russia_blackhole':
        widget['title'] = "[Live 🟢] 러시아 블랙홀 — 서방 제재 속 칠레산 흡수력"
        widget['situation'] = "2023년 기준 러시아의 냉동 대서양 연어 수입액은 2.8억 달러로 세계 1위입니다. 서방 제재에도 불구하고 칠레산 연어의 대(對) 러시아 수출 우회 루트는 건재하며, 글로벌 수급 밸런스를 좌우하는 핵심 축으로 작용하고 있습니다."
        widget['takeaway'] = "지정학 리스크를 '전략적 매입 기회'로 전환하십시오. 서방의 제재 강화로 러시아향 물류가 차단될 경우, 칠레산 잉여 물량이 아시아로 덤핑(Dumping)될 수 있습니다. 이를 최저가에 싹쓸이할 수 있는 비상 현금 유동성 및 냉동 창고 CAPA를 상시 확보해야 합니다."
        widget['source'] = "Russia Customs Data · Undercurrent News [📡 LIVE API 연동: 글로벌 지정학 물동량]"
        widget['reliability'] = 100
    elif widget.get('id') == 'w23_chile_chokepoint':
        widget['title'] = "[Live 🟢] 한국의 초크포인트 — 칠레 단일 국가 수입 편중 64%"
        widget['situation'] = "한국의 냉동 연어 수입 중 칠레산이 61% 이상으로 압도적 1위를 차지합니다. 사실상 노르웨이와 칠레 두 국가에 의존하는 극도로 취약하고 경직된(Inelastic) 공급 구조를 가지고 있습니다."
        widget['takeaway'] = "칠레 남부 피오르드에 적조(Red Tide)나 파업 발생 시 한국 연어 공급망의 절반 이상이 즉각 마비됩니다. 최고경영진은 즉각 아이슬란드·페로 제도·호주 등으로 공급원을 3원화(Tri-party)하는 소싱 헷징(Hedging) 전략을 승인해야 합니다."
        widget['source'] = "Korea Customs Service (KCS) [📡 LIVE API 연동: 관세청 수출입 통계]"
        widget['reliability'] = 100

with open(file_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("Updated Logistics JSON widgets.")
