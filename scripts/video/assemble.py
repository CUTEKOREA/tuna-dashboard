#!/usr/bin/env python3
"""assemble.py — cuts.json + 에셋(내레이션·비주얼·BGM)을 ffmpeg로 9:16 숏폼 mp4 합성.

이 ffmpeg 빌드엔 drawtext(libfreetype) 필터가 없음 → 자막은 Pillow로 PNG 렌더 후 overlay 합성.
컷별: [비주얼 or 색배경] + [자막 PNG overlay] + [내레이션] → concat → BGM 믹스.
--dry : 비주얼/내레이션/BGM 없이 색배경+자막+컷길이만 러프컷(파이프라인 검증).
사용: python3 assemble.py [out/<name>/cuts.json] [--dry]
출력: out/<name>/final.mp4 (1080x1920)
"""
import json, os, sys, subprocess, tempfile
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(__file__)
W, H = 1080, 1920
FONT = '/System/Library/Fonts/AppleSDGothicNeo.ttc'
PALETTE = ['0x0b3d5c', '0x0e4a6b', '0x123f5c', '0x1a5276', '0x0e7490', '0x0a3d62', '0x102a43']
SUB_Y = 1480  # 자막 세로 위치(상단 기준)


def wrap(text, font, maxw):
    """공백 기준 줄바꿈해 maxw 픽셀 이내로."""
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
    """한국어 자막 → 반투명 박스 + 흰 글씨 PNG (1080xH투명)."""
    fsize, pad, lh = 56, 28, 74
    font = ImageFont.truetype(FONT, fsize, index=0)
    lines = wrap(text, font, W - 160)
    box_h = lh * len(lines) + pad * 2
    img = Image.new('RGBA', (W, box_h), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    # 반투명 박스 (가운데 정렬, 가장 긴 줄 기준)
    maxw = max((font.getbbox(l)[2] for l in lines), default=0)
    bx0 = (W - maxw) // 2 - pad
    d.rounded_rectangle([bx0, 0, W - bx0, box_h], radius=22, fill=(8, 20, 35, 200))
    for i, l in enumerate(lines):
        lw = font.getbbox(l)[2]
        d.text(((W - lw) // 2, pad + i * lh), l, font=font, fill=(255, 255, 255, 255))
    img.save(path)
    return box_h


def build_clip(cut, dry, workdir):
    idx = cut['idx']
    ndur = cut.get('narration_dur')
    dur = max((ndur + 0.4) if ndur else cut['dur'], 1.0)
    out = os.path.join(workdir, f'clip_{idx:02d}.mp4')

    # 자막 PNG
    sub = (cut['subtitle'] or '').strip()
    sub_png = os.path.join(workdir, f'sub_{idx:02d}.png')
    has_sub = bool(sub)
    if has_sub:
        make_subtitle_png(sub, sub_png)

    # 비디오 베이스
    visual = cut.get('visual_path')
    real_visual = visual and os.path.exists(os.path.join(HERE, visual)) and not dry
    inputs, loop = [], []
    if real_visual:
        loop = ['-stream_loop', '-1']
        inputs += ['-i', os.path.join(HERE, visual)]
        base = f"[0:v]scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H}[bg]"
    else:
        color = PALETTE[idx % len(PALETTE)]
        inputs += ['-f', 'lavfi', '-i', f'color=c={color}:s={W}x{H}:d={dur}']
        base = f"[0:v]null[bg]"

    # 자막 overlay
    if has_sub:
        inputs += ['-i', sub_png]
        vchain = f"{base};[bg][1:v]overlay=0:{SUB_Y}:format=auto,format=yuv420p[v]"
    else:
        vchain = f"{base};[bg]format=yuv420p[v]"

    # 오디오
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
           '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-r', '30',
           '-c:a', 'aac', '-b:a', '128k', '-shortest', out]
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        print(f"  ❌ ffmpeg(컷{idx}):\n{r.stderr[-400:]}")
        raise SystemExit(8)
    return out, dur


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    dry = '--dry' in sys.argv
    cuts_path = args[0] if args else os.path.join(HERE, 'out', 'pilot_script_tuna_extract', 'cuts.json')
    cuts = json.load(open(cuts_path, encoding='utf-8'))
    outdir = os.path.dirname(cuts_path)
    work = tempfile.mkdtemp(prefix='vasm_')

    clips = []
    for c in cuts:
        clip, dur = build_clip(c, dry, work)
        clips.append(clip)
        print(f"  컷 {c['idx']} ({c['id']}): {dur:.1f}s {'[더미]' if dry else ''}")

    listf = os.path.join(work, 'list.txt')
    with open(listf, 'w') as f:
        for cl in clips:
            f.write(f"file '{cl}'\n")
    concat = os.path.join(work, 'concat.mp4')
    subprocess.run(['ffmpeg', '-y', '-f', 'concat', '-safe', '0', '-i', listf,
                    '-c', 'copy', concat], check=True, capture_output=True)

    bgm = os.path.join(outdir, 'music', 'bgm.mp3')
    final = os.path.join(outdir, 'final.mp4')
    if os.path.exists(bgm) and not dry:
        # BGM을 -stream_loop로 영상 전체에 깔고 0.15 볼륨으로 더킹(내레이션 우선). -shortest로 영상 길이에 맞춤.
        subprocess.run(['ffmpeg', '-y', '-i', concat, '-stream_loop', '-1', '-i', bgm,
                        '-filter_complex', '[1:a]volume=0.15[bg];[0:a][bg]amix=inputs=2:duration=first:dropout_transition=0[a]',
                        '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-shortest', final],
                       check=True, capture_output=True)
    else:
        subprocess.run(['ffmpeg', '-y', '-i', concat, '-c', 'copy', final], check=True, capture_output=True)

    r = subprocess.run(['ffprobe', '-v', 'quiet', '-show_entries', 'format=duration',
                        '-of', 'csv=p=0', final], capture_output=True, text=True)
    size = os.path.getsize(final) // 1024
    print(f"\n✅ 합성 완료: {final}\n   {W}x{H} · {r.stdout.strip()}s · {size}KB {'(러프컷/더미)' if dry else ''}")


if __name__ == '__main__':
    main()
