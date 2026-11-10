#!/bin/bash
# Real screen recording of Manuel's content system (Drive 1K_i9YYQ8BQsVnLBT7nTZZ1ujYwlBuRtB, 2852×1310 @60)
# → the B-roll clips of Mnc11Ideas. The left sidebar ("OMNA sistema de contenido" + account) is ALWAYS
# cropped out (no OMNA in MNC videos). Coordinates are native pixels; speeds fit each clip to its window.
set -euo pipefail
cd "$(dirname "$0")/.."
S=public/mnc11/ref/screen.mov; O=public/mnc11/screens; mkdir -p "$(dirname "$S")" "$O"
[ -s "$S" ] || curl -sSfL -o "$S" "https://drive.usercontent.google.com/download?id=1K_i9YYQ8BQsVnLBT7nTZZ1ujYwlBuRtB&export=download&confirm=t"
clip(){ # name ss dur speed x y w h
  ffmpeg -nostdin -v error -y -ss "$2" -t "$3" -i "$S" -vf "crop=$7:$8:$5:$6,setpts=PTS/$4,scale=1080:-2:flags=lanczos,fps=30,format=yuv420p" -an -c:v libx264 -crf 16 "$O/$1.mp4"
  echo "$1 $(ffprobe -v error -show_entries stream=width,height:format=duration -of csv=p=0 "$O/$1.mp4" | tr '\n' ' ')"; }
clip b1_lista     11.4 7.0 1.5   430 0    714 720    # "Aprobación de ideas": status groups + cards, scrolling
clip b5_fuente    24.4 2.8 1.1  1270 0   1440 620    # idea title + "De dónde saco la info" + its link
clip b6_guion     43.6 5.0 0.76 1270 120 1100 1100   # "Contenido generado por la IA": copy, gancho, guion (scroll)
clip b8_cambio    25.8 8.4 1.75 1270 360 1460 600    # status → Rechazada, "Razón de rechazo": "Cambia lo siguiente:", Re-write
clip b9a_aprobada 23.4 2.0 1.15 1270 420 1460 560    # status → ✓ Aprobada
clip b9b_pipeline 53.6 1.6 1.0   760 120 1000 1000   # Pipeline: the idea in "Banco de ideas"
clip b9c_detalle  57.2 1.8 1.0  1640 100 1110 820    # its detail: Estado = Banco de ideas
