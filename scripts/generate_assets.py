#!/usr/bin/env python3
"""Generate placeholder icon assets for 钱罐小精灵 mini program."""

import os
from PIL import Image, ImageDraw, ImageFont

BASE = r'C:\Users\zls18\Desktop\pet-adventure-app\miniprogram\assets'

# ── Color palette ──
PRIMARY = '#FF6B8A'       # strawberry pink
INCOME = '#4ECDC4'        # mint green
EXPENSE = '#FF8C5A'       # tangerine orange
BG = '#FFF8F0'            # cream white
ACCENT = '#FFE66D'        # lemon yellow
WHITE = '#FFFFFF'
DARK = '#3D3D3D'
GREY = '#A0A0A0'

# ── Helpers ──
def hex_to_rgb(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))

def make_draw(img):
    return ImageDraw.Draw(img)

def try_font(size=20):
    """Try to load a cute rounded font, fallback to default."""
    paths = [
        'C:/Windows/Fonts/seguiemj.ttf',
        'C:/Windows/Fonts/msyh.ttc',
        'C:/Windows/Fonts/arial.ttf',
    ]
    for p in paths:
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()

def circle(draw, xy, r, fill):
    x, y = xy
    draw.ellipse([x - r, y - r, x + r, y + r], fill=fill)

def rounded_rect(draw, xy, rad, fill):
    x1, y1, x2, y2 = xy
    draw.rounded_rectangle([x1, y1, x2, y2], radius=rad, fill=fill)

def save(img, path):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    img.save(path)
    print(f'  ✓ {path}')

# ── 1. TAB BAR ICONS (81x81) ──
def gen_tab_icons():
    print('\n📱 Generating tab bar icons...')
    tabs = {
        'island': ('🏝', PRIMARY),
        'stats': ('📊', INCOME),
        'records': ('📋', EXPENSE),
        'profile': ('👤', '#B8A9C9'),
    }

    for name, (emoji, color) in tabs.items():
        # Active version — filled circle with emoji
        img = Image.new('RGBA', (81, 81), (0, 0, 0, 0))
        d = make_draw(img)
        circle(d, (40, 40), 38, hex_to_rgb(color))
        font = try_font(36)
        bbox = d.textbbox((0, 0), emoji, font=font)
        tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
        d.text((40 - tw//2, 38 - th//2), emoji, font=font, embedded_color=True)
        save(img, f'{BASE}/icons/{name}-active.png')

        # Inactive version — outlined circle with grey emoji
        img2 = Image.new('RGBA', (81, 81), (0, 0, 0, 0))
        d2 = make_draw(img2)
        d2.ellipse([4, 4, 76, 76], outline=hex_to_rgb(GREY), width=3)
        font2 = try_font(36)
        bbox2 = d2.textbbox((0, 0), emoji, font=font2)
        tw2, th2 = bbox2[2] - bbox2[0], bbox2[3] - bbox2[1]
        d2.text((40 - tw2//2, 38 - th2//2), emoji, font=font2, embedded_color=True)
        save(img2, f'{BASE}/icons/{name}.png')

# ── 2. CATEGORY ICONS (120x120) ──
def gen_category_icons():
    print('\n📂 Generating category icons...')
    categories = {
        'expense': {
            'food': ('🍔', '#FF8C5A'),
            'transport': ('🚗', '#4ECDC4'),
            'shopping': ('🛒', '#FF6B8A'),
            'housing': ('🏠', '#A0A0A0'),
            'entertainment': ('🎮', '#FFE66D'),
            'medical': ('💊', '#FF4757'),
            'education': ('📚', '#B8A9C9'),
            'social': ('🎁', '#FFB347'),
            'pet': ('🐱', '#87CEEB'),
            'other': ('📦', '#D3D3D3'),
        },
        'income': {
            'salary': ('💼', '#4ECDC4'),
            'side-job': ('💻', '#87CEEB'),
            'investment': ('📈', '#FFE66D'),
            'refund': ('↩️', '#A0A0A0'),
            'gift-money': ('🎁', '#FF6B8A'),
            'income-other': ('📦', '#D3D3D3'),
        },
    }

    for cat_type, cats in categories.items():
        for cat_id, (emoji, color) in cats.items():
            img = Image.new('RGBA', (120, 120), (0, 0, 0, 0))
            d = make_draw(img)

            # Background circle with 20% opacity
            r, g, b = hex_to_rgb(color)
            bg_color = (r, g, b, 51)
            overlay = Image.new('RGBA', (120, 120), (0, 0, 0, 0))
            od = make_draw(overlay)
            circle(od, (60, 60), 55, bg_color)
            img = Image.alpha_composite(img, overlay)
            d = make_draw(img)

            # Border circle
            d.ellipse([8, 8, 111, 111], outline=(r, g, b, 255), width=3)

            # Emoji
            font = try_font(50)
            bbox = d.textbbox((0, 0), emoji, font=font)
            tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
            d.text((60 - tw//2, 56 - th//2), emoji, font=font, embedded_color=True)

            save(img, f'{BASE}/icons/categories/{cat_id}.png')

# ── 3. PET SPRITE PLACEHOLDERS (300x300) ──
def gen_pet_sprites():
    print('\n🐾 Generating pet sprite placeholders...')

    pets = [
        ('fat-cat', '🐱', '#FF8C5A'),
        ('round-bear', '🐻', '#8B4513'),
        ('soft-bunny', '🐰', '#FFB6C1'),
        ('mochi', '🍡', '#FFFFFF'),
        ('dino', '🦕', '#228B22'),
        ('fat-bird', '🐦', '#87CEEB'),
        ('seal', '🦭', '#808080'),
        ('cream-fox', '🦊', '#FFDAB9'),
        ('shiba', '🐕', '#FF8C00'),
        ('hamster', '🐹', '#D2691E'),
        ('hippo', '🦛', '#9370DB'),
        ('penguin', '🐧', '#4169E1'),
        ('narwhal', '🐋', '#4ECDC4'),
        ('cotton-cloud', '☁️', '#E0E0E0'),
        ('star-unicorn', '🦄', '#9370DB'),
        ('jelly-dragon', '🐉', '#FF69B4'),
        ('cream-phoenix', '🔥', '#FFD700'),
        ('crystal-slime', '🫧', '#87CEEB'),
        ('rainbow-mochi', '🌈', '#FFB6C1'),
        ('gold-carrot-bunny', '🥕', '#FFD700'),
        ('mooncake-cat', '🥮', '#FF8C5A'),
        ('tangyuan-mochi', '🍡', '#FFFFFF'),
        ('zongzi-dino', '🦕', '#228B22'),
        ('snowflake-spirit', '❄️', '#E0FFFF'),
    ]

    stages = ['baby', 'young', 'adult']
    stage_sizes = {'baby': 140, 'young': 200, 'adult': 260}

    for pet_id, emoji, color in pets:
        for stage in stages:
            size = stage_sizes[stage]
            img = Image.new('RGBA', (300, 300), (0, 0, 0, 0))
            d = make_draw(img)

            # Shadow ellipse
            shadow_y = 260
            d.ellipse([80, shadow_y - 10, 220, shadow_y + 10], fill=(0, 0, 0, 40))

            # Body circle
            r, g, b = hex_to_rgb(color)
            cx, cy = 150, 150
            circle(d, (cx, cy), size // 2, (r, g, b, 255))

            # Lighter highlight
            hl_r = min(r + 60, 255)
            hl_g = min(g + 60, 255)
            hl_b = min(b + 60, 255)
            circle(d, (cx - 20, cy - 20), size // 5, (hl_r, hl_g, hl_b, 120))

            # Eyes
            eye_y = cy - 20
            if stage == 'baby':
                # Big baby eyes
                circle(d, (cx - 22, eye_y), 12, (255, 255, 255, 255))
                circle(d, (cx + 22, eye_y), 12, (255, 255, 255, 255))
                circle(d, (cx - 20, eye_y - 2), 6, DARK)
                circle(d, (cx + 24, eye_y - 2), 6, DARK)
            elif stage == 'young':
                circle(d, (cx - 20, eye_y), 10, (255, 255, 255, 255))
                circle(d, (cx + 20, eye_y), 10, (255, 255, 255, 255))
                circle(d, (cx - 19, eye_y - 1), 5, DARK)
                circle(d, (cx + 21, eye_y - 1), 5, DARK)
            else:
                # Adult — slightly smaller eyes with eyebrows
                circle(d, (cx - 18, eye_y), 9, (255, 255, 255, 255))
                circle(d, (cx + 18, eye_y), 9, (255, 255, 255, 255))
                circle(d, (cx - 17, eye_y - 1), 4, DARK)
                circle(d, (cx + 19, eye_y - 1), 4, DARK)

            save(img, f'{BASE}/sprites/{pet_id}-{stage}.png')

        # Idle GIF placeholder (just the adult version)
        save(img, f'{BASE}/sprites/{pet_id}-idle.png')

    # Default pet-idle for empty states
    default = Image.new('RGBA', (300, 300), (0, 0, 0, 0))
    dd = make_draw(default)
    circle(dd, (150, 150), 100, hex_to_rgb(PRIMARY))
    font = try_font(60)
    dd.text((110, 115), '🐱', font=font, embedded_color=True)
    save(default, f'{BASE}/sprites/pet-idle.png')

    # Current pet display
    current = Image.new('RGBA', (300, 300), (0, 0, 0, 0))
    cd = make_draw(current)
    circle(cd, (150, 150), 120, hex_to_rgb(PRIMARY))
    font = try_font(80)
    cd.text((100, 100), '🐱', font=font, embedded_color=True)
    save(current, f'{BASE}/sprites/current-pet.png')

# ── 4. MISC ──
def gen_misc():
    print('\n🎨 Generating misc assets...')
    # Transparent 1x1 placeholder
    img = Image.new('RGBA', (1, 1), (0, 0, 0, 0))
    save(img, f'{BASE}/sprites/transparent.png')

# ── MAIN ──
if __name__ == '__main__':
    import sys
    sys.stdout.reconfigure(encoding='utf-8')
    print('Pet Adventure - Asset Generator')
    gen_tab_icons()
    gen_category_icons()
    gen_pet_sprites()
    gen_misc()
    print('\nAll assets generated!')
