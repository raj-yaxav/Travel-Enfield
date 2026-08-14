import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('http://localhost:3000/', { waitUntil: 'networkidle', timeout: 60000 });
await page.locator('.journal-grid').scrollIntoViewIfNeeded();
await page.waitForTimeout(500);

const box = await page.locator('.journal-grid').boundingBox();
const startX = box.x + box.width / 2;
const startY = box.y + box.height / 2;

// Drag left-to-right past the start boundary (scrollLeft is already 0) to trigger overshoot
await page.mouse.move(startX, startY);
await page.mouse.down();
await page.mouse.move(startX + 150, startY, { steps: 10 });
const midTransform = await page.evaluate(() => document.querySelector('.journal-grid').style.transform);
console.log('mid-drag transform (should show translateX overshoot):', midTransform);
const cursor = await page.evaluate(() => document.querySelector('.journal-grid').style.cursor);
console.log('cursor during drag:', cursor);
await page.mouse.up();
await page.waitForTimeout(500);
const afterTransform = await page.evaluate(() => document.querySelector('.journal-grid').style.transform);
console.log('transform after release+settle (should be empty):', JSON.stringify(afterTransform));

// Verify normal drag-to-scroll works mid-track (not at boundary)
await page.evaluate(() => { document.querySelector('.journal-grid').scrollLeft = 400; });
await page.waitForTimeout(200);
const before = await page.evaluate(() => document.querySelector('.journal-grid').scrollLeft);
await page.mouse.move(startX, startY);
await page.mouse.down();
await page.mouse.move(startX - 100, startY, { steps: 10 });
await page.mouse.up();
const after = await page.evaluate(() => document.querySelector('.journal-grid').scrollLeft);
console.log('scrollLeft before drag:', before, 'after drag-right-to-left:', after, 'moved:', after > before);

await page.close();
await browser.close();
