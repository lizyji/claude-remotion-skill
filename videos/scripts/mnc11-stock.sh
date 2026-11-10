#!/bin/bash
# Free Pexels clips (Pexels licence) for the ideas-system reel — no visible brands.
set -euo pipefail
cd "$(dirname "$0")/.."
R=public/mnc11/stock/raw; O=public/mnc11/stock; mkdir -p "$R" "$O"
get(){ id=$1; [ -s "$R/p$id.mp4" ] && return 0; for fps in 25.0 30.0 29.97 24.0 23.98; do
  c=$(curl -sSL -A "Mozilla/5.0" -o "$R/p$id.mp4" -w "%{http_code}" "https://www.pexels.com/download/video/$id/?fps=$fps&h=1080&w=1920"); [ "$c" = 200 ] && return 0; done; return 1; }
cut(){ id=$1; out=$2; ss=$3; t=$4; get "$id"
  ffmpeg -nostdin -v error -y -ss "$ss" -t "$t" -i "$R/p$id.mp4" -vf "scale=1920:1080:flags=lanczos,fps=30,format=yuv420p" -an -c:v libx264 -crf 17 "$O/$out.mp4"; }
cut 3246669 team 2 6        # team discussing data on a table (quotes, orders, reports → your business)
echo "stock ok"
