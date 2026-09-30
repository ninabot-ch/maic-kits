#!/usr/bin/env bash
# build-samples.sh [thème…] — pour chaque thème : copie son échantillon à la place de company.yaml/content.yaml, `npm run build`,
# mesure le temps (< 60 s) et le poids de la home (index.html + CSS/JS/polices référencés, ≤ 300 Ko hors vidéo/images),
# vérifie les pages du contrat et l'absence des marqueurs de démo refusés par le Studio. SHOTS=1 → captures (scripts/shots.mjs).
# Les YAML de la racine sont restaurés à la fin, quoi qu'il arrive.
set -euo pipefail
cd "$(dirname "$0")/.."
THEMES=("$@"); [ ${#THEMES[@]} -gt 0 ] || THEMES=($(ls samples))
cp company.yaml .bs-company.bak; cp content.yaml .bs-content.bak
trap 'mv -f .bs-company.bak company.yaml; mv -f .bs-content.bak content.yaml' EXIT
LOG="${BUILD_LOG_DIR:-/tmp}"
printf '%-14s %7s %9s %9s  %s\n' thème "temps" "home" "+images" "pages"
for t in "${THEMES[@]}"; do
  [ -f "samples/$t/content.yaml" ] || { echo "$t : pas d'échantillon"; exit 1; }
  if grep -rqiE "lumen|lampe|lamp|bois récupéré" "samples/$t/"; then echo "$t : marqueur de démo interdit (lumen/lampe/lamp) dans samples/$t"; exit 1; fi
  cp "samples/$t/company.yaml" company.yaml; cp "samples/$t/content.yaml" content.yaml
  rm -rf dist
  s=$(date +%s%N)
  npm run build >"$LOG/build-$t.log" 2>&1 || { echo "$t : BUILD ROUGE — $LOG/build-$t.log"; tail -25 "$LOG/build-$t.log"; exit 1; }
  ms=$(( ($(date +%s%N) - s) / 1000000 ))
  [ "$ms" -lt 60000 ] || { echo "$t : build trop long ($ms ms)"; exit 1; }
  for p in index.html en/index.html de/index.html it/index.html contact/index.html mentions-legales/index.html confidentialite/index.html avis/index.html reserver/index.html; do
    [ -f "dist/$p" ] || { echo "$t : il manque dist/$p"; exit 1; }
  done
  python3 - "$t" "$ms" <<'PY'
import re, os, sys, yaml
t, ms = sys.argv[1], int(sys.argv[2])
html = open('dist/index.html', encoding='utf-8').read()
refs = set(re.findall(r'url\((/_astro/[^)]+)\)', html)) | set(re.findall(r'<(?:script|link)[^>]+(?:src|href)="(/_astro/[^"]+)"', html))
imgs = set(re.findall(r'<img[^>]+src="(/[^"]+)"', html))
w = len(html.encode()) + sum(os.path.getsize('dist' + r) for r in refs if os.path.exists('dist' + r))
wi = sum(os.path.getsize('dist' + r) for r in imgs if os.path.exists('dist' + r))
c = yaml.safe_load(open('company.yaml')); d = yaml.safe_load(open('content.yaml'))
pages = list((d.get(c.get('lang', 'fr')) or {}).get('pages') or {})
for s in pages:
    if not os.path.exists(f'dist/p/{s}/index.html'): sys.exit(f'{t} : il manque /p/{s}/')
n = sum(len(fs) for _, _, fs in os.walk('dist') if True)
print(f'{t:14s} {ms/1000:6.1f}s {w/1024:7.1f}Ko {wi/1024:7.1f}Ko  {len([f for _,_,fs in os.walk("dist") for f in fs if f=="index.html"])} html' + (f' · /p/: {", ".join(pages)}' if pages else ''))
if w > 300 * 1024: sys.exit(f'{t} : home trop lourde ({w/1024:.0f} Ko > 300)')
PY
  if [ -n "${SHOTS:-}" ]; then node scripts/shots.mjs "$t" >/dev/null; fi
done
