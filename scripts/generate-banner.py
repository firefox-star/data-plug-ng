"""
Generate an attractive referral share banner for DataPlug.ng
Uses the real network logos and a professional gradient design.
"""
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os

# Canvas: 1080x1080 (Instagram/WhatsApp optimized)
W, H = 1080, 1080
img = Image.new('RGB', (W, H), '#064E3B')
draw = ImageDraw.Draw(img)

# --- Gradient background ---
for y in range(H):
    r = int(6 + (16 - 6) * y / H)
    g = int(78 + (185 - 78) * y / H)
    b = int(59 + (129 - 59) * y / H)
    draw.line([(0, y), (W, y)], fill=(r, g, b))

# --- Decorative circles (blurred) ---
overlay = Image.new('RGBA', (W, H), (0, 0, 0, 0))
odraw = ImageDraw.Draw(overlay)
# Big circle top-right
odraw.ellipse([700, -100, 1200, 400], fill=(255, 255, 255, 25))
# Medium circle bottom-left
odraw.ellipse([-100, 700, 500, 1100], fill=(255, 255, 255, 20))
# Small circle center
odraw.ellipse([400, 300, 700, 600], fill=(255, 255, 255, 15))
overlay = overlay.filter(ImageFilter.GaussianBlur(40))
img.paste(Image.alpha_composite(Image.new('RGBA', (W, H), (0,0,0,0)), overlay).convert('RGB'))

draw = ImageDraw.Draw(img)

# --- Fonts ---
font_bold_path = '/usr/share/fonts/truetype/noto-serif-sc/NotoSerifSC-Black.ttf'
font_sans_path = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
font_sans_reg = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'

try:
    font_title = ImageFont.truetype(font_bold_path, 64)
    font_subtitle = ImageFont.truetype(font_sans_path, 38)
    font_small = ImageFont.truetype(font_sans_path, 30)
    font_tiny = ImageFont.truetype(font_sans_reg, 26)
    font_price = ImageFont.truetype(font_sans_path, 28)
    font_plan = ImageFont.truetype(font_sans_path, 32)
except:
    font_title = ImageFont.load_default()
    font_subtitle = font_title
    font_small = font_title
    font_tiny = font_title
    font_price = font_title
    font_plan = font_title

# --- Top: Logo area ---
# DataPlug.ng title
draw.text((W // 2, 60), "DataPlug.ng", fill='#FFFFFF', font=font_title, anchor='mt')
draw.text((W // 2, 140), "Nigeria's Cheapest Data!", fill='#A7F3D0', font=font_subtitle, anchor='mt')

# --- Network logos row ---
logo_dir = '/home/z/my-project/public/logos'
logos = ['mtn.png', 'airtel.png', 'glo.png', '9mobile.png']
logo_size = 120
logo_y = 220
total_logo_w = len(logos) * logo_size + (len(logos) - 1) * 40
logo_start_x = (W - total_logo_w) // 2

for i, logo_name in enumerate(logos):
    logo_path = os.path.join(logo_dir, logo_name)
    if os.path.exists(logo_path):
        logo_img = Image.open(logo_path).convert('RGBA')
        logo_img = logo_img.resize((logo_size, logo_size), Image.LANCZOS)
        # Add white circle behind
        bg_circle = Image.new('RGBA', (logo_size + 10, logo_size + 10), (255, 255, 255, 200))
        bg_draw = ImageDraw.Draw(bg_circle)
        bg_draw.ellipse([(0, 0), (logo_size + 9, logo_size + 9)], fill=(255, 255, 255, 200))
        
        offset_x = logo_start_x + i * (logo_size + 40)
        img.paste(bg_circle.convert('RGB'), (offset_x, logo_y))
        img.paste(logo_img.convert('RGB'), (offset_x + 5, logo_y + 5))

# --- Data Plans Cards Section ---
card_y = 380
card_h = 100
card_w = 230
card_margin = 20
cards = [
    ('500MB', '#120'),
    ('1GB', '#240'),
    ('2GB', '#456'),
    ('5GB', '#1020'),
]

# 2 rows x 2 cols
positions = [
    (W // 2 - card_w - card_margin, card_y),
    (W // 2 + card_margin, card_y),
    (W // 2 - card_w - card_margin, card_y + card_h + card_margin),
    (W // 2 + card_margin, card_y + card_h + card_margin),
]

prices = [120, 240, 456, 1020]

for i, (plan_name, price) in enumerate(zip(cards, prices)):
    x, y = positions[i]
    # Card background (white with rounded corners)
    card = Image.new('RGB', (card_w, card_h), '#FFFFFF')
    card_draw = ImageDraw.Draw(card)
    # Add subtle rounded rect effect
    card_draw.rounded_rectangle([(0, 0), (card_w - 1, card_h - 1)], radius=16, fill='#FFFFFF', outline='#D1FAE5', width=2)
    
    # Plan name
    plan_text = plan_name[0]  # name part
    card_draw.text((card_w // 2, 18), plan_text, fill='#064E3B', font=font_plan, anchor='mt')
    # Price
    card_draw.text((card_w // 2, 62), f"#{price}", fill='#059669', font=font_price, anchor='mt')
    
    img.paste(card, (x, y))

# --- Bottom CTA ---
cta_y = 630
# Glow background for CTA
glow = Image.new('RGBA', (W, 120), (0, 0, 0, 0))
glow_draw = ImageDraw.Draw(glow)
glow_draw.rounded_rectangle([(80, 10), (W - 80, 110)], radius=60, fill=(255, 255, 255, 40))
img.paste(Image.alpha_composite(Image.new('RGBA', (W, 120), (0,0,0,0)), glow).convert('RGB'), (0, cta_y))

draw = ImageDraw.Draw(img)
draw.text((W // 2, cta_y + 20), "Sign Up & Get Cheap Data!", fill='#FFFFFF', font=font_subtitle, anchor='mt')

# --- Referral info ---
ref_y = 800
draw.text((W // 2, ref_y), "Earn N3,000 by sharing with friends!", fill='#FDE68A', font=font_small, anchor='mt')

# Share instruction
draw.text((W // 2, ref_y + 50), "Join thousands of Nigerians saving on data", fill='#D1FAE5', font=font_tiny, anchor='mt')

# --- Bottom link ---
draw.text((W // 2, H - 60), "dataplug.ng | Fast | Cheap | Reliable", fill='#6EE7B7', font=font_tiny, anchor='mt')

# Save
output_path = '/home/z/my-project/public/referral-banner.png'
img.save(output_path, 'PNG', quality=95)
print(f"Banner saved to {output_path}")
print(f"Size: {os.path.getsize(output_path)} bytes")
