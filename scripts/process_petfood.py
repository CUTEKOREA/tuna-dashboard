import json
import os

out_dir = "/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/data"

petfood_data = {
    # Tab 1: Global Macro
    "d_w01": [
        {"year": '2017', "size": 760}, {"year": '2019', "size": 813}, {"year": '2022', "size": 1172},
        {"year": '2025(E)', "size": 1584}, {"year": '2028(E)', "size": 1797}, {"year": '2035(E)', "size": 2477},
    ],
    "d_w02": [
        {"country": '미국', "size": 321.3}, {"country": '브라질', "size": 40.6}, {"country": '일본', "size": 38.4},
        {"country": '영국', "size": 38.3}, {"country": '독일', "size": 38.2}, {"country": '프랑스', "size": 33.7},
        {"country": '중국', "size": 30.8}, {"country": '러시아', "size": 29.9}, {"country": '이탈리아', "size": 25.1},
        {"country": '한국', "size": 7.7},
    ],
    "d_w03": [
        {"name": 'Mars (마즈)', "value": 172.2}, {"name": 'Nestlé Purina', "value": 121.0},
        {"name": 'Big Heart', "value": 23.0}, {"name": "Hill's", "value": 22.6},
        {"name": 'Blue Buffalo', "value": 11.5}, {"name": '기타', "value": 450},
    ],
    "d_w04": [
        {"year": '2015', "china": 10.1, "thai": 6.0, "korea": 6.8},
        {"year": '2019', "china": 30.8, "thai": 10.7, "korea": 7.7},
        {"year": '2023(E)', "china": 71.9, "thai": 13.2, "korea": 8.9},
        {"year": '2024', "china": 80, "thai": 16.0, "korea": 9.0},
    ],
    "d_w05": [
        {"market": '홍콩', "sales": 7.55, "premium": 75, "importVal": 1.59},
        {"market": '대만 (2026E)', "sales": 11.6, "premium": 50, "importVal": 2.77},
        {"market": '대만 (2031E)', "sales": 15.6, "premium": 60, "importVal": 3.0},
    ],
    "d_w06": [
        {"name": '펫푸드', "value": 52.8}, {"name": '펫케어/용품', "value": 25.2}, {"name": '의료', "value": 15.0}, {"name": '기타', "value": 7.0},
    ],
    
    # Tab 2: Korea Deep-Dive
    "d_w07": [
        {"year": '2009', "size": 4789}, {"year": '2015', "size": 6750}, {"year": '2020', "size": 12651},
        {"year": '2023', "size": 16000}, {"year": '2026(E)', "size": 19000}, {"year": '2027(E)', "size": 22000},
    ],
    "d_w08": [
        {"cat": '반려묘 사료', "cagr": 15.4, "share": 31}, {"cat": '간식', "cagr": 14.2, "share": 19},
        {"cat": '전체 펫푸드', "cagr": 9.1, "share": 100}, {"cat": '반려견 사료', "cagr": 4.0, "share": 50},
    ],
    "d_w09": [
        {"company": '로얄캐닌코리아', "revenue": 2093, "margin": 12.6},
        {"company": '우리와', "revenue": 1076, "margin": -2.0},
        {"company": '하림펫푸드', "revenue": 521, "margin": 6.0},
        {"company": '한국마즈', "revenue": 350, "margin": 9.4},
        {"company": '대주산업', "revenue": 200, "margin": 7.3},
        {"company": '오에스피(ODM)', "revenue": 170, "margin": 15.4},
    ],
    "d_w10": [
        {"year": '2011', "exports": 1257, "imports": 10113, "deficit": -8856},
        {"year": '2016', "exports": 1352, "imports": 17133, "deficit": -15781},
        {"year": '2020', "exports": 6749, "imports": 27073, "deficit": -20324},
        {"year": '2022', "exports": 14907, "imports": 34725, "deficit": -19818},
    ],
    "d_w11": [
        {"name": '일본', "value": 5989}, {"name": '태국', "value": 2568}, {"name": '대만', "value": 2127},
        {"name": '호주', "value": 1884}, {"name": '베트남', "value": 1000},
    ],
    "d_w12": [
        {"country": '중국', "value": 10020}, {"country": '미국', "value": 4878},
        {"country": '태국', "value": 3763}, {"country": '캐나다', "value": 3277},
    ],
    
    # Tab 3: Supply Chain
    "d_w13": [
        {"country": '미국', "value": 8.68}, {"country": '일본', "value": 3.29}, {"country": '호주', "value": 1.67},
        {"country": '이탈리아', "value": 1.65}, {"country": '말레이시아', "value": 1.38},
    ],
    "d_w14": [
        {"name": '중국', "value": 39}, {"name": '한국', "value": 24}, {"name": '미국', "value": 7}, {"name": '기타', "value": 30},
    ],
    "d_w15": [
        {"market": '인도네시아', "usPrice": 3.38, "thPrice": 1.30},
        {"market": '사우디', "usPrice": 7.09, "thPrice": 1.03},
    ],
    "d_w16": [
        {"factor": '참치 +10%', "gpmImpact": -1.8, "profitImpact": -8.5},
        {"factor": '알루미늄 +10%', "gpmImpact": -0.6, "profitImpact": -2.9},
        {"factor": '최저임금 +5%', "gpmImpact": -0.5, "profitImpact": -2.4},
        {"factor": '바트 1THB 절상', "gpmImpact": -1.0, "profitImpact": -10.0},
    ],
    "d_w17": [
        {"name": '곡물', "value": 82.5}, {"name": '축산물', "value": 14.2}, {"name": '수산물', "value": 1.8}, {"name": '농산물', "value": 1.5},
    ],
    "d_w18": [
        {"country": '한국', "online": 78}, {"country": '중국', "online": 75}, {"country": '대만', "online": 42},
        {"country": '글로벌 평균', "online": 33}, {"country": '미국', "online": 30},
        {"country": '일본', "online": 38}, {"country": '홍콩', "online": 20},
    ],
    
    # Tab 4: Biz Model
    "d_w19": [
        {"product": '참치캔 본품', "margin": 8}, {"product": '펫푸드(부산물)', "margin": 25}, {"product": '오메가-3 오일', "margin": 55},
    ],
    "d_w20": [
        {"year": '2021', "revenue": 145.3, "gpm": 23.1, "npm": 18.7},
        {"year": '2024', "revenue": 182.0, "gpm": 25.1, "npm": 20.6},
        {"year": '2025 Q1', "revenue": 42.5, "gpm": 24.1, "npm": 15.9},
    ],
    "d_w21": [
        {"grade": '저가(Economy)', "price": 2.40, "cagr": 2.3},
        {"grade": '중가(Standard)', "price": 5.50, "cagr": 4.5},
        {"grade": '프리미엄(Premium)', "price": 11.04, "cagr": 6.1},
    ],
    "d_w22": [
        {"year": '2020', "revenue": 156, "margin": 25.3, "costRate": 67.1},
        {"year": '2021', "revenue": 157, "margin": 17.9, "costRate": 72.0},
        {"year": '2022', "revenue": 168, "margin": 6.5, "costRate": 78.6},
        {"year": '2024(E)', "revenue": 558, "margin": 15.4, "costRate": 70.0},
    ],
    "d_w23": [
        {"year": '2021', "revenue": 286, "profit": 6, "margin": 2.1},
        {"year": '2022', "revenue": 366, "profit": 19, "margin": 5.2},
        {"year": '2024', "revenue": 521, "profit": 32, "margin": 6.0},
    ],
    "d_w24": [
        {"ingredient": '옥수수 글루텐', "cost": 0.32}, {"ingredient": '어분(Fish Meal)', "cost": 0.48},
        {"ingredient": '가금류 부산물', "cost": 1.25}, {"ingredient": '완두콩 단백질', "cost": 2.50},
        {"ingredient": '우육분', "cost": 2.00}, {"ingredient": '대마 단백질', "cost": 4.00},
        {"ingredient": '배양육', "cost": 4.95},
    ],
    
    # Tab 5: Consumer
    "d_w25": [
        {"year": '2009', "online": 21.9, "offline": 78.1}, {"year": '2014', "online": 42.5, "offline": 57.5},
        {"year": '2019', "online": 53.3, "offline": 46.7}, {"year": '2022', "online": 64.8, "offline": 35.2},
        {"year": '2023', "online": 78.0, "offline": 22.0},
    ],
    "d_w26": [
        {"cat": 'PB 펫푸드 (전체)', "growth": 20.2}, {"cat": 'PB (기타 채널)', "growth": 22.6},
        {"cat": 'PB (전문점)', "growth": 15.4}, {"cat": '프리미엄 브랜드', "growth": 11.1},
    ],
    "d_w27_radar": [
        {"subject": 'Human-grade 인지율', "A": 77}, {"subject": '프리미엄 CAGR(한국)', "A": 63},
        {"subject": 'MSC 인증 성장률', "A": 73}, {"subject": '기능성 처방식', "A": 70},
        {"subject": '프리미엄 가격배율', "A": 92},
    ],
    "d_w28": [
        {"year": '2023', "size": 20}, {"year": '2025(E)', "size": 28}, {"year": '2027(E)', "size": 39},
    ],
    "d_w30": [
        {"year": '2024', "size": 60}, {"year": '2028(E)', "size": 85}, {"year": '2032(E)', "size": 105}, {"year": '2036(E)', "size": 118},
    ]
}

os.makedirs(out_dir, exist_ok=True)
with open(os.path.join(out_dir, "petfood_dashboard.json"), "w") as f:
    json.dump(petfood_data, f, indent=2, ensure_ascii=False)

print("Created petfood_dashboard.json")
