// Single flat ESLint config for the whole monorepo (see ADR-0002).
const { defineConfig, globalIgnores } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const prettierConfig = require('eslint-config-prettier/flat');
const globals = require('globals');

module.exports = defineConfig([
  globalIgnores([
    '**/node_modules/**',
    '**/dist/**',
    '**/dist-android/**',
    '**/.expo/**',
    '**/.next/**',
    '**/coverage/**',
    '**/expo-env.d.ts',
    'apps/mobile/android/**',
    'apps/mobile/ios/**',
    'docs/source/**',
  ]),
  expoConfig,
  {
    rules: {
      'import/no-extraneous-dependencies': [
        'error',
        {
          devDependencies: [
            '**/__tests__/**',
            '**/*.test.{ts,tsx}',
            '**/jest.*.js',
            '**/jest.config.js',
            '**/eslint.config.js',
            'scripts/**',
          ],
          // Type-only imports must also be declared, so layer rules cover them too.
          includeTypes: true,
        },
      ],
    },
  },
  {
    // Resolve the "@/*" alias of the Expo app (apps/mobile/tsconfig.json).
    files: ['apps/mobile/**/*.{ts,tsx}'],
    settings: {
      'import/resolver': {
        typescript: { project: 'apps/mobile/tsconfig.json' },
        node: true,
      },
    },
  },
  {
    // ADR-0005: features depend only on data-contracts; only the composition root
    // (src/data) may import the mock implementations.
    files: ['apps/*/**/*.{ts,tsx,js,jsx}'],
    ignores: ['apps/*/src/data/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@wakasafe/mock-data',
              message: 'Only src/data (composition root) may import @wakasafe/mock-data.',
            },
          ],
          patterns: [
            {
              group: ['@wakasafe/mock-data/*'],
              message: 'Only src/data (composition root) may import @wakasafe/mock-data.',
            },
          ],
        },
      ],
    },
  },
  {
    // Shared packages must stay platform-agnostic and must not depend on apps.
    files: ['packages/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                'react',
                'react-native',
                'react-native/*',
                'expo',
                'expo-*',
                'next',
                'next/*',
              ],
              message: 'Shared packages must stay framework-agnostic (ADR-0002).',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['**/*.config.js', '**/jest.*.js', 'scripts/**/*.{js,mjs}'],
    languageOptions: { globals: globals.node },
  },
  {
    files: ['**/jest.setup.js'],
    languageOptions: { globals: globals.jest },
  },
  prettierConfig,
]);
