#!/bin/bash
# Renders each B-roll of the Grok Bot reel as its own file (1080×960, the top panel, no
# Manuel, no captions) named by take, plus the closing card (1080×1920, with voice).
# Window times are read from the composition (ROLL_TIMES) via a tiny node eval of words.json.
set -euo pipefail
cd "$(dirname "$0")/.."
OUT=out/mnc12/brolls; mkdir -p "$OUT"
NAMES=(T1_B1_logo-grok-bot T1_extra_app-real-xai T2_B2_titular-anuncio T2_extra_persona-con-su-compu T2_B3-B4_compu-en-la-nube T3_B5_cuatro-pasos T3_B6_vista-real-xai T4_B7_navegador-login T4_B8_si-tu-puedes-entrar T5_B9_la-jugada T5_B10_llavero T5_extra_empleado-nuevo T5_extra_configurar-por-chat T6_B11_de-contestar-a-hacer)
TIMES=$(node scripts/mnc12-times.mjs)
i=0
while read -r a b; do
  fa=$(python3 -c "print(round($a*30))"); fb=$(python3 -c "print(round($b*30)-1)")
  npx remotion render src/index.ts Mnc12Broll "$OUT/${NAMES[$i]}.mp4" --props="{\"i\":$i}" --frames=$fa-$fb --codec h264 --crf 18 --muted >/dev/null
  echo "${NAMES[$i]} $a–$b"; i=$((i+1))
done <<< "$(echo "$TIMES" | head -n 14)"
read -r a b <<< "$(echo "$TIMES" | tail -n 1)"
fa=$(python3 -c "print(round($a*30))")
npx remotion render src/index.ts Mnc12GrokBot "$OUT/T6_B12_cierre.mp4" --frames=$fa- --codec h264 --crf 18 >/dev/null
echo "T6_B12_cierre $a–end"
