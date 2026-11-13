# Corta los B-rolls sueltos (mitad de arriba 1080×960) y los golpes del render final.
import json, subprocess, os
r = json.load(open('reels/monthly/reel.json'))
nombres = ["T1_B1a_portada-monthly","T1_B1b_estado-de-resultados","T1_B1c_fiscal-vs-real",
 "T2_B2_sello-hecha-para-el-SAT","T2_B3a_lo-que-no-muestra","T2_B3b_inversion-como-gasto","T2_B3c_fiscal-vs-real-cifras-ficticias",
 "T3_B4a_monthly","T3_B4b_1er-AI-CFO","T3_B5_conexion-contpaqi","T3_B6_1-audita","T3_B7a_2-limpia","T3_B7b_24h-despues-del-cierre",
 "T3_B8a_metricas","T3_B8b_askmara","T3_B8c_askmara-zoom","T3_B8d_como-chatgpt",
 "T4_B11a_casos-de-exito","T4_B11c_transporte-75","T5_B12a_la-leccion","T5_B12b_por-fin-visibilidad"]
assert len(nombres) == len(r['broll'])
os.makedirs("out/monthly_brolls", exist_ok=True)
def cut(s, e, n, vf):
    subprocess.run(["ffmpeg","-v","error","-y","-ss",f"{s:.3f}","-i","out/monthly.mp4","-t",f"{e-s:.3f}","-vf",vf,"-an","-c:v","libx264","-crf","17","-pix_fmt","yuv420p",f"out/monthly_brolls/{n}.mp4"],check=True)
for b, n in zip(r['broll'], nombres): cut(b['start'], b['end'], n, "crop=1080:960:0:0")
g = r['golpes']
cut(g[0]['start'], g[0]['end'], "T4_B11b_golpe-75-pantalla-completa", "null")
cut(g[1]['start'], r['duracion'], "T6_B13_frase-de-cierre-pantalla-completa", "null")
