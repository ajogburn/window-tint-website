import { cpSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const out = join(root, 'dist');

const files = ['index.html', 'gallery.html', 'admin.html'];
const dirs = ['js', 'img', 'public'];

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

for (const file of files) {
  cpSync(join(root, file), join(out, file));
}

for (const dir of dirs) {
  cpSync(join(root, dir), join(out, dir), { recursive: true });
}

console.log('Deploy bundle ready in dist/');