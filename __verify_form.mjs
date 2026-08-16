import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 700 } });
await page.goto('http://localhost:3000/trips/spiti-valley-road-trip', { waitUntil: 'domcontentloaded', timeout: 30000 });
await page.waitForFunction(() => document.querySelector('.trip-mobile-cta') !== null, { timeout: 15000 });
await page.evaluate(() => {
  const m = document.querySelector('#enquiry-modal'); if (m) m.remove();
  const orbit = document.querySelector('#enquiry-orbit'); if (orbit) orbit.remove();
});
await page.locator('.trip-mobile-cta').screenshot({ path: 'C:/Users/RAJ/AppData/Local/Temp/claude/c--6th-sem-travelclientWork/325d435c-9c7a-409b-8afb-20fd8161aa25/scratchpad/mobile-cta-final.png' });
await page.locator('.trip-mobile-book').click();
await page.waitForTimeout(500);
const dialogInfo = await page.evaluate(() => {
  const d = document.querySelector('.departure-dialog');
  const r = d.getBoundingClientRect();
  return { width: r.width, height: r.height, viewportHeight: window.innerHeight, fitsInViewport: r.height <= window.innerHeight };
});
console.log('dialog info:', JSON.stringify(dialogInfo));
await page.screenshot({ path: 'C:/Users/RAJ/AppData/Local/Temp/claude/c--6th-sem-travelclientWork/325d435c-9c7a-409b-8afb-20fd8161aa25/scratchpad/departure-form-mobile.png' });
await browser.close();
