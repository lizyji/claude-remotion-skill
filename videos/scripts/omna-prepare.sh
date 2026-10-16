#!/bin/bash
# Rebuilds everything the OmnaBienvenida composition needs in public/omna/
# (gitignored): source video + OMNA Design System assets from Google Drive,
# the six pre-processed 1080p clips, and the synthesized music bed.
# Needs drive.google.com / drive.usercontent.google.com in the network allowlist.
set -euo pipefail
cd "$(dirname "$0")/.."
OUT=public/omna
mkdir -p "$OUT"/{clips,audio,brand/fonts,brand/logos,brand/gradients}

dl() { [ -s "$2" ] || curl -sSfL -o "$2" "https://drive.usercontent.google.com/download?id=$1&export=download&confirm=t"; }

# --- source footage: "INTRO AL EQUIPO OMNA" ---
dl 1zJW-C-6y-HDCLf39vQBAOtimlUF3X-_B "$OUT/intro-omna.mov"

# --- OMNA Design System (fonts are the foundry TRIAL build: license before production) ---
while read -r id path; do dl "$id" "$OUT/brand/$path"; done <<'IDS'
1pBEhzgXmDQ-Yiz20Fxr2mfyaN20ILFpP fonts/SFTSchriftedSans-Regular.ttf
1F6-z6mOXcuB9Ss3C5brfIGr3pWD7SG_d fonts/SFTSchriftedSans-Medium.ttf
1AQiv6pLkn8gNzSRx0aXO98RoILN2a-fE fonts/SFTSchriftedSans-DemiBold.ttf
1JGHDJORheMMMNMTnMyAHfVzUjFO6u8GV fonts/SFTSchriftedSans-Bold.ttf
17JvJ-dTGIUqCq4Ck_YUxwAo6PyvXiT5A fonts/SFTSchriftedSans-Light.ttf
1e8mjhO44NBzLpd5DDish3Cs_BVrU9cbr logos/omna-logo-white.png
1Jo2BddLJDEb8JrBtjz6TS5_ivpFoPl2K logos/omna-mark-white.png
1kc7SJDvMi_S6jZOppAl8-Vcb2UUWL070 gradients/omna-gradient-1.jpg
1uMZljygFi3kceeeYGhR0Itc9tfzTDKYK gradients/omna-gradient-2.jpg
IDS

# --- clips: name, in, out (s), kind ---
# band = 16:9 image letterboxed inside the 720x1280 frame; rot = sideways landscape take.
# All takes were shot mirrored (selfie camera), hence hflip.
while read -r n a b kind; do
  [ -s "$OUT/clips/$n.mp4" ] && continue
  if [ "$kind" = band ]; then VF="crop=720:404:0:438,hflip"; else VF="transpose=1,hflip"; fi
  VF="$VF,scale=1920:1080:flags=lanczos,unsharp=5:5:0.55:5:5:0,format=yuv420p"
  d=$(python3 -c "print(round($b-$a,3))")
  AF="highpass=f=80,afftdn=nf=-30:nr=8,afade=t=in:d=0.03,afade=t=out:st=$(python3 -c "print($d-0.05)"):d=0.05"
  m=$(ffmpeg -nostdin -hide_banner -ss "$a" -t "$d" -i "$OUT/intro-omna.mov" -af "$AF,loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json" -vn -f null - 2>&1 |
    python3 -c "import sys,json;t=sys.stdin.read();j=json.loads(t[t.rindex('{'):]);print(f\"measured_I={j['input_i']}:measured_TP={j['input_tp']}:measured_LRA={j['input_lra']}:measured_thresh={j['input_thresh']}:offset={j['target_offset']}\")")
  ffmpeg -nostdin -v error -y -ss "$a" -t "$d" -i "$OUT/intro-omna.mov" -vf "$VF" \
    -af "$AF,loudnorm=I=-16:TP=-1.5:LRA=11:$m:linear=true,aresample=48000" \
    -r 30 -c:v libx264 -crf 15 -preset slow -c:a aac -b:a 256k -movflags +faststart "$OUT/clips/$n.mp4"
  echo "clip $n ($d s)"
done <<'SEGS'
s1 4.62 18.62 band
s2 22.30 26.05 band
s3 28.85 38.10 band
s4 40.25 45.70 band
s5 47.95 58.48 rot
s6 61.38 71.40 rot
SEGS

node scripts/gen-omna-music.mjs
