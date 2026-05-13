import pandas as pd
import glob

print("--- Monthly Consumption ---")
files = glob.glob('data/EU/raw_csv/Monthly_Consumption.csv')
if files:
    df = pd.read_csv(files[0], sep=';', on_bad_lines='skip', nrows=5)
    print(df.columns.tolist())
    
print("--- Yearly Processing ---")
files = glob.glob('data/EU/raw_csv/Yearly_Processing.csv')
if files:
    try:
        df = pd.read_csv(files[0], sep=';', on_bad_lines='skip', nrows=5)
        print(df.columns.tolist())
    except:
        pass

print("--- Trade Data EU ---")
files = glob.glob('data/EU/raw_csv/2024_Trade_data_reported_by_EU_countries.csv')
if files:
    try:
        df = pd.read_csv(files[0], sep=';', on_bad_lines='skip', nrows=5)
        print(df.columns.tolist())
    except:
        pass
        
