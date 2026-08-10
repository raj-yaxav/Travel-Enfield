import { chromium } from 'playwright';

const browser = await chromium.launch();

async function audit(width, height, label) {
  const page = await browser.newPage({ viewport: { width, height } });
  await page.goto('http://localhost:3000/trips/leh-ladakh-bike-trip?noPopup', { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  const r = await page.evaluate(() => {
    const out = {};
    const q = sel => document.querySelector(sel);
    const css = (el, prop) => el ? getComputedStyle(el)[prop] : null;
    out.horizontalOverflow = document.documentElement.scrollWidth - window.innerWidth;
    out.headerH = document.querySelector('#header')?.getBoundingClientRect().height;
    out.tabsTop = css(q('.trip-audit-tabs'), 'top');
    out.tabsRect = (() => { const b = document.querySelector('.trip-audit-tabs').getBoundingClientRect(); return { y: Math.round(b.y), h: Math.round(b.height) }; })();
    const box = el => { if (!el) return null; const b = el.getBoundingClientRect(); return { y: Math.round(b.y), h: Math.round(b.height), w: Math.round(b.width), display: getComputedStyle(el).display }; };
    out.sections = {
      hero: box(q('.trip-detail-hero')),
      about: box(q('.trip-about')),
      breakdown: box(q('.trip-breakdown')),
      costing: box(q('.trip-costing')),
      package: box(q('.trip-package')),
      notes: box(q('.trip-notes')),
      faq: box(q('#faq')),
      booking: box(q('.trip-booking')),
    };
    out.breakdownDay = box(q('.breakdown-day'));
    out.costingGridCols = getComputedStyle(q('.costing-grid')).gridTemplateColumns;
    out.notesLiColor = css(q('.trip-notes li'), 'color');
    out.notesLiBg = css(q('.trip-notes li'), 'backgroundColor');
    out.heroH1 = box(q('.trip-detail-hero h1'));
    out.mobileCta = box(q('.trip-mobile-cta'));
    out.mobileCtaFixed = css(q('.trip-mobile-cta'), 'position');
    out.footerPadBottom = css(q('.app-footer, .footer'), 'paddingBottom');
    out.bodyPadBottom = css(document.body, 'paddingBottom');
    out.bottomNavDisplay = css(q('.mobile-bottom-nav'), 'display');
    out.enquiryOrbitDisplay = css(q('.enquiry-orbit'), 'display');
    out.bookingCard = box(q('.trip-enquiry-sticky'));
    out.stickyBooking = css(q('.trip-enquiry-sticky'), 'position');
    return out;
  });
  console.log(`\n=== ${label} ===`);
  console.log(JSON.stringify(r, null, 1));
  await page.close();
}

await audit(1440, 900, 'DESKTOP');
await audit(390, 844, 'MOBILE');

// horizontal overflow scan across the 6 trips
for (const slug of ['spiti-valley-road-trip', 'bali-adventure-tour', 'thailand-beach-getaway', 'manali-snow-adventure', 'meghalaya-explorer']) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto(`http://localhost:3000/trips/${slug}?noPopup`, { waitUntil: 'networkidle' }).catch(() => {});
  await page.waitForTimeout(400);
  const ov = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  const hasTabs = await page.locator('.trip-audit-tabs a').count();
  console.log(`${slug}: tabs=${hasTabs} hOverflow=${ov}px`);
  await page.close();
}

await browser.close();
console.log('\nDONE');
