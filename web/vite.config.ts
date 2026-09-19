import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    host: true,
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
    },
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5001',
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('error', (err, req, res) => {
            if (!res || (res as any).headersSent) return;

            // If GET request, give server 350ms to finish reloading and retry once
            if (req.method === 'GET' && !(req as any)._proxyRetried) {
              (req as any)._proxyRetried = true;
              setTimeout(() => {
                if (!(res as any).headersSent) {
                  try {
                    proxy.web(req, res, { target: 'http://127.0.0.1:5001' });
                    return;
                  } catch {
                    // Fallthrough to 503 response
                  }
                }
              }, 350);
              return;
            }

            if ((res as any)?.writeHead && !(res as any).headersSent) {
              (res as any).writeHead(503, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: false, error: 'Server is starting up or reloading, please retry...' }));
            }
          });
        },
      },
      '/uploads': {
        target: 'http://127.0.0.1:5001',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
  },
});
