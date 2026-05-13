import pandas as pd

try:
    df = pd.read_csv('data/선박정보/해양수산부_어선원부_20230821.CSV', encoding='euc-kr')
    # Filter by names
    names = df['어선명'].dropna()
    matches = names[names.str.contains('주피터|마스|오셔너스|산와폰테인|바다로', na=False)]
    print(f"Found {len(matches)} matches in 어선원부:")
    print(matches.head(10))
except Exception as e:
    print("Error:", e)
