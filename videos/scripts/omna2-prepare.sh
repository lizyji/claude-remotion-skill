#!/bin/bash
# Rebuilds the gitignored media for OmnaManuelCeo: downloads Manuel's take from Drive,
# fixes the orientation (the phone stored it rotated + mirrored: transpose=2,hflip),
# upscales to 1920×1080 and keeps only the good take, with long pauses trimmed:
#   12.50–38.62  "Nuestra forma de trabajar…" (first attempt + "Ah…" + pause dropped)
#   38.88–93.15  …"a dónde moverlo."
#  101.36–109.35 "Si te hizo sentido…" (8 s silence dropped)
#  109.70–114.97 / 115.33–123.40 …"Agenda aquí abajo."
# Voice cleaned and normalized to -16 LUFS (landscape web video).
set -euo pipefail
cd "$(dirname "$0")/.."
OUT=public/omna2; mkdir -p "$OUT/src" "$OUT/clips"
SRC="$OUT/src/manuel-omna.mov"
[ -s "$SRC" ] || curl -sSfL -o "$SRC" "https://drive.usercontent.google.com/download?id=1aBEpcIvlI40EL0D50EGL0K_J8bDpp2GY&export=download&confirm=t"
file "$SRC" | grep -q QuickTime || { echo "download is not a video — check the Drive sharing settings"; exit 1; }
MEAS="${MEAS:-measured_I=-11.4:measured_TP=2.1:measured_LRA=1.9:measured_thresh=-21.7}"
SEGS="12.50:38.62 38.88:93.15 101.36:109.35 109.70:114.97 115.33:123.40"
F=""; L=""; i=0
for s in $SEGS; do a=${s%%:*}; b=${s##*:}; d=$(python3 -c "print(round($b-$a,3))")
  F="$F[0:v]trim=$a:$b,setpts=PTS-STARTPTS,transpose=2,hflip,scale=1920:1080:flags=lanczos,setsar=1[v$i];"
  F="$F[0:a]atrim=$a:$b,asetpts=PTS-STARTPTS,afade=t=in:d=0.03,afade=t=out:st=$(python3 -c "print($d-0.04)"):d=0.04[a$i];"
  L="$L[v$i][a$i]"; i=$((i+1)); done
F="$F${L}concat=n=$i:v=1:a=1[v][a];[a]highpass=f=70,afftdn=nf=-32:nr=6,loudnorm=I=-16:TP=-1.5:LRA=11${MEAS:+:$MEAS:linear=true},aresample=48000[o]"
if [ -z "${MEAS:-}" ]; then
  ffmpeg -nostdin -i "$SRC" -filter_complex "${F/loudnorm=I=-16:TP=-1.5:LRA=11/loudnorm=I=-16:TP=-1.5:LRA=11:print_format=summary}" -map "[v]" -map "[o]" -f null - 2>&1 | grep -E "Input (Integrated|True Peak|LRA|Threshold)"
  exit 0
fi
ffmpeg -nostdin -v error -y -i "$SRC" -filter_complex "$F" -map "[v]" -map "[o]" -r 30 -c:v libx264 -crf 16 -preset slow -pix_fmt yuv420p \
  -c:a aac -b:a 256k -movflags +faststart "$OUT/clips/base.mp4"
echo "base.mp4: $(ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUT/clips/base.mp4") s"
