#!/bin/bash
# Renders each B-roll of the UPS reel as its own file (1080×960, the top panel, no
# Manuel, no captions) named by take, plus the closing card (1080×1920, with voice).
# Window times are read from the composition (ROLL_TIMES) via a tiny node eval of words.json.
set -euo pipefail
cd "$(dirname "$0")/.."
OUT=out/mnc9/brolls; mkdir -p "$OUT"
NAMES=(T1_B1_camion-carretera T1_B2_1-milla-50-millones T2_B3_mapa-entregas T2_B4_lineas-enredadas T3_B5_orion T3_B6_ruta-limpia T3_B7_contador-100-millones T4_B8_la-jugada T4_B9_tachado T5_B10_iconos T5_B11_pedidos-a-ruta T6_B12_1-milla)
TIMES=$(node scripts/mnc9-times.mjs)
i=0
while read -r a b; do
  fa=$(python3 -c "print(round($a*30))"); fb=$(python3 -c "print(round($b*30)-1)")
  npx remotion render src/index.ts Mnc9Broll "$OUT/${NAMES[$i]}.mp4" --props="{\"i\":$i}" --frames=$fa-$fb --codec h264 --crf 18 --muted >/dev/null
  echo "${NAMES[$i]} $a–$b"; i=$((i+1))
done <<< "$(echo "$TIMES" | head -n 12)"
read -r a b <<< "$(echo "$TIMES" | tail -n 1)"
fa=$(python3 -c "print(round($a*30))")
npx remotion render src/index.ts Mnc9Ups "$OUT/T6_B13_cierre.mp4" --frames=$fa- --codec h264 --crf 18 >/dev/null
echo "T6_B13_cierre $a–end"
