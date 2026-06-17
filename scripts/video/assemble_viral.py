#!/usr/bin/env python3
"""assemble_viral.py — 떡상 공식 반영 합성 (assemble_cine.py 업그레이드).

추가된 떡상 요소(자동):
- 동적 자막: 컷별 내레이션을 짧은 구(句)로 쪼개 한 번에 1구씩 표시(카라오케형), 중앙-하단 UI세이프, 숫자/단위 노랑 강조.
- 사운드: 컷마다 whoosh, 첫 컷에 sub-bass 임팩트(무음 인트로 금지).
- TTS 무음 트림(데드에어 제거), BGM 더킹.
- 표지(썸네일) = 정지가 아닌 줌인 모션 + whoosh.
- 엔드 CTA 자막.
입력: out/<name>/cuts.json (gen_narration/gen_visuals/gen_music 후) + out/<name>/thumbnail.jpg(선택)
출력: out/<name>/final_viral.mp4 (1080x1920)
"""
import json, os, re, sys, subprocess, tempfile
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(__file__)
W, H = 1080, 1920
_PRET = os.path.expanduser('~/Library/Fonts/Pretendard-Black.ttf')
FONT = _PRET if os.path.exists(_PRET) else '/System/Library/Fonts/AppleSDGothicNeo.ttc'
CAP_Y = 1120           # 자막 세로(UI세이프, 중앙-하단)
YELLOW = (255, 214, 10, 255)
GRADE = ("eq=contrast=1.10:saturation=1.16:gamma=0.97,"
         "colorbalance=rs=-0.06:gs=-0.02:bs=0.06:rm=0.04:gm=0.0:bm=-0.03:rh=0.08:gh=0.02:bh=-0.07,"
         "vignette=PI/5")
HL = re.compile(r'[0-9%$₩억만조원달러와트년퍼센트]')   # 노랑 강조 토큰


def ffq(p): return p


def gen_sfx(workdir):
    """whoosh(전환음)·impact(서브베이스) 생성."""
    wh = os.path.join(workdir, 'whoosh.wav')
    im = os.path.join(workdir, 'impact.wav')
    subprocess.run(['ffmpeg', '-y', '-f', 'lavfi', '-i', 'anoisesrc=d=0.45:c=pink:a=0.5',
                    '-af', 'highpass=f=250,lowpass=f=7000,afade=t=in:d=0.2,afade=t=out:st=0.2:d=0.25,volume=0.5',
                    wh], capture_output=True)
    subprocess.run(['ffmpeg', '-y', '-f', 'lavfi', '-i', 'sine=frequency=64:duration=0.6',
                    '-af', 'afade=t=out:d=0.55,volume=2.5', im], capture_output=True)
    return wh, im


def trim_narr(src, dst):
    """앞뒤 무음 제거(데드에어 0)."""
    # 앞 무음 트림 → 역재생 후 앞(=뒤) 트림 → 다시 역재생 (내부 쉼은 보존)
    subprocess.run(['ffmpeg', '-y', '-i', src, '-af',
                    'silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05,'
                    'areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.15,areverse',
                    dst], capture_output=True)
    r = subprocess.run(['ffprobe', '-v', 'quiet', '-show_entries', 'format=duration', '-of', 'csv=p=0', dst],
                       capture_output=True, text=True)
    try:
        return round(float(r.stdout.strip()), 2)
    except Exception:
        return None


def chunks_of(text):
    """내레이션을 짧은 구로 분할(카라오케 표시 단위, ~9자)."""
    text = text.strip()
    parts = re.split(r'(?<=[,.\?!—])\s+', text)
    out = []
    for p in parts:
        p = p.strip().strip(',.')
        if not p:
            continue
        cur = ''
        for w in p.split(' '):
            if not cur or len((cur + ' ' + w).strip()) <= 9:
                cur = (cur + ' ' + w).strip()
            else:
                out.append(cur); cur = w
        if cur:
            out.append(cur)
    out = [c for c in out if re.search(r'[0-9A-Za-z가-힣]', c)]   # 순수 문장부호 청크 제거
    return out or [text]


def cap_png(text, path, fsize=86):
    """카라오케형 1구 자막 PNG(중앙정렬, 숫자/단위 노랑, 두꺼운 스트로크+섀도)."""
    font = ImageFont.truetype(FONT, fsize, index=0)
    toks = text.split(' ')
    widths = [font.getbbox(t)[2] for t in toks]
    sp = font.getbbox(' ')[2]
    total = sum(widths) + sp * (len(toks) - 1)
    lh = fsize + 26
    img = Image.new('RGBA', (W, lh + 40), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    x = (W - total) // 2
    y = 20
    for t, w in zip(toks, widths):
        col = YELLOW if HL.search(t) else (255, 255, 255, 255)
        d.text((x + 4, y + 5), t, font=font, fill=(0, 0, 0, 200))      # 섀도
        d.text((x, y), t, font=font, fill=col, stroke_width=6, stroke_fill=(0, 0, 0, 255))
        x += w + sp
    img.save(path)
    return img.height


def time_chunks_align(chunks, align, dur):
    """글자별 alignment로 각 구의 실제 표시 구간 산출(연속·발화 50ms 선행)."""
    raw, j = [], 0
    for ck in chunks:
        cs = ck.replace(' ', '')
        k, start, end = 0, None, None
        while j < len(align) and k < len(cs):
            ch, s, e = align[j]
            if ch == cs[k]:
                if start is None:
                    start = s
                end = e; k += 1
            j += 1
        raw.append((ck, start, end))
    spans = []
    for i, (ck, s, e) in enumerate(raw):
        s = s if s is not None else (spans[-1][2] if spans else 0.0)
        nxt = None
        for nj in range(i + 1, len(raw)):
            if raw[nj][1] is not None:
                nxt = raw[nj][1]; break
        end = nxt if nxt is not None else dur
        spans.append((ck, max(0.0, s - 0.05), min(end, dur)))
    return spans


def cap_png_multi(text, path, fsize=56):
    """컷 전체 문장을 작은 글씨로 다줄 렌더(중앙정렬, 숫자/단위 노랑, 스트로크+섀도)."""
    font = ImageFont.truetype(FONT, fsize, index=0)
    maxw = W - 130
    words, lines, cur = text.split(' '), [], ''
    for w in words:
        t = (cur + ' ' + w).strip()
        if not cur or font.getbbox(t)[2] <= maxw:
            cur = t
        else:
            lines.append(cur); cur = w
    if cur:
        lines.append(cur)
    lh = fsize + 18
    img = Image.new('RGBA', (W, lh * len(lines) + 36), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    for i, l in enumerate(lines):
        toks = l.split(' ')
        widths = [font.getbbox(t)[2] for t in toks]
        sp = font.getbbox(' ')[2]
        total = sum(widths) + sp * (len(toks) - 1)
        x, y = (W - total) // 2, 18 + i * lh
        for t, wd in zip(toks, widths):
            col = YELLOW if HL.search(t) else (255, 255, 255, 255)
            d.text((x + 3, y + 4), t, font=font, fill=(0, 0, 0, 200))
            d.text((x, y), t, font=font, fill=col, stroke_width=5, stroke_fill=(0, 0, 0, 255))
            x += wd + sp
    img.save(path)
    return img.height


def build_clip(cut, workdir, wh, is_first):
    idx = cut['idx']
    ndur = cut.get('narration_dur') or cut.get('dur') or 2.0
    dur = max(ndur + 0.25, 1.2)
    out = os.path.join(workdir, f'clip_{idx:02d}.mp4')

    # 자막: 컷 전체 문장을 작은 글씨로 '미리' 통째 표시 (싱크 불필요, 항상 선출력)
    text = (cut.get('narration_kr') or '').strip()
    inputs, loop = [], []
    visual = cut.get('visual_path')
    real = visual and os.path.exists(os.path.join(HERE, visual))
    if real:
        loop = ['-stream_loop', '-1']
        inputs += ['-i', os.path.join(HERE, visual)]
        base = f"[0:v]scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},{GRADE}[bg]"
    else:
        inputs += ['-f', 'lavfi', '-i', f'color=c=0x0a1a24:s={W}x{H}:d={dur}']
        base = f"[0:v]{GRADE}[bg]"

    # 자막 PNG(컷 전체 문장 1장) — 컷 내내 표시
    has_cap = bool(text)
    cap_y = CAP_Y
    if has_cap:
        cp = os.path.join(workdir, f'cap_{idx:02d}.png')
        chh = cap_png_multi(text, cp)
        cap_y = max(880, 1500 - chh)   # 블록 하단 ~1500(UI세이프), 위로 확장
        inputs += ['-i', cp]
    # 오디오 입력(내레이션 + whoosh)
    naudio = cut.get('narration_audio')
    has_narr = naudio and os.path.exists(os.path.join(HERE, naudio))
    if has_narr:
        inputs += ['-i', os.path.join(HERE, naudio)]
    inputs += ['-i', wh]

    # 비디오 필터 체인(전체 자막 1장을 컷 내내 overlay)
    if has_cap:
        chain = base + f";[bg][1:v]overlay=0:{cap_y}:format=auto[vv];[vv]format=yuv420p[v]"
    else:
        chain = base + ";[bg]format=yuv420p[v]"

    # 오디오 인덱스 계산
    narr_i = 1 + (1 if has_cap else 0)
    wh_i = narr_i + (1 if has_narr else 0)
    # apad: 오디오를 비디오 길이(dur)에 맞춰 무음 패딩 → 컷마다 A/V 길이 동일(드리프트 0)
    if has_narr:
        amix = (f";[{narr_i}:a]aresample=44100[na];[{wh_i}:a]volume=0.6[wq];"
                f"[na][wq]amix=inputs=2:duration=first:dropout_transition=0:normalize=0,apad[a]")
    else:
        amix = f";[{wh_i}:a]volume=0.6,aresample=44100,apad[a]"
    fc = chain + amix

    cmd = ['ffmpeg', '-y', *loop, *inputs, '-filter_complex', fc,
           '-map', '[v]', '-map', '[a]', '-t', f'{dur:.2f}',
           '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-r', '30', '-crf', '19', '-preset', 'fast',
           '-c:a', 'aac', '-b:a', '160k', out]
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        print(f"  ❌ 컷{idx}:\n{r.stderr[-700:]}"); raise SystemExit(8)
    return out, dur


def build_cover(thumb, workdir, wh, im, dur=0.8):
    """표지: 줌인 모션 + whoosh+impact (정지 금지)."""
    out = os.path.join(workdir, 'clip_00cover.mp4')
    frames = int(dur * 30)
    sw, sh = int(W * 1.4), int(H * 1.4)   # 2배→1.4배(병렬 부하·OOM 방지, 1.14 줌엔 충분)
    zoom = (f"scale={sw}:{sh}:force_original_aspect_ratio=increase,crop={sw}:{sh},"
            f"zoompan=z='min(zoom+0.0020,1.14)':d={frames}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':"
            f"s={W}x{H}:fps=30,format=yuv420p[v]")
    cmd = ['ffmpeg', '-y', '-loop', '1', '-i', thumb, '-i', wh, '-i', im,
           '-filter_complex', f"[0:v]{zoom};[1:a]volume=0.7[w];[2:a]volume=0.8[i];"
                              f"[w][i]amix=inputs=2:duration=longest:normalize=0,apad[a]",
           '-map', '[v]', '-map', '[a]', '-t', f'{dur:.2f}',
           '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-r', '30', '-crf', '19', '-preset', 'fast',
           '-c:a', 'aac', '-b:a', '160k', out]
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        print(f"  ❌ cover:\n{r.stderr[-700:]}"); raise SystemExit(8)
    return out


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    cuts_path = args[0]
    cuts = json.load(open(cuts_path, encoding='utf-8'))
    outdir = os.path.dirname(cuts_path)
    work = tempfile.mkdtemp(prefix='vviral_')
    wh, im = gen_sfx(work)

    # 내레이션 무음 트림(데드에어 제거). align(정렬)이 있으면 싱크 보존 위해 건너뜀.
    for c in cuts:
        na = c.get('narration_audio')
        if na and not c.get('align') and os.path.exists(os.path.join(HERE, na)):
            tp = os.path.join(work, f"narr_{c['idx']:02d}.mp3")
            nd = trim_narr(os.path.join(HERE, na), tp)
            if nd:
                c['narration_audio'] = os.path.relpath(tp, HERE)
                c['narration_dur'] = nd

    clips = []
    thumb = os.environ.get('THUMB') or os.path.join(outdir, 'thumbnail.jpg')
    if os.path.exists(thumb):
        clips.append(build_cover(thumb, work, wh, im, float(os.environ.get('COVER_SEC', '0.8'))))
        print(f"  🪧 표지(줌+whoosh+impact)")
    for c in cuts:
        clip, dur = build_clip(c, work, wh, c['idx'] == 0)
        clips.append(clip)
        print(f"  컷 {c['idx']} ({c['id']}): {dur:.1f}s [동적자막+whoosh]")

    listf = os.path.join(work, 'list.txt')
    open(listf, 'w').write(''.join(f"file '{c}'\n" for c in clips))
    concat = os.path.join(work, 'concat.mp4')
    subprocess.run(['ffmpeg', '-y', '-f', 'concat', '-safe', '0', '-i', listf, '-c', 'copy', concat],
                   check=True, capture_output=True)

    bgm = os.path.join(outdir, 'music', 'bgm.mp3')
    final = os.path.join(outdir, 'final_viral.mp4')
    GRAIN = "noise=alls=3:allf=t"
    if os.path.exists(bgm):
        # BGM 더킹(내레이션 우선) + 그레인
        fc = (f"[0:v]{GRAIN}[v];"
              f"[1:a]volume=0.16[m];[0:a][m]sidechaincompress=threshold=0.04:ratio=6:attack=20:release=300[a]")
        r = subprocess.run(['ffmpeg', '-y', '-i', concat, '-stream_loop', '-1', '-i', bgm,
                            '-filter_complex', fc, '-map', '[v]', '-map', '[a]',
                            '-c:v', 'libx264', '-crf', '20', '-preset', 'medium', '-pix_fmt', 'yuv420p',
                            '-c:a', 'aac', '-b:a', '192k', '-shortest', final], capture_output=True, text=True)
        if r.returncode != 0:  # sidechain 실패 시 단순 믹스 폴백
            fc = f"[0:v]{GRAIN}[v];[1:a]volume=0.14[m];[0:a][m]amix=inputs=2:duration=first:normalize=0[a]"
            r = subprocess.run(['ffmpeg', '-y', '-i', concat, '-stream_loop', '-1', '-i', bgm,
                                '-filter_complex', fc, '-map', '[v]', '-map', '[a]',
                                '-c:v', 'libx264', '-crf', '20', '-preset', 'medium', '-pix_fmt', 'yuv420p',
                                '-c:a', 'aac', '-b:a', '192k', '-shortest', final], capture_output=True, text=True)
    else:
        r = subprocess.run(['ffmpeg', '-y', '-i', concat, '-vf', GRAIN, '-c:v', 'libx264', '-crf', '20',
                            '-preset', 'medium', '-pix_fmt', 'yuv420p', '-c:a', 'copy', final],
                           capture_output=True, text=True)
    if r.returncode != 0:
        print(f"  ❌ final:\n{r.stderr[-700:]}"); raise SystemExit(9)

    pr = subprocess.run(['ffprobe', '-v', 'quiet', '-show_entries', 'format=duration', '-of', 'csv=p=0', final],
                        capture_output=True, text=True)
    print(f"\n✅ 떡상 합성: {final}\n   {W}x{H} · {pr.stdout.strip()}s · {os.path.getsize(final)//1024}KB")


if __name__ == '__main__':
    main()
