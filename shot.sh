#!/bin/bash
# usage: shot.sh P WxH out.png  -- render dist/preview.html with the journey position forced to P
S=/private/tmp/claude-501/-Users-yelizkokel-Desktop-Projects-Code-Projects-Test-Project/21ecf5f2-047e-4ad8-b4a1-627142276a48/scratchpad
CH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
sed "s#const pT=clamp(scrollY/maxScroll);#const pT=$1;#; s#pS+=(pT-pS)\*(1-Math.exp(-dt\*(REDUCED?30:4.5)));#pS=pT;#" "$(dirname "$0")/dist/preview.html" > $S/tmp_$1.html
"$CH" --headless=new --use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader --window-size=${2/x/,} --virtual-time-budget=12000 --screenshot=$3 "file://$S/tmp_$1.html" >/dev/null 2>&1
