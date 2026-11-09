#!/usr/bin/env python3
"""Manuel cut-out for the 'green screen' beats of Mnc11Ideas.

RobustVideoMatting (MobileNetV3, ONNX) runs on public/mnc11/clips/base.mp4 for each window below
(seconds on the trimmed take, padded) and writes VP9 WebM with alpha (original pixels + RVM alpha),
public/mnc11/clips/cutout_<name>.webm, which Mnc11Reel places full-frame over the B-roll.
Needs: onnxruntime, opencv-python-headless, numpy; the model file from
https://github.com/PeterL1n/RobustVideoMatting/releases/download/v1.0.0/rvm_mobilenetv3_fp32.onnx
(path in $RVM_MODEL, downloaded next to the clips if missing).
"""
import os, subprocess, sys, urllib.request
import cv2, numpy as np, onnxruntime as ort

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
CLIPS = os.path.join(ROOT, "public/mnc11/clips")
BASE = os.path.join(CLIPS, "base.mp4")
MODEL = os.environ.get("RVM_MODEL", os.path.join(CLIPS, "rvm_mobilenetv3_fp32.onnx"))
WARM = 1.0  # s of warm-up so the recurrent matte is stable at the window start
# keep in sync with CUTOUT in src/mnc11/Mnc11Reel.tsx (start a bit before, end a bit after)
WINDOWS = {"problema": (9.0, 16.4), "jugada": (47.3, 51.8), "negocio": (54.2, 60.0)}

if not os.path.exists(MODEL):
    urllib.request.urlretrieve("https://github.com/PeterL1n/RobustVideoMatting/releases/download/v1.0.0/rvm_mobilenetv3_fp32.onnx", MODEL)
sess = ort.InferenceSession(MODEL, providers=["CPUExecutionProvider"])
names = [o.name for o in sess.get_outputs()]

for name, (a, b) in (WINDOWS.items() if len(sys.argv) < 2 else [(n, WINDOWS[n]) for n in sys.argv[1:]]):
    cap = cv2.VideoCapture(BASE)
    fps = cap.get(cv2.CAP_PROP_FPS)
    w, h = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)), int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    f0, fw, f1 = round(max(0, a - WARM) * fps), round(a * fps), round(b * fps)
    cap.set(cv2.CAP_PROP_POS_FRAMES, f0)
    out = os.path.join(CLIPS, f"cutout_{name}.webm")
    enc = subprocess.Popen(["ffmpeg", "-nostdin", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgba", "-s", f"{w}x{h}", "-r", f"{fps}",
                            "-i", "-", "-c:v", "libvpx-vp9", "-pix_fmt", "yuva420p", "-b:v", "0", "-crf", "24", "-row-mt", "1", "-auto-alt-ref", "0", out],
                           stdin=subprocess.PIPE)
    rec = [np.zeros((1, 1, 1, 1), np.float32)] * 4
    ds = np.array([0.25], np.float32)
    for f in range(f0, f1):
        ok, frame = cap.read()
        if not ok:
            break
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        src = (rgb.astype(np.float32) / 255.0).transpose(2, 0, 1)[None]
        res = dict(zip(names, sess.run(names, {"src": src, "r1i": rec[0], "r2i": rec[1], "r3i": rec[2], "r4i": rec[3], "downsample_ratio": ds})))
        rec = [res["r1o"], res["r2o"], res["r3o"], res["r4o"]]
        if f < fw:
            continue
        pha = np.clip(res["pha"][0, 0], 0, 1)
        rgba = np.dstack([rgb, (pha * 255).astype(np.uint8)])
        enc.stdin.write(rgba.tobytes())
    enc.stdin.close(); enc.wait(); cap.release()
    print(f"cutout_{name}.webm  {a:.2f}–{b:.2f} s")
