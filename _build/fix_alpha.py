"""Re-encode transparent images preserving their alpha channel.

The first pass converted everything to RGB, which dropped transparency and left
white boxes/halos behind cut-outs (pie, portrait, logos).
"""
import json, os
from PIL import Image

manifest = json.load(open("_build/media-manifest.json", encoding="utf-8"))


def quality(rel):
    if "software-solutions" in rel or "Landing-Page" in rel:
        return (62, 84)
    return (58, 80)


fixed = []
for rel, m in sorted(manifest.items()):
    src = os.path.join("v2", rel)
    if not os.path.exists(src):
        continue
    im = Image.open(src)
    has_alpha = im.mode in ("RGBA", "LA") or (im.mode == "P" and "transparency" in im.info)
    if not has_alpha:
        continue
    im = im.convert("RGBA")
    if im.getchannel("A").getextrema()[0] == 255:
        continue  # alpha present but fully opaque: nothing to preserve

    if im.width != m["w"]:
        im = im.resize((m["w"], max(1, round(im.height * m["w"] / im.width))), Image.LANCZOS)

    aq, wq = quality(rel)
    avif = os.path.join("v2", m["avif"])
    webp = os.path.join("v2", m["webp"])
    im.save(avif, "AVIF", quality=aq, speed=4)
    im.save(webp, "WEBP", quality=wq, method=6)

    a1 = Image.open(avif)
    a2 = Image.open(webp)
    fixed.append((rel, a1.mode, a2.mode,
                  os.path.getsize(avif), os.path.getsize(webp),
                  a1.convert("RGBA").getchannel("A").getextrema()[0]))

print("re-encoded with alpha: %d" % len(fixed))
for r in fixed:
    print("  %-68s avif=%-5s webp=%-5s %5.0fKB/%-5.0fKB alpha_min=%d"
          % (r[0][:68], r[1], r[2], r[3] / 1024, r[4] / 1024, r[5]))
