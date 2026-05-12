import { readFileSync } from 'node:fs';
import { access } from 'node:fs/promises';

const requiredFiles = [
  'Dockerfile.api',
  'Dockerfile.web',
  'docker-compose.production.yml',
  'deployment/nginx.conf',
  'deployment/production.md',
  'apps/api/src/monitoring.ts'
];

const requiredEnvKeys = [
  'NODE_ENV',
  'API_PORT',
  'CORS_ORIGIN',
  'DATABASE_URL'
];

for (const file of requiredFiles) {
  await access(file);
}

const envExample = readFileSync('.env.example', 'utf8');
for (const key of requiredEnvKeys) {
  if (!envExample.includes(`${key}=`)) {
    throw new Error(`Missing ${key} in .env.example`);
  }
}

const compose = readFileSync('docker-compose.production.yml', 'utf8');
for (const token of ['healthcheck', 'restart: unless-stopped', 'postgres-data']) {
  if (!compose.includes(token)) {
    throw new Error(`Missing ${token} in docker-compose.production.yml`);
  }
}

const apiDockerfile = readFileSync('Dockerfile.api', 'utf8');
if (!apiDockerfile.includes('/health')) {
  throw new Error('Dockerfile.api must define an API health check');
}

console.log(
  JSON.stringify({
    checked_files: requiredFiles.length,
    env_keys: requiredEnvKeys.length,
    status: 'ok'
  })
);
