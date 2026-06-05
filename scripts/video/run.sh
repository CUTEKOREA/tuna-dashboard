#!/bin/bash
# run.sh — 영상 자동화 파이프라인 오케스트레이터
# 파싱 → 내레이션(ElevenLabs) → 음악(Suno) → 비주얼(Runway/Kling) → 조립(ffmpeg)
# 키 없는 단계는 graceful skip → 색배경/무음으로 러프컷 생성. 키 채울수록 완성도↑.
#
# 사용: ./run.sh [스크립트.md]   (기본: artifacts/pilot_script_tuna_extract.md)
set -e
cd "$(dirname "$0")"
MD="${1:-../../artifacts/pilot_script_tuna_extract.md}"
NAME=$(basename "$MD" .md)
CUTS="out/$NAME/cuts.json"

echo "🎬 [1/5] 스크립트 파싱"
python3 parse_script.py "$MD"

echo ""
echo "🎙️  [2/5] 내레이션 (ElevenLabs)"
if grep -q "^ELEVENLABS_API_KEY=.\+" .env 2>/dev/null; then
  python3 gen_narration.py "$CUTS" || echo "  ⚠️ 내레이션 실패 — 무음으로 진행"
else
  echo "  ⏭  ELEVENLABS_API_KEY 미설정(.env) — 무음 스킵"
fi

echo ""
echo "🎵 [3/5] 음악 (Suno)"
if grep -q "^SUNO_API_KEY=.\+" .env 2>/dev/null; then
  python3 gen_music.py "$CUTS" || echo "  ⚠️ 음악 실패 — BGM 없이 진행"
else
  echo "  ⏭  SUNO_API_KEY 미설정 — BGM 스킵"
fi

echo ""
echo "🎥 [4/5] 비주얼 (Runway/Kling)"
if grep -q "^RUNWAY_API_KEY=.\+\|^KLING_API_KEY=.\+\|^FAL_KEY=.\+" .env 2>/dev/null; then
  python3 gen_visuals.py "$CUTS" || echo "  ⚠️ 비주얼 실패 — 색배경으로 진행"
else
  echo "  ⏭  비주얼 키 미설정 — 색배경 스킵(컷5는 대시보드 화면녹화 권장)"
fi

echo ""
echo "🎞️  [5/5] 합성 (ffmpeg)"
python3 assemble.py "$CUTS"
echo ""
echo "✅ 완료 → out/$NAME/final.mp4"
