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

const sharedHeader = extractHeader(sourceDocuments.home);
const sharedFooter = extractFooter(sourceDocuments.home);

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

  return body.replace(/<script\b[^>]*src="\/src\/scripts\/(?:main|app)\.js"[^>]*><\/script>/gi, '');
}
