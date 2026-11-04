"""Draws assets/favicon-64.png and assets/og-image.png (needs Pillow). Run: python3 tests/images.py"""
from PIL import Image, ImageDraw, ImageFont
import os
A = os.path.join(os.path.dirname(__file__), '..', 'assets')
INK, VOLT, CHALK, PLATE = (12, 14, 17), (214, 255, 61), (241, 239, 230), (29, 33, 40)

def bar(d, cx, cy, s):
    d.rounded_rectangle([cx - 24*s, cy - 3*s, cx + 24*s, cy + 3*s], 2*s, fill=CHALK)
    for sx in (-1, 1):
        d.rounded_rectangle([cx + sx*21*s - 2.5*s, cy - 10*s, cx + sx*21*s + 2.5*s, cy + 10*s], 2*s, fill=VOLT)
        d.rounded_rectangle([cx + sx*14*s - 1.5*s, cy - 7*s, cx + sx*14*s + 1.5*s, cy + 7*s], 1.5*s, fill=CHALK)

def font(size):
    for p in ['/System/Library/Fonts/Supplemental/Arial Narrow Bold Italic.ttf', '/System/Library/Fonts/Supplemental/Arial Narrow Bold.ttf',
              '/System/Library/Fonts/Supplemental/Impact.ttf', '/System/Library/Fonts/Helvetica.ttc']:
        if os.path.exists(p): return ImageFont.truetype(p, size)
    return ImageFont.load_default()

f = Image.new('RGB', (256, 256), INK); d = ImageDraw.Draw(f)
d.rounded_rectangle([8, 8, 248, 248], 44, fill=PLATE); bar(d, 128, 128, 4.4)
f.resize((64, 64), Image.LANCZOS).save(os.path.join(A, 'favicon-64.png'))

W, H = 1200, 630
im = Image.new('RGB', (W, H), INK); d = ImageDraw.Draw(im)
for x in range(-H, W, 60): d.line([(x, H), (x + H, 0)], fill=(20, 23, 28), width=2)
d.text((70, 120), 'ATLAS', font=font(210), fill=CHALK)
d.rectangle([74, 372, 330, 380], fill=VOLT)
d.text((74, 410), 'One spec, two native gym apps.', font=font(46), fill=VOLT)
d.text((74, 480), 'SwiftUI on iOS  /  Kotlin Compose on Android', font=font(34), fill=(154, 163, 175))
for i, (x, lab, r) in enumerate([(760, 'iOS', 38), (960, 'Android', 22)]):
    d.rounded_rectangle([x, 110, x + 160, 470], r + 10, fill=(10, 10, 12), outline=(58, 63, 72), width=3)
    d.rounded_rectangle([x + 10, 120, x + 150, 460], r, fill=(242, 242, 247) if i == 0 else (255, 251, 254))
    acc = (10, 122, 255) if i == 0 else (98, 0, 238)
    d.rounded_rectangle([x + 22, 160, x + 138, 190], 8 if i == 0 else 15, fill=acc)
    for k in range(4): d.rounded_rectangle([x + 22, 210 + k*50, x + 138, 250 + k*50], 8 if i == 0 else 14, fill=(255, 255, 255) if i == 0 else (243, 237, 247))
    d.text((x + 80, 500), lab, font=font(30), fill=CHALK, anchor='mt')
bar(d, 600, 560, 1.8) if False else None
im.save(os.path.join(A, 'og-image.png'))
