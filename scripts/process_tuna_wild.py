import pandas as pd
import json
import numpy as np

# Load Data
df = pd.read_csv('data/참치/2. 참치 생산량(어획량) 1950-2024.csv')

# Clean Year Columns
years = [col for col in df.columns if col.startswith('[') and col.endswith(']')]
val_cols = ['Country (Name)', 'ASFIS species (Name)', 'FAO major fishing area (Name)'] + years

df_clean = df[val_cols].copy()

# Melt the dataframe
df_melted = pd.melt(df_clean, id_vars=['Country (Name)', 'ASFIS species (Name)', 'FAO major fishing area (Name)'], 
                    value_vars=years, var_name='Year', value_name='Volume')

# Clean Year strings
df_melted['Year'] = df_melted['Year'].str.replace('[', '').str.replace(']', '').astype(int)

# Clean Volume strings
# Some volumes might be strings like '1,000' or '...', let's coerce errors
df_melted['Volume'] = pd.to_numeric(df_melted['Volume'].astype(str).str.replace(',', ''), errors='coerce').fillna(0)

df_melted = df_melted[df_melted['Volume'] > 0]
df_melted = df_melted[~df_melted['Country (Name)'].str.startswith('Totals')]

# =====================================================================
# Idea 1: Species Dominance Shift (Skipjack vs Yellowfin vs Bigeye)
# =====================================================================
species_map = {
    'Skipjack tuna': '가다랑어 (Skipjack)',
    'Yellowfin tuna': '황다랑어 (Yellowfin)',
    'Bigeye tuna': '눈다랑어 (Bigeye)'
}
df_dominance = df_melted[df_melted['ASFIS species (Name)'].isin(species_map.keys())].copy()
df_dominance['Species'] = df_dominance['ASFIS species (Name)'].map(species_map)

dominance_grouped = df_dominance.groupby(['Year', 'Species'])['Volume'].sum().unstack(fill_value=0).reset_index()
dominance_data = dominance_grouped.to_dict(orient='records')

with open('data/참치/tuna_species_dominance.json', 'w', encoding='utf-8') as f:
    json.dump(dominance_data, f, ensure_ascii=False, indent=2)


# =====================================================================
# Idea 2: Hegemony Shift (Top 6 Countries)
# =====================================================================
# Find top 6 overall catch countries
top_countries = df_melted.groupby('Country (Name)')['Volume'].sum().nlargest(6).index.tolist()

df_hegemony = df_melted[df_melted['Country (Name)'].isin(top_countries)]
hegemony_grouped = df_hegemony.groupby(['Year', 'Country (Name)'])['Volume'].sum().unstack(fill_value=0).reset_index()

hegemony_data = hegemony_grouped.to_dict(orient='records')

with open('data/참치/tuna_hegemony_shift.json', 'w', encoding='utf-8') as f:
    json.dump(hegemony_data, f, ensure_ascii=False, indent=2)


# =====================================================================
# Idea 3: Premium Peak (Bluefin & Bigeye)
# =====================================================================
def get_premium_species(species):
    species_str = str(species).lower()
    if 'bluefin' in species_str:
        return '참다랑어 (Bluefin)'
    elif 'bigeye' in species_str:
        return '눈다랑어 (Bigeye)'
    return None

df_melted['PremiumSpecies'] = df_melted['ASFIS species (Name)'].apply(get_premium_species)
df_premium = df_melted.dropna(subset=['PremiumSpecies'])

premium_grouped = df_premium.groupby(['Year', 'PremiumSpecies'])['Volume'].sum().unstack(fill_value=0).reset_index()
premium_data = premium_grouped.to_dict(orient='records')

with open('data/참치/tuna_premium_peak.json', 'w', encoding='utf-8') as f:
    json.dump(premium_data, f, ensure_ascii=False, indent=2)


# =====================================================================
# Idea 4: Area Exhaustion (Active FAO Areas Count & Area wise stack)
# =====================================================================
# Group by year and area
area_grouped = df_melted.groupby(['Year', 'FAO major fishing area (Name)'])['Volume'].sum().reset_index()

# For stacked area chart, we just pivot Area.
# Filter to keep areas with reasonable total to avoid too many small categories
# Let's keep top 8 areas, others = '기타 해역 (Others)'
top_areas = df_melted.groupby('FAO major fishing area (Name)')['Volume'].sum().nlargest(8).index.tolist()

def map_area(area):
    if area in top_areas:
        return area
    return '기타 해역 (Others)'

area_grouped['MappedArea'] = area_grouped['FAO major fishing area (Name)'].apply(map_area)
area_pivot = area_grouped.groupby(['Year', 'MappedArea'])['Volume'].sum().unstack(fill_value=0).reset_index()

area_data = area_pivot.to_dict(orient='records')

with open('data/참치/tuna_area_exhaustion.json', 'w', encoding='utf-8') as f:
    json.dump(area_data, f, ensure_ascii=False, indent=2)

print("Data processing completed! JSON files generated in data/참치/")
