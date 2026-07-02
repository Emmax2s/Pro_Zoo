import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'


function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

export default defineConfig({
  plugins: [
    figmaAssetResolver(),
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
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
        const outPath = path.join(outDir, safeName);
        fs.writeFileSync(outPath, Buffer.from(base64, 'base64'));

        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ url: `/assets/uploads/${safeName}` }));
      } catch (err: any) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: String(err.message || err) }));
      }
    });
  },
})
