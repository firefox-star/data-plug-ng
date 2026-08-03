#!/usr/bin/env python3
"""
Generate circular network logo PNGs for a Nigerian VTU data selling website.
Each logo is a 64x64 colored circle with a centered bold white letter.
"""

import os
from PIL import Image, ImageDraw, ImageFont

# --- Configuration ---
SIZE = 64
BG_COLOR = (0, 0, 0, 0)  # transparent background
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "logos")

LOGOS = [
    {"name": "mtn",      "color": "#FFC300", "letter": "M"},
    {"name": "airtel",   "color": "#ED1C24", "letter": "A"},
    {"name": "glo",      "color": "#50B651", "letter": "G"},
    {"name": "9mobile",  "color": "#006B53", "letter": "9"},
]


def hex_to_rgb(hex_color: str) -> tuple:
    """Convert hex color string to (R, G, B) tuple."""
    h = hex_color.lstrip("#")
    return tuple(int(h[i : i + 2], 16) for i in (0, 2, 4))


def get_bold_font(size: int) -> ImageFont.FreeTypeFont:
    """Try to load a bold system font; fall back to the default font."""
    # Common bold font paths (Linux)
    font_candidates = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
        "/usr/share/fonts/truetype/freefont/FreeSansBold.ttf",
        "/usr/share/fonts/TTF/DejaVuSans-Bold.ttf",
    ]
    for path in font_candidates:
        if os.path.exists(path):
            return ImageFont.truetype(path, size)
    # Fallback to default bitmap font
    try:
        return ImageFont.truetype("DejaVuSans-Bold.ttf", size)
    except OSError:
        return ImageFont.load_default()


def create_logo(color_hex: str, letter: str) -> Image.Image:
    """Create a 64x64 circular logo with the given brand color and centered letter."""
    rgb = hex_to_rgb(color_hex)

    img = Image.new("RGBA", (SIZE, SIZE), BG_COLOR)
    draw = ImageDraw.Draw(img)

    # Draw filled circle (with 1px margin for anti-aliasing)
    margin = 2
    bbox = [margin, margin, SIZE - margin - 1, SIZE - margin - 1]
    draw.ellipse(bbox, fill=rgb)

    # Draw centered white letter
    font = get_bold_font(size=int(SIZE * 0.55))
    # Draw with anchor="mm" (middle-middle) for easy centering
    draw.text((SIZE // 2, SIZE // 2), letter, fill="white", font=font, anchor="mm")

    return img


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    for logo in LOGOS:
        img = create_logo(logo["color"], logo["letter"])
        out_path = os.path.join(OUTPUT_DIR, f"{logo['name']}.png")
        img.save(out_path, "PNG")
        print(f"  ✓  {out_path}  ({SIZE}x{SIZE})")

    print(f"\nDone – {len(LOGOS)} logos saved to {os.path.abspath(OUTPUT_DIR)}")


if __name__ == "__main__":
    main()
