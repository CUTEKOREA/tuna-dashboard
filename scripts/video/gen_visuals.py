#!/usr/bin/env python3
"""gen_visuals.py — 컷별 비주얼 프롬프트로 text→video 클립 생성 → out/<name>/visuals/cut_NN.mp4

경로: fal.ai의 Kling text-to-video (FAL_KEY). fal은 큐 기반 — submit→poll→download.
컷5(데이터 차트)는 AI영상보다 대시보드 화면녹화가 정확 → visual_path를 수동 지정 가능.
사용: python3 gen_visuals.py [cuts.json]
⚠️ 비주얼 생성은 컷당 수십초~수분 + 크레딧 소모. SKIP_VISUAL_IDX(.env)로 특정 컷 제외 가능.
"""
import json, os, sys, time, urllib.request, urllib.error

HERE = os.path.dirname(__file__)
FAL_MODEL = 'fal-ai/kling-video/v1/standard/text-to-video'


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


def fal(method, url, key, body=None):
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(url, data=data, method=method, headers={
        'Authorization': f'Key {key}', 'Content-Type': 'application/json'})
    with urllib.request.urlopen(req, timeout=40) as r:
        return json.load(r)


def gen_one(prompt, key, out_path):
    sub = fal('POST', f'https://queue.fal.run/{FAL_MODEL}', key, {'prompt': prompt, 'duration': '5', 'aspect_ratio': '9:16'})
    status_url, resp_url = sub.get('status_url'), sub.get('response_url')
    for _ in range(60):
        time.sleep(8)
        st = fal('GET', status_url, key)
        if st.get('status') == 'COMPLETED':
            res = fal('GET', resp_url, key)
            vurl = (res.get('video') or {}).get('url')
            if vurl:
                urllib.request.urlretrieve(vurl, out_path)
                return True
            return False
    return False


def main():
    cuts_path = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, 'out', 'pilot_script_tuna_extract', 'cuts.json')
    env = load_env()
    key = env.get('FAL_KEY', '')
    if not key:
        print('⏭  FAL_KEY 없음 — 비주얼 스킵(색배경 사용)')
        return
    skip = set(int(x) for x in env.get('SKIP_VISUAL_IDX', '4,6').replace(' ', '').split(',') if x)  # 컷5(차트)·CTA 기본 제외
    cuts = json.load(open(cuts_path, encoding='utf-8'))
    outdir = os.path.join(os.path.dirname(cuts_path), 'visuals')
    os.makedirs(outdir, exist_ok=True)

    made = 0
    for c in cuts:
        if c['idx'] in skip or not c.get('visual_en'):
            print(f"  ⏭  컷 {c['idx']} 스킵(차트/CTA 또는 프롬프트 없음)")
            continue
        mp4 = os.path.join(outdir, f"cut_{c['idx']:02d}.mp4")
        print(f"  🎥 컷 {c['idx']} 생성중… '{c['visual_en'][:40]}'")
        try:
            if gen_one(c['visual_en'], key, mp4):
                c['visual_path'] = os.path.relpath(mp4, HERE)
                made += 1
                print(f"     ✅ {os.path.getsize(mp4)//1024}KB")
            else:
                print('     ⚠️ 생성 실패/타임아웃 — 색배경 사용')
        except urllib.error.HTTPError as e:
            print(f"     ⚠️ fal HTTP {e.code} — 색배경 사용")
        except Exception as e:
            print(f"     ⚠️ 실패({str(e)[:50]}) — 색배경 사용")
    json.dump(cuts, open(cuts_path, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
    print(f"\n✅ 비주얼 {made}개 생성")


if __name__ == '__main__':
    main()
