import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, rmdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import test from 'node:test';
import { validateSourceInventory } from '../scripts/check-source-inventory.mjs';

const root = process.cwd();
const depcruise = join(
  dirname(fileURLToPath(import.meta.resolve('dependency-cruiser'))),
  '../../bin/dependency-cruise.mjs',
);
const config = join(root, '.dependency-cruiser.cjs');

function execute(script: string, args: string[]) {
  const result = spawnSync(process.execPath, [script, ...args], {
    cwd: root,
    encoding: 'utf8',
  });
  if (result.error) throw result.error;
  assert.equal(typeof result.status, 'number', result.stdout + result.stderr);
  return result;
}

async function assertArchitectureRejects(
  files: Record<string, string>,
  rule?: RegExp,
) {
  const paths = Object.keys(files).map((path) => join(root, path));
  const createdDirectories = new Set<string>();
  for (const file of paths) {
    let directory = join(file, '..');
    while (directory.startsWith(root) && !existsSync(directory)) {
      createdDirectories.add(directory);
      directory = join(directory, '..');
    }
  }
  for (const [path, source] of Object.entries(files)) {
    const absolute = join(root, path);
    await mkdir(join(absolute, '..'), { recursive: true });
    await writeFile(absolute, source);
  }
  try {
    const result = execute(depcruise, ['src', '--config', config]);
    assert.notEqual(result.status, 0, result.stdout + result.stderr);
    if (rule) assert.match(result.stdout + result.stderr, rule);
  } finally {
    await Promise.all(paths.map((path) => rm(path, { force: true })));
    for (const directory of [...createdDirectories].sort(
      (left, right) => right.length - left.length,
    )) {
      await rmdir(directory);
    }
  }
}

void test('dependency-cruiser rejects cross-process imports and renderer Electron access', async () => {
  await assertArchitectureRejects(
    {
      'src/main/__architecture_fixture.ts': "import '../renderer/index.js';\n",
    },
    /main-boundary/,
  );
  await assertArchitectureRejects(
    {
      'src/renderer/__architecture_fixture.ts':
        "import { ipcRenderer } from 'electron';\nvoid ipcRenderer;\n",
    },
    /renderer-no-electron/,
  );
});

void test('dependency-cruiser rejects Node builtins in the renderer and shared bridge', async () => {
  const samples = [
    { layer: 'renderer', specifier: 'node:fs' },
    { layer: 'renderer', specifier: 'fs' },
    { layer: 'shared', specifier: 'fs' },
    { layer: 'shared', specifier: 'path' },
  ];
  for (const [index, sample] of samples.entries()) {
    await assertArchitectureRejects({
      [`src/${sample.layer}/__architecture_builtin_${index}.ts`]: `import * as builtin from '${sample.specifier}';\nvoid builtin;\n`,
    });
  }
});

void test('dependency-cruiser rejects unsupported builtins in preload', async () => {
  await assertArchitectureRejects({
    'src/preload/__architecture_builtin.ts':
      "import { exec } from 'node:child_process';\nvoid exec;\n",
  });
});

void test('dependency-cruiser rejects unknown source-layer relays and imports outside src', async () => {
  await assertArchitectureRejects({
    'src/main/__architecture_unknown.ts':
      "import '../unknown/__architecture_unknown.js';\n",
    'src/unknown/__architecture_unknown.ts': 'export const value = 1;\n',
  });
  await assertArchitectureRejects({
    'src/shared/__architecture_outside.ts':
      "import '../../__architecture_outside.ts';\n",
    '__architecture_outside.ts': 'export const value = 1;\n',
  });
});

void test('source inventory rejects unknown, orphaned, and JSX shared sources', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'harflow-desktop-inventory-'));
  try {
    const source = join(directory, 'src');
    await mkdir(join(source, 'shared'), { recursive: true });
    await mkdir(join(source, 'renderer'), { recursive: true });
    await writeFile(
      join(source, 'shared/bridge.ts'),
      'export const value = 1;\n',
    );
    await writeFile(join(source, 'renderer/index.html'), '<html></html>\n');
    assert.doesNotThrow(() => validateSourceInventory(directory));

    await mkdir(join(source, 'unknown'), { recursive: true });
    assert.throws(
      () => validateSourceInventory(directory),
      /Unknown source layer/,
    );
    await rm(join(source, 'unknown'), { recursive: true, force: true });

    await mkdir(join(source, 'helpers'), { recursive: true });
    await writeFile(
      join(source, 'helpers/orphan.ts'),
      'export const value = 1;\n',
    );
    assert.throws(
      () => validateSourceInventory(directory),
      /Unknown source layer/,
    );
    await rm(join(source, 'helpers'), { recursive: true, force: true });

    await writeFile(
      join(source, 'shared/orphan.js'),
      'export const value = 1;\n',
    );
    assert.throws(
      () => validateSourceInventory(directory),
      /Unsupported production source/,
    );
    await rm(join(source, 'shared/orphan.js'));

    await writeFile(
      join(source, 'shared/view.tsx'),
      'export const View = () => null;\n',
    );
    assert.throws(
      () => validateSourceInventory(directory),
      /JSX is forbidden in pure layers/,
    );
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
