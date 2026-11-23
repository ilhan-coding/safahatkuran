import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import type { NextFunction, Request as ExpressRequest, Response as ExpressResponse } from 'express';
import { apiApp, initializeApi } from './server/api';

function mountApi(middlewares: { use: (handler: (req: import('node:http').IncomingMessage, res: import('node:http').ServerResponse, next: (error?: unknown) => void) => void) => void }) {
  const ready = initializeApi();
  middlewares.use((req, res, next) => {
    const pathname = (req.url || '').split('?')[0];
    if (pathname !== '/api' && !pathname.startsWith('/api/') && !pathname.startsWith('/_app/health')) {
      next();
      return;
    }
    void ready.then(() => apiApp(req as unknown as ExpressRequest, res as unknown as ExpressResponse, next as unknown as NextFunction)).catch(() => {
      res.statusCode = 503;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ error: 'Veritabanı hazırlanıyor. Biraz sonra yeniden deneyin.' }));
    });
  });
}

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'mushafim-managed-api',
      configureServer(server) { mountApi(server.middlewares); },
      configurePreviewServer(server) { mountApi(server.middlewares); },
    },
  ],
  server: { host: '0.0.0.0', port: 3000, strictPort: true, allowedHosts: ['.manus.computer'] },
  preview: { host: '0.0.0.0', port: 3000, strictPort: true },
});
