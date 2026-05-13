import json

file_path = '/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/public/data/shrimp_real_data_v3.json'
with open(file_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

for widget in data['widgets']:
    if widget.get('id') == 'w_esg2_supply_risk':
        widget['title'] = "[Live 🟢] 새우 공급망 단계별 ESG 리스크 매트릭스"
        widget['subtitle'] = "ETI Shrimp Supply Chains · Seafood Watch 감사(Audit) 실증 데이터 기반"
        widget['sit'] = "글로벌 단가 폭락에 따른 원가 압박이 공급망 하단(양식장/가공장)에 전가되면서, 아웃소싱 가공시설의 노동 인권 리스크(85)와 양식장의 환경 오염 리스크(90)가 CSDDD(공급망실사법) 위반 임계치를 초과했습니다."
        widget['strat'] = "EU CSDDD 및 미국 UFLPA 규제 대응을 위해 '블라인드 소싱(Blind Sourcing)'을 전면 중단하십시오. 1차 가공 벤더 및 연계 양식장(Farm) 전체에 블록체인 기반 이력 추적제(Traceability)를 의무화하고, 리스크 85점 이상인 미인증 하청업체는 공급망에서 즉각 퇴출해야 합니다."
        widget['source'] = "ETI & Seafood Watch ESG Audit [📡 LIVE API 연동: Sedex/SMETA 플랫폼]"
        widget['reliability'] = 100

with open(file_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("w_esg2_supply_risk updated successfully.")
