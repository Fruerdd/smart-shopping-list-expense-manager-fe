// scripts/create-env.js

const fs   = require('fs');
const path = require('path');

// ─── Show what Netlify gave us ──────────────────────────────
console.log('🔎 process.env.API_URL =', process.env.API_URL);

const prodEnvPath    = path.resolve(__dirname, '../src/environments/environment.prod.ts');
const defaultEnvPath = path.resolve(__dirname, '../src/environments/environment.ts');

const envContents = (isProd) => `
export const environment = {
  production: ${isProd},
  apiUrl: '${process.env.API_URL || ''}'
};
`.trim() + '\n';

// ensure the target directory exists
fs.mkdirSync(path.dirname(prodEnvPath), { recursive: true });

// write environment.prod.ts (used by `ng build --configuration=production`)
fs.writeFileSync(prodEnvPath, envContents(true));

// write environment.ts for development fallback if it doesn't exist
if (!fs.existsSync(defaultEnvPath)) {
  fs.writeFileSync(defaultEnvPath, envContents(false));
  console.log('✅ Created environment.ts for dev fallback');
} else {
  console.log('ℹ️ Skipped environment.ts (already exists)');
}

// ─── Dump prod file contents to the build log ─────────────────────────────────
const content = fs.readFileSync(prodEnvPath, 'utf-8');
console.log('🗂️ environment.prod.ts contents:\n' + content);

console.log('✅ Generated environment.prod.ts');
