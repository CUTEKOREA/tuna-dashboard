import pandas as pd
import glob

files_to_check = [
    'data/선박정보/해양수산부_어선원부_20230821.CSV',
    'data/선박정보/한국해양수산개발원_검사 대상 어선 정보_20241020.csv',
    'data/선박정보/한국해양교통안전공단_어선검사현황_20250627.csv'
]

for f in files_to_check:
    print(f"\nChecking {f}")
    try:
        df = pd.read_csv(f, encoding='euc-kr')
        print("Columns:", df.columns.tolist())
        # Let's search for some ships or companies
        sample = df.head(3)
        print(sample)
    except Exception as e:
        print("Error with euc-kr:", e)
        try:
            df = pd.read_csv(f, encoding='cp949')
            print("Columns (cp949):", df.columns.tolist())
        except Exception as e2:
            try:
                df = pd.read_csv(f, encoding='utf-8')
                print("Columns (utf-8):", df.columns.tolist())
            except Exception as e3:
                print("Error with utf-8:", e3)
