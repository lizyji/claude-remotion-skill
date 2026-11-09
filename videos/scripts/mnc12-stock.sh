#!/bin/bash
# Free Pexels clips (Pexels licence), real people only (green-screen rule v2), no visible brands.
set -euo pipefail
cd "$(dirname "$0")/.."
R=public/mnc12/stock/raw; O=public/mnc12/stock; mkdir -p "$R" "$O"
get(){ id=$1; [ -s "$R/p$id.mp4" ] || curl -sSfL -A "Mozilla/5.0" -o "$R/p$id.mp4" "https://www.pexels.com/download/video/$id/"; }
cut(){ id=$1; out=$2; ss=$3; t=$4; get "$id"
  ffmpeg -nostdin -v error -y -ss "$ss" -t "$t" -i "$R/p$id.mp4" -vf "scale=1920:1080:flags=lanczos,fps=30,format=yuv420p" -an -c:v libx264 -crf 17 "$O/$out.mp4"; }
cut 6803593 worker 8.5 5     # man working at his office computer ("como contratar a alguien con su propia compu")
cut 14569486 newhire 1.0 5   # newcomer with backpack welcomed with a handshake ("como un empleado nuevo")
echo "stock ok"
