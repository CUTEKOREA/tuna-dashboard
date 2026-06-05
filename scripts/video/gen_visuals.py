#!/usr/bin/env python3
"""gen_visuals.py — 컷별 비주얼 프롬프트로 Runway text→video 클립 생성 → out/<name>/visuals/cut_NN.mp4

Runway 공식 REST API (https://docs.dev.runwayml.com):
  Base    : https://api.dev.runwayml.com/v1
  Auth    : Authorization: Bearer <RUNWAYML_API_SECRET 또는 RUNWAY_API_KEY>
  Header  : X-Runway-Version: 2024-11-06
  생성    : POST /image_to_video  (promptImage 생략 = text-to-video)
            { model:"gen4.5", promptText, ratio:"720:1280"(9:16), duration:5|10 }
  폴링    : GET /tasks/{id} → status PENDING|THROTTLED|RUNNING|SUCCEEDED|FAILED, output:[url]
사용: python3 gen_visuals.py [cuts.json]
컷5(차트)·CTA는 기본 제외(SKIP_VISUAL_IDX). 컷5는 대시보드 화면녹화 권장(실데이터=권위).
"""
import json, os, sys, time, urllib.request, urllib.error

HERE = os.path.dirname(__file__)
BASE = 'https://api.dev.runwayml.com/v1'
VERSION = '2024-11-06'
RATIO = '720:1280'  # 9:16 세로


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


def rw(method, path, key, body=None):
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(BASE + path, data=data, method=method, headers={
        'Authorization': f'Bearer {key}', 'Content-Type': 'application/json',
        'X-Runway-Version': VERSION})
    with urllib.request.urlopen(req, timeout=40) as r:
        return json.load(r)


def gen_one(prompt, model, key, dur, out_path):
    task = rw('POST', '/image_to_video', key,
              {'model': model, 'promptText': prompt, 'ratio': RATIO, 'duration': dur})
    tid = task.get('id')
    if not tid:
        return False
    for _ in range(75):  # 최대 ~10분
        time.sleep(8)
        st = rw('GET', f'/tasks/{tid}', key)
        status = st.get('status')
        if status == 'SUCCEEDED':
            out = st.get('output') or []
            if out:
                urllib.request.urlretrieve(out[0], out_path)
                return True
            return False
        if status == 'FAILED':
            print(f"     ⚠️ FAILED: {st.get('failure', st.get('failureCode',''))}")
            return False
    return False


def main():
    cuts_path = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, 'out', 'pilot_script_tuna_extract', 'cuts.json')
    env = load_env()
    key = env.get('RUNWAYML_API_SECRET') or env.get('RUNWAY_API_KEY', '')
    if not key:
        print('⏭  RUNWAYML_API_SECRET/RUNWAY_API_KEY 없음 — 비주얼 스킵(색배경)')
        return
    model = env.get('RUNWAY_MODEL', 'gen4.5')
    skip = set(int(x) for x in env.get('SKIP_VISUAL_IDX', '4,6').replace(' ', '').split(',') if x)
    cuts = json.load(open(cuts_path, encoding='utf-8'))
    outdir = os.path.join(os.path.dirname(cuts_path), 'visuals')
    os.makedirs(outdir, exist_ok=True)

    made = 0
    for c in cuts:
        if c['idx'] in skip or not c.get('visual_en'):
            print(f"  ⏭  컷 {c['idx']} 스킵(차트/CTA 또는 프롬프트 없음)")
            continue
        mp4 = os.path.join(outdir, f"cut_{c['idx']:02d}.mp4")
        dur = 10 if c.get('dur', 5) > 6 else 5  # Runway는 5/10s 지원
        print(f"  🎥 컷 {c['idx']} 생성중({model}, {dur}s)… '{c['visual_en'][:38]}'")
        try:
            if gen_one(c['visual_en'], model, key, dur, mp4):
                c['visual_path'] = os.path.relpath(mp4, HERE)
                made += 1
                print(f"     ✅ {os.path.getsize(mp4)//1024}KB")
            else:
                print('     ⚠️ 생성 실패/타임아웃 — 색배경 사용')
        except urllib.error.HTTPError as e:
            print(f"     ⚠️ Runway HTTP {e.code}: {e.read()[:120]} — 색배경 사용")
        except Exception as e:
            print(f"     ⚠️ 실패({str(e)[:50]}) — 색배경 사용")
    json.dump(cuts, open(cuts_path, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
    print(f"\n✅ 비주얼 {made}개 생성 → {outdir}")


if __name__ == '__main__':
    main()
