import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const sourceDocuments = {
  home: readFileSync(join(process.cwd(), 'index.html'), 'utf8'),
  app: readFileSync(join(process.cwd(), 'app.html'), 'utf8'),
};

function extractHeader(document) {
  return document.match(/<header\b[^>]*\bid=["']header["'][^>]*>[\s\S]*?<\/header>/i)?.[0] || '';
}

function extractFooter(document) {
  return document.match(/<footer\b[^>]*\bid=["']contact["'][^>]*>[\s\S]*?<\/footer>/i)?.[0] || '';
}

function extractMobileBottomNav(document) {
  return document.match(/<nav\b[^>]*\bid=["']mobile-bottom-nav["'][^>]*>[\s\S]*?<\/nav>/i)?.[0] || '';
}

function extractBackToTop(document) {
  return document.match(/<button\b[^>]*\bid=["']back-to-top["'][^>]*>[\s\S]*?<\/button>/i)?.[0] || '';
}

// Generic nested-<div> extractor — a non-greedy regex would stop at the
// first inner </div> instead of the matching one, so this walks open/close
// div tags and tracks depth to find the real end of the element.
function extractDivById(document, id) {
  const openMatch = document.match(new RegExp(`<div\\b[^>]*\\bid=["']${id}["'][^>]*>`, 'i'));
  if (!openMatch) return '';
  const start = openMatch.index;
  const tagRe = /<\/?div\b[^>]*>/gi;
  tagRe.lastIndex = start + openMatch[0].length;
  let depth = 1;
  let match;
  while ((match = tagRe.exec(document))) {
    if (match[0].startsWith('</')) { if (--depth === 0) return document.slice(start, tagRe.lastIndex); }
    else depth++;
  }
  return '';
}

const sharedHeader = extractHeader(sourceDocuments.home);
const sharedFooter = extractFooter(sourceDocuments.home);
const sharedMobileBottomNav = extractMobileBottomNav(sourceDocuments.home);
const sharedMobileSearchPanel = extractDivById(sourceDocuments.home, 'mobile-search-panel');
const sharedBackToTop = extractBackToTop(sourceDocuments.home);

export function readLegacyBody(source) {
  const document = sourceDocuments[source] || '';
  let body = document.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] || '';

  // The homepage owns the canonical navigation. Inner routes reuse the same
  // markup so desktop and mobile links, dropdowns and accessibility labels
  // cannot drift apart as separate templates evolve.
  if (source === 'app' && sharedHeader) {
    body = body.replace(/<header\b[^>]*\bid=["']header["'][^>]*>[\s\S]*?<\/header>/i, sharedHeader);
  }

  if (source === 'app' && sharedFooter) {
    body = body.replace(/<footer\b[^>]*>[\s\S]*?<\/footer>/gi, '');
    body += sharedFooter;
  }

  if (source === 'app' && sharedMobileBottomNav) {
    body = body.replace(/<nav\b[^>]*\bid=["']mobile-bottom-nav["'][^>]*>[\s\S]*?<\/nav>/i, '');
    body += sharedMobileBottomNav;
  }

  if (source === 'app' && sharedMobileSearchPanel) {
    body += sharedMobileSearchPanel;
  }

  if (source === 'app' && sharedBackToTop) {
    body += sharedBackToTop;
  }

  return body.replace(/<script\b[^>]*src="\/src\/scripts\/(?:main|app)\.js"[^>]*><\/script>/gi, '');
}
