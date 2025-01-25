// @ts-check
import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';

const isProd = process.env.NODE_ENV === 'production';
const port = process.env.PORT ? parseInt(process.env.PORT) : 4321;

// https://astro.build/config
export default defineConfig({
  integrations: [
    svelte({
      include: ['**/*.svelte'],
      preprocess: [],
    }),
  ],
  server: {
    port,
    host: true,
  },
  vite: {
    server: {
      hmr: isProd ? false : {
        protocol: process.env.VITE_HMR_PROTOCOL || 'ws',
        host: process.env.VITE_HMR_HOST || 'localhost',
        port: process.env.VITE_HMR_PORT ? parseInt(process.env.VITE_HMR_PORT) : port,
        clientPort: process.env.VITE_HMR_CLIENT_PORT ? parseInt(process.env.VITE_HMR_CLIENT_PORT) : undefined,
      },
      watch: {
        usePolling: process.env.VITE_USE_POLLING === 'true',
      },
      proxy: isProd ? {} : {
        '/ws': {
          target: process.env.VITE_WS_PROXY_TARGET || `ws://localhost:${port}`,
          ws: true,
          secure: process.env.VITE_WS_SECURE === 'true',
          rewrite: (path) => path.replace(/^\/ws/, ''),
        },
      },
    },
  },
});
