// @ts-check
import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import node from '@astrojs/node';

/** @type {import('astro').AstroUserConfig} */
const config = {
  output: 'server',
  adapter: node({
    mode: 'standalone',
  }),
  integrations: [svelte()],
  server: {
    port: process.env.VITE_SERVER_PORT ? parseInt(process.env.VITE_SERVER_PORT) : 3000,
    host: process.env.VITE_SERVER_HOST || 'localhost',
  },
  vite: {
    server: {
      hmr: {
        port: process.env.VITE_HMR_PORT ? parseInt(process.env.VITE_HMR_PORT) : 24678,
        host: process.env.VITE_HMR_HOST || 'localhost',
      },
    },
  },
};

export default defineConfig(config);
