import pandas as pd
try:
    df = pd.read_csv('data/선박정보/해양수산부_선령별 선종별 등록선박현황_20251231.csv', encoding='euc-kr')
    print("Columns:", df.columns.tolist())
    print(df.head())
except Exception as e:
    print("Error with euc-kr:", e)
    try:
        df = pd.read_csv('data/선박정보/해양수산부_선령별 선종별 등록선박현황_20251231.csv', encoding='cp949')
        print("Columns:", df.columns.tolist())
    except Exception as e2:
        print("Error with cp949:", e2)
