// @ts-check
import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  integrations: [svelte()],
  output: 'server',
  adapter: node({
    mode: 'standalone'
  }),
  server: {
    host: process.env.VITE_SERVER_HOST || '0.0.0.0',
    port: parseInt(process.env.VITE_SERVER_PORT || '3000'),
  },
  vite: {
    server: {
      host: process.env.VITE_SERVER_HOST || '0.0.0.0',
      port: parseInt(process.env.VITE_SERVER_PORT || '3000'),
      strictPort: true,
      https: process.env.VITE_SERVER_PROTOCOL === 'https' && process.env.VITE_SSL_KEY_PATH && process.env.VITE_SSL_CERT_PATH ? {
        key: process.env.VITE_SSL_KEY_PATH,
        cert: process.env.VITE_SSL_CERT_PATH,
      } : undefined,
    },
  },
});
