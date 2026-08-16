import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 700 } });
await page.goto('http://localhost:3000/trips/spiti-valley-road-trip', { waitUntil: 'domcontentloaded', timeout: 30000 });
await page.waitForFunction(() => document.querySelector('.trip-mobile-cta') !== null, { timeout: 15000 });
await page.evaluate(() => {
  const m = document.querySelector('#enquiry-modal'); if (m) m.remove();
  const orbit = document.querySelector('#enquiry-orbit'); if (orbit) orbit.remove();
});
await page.locator('.trip-mobile-book').click();
await page.waitForTimeout(600);
const info = await page.evaluate(() => {
  const modal = document.querySelector('.departure-modal');
  const r = modal.getBoundingClientRect();
  return { class: modal.className, top: r.top, left: r.left, width: r.width, height: r.height, viewportW: window.innerWidth, viewportH: window.innerHeight };
});
console.log('modal:', JSON.stringify(info));
await page.screenshot({ path: 'C:/Users/RAJ/AppData/Local/Temp/claude/c--6th-sem-travelclientWork/325d435c-9c7a-409b-8afb-20fd8161aa25/scratchpad/departure-form-fixed.png' });
await browser.close();
