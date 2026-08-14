import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded', timeout: 30000 });
await page.waitForTimeout(3000);
await page.evaluate(() => {
  const m = document.querySelector('#enquiry-modal'); if (m) m.remove();
  const orbit = document.querySelector('#enquiry-orbit'); if (orbit) orbit.remove();
});
const count = await page.evaluate(() => document.querySelectorAll('.social-icon').length);
const labels = await page.evaluate(() => [...document.querySelectorAll('.social-icon')].map(a => a.getAttribute('aria-label')));
console.log('social icon count:', count);
console.log('labels:', JSON.stringify(labels));
await page.evaluate(() => document.querySelector('.footer-columns-grid').scrollIntoView());
await page.waitForTimeout(500);
await page.screenshot({ path: 'C:/Users/RAJ/AppData/Local/Temp/claude/c--6th-sem-travelclientWork/325d435c-9c7a-409b-8afb-20fd8161aa25/scratchpad/talktous-desktop.png' });
await browser.close();
