import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('http://localhost:3000/', { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForTimeout(1500);
await page.evaluate(() => {
  const m = document.querySelector('#enquiry-modal'); if (m) m.remove();
  const orbit = document.querySelector('#enquiry-orbit'); if (orbit) orbit.remove();
});
const count = await page.locator('.trip-wishlist').count();
console.log('trip-wishlist count:', count);
const info = await page.evaluate(() => {
  const btn = document.querySelector('.trip-wishlist');
  if (!btn) return null;
  const r = btn.getBoundingClientRect();
  return { rect: r, ariaLabel: btn.getAttribute('aria-label'), visible: r.width > 0 && r.height > 0 };
});
console.log('first wishlist btn info:', info);
await page.close();
await browser.close();
