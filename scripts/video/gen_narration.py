#!/usr/bin/env python3
"""gen_narration.py — cuts.json의 컷별 한국어 내레이션을 ElevenLabs TTS로 생성.

영상 자동화 파이프라인 2단계. 컷별 mp3 + 길이(초) 메타 산출.
키: scripts/video/.env 의 ELEVENLABS_API_KEY (채팅 금지). 모델: eleven_multilingual_v2(한국어 지원).
사용: python3 gen_narration.py [out/<name>/cuts.json]
"""
import json, os, re, sys, urllib.request, urllib.error, subprocess

HERE = os.path.dirname(__file__)


def load_env():
    env = {}
    p = os.path.join(HERE, '.env')
    if os.path.exists(p):
        for line in open(p, encoding='utf-8'):
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                k, v = line.split('=', 1)
                env[k.strip()] = v.strip().strip('"\'')
    # 환경변수 우선 폴백
    for k in ('ELEVENLABS_API_KEY', 'ELEVEN_VOICE_ID'):
        if os.environ.get(k):
            env[k] = os.environ[k]
    return env


# 기본 보이스: George - Warm, Captivating Storyteller (다큐 내레이터 톤). .env ELEVEN_VOICE_ID로 교체 가능.
DEFAULT_VOICE = 'JBFqnCBsd6RM'
SKIP = re.compile(r'^\(?\s*(무음|silence|stinger|스팅어)')


def tts(text, voice, key, out_path):
    body = json.dumps({
        'text': text,
        'model_id': 'eleven_multilingual_v2',
        'voice_settings': {'stability': 0.55, 'similarity_boost': 0.75, 'style': 0.15, 'use_speaker_boost': True},
    }).encode('utf-8')
    req = urllib.request.Request(
        f'https://api.elevenlabs.io/v1/text-to-speech/{voice}',
        data=body,
        headers={'xi-api-key': key, 'Content-Type': 'application/json', 'Accept': 'audio/mpeg'},
        method='POST',
    )
    with urllib.request.urlopen(req, timeout=60) as resp:
        audio = resp.read()
    with open(out_path, 'wb') as f:
        f.write(audio)
    return len(audio)


def duration(path):
    try:
        r = subprocess.run(['ffprobe', '-v', 'quiet', '-show_entries', 'format=duration',
                            '-of', 'csv=p=0', path], capture_output=True, text=True, timeout=20)
        return round(float(r.stdout.strip()), 2)
    except Exception:
        return None


def main():
    cuts_path = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, 'out', 'pilot_script_tuna_extract', 'cuts.json')
    env = load_env()
    key = env.get('ELEVENLABS_API_KEY', '')
    if not key:
        print('❌ ELEVENLABS_API_KEY 없음 — scripts/video/.env 에 키를 넣으세요(채팅 금지).')
        sys.exit(1)
    voice = env.get('ELEVEN_VOICE_ID', DEFAULT_VOICE)
    cuts = json.load(open(cuts_path, encoding='utf-8'))
    outdir = os.path.join(os.path.dirname(cuts_path), 'narration')
    os.makedirs(outdir, exist_ok=True)

    made = 0
    for c in cuts:
        text = c['narration_kr']
        if not text or SKIP.match(text):
            c['narration_audio'] = None
            continue
        mp3 = os.path.join(outdir, f"cut_{c['idx']:02d}.mp3")
        try:
            n = tts(text, voice, key, mp3)
            dur = duration(mp3)
            c['narration_audio'] = os.path.relpath(mp3, HERE)
            c['narration_dur'] = dur
            made += 1
            print(f"  ✅ cut {c['idx']} ({c['id']}): {n//1024}KB · {dur}s · '{text[:30]}…'")
        except urllib.error.HTTPError as e:
            print(f"  ❌ cut {c['idx']}: HTTP {e.code} {e.read()[:120]}")
            sys.exit(2)
    # 갱신된 cuts.json 저장(오디오 경로·길이 포함)
    json.dump(cuts, open(cuts_path, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
    print(f"\n✅ 내레이션 {made}개 생성 → {outdir}")


if __name__ == '__main__':
    main()
