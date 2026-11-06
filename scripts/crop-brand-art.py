"""Crop the interim Prendidos brand art from the AI drafts in docs/brand/references.

Usage (needs Pillow, e.g. in a throwaway venv):
    python3 scripts/crop-brand-art.py docs/brand/references assets/images [--cards-only]

Writes the mascot and avatar PNGs (transparent backgrounds) to <assets>/brand/ and the
native identity images (icon, Android adaptive layers, splash, favicon) to <assets>/.
It also writes the card illustration library pieces (CARD_ILLUSTRATIONS) to
<assets>/brand/card-<key>.png. `--cards-only` writes just those, leaving every other
asset untouched.
Crop boxes are in the 1932 px display coordinates of the 2000 px sheets, and in raw
pixels for any other sheet (e.g. the 2752 x 1536 card-illustrations sheet).
"""
import sys, os
from collections import deque
from PIL import Image, ImageFilter

REFS, ASSETS = sys.argv[1], sys.argv[2]
CARDS_ONLY = '--cards-only' in sys.argv[3:]
OUT = os.path.join(ASSETS, 'brand')
os.makedirs(OUT, exist_ok=True)
SCALE = 2000 / 1932  # sheet display coords -> source pixels

def is_white(p): return p[0] > 228 and p[1] > 228 and p[2] > 228
def is_red(p): return p[0] > 120 and p[1] < 70 and p[2] < 70

def flood_background(w, h, open_px, seed_bottom):
    """Border-connected pixels for which `open_px(i)` is true."""
    bg = bytearray(w * h); q = deque()
    for x in range(w):
        q.append((x, 0))
        if seed_bottom: q.append((x, h - 1))
    for y in range(h):
        q.extend([(0, y), (w - 1, y)])
    while q:
        x, y = q.popleft(); i = y * w + x
        if bg[i] or not open_px(i): continue
        bg[i] = 1
        if x > 0: q.append((x - 1, y))
        if x < w - 1: q.append((x + 1, y))
        if y > 0: q.append((x, y - 1))
        if y < h - 1: q.append((x, y + 1))
    return bg

def cut(img, box, is_bg, min_keep=0.03, seed_bottom=True, close_gaps=0, close_from=0.0, seal_spans=()):
    """Make border-connected background transparent and drop small fragments touching the crop edge.
    `seed_bottom=False` keeps a half-body piece cropped where its outline ends from losing its fill.
    `close_gaps=r` seals outline gaps up to about 2r px (open cheeks, a cracked heart): the
    background is found with the outline thickened by r, then grown back r steps over
    background-colored pixels only, so the outside edge stays tight and the fill stays inside.
    `close_from` limits the thickening to the rows below that fraction of the height (open
    half-body bottoms), so whiskers and ears higher up keep their gaps.
    `seal_spans` are (x0, x1) ranges of the box's bottom row, or (x0, x1, y) ranges of another
    row, in sheet pixels, treated as outline: a half-body piece cut where its body and tail lines
    end stays filled inside those spans while the rest of the bottom edge still seeds the background."""
    im = img.crop(tuple(round(v * SCALE) if img.width == 2000 else v for v in box)).convert('RGBA')
    w, h = im.size; px = im.load()
    is_open = bytearray(1 if is_bg(px[i % w, i // w]) else 0 for i in range(w * h))
    for span in seal_spans:
        x0, x1 = span[0], span[1]
        row = span[2] - box[1] if len(span) == 3 else h - 1
        for x in range(max(0, x0 - box[0]), min(w, x1 - box[0] + 1)):
            is_open[row * w + x] = 0
    if not close_gaps:
        bg = flood_background(w, h, lambda i: is_open[i], seed_bottom)
    else:
        ink = Image.frombytes('L', (w, h), bytes(0 if o else 255 for o in is_open))
        thick = bytearray(ink.filter(ImageFilter.MaxFilter(2 * close_gaps + 1)).tobytes())
        for i in range(int(h * close_from) * w):
            thick[i] = 0 if is_open[i] else 255
        bg = flood_background(w, h, lambda i: thick[i] == 0, seed_bottom)
        # Grow back in 8 directions, matching the square thickening, so no rim is left outside.
        frontier = [i for i in range(w * h) if bg[i]]
        for _ in range(close_gaps + 1):
            grown = []
            for i in frontier:
                x, y = i % w, i // w
                for dx in (-1, 0, 1):
                    for dy in (-1, 0, 1):
                        nx, ny = x + dx, y + dy
                        if 0 <= nx < w and 0 <= ny < h:
                            j = ny * w + nx
                            if not bg[j] and is_open[j]:
                                bg[j] = 1; grown.append(j)
            frontier = grown
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

# Card illustration library (docs/brand/README.md § Card Illustration Library):
# (key, sheet, crop box, square). Faces are square; full-body pieces and props keep
# their aspect ratio. Pieces are sized by height: 384 px covers 120 pt at 3x (~360 px),
# and a piece is never upscaled past its source pixels.
CARD_ILLUSTRATION_HEIGHT = 384
CARD_SHEET = 'card-illustrations-ai-draft.jpg'
CARD_SHEET_2 = 'card-illustrations-2-ai-draft.jpg'
CARD_SHEET_3 = 'card-illustrations-3-ai-draft.jpg'
# Raw-pixel grid cells of the 2752 x 1536 sheet (6 x 3, numbers below each row excluded).
CARD_COLS = [14, 468, 922, 1376, 1831, 2286, 2745]
CARD_ROWS = [(34, 451), (530, 963), (1046, 1464)]

def card_cell(number):
    row, col = divmod(number - 1, 6)
    y0, y1 = CARD_ROWS[row]
    return (CARD_COLS[col], y0, CARD_COLS[col + 1], y1)

CARD_ILLUSTRATIONS = [
    ('mascot-surprised', 'mascot-expressions-ai-draft.jpg', (995, 75, 1450, 575), True),  # expressions #3
    ('mascot-monocle', CARD_SHEET, card_cell(1), True),
    ('mascot-reading-book', CARD_SHEET, card_cell(2), False),
    ('mascot-crying', CARD_SHEET, card_cell(3), True),
    ('mascot-sad-map-pin', CARD_SHEET, card_cell(4), False),
    ('mascot-blowing-kiss', CARD_SHEET, card_cell(5), True),
    ('mascot-sunglasses', CARD_SHEET, card_cell(6), True),
    ('mascot-dancing', CARD_SHEET, card_cell(7), False),
    ('mascot-tongue-out', CARD_SHEET, card_cell(8), True),
    ('mascot-annoyed', CARD_SHEET, card_cell(9), True),
    ('mascot-selfie', CARD_SHEET, card_cell(10)[:3] + (939,), False),
    ('mascot-diva', CARD_SHEET, card_cell(11)[:3] + (938,), False),
    ('phone-ringing', CARD_SHEET, card_cell(12), False),
    ('microphone', CARD_SHEET, card_cell(13), False),
    ('animal-wheel', CARD_SHEET, card_cell(14), False),
    ('shot-glass-on-fire', CARD_SHEET, card_cell(15), False),
    ('glasses-toasting', CARD_SHEET, card_cell(16), False),
    ('rooster', CARD_SHEET, card_cell(17), False),
    ('two-dogs', CARD_SHEET, card_cell(18), False),
    # Sheet 2 (HU-15 batch 2): its columns shift per row, so boxes are explicit raw pixels.
    # Half-body cats end at the bottom of their box, where their outline stops.
    ('mascot-heart-eyes', CARD_SHEET_2, (14, 21, 488, 457), True),
    ('mascot-shh', CARD_SHEET_2, (488, 21, 949, 422), False),
    ('mascot-broken-heart', CARD_SHEET_2, (949, 21, 1383, 457), False),
    ('mascot-rose', CARD_SHEET_2, (1383, 21, 1858, 457), False),
    ('mascot-hug', CARD_SHEET_2, (1858, 21, 2291, 426), False),
    ('mascot-telenovela', CARD_SHEET_2, (2291, 21, 2745, 423), False),
    ('mascot-fingers-crossed', CARD_SHEET_2, (14, 523, 482, 936), False),
    ('mascot-thinking', CARD_SHEET_2, (482, 523, 904, 944), False),
    ('mascot-megaphone', CARD_SHEET_2, (904, 523, 1465, 932), False),
    ('chat-bubbles', CARD_SHEET_2, (1465, 523, 1844, 980), False),
    ('like-heart', CARD_SHEET_2, (1844, 523, 2264, 980), False),
    ('heart-arrow', CARD_SHEET_2, (2264, 523, 2745, 980), False),
    ('theater-masks', CARD_SHEET_2, (14, 1046, 498, 1470), False),
    ('disco-ball', CARD_SHEET_2, (498, 1046, 959, 1470), False),
    ('moon-stars', CARD_SHEET_2, (959, 1046, 1399, 1470), False),
    ('gift-box', CARD_SHEET_2, (1399, 1046, 1858, 1470), False),
    ('ring-box', CARD_SHEET_2, (1858, 1046, 2264, 1470), False),
    ('pizza-slice', CARD_SHEET_2, (2264, 1046, 2745, 1470), False),
    # Sheet 3 (HU-15 batch 3): explicit raw-pixel boxes per row, half-body cats sealed below.
    ('voice-note', CARD_SHEET_3, (14, 21, 482, 479), False),
    ('mascot-typing', CARD_SHEET_3, (482, 21, 947, 439), False),
    ('emoji-faces', CARD_SHEET_3, (947, 21, 1415, 479), False),
    ('mascot-phone-shock', CARD_SHEET_3, (1415, 21, 1830, 479), False),
    ('mascot-kissing', CARD_SHEET_3, (1830, 21, 2291, 479), True),
    ('mascot-blushing', CARD_SHEET_3, (2291, 21, 2745, 459), False),
    ('photo-camera', CARD_SHEET_3, (14, 530, 495, 980), False),
    ('profile-card', CARD_SHEET_3, (495, 530, 977, 980), False),
    ('photo-gallery', CARD_SHEET_3, (977, 530, 1362, 980), False),
    ('mascot-posing', CARD_SHEET_3, (1362, 530, 1847, 980), False),
    ('mascot-spa', CARD_SHEET_3, (1847, 530, 2287, 945), False),
    ('staring-eyes', CARD_SHEET_3, (2287, 530, 2745, 980), False),
    ('stopwatch', CARD_SHEET_3, (14, 1039, 464, 1456), False),
    ('rock-paper-scissors', CARD_SHEET_3, (464, 1039, 956, 1396), False),
    ('dance-shoes', CARD_SHEET_3, (956, 1039, 1399, 1456), False),
    ('headphones-music', CARD_SHEET_3, (1399, 1039, 1847, 1456), False),
    ('mascot-gossip', CARD_SHEET_3, (1847, 1039, 2277, 1430), False),
    ('confetti', CARD_SHEET_3, (2277, 1039, 2745, 1456), False),
]

def fit_card(im, square, pad=0.04):
    """Pad the piece (square for faces) and scale it to the card height in one step, never upscaling.
    Flat art keeps its look as a 256-color palette PNG, about a third of the RGBA size."""
    side = max(im.size)
    w, h = (side, side) if square else im.size
    canvas_w, canvas_h = round(w * (1 + 2 * pad)), round(h * (1 + 2 * pad))
    c = Image.new('RGBA', (canvas_w, canvas_h), (0, 0, 0, 0))
    c.paste(im, ((canvas_w - im.width) // 2, (canvas_h - im.height) // 2), im)
    ratio = min(1.0, CARD_ILLUSTRATION_HEIGHT / canvas_h)
    if ratio < 1.0:
        c = c.resize((round(canvas_w * ratio), round(canvas_h * ratio)), Image.LANCZOS)
    return c.quantize(colors=256, method=Image.Quantize.FASTOCTREE)

# Half-body pieces are cut where their tail and body lines still reach the box's bottom row;
# these spans (sheet x pixels) of that row close the tail and the body so they stay filled.
SEALS = {
    'mascot-selfie': [(1447, 1480), (1489, 1675)],
    'mascot-diva': [(1899, 1934), (1955, 2126)],
    'mascot-shh': [(622, 818)],
    'mascot-hug': [(1970, 2162)],
    'mascot-telenovela': [(2423, 2635)],
    'mascot-fingers-crossed': [(94, 129), (179, 336)],
    'mascot-thinking': [(566, 601), (646, 803)],
    'mascot-megaphone': [(989, 1022), (1046, 1221)],
    'mascot-typing': [(562, 602), (621, 871)],
    'mascot-blushing': [(2422, 2593)],
    'mascot-spa': [(1913, 2218)],
    'rock-paper-scissors': [(543, 637), (801, 892), (672, 765, 1330)],
    'mascot-gossip': [(1950, 2182)],
}

# Pieces whose outline has small gaps the background would leak through:
# (radius in px, fraction of the height where the thickening starts).
CLOSE_GAPS = {
    'mascot-broken-heart': (8, 0.0),
}

sheets = {}
for key, sheet, box, square in CARD_ILLUSTRATIONS:
    if sheet not in sheets:
        sheets[sheet] = Image.open(os.path.join(REFS, sheet)).convert('RGB')
    piece = cut(
        sheets[sheet], box, is_white,
        close_gaps=CLOSE_GAPS.get(key, (0, 0.0))[0], close_from=CLOSE_GAPS.get(key, (0, 0.0))[1],
        seal_spans=SEALS.get(key, ()),
    )
    fit_card(piece, square).save(os.path.join(OUT, f'card-{key}.png'), optimize=True)

if CARDS_ONLY:
    print('done (cards only)')
    sys.exit(0)

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
