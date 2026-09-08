import { readdir, readFile, writeFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const outputDir = fileURLToPath(new URL('../dist/', import.meta.url));
const textExtensions = new Set(['.html', '.css', '.js', '.xml']);

async function prefixAssetPaths(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      await prefixAssetPaths(path);
    } else if (textExtensions.has(extname(entry.name))) {
      const source = await readFile(path, 'utf8');
      const updated = source.replaceAll('/_astro/', '/rws_boke/_astro/');
      if (updated !== source) await writeFile(path, updated);
    }
  }
}

await prefixAssetPaths(outputDir);
