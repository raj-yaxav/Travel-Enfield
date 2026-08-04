import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const sourceDocuments = {
  home: readFileSync(join(process.cwd(), 'index.html'), 'utf8'),
  app: readFileSync(join(process.cwd(), 'app.html'), 'utf8'),
};

export function readLegacyBody(source) {
  const document = sourceDocuments[source] || '';
  const body = document.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] || '';
  return body.replace(/<script\b[^>]*src="\/src\/scripts\/(?:main|app)\.js"[^>]*><\/script>/gi, '');
}
