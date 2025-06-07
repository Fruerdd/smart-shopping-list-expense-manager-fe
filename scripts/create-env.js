const fs = require('fs');
const path = require('path');

const prodEnvPath = path.resolve(__dirname, '../src/environments/environment.prod.ts');
const defaultEnvPath = path.resolve(__dirname, '../src/environments/environment.ts');

const envContents = (isProd) => `
export const environment = {
  production: ${isProd},
  apiUrl: '${process.env.API_URL || ''}'
};
`.trim() + '\n';

fs.mkdirSync(path.dirname(prodEnvPath), { recursive: true });

// Create environment.prod.ts
fs.writeFileSync(prodEnvPath, envContents(true));

// Also create environment.ts if it doesn’t exist
if (!fs.existsSync(defaultEnvPath)) {
  fs.writeFileSync(defaultEnvPath, envContents(false));
  console.log('✅ Created environment.ts for dev fallback');
} else {
  console.log('ℹ️ Skipped environment.ts (already exists)');
}

console.log('✅ Generated environment.prod.ts');