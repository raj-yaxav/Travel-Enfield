import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
page.on('pageerror', e => console.log('PAGEERROR:', e.message));
await page.goto('http://localhost:3000/trips/spiti-valley-road-trip', { waitUntil: 'domcontentloaded', timeout: 30000 });
await page.waitForTimeout(3500);
await page.evaluate(() => {
  const m = document.querySelector('#enquiry-modal'); if (m) m.remove();
  const orbit = document.querySelector('#enquiry-orbit'); if (orbit) orbit.remove();
});
await page.screenshot({ path: 'C:/Users/RAJ/AppData/Local/Temp/claude/c--6th-sem-travelclientWork/325d435c-9c7a-409b-8afb-20fd8161aa25/scratchpad/new-trip-1.png' });
await page.mouse.wheel(0, 850);
await page.waitForTimeout(400);
await page.screenshot({ path: 'C:/Users/RAJ/AppData/Local/Temp/claude/c--6th-sem-travelclientWork/325d435c-9c7a-409b-8afb-20fd8161aa25/scratchpad/new-trip-2.png' });
await page.mouse.wheel(0, 1200);
await page.waitForTimeout(400);
await page.screenshot({ path: 'C:/Users/RAJ/AppData/Local/Temp/claude/c--6th-sem-travelclientWork/325d435c-9c7a-409b-8afb-20fd8161aa25/scratchpad/new-trip-3.png' });
await browser.close();
process.exit(0);
