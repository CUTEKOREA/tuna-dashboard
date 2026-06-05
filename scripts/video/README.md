# 영상 자동화 파이프라인 (신라교역 콘텐츠 시리즈)

대시보드 인사이트 → 숏폼 explainer 영상 자동 생성. 파일럿: "참치액 카니발리제이션".

## 구조
```
스크립트(.md) → parse_script.py → cuts.json
  → gen_narration.py (ElevenLabs)  → narration/cut_NN.mp3
  → gen_music.py     (Suno)        → music/bgm.mp3
  → gen_visuals.py   (Runway)      → visuals/cut_NN.mp4
  → assemble.py      (ffmpeg)      → final.mp4 (1080x1920 9:16)
오케스트레이터: run.sh (키 없는 단계는 graceful skip)
```

## 빠른 시작
```bash
cd scripts/video
cp .env.example .env          # 이미 생성됨
# .env 편집기로 열어 키 입력 (⚠️ 채팅·git 금지, gitignore됨)
./run.sh                      # 전체 실행 → out/<name>/final.mp4
```

## 키 (scripts/video/.env)
| 키 | 단계 | 없으면 |
|---|---|---|
| `ELEVENLABS_API_KEY` | 내레이션 | 무음 |
| `SUNO_API_KEY` (+`SUNO_API_BASE`) | BGM | BGM 없음 |
| `RUNWAYML_API_SECRET` | 비주얼(Runway text→video, gen4.5) | 색배경 |
| `RUNWAY_MODEL` | Runway 모델 교체(기본 gen4.5) | gen4.5 |
| `ELEVEN_VOICE_ID` | 보이스 교체 | 기본(George) |
| `SKIP_VISUAL_IDX` | 비주얼 제외 컷(기본 `4,6`=차트·CTA) | — |

## 검증된 상태 (2026-06-05)
- ✅ **parse_script.py** — 7컷·45초 파싱 (테스트 통과)
- ✅ **assemble.py** — ffmpeg에 drawtext 없음 → **Pillow 자막 PNG + overlay**로 9:16 mp4 합성 (러프컷 검증, 프레임 한국어 자막 확인)
- ⏳ **gen_narration.py** — ElevenLabs 도달 확인, 키 입력 시 즉시 작동
- ⏳ **gen_music/gen_visuals** — 키 + 제공자 endpoint 확인 후 (Suno API 셰이프는 제공자별 상이)

## 단계별 운용
- **수동검증(현재)**: 키 없이 `./run.sh` → 색배경+자막 러프컷으로 흐름·타이밍 확인.
- **반자동**: ELEVENLABS_API_KEY만 넣으면 → 실제 한국어 내레이션 + 자막 영상.
- **완전자동**: 전 키 + (컷5는 대시보드 카니발리제이션 위젯 화면녹화를 `visuals/cut_04.mp4`로 수동 배치 권장 — 실데이터=권위).

## 주의
- 컷5(데이터 차트)는 AI 영상보다 **대시보드 실제 그래프 화면녹화**가 정확·신뢰. `SKIP_VISUAL_IDX`에 포함(기본).
- 팩트 정확성=권위. 스크립트 `[검증수치]`는 본인 확정값으로 교체 후 제작.
- YouTube 등은 AI 생성 콘텐츠 라벨 정책 준수.
