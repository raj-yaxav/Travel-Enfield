import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 900 } });
await page.goto('http://localhost:3000/trips/spiti-valley-road-trip', { waitUntil: 'domcontentloaded', timeout: 30000 });
await page.waitForFunction(() => document.querySelector('.trip-mobile-cta') !== null, { timeout: 20000 }).catch(() => console.log('element never appeared'));
const info = await page.evaluate(() => {
  const card = document.querySelector('.trip-enquiry-sticky');
  const cta = document.querySelector('.trip-mobile-cta');
  const btnText = document.querySelector('.trip-mobile-book')?.textContent.trim();
  return {
    cardExists: !!card,
    cardVisible: card ? getComputedStyle(card).display !== 'none' : null,
    ctaExists: !!cta,
    ctaVisible: cta ? getComputedStyle(cta).display !== 'none' : null,
    mobileBtnText: btnText,
  };
});
console.log('RESULT:', JSON.stringify(info));
await browser.close();
