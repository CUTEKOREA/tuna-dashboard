# 파일럿 숏폼 스크립트 — "참치액 카니발리제이션"

> 신라교역 권위 구축 시리즈 #1 · 9:16 세로 · ~45초 · YouTube Shorts/릴스/틱톡
> 스토리: 버려지던 자숙액 → 제로코스트 참치액 → 전통 간장시장 잠식(카니발리제이션)
> ⚠️ 팩트 정확성=권위. 정성 서사는 검증됨. **[검증수치]** 표시 자리는 본인 대시보드/리서치 확정값 삽입.

---

## 🎬 컷별 제작표

| # | 시간 | 비주얼 프롬프트 (Kling/Runway · EN) | 내레이션 (ElevenLabs · KR) | 자막(번인) |
|---|---|---|---|---|
| **1 훅** | 0–4s | *Industrial tuna cannery, stainless steel cookers, brown steaming liquid pouring down a drain, cinematic moody lighting, 9:16, slow motion* | "참치 통조림을 만들고 나면, 이 갈색 액체가 쏟아집니다. 수십 년간 — 그냥 버렸죠." | 버려지던 '폐수'가 |
| **2** | 4–10s | *Macro close-up of dark amber liquid, glistening, droplets, scientific overlay of molecular structure (inosinic acid), premium look* | "그런데 이 폐액엔, 참치의 감칠맛 — 이노신산이 그대로 녹아 있습니다." | 참치 감칠맛의 정체 |
| **3** | 10–18s | *Time-lapse: brown liquid boiling and condensing into a rich glossy concentrate, then poured into an elegant seasoning bottle, transformation, gold accent* | "끓이고 농축하면 — '참치액'. 원료비는 0원. 버리던 부산물이니까요. **제로 코스트 마진.**" | 원가 0원 · 제로코스트 마진 |
| **4** | 18–28s | *Korean supermarket seasoning aisle, hand reaching past soy sauce bottles to pick a tuna-extract bottle, warm kitchen B-roll of soup being seasoned* | "감칠맛은 간장·멸치액젓보다 진하고 깔끔합니다. 국·찌개에 간장 대신 참치액을 넣는 집이 늘고 있죠." | 간장 대신 참치액 |
| **5 핵심** | 28–38s | *Animated line chart, two curves crossing in an X: rising line labeled 참치액(tuna extract) up, falling line labeled 간장(soy sauce) down, clean data-viz, brand cyan→blue* | "이게 '카니발리제이션'. 참치액이 전통 간장 시장을 직접 잠식합니다. 두 곡선이 X자로 교차하죠. [검증수치: 예 — 참치액 시장 연 ○○% 성장]" | 카니발리제이션 (X자 교차) |
| **6 마무리** | 38–45s | *Silla Co. brand frame, premium tuna value-chain montage (vessel→cannery→bottle), logo reveal, confident tone* | "버리던 폐기물에서 프리미엄 조미료로. 신라교역이 보는 참치 밸류업의 끝판왕입니다." | 폐기물 → 프리미엄 · 신라교역 |
| **CTA** | 45s | *End card, logo + subscribe prompt* | (무음 or 짧은 스팅어) | 참치 산업의 숨은 마진, 더 보기 → |

---

## 🎙️ ElevenLabs (내레이션)
- **보이스**: 한국어, 30~40대 남성/여성 중 **신뢰감+약간의 위트** (다큐 내레이터 톤). 한 보이스 고정=채널 정체성.
- **설정**: Stability 50~60 / Similarity 75 / Style 0~20(과장 X). 속도 보통, 컷3 "제로 코스트 마진"·컷5 "X자로 교차" 강세.
- 팁: 문장별로 끊어 생성 후 합성하면 컷 싱크가 쉬움.

## 🎵 Suno (음악)
- **프롬프트**: *"minimal corporate documentary, subtle tension building to confident resolve, light percussion, clean, no vocals, 45 seconds, Korean premium brand"*
- 컷1~2 미스터리/긴장 → 컷3 전환점 비트 드롭 → 컷5~6 상승/확신. 내레이션 아래 -18dB 정도로 깔기.

## 🖼️ 썸네일/메타 (쇼츠는 첫 1초가 썸네일)
- **제목 후보**: "버린 폐수로 간장 시장을 무너뜨린 방법" / "원가 0원 조미료의 정체" / "참치 공장이 숨겨온 마진"
- **해시태그**: #참치액 #감칠맛 #식품산업 #신라교역 #카니발리제이션 #밸류업 #B2B
- **자막**: 전 컷 번인 필수(쇼츠 80% 무음 시청). 핵심어 키컬러 강조.

## ⚙️ 제작 순서 (수동 1편 — 파이프라인 검증)
1. 이 스크립트 확정 + **[검증수치] 채우기** (본인 대시보드 카니발리제이션 위젯 실값).
2. ElevenLabs: 6개 내레이션 클립 생성.
3. Kling/Runway: 컷별 프롬프트로 6개 클립(각 4~10s). 컷5는 **대시보드 X자 그래프 화면녹화**가 더 정확·신뢰(실데이터).
4. Suno: BGM 1개.
5. CapCut: 9:16 타임라인에 클립+내레이션+자막+BGM 합성, 컷 전환·키워드 강조.
6. 팩트 재검수 → AI 생성 라벨 → 업로드.

## 🔁 다음 단계 (자동화)
- **반자동**: 스크립트(Claude) + ElevenLabs API(내레이션) + Suno API(BGM) 일괄 → 비주얼/편집만 수동.
- **완전자동**: 대시보드 위젯 데이터 → 멀티에이전트(기획→스크립트→프롬프트) → ElevenLabs/Suno/Runway API → ffmpeg 합성 → 초안 자동 산출. (시리즈 #2 사시미등급, #3 황다랑어vs가다랑어로 확장)
