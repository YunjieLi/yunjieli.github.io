#!/usr/bin/env python3
"""Build circular mission order icons as SVG from source PNGs."""

import base64
import io
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
MAP_DIR = ROOT / "src/maps/spanish-missions"
ASSETS_DIR = MAP_DIR / "assets"
SIZE = 64
HQ_SIZE = 128
INNER = 52
PADDING = (SIZE - INNER) // 2
BORDER_WIDTH = 5
HQ_BORDER_WIDTH = 10

ORDERS = [
    {
        "order": "Jesuit",
        "source": MAP_DIR / "jesuit.png",
        "border": "#2a6f97",
    },
    {
        "order": "Franciscan",
        "source": MAP_DIR / "franciscan.png",
        "border": "#bc6c25",
    },
    {
        "order": "Dominican",
        "source": MAP_DIR / "donimican.png",
        "border": "#606c38",
    },
]


def remove_light_background(img: Image.Image) -> Image.Image:
    img = img.convert("RGBA")
    pixels = img.load()
    width, height = img.size

    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            if a == 0:
                continue
            brightness = (r + g + b) / 3
            neutral = max(abs(r - g), abs(g - b), abs(r - b)) < 18
            if brightness > 228 and neutral:
                pixels[x, y] = (r, g, b, 0)

    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)

    return img


def fit_emblem(emblem: Image.Image, size: int) -> Image.Image:
    emblem.thumbnail((size, size), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    offset = ((size - emblem.width) // 2, (size - emblem.height) // 2)
    canvas.paste(emblem, offset, emblem)
    return canvas


def build_badge(
    emblem: Image.Image,
    border: str,
    size: int = SIZE,
    border_width: int = BORDER_WIDTH,
) -> Image.Image:
    inner = round(size * INNER / SIZE)
    padding = (size - inner) // 2
    inset = max(2, round(2 * size / SIZE))
    emblem_size = inner - round(8 * size / SIZE)

    badge = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(badge)
    draw.ellipse(
        (inset, inset, size - inset - 1, size - inset - 1),
        fill="#ffffff",
        outline=border,
        width=border_width,
    )

    emblem = fit_emblem(emblem, emblem_size)
    emblem_offset = padding + round(4 * size / SIZE)
    badge.paste(emblem, (emblem_offset, emblem_offset), emblem)
    return badge


def png_to_data_uri(img: Image.Image) -> str:
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    encoded = base64.b64encode(buffer.getvalue()).decode("ascii")
    return f"data:image/png;base64,{encoded}"


def write_svg(path: Path, badge: Image.Image, size: int) -> None:
    data_uri = png_to_data_uri(badge)
    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" viewBox="0 0 {size} {size}">
  <title>Mission icon</title>
  <image href="{data_uri}" width="{size}" height="{size}"/>
</svg>
"""
    path.write_text(svg, encoding="utf-8")


def main() -> None:
    ASSETS_DIR.mkdir(parents=True, exist_ok=True)

    for item in ORDERS:
        emblem = remove_light_background(Image.open(item["source"]))
        slug = item["order"].lower()
        border = item["border"]

        badge = build_badge(emblem, border)
        write_svg(ASSETS_DIR / f"mission-{slug}.svg", badge, SIZE)
        print(f"Wrote mission-{slug}.svg")

        hq_badge = build_badge(emblem, border, HQ_SIZE, HQ_BORDER_WIDTH)
        write_svg(ASSETS_DIR / f"mission-{slug}-hq.svg", hq_badge, HQ_SIZE)
        print(f"Wrote mission-{slug}-hq.svg")


if __name__ == "__main__":
    main()
