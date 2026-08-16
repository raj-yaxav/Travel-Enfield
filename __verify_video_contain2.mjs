import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded', timeout: 30000 });
await page.waitForFunction(() => {
  const v = document.querySelector('.hero-intro-video video');
  return v && v.readyState >= 2;
}, { timeout: 20000 }).catch(() => console.log('video did not reach readyState 2 in time'));
await page.evaluate(() => {
  const m = document.querySelector('#enquiry-modal'); if (m) m.remove();
  const orbit = document.querySelector('#enquiry-orbit'); if (orbit) orbit.remove();
});
const info = await page.evaluate(() => {
  const section = document.querySelector('.hero-intro-video');
  const v = section.querySelector('video');
  const sRect = section.getBoundingClientRect();
  const vRect = v.getBoundingClientRect();
  return {
    readyState: v.readyState,
    videoWidth: v.videoWidth,
    videoHeight: v.videoHeight,
    sectionHeight: sRect.height,
    videoRenderedHeight: vRect.height,
    videoRenderedWidth: vRect.width,
  };
});
console.log('RESULT:', JSON.stringify(info, null, 2));
await page.locator('.hero-intro-video').screenshot({ path: 'C:/Users/RAJ/AppData/Local/Temp/claude/c--6th-sem-travelclientWork/325d435c-9c7a-409b-8afb-20fd8161aa25/scratchpad/hero-video-contain2.png' });
await browser.close();
