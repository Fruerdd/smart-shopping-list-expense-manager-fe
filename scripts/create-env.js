const fs = require('fs');
const envProd = `
export const environment = {
  production: true,
  apiUrl: '${process.env.API_URL}'
};
`;

fs.writeFileSync('./src/environments/environment.prod.ts', envProd);
console.log('✅ Created environment.prod.ts');
