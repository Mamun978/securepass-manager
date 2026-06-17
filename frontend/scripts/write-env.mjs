import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const apiUrl = process.env.API_URL || process.env.NG_APP_API_URL || 'http://localhost:8080/api';
const target = resolve('src/environments/environment.prod.ts');
const content = `export const environment = {
  apiUrl: '${apiUrl.replaceAll("'", "\\'")}'
};
`;

mkdirSync(dirname(target), { recursive: true });
writeFileSync(target, content);
console.log(`Angular API URL configured as ${apiUrl}`);
