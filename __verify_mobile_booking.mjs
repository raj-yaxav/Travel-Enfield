import { chromium } from 'playwright';
const browser = await chromium.launch();

for (const w of [390, 800, 1023, 1024, 1440]) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 } });
  await page.goto('http://localhost:3000/trips/spiti-valley-road-trip', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(w === 390 ? 4000 : 1500);
  const info = await page.evaluate(() => {
    const card = document.querySelector('.trip-enquiry-sticky');
    const cta = document.querySelector('.trip-mobile-cta');
    const btnText = document.querySelector('.trip-mobile-book')?.textContent.trim();
    return {
      cardVisible: card ? getComputedStyle(card).display !== 'none' : null,
      ctaVisible: cta ? getComputedStyle(cta).display !== 'none' : null,
      mobileBtnText: btnText,
    };
  });
  console.log(`width=${w}:`, JSON.stringify(info));
  await page.close();
}
await browser.close();
