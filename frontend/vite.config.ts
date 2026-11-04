import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'

export default defineConfig({
  envDir: path.resolve(__dirname, '..'),
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'api-server-middlewares',
      configureServer(server) {
        server.middlewares.use('/api/translate', async (req, res, next) => {
          try {
            let text = '';
            let sl = 'es';
            let tl = 'en';

            if (req.method === 'POST') {
              let body = '';
              for await (const chunk of req) body += chunk;
              const parsed = JSON.parse(body || '{}');
              text = parsed.text || '';
              sl = parsed.from || parsed.sl || 'es';
              tl = parsed.to || parsed.tl || 'en';
            } else {
              const urlObj = new URL(req.url || '', `http://${req.headers.host}`);
              text = urlObj.searchParams.get('text') || urlObj.searchParams.get('q') || '';
              sl = urlObj.searchParams.get('sl') || urlObj.searchParams.get('from') || 'es';
              tl = urlObj.searchParams.get('tl') || urlObj.searchParams.get('to') || 'en';
            }

            if (!text || sl === tl) {
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ translated: text }));
              return;
            }

            const gtxUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sl}&tl=${tl}&dt=t&q=${encodeURIComponent(text.trim())}`;
            const gtxRes = await fetch(gtxUrl);
            if (gtxRes.ok) {
              const gtxData: any = await gtxRes.json();
              if (Array.isArray(gtxData) && Array.isArray(gtxData[0])) {
                const translated = gtxData[0].map((item: any) => item[0]).join('');
                if (translated && translated.trim()) {
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ translated }));
                  return;
                }
              }
            }

            // Fallback
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ translated: text }));
          } catch (err: any) {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ translated: '', error: String(err.message || err) }));
          }
        });

        server.middlewares.use('/api/upload', async (req, res, next) => {
          if (req.method !== 'POST') {
            res.statusCode = 405;
            res.end('Method Not Allowed');
            return;
          }

          try {
            let body = '';
            for await (const chunk of req) body += chunk;
            const { filename, data } = JSON.parse(body as string);
            if (!filename || !data) throw new Error('Missing filename or data');

            const match = String(data).match(/^data:(.+);base64,(.+)$/);
            const base64 = match ? match[2] : String(data);

            const outDir = path.resolve(__dirname, 'public', 'assets', 'uploads');
            fs.mkdirSync(outDir, { recursive: true });
            const safeName = filename.replace(/[^a-zA-Z0-9.\-_]/g, '_');
            const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`;
            const outPath = path.join(outDir, uniqueName);
            fs.writeFileSync(outPath, Buffer.from(base64, 'base64'));

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ url: `/assets/uploads/${uniqueName}` }));
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: String(err.message || err) }));
          }
        });
      },
    },
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:4000',
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
        target: 'http://127.0.0.1:4000',
        changeOrigin: true,
      },
    },
  },
  assetsInclude: ['**/*.svg', '**/*.csv'],
  root: __dirname,
  build: {
    outDir: path.resolve(__dirname, '../dist'),
    emptyOutDir: true,
  },
})
