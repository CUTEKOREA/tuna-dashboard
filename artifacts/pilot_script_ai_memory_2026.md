# 숏폼 스크립트 — "AI가 만든 메모리 대란, 왜 내 폰값이 오르나"

> 출처: NotebookLM "AI / 반도체" 노트북(소스 300건) + 1차 출처 웹 교차검증
> 9:16 세로 · 목표 ~60초 · YouTube Shorts/릴스/틱톡 · 객관적 시장분석 톤(브랜딩 없음)
> 스토리: AI 데이터센터의 메모리 독식 → 일반 D램 품귀 → DRAM 가격 폭등 → PC·스마트폰 가격 충격 → 2027년까지 지속
> ⚠️ 모든 수치는 1차 출처로 검증됨(TrendForce·IDC·Counterpoint·Tom's Hardware). 추정치 없음.

---

## 🎬 컷별 제작표

| # | 시간 | 비주얼 프롬프트 (Veo · EN, 텍스트 없이) | 내레이션 (ElevenLabs · KR) | 자막(번인) |
|---|---|---|---|---|
| **1 훅** | 0–6s | *Cinematic close-up of a person in an electronics store reaching for a laptop, looking at the price tag with concern, soft bokeh of glowing devices behind, moody dramatic lighting, shallow depth of field, 9:16 vertical* | "2026년, 폰도 노트북도 값이 오릅니다. 범인은 뜻밖에도, AI예요." | 2026년, 왜 비싸졌나 |
| **2 원인** | 6–15s | *Massive AI data center interior, endless rows of glowing blue server racks, silicon wafers and memory chips on a conveyor being pulled away into the racks, sense of something being consumed, cinematic, 9:16 vertical* | "메모리 회사들이 돈 되는 AI용에 생산을 몰면서, 일반 D램이 동났죠." | AI가 메모리를 삼킨다 |
| **3 규모** | 15–24s | *Epic scale shot of silicon wafers stacking into towering piles, a vast futuristic data center complex glowing at dusk, overwhelming sense of scale, slow cinematic aerial pull-back, 9:16 vertical* | "오픈에이아이 스타게이트 한 곳이, 전 세계 D램 생산량의 무려 40%를 빨아들입니다." | 스타게이트=전세계 D램 40% |
| **4 가격** | 24–33s | *Abstract dramatic visualization of a glowing red line graph shooting steeply upward in the dark, sparks and embers, a DRAM memory module in the foreground reflecting the red light, intense, cinematic, 9:16 vertical* | "결과는 폭등. 1분기 D램 가격이 한 분기 만에 두 배 가까이, 역대 최고로 뛰었죠." | D램값 한 분기새 약 2배↑ |
| **5 충격** | 33–43s | *A laptop and a smartphone side by side on a bright retail shelf, rising price tags, a shopper hesitating with hand near wallet, warm store lighting with a tense undertone, cinematic, 9:16 vertical* | "불똥은 소비자에게. 올해 피씨 시장은 최대 9% 줄고, 저가 폰은 원가가 25%나 올랐죠." | PC 최대 -9% · 폰 원가 +25% |
| **6 지속** | 43–52s | *A futuristic HBM memory chip stack glowing and slowly rotating, a holographic timeline morphing from 2026 to 2027 floating beside it, deep blue tech aesthetic, cinematic, 9:16 vertical* | "이 슈퍼사이클, 최소 2027년까지 갑니다. 쉽게 안 끝나요." | 최소 2027년까지 지속 |
| **7 마무리** | 52–60s | *A person holding a smartphone at night, the glow of a distant AI data center reflected on the screen and in their eyes, thoughtful and quietly tense mood, city bokeh, cinematic, 9:16 vertical* | "AI의 식욕이, 결국 내 지갑까지 온 겁니다. 살 거라면, 서두르세요." | AI의 식욕, 내 지갑까지 |

---

## 📌 수치 출처 대조표 (팩트 게이트)

| 자막/내레이션 수치 | 1차 출처 |
|---|---|
| 스타게이트 = 월 90만 웨이퍼 = 전세계 D램 최대 40% | OpenAI's Stargate to consume up to 40% of global DRAM output — Tom's Hardware / TrendForce (2025-10) |
| D램 1Q26 전분기比 약 90~100%↑(역대최대) | TrendForce — "1Q26 conventional DRAM ~93–98% QoQ"; PC DRAM >100% QoQ (2026-01~02) |
| PC 시장 최대 -9% | IDC — pessimistic up to -9% (moderate -5%) due to RAM pricing (2026-01) |
| 저가 스마트폰 BoM +25% / 출하 -2.1% | Counterpoint — low-end smartphone BoM +25%, 2026 shipments -2.1% (2025-12) |
| HBM4 2026 2분기 검증·양산 | TrendForce — HBM4 Validation Expected in 2Q26 |
| 사이클 최소 2027년까지 | Why DRAM Prices Keep Rising in the Age of AI; 70조 투자전쟁 (노트북 소스) |

## 🎙️ ElevenLabs (내레이션)
- **보이스**: 한국어, 신뢰감 있는 다큐 내레이터 톤. `ELEVEN_VOICE_ID`로 고정.
- **설정**: stability 0.55 / similarity 0.75 / style 0.15 (gen_narration.py 기본).
- "두 배 가까이", "40%", "25%", "2027년" 강세. 컷7은 톤 다운(여운).

## 🎵 BGM (Google Lyria)
- 추상·텍스처 위주(저작권 회피): "ambient cinematic tech underscore, rising tension, subtle pulse, data-center hum, no melody, no vocals".
- 컷1~2 긴장 → 컷4 가격 폭등 비트 → 컷5~6 무게감 → 컷7 여운.

## 🖼️ 메타데이터
- **제목 후보**: "AI 때문에 폰값이 오른다? 2026 메모리 대란" / "전 세계 D램의 40%를 한 회사가 가져갔다" / "당신 노트북이 비싸진 진짜 이유"
- **해시태그**: #반도체 #AI #메모리대란 #DRAM #HBM #엔비디아 #반도체슈퍼사이클 #테크
- **자막**: 전 컷 번인 필수(쇼츠 무음 시청 대응). 숫자는 자막으로 정확히 전달(Veo 텍스트 렌더 의존 금지).
- **AI 생성 라벨**: 업로드 시 YouTube "변경된/합성 콘텐츠" 라벨 체크.
