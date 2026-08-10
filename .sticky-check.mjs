import { chromium } from 'playwright';
const browser = await chromium.launch();

async function run(width, height, label) {
  const page = await browser.newPage({ viewport: { width, height } });
  await page.goto('http://localhost:3000/trips/leh-ladakh-bike-trip?noPopup', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(400);
  const r = await page.evaluate(() => {
    const header = document.querySelector('#header').getBoundingClientRect();
    const tabs = document.querySelector('.trip-audit-tabs').getBoundingClientRect();
    const overlap = header.bottom - tabs.top;
    return {
      headerBottom: Math.round(header.bottom),
      tabsTop: Math.round(tabs.top),
      overlapPx: Math.round(overlap),
      tabsVisibleBelowHeader: tabs.top >= header.bottom - 1,
    };
  });
  // footer clearance on mobile
  const f = await page.evaluate(() => {
    const foot = document.querySelector('.footer');
    return { padBottom: getComputedStyle(foot).paddingBottom, footBottom: Math.round(foot.getBoundingClientRect().bottom) };
  });
  const cta = await page.evaluate(() => {
    const c = document.querySelector('.trip-mobile-cta');
    if (!c || getComputedStyle(c).display === 'none') return { visible: false };
    const b = c.getBoundingClientRect();
    return { visible: true, top: Math.round(b.top), bottom: Math.round(b.bottom), vh: window.innerHeight };
  });
  console.log(`\n=== ${label} ===`);
  console.log('sticky tabs vs header:', JSON.stringify(r));
  console.log('footer:', JSON.stringify(f), '| cta:', JSON.stringify(cta));
  await page.close();
}

await run(1440, 900, 'DESKTOP');
await run(390, 844, 'MOBILE');
await browser.close();
console.log('\nDONE');
