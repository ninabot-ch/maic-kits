#!/usr/bin/env node
// Captures de la home par thème : `astro preview` sur dist/ puis Playwright (chromium du frontend ninjob : PW_ROOT).
// Desktop 1440×900 à trois positions de défilement (haut, milieu, bas) + mobile 390×844, dans SHOTS_DIR/<thème>-*.png.
// Usage : node scripts/shots.mjs <thème> [--url http://…] — le kit doit avoir été construit avec l'échantillon voulu
// (scripts/build-samples.sh le fait, ou : cp samples/<thème>/*.yaml . && npm run build).
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
const PW_ROOT = process.env.PW_ROOT || '/root/ninjob-work/frontend';
const { chromium } = createRequire(path.join(PW_ROOT, 'package.json'))('playwright');
const OUT = process.env.SHOTS_DIR || path.resolve('shots'); fs.mkdirSync(OUT, { recursive: true });
const args = process.argv.slice(2); const name = args.find(a => !a.startsWith('--')) || 'kit';
const urlArg = args.indexOf('--url') >= 0 ? args[args.indexOf('--url') + 1] : null;
const PORT = +(process.env.PORT || 4321);
let server = null;
if (!urlArg) {
  server = spawn('npx', ['astro', 'preview', '--port', String(PORT), '--host', '127.0.0.1'], { stdio: ['ignore', 'pipe', 'inherit'], detached: true });
  await new Promise((ok, ko) => { const t = setTimeout(() => ko(new Error('preview : pas démarré')), 20000); server.stdout.on('data', d => { if (/localhost|127\.0\.0\.1/.test(String(d))) { clearTimeout(t); ok(); } }); });
}
const base = urlArg || `http://127.0.0.1:${PORT}`;
const browser = await chromium.launch();
try {
  const shoot = async (w, h, tag, positions) => {
    const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
    await page.goto(base + '/', { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    const total = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
    // la position « milieu » vise la scène collante (#story à mi-parcours) quand elle existe
    const storyMid = await page.evaluate(() => { const el = document.getElementById('story'); if (!el) return null; const r = el.getBoundingClientRect(); const n = +el.dataset.steps || 2; return Math.round(r.top + scrollY + (r.height - innerHeight) * (1 / Math.max(1, n - 1))); });
    for (const [label, frac] of positions) {
      // défilement progressif : le lerp du moteur suit, comme un vrai lecteur
      const y = label.includes('mid') && storyMid ? storyMid : Math.round(total * frac);
      await page.evaluate(async y => { const cur = scrollY; const steps = 12; for (let i = 1; i <= steps; i++) { scrollTo(0, cur + (y - cur) * i / steps); await new Promise(r => setTimeout(r, 40)); } }, y);
      await page.waitForTimeout(1600);
      await page.screenshot({ path: path.join(OUT, `${name}-${tag}-${label}.png`) });
    }
    await page.close();
  };
  await shoot(1440, 900, 'desktop', [['1-top', 0], ['2-mid', 0.42], ['3-low', 0.8]]);
  await shoot(390, 844, 'mobile', [['1-top', 0], ['2-mid', 0.45]]);
  console.log(`captures → ${OUT}/${name}-*.png`);
} finally { await browser.close(); if (server) { try { process.kill(-server.pid, 'SIGTERM'); } catch (e) { server.kill(); } } }
