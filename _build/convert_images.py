import json, os, sys, io
from PIL import Image

ROOT = "v2"
jobs = json.load(open("_build/image-jobs.json", encoding="utf-8"))
manifest = {}
total_o = total_a = total_w = 0

def target_w(f):
    if f.startswith("assets/logo"):
        return 256
    if "scrub-frames" in f:
        return 1280
    if "menu/Final Menu Pics" in f or "/why/" in f:
        return 800
    if "/work/" in f or "/stills/" in f:
        return 1280
    if "Landing-Page" in f or ("Taarten-Page" in f and "hero" in f):
        return 960
    if "software-solutions" in f:
        return 1280
    return 1600

def quality(f):
    # flat UI / design mockups need more bitrate to keep text crisp
    if "software-solutions" in f or "Landing-Page" in f:
        return (62, 84)
    if "scrub-frames" in f:
        return (50, 72)
    return (58, 80)

done = 0
for rel in jobs:
    if "scrub-frames" in rel:
        continue
    src = os.path.join(ROOT, rel)
    base, ext = os.path.splitext(src)
    im = Image.open(src)
    if im.mode in ("P", "LA", "RGBA") and "logo" in rel:
        im = im.convert("RGBA")
        bg = Image.new("RGBA", im.size, (255, 255, 255, 0))
    im = im.convert("RGB")
    ow, oh = im.size
    tw = min(ow, target_w(rel))
    if tw < ow:
        im = im.resize((tw, max(1, round(oh * tw / ow))), Image.LANCZOS)
    w, h = im.size
    aq, wq = quality(rel)

    avif = base + "-%d.avif" % w
    webp = base + "-%d.webp" % w
    if im.mode == "RGBA":
        im = im.convert("RGB")

    im.save(avif, "AVIF", quality=aq, speed=4)
    im.save(webp, "WEBP", quality=wq, method=6)

    o = os.path.getsize(src); a = os.path.getsize(avif); wb = os.path.getsize(webp)
    total_o += o; total_a += a; total_w += wb
    manifest[rel] = {
        "w": w, "h": h,
        "avif": os.path.relpath(avif, ROOT).replace("\\", "/"),
        "webp": os.path.relpath(webp, ROOT).replace("\\", "/"),
        "orig": o, "avif_b": a, "webp_b": wb,
    }
    done += 1
    if done % 10 == 0:
        print("  %d/%d" % (done, len([j for j in jobs if "scrub-frames" not in j])), flush=True)

json.dump(manifest, open("_build/media-manifest.json", "w", encoding="utf-8"), indent=1)
print("DONE %d images | orig %.1f MB -> avif %.1f MB / webp %.1f MB"
      % (done, total_o / 1048576, total_a / 1048576, total_w / 1048576), flush=True)
