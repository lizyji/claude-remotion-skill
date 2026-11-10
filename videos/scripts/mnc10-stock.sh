#!/bin/bash
# Free Pexels clips (Pexels licence) for the Gong reel → 1920×1080 30 fps, muted, trimmed.
# IDs chosen with no visible brands/logos (7647724 was rejected: Apple logo on the laptop).
set -euo pipefail
cd "$(dirname "$0")/.."
R=public/mnc10/stock/raw; O=public/mnc10/stock; mkdir -p "$R" "$O"
get(){ id=$1; [ -s "$R/p$id.mp4" ] && return 0; for fps in 25.0 30.0 29.97 24.0 23.98; do
  c=$(curl -sSL -A "Mozilla/5.0" -o "$R/p$id.mp4" -w "%{http_code}" "https://www.pexels.com/download/video/$id/?fps=$fps&h=1080&w=1920"); [ "$c" = 200 ] && return 0; done; return 1; }
cut(){ id=$1; out=$2; ss=$3; t=$4; get "$id"
  ffmpeg -nostdin -v error -y -ss "$ss" -t "$t" -i "$R/p$id.mp4" -vf "scale=1920:1080:flags=lanczos,fps=30,format=yuv420p" -an -c:v libx264 -crf 17 "$O/$out.mp4"; }
cut 9034423 presenter 0 5        # man presenting slides on a projector (hook)
cut 7154214 salesman 1 5         # salesman talking to a customer (Gong / 76 s)
cut 6339854 notes 0 5            # woman taking notes in a meeting (step 1: the problem)
cut 5114820 typing 0 7           # hands typing on a laptop (give the AI the client's info)
cut 3246669 team 2 5             # team discussing data on the table (what would change for your team)
echo "stock ok"
