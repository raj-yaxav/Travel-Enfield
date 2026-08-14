import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('http://localhost:3000/', { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForTimeout(1500);
await page.evaluate(() => {
  const m = document.querySelector('#enquiry-modal'); if (m) m.remove();
  const orbit = document.querySelector('#enquiry-orbit'); if (orbit) orbit.remove();
});
await page.locator('.home-journal').scrollIntoViewIfNeeded();
await page.waitForTimeout(300);
await page.locator('.journal-card').first().screenshot({ path: 'C:/Users/RAJ/AppData/Local/Temp/claude/c--6th-sem-travelclientWork/325d435c-9c7a-409b-8afb-20fd8161aa25/scratchpad/journal-home-fixed.png' });

const layout = await page.evaluate(() => {
  const body = document.querySelector('.journal-card .journal-body');
  const small = body.querySelector('small');
  const cta = body.querySelector('.journal-cta');
  const sr = small.getBoundingClientRect();
  const cr = cta.getBoundingClientRect();
  return { smallLeft: sr.left, ctaRight: cr.right, ctaLeft: cr.left, bodyDisplay: getComputedStyle(body).display, sameRow: Math.abs(sr.top - cr.top) < 5 };
});
console.log(JSON.stringify(layout, null, 2));
await page.close();
await browser.close();
