import pandas as pd
import glob

print("--- Checking Retail Prices ---")
retail_files = glob.glob('data/EU/raw_csv/*Daily-online retail prices.csv')
if retail_files:
    df_ret = pd.read_csv(retail_files[-1], nrows=100)
    print(df_ret.columns.tolist())
    # Try to find species column and check if mackerel exists
    
print("--- Checking Import from Third Countries ---")
import_files = glob.glob('data/EU/raw_csv/*EU Import from third countries.csv')
if import_files:
    df_imp = pd.read_csv(import_files[-1], nrows=100)
    print(df_imp.columns.tolist())

