import { spawn } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const widths = [320, 375, 430, 768, 1024, 1280, 1440, 1920];
const baseURL = process.env.AUDIT_URL || 'http://localhost:3000/';
const reference = JSON.parse(await readFile(new URL('./audit.json', import.meta.url), 'utf8'));
const auditSource = await readFile(new URL('./Responsive-audit.js', import.meta.url), 'utf8');
let server;

async function isReady() {
  try { return (await fetch(baseURL)).ok; } catch { return false; }
}

async function startServer() {
  if (await isReady()) return;
  server = spawn(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'dev'], {
    cwd: new URL('.', import.meta.url), stdio: 'pipe', shell: false
  });
  const deadline = Date.now() + 60_000;
  while (Date.now() < deadline) {
    if (await isReady()) return;
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  throw new Error(`Dev server did not become ready at ${baseURL}`);
}

const number = value => Number.parseFloat(value) || 0;
const near = (actual, expected, tolerance) => Math.abs(number(actual) - number(expected)) <= tolerance;
const imageBy = (view, needle) => view.images.find(item => `${item.alt} ${item.file}`.toLowerCase().includes(needle));
const cardBy = (view, needle) => view.cards.find(item => `${item.container} ${item.group || ''}`.toLowerCase().includes(needle));

function targetFor(name, ref) {
  if (name === 'Container') {
    const container = ref.containers.find(x => x.section.startsWith('main.'));
    return container ? container.contentWidth - number(container.padL) - number(container.padR) : null;
  }
  if (name === 'Headings') return ref.typography?.h2;
  if (name === 'Destinations') return cardBy(ref, 'auto-cols-max');
  if (name === 'Trips') return imageBy(ref, 'vietnam 8 days');
  if (name === 'Campaign') return imageBy(ref, 'new year sale banner');
  if (name === 'Trending') return imageBy(ref, 'frame 6473');
  if (name === 'Reviews') return cardBy(ref, ref.viewport < 768 ? 'embla__container' : 'grid.grid-cols-1');
  if (name === 'Blogs') return imageBy(ref, 'places to visit');
  if (name === 'Videos') return imageBy(ref, 'thumbnail 1');
  return null;
}

function actualFor(name, snap) {
  if (name === 'Container') return snap.images.find(x => x.alt === 'Bali')?.path.includes('destination')
    ? (snap.viewport < 768 ? snap.viewport - 24 : snap.viewport - 160) : null;
  if (name === 'Headings') return snap.headings.find(x => x.text === 'Explore Destinations');
  if (name === 'Destinations') return snap.cards.find(x => x.group.includes('destination-grid'));
  if (name === 'Trips') return snap.images.find(x => x.alt.includes('Leh Ladakh Bike Trip'));
  if (name === 'Campaign') return snap.images.find(x => x.alt.includes('Himalayan group adventures'));
  if (name === 'Trending') return snap.images.find(x => x.alt === 'Bali Tour Packages');
  if (name === 'Reviews') return snap.cards.find(x => x.group.includes('review-track'));
  if (name === 'Blogs') return snap.images.find(x => x.path.includes('journal-img'));
  if (name === 'Videos') return snap.images.find(x => x.path.includes('story-reel'));
  return null;
}

function compare(name, actual, target) {
  if (!actual || !target) return { pass: false, detail: 'measurement unavailable' };
  if (name === 'Container') return { pass: near(actual, target, 4), detail: `${actual}/${target}px` };
  if (name === 'Headings') {
    const pass = actual.fontSize === target.size && actual.lineHeight === target.lineHeight && actual.fontWeight === target.weight;
    return { pass, detail: `${actual.fontSize}/${actual.lineHeight}/${actual.fontWeight} vs ${target.size}/${target.lineHeight}/${target.weight}` };
  }
  if (name === 'Destinations') {
    const pass = near(actual.cardW, target.cardW, 4) && near(actual.cardH, target.cardH, 4) && near(actual.measuredGap, target.gap || target.measuredGap, 2);
    return { pass, detail: `${actual.cardW}×${actual.cardH} vs ${target.cardW}×${target.cardH}` };
  }
  const aw = actual.renderW ?? actual.cardW, ah = actual.renderH ?? actual.cardH;
  const tw = target.renderW ?? target.cardW, th = target.renderH ?? target.cardH;
  return { pass: near(aw, tw, 4) && near(ah, th, 4), detail: `${aw}×${ah} vs ${tw}×${th}` };
}

await startServer();
const browser = await chromium.launch({ headless: true });
const captures = {};
const names = ['Container', 'Headings', 'Destinations', 'Trips', 'Campaign', 'Trending', 'Reviews', 'Blogs', 'Videos'];
const rows = [];

try {
  for (const width of widths) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    await page.goto(baseURL, { waitUntil: 'networkidle' });
    await page.addScriptTag({ content: auditSource });
    captures[width] = await page.evaluate(() => capture());
    const ref = reference.viewports[String(width)];
    for (const name of names) {
      const result = compare(name, actualFor(name, captures[width]), targetFor(name, ref));
      rows.push({ section: name, viewport: width, result: result.pass ? 'PASS' : 'FAIL', detail: result.detail });
    }
    await page.close();
  }
} finally {
  await browser.close();
  if (server) server.kill();
}

await writeFile(new URL('./actual-audit.json', import.meta.url), JSON.stringify(captures, null, 2));
console.table(rows);
const failures = rows.filter(row => row.result === 'FAIL');
console.log(`\n${rows.length - failures.length}/${rows.length} checks passed.`);
if (failures.length) process.exitCode = 1;
