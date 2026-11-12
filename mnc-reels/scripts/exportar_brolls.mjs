// Renderiza los B-rolls sueltos de reels/<slug>/brolls.json en out/<slug>_brolls/
// Uso: node scripts/exportar_brolls.mjs <slug> [--browser-executable=...] [--solo=ID]
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

const [slug, ...rest] = process.argv.slice(2);
const extra = rest.filter((a) => a.startsWith("--browser"));
const solo = rest.find((a) => a.startsWith("--solo="))?.slice(7);
const spec = JSON.parse(readFileSync(`reels/${slug}/brolls.json`, "utf8"));
const outDir = `out/${slug}_brolls`;
mkdirSync(outDir, { recursive: true });
const run = (comp, props, out) => {
  const pf = `${outDir}/.props.json`;
  writeFileSync(pf, JSON.stringify(props));
  execFileSync("npx", ["remotion", "render", "src/index.ts", comp, out, "--codec", "h264", "--crf", "17", `--props=${pf}`, "--log=error", ...extra], { stdio: "inherit" });
};
for (const c of spec.brolls) {
  if (solo && c.id !== solo) continue;
  const dur = c.dur ?? c.b.end - c.b.start;
  console.log("→", c.id);
  run("Clip", { b: c.b, desde: c.desde ?? 0, dur }, `${outDir}/${c.id}.mp4`);
}
if (spec.cierre && (!solo || solo === spec.cierre.id)) {
  console.log("→", spec.cierre.id);
  run("Cierre", { dur: spec.cierre.dur }, `${outDir}/${spec.cierre.id}.mp4`);
}
