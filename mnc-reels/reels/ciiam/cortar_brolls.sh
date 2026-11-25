#!/usr/bin/env bash
# Corta los B-rolls sueltos (1080×960) desde out/panel.mp4 (composición "Panel": sin Manuel ni subtítulos).
# Los golpes a pantalla completa (B8, B15) se recortan del centro (y=480); el resto, de la mitad de arriba.
set -e
cd "$(dirname "$0")/../.."
mkdir -p out/brolls
corta() { ffmpeg -v error -y -ss "$2" -to "$3" -i out/panel.mp4 -vf "crop=1080:960:0:${4:-0}" -c:v libx264 -crf 17 -pix_fmt yuv420p -an "out/brolls/$1.mp4"; echo "→ out/brolls/$1.mp4"; }
corta T1_B1_logos_precio 0.00 6.72
corta T2_B2_titular_panel 6.80 9.70
corta T2_B3_tmec_revision 9.72 11.98
corta T2_B4_solo_precio 12.00 14.50
corta T3_B5_resiliencia_calidad 14.56 20.20
corta T3_B6_velocidad_logistica 20.20 23.94
corta T3_B7_estabilidad_madurez 23.94 27.22
corta T3_B8_calidad_1 27.24 28.98 480
corta T4_B9_pieza_barata 29.04 32.04
corta T4_B10_ciclo_de_vida 32.08 35.00
corta T5_B11_grupo_toyota 36.65 40.00
corta T5_B12_cotizacion_sin_respuesta 40.02 42.42
corta T5_B13_responder_rapido 42.46 46.34
corta T5_B14_procesos_sistemas 46.38 49.92
corta T6_B15_comenta_brujula 49.96 55.00 480
