import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded', timeout: 30000 });
await page.waitForTimeout(3500);
const info = await page.evaluate(() => {
  const v = document.querySelector('.hero-intro-video video');
  const rect = v.getBoundingClientRect();
  return {
    renderedWidth: rect.width,
    renderedHeight: rect.height,
    renderedRatio: (rect.width / rect.height).toFixed(4),
    expectedRatio: (16/9).toFixed(4),
  };
});
console.log('RESULT:', JSON.stringify(info));
await page.evaluate(() => {
  const m = document.querySelector('#enquiry-modal'); if (m) m.remove();
  const orbit = document.querySelector('#enquiry-orbit'); if (orbit) orbit.remove();
});
await page.locator('.hero-intro-video').screenshot({ path: 'C:/Users/RAJ/AppData/Local/Temp/claude/c--6th-sem-travelclientWork/325d435c-9c7a-409b-8afb-20fd8161aa25/scratchpad/hero-video-fixed.png' });
await browser.close();
