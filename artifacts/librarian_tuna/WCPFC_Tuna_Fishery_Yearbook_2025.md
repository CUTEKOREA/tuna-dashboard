## 참치 Dashboard 위젯 핵심 데이터 및 신설/보완 제안

**1. 핵심 정량 데이터 (2024년 기준)**

*   **WCPFC 총 참치 어획량:**
    *   총 3,060,090톤 (Skipjack 2,146,139톤, Yellowfin 741,861톤, Bigeye 152,062톤, Albacore 120,405톤).
    *   (페이지 133, Table 93)
*   **WCPFC 선망 어획량:**
    *   총 2,146,139톤 (Skipjack 1,716,190톤, Yellowfin 376,533톤, Bigeye 50,118톤).
    *   (페이지 136, Table 96)
*   **WCPFC 연승 어획량:**
    *   총 248,434톤 (Albacore 98,422톤, Yellowfin 89,656톤, Bigeye 54,590톤, Skipjack 5,767톤).
    *   (페이지 134, Table 94)
*   **주요 어업국 어획량:**
    *   일본 총 306,255톤, 한국 총 307,497톤.
    *   (페이지 143, Table 100)
*   **WCPFC 연승 빌피쉬 어획량:**
    *   총 28,284톤 (Blue Marlin 12,534톤, Swordfish 11,237톤, Striped Marlin 3,693톤, Black Marlin 820톤).
    *   (페이지 159, Table 109)

---

**2. 위젯 신설/보완 후보**

**1. WCPFC 참치 어종별 어획량 추이**
    *   **chartType:** Composed
    *   **데이터 포인트 (2020-2024):**
        *   2020: Skipjack 1,714,955톤, Yellowfin 408,639톤, Bigeye 147,165톤, Albacore 127,300톤
        *   2021: Skipjack 1,715,792톤, Yellowfin 412,864톤, Bigeye 147,385톤, Albacore 90,083톤
        *   2022: Skipjack 1,753,614톤, Yellowfin 341,314톤, Bigeye 152,859톤, Albacore 92,587톤
        *   2023: Skipjack 1,673,631톤, Yellowfin 426,682톤, Bigeye 148,710톤, Albacore 110,591톤
        *   2024: Skipjack 2,146,139톤, Yellowfin 741,861톤, Bigeye 152,062톤, Albacore 120,405톤
    *   **SIT:** 2024년 WCPFC 총 참치 어획량은 3,060,090톤으로, Skipjack이 2,146,139톤(70.1%)으로 압도적 비중을 차지합니다. Yellowfin은 741,861톤(24.2%), Bigeye는 152,062톤(5.0%), Albacore는 120,405톤(3.9%)을 기록했습니다.
    *   **TAK:** 참치 어종별 어획량 추이를 지속적으로 모니터링하여 특정 어종의 과도한 어획을 방지하고, 생태계 균형을 위한 어획량 제한 조치를 제안해야 합니다.
    *   **source:** "TFY 2025"

**2. 주요 어업국 선망 어획량 비교**
    *   **chartType:** Bar
    *   **데이터 포인트 (2024, Skipjack/Yellowfin/Bigeye):**
        *   PNG: Skipjack 192,525톤, Yellowfin 122,810톤, Bigeye 2,652톤
        *   한국: Skipjack 231,463톤, Yellowfin 41,984톤, Bigeye 3,450톤
        *   대만: Skipjack 201,984톤, Yellowfin 24,335톤, Bigeye 3,930톤
        *   FSM: Skipjack 162,212톤, Yellowfin 23,288톤, Bigeye 3,554톤
        *   미국: Skipjack 52,919톤, Yellowfin 4,693톤, Bigeye 5,684톤
    *   **SIT:** 2024년 WCPFC 선망 어획량은 PNG(319,093톤), 한국(276,961톤), 대만(230,348톤) 순으로 높습니다. 이들 국가의 선망 어획량은 전체 WCPFC 선망 어획량의 상당 부분을 차지하며, 특히 Skipjack 어획에 집중되어 있습니다.
    *   **TAK:** 주요 선망 어업국의 어획량 데이터를 분석하여 각국의 어업 관행을 평가하고, 지속 가능한 어업을 위한 국제 협력 및 규제 강화 방안을 모색해야 합니다.
    *   **source:** "TFY 2025"

**3. WCPFC 연승 빌피쉬 어획량 추이**
    *   **chartType:** Composed
    *   **데이터 포인트 (2020-2024, Blue Marlin/Swordfish/Striped Marlin/Black Marlin):**
        *   2020: Blue Marlin 8,162톤, Swordfish 14,639톤, Striped Marlin 2,925톤, Black Marlin 870톤
        *   2021: Blue Marlin 7,784톤, Swordfish 14,109톤, Striped Marlin 2,717톤, Black Marlin 996톤
        *   2022: Blue Marlin 7,917톤, Swordfish 13,516톤, Striped Marlin 2,309톤, Black Marlin 920톤
        *   2023: Blue Marlin 8,986톤, Swordfish 13,821톤, Striped Marlin 2,957톤, Black Marlin 735톤
        *   2024: Blue Marlin 12,534톤, Swordfish 11,237톤, Striped Marlin 3,693톤, Black Marlin 820톤
    *   **SIT:** 2024년 WCPFC 연승 어업의 빌피쉬 어획량은 총 28,284톤으로, Blue Marlin이 12,534톤(44.3%)으로 가장 많았고, Swordfish 11,237톤(39.7%), Striped Marlin 3,693톤(13.1%), Black Marlin 820톤(2.9%) 순입니다.
    *   **TAK:** 연승 어업의 빌피쉬 혼획량 추이를 면밀히 분석하여 혼획 저감 장치 도입 및 어업 규제 강화 등 해양 생태계 보호를 위한 구체적인 정책 제안을 추진해야 합니다.
    *   **source:** "TFY 2025"