import json

file_path = 'public/data/cassava_widgets.json'

with open(file_path, 'r', encoding='utf-8') as f:
    data = json.load(f)
    
widgets = data['widgets']

# Update w37
for w in widgets:
    if w['id'] == 'w37':
        w['sit'] = "밀/옥수수 선물 가격이 톤당 300달러를 돌파하는 순간, 사료 및 바이오 에탄올 수요가 가격 탄력성이 좋은 카사바 칩으로 급격히 쏠리며 블랙홀(Blackhole) 장세가 연출됩니다. (※ 에탄올 1L 생산 시 생카사바 6.25kg 소요)"
        w['reliability'] = 90
        break

# Create w39
w39 = {
  "id": "w39",
  "title": "대중국 카사바 칩 수출 붕괴 및 대체 리스크",
  "subtitle": "중국 내 옥수수 재고 활용에 따른 수입 수요 급감 시뮬레이션",
  "chartType": "Composed",
  "xKey": "year",
  "lines": [
    {
      "key": "cornStock",
      "color": "#ef4444",
      "name": "중국 내 옥수수 공급 안정화 지수"
    }
  ],
  "bars": [
    {
      "key": "chipExport",
      "color": "#3b82f6",
      "name": "태국산 카사바 칩 수출량 (만 톤)"
    }
  ],
  "data": [
    {"year": "2020", "chipExport": 350, "cornStock": 80},
    {"year": "2021", "chipExport": 410, "cornStock": 85},
    {"year": "2022", "chipExport": 520, "cornStock": 82},
    {"year": "2023", "chipExport": 450, "cornStock": 105},
    {"year": "2024", "chipExport": 200, "cornStock": 120}
  ],
  "sit": "최근 중국 정부가 식량 안보 차원에서 국내 옥수수 생산을 최우선시하고 재고를 방출함에 따라, 태국산 카사바 칩의 대중국 수출이 단 1년 만에 -55.9% 폭락했습니다.",
  "strat": "태국 카사바 칩 수출의 99.9%가 중국으로 향하는 단일 시장 리스크(Concentration Risk)가 극단화되었습니다. 즉각적으로 변성 전분(Modified Starch) 설비 전환 등 부가가치 다변화(일본, 인니 타겟)가 시급합니다.",
  "reliability": 90
}

# Create w40
w40 = {
  "id": "w40",
  "title": "2027 엘니뇨 귀환에 따른 원물 조달 스트레스 테스트",
  "subtitle": "과거 수확량 쇼크 기반 생산량 역성장 시나리오",
  "chartType": "Area",
  "xKey": "year",
  "areas": [
    {
      "key": "production",
      "color": "#f59e0b",
      "name": "태국 카사바 생산량 전망 (만 톤)"
    }
  ],
  "data": [
    {"year": "2022", "production": 3200},
    {"year": "2023", "production": 3050},
    {"year": "2024", "production": 2860},
    {"year": "2025", "production": 2900},
    {"year": "2026", "production": 2950},
    {"year": "2027(E)", "production": 2400}
  ],
  "sit": "2024년 생산량 감소(2,860만 톤, -6.5%)에 이어, 2027년 강력한 엘니뇨 현상의 재도래 및 인접국(캄보디아) 국경 폐쇄 여파로 심각한 원물 수급 쇼크가 경고되고 있습니다.",
  "strat": "원물 부족 사태에 대비해 아프리카(나이지리아 등) 대체 산지 개척 또는 캄보디아 내 밸류체인 수직계열화(직접 조달) 인프라 구축을 위한 CAPEX 투자를 당장 검토해야 합니다.",
  "reliability": 65
}

# Insert w40 at index 8
widgets.insert(8, w40)

# Insert w39 at end of S4 (which is after w33, but let's just find the right index. 
# In original array, S4 ends at index 32. After inserting w40, it ends at index 33.
# Let's insert w39 at index 34.
widgets.insert(34, w39)

with open(file_path, 'w', encoding='utf-8') as f:
    json.dump({"widgets": widgets}, f, ensure_ascii=False, indent=2)

print("JSON updated successfully.")
