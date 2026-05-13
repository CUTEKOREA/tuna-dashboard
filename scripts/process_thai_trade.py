import pandas as pd
import json
import os

def process_thai_trade():
    csv_path = 'data/참치/5. 참치 무역량(수출입) 2019-2023.csv'
    if not os.path.exists(csv_path):
        print(f"Error: {csv_path} not found")
        return

    df = pd.read_csv(csv_path)
    
    # Filter for Thailand as Reporting Country
    thai_df = df[df['Reporting country (Name)'] == 'Thailand'].copy()
    
    years = ['[2019]', '[2020]', '[2021]', '[2022]', '[2023]']
    
    # Yearly Totals
    yearly_totals = []
    for year in years:
        exports = thai_df[thai_df['Trade flow (Name)'] == 'Exports'][year].sum()
        imports = thai_df[thai_df['Trade flow (Name)'] == 'Imports'][year].sum()
        yearly_totals.append({
            "year": year.strip('[]'),
            "exports": round(float(exports), 2),
            "imports": round(float(imports), 2)
        })
    
    # Top Commodities (2023)
    latest_year = '[2023]'
    commodity_exports = thai_df[thai_df['Trade flow (Name)'] == 'Exports'].groupby('Commodity (Name)')[latest_year].sum().sort_values(ascending=False).head(5)
    top_commodities = [{"name": name, "value": round(float(val), 2)} for name, val in commodity_exports.items()]
    
    # Top Partners (2023 Exports)
    partner_exports = thai_df[thai_df['Trade flow (Name)'] == 'Exports'].groupby('Partner country (Name)')[latest_year].sum().sort_values(ascending=False).head(5)
    top_partners = [{"name": name, "value": round(float(val), 2)} for name, val in partner_exports.items()]
    
    summary = {
        "yearly_totals": yearly_totals,
        "top_commodities_2023": top_commodities,
        "top_partners_2023": top_partners
    }
    
    output_path = 'data/thai_tuna_trade_summary.json'
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(summary, f, ensure_ascii=False, indent=2)
    print(f"Summary saved to {output_path}")

if __name__ == "__main__":
    process_thai_trade()
