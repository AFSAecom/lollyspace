import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.resolve(__dirname, 'public');

function generateVersionFile() {
  const pkg = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, 'package.json'), 'utf-8'),
  );
  const version = pkg.version;
  const commit = execSync('git rev-parse HEAD').toString().trim();
  const buildTime = new Date().toISOString();
  fs.mkdirSync(publicDir, { recursive: true });
  fs.writeFileSync(
    path.join(publicDir, 'version.json'),
    JSON.stringify({ version, commit, buildTime }, null, 2),
  );
}

const healthVersionPlugin = () => ({
  name: 'health-version',
  buildStart() {
    generateVersionFile();
  },
  configureServer(server) {
    generateVersionFile();
    server.middlewares.use('/healthz', (_req, res) => {
      res.setHeader('Content-Type', 'text/html');
      res.end(fs.readFileSync(path.join(publicDir, 'healthz.html')));
    });
    server.middlewares.use('/version.json', (_req, res) => {
      res.setHeader('Content-Type', 'application/json');
      res.end(fs.readFileSync(path.join(publicDir, 'version.json')));
    });
  },
});

export default defineConfig({
  plugins: [react(), healthVersionPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
  },
});
