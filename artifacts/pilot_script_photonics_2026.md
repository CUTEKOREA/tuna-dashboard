# 숏폼 스크립트 — "구리의 시대는 끝났다: 실리콘 포토닉스" (헐리우드급 v2)

> 출처: NotebookLM "AI / 반도체" 노트북 + 웹 1차 교차검증 (TheNextWeb·Optica·Mitsui·파이낸셜뉴스)
> 9:16 세로 · 목표 ~55초 · 시네마틱(Shot Grammar) · 객관적 분석 톤(브랜딩 없음)
> 모델: Veo 3.1 (Gemini API) · 포스트: teal-cyan 그레이드+그레인+레터박스
> ⚠️ 모든 수치 1차 출처 검증. Veo는 텍스트 렌더 안 함 → 숫자는 자막(번인)으로.

## 🎨 Look Bible (전 컷 공통 톤 — 한 편의 영화처럼)
- **렌즈**: anamorphic 2x, horizontal lens flares, shallow depth of field, subtle lens breathing
- **라이팅**: volumetric haze, god-rays, hard rim light, motivated practicals(빛나는 칩·광섬유)
- **그레이드**: deep teal & cyan + warm amber light accents, crushed blacks, high contrast
- **텍스처**: film grain, halation on highlights, photoreal, shot on ARRI Alexa 35
- **레퍼런스(서술형, 영화명 금지=IP필터 회피)**: 산업 숭고미 + 빛의 미학 = "epic neo-noir science-fiction blockbuster aesthetic"
- **카메라**: 컷마다 의도된 무빙 1개(macro push-in / dolly / orbit / crane)
- 공통 suffix = `anamorphic 2x lens with horizontal flares, shallow depth of field, volumetric haze, teal-and-cyan grade with warm amber light accents, crushed blacks, film grain, halation on highlights, photoreal, shot on ARRI Alexa 35, epic neo-noir science-fiction blockbuster aesthetic, 9:16 vertical, no text, no captions`

---

## 🎬 컷별 제작표

| # | 시간 | 비주얼 프롬프트 (Veo 3.1 · Shot Grammar · EN) | 내레이션 (ElevenLabs · KR) | 자막(번인) |
|---|---|---|---|---|
| **1 훅** | 0–7s | *Extreme macro push-in on a dense bundle of copper wires glowing red-hot, tiny sparks and heat shimmer, one strand fraying and failing, ominous tension, anamorphic 2x lens with horizontal flares, shallow depth of field, volumetric haze, teal-and-cyan grade with warm amber light accents, crushed blacks, film grain, halation on highlights, photoreal, shot on ARRI Alexa 35, epic neo-noir science-fiction blockbuster aesthetic, 9:16 vertical, no text* | "당신 손안의 AI가, 벽에 부딪혔습니다. 범인은 뜻밖에도 — 구리선이죠." | AI의 진짜 벽 |
| **2 위기** | 7–15s | *Low-angle wide shot inside a vast dark data center, towering GPU racks vanishing into haze, electric-red signals straining and flickering along copper traces, slow dolly forward, sense of overload and heat, anamorphic 2x lens with horizontal flares, shallow depth of field, volumetric haze, teal-and-cyan grade with warm amber light accents, crushed blacks, film grain, halation on highlights, photoreal, shot on ARRI Alexa 35, epic neo-noir science-fiction blockbuster aesthetic, 9:16 vertical, no text* | "GPU가 백만 개로 늘면, 구리는 신호도 전력도 못 버팁니다. 이른바, '구리의 벽'." | 구리의 벽 (Copper Wall) |
| **3 전환** | 15–24s | *Hero shot of a single silicon chip in a black void as brilliant cyan light beams ignite and replace dim copper lines, slow orbital camera, light blooming outward, transcendent reveal, anamorphic 2x lens with horizontal flares, shallow depth of field, volumetric haze, teal-and-cyan grade with warm amber light accents, crushed blacks, film grain, halation on highlights, photoreal, shot on ARRI Alexa 35, epic neo-noir science-fiction blockbuster aesthetic, 9:16 vertical, no text* | "그래서 반도체가, 전기 대신 '빛'으로 말하기 시작했습니다. 실리콘 포토닉스." | 전기 대신, 빛 |
| **4 증명** | 24–33s | *Macro top-down of a processor with a co-packaged optical engine, golden light flowing smoothly through tiny waveguides, a glowing power gauge visibly dropping, slow crane-down, precise and elegant, anamorphic 2x lens with horizontal flares, shallow depth of field, volumetric haze, teal-and-cyan grade with warm amber light accents, crushed blacks, film grain, halation on highlights, photoreal, shot on ARRI Alexa 35, epic neo-noir science-fiction blockbuster aesthetic, 9:16 vertical, no text* | "광학 엔진을 칩에 직접 붙이니, 네트워크 전력이 70%나 줄었죠. 포트당 30와트가, 9와트로." | 전력 70%↓ (30W→9W) |
| **5 베팅** | 33–42s | *Epic wide establishing shot of a futuristic fiber-optic fabrication complex at dusk, rivers of glowing fiber-optic cables flowing toward the horizon, a slow majestic crane-up, scale and ambition, anamorphic 2x lens with horizontal flares, shallow depth of field, volumetric haze, teal-and-cyan grade with warm amber light accents, crushed blacks, film grain, halation on highlights, photoreal, shot on ARRI Alexa 35, epic neo-noir science-fiction blockbuster aesthetic, 9:16 vertical, no text* | "엔비디아는 단 석 달 만에, 광학 기업들에 65억 달러를 쏟아부었습니다." | 엔비디아, 3개월 65억$ 베팅 |
| **6 한국** | 42–50s | *Sweeping tracking shot through a pristine semiconductor fab, robotic arms delicately handling glowing photonic wafers, a sense of light and value expanding upward, smooth steadicam move, anamorphic 2x lens with horizontal flares, shallow depth of field, volumetric haze, teal-and-cyan grade with warm amber light accents, crushed blacks, film grain, halation on highlights, photoreal, shot on ARRI Alexa 35, epic neo-noir science-fiction blockbuster aesthetic, 9:16 vertical, no text* | "시장은 2030년 100억 달러로 커지고, 삼성도 올 하반기 양산에 들어갑니다." | 2030년 100억$ · 삼성 하반기 양산 |
| **7 미래** | 50–58s | *Cinematic wide of a next-generation AI data center bathed entirely in flowing light instead of copper, pulsing rhythmically like a living heart, camera slowly pushing toward an infinite luminous horizon, hopeful and grand, anamorphic 2x lens with horizontal flares, shallow depth of field, volumetric haze, teal-and-cyan grade with warm amber light accents, crushed blacks, film grain, halation on highlights, photoreal, shot on ARRI Alexa 35, epic neo-noir science-fiction blockbuster aesthetic, 9:16 vertical, no text* | "2027년, AI의 심장은 구리가 아니라 빛으로 뜁니다. 빛의 시대가, 열립니다." | 빛의 시대 |

---

## 📌 수치 출처 대조표 (팩트 게이트)
| 자막/내레이션 | 1차 출처 |
|---|---|
| 구리 한계(~200Gbps·million-GPU copper wall) | TheNextWeb; The Optical Revolution (Silicon Photonics) |
| 엔비디아 3개월 65억$ (Coherent·Lumentum·Marvell 각 $2B, Corning $3.2B, Ayar $500M) | TheNextWeb / Yahoo Finance (2026-05) |
| CPO 전력 70%↓ (30W→9W) | Mitsui Co-Packaged Optics; 광반도체 혁명 ② |
| 실리콘 포토닉스 $21.6억(2024)→$96.5억(2030), CAGR 29.5% | 광반도체 혁명 ② |
| 삼성 2026 하반기 양산 | 파이낸셜뉴스 (2026-05-11) |
| 2027 Vera Rubin Ultra 광패브릭 전면 전환 | Mitsui; 엔비디아 GTC 2026 Preview |

## 🎙️ 내레이션 / 🎵 BGM / 🔊 SFX
- 보이스: 신뢰감 다큐 톤. "빛", "70%", "65억 달러", "빛의 시대" 강세. 컷7 톤 다운(여운).
- BGM(Lyria): "ethereal cinematic tech, shimmering light textures, rising awe, deep sub pulse, no melody, no vocals".
- SFX(선택): 컷3 전환에 광(光) 점화 whoosh, 컷7에 심장박동 sub-bass.

## 🎞️ 포스트(헐리우드 마감)
- teal-cyan 컬러그레이드 LUT + 미세 film grain + vignette + 상하 시네마 레터박스(살짝) + 하이라이트 halation.
- 자막: 박스 제거 → 컨덴스드 대문자, 키워드 cyan 액센트, 하단 세이프영역, soft shadow.
- 컷 전환: 음악 비트 싱크 + light-leak/cross-dissolve 0.3s.

## 🖼️ 메타데이터
- 제목 후보: "구리의 시대는 끝났다 — 엔비디아가 빛에 65억 달러를 건 이유" / "이제 반도체는 '빛'으로 계산한다"
- 해시태그: #실리콘포토닉스 #반도체 #엔비디아 #광반도체 #CPO #AI인프라 #삼성전자
- AI 생성 라벨 체크.
