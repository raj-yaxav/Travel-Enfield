import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded', timeout: 30000 });
await page.waitForFunction(() => {
  const v = document.querySelector('.hero-intro-video video');
  return v && v.readyState >= 2;
}, { timeout: 20000 }).catch(() => console.log('timeout waiting for video'));
await page.evaluate(() => {
  const m = document.querySelector('#enquiry-modal'); if (m) m.remove();
  const orbit = document.querySelector('#enquiry-orbit'); if (orbit) orbit.remove();
});
const info = await page.evaluate(() => {
  const section = document.querySelector('.hero-intro-video');
  const rect = section.getBoundingClientRect();
  return { sectionHeight: rect.height, sectionWidth: rect.width };
});
console.log('mobile section size:', JSON.stringify(info));
await page.locator('.hero-intro-video').screenshot({ path: 'C:/Users/RAJ/AppData/Local/Temp/claude/c--6th-sem-travelclientWork/325d435c-9c7a-409b-8afb-20fd8161aa25/scratchpad/hero-video-mobile.png' });
await browser.close();
