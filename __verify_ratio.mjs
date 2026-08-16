import { chromium } from 'playwright';
const browser = await chromium.launch();

for (const vp of [{ width: 390, height: 844, label: 'mobile' }, { width: 1440, height: 900, label: 'desktop' }]) {
  const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
  await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(1500);
  const info = await page.evaluate(() => {
    const section = document.querySelector('.hero-intro-video');
    const rect = section.getBoundingClientRect();
    return { width: rect.width, height: rect.height, ratio: (rect.width / rect.height).toFixed(4) };
  });
  console.log(vp.label, JSON.stringify(info), 'expected ratio:', (21/9).toFixed(4));
  await page.close();
}
await browser.close();
