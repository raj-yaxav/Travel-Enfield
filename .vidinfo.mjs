import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto('http://localhost:3000/?noPopup', { waitUntil: 'domcontentloaded' }).catch(() => {});
const dims = await page.evaluate(() => new Promise(resolve => {
  const v = document.querySelector('.hero-intro-video video');
  if (!v) return resolve(null);
  if (v.videoWidth) return resolve({ w: v.videoWidth, h: v.videoHeight, duration: v.duration });
  v.addEventListener('loadedmetadata', () => resolve({ w: v.videoWidth, h: v.videoHeight, duration: v.duration }), { once: true });
  setTimeout(() => resolve({ w: v.videoWidth, h: v.videoHeight, duration: v.duration }), 6000);
}));
console.log('video dimensions:', JSON.stringify(dims));
await browser.close();
