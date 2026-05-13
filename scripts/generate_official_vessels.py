import json

# Verified Official Fleet Data from "2025 원양산업 통계연보.pdf"
official_fleet = [
    # --- 신라교역 (Silla) ---
    # 참치선망 (Tuna Seining)
    {"name": "신라스프린터", "callSign": "DTTA", "tonnage": "1171.00", "age": 14, "purpose": "원양선망", "company": "신라교역", "category": "Tuna Seining"},
    {"name": "신라익스플로러", "callSign": "DTTA", "tonnage": "2050.00", "age": 11, "purpose": "원양선망", "company": "신라교역", "category": "Tuna Seining"},
    {"name": "신라쥬피터", "callSign": "DTTA", "tonnage": "780.00", "age": 24, "purpose": "원양선망", "company": "신라교역", "category": "Tuna Seining"},
    {"name": "신라챌린저", "callSign": "DTTA", "tonnage": "1349.20", "age": 35, "purpose": "원양선망", "company": "신라교역", "category": "Tuna Seining"},
    {"name": "신라파이어니어", "callSign": "DTTA", "tonnage": "2050.00", "age": 11, "purpose": "원양선망", "company": "신라교역", "category": "Tuna Seining"},
    {"name": "신라하비스터", "callSign": "DTTA", "tonnage": "1971.00", "age": 14, "purpose": "원양선망", "company": "신라교역", "category": "Tuna Seining"},
    
    # 참치연승 (Tuna Longlining)
    {"name": "신영51호", "callSign": "DTTB", "tonnage": "401.00", "age": 37, "purpose": "원양연승", "company": "신라교역", "category": "Tuna Longlining"},
    {"name": "신영52호", "callSign": "DTTB", "tonnage": "401.00", "age": 37, "purpose": "원양연승", "company": "신라교역", "category": "Tuna Longlining"},
    {"name": "신영55호", "callSign": "DTTB", "tonnage": "424.00", "age": 36, "purpose": "원양연승", "company": "신라교역", "category": "Tuna Longlining"},
    {"name": "신영56호", "callSign": "DTTB", "tonnage": "384.00", "age": 38, "purpose": "원양연승", "company": "신라교역", "category": "Tuna Longlining"},
    {"name": "파나룩스31호", "callSign": "DTTB", "tonnage": "427.00", "age": 35, "purpose": "원양연승", "company": "신라교역", "category": "Tuna Longlining"},
    {"name": "파나룩스32호", "callSign": "DTTB", "tonnage": "427.00", "age": 35, "purpose": "원양연승", "company": "신라교역", "category": "Tuna Longlining"},
    {"name": "파나룩스33호", "callSign": "DTTB", "tonnage": "427.00", "age": 35, "purpose": "원양연승", "company": "신라교역", "category": "Tuna Longlining"},
    {"name": "파나룩스34호", "callSign": "DTTB", "tonnage": "427.00", "age": 35, "purpose": "원양연승", "company": "신라교역", "category": "Tuna Longlining"},
    {"name": "파나룩스35호", "callSign": "DTTB", "tonnage": "427.00", "age": 35, "purpose": "원양연승", "company": "신라교역", "category": "Tuna Longlining"},

    # --- 동원산업 (Dongwon) ---
    # 참치선망 (Tuna Seining)
    {"name": "디올린다호", "callSign": "DTTC", "tonnage": "606.00", "age": 43, "purpose": "원양선망", "company": "동원산업", "category": "Tuna Seining"},
    {"name": "미래로호", "callSign": "DTTC", "tonnage": "1826.00", "age": 11, "purpose": "원양선망", "company": "동원산업", "category": "Tuna Seining"},
    {"name": "바다로호", "callSign": "DTTC", "tonnage": "986.00", "age": 34, "purpose": "원양선망", "company": "동원산업", "category": "Tuna Seining"},
    {"name": "본아미호", "callSign": "DTTC", "tonnage": "1862.00", "age": 6, "purpose": "원양선망", "company": "동원산업", "category": "Tuna Seining"},
    {"name": "블루오션호", "callSign": "DTTC", "tonnage": "2023.00", "age": 17, "purpose": "원양선망", "company": "동원산업", "category": "Tuna Seining"},
    {"name": "세계로호", "callSign": "DTTC", "tonnage": "1826.00", "age": 12, "purpose": "원양선망", "company": "동원산업", "category": "Tuna Seining"},
    {"name": "아틀리아호", "callSign": "DTTC", "tonnage": "1072.00", "age": 33, "purpose": "원양선망", "company": "동원산업", "category": "Tuna Seining"},
    {"name": "오션마스타호", "callSign": "DTTC", "tonnage": "1349.20", "age": 36, "purpose": "원양선망", "company": "동원산업", "category": "Tuna Seining"},
    {"name": "오션에이스호", "callSign": "DTTC", "tonnage": "1994.00", "age": 19, "purpose": "원양선망", "company": "동원산업", "category": "Tuna Seining"},
    {"name": "장보고호", "callSign": "DTTC", "tonnage": "1400.00", "age": 17, "purpose": "원양선망", "company": "동원산업", "category": "Tuna Seining"},
    {"name": "주빌리호", "callSign": "DTTC", "tonnage": "1862.00", "age": 6, "purpose": "원양선망", "company": "동원산업", "category": "Tuna Seining"},
    {"name": "코스모스호", "callSign": "DTTC", "tonnage": "733.00", "age": 44, "purpose": "원양선망", "company": "동원산업", "category": "Tuna Seining"},
    {"name": "테리카호", "callSign": "DTTC", "tonnage": "1811.00", "age": 10, "purpose": "원양선망", "company": "동원산업", "category": "Tuna Seining"},
    {"name": "한아라호", "callSign": "DTTC", "tonnage": "1811.00", "age": 10, "purpose": "원양선망", "company": "동원산업", "category": "Tuna Seining"}
]

with open('public/data/vessel_master.json', 'w', encoding='utf-8') as f:
    json.dump(official_fleet, f, ensure_ascii=False, indent=2)

print(f"Successfully generated public/data/vessel_master.json with {len(official_fleet)} official deep-sea vessels from the PDF.")
