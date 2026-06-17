#!/usr/bin/env python3
"""assemble_cine.py — 헐리우드급 마감 합성 (assemble.py의 시네마틱 버전).

차이점:
- 자막: 박스 제거 → 드롭섀도 + 스트로크 + cyan 액센트 언더바 (영화식, 가독성↑)
- 컷별 컬러그레이드: teal-orange + 대비/채도 + 비네팅
- 최종 패스: 필름 그레인 + BGM 더킹
입력: out/<name>/cuts.json  (gen_narration·gen_visuals·gen_music 후)
출력: out/<name>/final_cine.mp4 (1080x1920)
사용: python3 assemble_cine.py out/<name>/cuts.json [--dry]
"""
import json, os, sys, subprocess, tempfile
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(__file__)
W, H = 1080, 1920
import os.path as _op
# 상업/프리미엄 한글 폰트: Pretendard-Black (광고·방송 자막 느낌). 없으면 시스템 폰트 폴백.
_PRET = _op.expanduser('~/Library/Fonts/Pretendard-Black.ttf')
FONT = _PRET if _op.exists(_PRET) else '/System/Library/Fonts/AppleSDGothicNeo.ttc'
PALETTE = ['0x06141f', '0x07182233', '0x0a1f2e', '0x06181f', '0x081c28', '0x05131c', '0x0a1a24']
SUB_Y = 1500
ACCENT = (34, 211, 238, 255)  # cyan-400

# 컷별 시네마틱 그레이드(teal-orange) + 비네팅
GRADE = ("eq=contrast=1.10:saturation=1.16:gamma=0.97,"
         "colorbalance=rs=-0.06:gs=-0.02:bs=0.06:rm=0.04:gm=0.0:bm=-0.03:rh=0.08:gh=0.02:bh=-0.07,"
         "vignette=PI/5")


def wrap(text, font, maxw):
    words, lines, cur = text.split(' '), [], ''
    for w in words:
        t = (cur + ' ' + w).strip()
        if font.getbbox(t)[2] <= maxw or not cur:
            cur = t
        else:
            lines.append(cur); cur = w
    if cur:
        lines.append(cur)
    return lines


def make_subtitle_png(text, path):
    """영화식 자막: 박스 없음. 드롭섀도+스트로크 흰 글씨 + cyan 언더바."""
    fsize, lh, pad = 62, 82, 40
    font = ImageFont.truetype(FONT, fsize, index=0)
    lines = wrap(text, font, W - 150)
    box_h = lh * len(lines) + pad * 2 + 24
    img = Image.new('RGBA', (W, box_h), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    maxw = 0
    for i, l in enumerate(lines):
        lw = font.getbbox(l)[2]
        maxw = max(maxw, lw)
        x, y = (W - lw) // 2, pad + i * lh
        # 드롭 섀도(부드럽게 여러겹)
        for dx, dy, a in [(5, 6, 150), (3, 4, 120)]:
            d.text((x + dx, y + dy), l, font=font, fill=(0, 0, 0, a))
        # 스트로크 + 흰 본문
        try:
            d.text((x, y), l, font=font, fill=(255, 255, 255, 255),
                   stroke_width=2, stroke_fill=(2, 10, 18, 235))
        except TypeError:
            d.text((x, y), l, font=font, fill=(255, 255, 255, 255))
    # cyan 액센트 언더바 (마지막 줄 아래 중앙)
    bar_w = min(int(maxw * 0.42), 360)
    by = pad + lh * len(lines) + 14
    bx = (W - bar_w) // 2
    d.rounded_rectangle([bx, by, bx + bar_w, by + 8], radius=4, fill=ACCENT)
    img.save(path)
    return box_h


def build_cover(thumb, workdir, dur):
    """디자인 썸네일을 영상 맨 앞 표지 프레임으로(정지, 무음). 첫 프레임=피드 썸네일 일치."""
    out = os.path.join(workdir, 'clip_00cover.mp4')
    cmd = ['ffmpeg', '-y', '-loop', '1', '-i', thumb,
           '-f', 'lavfi', '-i', 'anullsrc=channel_layout=stereo:sample_rate=44100',
           '-t', f'{dur:.2f}',
           '-filter_complex', f'[0:v]scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},format=yuv420p[v]',
           '-map', '[v]', '-map', '1:a',
           '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-r', '30', '-crf', '19', '-preset', 'fast',
           '-c:a', 'aac', '-b:a', '160k', '-shortest', out]
    subprocess.run(cmd, check=True, capture_output=True)
    return out


def build_clip(cut, dry, workdir):
    idx = cut['idx']
    ndur = cut.get('narration_dur')
    dur = max((ndur + 0.35) if ndur else cut['dur'], 1.0)
    out = os.path.join(workdir, f'clip_{idx:02d}.mp4')

    sub = (cut['subtitle'] or '').strip()
    sub_png = os.path.join(workdir, f'sub_{idx:02d}.png')
    has_sub = bool(sub)
    if has_sub:
        make_subtitle_png(sub, sub_png)

    visual = cut.get('visual_path')
    real_visual = visual and os.path.exists(os.path.join(HERE, visual)) and not dry
    inputs, loop = [], []
    if real_visual:
        loop = ['-stream_loop', '-1']
        inputs += ['-i', os.path.join(HERE, visual)]
        base = (f"[0:v]scale={W}:{H}:force_original_aspect_ratio=increase,"
                f"crop={W}:{H},{GRADE}[bg]")
    else:
        color = PALETTE[idx % len(PALETTE)].split('0x')[-1][:6] or '0a1a24'
        inputs += ['-f', 'lavfi', '-i', f'color=c=0x{color}:s={W}x{H}:d={dur}']
        base = f"[0:v]{GRADE}[bg]"

    if has_sub:
        inputs += ['-i', sub_png]
        vchain = f"{base};[bg][1:v]overlay=0:{SUB_Y}:format=auto,format=yuv420p[v]"
    else:
        vchain = f"{base};[bg]format=yuv420p[v]"

    naudio = cut.get('narration_audio')
    real_audio = naudio and os.path.exists(os.path.join(HERE, naudio)) and not dry
    aidx = 2 if has_sub else 1
    if real_audio:
        inputs += ['-i', os.path.join(HERE, naudio)]
        amap = ['-map', f'{aidx}:a']
    else:
        inputs += ['-f', 'lavfi', '-i', 'anullsrc=channel_layout=stereo:sample_rate=44100']
        amap = ['-map', f'{aidx}:a']

    cmd = ['ffmpeg', '-y', *loop, *inputs,
           '-filter_complex', vchain, '-map', '[v]', *amap, '-t', f'{dur:.2f}',
           '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-r', '30', '-crf', '19',
           '-preset', 'fast', '-c:a', 'aac', '-b:a', '160k', '-shortest', out]
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        print(f"  ❌ ffmpeg(컷{idx}):\n{r.stderr[-600:]}")
        raise SystemExit(8)
    return out, dur


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    dry = '--dry' in sys.argv
    cuts_path = args[0] if args else os.path.join(HERE, 'out', 'pilot_script_photonics_2026', 'cuts.json')
    cuts = json.load(open(cuts_path, encoding='utf-8'))
    outdir = os.path.dirname(cuts_path)
    work = tempfile.mkdtemp(prefix='vcine_')

    clips = []
    for c in cuts:
        clip, dur = build_clip(c, dry, work)
        clips.append(clip)
        print(f"  컷 {c['idx']} ({c['id']}): {dur:.1f}s {'[더미]' if dry else '[grade+자막]'}")

    # 표지 프레임(디자인 썸네일)을 맨 앞에 prepend — out/<name>/thumbnail.jpg 또는 env THUMB
    thumb = os.environ.get('THUMB') or os.path.join(outdir, 'thumbnail.jpg')
    cover_sec = float(os.environ.get('COVER_SEC', '0.8'))
    if os.path.exists(thumb) and not dry:
        clips.insert(0, build_cover(thumb, work, cover_sec))
        print(f"  🪧 표지 프레임 prepend: {os.path.basename(thumb)} ({cover_sec}s)")

    listf = os.path.join(work, 'list.txt')
    with open(listf, 'w') as f:
        for cl in clips:
            f.write(f"file '{cl}'\n")
    concat = os.path.join(work, 'concat.mp4')
    subprocess.run(['ffmpeg', '-y', '-f', 'concat', '-safe', '0', '-i', listf,
                    '-c', 'copy', concat], check=True, capture_output=True)

    bgm = os.path.join(outdir, 'music', 'bgm.mp3')
    final = os.path.join(outdir, 'final_cine.mp4')
    GRAIN = "noise=alls=3:allf=t"  # 최종 필름 그레인(미세)
    if os.path.exists(bgm) and not dry:
        r = subprocess.run(['ffmpeg', '-y', '-i', concat, '-stream_loop', '-1', '-i', bgm,
            '-filter_complex',
            f"[0:v]{GRAIN}[v];[1:a]volume=0.14[bg];[0:a][bg]amix=inputs=2:duration=first:dropout_transition=0[a]",
            '-map', '[v]', '-map', '[a]', '-c:v', 'libx264', '-crf', '21', '-preset', 'medium',
            '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-shortest', final],
            capture_output=True, text=True)
    else:
        r = subprocess.run(['ffmpeg', '-y', '-i', concat, '-vf', GRAIN,
            '-c:v', 'libx264', '-crf', '18', '-preset', 'medium', '-pix_fmt', 'yuv420p',
            '-c:a', 'copy', final], capture_output=True, text=True)
    if r.returncode != 0:
        print(f"  ❌ ffmpeg(final):\n{r.stderr[-600:]}"); raise SystemExit(9)

    pr = subprocess.run(['ffprobe', '-v', 'quiet', '-show_entries', 'format=duration',
                         '-of', 'csv=p=0', final], capture_output=True, text=True)
    size = os.path.getsize(final) // 1024
    print(f"\n✅ 시네마틱 합성: {final}\n   {W}x{H} · {pr.stdout.strip()}s · {size}KB")


if __name__ == '__main__':
    main()
