import os
import pandas as pd
import json

data_dir = "/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/data/대서양 연어"
out_dir = "/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/data"

# Load the data
def get_file(prefix):
    matches = [f for f in os.listdir(data_dir) if f.startswith(prefix) and f.endswith('.csv')]
    if matches:
        return pd.read_csv(os.path.join(data_dir, matches[0]))
    return None

df_prod_total = get_file("1. ")
df_prod_catch = get_file("2. ")
df_prod_aqua = get_file("3. ")
df_val_aqua = get_file("4. ")
df_trade_vol = get_file("5. ")
df_trade_val = get_file("6. ")
df_trade_vol_long = get_file("7. ")
df_trade_val_long = get_file("8. ")
df_processed = get_file("9. ")

def extract_years(df):
    if df is None: return []
    return sorted([col for col in df.columns if col.startswith('[') and col.endswith(']')])

years_prod = extract_years(df_prod_total)
years_trade = extract_years(df_trade_vol)
years_long = extract_years(df_trade_vol_long)

def strip_year(y):
    return y.replace('[', '').replace(']', '')

def safe_float(v):
    try:
        if pd.isna(v): return 0
        return float(v)
    except:
        return 0

# Widget 1: Total vs Catch vs Aqua
w1_data = []
for y in years_prod:
    try:
        catch_val = safe_float(df_prod_catch[df_prod_catch['Country (Name)'] == 'Totals - Tonnes - live weight'][y].values[0])
        aqua_val = safe_float(df_prod_aqua[df_prod_aqua['Country (Name)'] == 'Totals - Tonnes - live weight'][y].values[0])
        w1_data.append({"year": strip_year(y), "catch": catch_val, "aqua": aqua_val})
    except:
        pass
with open(os.path.join(out_dir, "sal20_w1_production.json"), "w") as f: json.dump(w1_data, f, indent=2)

# Widget 2: Aqua Vol vs Val
w2_data = []
for y in years_prod:
    try:
        vol = safe_float(df_prod_aqua[df_prod_aqua['Country (Name)'] == 'Totals - Tonnes - live weight'][y].values[0])
        val = safe_float(df_val_aqua[df_val_aqua['Country (Name)'] == 'Totals - Value (USD 1000)'][y].values[0])
        unit = val / vol if vol > 0 else 0
        w2_data.append({"year": strip_year(y), "vol": vol, "val": val, "unit": unit})
    except:
        pass
with open(os.path.join(out_dir, "sal20_w2_aqua_value.json"), "w") as f: json.dump(w2_data, f, indent=2)

# Widget 3: Top 4 Hegemony (Vol)
y_latest = years_prod[-1]
df_prod_aqua_clean = df_prod_aqua[df_prod_aqua['Country (Name)'].notna()].copy()
df_prod_aqua_clean[y_latest] = df_prod_aqua_clean[y_latest].apply(safe_float)
top4_vol = df_prod_aqua_clean[~df_prod_aqua_clean['Country (Name)'].str.contains('Total')].nlargest(4, y_latest)['Country (Name)'].tolist()
w3_data = []
for y in years_prod:
    row = {"year": strip_year(y)}
    for c in top4_vol:
        try:
            row[c] = safe_float(df_prod_aqua_clean[df_prod_aqua_clean['Country (Name)'] == c][y].values[0])
        except:
            row[c] = 0
    w3_data.append(row)
with open(os.path.join(out_dir, "sal20_w3_top4_vol.json"), "w") as f: json.dump(w3_data, f, indent=2)

# Widget 4: Scatter Value vs Volume (Latest)
w4_data = []
for c in top4_vol + ['Australia', 'Canada', 'Iceland']:
    try:
        vol = safe_float(df_prod_aqua_clean[df_prod_aqua_clean['Country (Name)'] == c][y_latest].values[0])
        val = safe_float(df_val_aqua[df_val_aqua['Country (Name)'] == c][y_latest].values[0])
        w4_data.append({"country": c, "vol": vol, "val": val, "unit": val/vol if vol>0 else 0})
    except:
        pass
with open(os.path.join(out_dir, "sal20_w4_scatter.json"), "w") as f: json.dump(w4_data, f, indent=2)

# Widget 5: Top 5 Exporters Vol
y_latest_trade = years_trade[-1]
df_trade_vol[y_latest_trade] = df_trade_vol[y_latest_trade].apply(safe_float)
df_trade_val[y_latest_trade] = df_trade_val[y_latest_trade].apply(safe_float)
exp_vol = df_trade_vol[df_trade_vol['Trade flow (Name)'] == 'Exports']
top5_exp = exp_vol.groupby('Reporting country (Name)')[y_latest_trade].sum().nlargest(5).reset_index()
w5_data = [{"country": r['Reporting country (Name)'], "vol": r[y_latest_trade]} for _, r in top5_exp.iterrows()]
with open(os.path.join(out_dir, "sal20_w5_exp_vol.json"), "w") as f: json.dump(w5_data, f, indent=2)

# Widget 6: Top 5 Exporters Val
exp_val = df_trade_val[df_trade_val['Trade flow (Name)'] == 'Exports']
top5_exp_val = exp_val.groupby('Reporting country (Name)')[y_latest_trade].sum().nlargest(5).reset_index()
w6_data = [{"country": r['Reporting country (Name)'], "val": r[y_latest_trade]} for _, r in top5_exp_val.iterrows()]
with open(os.path.join(out_dir, "sal20_w6_exp_val.json"), "w") as f: json.dump(w6_data, f, indent=2)

# Widget 7: Top 5 Importers Vol
imp_vol = df_trade_vol[df_trade_vol['Trade flow (Name)'] == 'Imports']
top5_imp = imp_vol.groupby('Reporting country (Name)')[y_latest_trade].sum().nlargest(5).reset_index()
w7_data = [{"country": r['Reporting country (Name)'], "vol": r[y_latest_trade]} for _, r in top5_imp.iterrows()]
with open(os.path.join(out_dir, "sal20_w7_imp_vol.json"), "w") as f: json.dump(w7_data, f, indent=2)

# Widget 8: Top 5 Importers Val
imp_val = df_trade_val[df_trade_val['Trade flow (Name)'] == 'Imports']
top5_imp_val = imp_val.groupby('Reporting country (Name)')[y_latest_trade].sum().nlargest(5).reset_index()
w8_data = [{"country": r['Reporting country (Name)'], "val": r[y_latest_trade]} for _, r in top5_imp_val.iterrows()]
with open(os.path.join(out_dir, "sal20_w8_imp_val.json"), "w") as f: json.dump(w8_data, f, indent=2)

# Widget 9: Processed Production (2023 latest)
y_latest_proc = extract_years(df_processed)[-1]
df_processed[y_latest_proc] = df_processed[y_latest_proc].apply(safe_float)
top_proc = df_processed[~df_processed['Country (Name)'].str.contains('Total')].nlargest(5, y_latest_proc)
w9_data = [{"country": r['Country (Name)'], "vol": r[y_latest_proc]} for _, r in top_proc.iterrows()]
with open(os.path.join(out_dir, "sal20_w9_processed.json"), "w") as f: json.dump(w9_data, f, indent=2)

# Widget 10: Denmark / Poland Middleman Arbitrage (Imports vs Exports)
middlemen = ['Denmark', 'Poland', 'Netherlands (Kingdom of the)']
w10_data = []
for m in middlemen:
    # Get total import vol + val, and total export vol + val
    ivol = imp_vol[imp_vol['Reporting country (Name)'] == m][y_latest_trade].sum()
    ival = imp_val[imp_val['Reporting country (Name)'] == m][y_latest_trade].sum()
    evol = exp_vol[exp_vol['Reporting country (Name)'] == m][y_latest_trade].sum()
    eval = exp_val[exp_val['Reporting country (Name)'] == m][y_latest_trade].sum()
    w10_data.append({"country": m, "imp_vol": ivol, "imp_val": ival, "exp_vol": evol, "exp_val": eval})
with open(os.path.join(out_dir, "sal20_w10_middleman.json"), "w") as f: json.dump(w10_data, f, indent=2)

# Widget 11: Trade Volume Long (Norway vs Chile)
# File 7
w11_data = []
for y in years_long[-20:]:  # last 20 years
    df_trade_vol_long[y] = df_trade_vol_long[y].apply(safe_float)
    nor_exp = df_trade_vol_long[(df_trade_vol_long['Reporting country (Name)'] == 'Norway') & (df_trade_vol_long['Trade flow (Name)'] == 'Exports')][y].sum()
    chi_exp = df_trade_vol_long[(df_trade_vol_long['Reporting country (Name)'] == 'Chile') & (df_trade_vol_long['Trade flow (Name)'] == 'Exports')][y].sum()
    w11_data.append({"year": strip_year(y), "Norway": nor_exp, "Chile": chi_exp})
with open(os.path.join(out_dir, "sal20_w11_trade_vol_long.json"), "w") as f: json.dump(w11_data, f, indent=2)

# Widget 12: Trade Value Long (Norway vs Chile)
w12_data = []
for y in years_long[-20:]:
    df_trade_val_long[y] = df_trade_val_long[y].apply(safe_float)
    nor_val = df_trade_val_long[(df_trade_val_long['Reporting country (Name)'] == 'Norway') & (df_trade_val_long['Trade flow (Name)'] == 'Exports')][y].sum()
    chi_val = df_trade_val_long[(df_trade_val_long['Reporting country (Name)'] == 'Chile') & (df_trade_val_long['Trade flow (Name)'] == 'Exports')][y].sum()
    w12_data.append({"year": strip_year(y), "Norway": nor_val, "Chile": chi_val})
with open(os.path.join(out_dir, "sal20_w12_trade_val_long.json"), "w") as f: json.dump(w12_data, f, indent=2)

# Widget 13: Export Unit Price (Norway vs Chile)
w13_data = []
for i, y in enumerate(years_long[-20:]):
    v_n = w11_data[i]['Norway']
    v_c = w11_data[i]['Chile']
    val_n = w12_data[i]['Norway']
    val_c = w12_data[i]['Chile']
    un = val_n / v_n if v_n > 0 else 0
    uc = val_c / v_c if v_c > 0 else 0
    w13_data.append({"year": strip_year(y), "Norway": un, "Chile": uc, "spread": un - uc})
with open(os.path.join(out_dir, "sal20_w13_unit_price.json"), "w") as f: json.dump(w13_data, f, indent=2)

# Widget 14: Russian Federation Supply Route
rus_imp = imp_vol[imp_vol['Reporting country (Name)'] == 'Russian Federation']
rus_suppliers = rus_imp.groupby('Partner country (Name)')[y_latest_trade].sum().nlargest(4).reset_index()
w14_data = [{"supplier": r['Partner country (Name)'], "vol": r[y_latest_trade]} for _, r in rus_suppliers.iterrows()]
with open(os.path.join(out_dir, "sal20_w14_rus_supply.json"), "w") as f: json.dump(w14_data, f, indent=2)

# Widget 15: China vs Thailand Imports
w15_data = []
for y in years_trade:
    ch = imp_vol[imp_vol['Reporting country (Name)'] == 'China'][y].sum()
    th = imp_vol[imp_vol['Reporting country (Name)'] == 'Thailand'][y].sum()
    w15_data.append({"year": strip_year(y), "China": ch, "Thailand": th})
with open(os.path.join(out_dir, "sal20_w15_asia_growth.json"), "w") as f: json.dump(w15_data, f, indent=2)

# Widget 16: UK vs Faroe Islands Value (Production value)
w16_data = []
for y in years_prod[-15:]:
    uk = df_val_aqua[df_val_aqua['Country (Name)'].str.contains('United Kingdom')][y].sum()
    faroe = df_val_aqua[df_val_aqua['Country (Name)'].str.contains('Faroe')][y].sum()
    w16_data.append({"year": strip_year(y), "UK": uk, "Faroe": faroe})
with open(os.path.join(out_dir, "sal20_w16_uk_faroe.json"), "w") as f: json.dump(w16_data, f, indent=2)

# Widget 17: Global Trade Total Volume / Value YoY
w17_data = []
for y in years_trade:
    tvol = exp_vol[y].sum()
    tval = exp_val[y].sum()
    w17_data.append({"year": strip_year(y), "vol": tvol, "val": tval})
with open(os.path.join(out_dir, "sal20_w17_global_trade.json"), "w") as f: json.dump(w17_data, f, indent=2)

# Widget 18: China Sub-Imports (Who is supplying China?)
chn_imp = imp_vol[imp_vol['Reporting country (Name)'] == 'China']
chn_suppliers = chn_imp.groupby('Partner country (Name)')[y_latest_trade].sum().nlargest(4).reset_index()
w18_data = [{"supplier": r['Partner country (Name)'], "vol": r[y_latest_trade]} for _, r in chn_suppliers.iterrows()]
with open(os.path.join(out_dir, "sal20_w18_chn_supply.json"), "w") as f: json.dump(w18_data, f, indent=2)

# Widget 19: Trade value premium over time (Inflation impact)
w19_data = []
for i, y in enumerate(years_long[-20:]):
    tvol = df_trade_vol_long[df_trade_vol_long['Trade flow (Name)'] == 'Exports'][y].sum()
    tval = df_trade_val_long[df_trade_val_long['Trade flow (Name)'] == 'Exports'][y].sum()
    w19_data.append({"year": strip_year(y), "unit_price": tval/tvol if tvol>0 else 0})
with open(os.path.join(out_dir, "sal20_w19_inflation.json"), "w") as f: json.dump(w19_data, f, indent=2)

# Widget 20: Korea's position (If any)
kr_imp = imp_vol[imp_vol['Reporting country (Name)'].str.contains('Korea')]
kr_val = imp_val[imp_val['Reporting country (Name)'].str.contains('Korea')]
w20_data = []
for y in years_trade:
    vol = kr_imp[y].sum()
    val = kr_val[y].sum()
    w20_data.append({"year": strip_year(y), "vol": vol, "val": val, "unit": val/vol if vol>0 else 0})
with open(os.path.join(out_dir, "sal20_w20_korea.json"), "w") as f: json.dump(w20_data, f, indent=2)

print("Created 20 JSON files!")
