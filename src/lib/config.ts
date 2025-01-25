interface Config {
  server: {
    host: string,
    port: number,
    protocol: string,
  },
  ws: {
    host: string,
    port: number,
    path: string,
  },
  hmr: {
    host: string,
    port: number,
  },
  ssl: {
    keyPath: string,
    certPath: string,
  },
  db: {
    path: string,
  },
  dev: boolean,
}

const config: Config = {
  server: {
    host: import.meta.env.VITE_SERVER_HOST || 'localhost',
    port: parseInt(import.meta.env.VITE_SERVER_PORT || '3000'),
    protocol: import.meta.env.VITE_SERVER_PROTOCOL || 'https',
  },
  ws: {
    host: import.meta.env.VITE_WS_HOST || 'localhost',
    port: parseInt(import.meta.env.VITE_WS_PORT || '4321'),
    path: import.meta.env.VITE_WS_PATH || '/api/ws',
  },
  hmr: {
    host: import.meta.env.VITE_HMR_HOST || 'localhost',
    port: parseInt(import.meta.env.VITE_HMR_PORT || '24678'),
  },
  ssl: {
    keyPath: import.meta.env.VITE_SSL_KEY_PATH || './certs/key.pem',
    certPath: import.meta.env.VITE_SSL_CERT_PATH || './certs/cert.pem',
  },
  db: {
    path: import.meta.env.VITE_DB_PATH || './data/db.sqlite',
  },
  dev: import.meta.env.VITE_DEV_MODE === 'true',
};

export default config;
