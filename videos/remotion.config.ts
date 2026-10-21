import { Config } from "@remotion/cli/config";
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

// Claude Code on the web: Remotion's Chrome auto-download is blocked, but
// Playwright ships a headless_shell under /opt/pw-browsers. Use it if present.
const PW = "/opt/pw-browsers";
if (existsSync(PW)) {
  const dir = readdirSync(PW).find((d) => d.startsWith("chromium_headless_shell-"));
  const bin = dir && join(PW, dir, "chrome-linux", "headless_shell");
  if (bin && existsSync(bin)) Config.setBrowserExecutable(bin);
}

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
