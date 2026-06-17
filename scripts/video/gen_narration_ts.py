#!/usr/bin/env python3
"""gen_narration_ts.py — ElevenLabs with-timestamps로 내레이션 + 글자별 정렬(alignment) 생성.

자막 싱크 정확도를 위해 글자별 start/end(초)를 cuts.json에 저장(cut['align']).
키/보이스/모델: .env (ELEVENLABS_API_KEY, ELEVEN_VOICE_ID, ELEVEN_MODEL).
사용: python3 gen_narration_ts.py out/<name>/cuts.json
"""
import json, os, sys, base64, urllib.request, urllib.error, subprocess

HERE = os.path.dirname(__file__)
DEFAULT_VOICE = 'JBFqnCBsd6RM'


def load_env():
    env = {}
    p = os.path.join(HERE, '.env')
    if os.path.exists(p):
        for line in open(p, encoding='utf-8'):
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                k, v = line.split('=', 1)
                env[k.strip()] = v.strip().strip('"\'')
    for k in ('ELEVENLABS_API_KEY', 'ELEVEN_VOICE_ID', 'ELEVEN_MODEL'):
        if os.environ.get(k):
            env[k] = os.environ[k]
    return env


def tts_ts(text, voice, key, model, out_mp3):
    """with-timestamps 호출 → mp3 저장 + alignment 반환. 모델이 정렬 미지원이면 None."""
    body = json.dumps({'text': text, 'model_id': model,
                       'voice_settings': {'stability': 0.5, 'similarity_boost': 0.75,
                                          'style': 0.2, 'use_speaker_boost': True}}).encode()
    req = urllib.request.Request(
        f'https://api.elevenlabs.io/v1/text-to-speech/{voice}/with-timestamps',
        data=body, headers={'xi-api-key': key, 'Content-Type': 'application/json'}, method='POST')
    with urllib.request.urlopen(req, timeout=90) as r:
        d = json.load(r)
    audio = d.get('audio_base64')
    al = d.get('alignment') or d.get('normalized_alignment')
    if not audio or not al:
        return None
    with open(out_mp3, 'wb') as f:
        f.write(base64.b64decode(audio))
    chars = al['characters']
    st = al['character_start_times_seconds']
    en = al['character_end_times_seconds']
    return [[chars[i], round(st[i], 3), round(en[i], 3)] for i in range(len(chars))]


def main():
    cuts_path = sys.argv[1]
    env = load_env()
    key = env.get('ELEVENLABS_API_KEY', '')
    voice = env.get('ELEVEN_VOICE_ID', DEFAULT_VOICE)
    model = env.get('ELEVEN_MODEL', 'eleven_multilingual_v2')
    cuts = json.load(open(cuts_path, encoding='utf-8'))
    outdir = os.path.join(os.path.dirname(cuts_path), 'narration')
    os.makedirs(outdir, exist_ok=True)
    for c in cuts:
        text = (c.get('narration_kr') or '').strip()
        if not text:
            continue
        mp3 = os.path.join(outdir, f"cut_{c['idx']:02d}.mp3")
        align = None
        for m in (model, 'eleven_multilingual_v2'):
            try:
                align = tts_ts(text, voice, key, m, mp3)
                if align:
                    break
            except urllib.error.HTTPError as e:
                print(f"  ⚠️ cut {c['idx']} {m}: HTTP {e.code} {e.read()[:80]}")
        if not align:
            print(f"  ❌ cut {c['idx']} alignment 실패")
            continue
        dur = subprocess.run(['ffprobe', '-v', 'quiet', '-show_entries', 'format=duration',
                              '-of', 'csv=p=0', mp3], capture_output=True, text=True).stdout.strip()
        c['narration_audio'] = os.path.relpath(mp3, HERE)
        c['narration_dur'] = round(float(dur), 2) if dur else align[-1][2]
        c['align'] = align
        print(f"  ✅ cut {c['idx']} ({c['id']}): {c['narration_dur']}s · {len(align)}자 정렬")
    json.dump(cuts, open(cuts_path, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
    print("✅ 타임스탬프 내레이션 + alignment 저장")


if __name__ == '__main__':
    main()
