import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded', timeout: 30000 });
await page.waitForTimeout(500);
const start = Date.now();
let firstChangeT = null;
for (let i = 0; i < 60; i++) {
  const val = await page.evaluate(() => document.querySelector('#campaign-track')?.style.transform);
  if (i > 0 && val !== '0' && firstChangeT === null && val && val.includes('-100')) {
    firstChangeT = Date.now() - start;
  }
  await page.waitForTimeout(100);
}
console.log('time to first slide change (ms):', firstChangeT);
await browser.close();
