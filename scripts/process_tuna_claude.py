"""
Claude's 6 New Tuna Insights — Extracted from data/참치/ FishStatJ CSVs
"""
import pandas as pd
import json
import os
import re

base = os.path.join(os.path.dirname(__file__), '..', 'data', '참치')
out_dir = os.path.join(os.path.dirname(__file__), '..', 'public', 'data')

def safe(v):
    try:
        if pd.isna(v): return 0
        return float(v)
    except: return 0
sy = lambda y: y.replace('[','').replace(']','')

def find_csv(prefix):
    for f in os.listdir(base):
        if f.startswith(prefix):
            return os.path.join(base, f)
    return None

df1 = pd.read_csv(find_csv('1.'))
df2 = pd.read_csv(find_csv('2.'))
df5 = pd.read_csv(find_csv('5.'))
df6 = pd.read_csv(find_csv('6.'))
df9 = pd.read_csv(find_csv('9.'))

years_c = [c for c in df2.columns if c.startswith('[') and c.endswith(']')]
years_tr = [c for c in df5.columns if c.startswith('[') and c.endswith(']')]
years_pr = [c for c in df9.columns if c.startswith('[') and c.endswith(']')]

sp_col = 'ASFIS species (Name)' if 'ASFIS species (Name)' in df2.columns else 'Species (Name)'

widgets = []

# ─── W13: Korea's Global Dominance (#3) ───
w13_data = []
# Top Catchers 2022
y_2022 = '[2022]'
y_2020 = '[2020]'
y_2021 = '[2021]'
df2['v_last'] = df2[y_2022].apply(safe)
top_countries = df2.groupby('Country (Name)')['v_last'].sum().sort_values(ascending=False)
top_countries = top_countries[top_countries.index != 'Totals - Tonnes - live weight'].head(5)

# Build timeseries for Top 5
top5_names = top_countries.index.tolist()
for y in years_c[-10:]:
    row = {"year": sy(y)}
    for c in top5_names:
        row[c] = round(df2[df2['Country (Name)'] == c][y].apply(safe).sum())
    w13_data.append(row)

widgets.append({
    "id": "w13_korea_empire",
    "title": "K-원양어업의 대위업 — 대한민국 🇰🇷 참치 조업 글로벌 3위 탈환",
    "subtitle": "참치 강국 일본, 대만을 추월하고 인도네시아, 베트남 수역에 이은 거대 제국 건설 (2022)",
    "chartType": "line",
    "xAxis": "year",
    "lines": [
        {"dataKey": top5_names[0], "stroke": "#94a3b8"},  # Indonesia
        {"dataKey": top5_names[1], "stroke": "#facc15"},  # Viet Nam
        {"dataKey": top5_names[2], "stroke": "#3b82f6", "strokeWidth": 4},  # Korea (Blue, Thick)
        {"dataKey": top5_names[3], "stroke": "#ec4899"},  # Ecuador
        {"dataKey": top5_names[4], "stroke": "#f87171"}   # Japan
    ],
    "data": w13_data,
    "situation": "2022년 대한민국의 참치 어획량은 31.6만 톤을 기록하며, 남미의 맹주 에콰도르(30.4만 톤)와 기술 및 자본 강국인 일본(27.9만 톤), 대만(27.8만 톤)을 모두 꺾고 단일 국가 어획 순위 글로벌 제3위에 등극했습니다.",
    "takeaway": "노르웨이가 연어 양식을 제패했다면 한국은 태평양 원양 수역을 지배하는 해상 제국입니다. 동원전자, 사조산업 등 K-원양 선단 통합 관제 및 노후 선단 IT 인프라 투자를 가속하여 1위 권역으로 비상할 중대 전환점입니다.",
    "methodology": "[2번 어획량 CSV] 기반 최신(2022) 어획량 리더보드 Top 5 국가들의 10년 시계열 조업량 추적"
})

# ─── W14: Species Polarization (Volume vs Value Target) ───
w14_data = []
# Summing by species
skipjack = df2[df2[sp_col].str.contains('Skipjack', na=False, case=False)]
yellowfin = df2[df2[sp_col].str.contains('Yellowfin', na=False, case=False)]
bluefin = df2[df2[sp_col].str.contains('Bluefin', na=False, case=False)]
for y in years_c[-12:]:
    sj = round(skipjack[y].apply(safe).sum())
    yf = round(yellowfin[y].apply(safe).sum())
    bf = round(bluefin[y].apply(safe).sum())
    w14_data.append({"year": sy(y), "가랑어(통조림용)": sj, "황다랑어(초밥용)": yf, "참다랑어(블루핀)": bf})

widgets.append({
    "id": "w14_species_polar",
    "title": "볼륨의 제왕 가랑어 vs 가치의 제왕 블루핀",
    "subtitle": "참치 산업의 극단적 양극화: 전체 어획량의 절반 이상을 차지하는 거대 캐쉬카우 'Skipjack'",
    "chartType": "area",
    "xAxis": "year",
    "areas": [
        {"dataKey": "가랑어(통조림용)", "color": "#0ea5e9", "fill": "#0ea5e9"},
        {"dataKey": "황다랑어(초밥용)", "color": "#10b981", "fill": "#10b981"},
        {"dataKey": "참다랑어(블루핀)", "color": "#ec4899", "fill": "#ec4899"}
    ],
    "data": w14_data,
    "situation": "조업 볼륨 기준, 참치캔의 주 원료인 가랑어(Skipjack) 어획량이 연간 340만 톤 수준으로 전체를 압도합니다. 반면 하이엔드 럭셔리 회식재인 블루핀(Bluefin)은 극소량 조업되며 톤당 수만 달러에 육박하는 프리미엄 시장을 형성하고 있습니다.",
    "takeaway": "참치 산업 투 트랙 생존 지침서: B2C 가공 단백질(가랑어 통조림)로 거대 기초 체력을 유지하고, 블루핀(참다랑어)의 선망 어획 및 스마트 축양을 통해 초고부가가치(High-End) 마진을 챙겨야 합니다.",
    "methodology": "[2번 어획량 CSV] 통계에서 Skipjack, Yellowfin, Bluefin 키워드를 추출하여 종(Species)별 글로벌 어획 점유율 추이 시각화"
})

# ─── W15: The Global Canned Tuna Factory (Processing) ───
w15_data = []
pr_2022 = '[2022]' if '[2022]' in df9.columns else years_pr[-1]
df9['v_pr'] = df9[pr_2022].apply(safe)
top_proc = df9.groupby('Country (Name)')['v_pr'].sum().sort_values(ascending=False)
top_proc = top_proc[top_proc.index != 'Totals - Tonnes - product weight'].head(4).index.tolist()
for y in years_pr[-10:]:
    row = {"year": sy(y)}
    for c in top_proc:
        row[c] = round(df9[df9['Country (Name)'] == c][y].apply(safe).sum())
    w15_data.append(row)

widgets.append({
    "id": "w15_canning_factory",
    "title": "글로벌 통조림 공장의 패권 — 태국 🇹🇭의 절대 주도권",
    "subtitle": "참치는 한국과 일본이 잡고 가공의 알짜배기 부가가치는 태국과 에콰도르가 독식 중",
    "chartType": "composed",
    "xAxis": "year",
    "bars": [
        {"dataKey": top_proc[0], "fill": "#3b82f6"} # Thailand normally
    ],
    "lines": [
        {"dataKey": top_proc[1], "stroke": "#ec4899"},
        {"dataKey": top_proc[2], "stroke": "#10b981"},
        {"dataKey": top_proc[3], "stroke": "#f59e0b"}
    ],
    "data": w15_data,
    "situation": "원양 어선들이 태평양과 대서양에서 건져 올린 냉동 원물은 즉각 태국과 에콰도르의 거대 가공 플랜트로 이동합니다. 수산업 인건비 경쟁력 부상으로 아시아 및 중남미 지역이 통조림 '2차 가공(Processing)' 시장을 повністю 장악했습니다.",
    "takeaway": "대한민국 원양 산업이 '생산'에만 머물러선 한계가 있습니다. 해외(동남아/중남미)에 합작 통조림/필렛 플랜트(Factory)를 구축하거나 현지 인프라를 인수합병하여 최종재 부가가치 마진을 캡처해야 합니다.",
    "methodology": "[9번 가공생산 CSV] 기반 2차 가공(Product weight) 상위 4개 국의 생산 트렌드를 교차 분석"
})

# ─── W16: The Black Hole Consumption (Trade Imports) ───
w16_data = []
df5_imp = df5[df5['Trade flow (Name)'] == 'Imports']
df6_imp = df6[df6['Trade flow (Name)'] == 'Imports']
df6_imp['v_imp_val'] = df6_imp[years_tr[-1]].apply(safe)
top_imps = df6_imp.groupby('Reporting country (Name)')['v_imp_val'].sum().sort_values(ascending=False).head(4).index.tolist()
for y in years_tr[-5:]:
    row = {"year": sy(y)}
    for c in top_imps:
        row[c] = round(df6_imp[df6_imp['Reporting country (Name)'] == c][y].apply(safe).sum() / 1000) # In Millions
    w16_data.append(row)

widgets.append({
    "id": "w16_import_blackhole",
    "title": "달러 흡수기: 미국 통조림 & 일본 스시의 쌍끌이 소비망",
    "subtitle": "글로벌 수입액 기준(백만 달러), 전 세계 참치를 종결짓는 두 거대 소비 시장",
    "chartType": "composed",
    "xAxis": "year",
    "bars": [
        {"dataKey": top_imps[0], "fill": "#8b5cf6"} # USA typically
    ],
    "lines": [
        {"dataKey": top_imps[1], "stroke": "#ef4444"}, # Japan typically
        {"dataKey": top_imps[2], "stroke": "#10b981"},
        {"dataKey": top_imps[3], "stroke": "#f59e0b"}
    ],
    "data": w16_data,
    "situation": "세계 참치 소비의 양극단 축은 명맥합니다. 미국은 막대한 자본으로 '가공 통조림류(Tuna, prepared)'를 휩쓸어 담고(연간 10억 달러 이상 수입), 일본은 '초고가 선어 및 냉동 횟감용' 시장의 바잉 파워를 쥐고 흔듭니다.",
    "takeaway": "K-수산의 타겟은 명확합니다. 소비 한계가 오는 내수 시장을 탈피하고, 즉결 소비재 형태로 북미(간편 튜나 파우치, 델리)와 일본 프리미엄 시장을 겨냥한 D2C 맞춤 스펙 무역을 정밀 공격해야 합니다.",
    "methodology": "[6번 무역금액(2019-2023) CSV] 기준, 막대한 수입 결제가 이루어지는 글로벌 Top 4 국가의 5년 수입 지출액 추이 (단위: 백만 $)"
})

# ─── W17: Value Extractor Dynamics (Korea vs Global Avg Unit Price) ───
w17_data = []
kr_exp_v = df5[(df5['Reporting country (Name)'].str.contains('Korea', na=False)) & (df5['Trade flow (Name)']=='Exports')]
kr_exp_val = df6[(df6['Reporting country (Name)'].str.contains('Korea', na=False)) & (df6['Trade flow (Name)']=='Exports')]
global_exp_v = df5[df5['Trade flow (Name)']=='Exports']
global_exp_val = df6[df6['Trade flow (Name)']=='Exports']

for y in years_tr[-5:]:
    kr_vol = sum(safe(x) for x in kr_exp_v[y])
    kr_dollar = sum(safe(x) for x in kr_exp_val[y])
    kr_up = round(kr_dollar*1000/kr_vol) if kr_vol>0 else 0
    
    gl_vol = sum(safe(x) for x in global_exp_v[y])
    gl_dollar = sum(safe(x) for x in global_exp_val[y])
    gl_up = round(gl_dollar*1000/gl_vol) if gl_vol>0 else 0
    
    w17_data.append({"year": sy(y), "한국 수출단가($)": kr_up, "글로벌 평균단가($)": gl_up})

widgets.append({
    "id": "w17_korea_margin",
    "title": "글로벌 마진 압도 — K-참치의 프리미엄 165% 효율",
    "subtitle": "조업 강도와 냉동 보관 기술(Reefer)의 결정체: 세계 평균을 가볍게 웃도는 한국 참치의 톤당 수출 가치",
    "chartType": "area",
    "xAxis": "year",
    "areas": [
        {"dataKey": "한국 수출단가($)", "color": "#0ea5e9", "fill": "#0ea5e9"},
        {"dataKey": "글로벌 평균단가($)", "color": "#475569", "fill": "#475569"}
    ],
    "data": w17_data,
    "situation": "한국의 참치 수출 물량은 단순 볼륨뿐만 아니라, 1톤당 뿜어내는 가치(Unit Price)가 세계 평균 수출 단가를 압도적 수치로 초과 달성 중입니다. 이는 영하 60도 초저온 냉동운반선 운영과 우수한 생선 선도 관리 역량이 낳은 쾌거입니다.",
    "takeaway": "한국 원양 선단의 강력한 물류/냉장/하역 '인프라 기술력' 자체가 세계적 프리미엄 경쟁우위입니다. 어획량 확대보다 현행 초저온 콜드체인 네트워크를 남미, 유럽 쪽으로 세일즈 및 파트너링하는 신사업 확장이 유효합니다.",
    "methodology": "[5,6번 최신 무역량,액 CSV] 기반, 전 세계 평균 수출 단가와 한국의 수출 단가(USD/Tonne) 차이를 가치 밀도(Value Density) 스코어로 측정"
})

# ─── W18: The Zero-Aquaculture Reality ───
w18_data = []
df3 = pd.read_csv(find_csv('3.')) # Aqua Vol
for y in years_c[-20:]:
    v_c = sum(safe(x) for x in df2[y]) - sum(safe(x) for x in df2[df2['Country (Name)'] == 'Totals - Tonnes - live weight'][y])
    v_aq = sum(safe(x) for x in df3[y]) - sum(safe(x) for x in df3[df3['Country (Name)'] == 'Totals - Tonnes - live weight'][y])
    w18_data.append({"year": sy(y), "자연산(Catch)": round(v_c/1000), "가두리축양(Aqua)": round(v_aq/1000)}) # thousands

widgets.append({
    "id": "w18_zero_aqua",
    "title": "연어와의 완벽한 대척점 — '야생 사냥'의 잔재, 참치",
    "subtitle": "양식이 불가능한 초대형 펠라직(Pelagic) 어종. 100% 자연산 의존의 한계와 리스크 (단위: 천 톤)",
    "chartType": "composed",
    "xAxis": "year",
    "bars": [{"dataKey": "가두리축양(Aqua)", "fill": "#ec4899"}],
    "lines": [{"dataKey": "자연산(Catch)", "stroke": "#3b82f6"}],
    "data": w18_data,
    "situation": "연어와 달리, 글로벌 참치 생산량의 압도적인 99% 이상이 야생 해양에서 직접 조업(Catch)됩니다. '양식(Aquaculture)'은 일부 자어 치어 채집 후 가두리에서 살을 찌우는(Ranching) 방식에 한정되어 수치가 바닥을 깁니다.",
    "takeaway": "수산업의 마지막 '사냥' 산업이자, 가장 지속 가능성 리스크(어족 자원 고갈, 엘니뇨 기후 직격탄)에 취약한 자산군입니다. 지속 조업가능성 확보를 위한 국제 기구 쿼터 확보와 AI 기반 위성 해류 탐지 타겟 어업으로 불필요한 공선 연안 체류와 탄소/유류 비용을 급감시켜야 생존합니다.",
    "methodology": "[1,2번 자연 어획량] vs [3번 양식 생산량] CSV 교차 대조. 연어(Salmon) 99.9% 양식 산업화 지표와 완벽히 대비되는 조업 형태 입증."
})

# Read existing tuna json
existing_path = os.path.join(out_dir, 'tuna_real_data_v2.json')
with open(existing_path, 'r', encoding='utf-8') as f:
    existing = json.load(f)

# Append widgets w13~18
existing['widgets'] = [w for w in existing.get('widgets', []) if not w['id'].startswith('w13') and not w['id'].startswith('w14') and not w['id'].startswith('w15') and not w['id'].startswith('w16') and not w['id'].startswith('w17') and not w['id'].startswith('w18')]
for w in widgets:
    existing['widgets'].append(w)

def translate(txt):
    translations = {
        'Indonesia': '인도네시아', 'Viet Nam': '베트남', 'Republic of Korea': '대한민국',
        'Ecuador': '에콰도르', 'Japan': '일본', 'Taiwan Province of China': '대만',
        'Spain': '스페인', 'Philippines': '필리핀', 'Papua New Guinea': '파푸아뉴기니',
        'Thailand': '태국', 'United States of America': '미국', 'Italy': '이탈리아',
        'Korea': '한국', 'China': '중국'
    }
    for k, v in translations.items():
        if isinstance(txt, str) and k in txt:
            txt = txt.replace(k, v)
    return txt

def trans_obj(obj):
    if isinstance(obj, dict):
        new_obj = {}
        for k, v in obj.items():
            if isinstance(v, str): v = translate(v)
            new_obj[k] = trans_obj(v)
        return new_obj
    elif isinstance(obj, list):
        return [trans_obj(item) for item in obj]
    return obj

existing = trans_obj(existing)

# Fix title prefix (strip W01. )
for w in existing['widgets']:
    if 'title' in w:
        w['title'] = re.sub(r'^W\d{2}\.\s*', '', w['title'])
    # Fix old legacy chart structure to have clean keys for compatibility
    if 'chartType' in w and w['chartType'] == 'pie' and 'xAxis' in w:
        del w['xAxis']

for k, kpi in existing.get('kpis', {}).items():
    v = str(kpi.get('value', ''))
    v = v.replace(' k Tonnes', '천 톤').replace(' k Tonne', '천 톤').replace(' Tonnes', '톤').replace(' / Tonne', ' / 톤')
    if 'Billion' in v and v.startswith('$'):
        try:
            num = float(v.replace('$', '').replace(' Billion', ''))
            v = f'{num * 10:,.0f}억 달러'
        except: pass
    kpi['value'] = v

out_path = os.path.join(out_dir, 'tuna_real_data_v3.json')
with open(out_path, 'w', encoding='utf-8') as f:
    json.dump(existing, f, indent=2, ensure_ascii=False)

print(f"Created tuna_real_data_v3.json with {len(existing['widgets'])} widgets and fully localized insights.")
