#!/bin/sh
# Corta los B-rolls sueltos (1080×960, mitad de arriba) del render "solo panel" y la frase de cierre del render final.
set -e
cd "$(dirname "$0")/../.."
D=out/netflix_brolls; mkdir -p $D
c() { ffmpeg -v error -y -ss $2 -to $3 -i out/netflix_panel.mp4 -vf crop=1080:960:0:0 -c:v libx264 -crf 17 -an $D/$1.mp4; }
c T1_B1_logo-recomendaciones 0 2.21
c T1_B2_1000-millones 2.21 4.55
c T1_B2b_no-fue-el-algoritmo 4.55 6.25
c T2_B3_cita-business-insider 6.25 9.07
c T2_B4_cronometro-60-90s 9.07 12.27
c T2_B5_riesgo-cancelar 12.27 15.37
c T3_B6_pantalla-inicio-netflix 15.37 18.43
c T3_B7_datos-filas 18.43 20.69
c T3_B8_80-20 20.69 24.69
c T4_B10_premio-1M-2009 26.01 30.81
c T4_B11_cita-techdirt 30.81 32.83
c T4_B12a_algoritmo-tachado 32.83 35.39
c T4_B12b_datos-en-cada-pantalla 35.39 38.43
c T5_B13a_no-necesitas-ser-netflix 38.43 40.6
c T5_B13_tabla-ventas 40.6 43.0
c T5_B14_cliente-ofertas 43.0 46.04
ffmpeg -v error -y -ss 46.04 -i out/netflix.mp4 -c:v libx264 -crf 17 -an $D/T6_B16_frase-cierre.mp4
ls $D
