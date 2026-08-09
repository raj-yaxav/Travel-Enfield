/* ============================================================================
   RESPONSIVE REVERSE-ENGINEERING AUDIT  —  v2 (FULL CAPTURE)
   ----------------------------------------------------------------------------
   v2 captures EVERY element, not just the first sample:
     - every image: natural size, rendered size, ratio, object-fit, srcset,
       wrapper box, background-images too
     - every card: outer box + inner parts (image ratio, title, price, button)
     - every heading h1..h6 individually with full type metrics
     - full font stacks + @font-face census
     - complete box model everywhere: padding, margin, border, radius, shadow
     - sibling gap measurement (real visual spacing, not just CSS gap)

   USAGE (same as v1)
     breakpoints()   -> once
     capture()       -> at each width (fresh page load each time)
     report()        -> comparison tables
     exportJSON()    -> full dataset
   ============================================================================ */

window.__audit = window.__audit || {};

/* ==========================================================================
   HELPERS
   ========================================================================== */

const px = v => (v === '0px' || v === 'normal' || v === 'none' ? '' : v);

function shortSel(el) {
  if (!el) return '';
  const id = el.id ? `#${el.id}` : '';
  const cls = (typeof el.className === 'string' ? el.className : '')
    .split(/\s+/).filter(Boolean).slice(0, 5).join('.');
  return `${el.tagName.toLowerCase()}${id}${cls ? '.' + cls : ''}`;
}

function pathOf(el, depth = 4) {
  const parts = [];
  let cur = el;
  while (cur && cur !== document.body && parts.length < depth) {
    parts.unshift(shortSel(cur));
    cur = cur.parentElement;
  }
  return parts.join(' > ');
}

function nearestHeading(el) {
  let cur = el;
  for (let i = 0; i < 6 && cur; i++) {
    const h = cur.querySelector && cur.querySelector('h1,h2,h3,h4');
    if (h && h.textContent.trim()) return h.textContent.trim().slice(0, 45);
    cur = cur.parentElement;
  }
  return '';
}

/* FULL BOX MODEL — used everywhere */
function fullBox(el) {
  const s = getComputedStyle(el);
  const r = el.getBoundingClientRect();
  return {
    // dimensions
    w: +r.width.toFixed(1),
    h: +r.height.toFixed(1),
    contentW: el.clientWidth,
    contentH: el.clientHeight,
    scrollW: el.scrollWidth,
    scrollH: el.scrollHeight,
    // constraints
    cssWidth: s.width,
    cssHeight: s.height,
    maxWidth: px(s.maxWidth),
    minWidth: px(s.minWidth),
    maxHeight: px(s.maxHeight),
    minHeight: px(s.minHeight),
    aspectRatio: px(s.aspectRatio),
    // padding
    padding: `${s.paddingTop} ${s.paddingRight} ${s.paddingBottom} ${s.paddingLeft}`,
    padT: s.paddingTop, padR: s.paddingRight, padB: s.paddingBottom, padL: s.paddingLeft,
    // margin
    margin: `${s.marginTop} ${s.marginRight} ${s.marginBottom} ${s.marginLeft}`,
    marT: s.marginTop, marR: s.marginRight, marB: s.marginBottom, marL: s.marginLeft,
    // border
    border: px(s.borderWidth) ? `${s.borderWidth} ${s.borderStyle} ${s.borderColor}` : '',
    borderRadius: px(s.borderRadius),
    // layout
    display: s.display,
    position: s.position,
    top: px(s.top), left: px(s.left), right: px(s.right), bottom: px(s.bottom),
    zIndex: px(s.zIndex),
    boxSizing: s.boxSizing,
    // flex / grid
    gridCols: px(s.gridTemplateColumns),
    gridRows: px(s.gridTemplateRows),
    gap: px(s.gap),
    rowGap: px(s.rowGap),
    colGap: px(s.columnGap),
    flexDir: s.display.includes('flex') ? s.flexDirection : '',
    flexWrap: s.display.includes('flex') ? s.flexWrap : '',
    flexGrow: s.flexGrow !== '0' ? s.flexGrow : '',
    flexBasis: px(s.flexBasis),
    justify: s.justifyContent,
    alignItems: s.alignItems,
    order: s.order !== '0' ? s.order : '',
    // paint
    bg: s.backgroundColor === 'rgba(0, 0, 0, 0)' ? '' : s.backgroundColor,
    bgImage: s.backgroundImage === 'none' ? '' : s.backgroundImage.slice(0, 90),
    bgSize: s.backgroundImage === 'none' ? '' : s.backgroundSize,
    bgPos: s.backgroundImage === 'none' ? '' : s.backgroundPosition,
    shadow: px(s.boxShadow),
    opacity: s.opacity !== '1' ? s.opacity : '',
    overflowX: s.overflowX,
    overflowY: s.overflowY,
    transform: s.transform === 'none' ? '' : s.transform
  };
}

/* FULL TYPE METRICS */
function fullType(el) {
  const s = getComputedStyle(el);
  const r = el.getBoundingClientRect();
  const lh = parseFloat(s.lineHeight) || parseFloat(s.fontSize) * 1.2;
  const txt = el.textContent.trim();
  return {
    tag: el.tagName.toLowerCase(),
    text: txt.slice(0, 60),
    charCount: txt.length,
    fontFamily: s.fontFamily,
    fontFamilyFirst: s.fontFamily.split(',')[0].replace(/["']/g, '').trim(),
    fontSize: s.fontSize,
    fontSizePx: parseFloat(s.fontSize),
    fontWeight: s.fontWeight,
    fontStyle: s.fontStyle !== 'normal' ? s.fontStyle : '',
    lineHeight: s.lineHeight,
    lineHeightRatio: (lh / parseFloat(s.fontSize)).toFixed(2),
    letterSpacing: px(s.letterSpacing),
    wordSpacing: px(s.wordSpacing),
    textTransform: s.textTransform !== 'none' ? s.textTransform : '',
    textDecoration: s.textDecorationLine !== 'none' ? s.textDecorationLine : '',
    color: s.color,
    textAlign: s.textAlign,
    whiteSpace: s.whiteSpace !== 'normal' ? s.whiteSpace : '',
    textOverflow: s.textOverflow !== 'clip' ? s.textOverflow : '',
    lineClamp: px(s.webkitLineClamp),
    // wrapping analysis
    boxWidth: +r.width.toFixed(1),
    boxHeight: +r.height.toFixed(1),
    renderedLines: Math.max(1, Math.round(r.height / lh)),
    maxTextWidth: px(s.maxWidth),
    // spacing
    marT: s.marginTop, marB: s.marginBottom,
    padT: s.paddingTop, padB: s.paddingBottom,
    path: pathOf(el, 3)
  };
}

/* Visual gap between two adjacent siblings (real, not CSS-declared) */
function visualGap(a, b) {
  const ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
  const horizontal = Math.abs(ra.top - rb.top) < 20;
  return horizontal
    ? { dir: 'x', gap: +(rb.left - ra.right).toFixed(1) }
    : { dir: 'y', gap: +(rb.top - ra.bottom).toFixed(1) };
}

/* ==========================================================================
   1. BREAKPOINTS (unchanged from v1, plus @font-face census)
   ========================================================================== */
function breakpoints() {
  const hits = new Map();
  const faces = [];

  const walk = (rules) => {
    for (const r of rules) {
      if (r.type === CSSRule.MEDIA_RULE) {
        const text = r.conditionText || r.media.mediaText;
        hits.set(text, (hits.get(text) || 0) + (r.cssRules ? r.cssRules.length : 0));
        if (r.cssRules) walk(r.cssRules);
      } else if (r.type === CSSRule.FONT_FACE_RULE) {
        faces.push({
          family: r.style.getPropertyValue('font-family'),
          weight: r.style.getPropertyValue('font-weight'),
          style: r.style.getPropertyValue('font-style'),
          display: r.style.getPropertyValue('font-display'),
          src: (r.style.getPropertyValue('src') || '').slice(0, 80),
          unicodeRange: (r.style.getPropertyValue('unicode-range') || '').slice(0, 40)
        });
      } else if (r.type === CSSRule.SUPPORTS_RULE && r.cssRules) {
        walk(r.cssRules);
      }
    }
  };

  let blocked = 0;
  for (const sheet of document.styleSheets) {
    try { walk(sheet.cssRules); } catch (e) { blocked++; }
  }

  const widths = new Map();
  for (const [cond, count] of hits) {
    const re = /\(\s*(min|max)-width\s*:\s*([\d.]+)(px|em|rem)\s*\)/g;
    let m;
    while ((m = re.exec(cond))) {
      const v = m[3] === 'px' ? parseFloat(m[2]) : parseFloat(m[2]) * 16;
      const key = `${m[1]}-width: ${v}px`;
      widths.set(key, (widths.get(key) || 0) + count);
    }
  }

  const sorted = [...widths.entries()]
    .map(([k, v]) => ({ breakpoint: k, px: parseFloat(k.match(/([\d.]+)px/)[1]), rulesAffected: v }))
    .sort((a, b) => a.px - b.px);

  console.log('%c OBSERVED BREAKPOINTS ', 'background:#111;color:#0f0');
  console.table(sorted);
  console.log('%c @font-face DECLARATIONS ', 'background:#111;color:#0ff');
  console.table(faces);
  if (blocked) console.warn(`${blocked} cross-origin stylesheet(s) unreadable.`);

  window.__audit.breakpoints = sorted;
  window.__audit.fontFaces = faces;
  window.__audit.mediaConditions = [...hits.entries()]
    .map(([condition, rules]) => ({ condition, rules }))
    .sort((a, b) => b.rules - a.rules);
  return sorted;
}

/* ==========================================================================
   2. SECTIONS
   ========================================================================== */
function sectionEls() {
  const out = [];
  const seen = new Set();
  const consider = el => {
    if (seen.has(el)) return;
    const s = getComputedStyle(el);
    if (el.offsetHeight > 60 || s.position === 'fixed' || s.position === 'sticky') {
      seen.add(el); out.push(el);
    }
  };
  [...document.body.children].forEach(el => {
    consider(el);
    if (el.children.length > 2 && el.offsetHeight > 400) {
      [...el.children].forEach(consider);
    }
  });
  return out;
}

/* ==========================================================================
   3. CAPTURE
   ========================================================================== */
function capture() {
  const vw = window.innerWidth;
  const dpr = window.devicePixelRatio;
  const t0 = performance.now();

  /* ---- SECTIONS: full box model each ---- */
  const sections = sectionEls().map((el, i) => ({
    index: i,
    selector: shortSel(el),
    heading: nearestHeading(el),
    fullBleed: Math.round(el.getBoundingClientRect().width) >= vw - 2,
    ...fullBox(el)
  }));

  /* ---- CONTAINERS: widest inner block per section ---- */
  const containers = sectionEls().map(el => {
    const inner = [...el.querySelectorAll(':scope > div, :scope > div > div')]
      .filter(d => d.offsetWidth > 0 && d.offsetWidth <= vw)
      .sort((a, b) => b.offsetWidth - a.offsetWidth)[0];
    if (!inner) return null;
    const s = getComputedStyle(inner);
    return {
      section: shortSel(el).slice(0, 40),
      heading: nearestHeading(el),
      selector: shortSel(inner),
      contentWidth: inner.offsetWidth,
      innerWidth: inner.clientWidth - parseFloat(s.paddingLeft) - parseFloat(s.paddingRight),
      maxWidth: px(s.maxWidth),
      padL: s.paddingLeft,
      padR: s.paddingRight,
      marginInline: s.marginLeft === s.marginRight ? s.marginLeft : `${s.marginLeft}/${s.marginRight}`,
      gutter: +((vw - inner.offsetWidth) / 2).toFixed(1),
      centered: s.marginLeft === s.marginRight && s.marginLeft !== '0px'
    };
  }).filter(Boolean);

  /* ---- EVERY HEADING h1..h6 ---- */
  const headings = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')]
    .filter(el => el.offsetHeight > 0)
    .map(fullType);

  /* ---- BODY / PARAGRAPH / SMALL TEXT ---- */
  const bodyText = [...document.querySelectorAll('p,span,li,small,label,figcaption')]
    .filter(el => el.offsetHeight > 0 && el.textContent.trim().length > 8
      && !el.querySelector('p,span,li'))          // leaf nodes only
    .slice(0, 120)
    .map(fullType);

  /* ---- BUTTONS + CTAs ---- */
  const buttons = [...document.querySelectorAll('button, a[class*="btn"], a[class*="Btn"], [role="button"], input[type="submit"]')]
    .filter(el => el.offsetHeight > 0)
    .map(el => {
      const s = getComputedStyle(el);
      const icon = el.querySelector('img,svg');
      return {
        text: el.textContent.trim().slice(0, 30),
        ...fullBox(el),
        fontFamily: s.fontFamily.split(',')[0].replace(/["']/g, ''),
        fontSize: s.fontSize,
        fontWeight: s.fontWeight,
        color: s.color,
        cursor: s.cursor,
        fullWidth: Math.round(el.offsetWidth) >= Math.round(el.parentElement.clientWidth) - 4,
        iconW: icon ? icon.getBoundingClientRect().width.toFixed(1) : '',
        iconH: icon ? icon.getBoundingClientRect().height.toFixed(1) : '',
        path: pathOf(el, 3)
      };
    });

  /* ---- EVERY <img> : full geometry ---- */
  const images = [...document.images].map(i => {
    const s = getComputedStyle(i);
    const r = i.getBoundingClientRect();
    const parent = i.parentElement;
    const pr = parent ? parent.getBoundingClientRect() : null;
    return {
      alt: (i.alt || '').slice(0, 35),
      file: (i.currentSrc || i.src || '').split('/').pop().split('?')[0].slice(0, 45),
      visible: i.offsetParent !== null && r.width > 0,
      // rendered
      renderW: +r.width.toFixed(1),
      renderH: +r.height.toFixed(1),
      renderRatio: r.height ? +(r.width / r.height).toFixed(3) : '',
      // intrinsic
      naturalW: i.naturalWidth,
      naturalH: i.naturalHeight,
      naturalRatio: i.naturalHeight ? +(i.naturalWidth / i.naturalHeight).toFixed(3) : '',
      // declared
      attrW: i.getAttribute('width') || '',
      attrH: i.getAttribute('height') || '',
      cssWidth: s.width,
      cssHeight: s.height,
      maxWidth: px(s.maxWidth),
      aspectRatioCSS: px(s.aspectRatio),
      // fit
      objectFit: s.objectFit,
      objectPosition: s.objectPosition,
      borderRadius: px(s.borderRadius),
      // responsive plumbing
      sizesAttr: i.getAttribute('sizes') || '',
      loading: i.getAttribute('loading') || '',
      fetchpriority: i.getAttribute('fetchpriority') || '',
      chosenW: (( i.currentSrc || '').match(/[?&]w=(\d+)/) || [])[1] || '',
      srcsetCount: (i.getAttribute('srcset') || '').split(',').filter(Boolean).length,
      // context
      parentSel: shortSel(parent),
      parentW: pr ? +pr.width.toFixed(1) : '',
      parentH: pr ? +pr.height.toFixed(1) : '',
      parentOverflow: parent ? getComputedStyle(parent).overflow : '',
      cropped: (i.naturalWidth && r.height)
        ? Math.abs((i.naturalWidth / i.naturalHeight) - (r.width / r.height)) > 0.05
        : '',
      path: pathOf(i, 3)
    };
  });

  /* ---- BACKGROUND IMAGES ---- */
  const bgImages = [];
  document.querySelectorAll('*').forEach(el => {
    if (!el.offsetHeight) return;
    const s = getComputedStyle(el);
    if (s.backgroundImage && s.backgroundImage !== 'none' && !s.backgroundImage.startsWith('linear')) {
      const r = el.getBoundingClientRect();
      bgImages.push({
        selector: shortSel(el),
        url: s.backgroundImage.slice(0, 80),
        w: +r.width.toFixed(1),
        h: +r.height.toFixed(1),
        ratio: r.height ? +(r.width / r.height).toFixed(3) : '',
        size: s.backgroundSize,
        position: s.backgroundPosition,
        repeat: s.backgroundRepeat,
        attachment: s.backgroundAttachment
      });
    }
  });

  /* ---- VIDEOS ---- */
  const videos = [...document.querySelectorAll('video')].map(v => {
    const r = v.getBoundingClientRect();
    const s = getComputedStyle(v);
    return {
      src: (v.currentSrc || v.src || '').split('/').pop().slice(0, 45),
      renderW: +r.width.toFixed(1),
      renderH: +r.height.toFixed(1),
      ratio: r.height ? +(r.width / r.height).toFixed(3) : '',
      intrinsic: `${v.videoWidth}x${v.videoHeight}`,
      objectFit: s.objectFit,
      autoplay: v.autoplay, muted: v.muted, loop: v.loop,
      visible: v.offsetParent !== null
    };
  });

  /* ---- CARDS: outer box + inner anatomy ---- */
  const cards = [];
  document.querySelectorAll('*').forEach(el => {
    if (el.children.length < 3) return;
    const kids = [...el.children].filter(k => k.offsetHeight > 60 && k.offsetWidth > 40);
    if (kids.length < 3) return;
    const wset = new Set(kids.map(k => Math.round(k.offsetWidth)));
    if (wset.size > 2) return;                       // not uniform → not a card row
    const s = getComputedStyle(el);
    const k0 = kids[0];
    const ks = getComputedStyle(k0);
    const kr = k0.getBoundingClientRect();

    // inner anatomy of one card
    const cImg = k0.querySelector('img');
    const cImgR = cImg ? cImg.getBoundingClientRect() : null;
    const cTitle = k0.querySelector('h1,h2,h3,h4,h5,h6');
    const cTitleS = cTitle ? getComputedStyle(cTitle) : null;
    const cBtn = k0.querySelector('button,a[class*="btn"]');

    cards.push({
      group: shortSel(el).slice(0, 40),
      groupHeading: nearestHeading(el),
      count: kids.length,
      // container layout
      layout: s.display,
      gridCols: px(s.gridTemplateColumns),
      cssGap: px(s.gap),
      measuredGap: kids.length > 1 ? visualGap(kids[0], kids[1]).gap : '',
      gapDir: kids.length > 1 ? visualGap(kids[0], kids[1]).dir : '',
      wrap: s.flexWrap,
      overflowX: s.overflowX,
      scrollSnap: px(s.scrollSnapType),
      containerW: +el.getBoundingClientRect().width.toFixed(1),
      // card box
      cardW: +kr.width.toFixed(1),
      cardH: +kr.height.toFixed(1),
      cardMinH: px(ks.minHeight),
      cardFlexBasis: px(ks.flexBasis),
      cardPadding: `${ks.paddingTop} ${ks.paddingRight} ${ks.paddingBottom} ${ks.paddingLeft}`,
      cardMargin: `${ks.marginTop} ${ks.marginRight} ${ks.marginBottom} ${ks.marginLeft}`,
      cardBorder: px(ks.borderWidth) ? `${ks.borderWidth} ${ks.borderStyle} ${ks.borderColor}` : '',
      cardRadius: px(ks.borderRadius),
      cardShadow: px(ks.boxShadow).slice(0, 55),
      cardBg: ks.backgroundColor === 'rgba(0, 0, 0, 0)' ? '' : ks.backgroundColor,
      cardOverflow: ks.overflow,
      // card image
      imgW: cImgR ? +cImgR.width.toFixed(1) : '',
      imgH: cImgR ? +cImgR.height.toFixed(1) : '',
      imgRatio: cImgR && cImgR.height ? +(cImgR.width / cImgR.height).toFixed(3) : '',
      imgFit: cImg ? getComputedStyle(cImg).objectFit : '',
      imgRadius: cImg ? px(getComputedStyle(cImg).borderRadius) : '',
      // card title
      titleText: cTitle ? cTitle.textContent.trim().slice(0, 30) : '',
      titleSize: cTitleS ? cTitleS.fontSize : '',
      titleWeight: cTitleS ? cTitleS.fontWeight : '',
      titleLH: cTitleS ? cTitleS.lineHeight : '',
      titleMarT: cTitleS ? cTitleS.marginTop : '',
      titleMarB: cTitleS ? cTitleS.marginBottom : '',
      // spacing image -> title
      imgToTitle: (cImg && cTitle)
        ? +(cTitle.getBoundingClientRect().top - cImg.getBoundingClientRect().bottom).toFixed(1) : '',
      hasButton: !!cBtn,
      path: pathOf(el, 3)
    });
  });

  /* ---- SPACING RELATIONSHIPS (section → heading → body → button) ---- */
  const rhythm = [];
  sectionEls().forEach(el => {
    const h = el.querySelector('h1,h2,h3');
    if (!h) return;
    const p = [...el.querySelectorAll('p')].find(x => x.offsetHeight > 0);
    const b = el.querySelector('button,a[class*="btn"]');
    const sr = el.getBoundingClientRect(), hr = h.getBoundingClientRect();
    rhythm.push({
      section: shortSel(el).slice(0, 35),
      heading: h.textContent.trim().slice(0, 35),
      sectionTopToHeading: +(hr.top - sr.top).toFixed(1),
      headingToParagraph: p ? +(p.getBoundingClientRect().top - hr.bottom).toFixed(1) : '',
      paragraphToButton: (p && b)
        ? +(b.getBoundingClientRect().top - p.getBoundingClientRect().bottom).toFixed(1) : '',
      sectionPadT: getComputedStyle(el).paddingTop,
      sectionPadB: getComputedStyle(el).paddingBottom
    });
  });

  /* ---- DOM SWAP DETECTOR ---- */
  const domSwap = [...document.querySelectorAll('img,video,source')].map(el => ({
    file: (el.getAttribute('src') || el.getAttribute('srcset') || '')
      .split(/[?,]/)[0].split('/').pop().slice(0, 45),
    alt: (el.alt || '').slice(0, 28),
    visible: el.offsetParent !== null && el.getBoundingClientRect().width > 0,
    renderW: +el.getBoundingClientRect().width.toFixed(0)
  })).filter(x => x.file);

  /* ---- DESIGN TOKEN CENSUS ---- */
  const bags = { colors: {}, bgColors: {}, radii: {}, shadows: {}, fonts: {}, fontSizes: {}, weights: {}, padding: {}, margin: {}, gaps: {} };
  document.querySelectorAll('*').forEach(el => {
    if (!el.offsetHeight) return;
    const s = getComputedStyle(el);
    const bump = (bag, k) => { if (k && k !== 'none' && k !== '0px' && k !== 'normal' && k !== 'rgba(0, 0, 0, 0)') bag[k] = (bag[k] || 0) + 1; };
    bump(bags.colors, s.color);
    bump(bags.bgColors, s.backgroundColor);
    bump(bags.radii, s.borderRadius);
    bump(bags.shadows, s.boxShadow);
    bump(bags.fonts, s.fontFamily.split(',')[0].replace(/["']/g, '').trim());
    bump(bags.fontSizes, s.fontSize);
    bump(bags.weights, s.fontWeight);
    bump(bags.padding, s.paddingTop); bump(bags.padding, s.paddingLeft);
    bump(bags.margin, s.marginBottom);
    bump(bags.gaps, s.gap);
  });
  const top = (bag, n) => Object.entries(bag).sort((a, b) => b[1] - a[1]).slice(0, n)
    .map(([value, uses]) => ({ value, uses }));

  /* ---- LOADED FONTS ---- */
  const loadedFonts = [];
  try {
    document.fonts.forEach(f => loadedFonts.push({
      family: f.family, weight: f.weight, style: f.style, status: f.status
    }));
  } catch (e) { /* ignore */ }

  const snap = {
    viewport: vw,
    dpr,
    scrollbarWidth: window.innerWidth - document.documentElement.clientWidth,
    docHeight: document.documentElement.scrollHeight,
    hasHorizontalOverflow: document.documentElement.scrollWidth > vw + 1,
    capturedAt: new Date().toISOString(),
    counts: {
      sections: sections.length, images: images.length, headings: headings.length,
      cards: cards.length, buttons: buttons.length, bgImages: bgImages.length
    },
    sections, containers, headings, bodyText, buttons,
    images, bgImages, videos, cards, rhythm, domSwap,
    loadedFonts,
    tokens: {
      colors: top(bags.colors, 20),
      bgColors: top(bags.bgColors, 20),
      radii: top(bags.radii, 12),
      shadows: top(bags.shadows, 10),
      fonts: top(bags.fonts, 10),
      fontSizes: top(bags.fontSizes, 24),
      fontWeights: top(bags.weights, 10),
      padding: top(bags.padding, 24),
      margin: top(bags.margin, 20),
      gaps: top(bags.gaps, 16)
    }
  };

  window.__audit[vw] = snap;
  console.log(`%c CAPTURED @ ${vw}px  (${((performance.now() - t0) / 1000).toFixed(1)}s) `,
    'background:#004;color:#fff;font-size:13px');
  console.table(snap.counts);
  console.table(containers);
  console.table(cards);
  console.table(headings.map(h => ({ tag: h.tag, text: h.text.slice(0, 30), size: h.fontSize, weight: h.fontWeight, lh: h.lineHeight, font: h.fontFamilyFirst, lines: h.renderedLines })));
  return snap;
}

/* ==========================================================================
   4. REPORT
   ========================================================================== */
function report() {
  const W = Object.keys(window.__audit).filter(k => !isNaN(k)).map(Number).sort((a, b) => a - b);
  if (W.length < 2) return console.warn('Capture at 2+ widths first.');
  const A = window.__audit;
  const head = (t, c = '#ff0') => console.log(`%c ${t} `, `background:#111;color:${c};font-size:13px`);

  head('CONTAINER SYSTEM');
  const secNames = [...new Set(W.flatMap(w => A[w].containers.map(c => c.section)))];
  console.table(secNames.map(n => {
    const row = { section: n };
    W.forEach(w => {
      const c = A[w].containers.find(x => x.section === n);
      row[w] = c ? `${c.contentWidth} pad:${c.padL} max:${c.maxWidth || '-'}` : '—';
    });
    return row;
  }));

  head('CARD GEOMETRY');
  const cardNames = [...new Set(W.flatMap(w => A[w].cards.map(c => c.group)))];
  console.table(cardNames.map(n => {
    const row = { group: n };
    W.forEach(w => {
      const c = A[w].cards.find(x => x.group === n);
      row[w] = c ? `${c.count}× ${c.cardW}×${c.cardH} gap:${c.measuredGap} pad:${c.cardPadding.split(' ')[0]}` : '—';
    });
    return row;
  }));

  head('HEADING SCALE');
  const hTexts = [...new Set(W.flatMap(w => A[w].headings.map(h => h.text.slice(0, 28))))].slice(0, 40);
  console.table(hTexts.map(t => {
    const row = { heading: t };
    W.forEach(w => {
      const h = A[w].headings.find(x => x.text.slice(0, 28) === t);
      row[w] = h ? `${h.fontSize}/${h.lineHeight} ${h.fontWeight} ${h.renderedLines}L` : '—';
    });
    return row;
  }));

  head('IMAGE GEOMETRY');
  const imgNames = [...new Set(W.flatMap(w => A[w].images.filter(i => i.visible).map(i => i.alt || i.file)))].slice(0, 50);
  console.table(imgNames.map(n => {
    const row = { image: n };
    W.forEach(w => {
      const i = A[w].images.find(x => (x.alt || x.file) === n);
      row[w] = i && i.visible ? `${i.renderW}×${i.renderH} r:${i.renderRatio} ${i.objectFit}` : 'hidden';
    });
    return row;
  }));

  head('MOBILE vs DESKTOP DOM SWAP', '#f66');
  const files = [...new Set(W.flatMap(w => A[w].domSwap.map(s => s.file)))];
  console.table(files.map(f => {
    const row = { file: f };
    W.forEach(w => {
      const s = A[w].domSwap.find(x => x.file === f);
      row[w] = s ? (s.visible ? `shown ${s.renderW}` : 'hidden') : '—';
    });
    return row;
  }).filter(r => new Set(Object.values(r).slice(1)).size > 1));

  head('FONT SIZE TOKENS PER VIEWPORT');
  console.table(W.map(w => ({
    viewport: w,
    fonts: A[w].tokens.fonts.map(f => f.value).join(', '),
    sizes: A[w].tokens.fontSizes.slice(0, 10).map(f => f.value).join(' '),
    radii: A[w].tokens.radii.slice(0, 6).map(f => f.value).join(' '),
    overflow: A[w].hasHorizontalOverflow ? 'H-SCROLL!' : 'ok'
  })));
}

function exportJSON() {
  const out = JSON.stringify(window.__audit, null, 2);
  try { copy(out); console.log(`Copied ${(out.length / 1024).toFixed(0)}KB`); }
  catch (e) { console.log('copy() unavailable — returning string'); }
  return out;
}

console.log('%c v2 loaded. breakpoints() → capture() at each width → report() ',
  'background:#0a0;color:#000;font-size:14px');