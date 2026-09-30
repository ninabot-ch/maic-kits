#!/usr/bin/env python3
"""Régénère les polices embarquées du kit (src/assets/fonts/*.woff2) depuis google/fonts (licences OFL).

Outil de DÉVELOPPEMENT, jamais appelé au build (le build est sans réseau). Pour chaque entrée : téléchargement du TTF,
instanciation d'une graisse fixe si la police est variable (fontTools.varLib.instancer), sous-ensemble latin, woff2.
Dépendances : fonttools + brotli (`pip install fonttools brotli`). Usage : python3 scripts/fonts.py [nom …]
"""
import os, sys, io, urllib.request
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools import subset

RAW = "https://raw.githubusercontent.com/google/fonts/main/ofl/"
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "src", "assets", "fonts")
LATIN = "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+2074,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD"
# nom de sortie → (dossier google/fonts, fichier, axes à figer)
FONTS = {
    "fraunces-600":            ("fraunces", "Fraunces[SOFT,WONK,opsz,wght].ttf", {"wght": 600, "opsz": 72, "SOFT": 30, "WONK": 0}),
    "manrope-400":             ("manrope", "Manrope[wght].ttf", {"wght": 400}),
    "manrope-700":             ("manrope", "Manrope[wght].ttf", {"wght": 700}),
    "syne-800":                ("syne", "Syne[wght].ttf", {"wght": 800}),
    "inter-400":               ("inter", "Inter[opsz,wght].ttf", {"wght": 400, "opsz": 14}),
    "inter-500":               ("inter", "Inter[opsz,wght].ttf", {"wght": 500, "opsz": 14}),
    "outfit-600":              ("outfit", "Outfit[wght].ttf", {"wght": 600}),
    "dmsans-400":              ("dmsans", "DMSans[opsz,wght].ttf", {"wght": 400, "opsz": 14}),
    "dmsans-600":              ("dmsans", "DMSans[opsz,wght].ttf", {"wght": 600, "opsz": 14}),
    "playfair-600":            ("playfairdisplay", "PlayfairDisplay[wght].ttf", {"wght": 600}),
    "plexsans-400":            ("ibmplexsans", "IBMPlexSans[wdth,wght].ttf", {"wght": 400, "wdth": 100}),
    "plexsans-600":            ("ibmplexsans", "IBMPlexSans[wdth,wght].ttf", {"wght": 600, "wdth": 100}),
    "dmserifdisplay-400":      ("dmserifdisplay", "DMSerifDisplay-Regular.ttf", {}),
    "worksans-400":            ("worksans", "WorkSans[wght].ttf", {"wght": 400}),
    "worksans-600":            ("worksans", "WorkSans[wght].ttf", {"wght": 600}),
    "barlowcondensed-700":     ("barlowcondensed", "BarlowCondensed-Bold.ttf", {}),
    "barlow-400":              ("barlow", "Barlow-Regular.ttf", {}),
    "barlow-600":              ("barlow", "Barlow-SemiBold.ttf", {}),
    "cormorant-600":           ("cormorantgaramond", "CormorantGaramond[wght].ttf", {"wght": 600}),
    "cormorant-italic-500":    ("cormorantgaramond", "CormorantGaramond-Italic[wght].ttf", {"wght": 500}),
    "jost-400":                ("jost", "Jost[wght].ttf", {"wght": 400}),
    "sora-700":                ("sora", "Sora[wght].ttf", {"wght": 700}),
    "lora-600":                ("lora", "Lora[wght].ttf", {"wght": 600}),
    "nunito-400":              ("nunito", "Nunito[wght].ttf", {"wght": 400}),
    "nunito-700":              ("nunito", "Nunito[wght].ttf", {"wght": 700}),
    "bebasneue-400":           ("bebasneue", "BebasNeue-Regular.ttf", {}),
    "rubik-400":               ("rubik", "Rubik[wght].ttf", {"wght": 400}),
    "rubik-600":               ("rubik", "Rubik[wght].ttf", {"wght": 600}),
}

def build(name):
    folder, fn, axes = FONTS[name]
    url = RAW + folder + "/" + urllib.request.quote(fn)
    raw = urllib.request.urlopen(url, timeout=60).read()
    f = TTFont(io.BytesIO(raw))
    if "fvar" in f and axes:
        f = instancer.instantiateVariableFont(f, axes, inplace=False, updateFontNames=False)
    opts = subset.Options(); opts.flavor = "woff2"; opts.layout_features = ["*"]; opts.name_IDs = ["*"]; opts.notdef_outline = True
    opts.desubroutinize = True
    sub = subset.Subsetter(opts); sub.populate(unicodes=subset.parse_unicodes(LATIN)); sub.subset(f)
    out = os.path.join(OUT, name + ".woff2"); f.flavor = "woff2"; f.save(out)
    print(f"{name:26s} {os.path.getsize(out)/1024:6.1f} Ko")

if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    for n in (sys.argv[1:] or FONTS): build(n)
