import { chromium } from 'playwright';
const browser = await chromium.launch();

async function run(width, height, label) {
  const page = await browser.newPage({ viewport: { width, height } });
  await page.goto('http://localhost:3000/trips/leh-ladakh-bike-trip?noPopup', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  // scroll to the notes section (~4200px) so the tabs bar is mid-sticky
  await page.evaluate(() => window.scrollTo(0, 4300));
  await page.waitForTimeout(350);
  const r = await page.evaluate(() => {
    const header = document.querySelector('#header').getBoundingClientRect();
    const tabs = document.querySelector('.trip-audit-tabs').getBoundingClientRect();
    const active = document.querySelector('.trip-audit-tabs a.active')?.textContent.trim();
    return {
      headerH: Math.round(header.height),
      tabsTop: Math.round(tabs.top),
      tabsH: Math.round(tabs.height),
      flushBelowHeader: Math.round(tabs.top - header.bottom) === 0,
      activeTab: active,
    };
  });
  console.log(`${label}:`, JSON.stringify(r));
  await page.close();
}

await run(1440, 900, 'DESKTOP');
await run(390, 844, 'MOBILE');
await browser.close();
console.log('DONE');
