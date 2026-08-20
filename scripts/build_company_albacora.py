#!/usr/bin/env python3
"""Albacora 조사보고서 HTML → `public/data/companies/albacora_v1.json`.

원자료는 사내 조사보고서다 (`docs/evidence/company-albacora-2026-08/보고서.html`).
7개 절에서 화면이 쓸 표만 골라 옮긴다.

**수치는 손으로 옮기되 대조는 기계가 한다.** 값은 여기 적고, 내보내기 전에 핵심 수치
문자열이 원문에 그대로 있는지 확인한다 — 옮겨 적다 자릿수를 틀리는 것이 실패 모드다.

⚠ 이 회사는 **비상장 가족기업**이라 매출 절대액이 공개되지 않는다. 확인된 것은
   경영진 발언(그룹 연결 약 5.0억 유로)과 법정 공개 문서(EINF·EMAS)에 실린 물량뿐이다.
   신용정보 기관의 증감률은 **방향치**이지 절대액이 아니다 — 표마다 기준을 명기한다.
⚠ 선단은 회사가 18척이라 밝히나 공적 등록부로 확인되는 것은 12척이다.
   나머지 6척은 `null` 로 두고 **추정으로 메우지 않는다.**
"""
from __future__ import annotations

import html
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "docs/evidence/company-albacora-2026-08/보고서.html"
OUT = ROOT / "public/data/companies/albacora_v1.json"


def corpus() -> str:
    s = SRC.read_text(encoding="utf8", errors="replace")
    s = re.sub(r"data:image/[^\"')]+", "IMG", s)          # base64 이미지 제거
    s = re.sub(r"<(script|style)[^>]*>.*?</\1>", "", s, flags=re.S)
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", s)))


PROFILE = [
    ["정식 상호", "Albacora, Sociedad Anónima (비상장 가족기업)"],
    ["설립 · 기원", "1974-06-22 설립 · 1962년 베르메오 4개 가문의 선상냉동선 4척이 출발점"],
    ["본사", "Edif. Albacora, Pol. Ind. Landabaso s/n, 48370 Bermeo (Bizkaia)"],
    ["업종", "CNAE 0311 해양어업 — 스페인 업종 매출 1위"],
    ["자본금 · 감사", "€11,748,240 (감자 5회) · KPMG Auditores"],
    ["선단", "선망 18척 — 사는 회사가 아니라 잡는 회사다"],
]

# 3사 비교. 보고서 01절의 좌표계 — 이 회사가 왜 «경쟁자»인지가 여기서 갈린다.
COMPARE = [
    {"항목": "정체", "frinsa": "사는 회사 (PL의 왕)", "thaiunion": "사는 + 브랜드 수집", "albacora": "잡는 회사"},
    {"항목": "선단", "frinsa": "0척", "thaiunion": "0척", "albacora": "선망 18척"},
    {"항목": "규모 축", "frinsa": "매출 741 M€", "thaiunion": "매출 1,327억 밧", "albacora": "어획 20만 톤"},
    {"항목": "상장", "frinsa": "비상장 가족", "thaiunion": "SET 상장", "albacora": "비상장 가족"},
    {"항목": "신라교역에게", "frinsa": "고객 후보", "thaiunion": "고객 + 미국 경쟁자", "albacora": "동업종 직접 경쟁자"},
]

HISTORY = [
    {"연도": "1957", "사건": "베르메오 어선들이 세네갈·시에라리온 해역 조업 개시"},
    {"연도": "1962", "사건": "베르메오 4개 가문이 선상 냉동 신조선 4척 발주 — 이 회사의 출발점"},
    {"연도": "1974", "사건": "Albacora, S.A. 설립 — 초대 회장 Iñaki Latxaga Bengoetxea"},
    {"연도": "1990", "사건": "Salica Industria Alimentaria 설립 — Campos + Astorquiza 합병 (베르메오 캔)"},
    {"연도": "1999", "사건": "Salica Alimentos Congelados 설립 (갈리시아 냉동)"},
    {"연도": "2001", "사건": "Salica del Ecuador 설립 — Posorja, 자체 항만"},
    {"연도": "2002", "사건": "운반선 «Salica Frigo» 편입, 당시 그룹 선단 28척"},
    {"연도": "2022 말", "사건": "창업자 별세 → 승계 시작"},
    {"연도": "2026-05", "사건": "Consignaciones Puebla SLU 흡수합병 소멸"},
]

# 승계 3년. BORME 공고 기준.
SUCCESSION = [
    {"시점": "~2022", "변동": "창업 회장 Iñaki Latxaga Bengoetxea (등기표기 Ignacio Lachaga)"},
    {"시점": "2022 말", "변동": "창업자 별세 — BORME상 회장직 소멸 2023-02-16, 이사직 2023-04-04"},
    {"시점": "2023-02", "변동": "회장 María Luisa Lachaga Uría 취임 — 창업자의 딸로 추정"},
    {"시점": "2023-06", "변동": "Isabel Casandra Beitia Lachaga 공동 CEO 선임"},
    {"시점": "2024-02", "변동": "CEO Alfonso Ignacio Beitia Lachaga — 창업자의 손자"},
    {"시점": "2026-07-22", "변동": "Isabel Beitia CEO 사임 (BORME 2026-07-29 공고). 이사로는 잔류"},
]

AFFILIATES = [
    {"법인": "Salica Industria Alimentaria (A48434781)", "내용": "1990 설립. 회장 Mª Luisa Lachaga. KPMG 감사"},
    {"법인": "Salica Alimentos Congelados (A15670748)", "내용": "1999 설립. Albacora SA가 회장 법인이사"},
    {"법인": "Salica del Ecuador", "내용": "2001 설립. 자체 항만 보유. SIA 캔사업부 산하"},
    {"법인": "Euskaltuna SL", "내용": "빌바오 → Inpesca 지분 → Atunlo 간접 지분 (리스크 이력의 경로)"},
    {"법인": "Albafrigo Canarias SA", "내용": "Albacora 100% (Socio Único)"},
    {"법인": "AMUI Corporation V SL", "내용": "2018 설립. 가족 지주 (유가증권 보유 목적)"},
    {"법인": "ALONSO ESCURIS SL", "내용": "2022-09~ 부회장 법인이사 — Jealsa 창업 가문"},
    {"법인": "Consignaciones Puebla SLU", "내용": "2026-05-13 Albacora에 흡수합병 소멸"},
]

# ── 03 선단 ──

# RFMO 4개 기구(WCPFC·IOTC·ICCAT·IATTC) 등록부 확인분. 회사 공표 18척 중 12척.
FLEET = [
    {"선명": "INTERTUNA TRES", "gt": 4428, "선적": "파나마", "기구": "WCPFC·IOTC·IATTC", "소유사": "Integral Fishing Services"},
    {"선명": "ALBATUN TRES", "gt": 4406, "선적": "스페인", "기구": "WCPFC·IATTC", "소유사": "ALBACORA, S.A."},
    {"선명": "ALBATUN DOS", "gt": 4406, "선적": "스페인", "기구": "IOTC", "소유사": "ALBACORA, S.A."},
    {"선명": "ALBACORA UNO", "gt": 3584, "선적": "스페인", "기구": "ICCAT·IOTC", "소유사": "ALBACORA, S.A."},
    {"선명": "GALERNA LAU", "gt": 3206, "선적": "모리셔스", "기구": "IOTC", "소유사": "Integral Fishing Services"},
    {"선명": "MAR DE SERGIO", "gt": 2767, "선적": "스페인", "기구": "WCPFC·IATTC", "소유사": "ALBACORA, S.A."},
    {"선명": "ROSITA C", "gt": 2502, "선적": "스페인", "기구": "WCPFC·IATTC", "소유사": "Atunera Dularra SL"},
    {"선명": "AURORA B", "gt": 2479, "선적": "스페인", "기구": "WCPFC·IATTC", "소유사": "Atunera Dularra SL"},
    {"선명": "ALBACORA QUINCE", "gt": 2336, "선적": "스페인", "기구": "ICCAT", "소유사": "(공란)"},
    {"선명": "ALBACORA CARIBE", "gt": 2136, "선적": "파나마", "기구": "ICCAT", "소유사": "Integral Fishing Services"},
    {"선명": "ALBACORA CUATRO", "gt": 2082, "선적": "스페인", "기구": "ICCAT·IOTC", "소유사": "Cía. Europea de Túnidos"},
    {"선명": "CAPE CORAL", "gt": 2072, "선적": "모리셔스", "기구": "IOTC", "소유사": "Integral Fishing Services"},
]

CATCH = [
    {"연도": 2024, "톤": 207000},
    {"연도": 2025, "톤": 200000},
]

# 어획물 판매처 비중(%). 회사 자료.
SALES_DEST = [
    {"판매처": "에콰도르 · 과테말라", "비중": 30, "비고": "자사 Posorja 공장이 있는 축"},
    {"판매처": "세이셸 · 모리셔스 · 마다가스카르", "비중": 25, "비고": "인도양 양륙 거점"},
    {"판매처": "스페인", "비중": 10, "비고": "자사 베르메오·갈리시아 공장"},
    {"판매처": "기타", "비중": 35, "비고": "회사 미명시"},
]

MONITORING = [
    {"장치": "옵서버", "내용": "선단 100% 커버리지 — 외부 옵서버 승선"},
    {"장치": "원격 관찰 (REM)", "내용": "2014년 말부터 전 선단 상시 가동. 작업구역 한정(사생활 존중 명시)"},
    {"장치": "VMS", "내용": "스페인 당국 · RFMO · 회사 자체 VMS 3중"},
    {"장치": "해상 전재", "내용": "없음(ausencia de transbordos en la mar) — 회사 명시"},
    {"장치": "즉시 동결", "내용": "어획 즉시 선상 동결"},
]

# ── 04 가공 ──

# 가공 3사. 매출 단위 M€. EINF 2025.
PLANTS = [
    {"플랜트": "SIA 베르메오", "직원": 138, "y2025": 65.8, "y2024": 67.6,
     "품목": "캔 (bonito del norte · atún claro), 유리병(외주), 홍합(외주 라벨링)",
     "주시장": "스페인·독일·이탈리아"},
    {"플랜트": "SAC 갈리시아", "직원": 68, "y2025": 15.7, "y2024": 14.2,
     "품목": "냉동 필레·로인·ventresca·타코·다이스, 빵가루·버거·미트볼",
     "주시장": "스페인·이탈리아"},
    {"플랜트": "SAE 포소르하", "직원": 2358, "y2025": 233.3, "y2024": 223.8,
     "품목": "자숙·생냉동 로인, 캔, 파우치, 통냉동 원어 벌크, (미주용) 훈제·샐러드·정어리",
     "주시장": "스페인·에콰도르·아르헨티나·칠레·독일"},
]

# SIA 베르메오 정육 참치 투입량(톤). EMAS 환경선언 — 법정 공개 문서.
SIA_TONNAGE = [
    {"연도": 2022, "톤": 2508, "전년비": None},
    {"연도": 2023, "톤": 1395, "전년비": -44.0},
    {"연도": 2024, "톤": 1459, "전년비": 4.6},
]

# SAC 갈리시아 원료 → 제품(톤) 및 수율(%). EMAS 환경선언.
SAC_YIELD = [
    {"연도": 2020, "원료": 4039, "제품": 2905, "수율": 71.9},
    {"연도": 2021, "원료": 6335, "제품": 4015, "수율": 63.4},
    {"연도": 2022, "원료": 5965, "제품": 3833, "수율": 64.3},
    {"연도": 2023, "원료": 3582, "제품": 2602, "수율": 72.6},
]

# ── 05 브랜드 · 인증 ──

BRANDS = [
    {"브랜드": "CAMPOS", "성격": "1921년 창립. 베르메오 전통 브랜드, 1990년 합병 때 Salica 승계. 리테일+푸드서비스+냉동 전 라인. 자사몰 clubcampos.com"},
    {"브랜드": "BACHI", "성격": "리테일 + 푸드서비스 캔"},
    {"브랜드": "AIKO · ASTOR", "성격": "푸드서비스 전용"},
    {"브랜드": "MDD", "성격": "유통 자체브랜드(PL) 수탁"},
]

# Campos 자사몰 실측 가격(EUR). 차트용으로 단일가 품목만 골랐다 — 전체 26 SKU 중 발췌.
CAMPOS_PRICES = [
    {"제품": "Bonito Oliva 70g", "가격": 1.70, "축": "소용량"},
    {"제품": "Atún Claro APR Natural 160g", "가격": 2.20, "축": "APR"},
    {"제품": "Atún Claro APR Escabeche 160g", "가격": 2.59, "축": "APR"},
    {"제품": "Sardinillas Oliva 115g", "가격": 3.00, "축": "소용량"},
    {"제품": "Atún Claro APR Oliva 150g", "가격": 3.20, "축": "APR"},
    {"제품": "Atún Claro APR AOVE 3×65g", "가격": 3.80, "축": "APR"},
    {"제품": "Bonito Oliva 150g", "가격": 3.99, "축": "소용량"},
    {"제품": "Atún Claro Oliva 180g", "가격": 4.99, "축": "소용량"},
    {"제품": "Bonito De Campaña 2024 Oliva 314g", "가격": 7.99, "축": "한정판"},
    {"제품": "Atún Claro Oliva 750g", "가격": 12.99, "축": "대용량"},
    {"제품": "Cesta Gourmet Aritzatxu (선물세트)", "가격": 21.60, "축": "한정판"},
    {"제품": "Atún Claro Escabeche 1900g", "가격": 23.50, "축": "대용량"},
    {"제품": "Atún Claro Girasol 1900g", "가격": 29.50, "축": "대용량"},
    {"제품": "Bonito MSC en salsa 1900g", "가격": 30.00, "축": "MSC 대용량"},
    {"제품": "Bonito MSC Escabeche 1900g", "가격": 33.99, "축": "MSC 대용량"},
    {"제품": "Bonito MSC Oliva 1850g", "가격": 49.99, "축": "MSC 대용량"},
]

CERTS = [
    {"플랜트": "SIA 베르메오", "msc": "MSC-C-50318 · Kiwa AS · 최초 2007-07-17 (게시본 만료 2025-10-27)",
     "apr": "APR.CDC-2019/0005 ~2028-04-25", "brc": "FOOD-ES-0099 ~2027-02-23", "ifs": "FOOD-ESP-0207 · 97.38% Higher"},
    {"플랜트": "SAC 갈리시아", "msc": "MSC-C-50421 · Kiwa AS · 최초 2007-10-17 ~2028-10-16",
     "apr": "APR.CDC-2019/0010 ~2028-09-24", "brc": "0150958 Intertek · AA+ unannounced", "ifs": "2026-C768729 · 98.30% Higher"},
    {"플랜트": "SAE 포소르하", "msc": "MSC-C-51218 · LRQA · 2024-07-18~2027-07-17 Single Site",
     "apr": "APR.CDC-2019/006 · EU 인가 UE-626", "brc": "BRC 2220 WQS · AA+ unannounced", "ifs": "IFS 1120 · 97.72% Higher"},
]

# AGAC Integral Purse Seine Tropical Tuna Fishery — Atlantic & Indian Oceans.
MSC_UNITS = [
    {"유닛": "황다랑어 대서양 + 인도양", "상태": "인증"},
    {"유닛": "가다랑어 인도양 + 대서양", "상태": "인증"},
    {"유닛": "눈다랑어 2유닛", "상태": "ITM (개선프로그램)"},
    {"유닛": "동태평양(EPO) 유닛", "상태": "철회 (withdrawn)"},
]

SUSTAIN = [
    {"항목": "APR", "내용": "UNE 195006:2016 «Atún de Pesca Responsable» 선망냉동선 — 그룹 100%"},
    {"항목": "ISSF", "내용": "PVR + VOSI 등재 — 보존조치 자발적 준수"},
    {"항목": "Dolphin Safe", "내용": "2025년부터 전 선박 (Earth Island Institute)"},
    {"항목": "옵서버 · REM", "내용": "100% + 2014년 말부터 전 선단 원격관찰"},
    {"항목": "FAD", "내용": "ISSF CM 3.7 관리정책 공개 · Opagac 주도 동태평양 FAD 회수 동맹 서명"},
    {"항목": "추적성", "내용": "Compromiso Tuna 2020(WEF) 서명 · salica.es/trazabilidad 로트 조회 툴"},
]

# ── 06 재무 · 리스크 ──

FINANCIALS = [
    {"항목": "그룹 연결 매출", "값": "약 €5.0억", "기준": "2023 · CEO 발언 (EFEAgro 2024-04)", "등급": "매체"},
    {"항목": "가공 3사 합계", "값": "약 €250M", "기준": "2025 · EINF", "등급": "공시"},
    {"항목": "2024 그룹 방향", "값": "스페인 감소 · 에콰도르 급성장으로 팬데믹 이전 회복", "기준": "언론", "등급": "매체"},
    {"항목": "2025 개별 방향", "값": "매출 +5% · EBITDA −65% · 순이익 −7%", "기준": "신용정보 방향치 — 절대액 없음", "등급": "방향치"},
    {"항목": "개별 직원", "값": "340명", "기준": "2024 계정", "등급": "공시"},
    {"항목": "업종 순위", "값": "CNAE 0311 전국 1위", "기준": "2위권 Atuneros Congeladores · Inpesca", "등급": "공시"},
    {"항목": "공적 보조금", "값": "€64M (연결, 2025)", "기준": "EINF — 회사는 «비중대» 평가", "등급": "공시"},
]

# 산업안전 지표. 스페인 INSHT 공식 기준 — 타이유니온 LTIFR 과 체계가 달라 직접 비교 불가.
SAFETY = [
    {"지표": "재해 빈도율", "여성": 14.15, "남성": 14.41},
    {"지표": "재해 중대도", "여성": 0.53, "남성": 1.00},
    {"지표": "사고 건수", "여성": 29, "남성": 80},
    {"지표": "직업병", "여성": 0, "남성": 0},
]

RISKS = [
    {"시점": "2019-07", "건": "투자중재 패소",
     "내용": "PCA/UNCITRAL. 스페인-에콰도르 BIT 원용, Posorja 자유무역지대 과세 관련 ~$56M 청구가 전부 기각 + 중재비 2/3·상대 소송비 50% 부담"},
    {"시점": "2022", "건": "ALBACORA CUATRO 폭발", "내용": "세이셸. 사망 2명, 암모니아 누출 추정"},
    {"시점": "2023~", "건": "베르메오 ERTE 장기화", "내용": "노조 법원 이의제기. 인력 200명대 → 160명. «조직 부실·주문형 유연성» 비판"},
    {"시점": "2024~25", "건": "Atunlo 파산 연쇄", "내용": "Euskaltuna → Inpesca 간접지분 경유 약 €5M 손실. 주주간 채무배분 갈등. Atunlo 청산 수순"},
    {"시점": "2024-04", "건": "SRI 로비 의혹", "내용": "前 감사원장(부패 유죄)이 에콰도르 국세청 분쟁에 개입했다는 보도 — 보도 단계"},
    {"시점": "—", "건": "매각설", "내용": "보도된 바 없다. 방향은 내부합병·세대교체·에콰도르 증설"},
    {"시점": "—", "건": "노동", "내용": "ITF·UGT와 비EU 선원 단체협약 체결 홍보 중"},
]

# ── 07 한국 관점 ──

TRADE_THREAT = [
    {"회사": "Thai Union 🇹🇭", "위협": "미국 관세 — 수침 캔참치 31.5%",
     "대응": "대미 물량을 태국 → 가나·세이셸로 전환 + 미국 국적선 조달 확대"},
    {"회사": "Albacora 🇪🇸", "위협": "EU-아세안 FTA — 인도네시아 발효·태국 협상 중",
     "대응": "인증 차별화(APR 100%·MSC 확대) + 에콰도르 증설"},
    {"회사": "Frinsa 🇪🇸", "위협": "—", "대응": "EU 관세 구조를 «가공도가 세율을 정한다»로 활용"},
]

OVERLAP = [
    {"번호": 1, "축": "같은 어법 · 같은 어장",
     "내용": "열대참치 선망, 대서양·인도양·태평양 3대양. 한국 선단과 WCPFC·IOTC 같은 관할·같은 쿼터 체계 안에 있다"},
    {"번호": 2, "축": "판매처가 갈린다",
     "내용": "알바코라는 에콰도르·과테말라 30% · 세이셸/모리셔스/마다가스카르 25%. 한국 선단은 태국 54% — 대서양·인도양 축 vs 서태평양-방콕 축"},
    {"번호": 3, "축": "인증 문턱",
     "내용": "APR 100% · ISSF PVR/VOSI · 전 선박 Dolphin Safe · 옵서버 100% · 2014년부터 REM. 타이유니온이 공급자에게 요구하는 조건을 자기 선단으로 이미 충족한다"},
    {"번호": 4, "축": "수직통합",
     "내용": "잡아서 자기 공장(베르메오·갈리시아·포소르하)에 넣고 자기 브랜드(Campos)로 판다. 한국 선단이 «원어를 팔고 끝나는» 구조와 대비된다"},
]

OPEN_QUESTIONS = [
    {"물음": "한국 선단과의 WCPFC·IOTC 쿼터·조업구역 중첩", "왜": "«경쟁»이 실제로 어느 해역·어느 시기에 일어나는지"},
    {"물음": "ISSF PVR 한국 국적선 등재 수", "왜": "진입 문턱의 실측치. 알바코라는 전 선단이 등재돼 있다"},
    {"물음": "스페인·EU의 대한 참치 수출입 (HS 0303 / 1604)", "왜": "어장뿐 아니라 시장에서도 부딪히는지"},
    {"물음": "에콰도르 Posorja 허브 vs 방콕 허브", "왜": "재배치가 진행 중이라 물류 경쟁 구도가 움직인다"},
]

LIMITS = [
    {"항목": "연도별 매출 시계열 (그룹·개별)", "상태": "공개되지 않는다. 확인 가능한 것은 경영진이 밝힌 2023년 그룹 연결 약 5.0억 유로와 가공 3사 합계뿐"},
    {"항목": "참여회사 13개 명단 · 주주 2명 지분율", "상태": "등기·신용정보에 기재되지 않는다"},
    {"항목": "선단 18척 중 나머지 6척", "상태": "4개 기구 등록부에 미포착. 세이셸·에콰도르 기국 가능성"},
    {"항목": "Integral Fishing Services · Atunera Dularra 의 계열 관계", "상태": "선박·등록항을 공유하나 등기상 지분 관계는 공표되지 않았다"},
    {"항목": "Salica del Ecuador 처리 캐파", "상태": "EMAS 대상이 아니어서 스페인 2공장과 달리 물량이 공개되지 않는다"},
    {"항목": "SIA 의 MSC CoC 갱신 여부", "상태": "게시본이 2025-10-27 만료. 갱신 인증서는 미게시"},
    {"항목": "Campos 의 PL 공급 고객명", "상태": "회사가 «주요 리테일 체인»으로만 서술한다"},
]

META = {
    "회사": "Albacora, S.A. / Grupo Albacora",
    "국가": "스페인 (비스카야 베르메오)",
    "업종": "원양 선망어업 + 수산 가공 (CNAE 0311)",
    "출처": "신라교역 사내 조사보고서 — 알바코라 해부 (2026-08). 1차: 비재무정보보고서(EINF) 2025·2024 · EMAS 환경선언 · Salica 인증서 17건 · RFMO 4개 선박등록부 · 스페인 상업등기·BORME",
    "출처한계": "비상장 가족기업이라 매출 절대액이 공개되지 않는다. 2025년 «매출 +5% · EBITDA −65%»는 신용정보 기관의 방향치이지 절대액이 아니다. 선단은 회사 공표 18척 중 12척만 공적 등록부로 확인된다 — 나머지 6척은 추정하지 않았다.",
    "측정경계": "그룹 연결 / 가공 3사 합계 / 개별법인 세 층위를 표마다 명기한다. EMAS 물량은 스페인 2공장(SIA·SAC)만 대상이라 에콰도르 Posorja 는 빠져 있다 — 그룹 처리량으로 읽으면 틀린다.",
    "갱신방법": "python3 scripts/build_company_albacora.py",
}


def main() -> int:
    text = corpus()
    # 옮겨 적은 핵심 수치가 원문에 실재하는지 — 자릿수 오타를 기계로 잡는다.
    must = [
        # 01·02 개요·지배구조
        "A11902269", "1974-06-22", "11,748,240", "BI-78076",
        "3,770", "2026-07-22", "A48434781", "A15670748",
        # 03 선단
        "36,404", "4,428", "4,406", "3,584", "3,206", "2,767",
        "2,502", "2,479", "2,336", "2,136", "2,082", "2,072",
        "INTERTUNA TRES", "GALERNA LAU", "CAPE CORAL", "Atunera Dularra",
        "207천 톤", "30%", "25%",
        # 04 가공
        "65.8 M€", "233.3", "223.8", "67.6", "15.7", "14.2",
        "2,358", "138", "2,508 t", "1,395 t", "1,459 t",
        "6,335 t", "4,015 t", "3,582 t", "2,602 t", "72.6%", "63.4%",
        "EC090156", "UE-626",
        # 05 브랜드·인증
        "1921", "MSC-C-50318", "MSC-C-50421", "MSC-C-51218",
        "97.38%", "98.30%", "97.72%", "49.99", "29.50", "23.50", "21.60",
        "APR.CDC-2019/0005", "MSC-F-31556",
        # 06 재무·리스크
        "5.0억", "250M", "340명", "64M",
        "14.15", "14.41", "0.53", "192,386",
        "56M", "5M",
        # 07 한국
        "31.5%", "54%",
    ]
    missing = [m for m in must if m not in text]
    if missing:
        print("원문에 없는 수치:", missing, file=sys.stderr)
        return 1

    # 선단 합계는 계산으로 검증한다 — 표의 «36,404» 와 어긋나면 옮겨 적기가 틀린 것이다.
    gt_sum = sum(v["gt"] for v in FLEET)
    if gt_sum != 36404:
        print(f"선단 GT 합계 불일치: {gt_sum} != 36404", file=sys.stderr)
        return 1

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(
        json.dumps(
            {
                "_meta": META,
                "profile": PROFILE,
                "compare": COMPARE,
                "history": HISTORY,
                "succession": SUCCESSION,
                "affiliates": AFFILIATES,
                "fleet": FLEET,
                "catch": CATCH,
                "salesDest": SALES_DEST,
                "monitoring": MONITORING,
                "plants": PLANTS,
                "siaTonnage": SIA_TONNAGE,
                "sacYield": SAC_YIELD,
                "brands": BRANDS,
                "camposPrices": CAMPOS_PRICES,
                "certs": CERTS,
                "mscUnits": MSC_UNITS,
                "sustain": SUSTAIN,
                "financials": FINANCIALS,
                "safety": SAFETY,
                "risks": RISKS,
                "tradeThreat": TRADE_THREAT,
                "overlap": OVERLAP,
                "openQuestions": OPEN_QUESTIONS,
                "limits": LIMITS,
            },
            ensure_ascii=False,
            indent=1,
        )
        + "\n",
        encoding="utf8",
    )
    print("wrote", OUT, f"(선단 {len(FLEET)}척 · {gt_sum:,} GT)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
