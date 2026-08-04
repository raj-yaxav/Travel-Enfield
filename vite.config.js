import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import { readFileSync } from 'node:fs';

export default defineConfig({
  plugins: [{
    name: 'travelenfield-route-fallback',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const pathname = (req.url || '/').split('?')[0];
        const isAppRoute = pathname !== '/'
          && !pathname.startsWith('/api/')
          && !pathname.startsWith('/src/')
          && !pathname.startsWith('/images/')
          && !pathname.includes('.');
        if (!isAppRoute) return next();
        try {
          const template = readFileSync(resolve(__dirname, 'app.html'), 'utf-8');
          const html = await server.transformIndexHtml(req.url || pathname, template);
          res.statusCode = 200;
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          res.end(html);
        } catch (error) {
          server.ssrFixStacktrace(error);
          next(error);
        }
      });
    },
  }],
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        home: resolve(__dirname, 'index.html'),
        app: resolve(__dirname, 'app.html'),
      },
    },
  },
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': 'http://127.0.0.1:4000',
    },
  },
});
