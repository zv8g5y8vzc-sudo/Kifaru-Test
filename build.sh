#!/bin/bash
# Assembles src/* into dist/index.html (artifact-ready fragment), dist/preview.html (full document)
# and docs/index.html (the same full document, served by GitHub Pages)
set -e
cd "$(dirname "$0")"
FONTS='<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500&family=DM+Mono:wght@400;500&family=Instrument+Serif:ital@0;1&display=swap">'
THREE='<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>'
{
  echo '<title>Kifaru Kopje</title>'
  echo "$FONTS"
  echo '<style>'; cat src/style.css; echo '</style>'
  cat src/body.html
  echo "$THREE"
  echo '<script>'; cat src/booking.js; echo '</script>'
  echo '<script>(function(){'; cat src/world-1.js src/world-2.js src/world-3.js src/journey.js; echo '})();</script>'
} > dist/index.html
{
  echo '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
  cat dist/index.html | sed -n '1,/^<\/style>/p'
  echo '</head><body>'
  cat dist/index.html | sed '1,/^<\/style>/d'
  echo '</body></html>'
} > dist/preview.html
mkdir -p docs
cp dist/preview.html docs/index.html
touch docs/.nojekyll
wc -c dist/index.html docs/index.html
