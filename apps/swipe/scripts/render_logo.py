"""Build Get fk'd logo assets from the governed in-app lockup."""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageFilter

BLUSH = (255, 240, 244, 255)
CLEAR = (0, 0, 0, 0)

REPO_ROOT = Path(__file__).resolve().parents[3]
REPO_IMAGES = Path(__file__).resolve().parents[1] / "assets" / "images"
CANONICAL_SOURCE = (
    REPO_ROOT
    / "00_Developer_Documents"
    / "Logo's & Marketing"
    / "GetFk'd_In-App_Logo_2k_10bit.png"
)


def near_black(pixel: tuple[int, ...]) -> bool:
    r, g, b = pixel[:3]
    brightest = max(r, g, b)
    return brightest <= 22 or (brightest <= 40 and brightest - min(r, g, b) <= 10)


def knockout_black(image: Image.Image) -> Image.Image:
    rgba = image.convert("RGBA")
    pixels = list(rgba.getdata())
    cleaned = []
    for pixel in pixels:
        r, g, b, a = pixel
        if near_black(pixel):
            cleaned.append((r, g, b, 0))
        else:
            cleaned.append((r, g, b, a))
    rgba.putdata(cleaned)
    return rgba


def trim_lockup(image: Image.Image, pad: int = 24) -> Image.Image:
    rgba = knockout_black(image)
    width, height = rgba.size
    pixels = rgba.load()
    left, top, right, bottom = width, height, 0, 0
    for y in range(height):
        for x in range(width):
            if pixels[x, y][3] <= 12:
                continue
            left = min(left, x)
            top = min(top, y)
            right = max(right, x)
            bottom = max(bottom, y)
    if right <= left or bottom <= top:
        return rgba
    box = (
        max(0, left - pad),
        max(0, top - pad),
        min(width, right + 1 + pad),
        min(height, bottom + 1 + pad),
    )
    return rgba.crop(box)


def fit_on_canvas(
    image: Image.Image,
    size: int,
    background: tuple[int, int, int, int],
    pad: float,
) -> Image.Image:
    canvas = Image.new("RGBA", (size, size), background)
    box = max(1, int(size * (1 - 2 * pad)))
    clone = image.copy()
    clone.thumbnail((box, box), Image.Resampling.LANCZOS)
    x = (size - clone.width) // 2
    y = (size - clone.height) // 2
    canvas.alpha_composite(clone, (x, y))
    return canvas


def monochrome(image: Image.Image) -> Image.Image:
    gray = image.convert("L")
    alpha = image.getchannel("A") if "A" in image.getbands() else None
    pixels = []
    flatten = getattr(gray, "get_flattened_data", gray.getdata)
    gray_data = list(flatten())
    if alpha is not None:
        flatten_alpha = getattr(alpha, "get_flattened_data", alpha.getdata)
        alpha_data = list(flatten_alpha())
    else:
        alpha_data = [255] * len(gray_data)
    for value, a in zip(gray_data, alpha_data, strict=True):
        if a < 16 or value > 236:
            pixels.append((255, 255, 255, 0))
        else:
            pixels.append((255, 255, 255, min(a, 255 - value)))
    out = Image.new("RGBA", image.size)
    out.putdata(pixels)
    return out.filter(ImageFilter.GaussianBlur(radius=0.4))


def main() -> None:
    if not CANONICAL_SOURCE.is_file():
        raise SystemExit(f"missing governed logo: {CANONICAL_SOURCE}")

    lockup = trim_lockup(Image.open(CANONICAL_SOURCE))
    max_edge = 800
    if max(lockup.size) > max_edge:
        lockup.thumbnail((max_edge, max_edge), Image.Resampling.LANCZOS)

    lockup.save(REPO_IMAGES / "logo.png", optimize=True)
    fit_on_canvas(lockup, 1024, BLUSH, 0.08).save(REPO_IMAGES / "icon.png")
    fit_on_canvas(lockup, 1024, BLUSH, 0.12).save(REPO_IMAGES / "splash-icon.png")
    fit_on_canvas(lockup, 64, BLUSH, 0.08).save(REPO_IMAGES / "favicon.png")
    foreground = fit_on_canvas(lockup, 1024, CLEAR, 0.16)
    foreground.save(REPO_IMAGES / "android-icon-foreground.png")
    Image.new("RGBA", (1024, 1024), BLUSH).save(REPO_IMAGES / "android-icon-background.png")
    monochrome(foreground).save(REPO_IMAGES / "android-icon-monochrome.png")
    stale_jpg = REPO_IMAGES / "logo-source.jpg"
    if stale_jpg.is_file():
        stale_jpg.unlink()
    stale_png = REPO_IMAGES / "logo-source.png"
    if stale_png.is_file():
        stale_png.unlink()
    print("rendered", REPO_IMAGES, "lockup", lockup.size, "from", CANONICAL_SOURCE.name)


if __name__ == "__main__":
    main()
