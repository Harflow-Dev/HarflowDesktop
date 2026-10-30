module.exports = {
  forbidden: [
    {
      name: 'shared-no-core',
      severity: 'error',
      from: { path: '^src/shared/' },
      to: { dependencyTypes: ['core'] },
    },
    {
      name: 'sandbox-preload-core',
      severity: 'error',
      from: { path: '^src/preload/' },
      to: {
        dependencyTypes: ['core'],
        pathNot: '^(node:)?(electron|events|timers|url)$',
      },
    },

    {
      name: 'known-source-layers',
      severity: 'error',
      from: { path: '^src/' },
      to: { path: '^src/', pathNot: '^src/(main|preload|renderer|shared)/' },
    },
    {
      name: 'repository-source-only',
      severity: 'error',
      from: { path: '^src/' },
      to: {
        dependencyTypes: ['local'],
        pathNot: '^src/(main|preload|renderer|shared)/',
      },
    },

    { name: 'no-cycles', severity: 'error', from: {}, to: { circular: true } },
    {
      name: 'no-unresolved',
      severity: 'error',
      from: {},
      to: { couldNotResolve: true },
    },
    ...['main', 'preload', 'renderer', 'shared'].map((layer) => ({
      name: `${layer}-boundary`,
      severity: 'error',
      from: { path: `^src/${layer}/` },
      to: {
        path: `^src/(${['main', 'preload', 'renderer', 'shared'].filter((other) => other !== layer && other !== 'shared').join('|')})/`,
      },
    })),
    {
      name: 'shared-pure',
      severity: 'error',
      from: { path: '^src/shared/' },
      to: {
        path: '^(node_modules|src/(main|preload|renderer))|^(node:|electron)',
      },
    },
    {
      name: 'renderer-browser-safe',
      severity: 'error',
      from: { path: '^src/renderer/' },
      to: { dependencyTypes: ['core'] },
    },
    {
      name: 'renderer-no-electron',
      severity: 'error',
      from: { path: '^src/renderer/' },
      to: { path: 'node_modules/electron' },
    },
    {
      name: 'ui-public-exports',
      severity: 'error',
      from: {},
      to: {
        path: 'node_modules/@harflow/ui/',
        pathNot:
          'node_modules/@harflow/ui/dist/(model|application|presentation|components|features)/index\\.js$',
      },
    },
  ],
  options: {
    tsPreCompilationDeps: true,
    enhancedResolveOptions: {
      conditionNames: ['import', 'default'],
      exportsFields: ['exports'],
    },
    tsConfig: { fileName: 'tsconfig.architecture.json' },
    doNotFollow: { path: 'node_modules' },
  },
};
