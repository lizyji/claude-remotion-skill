#!/bin/bash
# Renders each B-roll of the Klarna reel as its own file (1080×960, the top panel, no
# Manuel, no captions) named by take, plus the closing card (1080×1920, with voice).
# Window times are read from the composition (ROLL_TIMES) via a tiny node eval of words.json.
set -euo pipefail
cd "$(dirname "$0")/.."
OUT=out/mnc8/brolls; mkdir -p "$OUT"
NAMES=(T1_B1_logo-klarna T1_B2_titular-klarna T2_B4_mapa-suecia T2_B3_klarna-pagar-en-partes T3_B5_chat-asistente T3_B6_contador T3_B7_dona-2-de-3 T3_B8_700-agentes T4_B9_pero-despues T4_B10_titulares-2025 T4_B11_audifonos T5_B12_la-jugada T5_B13_dos-columnas T5_B14_ia-mas-personas T6_B15_checklist)
TIMES=$(node scripts/mnc8-times.mjs)
i=0
while read -r a b; do
  fa=$(python3 -c "print(round($a*30))"); fb=$(python3 -c "print(round($b*30)-1)")
  npx remotion render src/index.ts Mnc8Broll "$OUT/${NAMES[$i]}.mp4" --props="{\"i\":$i}" --frames=$fa-$fb --codec h264 --crf 18 --muted >/dev/null
  echo "${NAMES[$i]} $a–$b"; i=$((i+1))
done <<< "$(echo "$TIMES" | head -n 15)"
read -r a b <<< "$(echo "$TIMES" | tail -n 1)"
fa=$(python3 -c "print(round($a*30))")
npx remotion render src/index.ts Mnc8Klarna "$OUT/T6_B16_cierre.mp4" --frames=$fa- --codec h264 --crf 18 >/dev/null
echo "T6_B16_cierre $a–end"
