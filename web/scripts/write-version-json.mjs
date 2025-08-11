import { execSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import pkg from '../package.json' with { type: 'json' };

const commit = process.env.GITHUB_SHA || execSync('git rev-parse HEAD').toString().trim();

const data = {
  version: pkg.version,
  commit,
  buildTime: new Date().toISOString(),
};

const outputDir = new URL('../dist/', import.meta.url);
await mkdir(outputDir, { recursive: true });
await writeFile(new URL('version.json', outputDir), JSON.stringify(data, null, 2));
