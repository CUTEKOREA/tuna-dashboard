#!/usr/bin/env python3
"""아홉 편에 넣을 차트 정본. 그 편의 핵심 주장을 그림으로 옮긴 것만 — 편마다 리스트다.

⚠ **캡션의 정본은 이 파일이다.** 발행본 HTML 에서 캡션을 고쳐도 다음 차트 재생성이 덮는다.
감사 지적이 HTML span 으로 오더라도 고칠 자리는 여기다.

캡션은 **그림이 실제로 보여 주는 것**을 말해야 한다. 2차 감사가 잡은 결함이
「캡션이 차트를 반박한다」였다(tunacompany §3.5).
값의 범위를 하한으로 그릴 때는 캡션에 그렇게 적는다.
"""
from __future__ import annotations

from make_report_chart import bars, figure

# 편별 팔레트 — 보고서 `:root` 에서 그대로 가져온다(강조색, 대비색)
PALETTE = {
    "jais": ("#0F7A8A", "#A9541F"),
    "itochu": ("#1F3A5F", "#A8243A"),
    "bolton": ("#17456E", "#9A6B12"),
    "thaiunion": ("#1B3A5C", "#A9762E"),
    "frinsa": ("#3E5C6B", "#A8442A"),
    "albacora": ("#1F5D4C", "#A32A2A"),
    "frabelle": ("#0F3F7A", "#B8860B"),
    "fcf": ("#0F7A8A", "#C2622B"),
}

SPEC: dict[str, list[dict]] = {
    "jais": [dict(
        sid="s4",
        rows=[("2018–10", 43, "plain"), ("2019–06", 43, "plain"), ("2020–03", 42, "plain"),
              ("2022–12", 32, "hot"), ("2023–04", 12, "hot"), ("2023–11 이후", 0, "hot")],
        unit="Friend of the Sea 승인선박 명부의 JAIS 등재행",
        note="JAIS 등재행이 43행에서 0행으로 줄어드는 과정",
        caption="이 회사는 자기 문서가 아니라 <b>남의 명부에 한 줄로</b> 존재했다. 그 줄이 사라지는 과정이다 — "
                "마지막 막대는 <b>0행</b>이고, 눈에 보이라고 최소 폭으로만 그렸다. 같은 명부에서 FCF는 34척 전부 유효하다.",
    ), dict(
        sid="s6b",
        rows=[("필리핀", 179, "plain"), ("가나", 51, "plain"),
              ("인도네시아", 43, "plain"), ("에콰도르", 11, "hot")],
        unit="상용 무역데이터가 센 누적 수입 선적 (건) · 합계 284",
        note="원산지별 수입 선적 건수 — 필리핀 179, 가나 51, 인도네시아 43, 에콰도르 11",
        caption="<b>건수로 보면 필리핀이 3분의 2</b>(63.03%)다. 붉은 막대가 <b>에콰도르</b>인데, "
                "건수로는 열한 건으로 꼴찌이면서 최근 1년을 <b>금액</b>으로 재면 <b>68.89%로 1위</b>가 된다. "
                "선적 한 건의 무게가 두 축에서 다를 수 있다는 정도까지 읽히고, "
                "벤더가 건당 물량을 공개하지 않으므로 그 이상은 말할 수 없다.",
        log=False,
        label_w=110,
    )],
    "itochu": [dict(
        sid="s4",
        rows=[("대만", 12, "plain"), ("한국", 6, "hot"), ("키리바시", 3, "hot"),
              ("투발루", 2, "plain"), ("바누아투", 2, "hot")],
        unit="ITOCHU 인증 선단 25척의 기국 구성 (척)",
        note="기국별 척수 — 대만 12, 한국 6, 키리바시 3, 투발루 2, 바누아투 2",
        caption="배를 한 척도 갖지 않은 회사의 인증 선단이다. 짙은 색으로 표시한 <b>사조 계열 11척(44%)</b>은 "
                "한국 6, 키리바시 3, 바누아투 2로 흩어져 있다. 선단 명단을 열자 절반이 한 그룹이었다.",
    )],
    "bolton": [dict(
        sid="s3",
        rows=[("FY2022", 3269, "plain"), ("FY2023", 3267, "plain"), ("FY2024", 3528, "hot"),
              ("FY2025", 3541, "hot")],
        unit="그룹 카테고리 합계 매출 (M€)",
        note="FY2022 3,269 · FY2023 3,267 · FY2024 3,528 · FY2025 3,541 M€",
        caption="회사는 이 숫자를 「<b>€3.2 Billion 이상</b>」처럼 어림수로만 말한다. 위 값은 카테고리를 더한 것이다. "
                "네 해 동안 실질 증가는 <b>2024년 한 해</b>에 몰려 있고(+8.1%) 2025년은 +0.4%다. "
                "연결 순부채·EBITDA·브랜드별 매출은 그 어느 쪽에도 없다.",
    ), dict(
        sid="s4",
        rows=[("이탈리아", 28.6, "hot"), ("기타 유럽", 18.5, "plain"), ("남미", 13.9, "plain"),
              ("북·중미", 10.2, "plain"), ("아시아", 7.8, "plain"), ("프랑스", 7.2, "plain"),
              ("스페인", 5.6, "plain"), ("독일", 4.3, "plain"), ("아프리카", 3.0, "plain"),
              ("오세아니아", 0.9, "plain")],
        unit="2025년 지역별 매출 비중 (%) · 합계 100.0",
        note="지역별 매출 비중 — 이탈리아 28.6%에서 오세아니아 0.9%까지",
        caption="본거지가 가장 크지만 <b>2019년 39.5%에서 28.6%로</b> 내려왔다. 같은 기간 기타 유럽이 "
                "13.7%→18.5%로 올라갔고, 2022년에야 표에 등장한 남미·북중미가 지금 셋째·넷째 자리를 차지한다. "
                "이탈리아 회사의 매출 <b>일곱에 다섯은 이탈리아 밖</b>에서 나온다.",
        log=False,
    ), dict(
        sid="s6",
        rows=[("Skipjack 가다랑어", 462406, "plain"), ("Yellowfin 황다랑어", 215556, "hot"),
              ("Bigeye 눈다랑어", 35418, "plain"), ("Albacore 날개다랑어", 26930, "plain")],
        unit="2025년 어종별 조달량 (t) · 합계 740,310",
        note="2025년 어종별 조달량 — 가다랑어 462,406 t에서 날개다랑어 26,930 t까지",
        caption="한 해 전만 해도 가다랑어가 <b>79%</b>였다. 2025년에 62%로 내려오고 황다랑어가 16%→29%로 올라왔다 — "
                "물량으로는 가다랑어 <b>96,803 t 감소</b>, 황다랑어 <b>102,616 t 증가</b>다. 총량은 5%만 늘었으니 "
                "이건 성장이 아니라 <b>어종 교체</b>다. 회사는 동태평양 어황을 이유로 든다.",
        log=False,
        label_w=132,
    ), dict(
        sid="s4b",
        rows=[("Cuca 올리브유 6×48 g", 48.99, "hot"), ("Cuca 올리브유 3×67 g", 46.27, "hot"),
              ("Cuca 채낚기 3×50 g", 44.80, "hot"), ("Cuca 필레 180 g", 43.61, "hot"),
              ("Cuca AOVE 3×67 g", 37.26, "hot"), ("Isabel 해바라기유 260 g", 23.08, "plain"),
              ("Rio Mare 올리브유 3×80 g", 20.79, "plain"), ("Isabel 3×52 g", 19.81, "plain"),
              ("Isabel 6×52 g", 18.53, "plain"), ("Saupiquet 400 g", 13.98, "plain"),
              ("Saupiquet 800 g", 12.31, "plain"),
              ("스페인 가계 평균 (전 브랜드)", 10.09, "mut")],
        unit="소매 매대 €/kg · 2026-09-05 · 맨 아래는 브랜드 무관 배경선",
        note="브랜드별 €/kg — Cuca 48.99에서 Saupiquet 12.31까지, 스페인 가계 평균 10.09",
        caption="같은 그룹의 <b>네 상표</b>가 <b>12.31 €/kg에서 48.99 €/kg까지</b> 흩어져 있다 — 네 배다. "
                "위쪽 다섯 칸이 전부 <b>Cuca</b>이고, Isabel·Rio Mare가 가운데, Saupiquet가 맨 아래다. "
                "회색 막대는 브랜드가 아니라 <b>스페인 가계가 실제로 지불하는 평균</b>(2024)이고 비교 기준으로만 그렸다.",
        log=False,
        label_w=175,
    )],
    "thaiunion": [dict(
        sid="s3",
        rows=[("1997 Chicken of the Sea", 1, "plain"), ("2010 MW Brands 4개", 4, "hot"),
              ("2014 King Oscar", 1, "plain"), ("2016·2021 독일 2개", 2, "plain")],
        unit="한 거래로 들어온 브랜드 수",
        note="인수 건별 브랜드 수 — 2010년 MW Brands 한 건이 4개",
        caption="<b>2010년 한 건이 네 브랜드를 한꺼번에 데려왔다</b> — MW Brands 인수로 John West·Petit Navire·"
                "Parmentier·Mareblu가 함께 들어왔다. 노르웨이의 King Oscar는 그 뒤 2014년, 독일 두 건은 2016·2021년이다. "
                "「2010년 한 해에 유럽을 샀다」는 요약은 이 분포를 뭉갠다.",
    )],
    "frinsa": [dict(
        sid="s3",
        rows=[("5 · 한정판 참다랑어 뱃살", 220.83, "hot"), ("4 · 백참치 뱃살", 99.58, "plain"),
              ("3 · 백참치 몸살", 29.75, "plain"), ("2 · 황다랑어 올리브유", 21.25, "plain"),
              ("1 · 대중 Ribeira 3×52 g", 17.56, "plain")],
        unit="소비자가 환산 €/kg · 범위가 있는 층은 하한",
        note="층별 €/kg — 220.83에서 17.56까지",
        caption="같은 회사가 <b>€17.56에서 €220.83까지</b> 판다 — <b>12.6배</b>다. 3·1층은 가격대가 범위여서 하한을 그렸다. "
                "가로축이 로그 눈금인 이유가 여기 있다. 산술 눈금이면 아래 세 층이 한 줄로 뭉개진다.",
    )],
    "albacora": [dict(
        sid="s3",
        rows=[("INTERTUNA TRES 🇵🇦", 4428, "hot"), ("ALBATUN TRES", 4406, "plain"),
              ("ALBATUN DOS", 4406, "plain"), ("ALBACORA UNO", 3584, "plain"),
              ("GALERNA LAU 🇲🇺", 3206, "hot"), ("MAR DE SERGIO", 2767, "plain"),
              ("ROSITA C — Bolton", 2502, "mut"), ("AURORA B — Bolton", 2479, "mut"),
              ("ALBACORA QUINCE", 2336, "plain"), ("ALBACORA CARIBE 🇵🇦", 2136, "hot"),
              ("ALBACORA CUATRO", 2082, "plain"), ("CAPE CORAL 🇲🇺", 2072, "hot")],
        unit="Bermeo 등록항을 쓰는 12척의 GT · Albacora 계열 10척 합계 31,423",
        note="선박별 GT — 4,428에서 2,072까지. 회색 두 척은 Bolton 그룹",
        caption="회색 <b>두 척은 Albacora 배가 아니다</b> — 인증 명부가 소유사를 Atunera Dularra로, "
                "<b>그룹을 Bolton Food로</b> 적는다. 같은 Bermeo 등록항과 선명 규칙을 쓰지만 그룹이 다르다. "
                "그 둘을 빼면 <b>10척 31,423 GT</b>다. 짙은 색 <b>4척은 스페인 국기를 달지 않고</b>(파나마 2 · 모리셔스 2) "
                "<b>11,842 GT</b>로 그 10척의 <b>37.7%</b>이며, <b>가장 큰 배가 그중 하나</b>다.",
        label_w=185,
), dict(
        sid="s5b",
        rows=[("Bonito 올리브유 110 g", 29.09, "hot"), ("Atún Claro 올리브유 180 g", 27.72, "plain"),
              ("Bonito MSC 올리브유 1,850 g", 27.02, "hot"), ("Bonito 올리브유 150 g", 26.60, "hot"),
              ("Bonito 에스카베체 266 g", 25.15, "hot"), ("Bonito 에스카베체 160 g", 24.94, "hot"),
              ("Bonito 올리브유 70 g", 24.29, "hot"), ("Atún Claro APR 올리브유 150 g", 21.33, "plain"),
              ("Bonito MSC 에스카베체 1,900 g", 17.89, "hot"), ("Atún Claro 올리브유 750 g", 17.32, "plain"),
              ("Atún Claro APR 에스카베체 160 g", 16.19, "plain"), ("Bonito MSC 살사 1,900 g", 15.79, "hot"),
              ("Atún Claro 해바라기유 1,900 g", 15.53, "plain"), ("Atún Claro APR 자연산 160 g", 13.75, "plain"),
              ("Atún(가다랑어) 해바라기유 400 g", 13.00, "mut"), ("Atún Claro 에스카베체 1,900 g", 12.37, "plain"),
              ("Atún Claro 에스카베체 266 g", 12.18, "plain")],
        unit="자사몰 단위가 환산 €/kg · 2026-08-20 수집분",
        note="SKU별 €/kg — 29.09에서 12.18까지, 붉은색이 날개다랑어",
        caption="붉은색이 <b>Bonito del Norte(날개다랑어)</b>, 초록색이 <b>Atún Claro(황다랑어·눈다랑어)</b>, "
                "회색 한 칸이 <b>Atún(가다랑어)</b>이다 — 공장 표기를 그대로 따랐다. "
                "날개다랑어 아홉 개의 중앙값은 <b>25.15</b>, 황다랑어 아홉 개는 <b>15.53</b>으로 <b>1.6배</b> 차이다. "
                "위쪽에 날개다랑어가 몰려 있고 아래를 황다랑어가 채우는데, <b>예외가 하나</b> 있다 — "
                "둘째 칸의 황다랑어 올리브유 180 g(27.72)이 <b>날개다랑어 일곱 개보다 비싸다.</b> "
                "막대는 열일곱인데 참치 SKU 는 열아홉이다 — 한정판 하나를 빼고, 값이 같은 두 SKU 를 한 줄로 묶었다.",
        log=False,
        label_w=195,
    )],
    "frabelle": [dict(
        sid="s7",
        rows=[("General Tuna", 200, "plain"), ("Philbest Canning", 200, "plain"),
              ("Seatrade Canning", 120, "plain"), ("Alliance Select", 90, "plain"),
              ("Celebes Canning", 75, "plain"), ("Ocean Canning", 45, "plain"),
              ("Frabelle 계열", 0, "hot")],
        unit="제너럴산토스 캐너리 일일 처리능력 (MT) · 범위 공개분은 하한",
        note="캐너리별 일일 처리능력 — 200에서 45까지, Frabelle 계열은 0",
        caption="제너럴산토스의 여섯 캐너리가 하루 <b>730 MT 이상</b>을 돌린다(범위로 공개된 곳은 하한을 썼다). "
                "맨 아래는 <b>0</b>이다 — 선단 기지와 하역 부두는 있으나 BFAR의 EU 승인 가공장 명단에 계열 명칭이 없다. "
                "잡는 쪽과 조리는 쪽이 갈려 있다.",
        label_w=170,
    )],
    "fcf": [dict(
        sid="s8",
        rows=[("FY2024", 50.07, "hot"), ("FY2025", 41.10, "plain"),
              ("2025 상반기", 37.71, "plain"), ("2026 상반기", 38.53, "plain")],
        unit="신라교역 연결 총수익 중 「고객 A」의 몫 (%) · 재작성 후 기준",
        note="고객 A 비중 — FY2024 50.07%, FY2025 41.10%, 2025 상반기 37.71%, 2026 상반기 38.53%",
        caption="상대편 공시에서 역산한 값이다. <b>FY2024에 절반을 넘었고</b>(50.07%) 이듬해 41.10%로 내려온다. "
                "반기 값 둘은 연간과 기간이 달라 같은 선상에서 읽으면 안 된다 — 그 둘끼리만 비교한다.",
        label_w=125,
    )],
}


def build(key: str) -> list[tuple[str, str]]:
    """편마다 [(sid, figure html), …] 을 낸다. 한 편에 둘 이상 붙을 수 있다."""
    accent, hot = PALETTE[key]
    out = []
    for sp in SPEC[key]:
        svg = bars(sp["rows"], unit=sp["unit"], note=sp["note"],
                   label_w=sp.get("label_w", 150), accent=accent, hot=hot,
                   log=sp.get("log"))
        out.append((sp["sid"], figure(svg, sp["caption"])))
    return out
