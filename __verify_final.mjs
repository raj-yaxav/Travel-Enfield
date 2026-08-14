import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded', timeout: 30000 });
await page.waitForTimeout(2000);
await page.evaluate(() => {
  const m = document.querySelector('#enquiry-modal'); if (m) m.remove();
  const orbit = document.querySelector('#enquiry-orbit'); if (orbit) orbit.remove();
});
await page.locator('#campaign-slider').scrollIntoViewIfNeeded();
await page.waitForTimeout(300);
const desktop = await page.evaluate(() => {
  const el = document.querySelector('#campaign-slider');
  const r = el.getBoundingClientRect();
  const cs = getComputedStyle(el);
  return { width: r.width, height: r.height, ratio: (r.width / r.height).toFixed(3), borderRadius: cs.borderRadius };
});
console.log('desktop:', desktop, 'expected ratio ~5.33, borderRadius 24px');
await page.locator('#campaign-slider').screenshot({ path: 'C:/Users/RAJ/AppData/Local/Temp/claude/c--6th-sem-travelclientWork/325d435c-9c7a-409b-8afb-20fd8161aa25/scratchpad/campaign-final-desktop.png' });

await page.setViewportSize({ width: 390, height: 844 });
await page.waitForTimeout(300);
await page.locator('#campaign-slider').scrollIntoViewIfNeeded();
await page.waitForTimeout(300);
const mobile = await page.evaluate(() => {
  const el = document.querySelector('#campaign-slider');
  const r = el.getBoundingClientRect();
  const cs = getComputedStyle(el);
  return { width: r.width, height: r.height, ratio: (r.width / r.height).toFixed(3), borderRadius: cs.borderRadius };
});
console.log('mobile:', mobile, 'expected ratio 4.0, borderRadius 16px');
await page.locator('#campaign-slider').screenshot({ path: 'C:/Users/RAJ/AppData/Local/Temp/claude/c--6th-sem-travelclientWork/325d435c-9c7a-409b-8afb-20fd8161aa25/scratchpad/campaign-final-mobile.png' });
await browser.close();
