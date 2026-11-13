// Uso: node reels/monthly/grabar_demo.js public/reels/monthly/rec   (desde una carpeta vacía; escribe frames/ en el cwd)
// Graba la demo real de Monthly con CDP screencast (cuadros JPEG con marca de tiempo).
const { chromium } = require('playwright');
const fs = require('fs'); const path = require('path'); const { execFileSync } = require('child_process');
const OUT = process.argv[2];
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
async function grabar(p, cdp, nombre, acciones) {
  const dir = path.join('frames', nombre); fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
  const frames = [];
  const h = async (e) => { const i = frames.length; fs.writeFileSync(path.join(dir, `${String(i).padStart(5,'0')}.jpg`), Buffer.from(e.data, 'base64')); frames.push(e.metadata.timestamp); cdp.send('Page.screencastFrameAck', { sessionId: e.sessionId }).catch(()=>{}); };
  cdp.on('Page.screencastFrame', h);
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 92, maxWidth: 2160, maxHeight: 1350, everyNthFrame: 1 });
  const t0 = Date.now() / 1000;
  await acciones();
  await cdp.send('Page.stopScreencast'); cdp.off('Page.screencastFrame', h);
  const t1 = Date.now() / 1000;
  // concat con duraciones reales
  let list = '';
  for (let i = 0; i < frames.length; i++) { const d = (i + 1 < frames.length ? frames[i+1] : t1) - frames[i]; list += `file '${path.resolve(dir, String(i).padStart(5,'0') + '.jpg')}'\nduration ${Math.max(0.001, d).toFixed(4)}\n`; }
  list += `file '${path.resolve(dir, String(frames.length-1).padStart(5,'0') + '.jpg')}'\n`;
  fs.writeFileSync(path.join(dir, 'list.txt'), list);
  execFileSync('ffmpeg', ['-y','-v','error','-f','concat','-safe','0','-i',path.join(dir,'list.txt'),'-vf','fps=30,scale=2160:-2:flags=lanczos,format=yuv420p','-c:v','libx264','-crf','16','-preset','slow', path.join(OUT, nombre + '.mp4')]);
  console.log(nombre, frames.length, 'cuadros', (t1 - frames[0]).toFixed(1), 's');
}
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1.5 });
  const p = await ctx.newPage();
  const cdp = await ctx.newCDPSession(p);
  await p.goto('https://monthly-demo.netlify.app/', { waitUntil: 'networkidle' });
  await sleep(500);
  const ir = async (n) => { // ir a la diapositiva n (1-based) desde la portada
    for (let i = 0; i < 12; i++) { await p.keyboard.press('ArrowLeft'); await sleep(120); }
    await sleep(800);
    for (let i = 1; i < n; i++) { await p.keyboard.press('ArrowRight'); await sleep(400); }
    await sleep(600);
    const pos = await p.evaluate(() => document.body.innerText.match(/(\d+) \/ 10/)?.[1]);
    if (String(pos) !== String(n)) throw new Error('diapositiva ' + pos + ' en vez de ' + n);
  };
  // 1 Portada
  await ir(1);
  await grabar(p, cdp, 'portada', async () => { await sleep(6000); });
  // 2 El problema (Fiscal → Real)
  await ir(2);
  await grabar(p, cdp, 'problema', async () => { await sleep(4500); await p.locator('label.fx-b.r').click({ force: true }); await sleep(5500); });
  // 6 Conexión (Contpaqi)
  await ir(6);
  await grabar(p, cdp, 'conexion', async () => { await sleep(1500); await p.mouse.click(197, 400); await sleep(6500); });
  // 4 Procesamiento (4 etapas)
  await ir(4);
  await grabar(p, cdp, 'procesamiento', async () => { await sleep(3000); for (let k = 0; k < 3; k++) { await p.mouse.click(805, 284); await sleep(3800); } });
  // 5 Plataforma (módulos y AskMara)
  await ir(5);
  await grabar(p, cdp, 'plataforma', async () => { await sleep(3000); await p.mouse.click(139, 437); await sleep(3500); await p.mouse.click(139, 747); await sleep(6000); });
  // 8 Casos de éxito (Transporte de carga)
  await ir(8);
  await grabar(p, cdp, 'casos', async () => { await sleep(1500); await p.mouse.click(587, 640); await sleep(6500); });
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
