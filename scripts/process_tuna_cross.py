import pandas as pd
import json

wild_file = 'data/참치/2. 참치 생산량(어획량) 1950-2024.csv'
aqua_file = 'data/참치/3. 참치 생산량(양식) 1950-2024.csv'
value_file = 'data/참치/4. 참치 생산액(양식) 1950-2024.csv'

df_wild = pd.read_csv(wild_file)
df_aqua = pd.read_csv(aqua_file)
df_val = pd.read_csv(value_file)

def melt_clean(df, val_name):
    # Dynamically find year columns for this specific dataframe
    df_years = [col for col in df.columns if col.startswith('[') and col.endswith(']')]
    val_cols = ['Country (Name)', 'ASFIS species (Name)'] + df_years
    
    df_clean = df[val_cols].copy()
    melted = pd.melt(df_clean, id_vars=['Country (Name)', 'ASFIS species (Name)'], 
                     value_vars=df_years, var_name='Year', value_name=val_name)
    melted['Year'] = melted['Year'].str.replace('[', '').str.replace(']', '').astype(int)
    melted[val_name] = pd.to_numeric(melted[val_name].astype(str).str.replace(',', ''), errors='coerce').fillna(0)
    return melted[~melted['Country (Name)'].str.startswith('Totals')]

wild_melted = melt_clean(df_wild, 'Wild_Volume')
aqua_melted = melt_clean(df_aqua, 'Aqua_Volume')
val_melted = melt_clean(df_val, 'Aqua_Value')

print("Wild species:", wild_melted[wild_melted['Wild_Volume'] > 0]['ASFIS species (Name)'].unique()[:5])
print("Aqua species:", aqua_melted[aqua_melted['Aqua_Volume'] > 0]['ASFIS species (Name)'].unique()[:5])

# Find Bluefin variations
bluefin_wild = wild_melted[wild_melted['ASFIS species (Name)'].str.lower().str.contains('bluefin', na=False)]
bluefin_aqua = aqua_melted[aqua_melted['ASFIS species (Name)'].str.lower().str.contains('bluefin', na=False)]
bluefin_val = val_melted[val_melted['ASFIS species (Name)'].str.lower().str.contains('bluefin', na=False)]

# 1. The Crossroads (Volume comparison)
wild_yr = bluefin_wild.groupby('Year')['Wild_Volume'].sum().reset_index()
aqua_yr = bluefin_aqua.groupby('Year')['Aqua_Volume'].sum().reset_index()

crossroad = pd.merge(wild_yr, aqua_yr, on='Year', how='outer').fillna(0)
crossroad['Year'] = crossroad['Year'].astype(int)
crossroad = crossroad[crossroad['Year'] >= 1980] # focus on modern era since aqua started later
crossroad_data = crossroad.to_dict(orient='records')
with open('data/tuna_crossroad.json', 'w', encoding='utf-8') as f:
    json.dump(crossroad_data, f, ensure_ascii=False, indent=2)

# 2. Value Explosion (Aqua Volume vs Value)
val_yr = bluefin_val.groupby('Year')['Aqua_Value'].sum().reset_index()
value_exp = pd.merge(aqua_yr, val_yr, on='Year', how='outer').fillna(0)
value_exp = value_exp[value_exp['Year'] >= 1990]
value_exp_data = value_exp.to_dict(orient='records')
with open('data/tuna_aqua_value.json', 'w', encoding='utf-8') as f:
    json.dump(value_exp_data, f, ensure_ascii=False, indent=2)

# 3. Aqua Hegemony (Top countries in Aquaculture)
top_aqua_countries = bluefin_aqua.groupby('Country (Name)')['Aqua_Volume'].sum().nlargest(5).index.tolist()
df_aqua_top = bluefin_aqua[bluefin_aqua['Country (Name)'].isin(top_aqua_countries)]
aqua_hegemony = df_aqua_top.groupby(['Year', 'Country (Name)'])['Aqua_Volume'].sum().unstack(fill_value=0).reset_index()
aqua_hegemony = aqua_hegemony[aqua_hegemony['Year'] >= 1990]
hegemony_data = aqua_hegemony.to_dict(orient='records')
with open('data/tuna_aqua_hegemony.json', 'w', encoding='utf-8') as f:
    json.dump(hegemony_data, f, ensure_ascii=False, indent=2)

print("Saved cross-analysis JSONs!")
