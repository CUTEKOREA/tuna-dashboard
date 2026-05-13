import json
import os

file_path = "/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/public/data/shrimp_real_data_v3.json"

with open(file_path, "r", encoding="utf-8") as f:
    data = json.load(f)

new_widgets = [
    {
        "id": "w19_hyperspectral",
        "title": "가공 혁신: AI 초분광 이미징(Hyperspectral) 비파괴 품질 검증 비교",
        "chartType": "bar",
        "xAxis": "지표",
        "series": [
            {"key": "전통적 검사", "color": "#94a3b8"},
            {"key": "AI 초분광", "color": "#a855f7"}
        ],
        "data": [
            {"지표": "비파괴 검사율(%)", "전통적 검사": 5.0, "AI 초분광": 100.0},
            {"지표": "미생물/산화 탐지율(%)", "전통적 검사": 60.0, "AI 초분광": 96.5},
            {"지표": "검사 속도(시간당 처리량)", "전통적 검사": 1500, "AI 초분광": 25000}
        ],
        "methodology": "NotebookLM 소스 기반: 600~700nm 대역 파장 활용 미생물/산화 비파괴 측정 기술 연구. 기존 샘플링 방식과 AI 처리량 1:1 교차 비교.",
        "situation": "글로벌 B2B 클라이언트의 품질 클레임 비용이 가공 원가의 15%를 잠식. 기존 파괴식 샘플링 방식은 정상 개체 99%를 폐기하는 비효율 초래.",
        "takeaway": "AI 초분광(Hyperspectral) 이미징 도입 시 비파괴율 100% 보장. 실시간으로 부패 및 미생물 증식을 탐지해 '품질 리스크 제로(Zero Claim)' 가공망 실현."
    },
    {
        "id": "w20_fcr_80",
        "title": "급여 패러다임 붕괴: 사료 80% 제한 및 바이오플락(Biofloc) 최적화",
        "chartType": "bar",
        "xAxis": "양식 방식",
        "series": [
            {"key": "FCR(사료요구율)", "color": "#10b981"}
        ],
        "data": [
            {"양식 방식": "일반 (100% 무제한 급여)", "FCR(사료요구율)": 1.93},
            {"양식 방식": "80% 포만감 제한 급여", "FCR(사료요구율)": 1.64},
            {"양식 방식": "정밀 IoT 자동급이기", "FCR(사료요구율)": 1.35},
            {"양식 방식": "첨단 바이오플락(Biofloc)", "FCR(사료요구율)": 1.09}
        ],
        "methodology": "NotebookLM 소스 기반: 동일 종(Vannamei)에 대한 사료 급여 통제 실험 결과. Biofloc 적용 시 병원균 억제와 사료전환율 극대화 수치 데이터화.",
        "situation": "사료 원재료비 폭등으로 사료비가 전체 생산 원가의 60% 점유. '많이 먹이면 빨리 큰다'는 기존 과다 급여(Over-feeding) 관행의 경제적 한계 도달.",
        "takeaway": "사료 투입량을 80%로 제한하기만 해도 FCR이 1.93에서 1.64로 하락. Biofloc 도입 시 FCR 1.09라는 충격적 마일스톤 달성으로 원가 40% 절감."
    },
    {
        "id": "w21_peeling_esg",
        "title": "공급망 시한폭탄: 최저임금 vs 단가 역전 및 아웃소싱 리스크",
        "chartType": "composed",
        "xAxis": "Year",
        "series": [
            {"key": "임금 인상률(%)", "color": "#ef4444", "type": "bar", "yAxisId": "left"},
            {"key": "단가 역전 위험 지수", "color": "#f59e0b", "type": "bar", "yAxisId": "left"},
            {"key": "수출 단가($/kg)", "color": "#cbd5e1", "type": "line", "yAxisId": "right"}
        ],
        "data": [
            {"Year": "2021", "임금 인상률(%)": 4.5, "수출 단가($/kg)": 7.12, "단가 역전 위험 지수": 20},
            {"Year": "2022", "임금 인상률(%)": 5.2, "수출 단가($/kg)": 6.80, "단가 역전 위험 지수": 35},
            {"Year": "2023", "임금 인상률(%)": 8.0, "수출 단가($/kg)": 5.93, "단가 역전 위험 지수": 65},
            {"Year": "2024", "임금 인상률(%)": 12.5, "수출 단가($/kg)": 5.76, "단가 역전 위험 지수": 95}
        ],
        "methodology": "NotebookLM 소스 기반: 2024년 에콰도르/인도 최저임금 인상률 곡선과 평균 냉동 새우 수출 단가 하락 곡선을 크로스체크하여 ESG 위험 지수 산출.",
        "situation": "인플레이션으로 생산국(에콰도르/인도 등) 최저임금은 두 자릿수 급등했으나, 글로벌 바이어의 혹독한 압박으로 수출가는 5달러대 추락.",
        "takeaway": "단가 방어를 위해 정규직 고용을 포기하고 가정 기반 '껍질 까기(Home-based Peeling)' 불법 아웃소싱 급증. EU CSDDD 발효 시 프리미엄 시장 강제 퇴출 타겟."
    },
    {
        "id": "w22_microalgae",
        "title": "집약화의 역설(폐사율 50%)과 미세조류(Microalgae) 사료 혁신",
        "chartType": "composed",
        "xAxis": "사육 밀도",
        "series": [
            {"key": "작물 실패율(%)", "color": "#ec4899", "type": "bar", "yAxisId": "left"},
            {"key": "미세조류 대체 수익성 Index", "color": "#38bdf8", "type": "line", "yAxisId": "right"}
        ],
        "data": [
            {"사육 밀도": "10(초저)", "작물 실패율(%)": 5.0, "미세조류 대체 수익성 Index": 20},
            {"사육 밀도": "30(저)", "작물 실패율(%)": 8.5, "미세조류 대체 수익성 Index": 35},
            {"사육 밀도": "80(중)", "작물 실패율(%)": 18.0, "미세조류 대체 수익성 Index": 55},
            {"사육 밀도": "150(고)", "작물 실패율(%)": 38.5, "미세조류 대체 수익성 Index": 85},
            {"사육 밀도": "250(초고)", "작물 실패율(%)": 52.0, "미세조류 대체 수익성 Index": 120}
        ],
        "methodology": "NotebookLM 소스 기반: 사육 밀도(m2당 마리수) 증가에 따른 스트레스/수질 악화 폐사율 50% 임계점 도달 연구 및 미세조류의 어분 대체 경제성 분석.",
        "situation": "물량 밀어내기식 초고밀도(Intensification) 사육은 질병 저항력을 상실시켜 결국 폐사율 50%라는 '집약화의 데스밸리(Death Valley)'에 직면.",
        "takeaway": "어분(Fishmeal, 톤당 $2,600)을 대체하는 미세조류(Microalgae) 배합 사료로 자본 이동. 수질 오염을 막는 바인더 젤 기술과 유전적 개량 중심의 2세대 양식업 개화."
    }
]

# Append only if they don't already exist
existing_ids = {w["id"] for w in data.get("widgets", [])}
for widget in new_widgets:
    if widget["id"] not in existing_ids:
        data["widgets"].append(widget)

with open(file_path, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("Widgets added successfully.")
