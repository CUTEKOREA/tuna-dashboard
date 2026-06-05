#!/usr/bin/env python3
"""gen_music.py — Google Lyria 2(Vertex AI)로 BGM 생성 → out/<name>/music/bgm.mp3

Veo와 동일하게 Vertex AI(Cloud 크레딧) 사용. Suno 불필요.
모델 lyria-002:predict → ~30초 48kHz instrumental WAV(base64) → mp3 변환.
프롬프트는 recitation check 회피 위해 추상·텍스처 위주(구체 장르/곡 묘사 금지).
사용: python3 gen_music.py [cuts.json]
"""
import json, os, sys, base64, subprocess, urllib.request, urllib.error

HERE = os.path.dirname(__file__)
DEFAULT_PROMPT = ("ambient cinematic underscore, deep ocean atmosphere, slow evolving synth pads, "
                  "soft sub-bass pulse, minimal abstract texture, no melody, no vocals, premium documentary mood")


def load_env():
    env = {}
    p = os.path.join(HERE, '.env')
    if os.path.exists(p):
        for line in open(p, encoding='utf-8'):
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                k, v = line.split('=', 1)
                env[k.strip()] = v.strip().strip('"\'')
    return env


def get_token():
    r = subprocess.run(['gcloud', 'auth', 'application-default', 'print-access-token'],
                       capture_output=True, text=True)
    return r.stdout.strip()


def main():
    cuts_path = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, 'out', 'pilot_script_tuna_extract', 'cuts.json')
    env = load_env()
    project = env.get('VEO_PROJECT') or os.environ.get('GOOGLE_CLOUD_PROJECT', 'gen-lang-client-0963198205')
    location = env.get('VEO_LOCATION', 'us-central1')
    token = get_token()
    if not token:
        print('⏭  gcloud ADC 토큰 없음 — BGM 스킵 (gcloud auth application-default login)')
        return
    prompt = env.get('LYRIA_PROMPT', DEFAULT_PROMPT)
    outdir = os.path.join(os.path.dirname(cuts_path), 'music')
    os.makedirs(outdir, exist_ok=True)
    wav, mp3 = os.path.join(outdir, 'bgm.wav'), os.path.join(outdir, 'bgm.mp3')

    url = (f"https://{location}-aiplatform.googleapis.com/v1/projects/{project}"
           f"/locations/{location}/publishers/google/models/lyria-002:predict")
    body = json.dumps({"instances": [{"prompt": prompt, "negative_prompt": "vocals, singing, lyrics"}],
                       "parameters": {"sample_count": 1}}).encode()
    req = urllib.request.Request(url, data=body, method='POST', headers={
        'Authorization': f'Bearer {token}', 'Content-Type': 'application/json',
        'x-goog-user-project': project})
    try:
        resp = json.load(urllib.request.urlopen(req, timeout=120))
    except urllib.error.HTTPError as e:
        print(f'  ⚠️ Lyria HTTP {e.code}: {e.read()[:160]} — BGM 스킵')
        return
    preds = resp.get('predictions', [])
    if not preds or not preds[0].get('bytesBase64Encoded'):
        print(f"  ⚠️ Lyria 생성 실패(차단?): {json.dumps(resp.get('error', resp))[:160]} — BGM 스킵")
        return
    with open(wav, 'wb') as f:
        f.write(base64.b64decode(preds[0]['bytesBase64Encoded']))
    subprocess.run(['ffmpeg', '-y', '-i', wav, '-b:a', '192k', mp3], capture_output=True)
    dur = subprocess.run(['ffprobe', '-v', 'quiet', '-show_entries', 'format=duration', '-of', 'csv=p=0', mp3],
                         capture_output=True, text=True).stdout.strip()
    print(f"  ✅ BGM (Lyria 2) → {mp3} · {dur}초 · {os.path.getsize(mp3)//1024}KB")


if __name__ == '__main__':
    main()
