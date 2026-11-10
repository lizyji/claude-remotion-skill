#!/bin/bash
# Rebuilds the gitignored media for the MncSistemas reel: downloads the source from
# Google Drive and renders public/mnc7/clips/base.mp4 (no cuts — the source is
# already jump-cut; voice cleaned and normalized to -14 LUFS for Reels).
set -euo pipefail
cd "$(dirname "$0")/.."
OUT=public/mnc7
mkdir -p "$OUT/src" "$OUT/clips"
SRC="$OUT/src/sistemas.mp4"
[ -s "$SRC" ] || curl -sSfL -o "$SRC" "https://drive.usercontent.google.com/download?id=1GHIrI72P8shAncN3HfhoLJeSSELCBCuF&export=download&confirm=t"
file "$SRC" | grep -qE 'QuickTime|MP4' || { echo "download is not a video — check the Drive sharing settings"; exit 1; }
M="measured_I=-22.99:measured_TP=-5.88:measured_LRA=2.50:measured_thresh=-33.01:offset=0.22"
ffmpeg -nostdin -v error -y -i "$SRC" \
  -af "highpass=f=70,loudnorm=I=-14:TP=-1.5:LRA=11:$M:linear=true,aresample=48000" \
  -r 30 -c:v libx264 -crf 16 -preset slow -pix_fmt yuv420p -c:a aac -b:a 256k -movflags +faststart "$OUT/clips/base.mp4"
echo "base.mp4: $(ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUT/clips/base.mp4") s"
