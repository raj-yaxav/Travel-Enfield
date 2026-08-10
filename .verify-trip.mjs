import { chromium } from 'playwright';

const url = 'http://localhost:3000/trips/leh-ladakh-bike-trip?noPopup';
const browser = await chromium.launch();

async function check(width, height, label) {
  const page = await browser.newPage({ viewport: { width, height } });
  const errors = [];
  page.on('pageerror', e => errors.push(String(e).split('\n')[0]));
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);

  const present = {};
  for (const s of ['.trip-audit-tabs', '.trip-about', '.trip-breakdown', '.trip-costing', '.trip-package', '.trip-notes', '#faq', '.trip-booking', '.trip-mobile-cta', '.mobile-bottom-nav']) {
    present[s] = await page.locator(s).count();
  }

  const style = {};
  for (const [s, prop] of [
    ['.trip-audit-tabs', 'position'],
    ['.trip-audit-tabs a', 'borderRadius'],
    ['.trip-audit-tabs a.active', 'backgroundColor'],
    ['.trip-heading-left h2', 'textAlign'],
    ['.breakdown-day', 'backgroundColor'],
    ['.breakdown-list', 'borderRadius'],
    ['.costing-main strong', 'color'],
    ['.trip-notes', 'backgroundColor'],
    ['.trip-date-row em', 'color'],
    ['.trip-whatsapp', 'color'],
    ['.trip-mobile-cta', 'display'],
  ]) {
    style[s + ' | ' + prop] = await page.locator(s).first().evaluate((el, p) => getComputedStyle(el)[p], prop);
  }

  const tabs = await page.$$eval('.trip-audit-tabs a', els => els.map(e => e.textContent.trim()));
  const days = await page.locator('.breakdown-day').count();
  const roadmap = await page.locator('.trip-roadmap, .trip-progress-links').count();
  const faqItems = await page.locator('.faq-item').count();

  await page.locator('.count-stepper [data-count-plus]').click();
  const count = await page.locator('[data-count]').textContent();
  await page.locator('.trip-date-row').first().click();
  const travellersVal = await page.locator('.departure-modal input[name="travellers"]').inputValue().catch(() => null);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(150);
  await page.locator('[data-book-now]').first().click();
  const bookTravellers = await page.locator('.departure-modal input[name="travellers"]').inputValue().catch(() => null);
  await page.keyboard.press('Escape');

  const dlPromise = page.waitForEvent('download', { timeout: 5000 }).catch(() => null);
  await page.locator('[data-download-itinerary]').click();
  const dl = await dlPromise;

  await page.screenshot({ path: `./.shot-${label}.png`, fullPage: true });

  console.log(`\n=== ${label} ===`);
  console.log('sections:', JSON.stringify(present));
  console.log('styles:', JSON.stringify(style, null, 0));
  console.log('tabs:', JSON.stringify(tabs), '| days:', days, '| roadmap remnants:', roadmap, '| faq items:', faqItems);
  console.log('stepper:', count, '| date-row travellers:', travellersVal, '| book-now travellers:', bookTravellers, '| download:', dl ? dl.suggestedFilename() : null);
  console.log('page errors:', errors.length ? errors : 'none');
  await page.close();
}

await check(1440, 900, 'desktop');
await check(390, 844, 'mobile');
await browser.close();
console.log('\nDONE');
