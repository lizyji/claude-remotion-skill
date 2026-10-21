#!/bin/bash
# Rebuilds the gitignored media for the MncDashboardWhatsApp reel:
# downloads the source from Google Drive and renders public/mnc/clips/base.mp4
# (aside "Ahorita te voy a decir una plataforma…" removed, voice cleaned and
# normalized to -14 LUFS for Reels). Needs drive.usercontent.google.com allowed
# and the Drive file shared as "anyone with the link".
set -euo pipefail
cd "$(dirname "$0")/.."
OUT=public/mnc
mkdir -p "$OUT/src" "$OUT/clips"
SRC="$OUT/src/dashboard-whatsapp.mov"
[ -s "$SRC" ] || curl -sSfL -o "$SRC" "https://drive.usercontent.google.com/download?id=1VWl0U9zo2zrGAiIa56YCZu4WEt7yE7o3&export=download&confirm=t"
file "$SRC" | grep -q QuickTime || { echo "download is not a video — check the Drive sharing settings"; exit 1; }

CUT_A=48.08 # end of "...tu correo o tu WhatsApp,"
CUT_B=50.26 # start of "y agentes internos..."
M="measured_I=-10.46:measured_TP=1.93:measured_LRA=1.50:measured_thresh=-20.56:offset=0.00"
ffmpeg -nostdin -v error -y -i "$SRC" -filter_complex "\
[0:v]trim=0:$CUT_A,setpts=PTS-STARTPTS[v0];[0:v]trim=start=$CUT_B,setpts=PTS-STARTPTS[v1];\
[0:a]atrim=0:$CUT_A,asetpts=PTS-STARTPTS,afade=t=out:st=$(python3 -c "print($CUT_A-0.02)"):d=0.02[a0];\
[0:a]atrim=start=$CUT_B,asetpts=PTS-STARTPTS,afade=t=in:d=0.02[a1];\
[v0][a0][v1][a1]concat=n=2:v=1:a=1[v][a];\
[a]highpass=f=70,afftdn=nf=-32:nr=6,loudnorm=I=-14:TP=-1.5:LRA=11:$M:linear=true,aresample=48000[o]" \
  -map "[v]" -map "[o]" -r 30 -c:v libx264 -crf 16 -preset slow -pix_fmt yuv420p \
  -c:a aac -b:a 256k -movflags +faststart "$OUT/clips/base.mp4"
echo "base.mp4: $(ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUT/clips/base.mp4") s"
