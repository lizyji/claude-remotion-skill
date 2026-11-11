"""Utilidades compartidas por los scripts del flujo MNC."""
import json, re, subprocess, unicodedata
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent


def sh(cmd, **kw):
    return subprocess.run(cmd, check=True, text=True, capture_output=True, **kw)


def norm(s: str) -> str:
    s = unicodedata.normalize("NFD", s.lower())
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    return re.sub(r"[^a-z0-9 ]", "", s).strip()


def duracion(video: Path) -> float:
    out = sh(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(video)]).stdout
    return float(out.strip())


def leer(p: Path):
    return json.loads(Path(p).read_text(encoding="utf-8"))


def escribir(p: Path, data):
    Path(p).parent.mkdir(parents=True, exist_ok=True)
    Path(p).write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


def corregir(palabras):
    """Aplica correcciones.json sobre la lista [{w,start,end,prob?}] (fusiona claves de 2 palabras)."""
    dic = {norm(k): v for k, v in leer(Path(__file__).parent / "correcciones.json").items() if not k.startswith("_")}
    out, i = [], 0
    while i < len(palabras):
        p = palabras[i]
        if i + 1 < len(palabras):
            par = norm(p["w"]) + " " + norm(palabras[i + 1]["w"])
            if par in dic:
                q = palabras[i + 1]
                punt = re.findall(r"[.,;:?!]+$", q["w"])
                out.append({**p, "w": dic[par] + (punt[0] if punt else ""), "end": q["end"], "corregida": True})
                i += 2
                continue
        k = norm(p["w"])
        if k in dic and dic[k] != p["w"].strip(".,;:?!"):
            punt = re.findall(r"[.,;:?!]+$", p["w"])
            out.append({**p, "w": dic[k] + (punt[0] if punt else ""), "corregida": True})
        else:
            out.append(p)
        i += 1
    return out
