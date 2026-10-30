import { build } from 'esbuild';
import { build as viteBuild } from 'vite';
import { rm } from 'node:fs/promises';
await rm('dist', { recursive: true, force: true });
for (const entry of ['main', 'preload'])
  await build({
    entryPoints: [`src/${entry}/index.ts`],
    outfile: `dist/${entry}/index.cjs`,
    bundle: true,
    platform: 'node',
    format: 'cjs',
    external: ['electron'],
    target: 'node22',
  });
await viteBuild({
  root: 'src/renderer',
  base: './',
  build: { outDir: '../../dist/renderer', emptyOutDir: true },
});
