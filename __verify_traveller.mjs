import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded', timeout: 30000 });
await page.waitForFunction(() => document.querySelector('.traveller-love-video')?.readyState >= 2, { timeout: 20000 }).catch(() => console.log('video load timeout'));
await page.evaluate(() => {
  const m = document.querySelector('#enquiry-modal'); if (m) m.remove();
  const orbit = document.querySelector('#enquiry-orbit'); if (orbit) orbit.remove();
  document.querySelector('.traveller-love').scrollIntoView({ block: 'center' });
});
await page.waitForTimeout(600);
const info = await page.evaluate(() => {
  const section = document.querySelector('.traveller-love');
  const video = document.querySelector('.traveller-love-video');
  const src = video.querySelector('source')?.src;
  return {
    sectionBg: getComputedStyle(section).backgroundColor,
    videoBg: getComputedStyle(video).backgroundColor,
    src,
  };
});
console.log(JSON.stringify(info, null, 2));
await page.screenshot({ path: 'C:/Users/RAJ/AppData/Local/Temp/claude/c--6th-sem-travelclientWork/325d435c-9c7a-409b-8afb-20fd8161aa25/scratchpad/traveller-love-final.png' });
await browser.close();
