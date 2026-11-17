import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const ROOT = path.resolve('public/assets');

async function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(full);
    } else if (/\.(jpe?g|png)$/i.test(entry.name)) {
      const out = full.replace(/\.(jpe?g|png)$/i, '.webp');
      await sharp(full)
        .resize({ width: 1280, withoutEnlargement: true })
        .webp({ quality: 78 })
        .toFile(out);
      console.log('Converted:', path.relative(ROOT, out));
    }
  }
}

await walk(ROOT);