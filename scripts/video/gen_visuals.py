#!/usr/bin/env python3
"""gen_visuals.py — 컷별 비주얼 프롬프트로 Google Veo text→video 클립 생성 → out/<name>/visuals/cut_NN.mp4

Google Gemini API의 Veo 모델 (google-genai SDK). 키: GEMINI_API_KEY/GOOGLE_API_KEY(env 또는 .env).
모델: VEO_MODEL(.env, 기본 veo-3.1-fast-generate-preview). 9:16 세로, ~8초/클립.
Veo3는 자체 오디오 생성하나 assemble.py가 내레이션 오디오를 매핑하므로 영상 오디오는 무시됨.
사용:
  python3 gen_visuals.py [cuts.json]            # SKIP 제외 전 컷
  python3 gen_visuals.py [cuts.json] --cut 0    # 컷 0만(비용 테스트)
컷5(차트)·CTA 기본 제외(SKIP_VISUAL_IDX=4,6). 컷5는 대시보드 화면녹화 권장(실데이터=권위).
"""
import json, os, sys, time
from google import genai
from google.genai import types

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
    return env


def gen_one(client, model, prompt, out_path, vertex):
    cfg = types.GenerateVideosConfig(aspect_ratio='9:16', number_of_videos=1,
                                     person_generation='allow_adult')
    op = client.models.generate_videos(model=model, prompt=prompt, config=cfg)
    waited = 0
    while not op.done:
        time.sleep(10); waited += 10
        op = client.operations.get(op)
        if waited > 600:
            print('     ⚠️ 타임아웃(10분)'); return False
    if getattr(op, 'error', None):
        print(f"     ⚠️ Veo 오류: {op.error}"); return False
    vids = op.response.generated_videos if op.response else None
    if not vids:
        rf = getattr(op.response, 'rai_media_filtered_reasons', None)
        print(f"     ⚠️ 생성물 없음(콘텐츠필터?): {rf}"); return False
    v = vids[0].video
    # Vertex: video_bytes 직접 저장 / Gemini Dev: files.download
    data = getattr(v, 'video_bytes', None)
    if data:
        with open(out_path, 'wb') as f:
            f.write(data)
    elif getattr(v, 'uri', None) and not vertex:
        client.files.download(file=v); v.save(out_path)
    else:
        client.files.download(file=v); v.save(out_path)
    return True


def main():
    argv, only, pos, i = sys.argv[1:], None, [], 0
    while i < len(argv):
        if argv[i] == '--cut':
            only = int(argv[i + 1]); i += 2; continue
        if argv[i].startswith('--'):
            i += 1; continue
        pos.append(argv[i]); i += 1
    cuts_path = pos[0] if pos else os.path.join(HERE, 'out', 'pilot_script_tuna_extract', 'cuts.json')

    env = load_env()
    vertex = env.get('VEO_VERTEX', '1') == '1'  # 기본 Vertex(Cloud 크레딧 사용). API키 prepay 소진 우회.
    if vertex:
        project = env.get('VEO_PROJECT') or os.environ.get('GOOGLE_CLOUD_PROJECT', 'gen-lang-client-0963198205')
        location = env.get('VEO_LOCATION', 'us-central1')
        model = env.get('VEO_MODEL', 'veo-3.0-generate-001')  # Vertex 고품질(Veo3 audio). 3.1-preview는 Vertex 404.
        client = genai.Client(vertexai=True, project=project, location=location)
        print(f"  (Vertex AI: {project}/{location}, {model})")
    else:
        key = env.get('GEMINI_API_KEY') or env.get('GOOGLE_API_KEY') or os.environ.get('GEMINI_API_KEY') or os.environ.get('GOOGLE_API_KEY')
        if not key:
            print('⏭  GEMINI_API_KEY/GOOGLE_API_KEY 없음 — 비주얼 스킵(색배경)')
            return
        model = env.get('VEO_MODEL', 'veo-3.1-generate-preview')
        client = genai.Client(api_key=key)
    skip = set(int(x) for x in env.get('SKIP_VISUAL_IDX', '4,6').replace(' ', '').split(',') if x)
    cuts = json.load(open(cuts_path, encoding='utf-8'))
    outdir = os.path.join(os.path.dirname(cuts_path), 'visuals')
    os.makedirs(outdir, exist_ok=True)

    made = 0
    for c in cuts:
        if only is not None and c['idx'] != only:
            continue
        if only is None and (c['idx'] in skip or not c.get('visual_en')):
            print(f"  ⏭  컷 {c['idx']} 스킵(차트/CTA 또는 프롬프트 없음)")
            continue
        if not c.get('visual_en'):
            continue
        mp4 = os.path.join(outdir, f"cut_{c['idx']:02d}.mp4")
        print(f"  🎥 컷 {c['idx']} Veo 생성중({model})… '{c['visual_en'][:42]}'")
        t0 = time.time()
        try:
            if gen_one(client, model, c['visual_en'], mp4, vertex):
                c['visual_path'] = os.path.relpath(mp4, HERE)
                made += 1
                print(f"     ✅ {os.path.getsize(mp4)//1024}KB · {int(time.time()-t0)}s")
        except Exception as e:
            print(f"     ⚠️ 실패({str(e)[:90]}) — 색배경 사용")
    json.dump(cuts, open(cuts_path, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
    print(f"\n✅ Veo 비주얼 {made}개 생성 → {outdir}")


if __name__ == '__main__':
    main()
