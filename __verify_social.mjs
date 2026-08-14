import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded', timeout: 30000 });
await page.waitForTimeout(3000);
await page.evaluate(() => {
  const m = document.querySelector('#enquiry-modal'); if (m) m.remove();
  const orbit = document.querySelector('#enquiry-orbit'); if (orbit) orbit.remove();
});
const count = await page.evaluate(() => document.querySelectorAll('.footer-links-col:nth-of-type(2) .social-icon').length);
console.log('desktop social icon count (should be 4, no youtube):', count);
await page.evaluate(() => document.querySelector('.footer-columns-grid').scrollIntoView());
await page.waitForTimeout(500);
await page.locator('.footer-links-col:nth-of-type(2)').screenshot({ path: 'C:/Users/RAJ/AppData/Local/Temp/claude/c--6th-sem-travelclientWork/325d435c-9c7a-409b-8afb-20fd8161aa25/scratchpad/talktous-desktop.png' });
await browser.close();
process.exit(0);
