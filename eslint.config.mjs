import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { FlatCompat } from '@eslint/eslintrc';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const tsconfigProjects = [
  './apps/frontend/tsconfig.eslint.json',
  './apps/backend/tsconfig.eslint.json',
  './packages/shared/tsconfig.json',
  './packages/batch/tsconfig.json',
];

export default [
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/coverage/**',
      '**/playwright-report/**',
      '**/test-results/**',
      'eslint.config.mjs',
    ],
  },

  ...compat.extends('airbnb', 'airbnb/hooks', 'prettier'),
  ...compat.extends('airbnb-typescript', 'prettier').map((config) => ({
    ...config,
    files: ['**/*.{ts,tsx}'],
  })),

  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    settings: {
      'import/resolver': {
        typescript: {
          project: tsconfigProjects,
        },
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      },
    },
    rules: {
      'import/prefer-default-export': 'off',
      'import/extensions': [
        'error',
        'ignorePackages',
        { js: 'never', jsx: 'never', ts: 'never', tsx: 'never' },
      ],
    },
  },
  {
    files: ['apps/frontend/**/*.{ts,tsx,js,jsx}'],
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/jsx-filename-extension': ['warn', { extensions: ['.jsx', '.tsx'] }],
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      'react/require-default-props': 'off',
    },
  },
  {
    files: ['apps/backend/**/*.{ts,js}'],
    rules: {
      'class-methods-use-this': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
    },
  },
  {
    files: ['apps/backend/**/*.entity.ts'],
    rules: {
      'import/no-cycle': 'off',
    },
  },

  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        project: tsconfigProjects,
        tsconfigRootDir: __dirname,
      },
    },
  },

  {
    files: [
      '**/*.spec.{ts,tsx,js,jsx}',
      '**/__test__/**/*.{ts,tsx,js,jsx}',
      '**/src/test/**/*.{ts,tsx,js,jsx,d.ts}',
      '**/test/**/*.{ts,tsx,js,jsx}',
      '**/playwright.config.{ts,js,mjs,cjs}',
      '**/vite.config.{ts,js,mjs,cjs}',
      '**/main.{ts,tsx}',
    ],
    rules: {
      'import/no-extraneous-dependencies': [
        'error',
        {
          devDependencies: true,
        },
      ],
    },
  },
];
