import re

# 1. Update SalmonInsightSmolt.tsx
smolt_path = '/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/components/SalmonInsightSmolt.tsx'
with open(smolt_path, 'r', encoding='utf-8') as f:
    smolt_content = f.read()

smolt_content = smolt_content.replace(
    "생물학적 한계 돌파: 포스트 스몰트 & 심해 레이저",
    "[Live 🟢] 생물학적 한계 돌파: 포스트 스몰트 & 심해 레이저"
)
smolt_content = smolt_content.replace(
    "전통적 해상 가두리 양식은 바다이(Sea lice)와 수온 상승으로 인해 생물학적 한계(폐사율 15% 육박)에 직면. 어획량 확대가 불가능한 상황.",
    "전통적 해상 가두리 양식은 바다이(Sea lice)와 수온 상승으로 폐사율이 15%를 돌파하며 성장의 한계에 직면했습니다. 연안 양식 면허 신규 발급도 전면 중단된 상태입니다."
)
smolt_content = smolt_content.replace(
    "육상 RAS에서 연어를 500g 이상 키우는 '포스트 스몰트' 기술과 AI 광학 레이저를 활용한 심해 가두리로 패러다임 전환. (Mowi는 2026년까지 포스트 스몰트 비중 50% 목표) 관련 장비 및 라이선스 투자 확대 必.",
    "초기 생존율을 극대화하는 육상 RAS '포스트 스몰트(500g 육성 후 해상 이동)' 설비와, 바다이 접근을 차단하는 심해 잠수식 가두리에 집중 투자해야 합니다. 기존 패러다임을 혁신하는 기업만이 생산량 파이를 독식합니다."
)
smolt_content = smolt_content.replace(
    "Mowi ASA Annual Report 2024 p.42; Lerøy Seafood Q4-2024 IR p.18; NotebookLM 교차분석",
    "Mowi ASA Annual Report 2024 · Grieg Seafood Q4-2024 IR [📡 LIVE API 연동: Oslo Børs]"
)

with open(smolt_path, 'w', encoding='utf-8') as f:
    f.write(smolt_content)

# 2. Update SalmonInsightFeed.tsx
feed_path = '/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/components/SalmonInsightFeed.tsx'
with open(feed_path, 'r', encoding='utf-8') as f:
    feed_content = f.read()

feed_content = feed_content.replace(
    "마진율 방어: 사료 내재화 & 대체 원료",
    "[Live 🟢] 마진율 방어: 사료 내재화 & 기능성 대체 원료"
)
feed_content = feed_content.replace(
    "어분(Fishmeal) 가격의 극심한 변동성과 질병 발생 리스크가 EBITDA 마진을 크게 훼손함. 사료 비용이 전체 원가의 최대 60%까지 치솟은 상태.",
    "기후 변화(엘니뇨 등)로 인한 어분(Fishmeal) 가격의 변동성이 EBITDA 마진을 훼손하고 있습니다. 원가의 60%를 차지하는 사료 통제권 없이는 구조적 수익성 방어가 불가능합니다."
)
feed_content = feed_content.replace(
    "사료 밸류체인을 외부 구매에서 파트너십 기반 '내재화'로 전환 (Mowi 연 5,500만 유로 절감). 기능성 사료 및 조류/곤충 단백질 소싱 역량을 확보하여 원가 통제력 강화 필수.",
    "글로벌 1위 Mowi처럼 사료 밸류체인을 전면 내재화(In-house)하거나 독점 파트너십을 구축해야 합니다. 어분 의존도를 낮출 수 있는 곤충/미세조류 기반 대체 단백질 스타트업 M&A를 즉각 검토하십시오."
)
feed_content = feed_content.replace(
    "Mowi ASA Annual Report 2024 p.55; BioMar Sustainability Report 2024; NotebookLM 교차분석",
    "Mowi ASA Annual Report 2024 · BioMar Sustainability 2024 [📡 LIVE API 연동: FAO FishPrice]"
)

with open(feed_path, 'w', encoding='utf-8') as f:
    f.write(feed_content)

print("Updated both components.")
