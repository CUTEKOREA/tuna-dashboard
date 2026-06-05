#!/usr/bin/env python3
"""gen_music.py — 스크립트의 Suno 프롬프트로 BGM 1개 생성 → out/<name>/music/bgm.mp3

키: scripts/video/.env 의 SUNO_API_KEY. 엔드포인트는 제공자별 상이 → SUNO_API_BASE로 override 가능.
기본: sunoapi.org 호환 셰이프(POST /api/generate → poll). 제공자 다르면 .env에 SUNO_API_BASE 지정.
사용: python3 gen_music.py [cuts.json]
⚠️ Suno API는 표준화가 약함 — 제공자 문서에 맞춰 endpoint/필드 조정 필요할 수 있음.
"""
import json, os, sys, time, urllib.request, urllib.error

HERE = os.path.dirname(__file__)
# 파일럿 스크립트의 음악 방향(없으면 기본)
DEFAULT_PROMPT = ("minimal corporate documentary, subtle tension building to confident resolve, "
                  "light percussion, clean, no vocals, 45 seconds, premium brand")


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


def api(method, url, key, body=None):
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(url, data=data, method=method, headers={
        'Authorization': f'Bearer {key}', 'Content-Type': 'application/json', 'Accept': 'application/json'})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.load(r)


def main():
    cuts_path = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, 'out', 'pilot_script_tuna_extract', 'cuts.json')
    env = load_env()
    key = env.get('SUNO_API_KEY', '')
    if not key:
        print('⏭  SUNO_API_KEY 없음 — 스킵')
        return
    base = env.get('SUNO_API_BASE', 'https://api.sunoapi.org')
    outdir = os.path.join(os.path.dirname(cuts_path), 'music')
    os.makedirs(outdir, exist_ok=True)
    bgm = os.path.join(outdir, 'bgm.mp3')

    try:
        gen = api('POST', f'{base}/api/generate', key,
                  {'prompt': DEFAULT_PROMPT, 'make_instrumental': True, 'wait_audio': False})
        ids = [g.get('id') for g in (gen if isinstance(gen, list) else gen.get('data', [gen]))]
        # 폴링
        url = None
        for _ in range(40):
            time.sleep(6)
            st = api('GET', f"{base}/api/get?ids={','.join(filter(None, ids))}", key)
            items = st if isinstance(st, list) else st.get('data', [])
            done = [i for i in items if i.get('audio_url') or i.get('audioUrl')]
            if done:
                url = done[0].get('audio_url') or done[0].get('audioUrl')
                break
        if not url:
            print('  ⚠️ Suno 생성 타임아웃 — BGM 없이 진행')
            return
        urllib.request.urlretrieve(url, bgm)
        print(f'  ✅ BGM 생성 → {bgm} ({os.path.getsize(bgm)//1024}KB)')
    except urllib.error.HTTPError as e:
        print(f'  ⚠️ Suno HTTP {e.code} — 제공자 endpoint 확인 필요(.env SUNO_API_BASE). BGM 스킵.')
    except Exception as e:
        print(f'  ⚠️ Suno 실패({str(e)[:60]}) — BGM 스킵')


if __name__ == '__main__':
    main()
