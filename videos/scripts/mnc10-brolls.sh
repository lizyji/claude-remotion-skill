#!/bin/bash
# Renders each B-roll of the Gong reel as its own file (1080×960, the top panel, no
# Manuel, no captions) named by take, plus the closing card (1080×1920, with voice).
# Window times are read from the composition (ROLL_TIMES) via a tiny node eval of words.json.
set -euo pipefail
cd "$(dirname "$0")/.."
OUT=out/mnc10/brolls; mkdir -p "$OUT"
NAMES=(T1_B1_presentacion-real T1_B2_dos-slides T2_B3_gong-captura T2_B4_contador-67149 T2_extra_vendedor-real T2_B5_cronometro-76s T3_extra_notas-real T3_B6_primero-el-problema T3_B7_sus-palabras T4_B8_resultado-primero T4_B9_2-o-3-cosas T5_B10_la-jugada T5_B11_generico-vs-sus-datos T5_extra_ia-teclado-real T5_B12_callate T5_B12b_pregunta-equipo-real T6_B13_siguiente-junta)
TIMES=$(node scripts/mnc10-times.mjs)
i=0
while read -r a b; do
  fa=$(python3 -c "print(round($a*30))"); fb=$(python3 -c "print(round($b*30)-1)")
  npx remotion render src/index.ts Mnc10Broll "$OUT/${NAMES[$i]}.mp4" --props="{\"i\":$i}" --frames=$fa-$fb --codec h264 --crf 18 --muted >/dev/null
  echo "${NAMES[$i]} $a–$b"; i=$((i+1))
done <<< "$(echo "$TIMES" | head -n 17)"
read -r a b <<< "$(echo "$TIMES" | tail -n 1)"
fa=$(python3 -c "print(round($a*30))")
npx remotion render src/index.ts Mnc10Gong "$OUT/T6_B14_cierre.mp4" --frames=$fa- --codec h264 --crf 18 >/dev/null
echo "T6_B14_cierre $a–end"
