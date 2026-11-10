#!/bin/bash
# Rebuilds the gitignored media for the MncCotizador reel: downloads the source from
# Google Drive and renders public/mnc5/clips/base.mp4 (no cuts — the source is
# already jump-cut; voice cleaned and normalized to -14 LUFS for Reels).
set -euo pipefail
cd "$(dirname "$0")/.."
OUT=public/mnc5
mkdir -p "$OUT/src" "$OUT/clips"
SRC="$OUT/src/cotizador.mov"
[ -s "$SRC" ] || curl -sSfL -o "$SRC" "https://drive.usercontent.google.com/download?id=10v4j3NWTtAN5LkjZi1KY3UoRiwkLIqzN&export=download&confirm=t"
file "$SRC" | grep -q QuickTime || { echo "download is not a video — check the Drive sharing settings"; exit 1; }
M="measured_I=-10.26:measured_TP=2.54:measured_LRA=2.20:measured_thresh=-20.67:offset=0.13"
ffmpeg -nostdin -v error -y -i "$SRC" \
  -af "highpass=f=70,afftdn=nf=-32:nr=6,loudnorm=I=-14:TP=-1.5:LRA=11:$M:linear=true,aresample=48000" \
  -vf scale=1080:1920:flags=lanczos -r 30 -c:v libx264 -crf 16 -preset slow -pix_fmt yuv420p -c:a aac -b:a 256k -movflags +faststart "$OUT/clips/base.mp4"
echo "base.mp4: $(ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUT/clips/base.mp4") s"
