const { readdirSync, statSync } = require('node:fs');
const { join, resolve } = require('node:path');

function collectSpecFiles(directory) {
  const entries = readdirSync(directory);
  const specFiles = [];

  for (const entry of entries) {
    const fullPath = join(directory, entry);
    const stats = statSync(fullPath);

    if (stats.isDirectory()) {
      specFiles.push(...collectSpecFiles(fullPath));
      continue;
    }

    if (entry.endsWith('.spec.ts')) {
      specFiles.push(fullPath);
    }
  }

  return specFiles;
}

for (const specFile of collectSpecFiles(resolve(__dirname, '..', 'src'))) {
  require(specFile);
}
