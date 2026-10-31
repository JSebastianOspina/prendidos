"""Crop the interim Prendidos brand art from the AI drafts in docs/brand/references.

Usage (needs Pillow, e.g. in a throwaway venv):
    python3 scripts/crop-brand-art.py docs/brand/references assets/images

Writes the mascot and avatar PNGs (transparent backgrounds) to <assets>/brand/ and the
native identity images (icon, Android adaptive layers, splash, favicon) to <assets>/.
Crop boxes are in the 1932 px display coordinates of the 2000 px sheets.
"""
import sys, os
from collections import deque
from PIL import Image

REFS, ASSETS = sys.argv[1], sys.argv[2]
OUT = os.path.join(ASSETS, 'brand')
os.makedirs(OUT, exist_ok=True)
SCALE = 2000 / 1932  # sheet display coords -> source pixels

def is_white(p): return p[0] > 228 and p[1] > 228 and p[2] > 228
def is_red(p): return p[0] > 120 and p[1] < 70 and p[2] < 70

def cut(img, box, is_bg, min_keep=0.03):
    """Make border-connected background transparent and drop small fragments touching the crop edge."""
    im = img.crop(tuple(round(v * SCALE) if img.width == 2000 else v for v in box)).convert('RGBA')
    w, h = im.size; px = im.load()
    bg = bytearray(w * h); q = deque()
    for x in range(w):
        q.extend([(x, 0), (x, h - 1)])
    for y in range(h):
        q.extend([(0, y), (w - 1, y)])
    while q:
        x, y = q.popleft(); i = y * w + x
        if bg[i] or not is_bg(px[x, y]): continue
        bg[i] = 1
        if x > 0: q.append((x - 1, y))
        if x < w - 1: q.append((x + 1, y))
        if y > 0: q.append((x, y - 1))
        if y < h - 1: q.append((x, y + 1))
    # connected components of foreground
    comp = [0] * (w * h); comps = []; cid = 0
    for start in range(w * h):
        if bg[start] or comp[start]: continue
        cid += 1; size = 0; edge = False; q = deque([start]); comp[start] = cid
        while q:
            i = q.popleft(); size += 1; x, y = i % w, i // w
            if x in (0, w - 1) or y in (0, h - 1): edge = True
            for j in ((i - 1) if x > 0 else -1, (i + 1) if x < w - 1 else -1, (i - w) if y > 0 else -1, (i + w) if y < h - 1 else -1):
                if j >= 0 and not bg[j] and not comp[j]:
                    comp[j] = cid; q.append(j)
        comps.append((cid, size, edge))
    total = sum(s for _, s, _ in comps)
    drop = {c for c, s, e in comps if (e and s < min_keep * total) or s < 12}
    for i in range(w * h):
        if bg[i] or comp[i] in drop:
            px[i % w, i // w] = (0, 0, 0, 0)
    return im.crop(im.getbbox())

def fit(im, size, pad=0.08, square=True):
    side = max(im.size); canvas_w = canvas_h = round(side * (1 + 2 * pad))
    if not square:
        canvas_w, canvas_h = round(im.width * (1 + 2 * pad)), round(im.height * (1 + 2 * pad))
    c = Image.new('RGBA', (canvas_w, canvas_h), (0, 0, 0, 0))
    c.paste(im, ((canvas_w - im.width) // 2, (canvas_h - im.height) // 2), im)
    ratio = size / max(c.size)
    return c.resize((round(c.width * ratio), round(c.height * ratio)), Image.LANCZOS)

expr = Image.open(os.path.join(REFS, 'mascot-expressions-ai-draft.jpg')).convert('RGB')
faces = {'wink': (85, 75, 535, 575), 'laugh': (540, 75, 990, 575), 'relaxed': (735, 700, 1195, 1195), 'smirk': (1175, 1300, 1635, 1800)}
for name, box in faces.items():
    fit(cut(expr, box, is_white), 512, pad=0.04).save(os.path.join(OUT, f'mascot-face-{name}.png'))

turn = Image.open(os.path.join(REFS, 'mascot-turnaround-ai-draft.jpg')).convert('RGB')
fit(cut(turn, (699, 1000, 1328, 1915), is_white), 768, pad=0.03, square=False).save(os.path.join(OUT, 'mascot-pose-pointing.png'))

av = Image.open(os.path.join(REFS, 'player-avatars-ai-draft.jpg')).convert('RGB')
cols = [(60, 520), (522, 975), (962, 1432), (1434, 1900)]
rows = [(150, 640), (720, 1245), (1250, 1925)]
n = 0
for (y0, y1) in rows:
    for (x0, x1) in cols:
        n += 1
        fit(cut(av, (x0, y0, x1, y1), is_white), 256, pad=0.06).save(os.path.join(OUT, f'avatar-{n:02d}.png'))

icon = Image.open(os.path.join(REFS, 'app-icon-ai-draft.jpg')).convert('RGB')
icon.resize((1024, 1024), Image.LANCZOS).save(os.path.join(ASSETS, 'icon.png'))
icon.resize((48, 48), Image.LANCZOS).save(os.path.join(ASSETS, 'favicon.png'))
cat = cut(icon, (0, 0, 1024, 1024), is_red)
fit(cat, 1024, pad=0.0).save(os.path.join(OUT, 'mascot-icon-cat.png'))
fit(cat, 1024, pad=0.0).save(os.path.join(ASSETS, 'splash-icon.png'))
# Android adaptive layers: 108 dp canvas with a 66 dp safe zone, so the cat stays under ~61 %.
fg = Image.new('RGBA', (1024, 1024), (0, 0, 0, 0))
small = fit(cat, 600, pad=0.0)
fg.paste(small, ((1024 - small.width) // 2, (1024 - small.height) // 2), small)
fg.save(os.path.join(ASSETS, 'android-icon-foreground.png'))
mono = Image.new('RGBA', fg.size, (255, 255, 255, 0))
mono.putalpha(fg.getchannel('A'))
mono.save(os.path.join(ASSETS, 'android-icon-monochrome.png'))
print('done')
