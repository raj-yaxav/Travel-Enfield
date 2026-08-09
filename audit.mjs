// Responsive reverse-engineering audit for https://www.captureatrip.com/
// Uses breakpoints()/capture() from Responsive-audit.js as-is (injected, unmodified).
// report.md tables are assembled here in Node because that script's report()
// compares widths stored in window.__audit within ONE page — but each viewport
// here gets a fresh browser context (required so DOM-swapped subtrees don't
// leak stale nodes between widths), so cross-width comparison has to happen
// after collection, not in-page.

import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs/promises';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCRIPT_PATH = path.join(__dirname, 'Responsive-audit.js');
const URL = process.argv[2] || 'https://www.captureatrip.com/';
const WIDTHS = [320, 375, 430, 768, 1024, 1280, 1440, 1920];
const VIEWPORT_HEIGHT = 900;

function slugFromUrl(url) {
  const { pathname } = new URL_(url);
  const trimmed = pathname.replace(/^\/|\/$/g, '');
  return trimmed ? trimmed.replace(/\//g, '-') : 'home';
}
const URL_ = globalThis.URL; // avoid clashing with the page-URL constant above
const OUT_SLUG = process.argv[3] || slugFromUrl(URL);
const JSON_NAME = OUT_SLUG === 'home' ? 'audit.json' : `audit-${OUT_SLUG}.json`;
const REPORT_NAME = OUT_SLUG === 'home' ? 'report.md' : `report-${OUT_SLUG}.md`;

async function autoScroll(page) {
  const maxSteps = 80; // safety cap against infinite-scroll pages
  let steps = 0;
  while (steps < maxSteps) {
    const { scrollY, scrollHeight, innerHeight } = await page.evaluate(() => ({
      scrollY: window.scrollY,
      scrollHeight: document.body.scrollHeight,
      innerHeight: window.innerHeight
    }));
    if (scrollY + innerHeight >= scrollHeight - 10) break;
    await page.evaluate(() => window.scrollBy(0, 400));
    await page.waitForTimeout(300);
    steps++;
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(2000);
}

function mdTable(headers, rows) {
  const esc = (v) => (v === undefined || v === null || v === '' ? '—' : String(v))
    .replace(/\|/g, '\\|')
    .replace(/\n/g, ' ');
  const headerLine = `| ${headers.map(esc).join(' | ')} |`;
  const sepLine = `| ${headers.map(() => '---').join(' | ')} |`;
  const bodyLines = rows.map((r) => `| ${headers.map((h) => esc(r[h])).join(' | ')} |`);
  return [headerLine, sepLine, ...bodyLines].join('\n');
}

function buildBreakpointTable(breakpoints) {
  const rows = breakpoints.map((b) => ({
    Breakpoint: b.breakpoint,
    px: b.px,
    'Rules Affected': b.rulesAffected
  }));
  return mdTable(['Breakpoint', 'px', 'Rules Affected'], rows);
}

function buildContainerTable(widths, byWidth) {
  const cols = widths.filter((w) => byWidth[w]);
  const names = [...new Set(cols.flatMap((w) => byWidth[w].containers.map((c) => c.section)))];
  const headers = ['Section', ...cols.map((w) => `${w}px`)];
  const rows = names.map((name) => {
    const row = { Section: name };
    cols.forEach((w) => {
      const c = byWidth[w].containers.find((x) => x.section === name);
      row[`${w}px`] = c ? `${c.contentWidth}px (pad ${c.padL}/${c.padR})` : '—';
    });
    return row;
  });
  return mdTable(headers, rows);
}

function buildCardTable(widths, byWidth) {
  const cols = widths.filter((w) => byWidth[w]);
  const names = [...new Set(cols.flatMap((w) => byWidth[w].cards.map((c) => c.container)))];
  const headers = ['Card Group', ...cols.map((w) => `${w}px`)];
  const rows = names.map((name) => {
    const row = { 'Card Group': name };
    cols.forEach((w) => {
      const c = byWidth[w].cards.find((x) => x.container === name);
      row[`${w}px`] = c
        ? `${c.count}× ${c.cardW}px gap:${c.gap || '-'} cols:${c.gridCols || '-'}`
        : '—';
    });
    return row;
  });
  return mdTable(headers, rows);
}

function buildTypeScaleTable(widths, byWidth) {
  const cols = widths.filter((w) => byWidth[w]);
  const headers = ['Element', ...cols.map((w) => `${w}px`)];
  const rows = ['h1', 'h2', 'h3', 'p', 'a', 'button'].map((sel) => {
    const row = { Element: sel };
    cols.forEach((w) => {
      const t = byWidth[w].typography[sel];
      row[`${w}px`] = t ? `${t.size}/${t.lineHeight} ${t.weight}` : '—';
    });
    return row;
  });
  return mdTable(headers, rows);
}

function buildDomSwapTable(widths, byWidth) {
  const cols = widths.filter((w) => byWidth[w]);
  const files = [...new Set(cols.flatMap((w) => byWidth[w].domSwap.map((s) => s.file)))];
  const headers = ['File', 'Alt', ...cols.map((w) => `${w}px`)];
  const rows = files
    .map((file) => {
      const row = { File: file, Alt: '' };
      cols.forEach((w) => {
        const s = byWidth[w].domSwap.find((x) => x.file === file);
        if (s && !row.Alt) row.Alt = s.alt;
        row[`${w}px`] = s ? (s.visible ? 'shown' : 'hidden') : '—';
      });
      return row;
    })
    .filter((row) => {
      const vals = cols.map((w) => row[`${w}px`]).filter((v) => v !== '—');
      return new Set(vals).size > 1;
    });
  return { table: mdTable(headers, rows), changedCount: rows.length };
}

function buildTokenTables(widths, byWidth) {
  const merge = (key) => {
    const totals = new Map();
    widths.forEach((w) => {
      if (!byWidth[w]) return;
      (byWidth[w].tokens[key] || []).forEach(({ value, uses }) => {
        totals.set(value, (totals.get(value) || 0) + uses);
      });
    });
    return [...totals.entries()].sort((a, b) => b[1] - a[1]);
  };

  const toTable = (entries, n) =>
    mdTable(
      ['Value', 'Total Uses'],
      entries.slice(0, n).map(([value, uses]) => ({ Value: value, 'Total Uses': uses }))
    );

  return {
    colors: toTable(merge('colors'), 12),
    radii: toTable(merge('radii'), 8),
    shadows: toTable(merge('shadows'), 6),
    spacing: toTable(merge('spacing'), 16)
  };
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const failures = [];
  const byWidth = {};
  let breakpointsResult = [];

  console.log(`Starting audit of ${URL}`);

  // --- BREAKPOINT PASS -----------------------------------------------------
  console.log('\n[breakpoint pass] loading at 1440x900...');
  {
    const context = await browser.newContext({
      viewport: { width: 1440, height: VIEWPORT_HEIGHT },
      deviceScaleFactor: 1
    });
    const page = await context.newPage();
    try {
      await page.goto(URL, { waitUntil: 'networkidle', timeout: 60000 });
      await page.addScriptTag({ path: SCRIPT_PATH });
      breakpointsResult = await page.evaluate(() => breakpoints());
      console.log(`[breakpoint pass] found ${breakpointsResult.length} observed breakpoint(s).`);
    } catch (err) {
      console.error(`[breakpoint pass] FAILED: ${err.message}`);
      failures.push({ stage: 'breakpoints', error: err.message });
    } finally {
      await context.close();
    }
  }

  // --- VIEWPORT PASS ---------------------------------------------------------
  for (const width of WIDTHS) {
    console.log(`\n[viewport ${width}px] starting...`);
    const context = await browser.newContext({
      viewport: { width, height: VIEWPORT_HEIGHT },
      deviceScaleFactor: 1
    });
    const page = await context.newPage();
    try {
      await page.goto(URL, { waitUntil: 'networkidle', timeout: 60000 });
      await autoScroll(page);
      await page.addScriptTag({ path: SCRIPT_PATH });
      const snap = await page.evaluate(() => capture());
      byWidth[width] = snap;
      console.log(`[viewport ${width}px] captured: ${snap.sections.length} sections, ${snap.cards.length} card groups, ${snap.images.length} images.`);
    } catch (err) {
      console.error(`[viewport ${width}px] FAILED: ${err.message}`);
      failures.push({ stage: `viewport-${width}`, error: err.message });
    } finally {
      await context.close();
    }
  }

  await browser.close();

  // --- OUTPUT: audit.json ---------------------------------------------------
  const auditJson = {
    url: URL,
    capturedAt: new Date().toISOString(),
    breakpoints: breakpointsResult,
    viewports: byWidth,
    failures
  };
  const jsonPath = path.join(__dirname, JSON_NAME);
  await fs.writeFile(jsonPath, JSON.stringify(auditJson, null, 2), 'utf8');

  // --- OUTPUT: report.md -----------------------------------------------------
  const succeededWidths = WIDTHS.filter((w) => byWidth[w]);
  const domSwap = buildDomSwapTable(succeededWidths, byWidth);
  const tokens = buildTokenTables(succeededWidths, byWidth);

  const report = `# Responsive Audit — ${URL}

Captured ${new Date().toISOString()}
Widths requested: ${WIDTHS.join(', ')}
Widths succeeded: ${succeededWidths.join(', ') || 'none'}
Widths failed: ${failures.length ? failures.map((f) => f.stage).join(', ') : 'none'}

## 1. Observed @media Breakpoints

${breakpointsResult.length ? buildBreakpointTable(breakpointsResult) : '_No breakpoints captured (breakpoint pass failed)._'}

## 2. Container Width + Horizontal Padding per Section

${succeededWidths.length ? buildContainerTable(succeededWidths, byWidth) : '_No viewport data captured._'}

## 3. Card Groups (count, card width, gap, grid-template-columns)

${succeededWidths.length ? buildCardTable(succeededWidths, byWidth) : '_No viewport data captured._'}

## 4. Type Scale (size/line-height weight)

${succeededWidths.length ? buildTypeScaleTable(succeededWidths, byWidth) : '_No viewport data captured._'}

## 5. DOM Swap Table (image assets whose visibility changes across widths)

This is the master breakpoint signal — rows below are images that are shown at
some captured widths and hidden at others.

${domSwap.changedCount ? domSwap.table : '_No visibility changes detected across captured widths._'}

## 6. Design Tokens (most-used across all captured viewports)

### Colors

${tokens.colors}

### Border Radii

${tokens.radii}

### Shadows

${tokens.shadows}

### Spacing Values

${tokens.spacing}
`;

  const reportPath = path.join(__dirname, REPORT_NAME);
  await fs.writeFile(reportPath, report, 'utf8');

  // --- SUMMARY ----------------------------------------------------------
  console.log('\n===== AUDIT SUMMARY =====');
  console.log(`URL: ${URL}`);
  console.log(`Breakpoints observed: ${breakpointsResult.length}`);
  console.log(`Viewports captured: ${succeededWidths.length}/${WIDTHS.length} (${succeededWidths.join(', ') || 'none'})`);
  if (failures.length) {
    console.log(`Failures (${failures.length}):`);
    failures.forEach((f) => console.log(`  - ${f.stage}: ${f.error}`));
  } else {
    console.log('Failures: none');
  }
  console.log(`DOM-swap rows (visibility changes across widths): ${domSwap.changedCount}`);
  console.log(`Wrote: ${jsonPath}`);
  console.log(`Wrote: ${reportPath}`);
  console.log('==========================');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exitCode = 1;
});
