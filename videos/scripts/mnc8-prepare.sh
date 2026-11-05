#!/bin/bash
# Rebuilds the gitignored media for the Klarna reel (Mnc8Klarna): downloads the take from
# Google Drive, removes the silences/breaths (segment list below, measured with silencedetect
# -38 dB, 0.12 s kept after each phrase and 0.10 s before the next), upscales 720→1080 and
# normalizes the voice to -14 LUFS → public/mnc8/clips/base.mp4 (1080×1920, 30 fps).
set -euo pipefail
cd "$(dirname "$0")/.."
OUT=public/mnc8
mkdir -p "$OUT/src" "$OUT/clips"
SRC="$OUT/src/klarna.mov"
[ -s "$SRC" ] || curl -sSfL -o "$SRC" "https://drive.usercontent.google.com/download?id=1BqiLftwfDDTQEBfcdUriHBKaysejbc57&export=download&confirm=t"
file "$SRC" | grep -qE 'QuickTime|MP4|ISO Media' || { echo "download is not a video — check the Drive sharing settings"; exit 1; }
SEGS="1.381 7.736
8.328 14.147
14.435 21.53
21.646 28.497
28.942 40.561
41.012 41.944
42.073 43.251
43.653 49.048
50.179 58.487
58.645 69.612"
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
ffmpeg -nostdin -v error -y -ss 3.0 -i "$OUT/clips/base.mp4" -frames:v 1 "$OUT/src/portada.png"   # cover photo
[ -s "$OUT/captures/b2_klarna_press.png" ] || echo "captures missing: run scripts/mnc8-captures/*.js (see README there)"
