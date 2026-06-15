import { readFileSync, existsSync, appendFileSync } from 'fs';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const logPath = join(root, '.cursor/debug-97e6c4.log');

function log(hypothesisId, message, data) {
  const entry = JSON.stringify({
    sessionId: '97e6c4',
    runId: process.env.RUN_ID || 'pre-fix',
    hypothesisId,
    location: 'scripts/verify-deploy-env.mjs',
    message,
    data,
    timestamp: Date.now(),
  });
  appendFileSync(logPath, `${entry}\n`);
}

const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const lock = JSON.parse(readFileSync(join(root, 'package-lock.json'), 'utf8'));
const lockVite = lock.packages?.['node_modules/vite']?.version ?? 'missing';
const viteInDeps = Boolean(pkg.dependencies?.vite);
const viteInDevDeps = Boolean(pkg.devDependencies?.vite);

log('A', 'package.json vite placement', {
  viteInDependencies: viteInDeps,
  viteInDevDependencies: viteInDevDeps,
  viteSpec: pkg.dependencies?.vite || pkg.devDependencies?.vite || null,
});

log('B', 'lockfile vite version', { lockViteVersion: lockVite });

const prodInstall = execSync('npm ci --progress=false', {
  cwd: root,
  env: { ...process.env, NODE_ENV: 'production' },
  encoding: 'utf8',
});
const prodMatch = prodInstall.match(/audited (\d+) packages/);
const prodVitePath = join(root, 'node_modules/vite/package.json');
const prodViteVersion = existsSync(prodVitePath)
  ? JSON.parse(readFileSync(prodVitePath, 'utf8')).version
  : 'NOT_INSTALLED';

log('A', 'production npm ci result (Cloudflare-like)', {
  auditedPackages: prodMatch ? Number(prodMatch[1]) : null,
  installedViteVersion: prodViteVersion,
  cloudflareFailureSignature: prodViteVersion === '5.4.9' || Number(prodMatch?.[1]) === 13,
});

execSync('npm ci --progress=false', { cwd: root, encoding: 'utf8' });
const fullMatch = execSync('npm ci --progress=false', { cwd: root, encoding: 'utf8' }).match(
  /audited (\d+) packages/
);
const fullViteVersion = JSON.parse(
  readFileSync(join(root, 'node_modules/vite/package.json'), 'utf8')
).version;

log('C', 'full npm ci result', {
  auditedPackages: fullMatch ? Number(fullMatch[1]) : null,
  installedViteVersion: fullViteVersion,
});

log('D', 'github lockfile expectation', {
  expectedAuditedPackages: 16,
  expectedViteVersion: '6.4.3',
  matchesCloudflareLog13Packages: Number(prodMatch?.[1]) === 13,
});

console.log('Deploy env verification complete. See .cursor/debug-97e6c4.log');
