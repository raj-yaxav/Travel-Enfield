import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded', timeout: 30000 });
await page.waitForTimeout(2500);
await page.evaluate(() => {
  const m = document.querySelector('#enquiry-modal'); if (m) m.remove();
  const orbit = document.querySelector('#enquiry-orbit'); if (orbit) orbit.remove();
});
await page.evaluate(() => document.querySelectorAll('.footer-links-col')[1]?.scrollIntoView({ block: 'center' }));
await page.waitForTimeout(400);
const gap = await page.evaluate(() => {
  const uls = document.querySelectorAll('.footer-links-col ul');
  const ul = uls[1]; // second footer-links-col is Talk to Us
  const label = ul?.parentElement.querySelector('.footer-follow-label');
  return label && ul ? label.getBoundingClientRect().top - ul.getBoundingClientRect().bottom : null;
});
console.log('gap between WhatsApp Us list and Follow us on label (desktop):', gap);
await page.screenshot({ path: 'C:/Users/RAJ/AppData/Local/Temp/claude/c--6th-sem-travelclientWork/325d435c-9c7a-409b-8afb-20fd8161aa25/scratchpad/footer-gap-fixed.png' });
await browser.close();
