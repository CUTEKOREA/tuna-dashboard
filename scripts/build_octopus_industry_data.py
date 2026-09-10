#!/usr/bin/env python3
"""「시장 이해 > 문어」 정적 데이터 빌더.

Drive 아카이브(읽기 전용) → public/data/octopus_industry_v1.json
                           → public/data/octopus_company_research_v1.json

골격은 build_whelk_industry_data.py 와 같다. 차이는 문어의 세 칸이다.
  · 0307521000 냉동 문어만 문어 전용 세번이다.
  · 1605550000 은 조제 문어류 바스켓(종 분리 없음)이다.
  · FAO OCT(한국 신고)는 문어류·낙지·주꾸미 합이다.
이 셋을 더하거나 한 축에서 비교하지 않는다(사실 팩 E절). JSON 도 칸을 따로 둔다.

⚠ FishStat 은 국가×연도에 해역 행이 여러 개다. 한국은 2019·2020 에 해역 61 만 값이 있고
  나머지 해역은 0 이다. 딕셔너리에 덮어쓰면 0 이 이긴다 — 반드시 더한다.

원료 달력·소매 표본은 원장에 분류가 없어 보고서 제2판(2026-09-03) 표를 옮긴다(`_meta.원천`).

사용: python3 scripts/build_octopus_industry_data.py [--check]
"""
from __future__ import annotations

import csv
import json
import re
import sys
from collections import Counter, defaultdict
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ARCHIVE = Path(
    '/Users/idong-geon/Library/CloudStorage/GoogleDrive-cutekorea@gmail.com/내 드라이브/'
    'agri_data/01_수산물(Seafood)/octopus/00_문어_관련자료'
)
IN = {
    'fishstat': '10_원본데이터셋/update_2026-09-02/fishstat/FishStat_2026.1.0_capture_octopoda_only.csv',
    'kosis': '11_분석·가공데이터/KOSIS/coastal_octopus_nakji_jukkumi_annual_2026-09-02.csv',
    'kcs': '11_분석·가공데이터/KCS/kcs_annual_hsk10_2019_2025.csv',
    'kcs_country': '11_분석·가공데이터/KCS/kcs_annual_hsk10_by_country_2019_2025.csv',
    'fips': '10_원본데이터셋/FIPS_gyetong/extract_2026-09-02/fips_gyetong_octopus_annual_1998_2026.csv',
    'census': '11_분석·가공데이터/문어_식용제품/문어_식용제품_전수_2026-09-02.csv',
    'impfood': '04_가공·완제품·기업/MFDS_impfood/2026-09-02/impfood_문어_처리일_20250901_20260902.csv',
}
OUT_INDUSTRY = ROOT / 'public/data/octopus_industry_v1.json'
OUT_COMPANY = ROOT / 'public/data/octopus_company_research_v1.json'

FROZEN, PREPARED = '0307521000', '1605550000'
TOP6 = ['China', 'Morocco', 'Mauritania', 'Mexico', 'Japan', 'India']
KO = {
    'China': '중국', 'Morocco': '모로코', 'Mauritania': '모리타니', 'Mexico': '멕시코', 'Japan': '일본',
    'India': '인도', 'Indonesia': '인도네시아', 'Republic of Korea': '한국', 'Thailand': '태국', 'Peru': '페루',
}
CAT_SHORT = {
    'A2_자숙·데친': '자숙·데친', 'A1_냉동·손질·활원물': '냉동·손질', 'D_즉석간편식': '간편식',
    'B_젓갈절임': '젓갈', 'E_어묵연육': '어묵', 'C_조림반찬': '조림', 'G_소스조미': '소스',
    'A3_건조·조미포': '건조포', 'I_기타': '기타', 'J_원료·첨가물': '원료', 'F_과자스낵': '과자',
}
REGION = {
    '서울': '서울', '부산': '부산', '대구': '대구', '인천': '인천', '광주': '광주', '대전': '대전',
    '울산': '울산', '세종': '세종', '경기': '경기', '강원': '강원', '충청북': '충북', '충북': '충북',
    '충청남': '충남', '충남': '충남', '전라북': '전북', '전북': '전북', '전라남': '전남', '전남': '전남',
    '경상북': '경북', '경북': '경북', '경상남': '경남', '경남': '경남', '제주': '제주',
}
# 원장에 없는 보고서 판정(§06). 법인명 키, 문장은 보고서 그대로.
REPORT_NOTES = {
    '주식회사 남선푸드': '세 품목의 2025 실적이 등록 연간생산능력을 넘어 단위 오기 가능성(보고서 §06)',
    '(주)원미푸드': '제품명에 "(원료)" "MR" 표기, 지급 가공 가능성은 해석(보고서 §06)',
    '(주)늘푸른바다': '문어 모양 어묵·모둠어묵 속 문어 조각이 대부분(보고서 §05)',
}

# 보고서 §04 「12개월 원료 달력」 표. 지수는 2023~2025 평균, 연평균 100.
CALENDAR = [
    ('1월', '없음', 107, 112, '동계 어기', '어기', 103),
    ('2월', '없음', 70, 109, '동계 어기', '어기', 70),
    ('3월', '없음', 85, 94, '3월 31일 종료', '어기', 89),
    ('4월', '없음', 86, 101, '춘계 휴어', '어기', 99),
    ('5월', '16일~ 금어', 85, 103, '휴어', '1일~ 전 선단 휴어', 102),
    ('6월', '~30일 금어(경남·전남 ~7월 8일)', 62, 106, '휴어(2026년 6월 30일까지 연장)', '휴어', 80),
    ('7월', '없음', 122, 86, '하계 어기 재개', '휴어(7월 15일까지 연장)', 87),
    ('8월', '제주 1일~', 99, 98, '하계 어기', '자료 없음', 76),
    ('9월', '제주 ~15일', 108, 115, '~15일, 이후 추계 휴어', '자료 없음(연 2회 휴어 제도)', 96),
    ('10월', '없음', 116, 93, '추계 휴어', '자료 없음(통상 가을 휴어)', 131),
    ('11월', '없음', 130, 88, '추계 휴어', '자료 없음(통상 가을 휴어)', 138),
    ('12월', '없음', 128, 95, '추계 휴어, 차기 쿼터 결정', '동계 어기 개시(2024-12-01·2025-12-16)', 129),
]
# 보고서 §07 「온라인 소매 표본의 형태별 100 g 단가」 표. 원(표시가÷중량, 이상치 제외).
RETAIL = [
    ('간편식·밀키트(해물탕·죽·볶음밥·감바스)', 88, 1936, 3196, 10950, 'SSG 68건으로 최다. 문어는 재료 하나'),
    ('생물·산지직송 원물(통영·남해 돌문어)', 47, 1920, 2850, 5956, '살아 있거나 생물'),
    ('자숙·손질 원물(데친 문어·절단)', 38, 2200, 4137, 25450, '국산 중앙 4,154 · 수입 표기 6건 중앙 5,119'),
    ('숙회·RTE 요리(숙회·뽈뽀·세비체)', 22, 2490, 4210, 6375, '컬리에 신규 요리형 브랜드'),
    ('슬라이스(초밥·포장횟감)', 7, 5696, 9525, 14400, '국산 자숙 슬라이스 200 g 11,840원'),
    ('핫바·어묵·볼·가라아게', 4, 2684, 3041, 3231, '노브랜드 문어가라아게 350 g 9,980원이 유일한 PB'),
    ('조미 문어포·건어물', 3, 7405, 7875, 10250, '안주형'),
    ('문어젓·문어장', 1, 7417, 7417, 7417, '절임젓 1건'),
    ('타코야키', 1, 2279, 2279, 2279, '수입 완제품'),
]


# 보고서 §08 「문어 제품 형태별 설비 적합성」 표. 내부 검토 자료다.
EQUIPMENT = [
    ('문어 캔(자숙·조미)', '자숙·절단·충진·주액·시밍·레토르트 살균', '골뱅이 캔 라인 연 2,950천 캔, 가동률 40.5%. EU 등록 품목에 문어 캔 명기', '가능. 자숙 조건·수율 시험 필요'),
    ('문어 함유 어육소시지·핫바·볼', '연육 배합·충진·열처리·포장', '어육소시지 7,259톤, 가동률 61%. 오징어맛 소시지 이력', '가능'),
    ('냉동 자숙 문어(통·다리, B2B 원료)', '해동·세척·자숙·냉각·급속동결·냉동보관', '"냉동문어" 품목 등록 이력만 있음. 부산2공장 라인은 2020년 철수', '확인 필요'),
    ('슬라이스·포장횟감', '해동·슬라이서·진공포장·금속검출·급속동결', '설비 근거 없음. 필리핀·베트남이 완제품을 7~10달러/kg에 공급', '확인 필요'),
    ('레토르트 파우치(해물탕·볶음)', '조리·파우치 충전·레토르트 살균', '공시·등록부에 근거 없음', '확인 필요'),
    ('문어장·젓갈', '절임·숙성', '2017년 절임식품 철수', '확인 필요'),
    ('건조·조미포', '건조기', '근거 없음', '확인 필요'),
]


# 보고서 §02 「수입 시장 비교」 표(UN Comtrade 2024 총계행, GLOBEFISH·EUMOFA 인용).
MARKETS = [
    ('스페인', 711.7, 64295, 11.07, '모리타니 47%·모로코 43%(2025년 1~10월). 가공 후 EU·미국 재수출 허브. 2025년 수입단가 17% 상승'),
    ('한국', 532.9, 71046, 7.50, '중국 30,883 t·베트남 29,642 t(2025년, 문어류 바스켓). 물량 세계 1위이나 낙지·주꾸미가 대부분'),
    ('이탈리아', 451.2, 49274, 9.16, '모로코 45%·인도네시아 14%. 이탈리아·포르투갈 합산 가계 소매가 16.36 유로/kg(2025년 1~10월)'),
    ('일본', 386.5, 39935, 9.68, '중국 10,767 t·베트남 9,066 t·모리타니 7,213 t(2025년). 2025년 수입 8.29% 감소'),
    ('미국', 269.4, 29099, 9.26, '스페인·인도·포르투갈. 2026년 1월 도매가 사상 최고, 필리핀·인도네시아 조달 확대'),
    ('포르투갈', 170.0, 17099, 9.94, '모리타니 35%·모로코 16%. EUMOFA 기준 상륙 9,900 t·수입 20,100 t(Comtrade 신고는 17,099 t)'),
]
# 보고서 §02 「한국 문어류 수입(HS6 바스켓, UN Comtrade 한국 신고)」 표.
KOREA_HS6 = [
    ('2021', 566.7, 2, 73157, 1, 7.75),
    ('2022', 588.8, 2, 72295, 1, 8.14),
    ('2023', 533.9, 2, 69674, 1, 7.66),
    ('2024', 532.9, 2, 71046, 1, 7.50),
]
# 보고서 §06 「제품명 키워드별 등록·생산 추이」 표. 키워드 분류는 전수 CSV 열에 없어 표를 옮긴다.
KEYWORDS = [
    ('데친·자숙·숙회', 509, 93, 917144, 2106948),
    ('손질·세척·절단', 111, 30, 494341, 749287),
    ('해물탕·찜·전골', 83, 30, 394317, 547396),
    ('죽·밥·볶음밥·주먹밥', 149, 31, 15407, 486072),
    ('슬라이스(초밥 토핑)', 186, 28, 95791, 223227),
    ('밀키트', 19, 9, 1000, 149892),
    ('핫바·어묵·연육', 123, 15, 147505, 121528),
    ('젓갈·장·절임', 169, 30, 12401, 26302),
    ('조림·볶음·무침', 112, 13, 25448, 2447),
    ('타코야키·문어빵', 8, 1, 0, 364),
    ('건조·포', 22, 2, 420, 0),
    ('통조림·레토르트', 5, 3, 180, 4424),
]
# 보고서 §09 「OEM 제품 후보 13개」 표. 내부 검토 자료이며 우선순위는 정성 판단이다.
OEM = [
    ('A0', '문어 캔(자숙 문어 통조림, 조미·오일·매운맛)', '국내 등록 형태 1건·제품명 5건(2025 생산 4,424). 골뱅이 캔 1,195천 캔이 참고 시장. 스페인산 수입 12건', '골뱅이 캔 기존 고객(사조·홈플러스·이마트·해미올)·편의점 안주·수출(EU 등록)', '자체 생산 가능: 골뱅이 캔 라인, EU 등록 품목'),
    ('A1', '바로 먹는 데친 문어(통·다리)', 'A2 카테고리 2025 생산 2,093,904로 최대. 남선푸드 두 품목 1,005,982', '대형마트 PB·컬리·쿠팡 브랜드', '임가공(부산·경남 자숙 라인) 또는 필리핀 완제품 재포장'),
    ('A2', '초밥·포케용 문어 슬라이스', '국내 등록 186건·2025 223,227. 수입 신고 유형 "슬라이스(S),자숙,포장횟감" 118건', '회전초밥·포케 프랜차이즈·급식 B2B', '필리핀·베트남 완제품 매입 + 국내 소포장 임가공'),
    ('A3', '문어 해물탕·해신탕 키트', '해물탕 62건·2025 547,396, 밀키트 19건·149,892(150배)', '컬리·쿠팡·홈쇼핑, 외식 프랜차이즈', '밀키트 임가공사 위탁. 문어 원료 공급'),
    ('A4', '문어죽·문어 주먹밥·볶음밥', '죽·밥 149건·2025 486,072(2년 32배)', '편의점·온라인 즉석식품·급식', '즉석식품 제조사에 문어 다이스 원료 공급(2차 벤더)'),
    ('B0', '문어 핫바·문어 어육소시지', '수입 문어 핫바 44건·볼 72건이 중국 제조(국내 등록 핫바 4건)', 'CJ 등 기존 소시지 고객, 편의점', '자체 생산 가능: 어육소시지 라인. 타코야키는 제외'),
    ('B1', '국내산 돌문어(참문어) 숙회·손질문어 프리미엄', '국내산 표기 소비자 완제품 A1 9·A2 10건뿐. 참문어 표기 69건(4%)', '백화점·컬리 프리미엄·지역 특산 온라인', '국산 매입 후 자숙·냉동 임가공'),
    ('B2', '동해 대문어 슬라이스·숙회', '대문어 표기 제품 6건뿐. 강원 소재 제조사 2025 생산 64,121(단위 미표기)', '동해안 지역 브랜드·백화점', '동해안 산지 가공사 임가공'),
    ('B3', '문어장·문어젓 소비자 소포장', 'B 카테고리 220건·139사, 2025 26,756. 국내산 표기 소비자 완제품 0건', '온라인 반찬·컬리·백화점 식품관', '절임 라인 없음, 임가공'),
    ('B4', '업소용 자숙 문어 다이스·슬라이스', '업소용 판정 간편식 7건·어묵 9건. "(원료)" "MR" 지급 가공 수요', '급식 eaT·외식 체인 본사·프랜차이즈', '수입 완제품 규격화·재포장'),
    ('B5', '문어 감바스·뽈뽀 샐러드 키트', '샐러드·뽈뽀 79건, 파스타·감바스 17건(2023~26 허가 7건)', '컬리·SSG 프리미엄 밀키트', '밀키트 임가공사 위탁'),
    ('C2', '조미 문어포·문어 스낵', '소비자 완제품 0건, 2025 생산 16,665 전부 채널 불명', '편의점 안주·수출', '건조기 없음, 보류'),
    ('C4', '수출용 자숙 문어(일본·미국)', '냉동 문어 수출 2025 416톤·444만 달러. 일본 수입 36,627톤, 미국 도매가 사상 최고', '일본 스시 체인·미국 유통', '캔은 자체, 자숙 다리는 임가공'),
]


def read(key: str) -> list[dict]:
    with open(ARCHIVE / IN[key], encoding='utf-8-sig', newline='') as fh:
        return list(csv.DictReader(fh))


def num(value: str | None) -> float:
    return float(value) if value not in (None, '') else 0.0


def ton(kg: float) -> int:
    return int(round(kg / 1000))


def region(addr: str) -> str:
    for key, short in REGION.items():
        if addr.startswith(key):
            return short
    return '미상'


def strip_person(name: str) -> str:
    """제품명에 붙은 개인 이름(「OOO셰프의」)은 명부에 올리지 않는다."""
    return re.sub(r'^[가-힣]{2,4}셰프의\s*(신선담은\s*)?', '', name)


def norm_company(name: str) -> str:
    return re.sub(r'\(주\)|주식회사|㈜|\s|\(유\)|유한회사|농업회사법인|영어조합법인', '', name)


# ─── 세계 어획 ─────────────────────────────────────────────────────────────

def build_world() -> dict:
    by = defaultdict(float)
    for r in read('fishstat'):
        by[(r['COUNTRY.Name_En'], r['PERIOD'])] += num(r['VALUE'])  # 해역 행을 더한다(덮어쓰기 금지)
    years = [str(y) for y in range(2015, 2025)]
    series = []
    for y in years:
        point: dict = {'연도': y, '세계': round(sum(v for (c, yy), v in by.items() if yy == y))}
        for c in TOP6:
            point[KO[c]] = round(by[(c, y)])
        series.append(point)
    rank = sorted(((c, v) for (c, y), v in by.items() if y == '2024'), key=lambda x: -x[1])[:10]
    countries = [
        {'국가': KO.get(c, c), '어획량': round(v), **({'주석': 'FAO OCT 한 줄 · 문어류·낙지·주꾸미 3종 합'} if c == 'Republic of Korea' else {})}
        for c, v in rank
    ]
    return {
        '_meta': {
            '출처': 'FAO FishStat 2026.1.0 Capture, Octopoda 8개 과 + XXO',
            '단위': '톤(live weight)',
            '기준연도': 2024,
            '주의': '두족류 전체(332 코드)는 이 값의 9배가 넘는 별개 집합. 한국 값은 3종 합이라 문어 단독 순위로 쓰지 않는다.',
        },
        '시계열': series,
        '국가2024': countries,
    }


# ─── 국내 생산·위판 ────────────────────────────────────────────────────────

def build_korea() -> tuple[dict, dict]:
    kosis = [
        {'연도': r['year'], '문어류': round(num(r['문어류_t'])), '낙지류': round(num(r['낙지류_t'])), '주꾸미': round(num(r['주꾸미_t']))}
        for r in read('kosis')
        if int(r['year']) >= 2010
    ]
    fips = []
    for r in read('fips'):
        y = int(r['year'])
        if y < 2010:
            continue
        label = f'{y}(1~6월)' if y == 2026 else str(y)
        fips.append({'연도': label, '물량': ton(num(r['qty_kg'])), '단가': int(num(r['unit_price_krw_per_kg']))})
    return (
        {
            '_meta': {
                '출처': 'KOSIS 어업생산동향조사 DT_1EW0004 연근해, 품종 140412 문어류·140409 낙지류·140415 주꾸미',
                '단위': '톤',
                '주의': '세 품종을 더해 「문어」라 부르지 않는다. 문어류 140412 = 참문어+대문어.',
            },
            '연도별': kosis,
        },
        {
            '_meta': {
                '출처': '수협 계통판매통계(FIPS) resNo 05 연간 어종별 판매고, 어종 「문어」',
                '단위': '물량 톤, 단가 원/kg(금액 천원×1000÷kg)',
                '주의': '2026 은 1~6월 누계. 연환산하지 않는다. 위판 kg 와 수입 순중량을 나누지 않는다.',
            },
            '연도별': fips,
        },
    )


# ─── 수입(관세청 HSK10) ─────────────────────────────────────────────────────

def build_trade() -> dict:
    annual = {(r['hsk10'], r['year']): r for r in read('kcs')}
    rows = []
    for y in range(2019, 2026):
        f, p = annual.get((FROZEN, str(y))), annual.get((PREPARED, str(y)))
        rows.append({
            '연도': str(y),
            '냉동문어_톤': ton(num(f['imp_kg'])),
            '냉동문어_백만달러': round(num(f['imp_usd']) / 1e6, 1),
            '냉동문어_단가': num(f['imp_usd_per_kg']),
            # 1605550000 은 2022 HSK 분리로 생겼다. 그 전은 0 이 아니라 칸이 없다.
            '조제문어류_톤': ton(num(p['imp_kg'])) if p else None,
            '조제문어류_백만달러': round(num(p['imp_usd']) / 1e6, 1) if p else None,
            '조제문어류_단가': num(p['imp_usd_per_kg']) if p else None,
            '냉동문어_수출톤': ton(num(f['exp_kg'])),
        })
    by_country = defaultdict(list)
    for r in read('kcs_country'):
        if r['year'] == '2025' and r['hsk10'] in (FROZEN, PREPARED) and num(r['imp_usd']) > 0:
            by_country[r['hsk10']].append({
                '국가': r['country'].replace('마다카스카르', '마다가스카르'),
                '수입액': int(num(r['imp_usd'])),
                '수입량톤': ton(num(r['imp_kg'])),
                '단가': num(r['imp_usd_per_kg']),
            })
    for key in by_country:
        by_country[key].sort(key=lambda row: -row['수입액'])
    return {
        '_meta': {
            '출처': '관세청 nitemtrade HSK10 월별×국가 합산(2019~2025)',
            '단위': '톤(순중량), 백만 달러, 달러/kg',
            '세번': '0307521000 냉동 문어(문어 전용) · 1605550000 조제 문어류(종 분리 없음, 2022~)',
            '주의': '두 세번을 더하지 않는다. 필리핀 자숙은 0307521000, 중국 조제는 1605550000 으로 들어온다. '
                    '2024 조제 문어류는 원장 6,305,473 kg(6,305 t)이고 보고서는 6,306 t로 적었다(차이 원인 미확인). '
                    '2025 냉동 문어 수입액은 보고서 4,270만 달러, 원장 4,268만 달러(반올림 차).',
        },
        '연도별': rows,
        '냉동원산지2025': by_country[FROZEN][:8],
        '조제원산지2025': by_country[PREPARED][:3],
    }


# ─── 제품 전수 · 명부 ──────────────────────────────────────────────────────

def build_products(census: list[dict]) -> dict:
    cat = defaultdict(lambda: {'제품': 0, '제조사': set(), '주원료': 0, '보고2025': 0, '생산2024': 0.0, '생산2025': 0.0})
    for r in census:
        c = cat[r['category']]
        c['제품'] += 1
        c['제조사'].add(r['company'])
        c['주원료'] += r['octopus_role'] == '주원료'
        c['보고2025'] += num(r['qty_2025']) > 0
        c['생산2024'] += num(r['qty_2024'])
        c['생산2025'] += num(r['qty_2025'])
    rows = [
        {'카테고리': CAT_SHORT[k], '코드': k.split('_')[0], '제품': v['제품'], '제조사': len(v['제조사']), '주원료': v['주원료'],
         '보고2025': v['보고2025'], '생산2024': round(v['생산2024']), '생산2025': round(v['생산2025'])}
        for k, v in sorted(cat.items(), key=lambda kv: -kv[1]['제품'])
    ]
    made = {r['company'] for r in census if num(r['qty_2025']) > 0}
    top = sorted(census, key=lambda r: -num(r['qty_2025']))[:6]
    return {
        '_meta': {
            '출처': '식약처 식품안전나라 C002 품목제조보고 + I0300 생산실적(2016~2025), 전수 분류 2026-09-02',
            '단위': '생산량은 원문 단위 미표기(관행상 kg). 톤 환산·KOSIS 합산·매출 추정 금지',
            '범위': '품목제조번호 2,208건 중 가문어·명칭만 등 253건 제외',
            '주의': '국내 제조 가공식품이지 국내 문어 식품 시장 전체가 아니다. 등록 제조사 ≠ 실생산 제조사.',
        },
        '합계': {
            '제품': len(census),
            '제조사': len({r['company'] for r in census}),
            '주원료': sum(r['octopus_role'] == '주원료' for r in census),
            '보고2025': sum(num(r['qty_2025']) > 0 for r in census),
            '실생산제조사2025': len(made),
            '생산2024': round(sum(num(r['qty_2024']) for r in census)),
            '생산2025': round(sum(num(r['qty_2025']) for r in census)),
        },
        '카테고리': rows,
        '상위제품2025': [
            {'제품': strip_person(r['name']), '제조': r['company'], '생산2025': round(num(r['qty_2025'])), '카테고리': CAT_SHORT[r['category']]}
            for r in top
        ],
    }


def build_company(census: list[dict], imports: list[dict]) -> dict:
    by_co = defaultdict(list)
    for r in census:
        by_co[r['company']].append(r)
    imp_by = defaultdict(Counter)
    for r in imports:
        imp_by[norm_company(r['importer'])][r['origin']] += 1
    census_names = {norm_company(c) for c in by_co}
    overlap = sorted(k for k in imp_by if k in census_names)

    def maker_row(name: str) -> dict:
        items = by_co[name]
        q = {y: round(sum(num(r[f'qty_{y}']) for r in items)) for y in ('2023', '2024', '2025')}
        mix = Counter(CAT_SHORT[r['category']] for r in items).most_common(3)
        regions = sorted({region(r['addr']) for r in items} - {'미상'})
        permits = {r['permit_date'][:4] for r in items if r['permit_date']}
        direct = imp_by.get(norm_company(name))
        parts = [f'제품 {len(items)}', ' · '.join(f'{k} {v}' for k, v in mix),
                 f'2023 {q["2023"]:,} · 2024 {q["2024"]:,}']
        if len(permits) == 1:
            parts.append(f'전부 {permits.pop()} 허가')
        if direct:
            parts.append('수입 직접 ' + '·'.join(f'{k} {v}건' for k, v in direct.most_common()))
        if name in REPORT_NOTES:
            parts.append(REPORT_NOTES[name])
        return {
            '회사': name,
            '위치': '·'.join(regions) or '미상',
            '규모': f'2025 {q["2025"]:,}',
            '내용': ' · '.join(parts),
            '성격': '기관(원문 단위 미표기)',
            '출처': '식약처 C002+I0300',
        }

    by_prod = sorted(by_co, key=lambda c: -sum(num(r['qty_2025']) for r in by_co[c]))[:15]
    by_sku = sorted(by_co, key=lambda c: (-len(by_co[c]), c))[:5]

    importers = Counter(r['importer'] for r in imports)
    imp_types = defaultdict(Counter)
    for r in imports:
        imp_types[r['importer']][r['ptype']] += 1
    makers = Counter((r['maker'], r['origin']) for r in imports)
    maker_importers = defaultdict(set)
    maker_types = defaultdict(Counter)
    for r in imports:
        maker_importers[r['maker']].add(r['importer'])
        maker_types[r['maker']][r['ptype']] += 1

    return {
        '_meta': {
            '출처': '식약처 C002+I0300 전수(2026-09-02) · 수입식품정보마루 수입신고 처리일 2025-09-01~2026-09-02 · 보고서 §06·§08',
            '규칙': '법인명만. 건수는 물량이 아니다. 생산량은 원문 단위 미표기. 한 업체의 여러 품목을 다른 업체와 합산하지 않는다.',
            '수입업체': len(importers),
            '해외제조업소': len({r['maker'] for r in imports}),
            '수입신고': len(imports),
            '제조∩수입': len(overlap),
            '생성일': date.today().isoformat(),
        },
        '국내가공': {
            '요지': f'2025 생산실적 상위 15곳. 등록 687곳 중 실제 생산을 보고한 곳은 127곳이다. 수입업체 {len(importers)}곳 가운데 제조사 명단에도 있는 곳은 {len(overlap)}곳이다.',
            'rows': [maker_row(c) for c in by_prod],
        },
        '등록상위': {
            '요지': '제품 수가 많은 순. 등록 SKU가 많아도 2025 생산은 작거나 0일 수 있다.',
            'rows': [maker_row(c) for c in by_sku],
        },
        '수입명의': {
            '요지': f'수입신고 {len(imports):,}건, 수입업체 {len(importers)}곳. 상위 1곳이 {importers.most_common(1)[0][1]}건이다. 건수를 kg로 바꾸지 않는다.',
            'rows': [
                {
                    '회사': name,
                    '위치': '·'.join(f'{k} {v}' for k, v in Counter(r['origin'] for r in imports if r['importer'] == name).most_common()),
                    '규모': f'{n}건',
                    '내용': '주 품목유형 ' + ' · '.join(f'{k} {v}' for k, v in imp_types[name].most_common(2)),
                    '성격': '기관(건수)',
                    '출처': '수입식품정보마루',
                }
                for name, n in importers.most_common(10)
            ],
        },
        '해외가공': {
            '요지': f'신고 원장에 해외제조업소 {len({r["maker"] for r in imports})}곳이 있다. 필리핀 자숙 가공사가 상위를 채운다.',
            'rows': [
                {
                    '회사': maker,
                    '위치': origin,
                    '규모': f'{n}건',
                    '내용': f'수입업체 {len(maker_importers[maker])}곳 · ' + ' · '.join(f'{k} {v}' for k, v in maker_types[maker].most_common(2)),
                    '성격': '기관(건수)',
                    '출처': '수입식품정보마루',
                }
                for (maker, origin), n in makers.most_common(10)
            ],
        },
        '내부검토': {
            '요지': '내부 검토 자료다. 신라에스지 실적은 문어 시장 크기가 아니고 골뱅이 캔 라인 가동률은 문어 실적이 아니다.',
            'rows': [
                {
                    '회사': '신라에스지(주) 부산공장',
                    '위치': '부산 사상',
                    '규모': '골뱅이 캔 능력 2,950천 캔 · 가동률 40.5% · 104일',
                    '내용': '문어 실적 아님. 2025 골뱅이 캔 1,195천 캔 · 어육소시지 7,259톤 능력·61.4% · EU KORP-249(2025-07-02) 등록 품목 "캔(골뱅이, 문어), 어육가공품" · 중국 KP-418(2026-06-08) · "냉동문어" 품목 2023~2025 생산량 0',
                    '성격': '기관(공시·등록부)',
                    '출처': 'DART 제49기 · 국립수산물품질관리원 · 보고서 §08',
                },
                {
                    '회사': '신라에스지(주)',
                    '위치': '부산',
                    '규모': '2025 매출 700억 원 · 영업손실 15.5억 원',
                    '내용': '회사 전체(수산물제조+축육유통). 제품 291.7억 · 상품 396.7억 · 통조림 수출 0.13억. 문어 부문 실적이 아니다.',
                    '성격': '기관(공시)',
                    '출처': 'DART 사업보고서 제49기',
                },
            ],
        },
    }


def build() -> tuple[dict, dict]:
    census = [r for r in read('census') if r['scope'] == 'IN']
    imports = read('impfood')
    kosis, fips = build_korea()
    industry = {
        '_meta': {
            '출처': 'FAO FishStat 2026.1.0 · KOSIS DT_1EW0004 · 관세청 nitemtrade HSK10 · 수협 계통판매(FIPS) · '
                    '식약처 C002+I0300 · 수입식품정보마루 · 문어 OEM 제안계획 보고서 제2판(2026-09-03)',
            '기준일': '아카이브 수집 2026-09-02. 2026-09-01~10 재수집 없음(스윕 미실행).',
            '세번경계': [
                '0307521000 냉동 문어만 문어 전용 세번이다.',
                '1605550000 은 조제 문어류 바스켓이다(종 분리 없음).',
                'FAO OCT(한국)는 문어류·낙지·주꾸미 3종 합이다.',
                'HS6 0307.51·52·59·1605.55 는 문어류 바스켓이다(낙지·주꾸미 포함).',
            ],
            '합산금지': '세 칸과 KOSIS 품종·위판 kg·식약처 원문 단위를 더하거나 나누거나 한 축에서 비교하지 않는다. '
                        '2026 누계는 연환산하지 않는다.',
            '입력': IN,
            '빌더': 'scripts/build_octopus_industry_data.py',
            '생성일': date.today().isoformat(),
        },
        '세계어획': build_world(),
        '한국생산': kosis,
        '위판': fips,
        '수입': build_trade(),
        '제품전수': build_products(census),
        '원료달력': {
            '_meta': {'원천': '보고서 제2판 §04 표 전사', '지수': '2023~2025 평균, 연평균 100'},
            'rows': [
                {'월': m, '금어기': b, '위판물량': q, '위판가': p, '모로코': mo, '모리타니': mr, '냉동수입': im}
                for m, b, q, p, mo, mr, im in CALENDAR
            ],
        },
        '시장비교': {
            '_meta': {'원천': '보고서 제2판 §02 표 전사', '출처': 'UN Comtrade 2024 총계행, FAO GLOBEFISH·EUMOFA 인용', '주의': 'HS6 바스켓이라 낙지·주꾸미 포함'},
            'rows': [{'시장': m, '수입액': v, '물량': q, '단가': u, '특징': n} for m, v, q, u, n in MARKETS],
            '한국연도별': [{'연도': y, '수입액': v, '금액순위': vr, '물량': q, '물량순위': qr, '단가': u} for y, v, vr, q, qr, u in KOREA_HS6],
        },
        '키워드추이': {
            '_meta': {'원천': '보고서 제2판 §06 표 전사', '단위': '생산량은 식약처 원문 단위 미표기', '주의': '1위 업체 실적의 단위 오기 가능성 포함. 시장 성장률로 읽지 않는다'},
            'rows': [{'형태': f, '제품': n, '허가2023_26': p, '생산2023': a, '생산2025': b} for f, n, p, a, b in KEYWORDS],
        },
        'OEM후보': {
            '_meta': {'원천': '보고서 제2판 §09 표 전사', '성격': '내부 검토. 우선순위 A 즉시 제안, B 2차, C 보류. 정성 판단이며 매출 추정 없음'},
            'rows': [{'우선': k, '제품': p, '근거': e, '채널': c, '방식': m} for k, p, e, c, m in OEM],
        },
        '설비적합': {
            '_meta': {'원천': '보고서 제2판 §08 표 전사', '성격': '내부 검토. 신라에스지 부산공장 기준이며 문어 생산 실적이 아니다'},
            'rows': [{'형태': f, '공정': p, '근거': b, '판정': j} for f, p, b, j in EQUIPMENT],
        },
        '소매표본': {
            '_meta': {'원천': '보고서 제2판 §07 표 전사', '표본': '컬리 33 · 쿠팡 40 · SSG 138 = 211, 2026-09-02',
                      '단위': '원/100 g, 표시가÷표시중량, 500원 미만·30,000원 초과 제외'},
            'rows': [
                {'형태': f, '상품수': n, '최저': lo, '중앙': md, '최고': hi, '비고': note}
                for f, n, lo, md, hi, note in RETAIL
            ],
        },
    }
    return industry, build_company(census, imports)


def check(industry: dict, company: dict) -> None:
    """보고서 원문 값과 어긋나면 멈춘다. 빌더가 조용히 다른 수를 쓰는 것을 막는다."""
    world = {p['연도']: p for p in industry['세계어획']['시계열']}
    assert world['2024']['세계'] == 389920 and world['2015']['세계'] == 400787
    assert world['2024']['중국'] == 110559 and world['2024']['모로코'] == 55446
    korea_fao = next(r for r in industry['세계어획']['국가2024'] if r['국가'] == '한국')
    assert korea_fao['어획량'] == 18386 and '3종' in korea_fao['주석']
    kosis = {p['연도']: p for p in industry['한국생산']['연도별']}
    assert kosis['2024']['문어류'] == 10111 and kosis['2025']['문어류'] == 8029
    fips = {p['연도']: p for p in industry['위판']['연도별']}
    assert fips['2025'] == {'연도': '2025', '물량': 4457, '단가': 23557}
    assert fips['2026(1~6월)']['단가'] == 27153 and fips['2021']['단가'] == 16443
    trade = {p['연도']: p for p in industry['수입']['연도별']}
    assert trade['2025']['냉동문어_톤'] == 4502 and trade['2025']['냉동문어_단가'] == 9.48
    assert trade['2025']['조제문어류_톤'] == 5995 and trade['2025']['조제문어류_단가'] == 6.06
    assert trade['2019']['조제문어류_톤'] is None and trade['2025']['냉동문어_수출톤'] == 416
    total = industry['제품전수']['합계']
    assert (total['제품'], total['제조사'], total['보고2025'], total['실생산제조사2025']) == (1955, 687, 268, 127)
    assert total['생산2025'] == 4794422
    assert company['_meta']['수입업체'] == 133 and company['_meta']['제조∩수입'] == 12
    assert company['_meta']['해외제조업소'] == 91 and company['_meta']['수입신고'] == 1237
    assert company['국내가공']['rows'][0]['규모'] == '2025 1,618,876'
    blob = json.dumps(company, ensure_ascii=False)
    assert '셰프' not in blob and '정호영' not in json.dumps(industry, ensure_ascii=False)


def main() -> int:
    industry, company = build()
    check(industry, company)
    if '--check' in sys.argv:
        print('check ok')
        return 0
    for path, payload in ((OUT_INDUSTRY, industry), (OUT_COMPANY, company)):
        text = json.dumps(payload, ensure_ascii=False, indent=1)
        assert len(text.encode()) < 1_000_000, f'{path.name} 1MB 초과'
        path.write_text(text + '\n', encoding='utf-8')
        print(f'wrote {path.relative_to(ROOT)} ({len(text.encode()):,} bytes)')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
