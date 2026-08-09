# Responsive Audit — https://www.captureatrip.com/

Captured 2026-08-09T08:27:41.935Z (merged with retries)
Widths requested: 320, 375, 430, 768, 1024, 1280, 1440, 1920
Widths succeeded: 320, 375, 430, 768, 1024, 1280, 1440, 1920
Widths failed: none

Note: 320px, 1024px required a `waitUntil:'load'` + settle-wait fallback because `networkidle` never fired at those widths after two attempts (persistent background network activity on the page, independent of viewport). All other widths used networkidle as specified.

## 1. Observed @media Breakpoints

| Breakpoint | px | Rules Affected |
| --- | --- | --- |
| max-width: 600px | 600 | 7 |
| min-width: 640px | 640 | 28 |
| min-width: 768px | 768 | 382 |
| min-width: 1024px | 1024 | 112 |
| min-width: 1280px | 1280 | 6 |
| min-width: 1536px | 1536 | 4 |

## 2. Container Width + Horizontal Padding per Section

| Section | 320px | 375px | 430px | 768px | 1024px | 1280px | 1440px | 1920px |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| div.fixed.left-0.top-0.z-[48] | 288px (pad 0px/0px) | 338px (pad 0px/0px) | 387px (pad 0px/0px) | 384px (pad 0px/0px) | 307px (pad 0px/0px) | — | — | 576px (pad 0px/0px) |
| header.fixed.top-0.z-50.w-full | 200px (pad 0px/0px) | 200px (pad 0px/0px) | 200px (pad 0px/0px) | 200px (pad 0px/0px) | 864px (pad 0px/0px) | 1120px (pad 0px/0px) | 1280px (pad 0px/0px) | 1760px (pad 0px/0px) |
| main.mt-[1.875rem].md:mt-[9.625rem].mb-10.md: | 296px (pad 0px/0px) | 351px (pad 0px/0px) | 406px (pad 0px/0px) | 764px (pad 80px/80px) | 1020px (pad 80px/80px) | 1276px (pad 80px/80px) | 1436px (pad 80px/80px) | 1916px (pad 80px/80px) |
| footer.w-full « Domestic Trips » | 280px (pad 0px/0px) | 335px (pad 0px/0px) | 390px (pad 0px/0px) | 608px (pad 0px/0px) | 864px (pad 0px/0px) | 1120px (pad 0px/0px) | 1280px (pad 0px/0px) | 1760px (pad 0px/0px) |
| div.fixed.bottom-0.z-50.flex | 66px (pad 0px/0px) | 75px (pad 0px/0px) | 86px (pad 0px/0px) | — | — | — | — | — |
| button.flex.h-full.flex-1.flex-col | 66px (pad 0px/0px) | 66px (pad 0px/0px) | 66px (pad 0px/0px) | — | — | — | — | — |
| a.flex.flex-1.flex-col.items-center | 63px (pad 0px/0px) | 75px (pad 0px/0px) | 86px (pad 0px/0px) | — | — | — | — | — |
| div#radix-«rc».fixed.left-[50%].top-[50%].tra | 254px (pad 0px/0px) | 304px (pad 0px/0px) | 350px (pad 0px/0px) | — | — | — | — | — |
| div#radix-«r0».fixed.left-[50%].top-[50%].tra | — | — | — | 334px (pad 0px/0px) | 334px (pad 0px/0px) | — | — | 334px (pad 0px/0px) |

## 3. Card Groups (count, card width, gap, grid-template-columns)

| Card Group | 320px | 375px | 430px | 768px | 1024px | 1280px | 1440px | 1920px |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| body.__variable_7a0e31.__variable_136131 | 6× 320px gap:- cols:- | 6× 375px gap:- cols:- | 6× 430px gap:- cols:- | 5× 768px gap:- cols:- | 5× 1024px gap:- cols:- | — | — | 5× 1920px gap:- cols:- |
| div.font-[aktivGrotesk] | 5× 320px gap:- cols:- | 5× 375px gap:- cols:- | 5× 430px gap:- cols:- | 5× 768px gap:- cols:- | 5× 1024px gap:- cols:- | 5× 1280px gap:- cols:- | 5× 1440px gap:- cols:- | 5× 1920px gap:- cols:- |
| div.grid.auto-cols-max.grid-flow-col.gri | 32× 60px gap:16px cols:60px 60px 60px 60px 60px 60px 60px 60px 60px 60px 60px 60px 60px 60px 60px 60px | 32× 60px gap:16px cols:60px 60px 60px 60px 60px 60px 60px 60px 60px 60px 60px 60px 60px 60px 60px 60px | 32× 60px gap:16px cols:60px 60px 60px 60px 60px 60px 60px 60px 60px 60px 60px 60px 60px 60px 60px 60px | 32× 160px gap:24px cols:160px 160px 160px 160px 160px 160px 160px 160px 160px 160px 160px 160px 160px 160px 160px 160px | 32× 160px gap:24px cols:160px 160px 160px 160px 160px 160px 160px 160px 160px 160px 160px 160px 160px 160px 160px 160px | 32× 160px gap:24px cols:160px 160px 160px 160px 160px 160px 160px 160px 160px 160px 160px 160px 160px 160px 160px 160px | 32× 160px gap:24px cols:160px 160px 160px 160px 160px 160px 160px 160px 160px 160px 160px 160px 160px 160px 160px 160px | 32× 160px gap:24px cols:160px 160px 160px 160px 160px 160px 160px 160px 160px 160px 160px 160px 160px 160px 160px 160px |
| div.flex.flex-col.gap-7.py-7 « Upcoming  | 13× 320px gap:28px cols:- | 13× 375px gap:28px cols:- | 13× 430px gap:28px cols:- | 14× 768px gap:64px cols:- | 14× 1024px gap:64px cols:- | 14× 1280px gap:64px cols:- | 14× 1440px gap:64px cols:- | 14× 1920px gap:64px cols:- |
| div.flex.gap-4.pb-3.pr-1 | 27× 235px gap:16px cols:- | 27× 275px gap:16px cols:- | 27× 315px gap:16px cols:- | 27× 296px gap:24px cols:- | 27× 296px gap:24px cols:- | 27× 296px gap:24px cols:- | 27× 296px gap:24px cols:- | 27× 296px gap:24px cols:- |
| div.group.relative.aspect-[0.854/1].w-[7 | 3× 235px gap:- cols:- | 3× 275px gap:- cols:- | 3× 315px gap:- cols:- | 3× 296px gap:- cols:- | 3× 296px gap:- cols:- | 3× 296px gap:- cols:- | 3× 296px gap:- cols:- | 3× 296px gap:- cols:- |
| div.flex.gap-4.md:gap-6 | 9× 208px gap:16px cols:- | 9× 208px gap:16px cols:- | 9× 208px gap:16px cols:- | 9× 302px gap:24px cols:- | 9× 302px gap:24px cols:- | 9× 302px gap:24px cols:- | 9× 302px gap:24px cols:- | 9× 302px gap:24px cols:- |
| div.flex.flex-wrap.justify-center.gap-4  | 5× 336px gap:16px cols:- | 5× 336px gap:16px cols:- | 5× 336px gap:16px cols:- | 5× 384px gap:24px cols:- | 5× 384px gap:24px cols:- | 5× 384px gap:24px cols:- | 5× 384px gap:24px cols:- | 5× 480px gap:24px cols:- |
| div.embla__container.flex.md:gap-0 « Yas | 4× 320px gap:- cols:- | 4× 375px gap:- cols:- | 4× 430px gap:- cols:- | — | — | — | — | — |
| div.w-full « What is Capture a Trip? » | 4× 256px gap:- cols:- | — | — | 8× 528px gap:- cols:- | 8× 784px gap:- cols:- | 8× 1040px gap:- cols:- | 8× 1200px gap:- cols:- | 8× 1680px gap:- cols:- |
| div.flex.gap-2.md:gap-4 | 5× 280px gap:8px cols:- | 5× 280px gap:8px cols:- | 5× 280px gap:8px cols:- | 5× 411px gap:16px cols:- | 5× 411px gap:16px cols:- | 5× 411px gap:16px cols:- | 5× 411px gap:16px cols:- | 5× 411px gap:16px cols:- |
| div.flex.gap-2.md:gap-6 | 5× 280px gap:8px cols:- | 5× 280px gap:8px cols:- | 5× 280px gap:8px cols:- | 5× 411px gap:24px cols:- | 5× 411px gap:24px cols:- | 5× 411px gap:24px cols:- | 5× 411px gap:24px cols:- | 5× 411px gap:24px cols:- |
| div.fixed.bottom-0.z-50.flex | 5× 63px gap:- cols:- | 5× 75px gap:- cols:- | 5× 86px gap:- cols:- | — | — | — | — | — |
| div.flex.flex-wrap.justify-center.gap-6  | — | — | — | 5× 176px gap:40px cols:- | 5× 261px gap:40px cols:- | 5× 347px gap:40px cols:- | 5× 400px gap:40px cols:- | 5× 560px gap:40px cols:- |
| div.grid.grid-cols-1.gap-6.md:grid-cols- | — | — | — | 4× 290px gap:24px cols:290px 290px | 4× 418px gap:24px cols:418px 418px | 4× 546px gap:24px cols:546px 546px | 4× 626px gap:24px cols:626px 626px | 4× 866px gap:24px cols:866px 866px |
| div.mt-0.md:mt-16 « Domestic Trips » | — | — | — | 3× 608px gap:- cols:- | 3× 864px gap:- cols:- | 3× 1120px gap:- cols:- | 3× 1280px gap:- cols:- | 3× 1760px gap:- cols:- |
| div.grid.grid-cols-4.gap-6.font-[aktivGr | — | — | — | 4× 134px gap:24px cols:134px 134px 134px 134px | 4× 198px gap:24px cols:198px 198px 198px 198px | 4× 262px gap:24px cols:262px 262px 262px 262px | 4× 302px gap:24px cols:302px 302px 302px 302px | 4× 422px gap:24px cols:422px 422px 422px 422px |
| div.flex.flex-col.gap-2 | — | — | — | 5× 134px gap:8px cols:- | — | — | — | — |

## 4. Type Scale (size/line-height weight)

| Element | 320px | 375px | 430px | 768px | 1024px | 1280px | 1440px | 1920px |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| h1 | — | — | — | — | — | — | — | — |
| h2 | 20px/28px 500 | 20px/28px 500 | 20px/28px 500 | 30px/36px 500 | 30px/36px 500 | 30px/36px 500 | 30px/36px 500 | 30px/36px 500 |
| h3 | 14px/20px 500 | 14px/20px 500 | 14px/20px 500 | 20px/28px 500 | 20px/28px 500 | 20px/28px 500 | 20px/28px 500 | 20px/28px 500 |
| p | 14px/14px 400 | 14px/14px 400 | 14px/14px 400 | 14px/14px 400 | 14px/14px 400 | 14px/14px 400 | 14px/14px 400 | 14px/14px 400 |
| a | 16px/24px 400 | 16px/24px 400 | 16px/24px 400 | 16px/24px 400 | 16px/24px 400 | 16px/24px 400 | 16px/24px 400 | 16px/24px 400 |
| button | 14px/20px 500 | 14px/20px 500 | 14px/20px 500 | 14px/20px 500 | 16px/24px 500 | 16px/24px 500 | 16px/24px 500 | 16px/24px 500 |

## 5. DOM Swap Table (image assets whose visibility changes across widths)

This is the master breakpoint signal — rows below are images that are shown at
some captured widths and hidden at others.

| File | Alt | 320px | 375px | 430px | 768px | 1024px | 1280px | 1440px | 1920px |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| logo.svg | logo | hidden | hidden | hidden | hidden | shown | shown | shown | shown |
| Sharktankmob1.webp | shark-tank-website-mobil | shown | shown | shown | hidden | hidden | hidden | hidden | hidden |
| SharktankWeb.webp | shark-tank-website-banne | hidden | hidden | hidden | shown | shown | shown | shown | shown |
| IndianFlag.svg | Indian Flag | hidden | hidden | hidden | shown | shown | shown | shown | shown |
| image | Indian Flag | shown | shown | shown | hidden | hidden | hidden | hidden | hidden |
| whatappNew.svg | Contact WhatsApp | hidden | hidden | hidden | shown | shown | shown | shown | shown |
| whatsapp.0ec3cd32.svg | WhatsApp | shown | shown | shown | hidden | hidden | hidden | hidden | hidden |
| instagram.5041e816.svg | LinkedIn | shown | shown | shown | hidden | hidden | hidden | hidden | hidden |
| facebook.ac2c9661.svg | YouTube | shown | shown | shown | hidden | hidden | hidden | hidden | hidden |
| linkedin.1ab365b0.svg | Facebook | shown | shown | shown | hidden | hidden | hidden | hidden | hidden |
| twitter.2ea749ec.svg | Instagram | shown | shown | shown | hidden | hidden | hidden | hidden | hidden |
| youtube.16d6377d.svg | Twitter | shown | shown | shown | hidden | hidden | hidden | hidden | hidden |
| locationMark-black.47966413.svg | WhatsApp | hidden | hidden | hidden | shown | shown | shown | shown | shown |
| whatsappicon.1437f214.svg | WhatsApp | hidden | hidden | hidden | shown | shown | shown | shown | shown |
| Frame.svg | Search | shown | shown | shown | hidden | hidden | hidden | hidden | hidden |
| whatsappicon.svg | tab | shown | shown | shown | hidden | hidden | hidden | hidden | hidden |

## 6. Design Tokens (most-used across all captured viewports)

### Colors

| Value | Total Uses |
| --- | --- |
| rgb(9, 9, 11) | 4322 |
| rgb(31, 31, 31) | 2604 |
| rgba(0, 0, 0, 0) | 1150 |
| rgb(90, 90, 90) | 722 |
| rgb(255, 255, 255) | 490 |
| rgb(246, 27, 0) | 400 |
| rgba(0, 0, 0, 0.6) | 200 |
| rgb(0, 0, 0) | 149 |
| rgb(0, 131, 66) | 110 |
| rgb(0, 101, 217) | 88 |
| rgb(75, 85, 99) | 80 |
| rgb(234, 234, 234) | 42 |

### Border Radii

| Value | Total Uses |
| --- | --- |
| 16px | 512 |
| 9999px | 455 |
| 100px | 256 |
| 16px 16px 0px 0px | 200 |
| 24px | 54 |
| 8px | 16 |

### Shadows

| Value | Total Uses |
| --- | --- |
| rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.1) 0px 4px 6px -1px, rgba(0, 0, 0, 0.1) 0px 2px 4px -2px | 248 |
| rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px | 186 |
| rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.1) 0px 4px 6px -4px | 6 |
| rgb(255, 255, 255) 0px 0px 0px 0px, rgb(9, 9, 11) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px | 6 |
| rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.1) 0px 1px 3px 0px, rgba(0, 0, 0, 0.1) 0px 1px 2px -1px | 6 |

### Spacing Values

| Value | Total Uses |
| --- | --- |
| 8px | 633 |
| 4px | 548 |
| 16px | 302 |
| 12px | 282 |
| 24px | 97 |
| 64px | 25 |
| 28px | 20 |
| 32px | 17 |
| 40px | 10 |
| 2px | 8 |
| 56px | 8 |
| 20px | 8 |
