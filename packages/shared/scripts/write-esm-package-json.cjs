const fs = require('node:fs');
const path = require('node:path');

const outDir = path.join(__dirname, '..', 'dist', 'esm');
fs.mkdirSync(outDir, { recursive: true });

const pkgPath = path.join(outDir, 'package.json');
const pkgJson = JSON.stringify({ type: 'module' }, null, 2);
fs.writeFileSync(pkgPath, `${pkgJson}\n`);
