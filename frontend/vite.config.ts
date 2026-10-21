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
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  assetsInclude: ['**/*.svg', '**/*.csv'],
  root: __dirname,
  build: {
    outDir: path.resolve(__dirname, '../dist'),
    emptyOutDir: true,
  },
  configureServer(server) {
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
})
