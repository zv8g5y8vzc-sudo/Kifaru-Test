#!/bin/bash
# usage: shot.sh P WxH out.png  -- render dist/preview.html with the journey position forced to P
D="$(cd "$(dirname "$0")" && pwd)"
CH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
T="$D/dist/_shot_$1.html"
sed "s#const pT=clamp(scrollY/maxScroll);#const pT=$1;#; s#pS+=(pT-pS)\*(1-Math.exp(-dt\*(REDUCED?30:4.5)));#pS=pT;#" "$D/dist/preview.html" > "$T"
"$CH" --headless=new --use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader --window-size=${2/x/,} --virtual-time-budget=12000 --screenshot=$3 "file://$T" >/dev/null 2>&1
rm -f "$T"
