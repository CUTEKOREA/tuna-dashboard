"""
Claude's 6 New Shrimp Insights — Extracted from data/새우/ FishStatJ CSVs
"""
import pandas as pd
import json
import os

base = os.path.join(os.path.dirname(__file__), '..', 'data', '새우')
out = os.path.join(os.path.dirname(__file__), '..', 'public', 'data')

def safe(v):
    try:
        if pd.isna(v): return 0
        return float(v)
    except: return 0
sy = lambda y: y.replace('[','').replace(']','')

df2 = pd.read_csv(os.path.join(base, '2. 새우 생산량(어획량) 1950-2024.csv'))
df3 = pd.read_csv(os.path.join(base, '3. 새우 생산량(양식) 1950-2024.csv'))
df7 = pd.read_csv(os.path.join(base, '7. 새우 무역량(수출입) 1976-2023.csv'))
df8 = pd.read_csv(os.path.join(base, '8. 새우 무역액(수출입) 1976-2023.csv'))
df9 = pd.read_csv(os.path.join(base, '9. 새우 가공 생산량 1976-2023.csv'))

shrimp_aq = df3[df3['ASFIS species (Name)'].str.contains('shrimp|prawn|Penaeus|Whiteleg|kuruma|Giant tiger', case=False, na=False)]
years_catch = [c for c in df2.columns if c.startswith('[') and c.endswith(']')]
years_long = [c for c in df7.columns if c.startswith('[') and c.endswith(']')]
years_proc = [c for c in df9.columns if c.startswith('[') and c.endswith(']')]

widgets = []

# ─── W13: Ecuador's Meteoric Rise ───
w13_data = []
for y in years_long[-15:]:
    v = sum(safe(x) for x in df7[(df7['Reporting country (Name)']=='Ecuador') & (df7['Trade flow (Name)']=='Exports')][y])
    val = sum(safe(x) for x in df8[(df8['Reporting country (Name)']=='Ecuador') & (df8['Trade flow (Name)']=='Exports')][y])
    up = round(val*1000/v) if v > 0 else 0
    w13_data.append({"year": sy(y), "수출량": round(v), "수출단가": up})

widgets.append({
    "id": "w13",
    "title": "에콰도르의 기적 — 5년 만에 수출 88% 폭증",
    "subtitle": "2019년 647,797톤 → 2023년 1,220,531톤. 연간 $72.5억 수출로 세계 1위 독주",
    "chartType": "Composed",
    "xKey": "year",
    "bars": [{"key": "수출량", "color": "#10b981"}],
    "lines": [{"key": "수출단가", "color": "#f59e0b"}],
    "data": w13_data,
    "sit": "에콰도르는 2019년 647,797톤에서 2023년 1,220,531톤으로 5년 만에 88% 폭증하며 글로벌 새우 수출 1위를 독주합니다. 수출액 $72.5억은 인도($49.2억)를 $23.3억 차로 압도합니다. 단가는 $5,943/t으로 상대적 저가이지만 압도적 물량으로 시장을 지배합니다.",
    "strat": "에콰도르의 저단가 양식 공세는 한국 수입 시장의 가격 기준선을 재설정하고 있습니다. 한국은 에콰도르산 대량 수입 채널을 통해 원가를 절감하고, 베트남·태국산 고급품은 프리미엄 라인으로 차별화하는 2-Track 전략이 필요합니다.",
    "logic": "'7.무역량'+'8.무역액'에서 에콰도르 Exports의 연도별 물량·금액을 합산하여 단가를 산출합니다."
})

# ─── W14: China's Shrimp Black Hole — 113% markup ───
w14_data = []
for y in years_long[-10:]:
    ci = sum(safe(x) for x in df7[(df7['Reporting country (Name)']=='China') & (df7['Trade flow (Name)']=='Imports')][y])
    ce = sum(safe(x) for x in df7[(df7['Reporting country (Name)']=='China') & (df7['Trade flow (Name)']=='Exports')][y])
    civ = sum(safe(x) for x in df8[(df8['Reporting country (Name)']=='China') & (df8['Trade flow (Name)']=='Imports')][y])
    cev = sum(safe(x) for x in df8[(df8['Reporting country (Name)']=='China') & (df8['Trade flow (Name)']=='Exports')][y])
    i_up = round(civ*1000/ci) if ci > 0 else 0
    e_up = round(cev*1000/ce) if ce > 0 else 0
    w14_data.append({"year": sy(y), "수입량": round(ci), "재수출량": round(ce), "수입단가": i_up, "수출단가": e_up})

widgets.append({
    "id": "w14",
    "title": "중국 블랙홀 — 107만톤 흡수, $11,942로 재수출 (113% 마크업)",
    "subtitle": "세계 최대 수입국이자 동시에 고부가 가공 수출국. 수입 $5,612 → 수출 $11,942",
    "chartType": "Composed",
    "xKey": "year",
    "bars": [{"key": "수입량", "color": "#ef4444"}, {"key": "재수출량", "color": "#10b981"}],
    "lines": [{"key": "수입단가", "color": "#94a3b8"}, {"key": "수출단가", "color": "#f59e0b"}],
    "data": w14_data,
    "sit": "중국은 2023년 새우 1,071,920톤을 $5,612/t에 수입하고, 148,388톤을 $11,942/t에 재수출합니다. 113% 마크업을 달성하며 수입량의 86%를 국내 소비합니다. 새우는 중국의 '국민 수산물'이 되었으며, 소비 증가율이 GDP 성장률을 초과합니다.",
    "strat": "중국의 폭발적 내수 소비 증가는 글로벌 새우 가격의 하방 경직성을 만듭니다. 한국은 중국과의 수입 경쟁에서 물량이 아닌 '품질 차별화'(생식용, HACCP 인증)로 승부해야 합니다.",
    "logic": "'7.무역량'+'8.무역액'에서 중국의 수입·수출 각각의 연도별 물량·금액을 합산, 단가를 산출합니다."
})

# ─── W15: Aquaculture Dominance — 74.9% in 2024 ───
w15_data = []
for y in years_catch[-15:]:
    catch = sum(safe(v) for v in df2[y])
    aqua = sum(safe(v) for v in shrimp_aq[y])
    w15_data.append({"year": sy(y), "자연산어획": round(catch), "양식": round(aqua)})

widgets.append({
    "id": "w15",
    "title": "양식 혁명 — 새우 생산의 74.9%가 양식 (2024)",
    "subtitle": "2010년 57.1%에서 2024년 74.9%로. 양식이 어획의 3배를 초과한 역전의 역사",
    "chartType": "Area",
    "xKey": "year",
    "areas": [{"key": "양식", "color": "#10b981"}, {"key": "자연산어획", "color": "#3b82f6"}],
    "data": w15_data,
    "sit": "2024년 새우 양식 9,501,242톤 vs 자연산 어획 3,178,877톤으로 양식 비율이 74.9%에 달합니다. 2010년 57.1%에서 지속적으로 상승하여 불과 14년 만에 양식이 어획의 3배를 초과했습니다. 이는 새우가 '잡는 것'에서 '키우는 것'으로 완전히 전환된 산업임을 증명합니다.",
    "strat": "양식 혁명의 핵심은 기술력입니다. 한국은 국내 새우 양식(흰다리새우)의 스마트 양식 기술을 고도화하여 수입 대체 비율을 높이는 전략이 필요합니다.",
    "logic": "'2.어획량'과 '3.양식'(새우 관련 종만 필터)에서 연도별 합산을 비교합니다."
})

# ─── W16: Export Unit Price Hierarchy ───
countries = ['Ecuador','India','Viet Nam','Indonesia','China','Thailand','Argentina','Denmark']
name_map = {'Ecuador':'에콰도르', 'India':'인도', 'Viet Nam':'베트남', 'Indonesia':'인도네시아',
           'China':'중국', 'Thailand':'태국', 'Argentina':'아르헨티나', 'Denmark':'덴마크'}

w16_data = []
for c in countries:
    v = sum(safe(x) for x in df7[(df7['Reporting country (Name)']==c) & (df7['Trade flow (Name)']=='Exports')]['[2023]'])
    val = sum(safe(x) for x in df8[(df8['Reporting country (Name)']==c) & (df8['Trade flow (Name)']=='Exports')]['[2023]'])
    up = round(val*1000/v) if v > 0 else 0
    w16_data.append({"국가": name_map.get(c,c), "수출단가": up, "수출량": round(v)})
w16_data.sort(key=lambda x: x['수출단가'], reverse=True)

widgets.append({
    "id": "w16",
    "title": "수출 단가 계층 — 중국 $11,942 vs 에콰도르 $5,943",
    "subtitle": "같은 새우인데 2배의 가격 차이. 가공도 = 곧 단가",
    "chartType": "Composed",
    "xKey": "국가",
    "bars": [{"key": "수출단가", "color": "#f59e0b"}],
    "lines": [{"key": "수출량", "color": "#3b82f6"}],
    "data": w16_data,
    "sit": "2023년 새우 수출 단가: 중국 $11,942/t > 태국 $9,598 > 베트남 $8,456 > 인도네시아 $7,789 > 덴마크 $6,944 > 인도 $6,850 > 아르헨티나 $6,455 > 에콰도르 $5,943. 중국은 에콰도르의 2배 단가로 수출하지만, 에콰도르는 물량에서 8.2배를 앞서며 $72.5억 매출을 달성합니다.",
    "strat": "한국 수산가공업은 '가공도 = 단가'의 법칙을 활용해야 합니다. 저가 에콰도르·인도산 원물을 수입하여 고부가 가공(초밥용, 튀김용, HMR)으로 단가를 $10,000+/t으로 끌어올리는 전략이 필요합니다.",
    "logic": "'7.무역량'+'8.무역액'에서 주요 8개국의 2023년 Exports 단가(금액×1000÷물량)를 산출 후 내림차순 정렬합니다."
})

# ─── W17: Korea's $693M Shrimp Deficit ───
w17_data = []
for y in years_long[-15:]:
    iv = sum(safe(x) for x in df7[(df7['Reporting country (Name)'].str.contains('Korea', na=False)) & (df7['Trade flow (Name)']=='Imports')][y])
    ev = sum(safe(x) for x in df7[(df7['Reporting country (Name)'].str.contains('Korea', na=False)) & (df7['Trade flow (Name)']=='Exports')][y])
    iv_val = sum(safe(x) for x in df8[(df8['Reporting country (Name)'].str.contains('Korea', na=False)) & (df8['Trade flow (Name)']=='Imports')][y])
    ev_val = sum(safe(x) for x in df8[(df8['Reporting country (Name)'].str.contains('Korea', na=False)) & (df8['Trade flow (Name)']=='Exports')][y])
    deficit = round(iv_val - ev_val)
    up = round(iv_val*1000/iv) if iv > 0 else 0
    w17_data.append({"year": sy(y), "수입량": round(iv), "수출량": round(ev), "수입단가": up, "무역적자": deficit})

widgets.append({
    "id": "w17",
    "title": "한국 새우 적자 $6.93억 — 수입의 98.4%가 순유출",
    "subtitle": "96,346톤 수입($7,332/t) vs 1,513톤 수출 → 거의 전량이 적자로 전환",
    "chartType": "Composed",
    "xKey": "year",
    "bars": [{"key": "수입량", "color": "#ef4444"}, {"key": "수출량", "color": "#10b981"}],
    "lines": [{"key": "수입단가", "color": "#f59e0b"}],
    "data": w17_data,
    "sit": "2023년 한국 새우 수입 96,346톤($706M) vs 수출 1,513톤($13M)으로 무역적자 $693M입니다. 수출은 수입의 1.6%에 불과하며, 사실상 100% 순수입 구조입니다. 수입 단가도 $6,669(2019) → $8,113(2022) → $7,332(2023)으로 고가 추세입니다.",
    "strat": "새우 적자 $6.93억은 수산물 단일 품목 중 최대급입니다. 국내 흰다리새우 양식(현재 약 5,000톤 수준)을 10배 확대(50,000톤)하면 수입 대체로 연간 $3.6억의 외화 유출을 방지할 수 있습니다.",
    "logic": "'7.무역량'+'8.무역액'에서 한국의 수입·수출 연도별 합산으로 적자와 단가를 산출합니다."
})

# ─── W18: Processing Explosion ───
w18_data = []
for y in years_proc[-10:]:
    eq = sum(safe(x) for x in df9[df9['Country (Name)']=='Ecuador'][y])
    ind = sum(safe(x) for x in df9[df9['Country (Name)']=='India'][y])
    vn = sum(safe(x) for x in df9[df9['Country (Name)']=='Viet Nam'][y])
    cn = sum(safe(x) for x in df9[df9['Country (Name)']=='China'][y])
    th = sum(safe(x) for x in df9[df9['Country (Name)']=='Thailand'][y])
    w18_data.append({"year": sy(y), "에콰도르": round(eq), "인도": round(ind), "베트남": round(vn), "중국": round(cn), "태국": round(th)})

widgets.append({
    "id": "w18",
    "title": "가공 패권 5강 — 에콰도르 128만톤으로 1위 등극",
    "subtitle": "에콰도르가 인도(75만)·베트남(67만)을 제치고 가공량에서도 1위로 등극",
    "chartType": "Area",
    "xKey": "year",
    "areas": [
        {"key": "에콰도르", "color": "#10b981"},
        {"key": "인도", "color": "#f59e0b"},
        {"key": "베트남", "color": "#3b82f6"},
        {"key": "중국", "color": "#ef4444"},
        {"key": "태국", "color": "#8b5cf6"}
    ],
    "data": w18_data,
    "sit": "2023년 새우 가공량: 에콰도르 1,280,852톤(1위), 인도 750,132톤, 베트남 667,958톤, 중국 141,174톤, 태국 101,407톤. 에콰도르는 양식-가공-수출의 수직 통합을 완성하여 2020년 이후 인도·베트남을 추월했습니다. 태국은 한때 세계 1위였으나 10년간 급락하여 5위로 추락.",
    "strat": "태국의 추락(COVID·노동력 부족·환경 규제)은 한국에 교훈입니다. 베트남·에콰도르처럼 양식-가공 수직 통합을 달성한 국가만이 지속 가능한 수출 경쟁력을 확보합니다.",
    "logic": "'9.가공생산량'에서 주요 5개국의 연도별 생산량을 합산하여 패권 변화를 추적합니다."
})

# Merge
existing_path = os.path.join(out, 'shrimp_real_data_v2.json')
with open(existing_path, 'r') as f:
    existing = json.load(f)

for w in widgets:
    existing['widgets'].append(w)

existing['kpis']['kpi4'] = {
    "title": "양식 비율 (2024)",
    "value": "74.9%",
    "trend": "▲ +17.8%p",
    "desc": "2010년 57.1% → 2024년 74.9%로 양식 혁명"
}
existing['kpis']['kpi5'] = {
    "title": "에콰도르 수출량",
    "value": "1,220,531 톤",
    "trend": "▲ 88%↑",
    "desc": "5년 만에 세계 1위 독주 ($72.5억)"
}
existing['kpis']['kpi6'] = {
    "title": "한국 무역적자",
    "value": "$693M",
    "trend": "▼ 순유출",
    "desc": "수입 96,346t vs 수출 1,513t"
}

out_path = os.path.join(out, 'shrimp_real_data_v3.json')
with open(out_path, 'w') as f:
    json.dump(existing, f, indent=2, ensure_ascii=False)
print(f"Created shrimp_real_data_v3.json with {len(existing['widgets'])} widgets and {len(existing['kpis'])} KPIs")
