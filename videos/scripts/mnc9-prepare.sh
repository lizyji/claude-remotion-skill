#!/bin/bash
# Rebuilds the gitignored media for the UPS reel (Mnc9Ups): downloads the take from
# Google Drive, removes the silences/breaths (segment list below, measured with silencedetect
# -38 dB, 0.10 s kept after each phrase and 0.08 s before the next), upscales 720→1080 and
# normalizes the voice to -14 LUFS → public/mnc9/clips/base.mp4 (1080×1920, 30 fps).
set -euo pipefail
cd "$(dirname "$0")/.."
OUT=public/mnc9
mkdir -p "$OUT/src" "$OUT/clips"
SRC="$OUT/src/ups.mov"
[ -s "$SRC" ] || curl -sSfL -o "$SRC" "https://drive.usercontent.google.com/download?id=1mtY81fit3lZQjHcSYJd4ey7OhlPmqREB&export=download&confirm=t"
file "$SRC" | grep -qE 'QuickTime|MP4|ISO Media' || { echo "download is not a video — check the Drive sharing settings"; exit 1; }
SEGS="0.445 9.681
10.496 19.355
19.59 23.09
23.321 27.003
27.469 36.938
37.322 43.851
44.013 54.271
55.038 63.776
63.939 68.537
68.703 75.305"
F=""; C=""; i=0
while read -r a b; do
  F+="[0:v]trim=$a:$b,setpts=PTS-STARTPTS[v$i];"
  F+="[0:a]atrim=$a:$b,asetpts=PTS-STARTPTS,afade=t=in:d=0.012,areverse,afade=t=in:d=0.02,areverse[a$i];"
  C+="[v$i][a$i]"; i=$((i+1))
done <<< "$SEGS"
F+="${C}concat=n=$i:v=1:a=1[vc][ac];[vc]scale=1080:1920:flags=lanczos,fps=30,format=yuv420p[v];[ac]highpass=f=70,aresample=48000[a]"
TMP="$OUT/clips/cut.mkv"
ffmpeg -nostdin -v error -y -i "$SRC" -filter_complex "$F" -map "[v]" -map "[a]" -c:v libx264 -crf 12 -preset fast -c:a pcm_s16le "$TMP"
M=$(ffmpeg -nostdin -i "$TMP" -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
g(){ echo "$M" | grep "\"$1\"" | sed 's/.*: "\(.*\)".*/\1/'; }
ffmpeg -nostdin -v error -y -i "$TMP" \
  -af "loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=$(g input_i):measured_TP=$(g input_tp):measured_LRA=$(g input_lra):measured_thresh=$(g input_thresh):offset=$(g target_offset):linear=true,aresample=48000" \
  -c:v libx264 -crf 16 -preset slow -pix_fmt yuv420p -c:a aac -b:a 256k -movflags +faststart "$OUT/clips/base.mp4"
rm -f "$TMP"
echo "base.mp4: $(ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUT/clips/base.mp4") s"
ffmpeg -nostdin -v error -y -ss 4.0 -i "$OUT/clips/base.mp4" -frames:v 1 "$OUT/src/portada.png"   # cover photo
# B1: free Pexels clip 7183495 (aerial highway, generic trucks, no logos) → 1080×960
mkdir -p "$OUT/stock"
[ -s "$OUT/stock/pexels_7183495.mp4" ] || curl -sSfL -A "Mozilla/5.0" -o "$OUT/stock/pexels_7183495.mp4" "https://www.pexels.com/download/video/7183495/"
ffmpeg -nostdin -v error -y -ss 1.6 -t 4.0 -i "$OUT/stock/pexels_7183495.mp4" -vf "scale=-2:960:flags=lanczos,crop=1080:960:(iw*0.48-540):0,fps=30,format=yuv420p" -an -c:v libx264 -crf 16 "$OUT/stock/b1_truck.mp4"
# low instrumental bed (synthesized, no downloads)
MUSIC_SPEC="{\"groove\":0.0,\"outro\":$(python3 -c "print(round($(ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUT/clips/base.mp4")-0.4,2))"),\"total\":$(python3 -c "print(round($(ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUT/clips/base.mp4")+1.6,2))"),\"out\":\"$OUT/audio/music.wav\"}" node scripts/gen-omna-music.mjs
[ -s "$OUT/captures/b5_freightwaves.png" ] || echo "captures missing: see scripts/mnc9-captures/README.md"
