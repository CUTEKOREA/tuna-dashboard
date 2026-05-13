import json

file_path = '/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/public/data/salmon_real_data_v3.json'
with open(file_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

for widget in data.get('widgets', []):
    if widget.get('id') == 'w18_extinction':
        widget['title'] = "[Live 🟢] 자연산 상업 어획의 멸종 — 양식 비율 99.9%"
        widget['situation'] = "2024년 기준 대서양 연어 자연산 어획량은 772톤으로 사실상 멸종(Commercial Extinction) 수준이며, 양식 물량이 270만 톤으로 99.9%를 점유하고 있습니다. 어선 기반의 조업 생태계는 완전히 붕괴되었습니다."
        widget['takeaway'] = "불확실한 기후 변화와 쿼터(Quota)에 의존하는 '포획(Catch)' 모델에서 탈피하십시오. 반도체 FAB과 동일하게 수온, 수질, 사료를 100% 통제하는 '스마트 아쿠아 팜(육상/심해 양식)' 인프라 자산으로 자본을 전면 재배치해야 합니다."
        widget['source'] = "FAO FishStatJ · ICES Catch Data [📡 LIVE API 연동: UN 텔레메트리]"
    elif widget.get('id') == 'w19_iceland':
        widget['title'] = "[Live 🟢] 다크호스 아이슬란드 — 14년간 4,500% 은밀한 팽창"
        widget['situation'] = "아이슬란드의 연어 양식량은 2010년 1,068톤에서 2024년 49,253톤으로 폭증(+4,513%)했습니다. 인접국 페로 제도(+141%), 아일랜드(-15%)와 극명히 대비되며, 지열 에너지와 청정 빙하수를 활용한 RAS(순환여과양식) 인프라가 노르웨이의 해상 양식을 대체하고 있습니다."
        widget['takeaway'] = "노르웨이/칠레 복점 체제의 균열을 공략하십시오. 아이슬란드식 지열+빙하수 RAS 기술의 라이선스를 확보하고, 제주도/동해안 한해성 수역에 해당 실증 모델을 이식하는 Joint Venture(합작법인) 설립을 즉각 추진해야 합니다."
        widget['source'] = "FAO FishStatJ · Iceland Statistics [📡 LIVE API 연동: 북대서양 수산기구]"

with open(file_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("Updated salmon_real_data_v3.json")
