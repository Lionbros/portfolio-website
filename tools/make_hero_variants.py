"""Generate optimized WebP + AVIF hero variants for installation.html."""
from pathlib import Path

SRC = Path(r"C:\Users\Maarten\Desktop\Bussiness\Portfolio website\v2\assets\img\Starlink & TV")
DST = Path(r"C:\Users\Maarten\Desktop\Bussiness\Portfolio website\v2\assets\img\Installation-Page")
DST.mkdir(parents=True, exist_ok=True)

JOBS = [
    (SRC / "Starlink Dish Above Woodland Roof.png", "hero-starlink"),
    (SRC / "Modern Living Room Smart TV Setup.png", "hero-tv"),
]

MAX_WIDTH = 1600

for src, stem in JOBS:
    im = __import__("PIL.Image", fromlist=["Image"]).open(src).convert("RGB")
    if im.width > MAX_WIDTH:
        im = im.resize((MAX_WIDTH, round(im.height * MAX_WIDTH / im.width)), __import__("PIL.Image", fromlist=["Image"]).LANCZOS)
    webp = DST / f"{stem}.webp"
    avif = DST / f"{stem}.avif"
    im.save(webp, "WEBP", quality=78, method=6)
    im.save(avif, "AVIF", quality=60, speed=6)
    print(f"{stem}: {im.width}x{im.height}  webp={webp.stat().st_size//1024} KB  avif={avif.stat().st_size//1024} KB")
