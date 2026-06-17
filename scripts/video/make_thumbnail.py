#!/usr/bin/env python3
"""make_thumbnail.py — 쇼츠용 '클릭되는' 썸네일 생성 (칩인사이드 승자 패턴 반영).

요소: 시네마틱 프레임 + 하단 스크림 + 큰 Pretendard-Black 2줄 + 노란 키워드 강조 + (선택)상단 태그.
사용: python3 make_thumbnail.py <base.jpg> <out.jpg> "1줄|키워드1,키워드2" "2줄|키워드" ["상단태그"]
키워드(노랑) 외 텍스트는 흰색. 9:16(1080x1920).
"""
import sys, os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

W, H = 1080, 1920
PRET = os.path.expanduser('~/Library/Fonts/Pretendard-Black.ttf')
YELLOW = (255, 214, 10)
WHITE = (255, 255, 255)
RED = (220, 38, 38)


def load(sz):
    return ImageFont.truetype(PRET if os.path.exists(PRET) else '/System/Library/Fonts/AppleSDGothicNeo.ttc', sz)


def draw_line(d, line, keywords, cy, fsize):
    """가운데 정렬 1줄: 키워드는 노랑, 나머지 흰색. 스트로크+섀도."""
    font = load(fsize)
    toks = line.split(' ')
    widths = [font.getbbox(t)[2] for t in toks]
    space = font.getbbox(' ')[2]
    total = sum(widths) + space * (len(toks) - 1)
    x = (W - total) // 2
    for t, w in zip(toks, widths):
        col = YELLOW if any(k and k in t for k in keywords) else WHITE
        # 섀도
        d.text((x + 4, cy + 5), t, font=font, fill=(0, 0, 0, 200))
        d.text((x, cy), t, font=font, fill=col, stroke_width=4, stroke_fill=(0, 0, 0))
        x += w + space


def main():
    base, out = sys.argv[1], sys.argv[2]
    l1, kw1 = (sys.argv[3].split('|') + [''])[:2]
    l2, kw2 = (sys.argv[4].split('|') + [''])[:2]
    tag = sys.argv[5] if len(sys.argv) > 5 else ''
    k1 = [k.strip() for k in kw1.split(',') if k.strip()]
    k2 = [k.strip() for k in kw2.split(',') if k.strip()]

    img = Image.open(base).convert('RGB')
    # 9:16로 크롭/스케일
    img = img.resize((W, int(img.height * W / img.width)))
    if img.height < H:
        img = img.resize((int(img.width * H / img.height), H))
    img = img.crop(((img.width - W) // 2, (img.height - H) // 2,
                    (img.width - W) // 2 + W, (img.height - H) // 2 + H))
    # 하단 어둡게(스크림) — 텍스트 가독
    scrim = Image.new('L', (1, H), 0)
    for y in range(H):
        scrim.putpixel((0, y), int(225 * max(0, (y - H * 0.45) / (H * 0.55))))
    scrim = scrim.resize((W, H))
    black = Image.new('RGB', (W, H), (0, 0, 6))
    img = Image.composite(black, img, scrim)
    # 살짝 채도/대비
    d = ImageDraw.Draw(img)

    # 상단 태그(빨강 캡슐)
    if tag:
        tf = load(54)
        tw = tf.getbbox(tag)[2]
        d.rounded_rectangle([(W - tw) // 2 - 30, 70, (W + tw) // 2 + 30, 70 + 92], radius=18, fill=RED)
        d.text(((W - tw) // 2, 84), tag, font=tf, fill=WHITE)

    # 2줄 카피 (하단 1/3)
    draw_line(d, l1, k1, H - 470, 104)
    draw_line(d, l2, k2, H - 320, 92)

    img.save(out, quality=92)
    print(f'✅ 썸네일: {out}')


if __name__ == '__main__':
    main()
