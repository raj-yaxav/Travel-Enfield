import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded', timeout: 30000 });
await page.waitForFunction(() => {
  const v = document.querySelector('.hero-intro-video video');
  return v && v.readyState >= 2;
}, { timeout: 20000 }).catch(() => console.log('timeout waiting for video load'));
await page.evaluate(() => {
  const m = document.querySelector('#enquiry-modal'); if (m) m.remove();
  const orbit = document.querySelector('#enquiry-orbit'); if (orbit) orbit.remove();
});
const info = await page.evaluate(() => {
  const section = document.querySelector('.hero-intro-video');
  const v = section.querySelector('video');
  const cs = getComputedStyle(v);
  const rect = section.getBoundingClientRect();
  return { sectionHeight: rect.height, sectionWidth: rect.width, objectFit: cs.objectFit };
});
console.log('desktop:', JSON.stringify(info));
await page.locator('.hero-intro-video').screenshot({ path: 'C:/Users/RAJ/AppData/Local/Temp/claude/c--6th-sem-travelclientWork/325d435c-9c7a-409b-8afb-20fd8161aa25/scratchpad/hero-final-desktop.png' });
await browser.close();
