import { mkdirSync, copyFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';

const exts = new Set(['.svg', '.png', '.jpg', '.jpeg', '.gif', '.ico']);

function listFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) out.push(...listFiles(full));
    else out.push(full);
  }
  return out;
}

const files = existsSync('nodes') ? listFiles('nodes') : [];

for (const src of files) {
  const lower = src.toLowerCase();
  const ext = lower.slice(lower.lastIndexOf('.'));
  if (!exts.has(ext)) continue;
  const dest = `dist/${src}`;
  const dir = dirname(dest);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  copyFileSync(src, dest);
  console.log(`Copied ${src} -> ${dest}`);
}
