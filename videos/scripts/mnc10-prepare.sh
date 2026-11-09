#!/bin/bash
# Rebuilds the gitignored media for the Gong reel (Mnc10Gong): downloads the take from
# Google Drive, removes the silences/breaths (segment list below, measured with silencedetect
# -38 dB, 0.10 s kept after each phrase and 0.08 s before the next), upscales 720→1080 and
# normalizes the voice to -14 LUFS → public/mnc9/clips/base.mp4 (1080×1920, 30 fps).
set -euo pipefail
cd "$(dirname "$0")/.."
OUT=public/mnc10
mkdir -p "$OUT/src" "$OUT/clips"
SRC="$OUT/src/gong.mov"
[ -s "$SRC" ] || curl -sSfL -o "$SRC" "https://drive.usercontent.google.com/download?id=1e-oTRLo22v8R3whIo6ane76N_NaE4HpV&export=download&confirm=t"
file "$SRC" | grep -qE 'QuickTime|MP4|ISO Media' || { echo "download is not a video — check the Drive sharing settings"; exit 1; }
SEGS="0.62 8.36
8.49 18.75
18.91 19.92
20.41 29.99
30.16 32.77
32.9 37.61
37.85 56.56
57.54 68.39"
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
mkdir -p "$OUT/src/frames"; for t in 2 6 14 24 31 40 47 53; do ffmpeg -nostdin -v error -y -ss $t -i "$OUT/clips/base.mp4" -frames:v 1 "$OUT/src/frames/f$t.png"; done   # cover candidates
bash scripts/mnc10-stock.sh
# low instrumental bed (synthesized, no downloads)
MUSIC_SPEC="{\"groove\":0.0,\"outro\":$(python3 -c "print(round($(ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUT/clips/base.mp4")-0.4,2))"),\"total\":$(python3 -c "print(round($(ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUT/clips/base.mp4")+1.6,2))"),\"out\":\"$OUT/audio/music.wav\"}" node scripts/gen-omna-music.mjs
[ -s "$OUT/captures/b3_gong_head.png" ] || echo "captures missing: see scripts/mnc10-captures/README.md"
