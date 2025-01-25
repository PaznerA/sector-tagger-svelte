// @ts-check
import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import fs from 'fs';

// Load config from env
const isProd = process.env.NODE_ENV === 'production';
const serverHost = process.env.VITE_SERVER_HOST || 'localhost';
const serverPort = parseInt(process.env.VITE_SERVER_PORT || '3000');
const wsHost = process.env.VITE_WS_HOST || 'localhost';
const wsPort = parseInt(process.env.VITE_WS_PORT || '4321');
const hmrPort = parseInt(process.env.VITE_HMR_PORT || '24678');
const sslKeyPath = process.env.VITE_SSL_KEY_PATH || './certs/key.pem';
const sslCertPath = process.env.VITE_SSL_CERT_PATH || './certs/cert.pem';

// Load SSL certificates
const ssl = {
  key: fs.readFileSync(sslKeyPath),
  cert: fs.readFileSync(sslCertPath),
};

// https://astro.build/config
export default defineConfig({
  integrations: [
    svelte({
      include: ['**/*.svelte'],
      preprocess: [],
    }),
  ],
  server: {
    port: serverPort,
    host: serverHost,
    https: ssl,
  },
  vite: {
    server: {
      https: ssl,
      hmr: isProd ? false : {
        protocol: 'wss',
        host: serverHost,
        port: hmrPort,
        clientPort: hmrPort,
      },
      watch: {
        usePolling: false,
      },
      proxy: {
        '/api/ws': {
          target: `wss://${wsHost}:${wsPort}`,
          ws: true,
          secure: false,
        },
      },
    },
  },
});
