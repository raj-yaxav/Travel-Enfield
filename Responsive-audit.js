/* ============================================================================
   RESPONSIVE REVERSE-ENGINEERING AUDIT
   ----------------------------------------------------------------------------
   HOW TO USE
   1. Open https://www.captureatrip.com/ in Chrome.
   2. DevTools > Console. Paste this entire file. Press Enter.
   3. Run once:            breakpoints()
   4. Then, at EACH width you care about, run:   capture()
        - Use DevTools device toolbar (Cmd/Ctrl+Shift+M) to set exact widths.
        - Widths to hit: 320 360 375 390 414 430 480 768 834 1024 1280 1440 1536 1920
        - IMPORTANT: set "Responsive" mode and type the width; don't drag.
        - Reload the page after each width change (this site swaps DOM subtrees).
   5. When done:           report()      // prints comparison tables
                           exportJSON()  // copies full dataset to clipboard
   ============================================================================ */

window.__audit = window.__audit || {};

/* --------------------------------------------------------------------------
   1. REAL BREAKPOINT EXTRACTION  (reads @media rules from the actual CSSOM)
   Answers prompt section 8 with observed values, not assumed framework values.
   -------------------------------------------------------------------------- */
function breakpoints() {
  const hits = new Map(); // "min-width:768px" -> count of rules using it

  const walk = (rules) => {
    for (const r of rules) {
      if (r.type === CSSRule.MEDIA_RULE) {
        const text = r.conditionText || r.media.mediaText;
        const n = r.cssRules ? r.cssRules.length : 0;
        hits.set(text, (hits.get(text) || 0) + n);
        if (r.cssRules) walk(r.cssRules);
      } else if (r.type === CSSRule.SUPPORTS_RULE && r.cssRules) {
        walk(r.cssRules);
      }
    }
  };

  let blocked = 0;
  for (const sheet of document.styleSheets) {
    try { walk(sheet.cssRules); }
    catch (e) { blocked++; } // cross-origin sheet
  }

  // Pull numeric widths out so we can sort them
  const widths = new Map();
  for (const [cond, count] of hits) {
    const re = /\(\s*(min|max)-width\s*:\s*([\d.]+)(px|em|rem)\s*\)/g;
    let m;
    while ((m = re.exec(cond))) {
      const px = m[3] === 'px' ? parseFloat(m[2]) : parseFloat(m[2]) * 16;
      const key = `${m[1]}-width: ${px}px`;
      widths.set(key, (widths.get(key) || 0) + count);
    }
  }

  const sorted = [...widths.entries()]
    .map(([k, v]) => ({
      breakpoint: k,
      px: parseFloat(k.match(/([\d.]+)px/)[1]),
      rulesAffected: v
    }))
    .sort((a, b) => a.px - b.px);

  console.log('%c OBSERVED BREAKPOINTS (from live CSSOM) ', 'background:#111;color:#0f0');
  console.table(sorted);
  if (blocked) console.warn(`${blocked} stylesheet(s) unreadable (cross-origin). Numbers may be incomplete.`);

  console.log('%c FULL MEDIA CONDITIONS ', 'background:#111;color:#0ff');
  console.table([...hits.entries()]
    .map(([condition, rulesAffected]) => ({ condition, rulesAffected }))
    .sort((a, b) => b.rulesAffected - a.rulesAffected));

  window.__audit.breakpoints = sorted;
  return sorted;
}

/* --------------------------------------------------------------------------
   2. SECTION MAP  — identifies top-level sections and whether each is
   currently visible. Run at two widths to find the mobile/desktop DOM swap.
   -------------------------------------------------------------------------- */
const SECTION_HINTS = [
  'announcement', 'header', 'nav', 'hero', 'banner', 'destination',
  'trip', 'confidence', 'bestie', 'trending', 'review', 'testimon',
  'faq', 'blog', 'video', 'youtube', 'footer', 'bottom'
];

function labelOf(el) {
  const id = el.id ? `#${el.id}` : '';
  const cls = (typeof el.className === 'string' ? el.className : '')
    .split(/\s+/).filter(Boolean).slice(0, 4).join('.');
  const heading = el.querySelector('h1,h2,h3');
  const text = heading ? heading.textContent.trim().slice(0, 40) : '';
  return `${el.tagName.toLowerCase()}${id}${cls ? '.' + cls : ''}${text ? ' « ' + text + ' »' : ''}`;
}

function sections() {
  const roots = [...document.body.children]
    .flatMap(el => el.tagName === 'DIV' && el.children.length > 3 ? [el, ...el.children] : [el]);

  return roots.filter(el => {
    const s = getComputedStyle(el);
    return el.offsetHeight > 40 || s.position === 'fixed' || s.position === 'sticky';
  });
}

/* --------------------------------------------------------------------------
   3. CAPTURE — the main measurement pass
   -------------------------------------------------------------------------- */
function box(el) {
  const s = getComputedStyle(el);
  const r = el.getBoundingClientRect();
  return {
    width: Math.round(r.width),
    height: Math.round(r.height),
    display: s.display,
    position: s.position,
    maxWidth: s.maxWidth,
    minHeight: s.minHeight,
    padT: s.paddingTop, padR: s.paddingRight,
    padB: s.paddingBottom, padL: s.paddingLeft,
    marT: s.marginTop, marB: s.marginBottom,
    marginInline: s.marginLeft === s.marginRight ? s.marginLeft : `${s.marginLeft}/${s.marginRight}`,
    gridCols: s.gridTemplateColumns === 'none' ? '' : s.gridTemplateColumns,
    flexDir: s.display.includes('flex') ? s.flexDirection : '',
    flexWrap: s.display.includes('flex') ? s.flexWrap : '',
    gap: s.gap === 'normal' ? '' : s.gap,
    justify: s.justifyContent,
    align: s.alignItems,
    bg: s.backgroundColor,
    radius: s.borderRadius,
    shadow: s.boxShadow === 'none' ? '' : s.boxShadow,
    overflowX: s.overflowX
  };
}

function type(el) {
  const s = getComputedStyle(el);
  const r = el.getBoundingClientRect();
  const lh = parseFloat(s.lineHeight);
  return {
    text: el.textContent.trim().slice(0, 45),
    family: s.fontFamily.split(',')[0].replace(/["']/g, ''),
    size: s.fontSize,
    weight: s.fontWeight,
    lineHeight: s.lineHeight,
    letterSpacing: s.letterSpacing,
    transform: s.textTransform,
    color: s.color,
    align: s.textAlign,
    boxWidth: Math.round(r.width),
    lines: lh ? Math.round(r.height / lh) : '?'
  };
}

function capture() {
  const w = window.innerWidth;
  const dpr = window.devicePixelRatio;

  // --- sections
  const secs = sections().map(el => ({ label: labelOf(el), ...box(el) }));

  // --- containers: the widest non-full-bleed block inside each section
  const containers = sections().map(el => {
    const inner = [...el.querySelectorAll('div')]
      .filter(d => d.offsetWidth > 0 && d.offsetWidth < w)
      .sort((a, b) => b.offsetWidth - a.offsetWidth)[0];
    if (!inner) return null;
    const s = getComputedStyle(inner);
    return {
      section: labelOf(el).slice(0, 45),
      contentWidth: inner.offsetWidth,
      maxWidth: s.maxWidth,
      padL: s.paddingLeft,
      padR: s.paddingRight,
      gutter: Math.round((w - inner.offsetWidth) / 2),
      centered: s.marginLeft === s.marginRight && s.marginLeft !== '0px'
    };
  }).filter(Boolean);

  // --- typography census
  const typo = {};
  for (const sel of ['h1', 'h2', 'h3', 'h4', 'p', 'a', 'button', 'span', 'li', 'small']) {
    const el = [...document.querySelectorAll(sel)]
      .find(e => e.offsetHeight > 0 && e.textContent.trim().length > 2);
    if (el) typo[sel] = type(el);
  }

  // --- cards: repeated siblings inside a scroller or grid
  const cardGroups = [];
  document.querySelectorAll('*').forEach(el => {
    if (el.children.length < 3) return;
    const kids = [...el.children].filter(k => k.offsetHeight > 60);
    if (kids.length < 3) return;
    const widths = new Set(kids.map(k => Math.round(k.offsetWidth)));
    if (widths.size > 2) return; // not a uniform card row
    const s = getComputedStyle(el);
    const k0 = kids[0], ks = getComputedStyle(k0);
    cardGroups.push({
      container: labelOf(el).slice(0, 40),
      count: kids.length,
      layout: s.display,
      gridCols: s.gridTemplateColumns === 'none' ? '' : s.gridTemplateColumns,
      gap: s.gap === 'normal' ? '' : s.gap,
      scroll: s.overflowX,
      cardW: Math.round(k0.offsetWidth),
      cardH: Math.round(k0.offsetHeight),
      cardPad: ks.padding,
      cardRadius: ks.borderRadius,
      cardBorder: ks.border,
      cardShadow: ks.boxShadow === 'none' ? '' : ks.boxShadow.slice(0, 40)
    });
  });

  // --- images
  const imgs = [...document.images].filter(i => i.offsetWidth > 30).map(i => {
    const s = getComputedStyle(i);
    return {
      alt: (i.alt || '').slice(0, 28),
      renderW: i.offsetWidth,
      renderH: i.offsetHeight,
      intrinsic: `${i.naturalWidth}x${i.naturalHeight}`,
      ratio: (i.offsetWidth / i.offsetHeight).toFixed(2),
      objectFit: s.objectFit,
      objectPos: s.objectPosition,
      radius: s.borderRadius,
      sizesAttr: i.getAttribute('sizes') || '',
      chosenW: (i.currentSrc.match(/[?&]w=(\d+)/) || [])[1] || ''
    };
  });

  // --- hidden-vs-shown: the mobile/desktop DOM swap detector
  const swap = [...document.querySelectorAll('img')].map(i => ({
    file: (i.getAttribute('src') || '').split('/').pop().split('?')[0].slice(0, 40),
    alt: (i.alt || '').slice(0, 24),
    visible: i.offsetParent !== null && i.offsetWidth > 0
  }));

  // --- design token census
  const tokens = { colors: {}, radii: {}, shadows: {}, fonts: {}, spacing: {} };
  document.querySelectorAll('*').forEach(el => {
    if (!el.offsetHeight) return;
    const s = getComputedStyle(el);
    const bump = (bag, k) => { if (k && k !== 'none' && k !== '0px') bag[k] = (bag[k] || 0) + 1; };
    bump(tokens.colors, s.color);
    bump(tokens.colors, s.backgroundColor === 'rgba(0, 0, 0, 0)' ? null : s.backgroundColor);
    bump(tokens.radii, s.borderRadius);
    bump(tokens.shadows, s.boxShadow);
    bump(tokens.fonts, s.fontFamily.split(',')[0].replace(/["']/g, ''));
    bump(tokens.spacing, s.paddingTop);
    bump(tokens.spacing, s.gap === 'normal' ? null : s.gap);
  });
  const top = (bag, n = 12) => Object.entries(bag).sort((a, b) => b[1] - a[1]).slice(0, n)
    .map(([value, uses]) => ({ value, uses }));

  const snap = {
    viewport: w,
    dpr,
    scrollbar: window.innerWidth - document.documentElement.clientWidth,
    docHeight: document.documentElement.scrollHeight,
    sections: secs,
    containers,
    typography: typo,
    cards: cardGroups,
    images: imgs,
    domSwap: swap,
    tokens: {
      colors: top(tokens.colors),
      radii: top(tokens.radii, 8),
      shadows: top(tokens.shadows, 6),
      fonts: top(tokens.fonts, 6),
      spacing: top(tokens.spacing, 16)
    }
  };

  window.__audit[w] = snap;

  console.log(`%c CAPTURED @ ${w}px (dpr ${dpr}, scrollbar ${snap.scrollbar}px) `,
    'background:#004;color:#fff');
  console.table(containers);
  console.table(cardGroups);
  console.table(Object.entries(typo).map(([k, v]) => ({ el: k, ...v })));
  console.log('Widths captured so far:', Object.keys(window.__audit).filter(k => !isNaN(k)));
  return snap;
}

/* --------------------------------------------------------------------------
   4. REPORT — cross-viewport comparison (fills prompt section 13's table)
   -------------------------------------------------------------------------- */
function report() {
  const widths = Object.keys(window.__audit).filter(k => !isNaN(k)).map(Number).sort((a, b) => a - b);
  if (widths.length < 2) return console.warn('Capture at 2+ widths first.');

  // container width across viewports
  console.log('%c CONTAINER SYSTEM ', 'background:#111;color:#ff0');
  const names = [...new Set(widths.flatMap(w => window.__audit[w].containers.map(c => c.section)))];
  console.table(names.map(n => {
    const row = { section: n };
    widths.forEach(w => {
      const c = window.__audit[w].containers.find(x => x.section === n);
      row[`${w}px`] = c ? `${c.contentWidth} (pad ${c.padL})` : '—';
    });
    return row;
  }));

  // card layout across viewports
  console.log('%c CARD LAYOUT ', 'background:#111;color:#ff0');
  const cnames = [...new Set(widths.flatMap(w => window.__audit[w].cards.map(c => c.container)))];
  console.table(cnames.map(n => {
    const row = { group: n };
    widths.forEach(w => {
      const c = window.__audit[w].cards.find(x => x.container === n);
      row[`${w}px`] = c ? `${c.count}× ${c.cardW}px gap:${c.gap || '-'}` : '—';
    });
    return row;
  }));

  // typography across viewports
  console.log('%c TYPOGRAPHY SCALE ', 'background:#111;color:#ff0');
  console.table(['h1', 'h2', 'h3', 'p', 'a', 'button'].map(sel => {
    const row = { el: sel };
    widths.forEach(w => {
      const t = window.__audit[w].typography[sel];
      row[`${w}px`] = t ? `${t.size}/${t.lineHeight} ${t.weight}` : '—';
    });
    return row;
  }));

  // DOM swap: which assets appear/disappear
  console.log('%c MOBILE vs DESKTOP DOM SWAP ', 'background:#500;color:#fff');
  const files = [...new Set(widths.flatMap(w => window.__audit[w].domSwap.map(s => s.file)))];
  console.table(files.map(f => {
    const row = { file: f };
    widths.forEach(w => {
      const s = window.__audit[w].domSwap.find(x => x.file === f);
      row[`${w}px`] = s ? (s.visible ? 'shown' : 'hidden') : '—';
    });
    return row;
  }).filter(r => new Set(Object.values(r).slice(1)).size > 1)); // only rows that CHANGE
}

function exportJSON() {
  const out = JSON.stringify(window.__audit, null, 2);
  copy(out); // DevTools helper
  console.log(`Copied ${(out.length / 1024).toFixed(0)}KB to clipboard.`);
  return out;
}

console.log('%c Loaded. Run: breakpoints()  then  capture()  at each width,  then  report() ',
  'background:#0a0;color:#000;font-size:14px');