import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import hooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
export default tseslint.config(
  { ignores: ['dist/**', 'node_modules/**', 'tests/fixtures/**'] },
  js.configs.recommended,
  { files: ['**/*.mjs'], languageOptions: { globals: globals.node } },
  ...tseslint.configs.strictTypeChecked.map((config) => ({
    ...config,
    files: ['src/**/*.ts', 'src/**/*.tsx', 'tests/**/*.ts'],
  })),
  {
    files: ['src/**/*.ts', 'src/**/*.tsx', 'tests/**/*.ts'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: { 'react-hooks': hooks },
    rules: {
      ...hooks.configs.recommended.rules,
      'max-lines': [
        'error',
        { max: 400, skipBlankLines: true, skipComments: true },
      ],
      'max-lines-per-function': [
        'error',
        { max: 80, skipBlankLines: true, skipComments: true },
      ],
      complexity: ['warn', 10],
      '@typescript-eslint/no-floating-promises': 'error',
    },
  },
  {
    files: ['tests/**/*.ts'],
    languageOptions: {
      parserOptions: {
        projectService: false,
        project: './tsconfig.tests.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      'max-lines-per-function': 'off',
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/only-throw-error': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/restrict-template-expressions': [
        'error',
        { allowNumber: true },
      ],
      '@typescript-eslint/no-confusing-void-expression': [
        'error',
        { ignoreArrowShorthand: true },
      ],
    },
  },
);
