import pandas as pd

# === ANALYSIS 1: Yearly Landings ===
print("=== LANDINGS ===")
df = pd.read_csv('data/EU/raw_csv/Yearly_Landings.csv', sep='~', on_bad_lines='skip', encoding='utf-8')
cols = [c.upper() for c in df.columns]
df.columns = cols
print("Cols:", cols[:12])

mac = df[df['MAIN_COMMERCIAL_SPECIES'].astype(str).str.contains('Mackerel', case=False, na=False)].copy()
mac['VOLUME(KG)'] = pd.to_numeric(mac['VOLUME(KG)'].astype(str).str.replace(',','.'), errors='coerce')
mac['VALUE(EUR)'] = pd.to_numeric(mac['VALUE(EUR)'].astype(str).str.replace(',','.'), errors='coerce')
mac['YEAR'] = pd.to_numeric(mac['YEAR'], errors='coerce')

agg_year = mac.groupby('YEAR')[['VOLUME(KG)','VALUE(EUR)']].sum().reset_index()
agg_year['PRICE'] = agg_year['VALUE(EUR)'] / agg_year['VOLUME(KG)']
for _,r in agg_year.sort_values('YEAR').iterrows():
    print(f"  {int(r['YEAR'])}: {r['VOLUME(KG)']/1000:,.0f} t, {r['VALUE(EUR)']/1000000:,.1f}M, P={r['PRICE']:.2f}")

print("\n  By Country:")
agg_c = mac.groupby('COUNTRY')[['VOLUME(KG)','VALUE(EUR)']].sum().reset_index().sort_values('VOLUME(KG)', ascending=False)
for _,r in agg_c.head(8).iterrows():
    p=r['VALUE(EUR)']/r['VOLUME(KG)'] if r['VOLUME(KG)']>0 else 0
    print(f"  {r['COUNTRY']}: {r['VOLUME(KG)']/1000:,.0f} t, P={p:.2f}")

# === Presentation form analysis ===
print("\n  By Presentation:")
agg_p = mac.groupby('PRESENTATION')[['VOLUME(KG)','VALUE(EUR)']].sum().reset_index().sort_values('VOLUME(KG)', ascending=False)
for _,r in agg_p.head(6).iterrows():
    p=r['VALUE(EUR)']/r['VOLUME(KG)'] if r['VOLUME(KG)']>0 else 0
    print(f"  {r['PRESENTATION']}: {r['VOLUME(KG)']/1000:,.0f} t, P={p:.2f}")

