#!/bin/bash
# Renders each B-roll of the Ideas reel as its own file (1080×960, the top panel, no
# Manuel, no captions) named by take, plus the closing card (1080×1920, with voice).
# Window times are read from the composition (ROLL_TIMES) via a tiny node eval of words.json.
set -euo pipefail
cd "$(dirname "$0")/.."
OUT=out/mnc11/brolls; mkdir -p "$OUT"
NAMES=(T1_B1_tablero-PENDIENTE T1_extra_sistema-apruebo T2_B2-B3_hoja-en-blanco T3_B4_miniaturas-vistas T3_B5_claude-ideas-PENDIENTE T4_B6_tarjeta-guion-PENDIENTE T4_B7_etiquetas-guion T5_extra_esta-si-esta-no T5_B8_cambio-copy-PENDIENTE T5_B9_aprobar-pipeline-PENDIENTE T6_B10_la-jugada T6_B11_ia-propone-yo-decido T6_extra_criterio T7_B12_cotizaciones-pedidos-reportes)
TIMES=$(node scripts/mnc11-times.mjs)
i=0
while read -r a b; do
  fa=$(python3 -c "print(round($a*30))"); fb=$(python3 -c "print(round($b*30)-1)")
  npx remotion render src/index.ts Mnc11Broll "$OUT/${NAMES[$i]}.mp4" --props="{\"i\":$i}" --frames=$fa-$fb --codec h264 --crf 18 --muted >/dev/null
  echo "${NAMES[$i]} $a–$b"; i=$((i+1))
done <<< "$(echo "$TIMES" | head -n 14)"
read -r a b <<< "$(echo "$TIMES" | tail -n 1)"
fa=$(python3 -c "print(round($a*30))")
npx remotion render src/index.ts Mnc11Ideas "$OUT/T7_B13_cierre.mp4" --frames=$fa- --codec h264 --crf 18 >/dev/null
echo "T7_B13_cierre $a–end"
