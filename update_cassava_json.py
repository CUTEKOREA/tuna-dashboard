import json

with open('public/data/cassava_widgets.json', 'r') as f:
    data = json.load(f)

widgets = data['widgets']

w30 = {
    "id": "w30",
    "title": "대체 조달 시뮬레이터 (동남아시아 vs 가나)",
    "subtitle": "아프리카(가나)를 통한 전략적 리스크 헤지 시나리오",
    "chartType": "Radar",
    "xKey": "metric",
    "radars": [
      {
        "key": "sea",
        "color": "#ef4444",
        "name": "동남아시아 (태국/베트남)"
      },
      {
        "key": "ghana",
        "color": "#10b981",
        "name": "가나 (대체 파이프라인)"
      }
    ],
    "data": [
      {
        "metric": "생산 규모(Scale)",
        "sea": 95,
        "ghana": 60
      },
      {
        "metric": "물류비 경쟁력(Cost)",
        "sea": 85,
        "ghana": 70
      },
      {
        "metric": "독점 리스크(낮을수록 우수)",
        "sea": 20,
        "ghana": 90
      },
      {
        "metric": "안보(기후/지정학)",
        "sea": 40,
        "ghana": 85
      }
    ],
    "sit": "가나(Ghana)는 연간 82만 톤의 전분을 생산하는 세계 4위 국가로, 기존의 식량 소비 위주에서 벗어나 서아프리카의 새로운 가공 및 수출 허브로 급부상하고 있습니다.",
    "strat": "동남아시아 쏠림 현상을 헤지(Hedge)하기 위해 아프리카 서부 해안선을 활용한 '대체 조달 파이프라인' 구축은 기업의 핵심 전략 자산이 될 것입니다."
}

w31 = {
    "id": "w31",
    "title": "글로벌 전분 수출입 병목 현상 (2022)",
    "subtitle": "단일 시장(중국) 블랙홀 현상과 한국의 99.99% 의존 리스크",
    "chartType": "Bar",
    "xKey": "flow",
    "bars": [
      {
        "key": "volume",
        "color": "#f59e0b",
        "name": "수출입 규모 (만 톤)"
      }
    ],
    "data": [
      {
        "flow": "태국/베트남 생산",
        "volume": 710
      },
      {
        "flow": "→ 중국 (블랙홀 흡수)",
        "volume": 463
      },
      {
        "flow": "→ 기타 아시아",
        "volume": 120
      },
      {
        "flow": "→ 한국 수입",
        "volume": 3.6
      }
    ],
    "sit": "2022년 기준 태국과 베트남이 수출하는 카사바 전분의 60~95%를 중국이 단일 흡수하고 있으며, 한국의 전체 수입 물량은 동남아 2개국에 99.99% 편중되어 있습니다.",
    "strat": "동남아 기후 이변이나 중국의 전략적 싹쓸이 매수 발생 시, 한국의 제지 및 식품 산업은 즉각적인 원료 셧다운 위기에 직면합니다. 공급망 붕괴 전 대체 파이프라인 확보가 시급합니다."
}

# Insert w30 at index 6 (End of Part I)
widgets.insert(6, w30)
# Insert w31 at index 14 (End of Part III) -> original index 17 becomes 18, so let's insert at index 18 (End of Part III now)
# Wait, original Part III ended at 17. With w30 added, it ends at 18.
widgets.insert(18, w31)

with open('public/data/cassava_widgets.json', 'w') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("JSON updated successfully.")
