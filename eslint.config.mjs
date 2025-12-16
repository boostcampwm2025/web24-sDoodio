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

const tsconfigProjects = ['./apps/frontend/tsconfig.eslint.json', './packages/shared/tsconfig.json'];

export default [
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/coverage/**',
      '**/playwright-report/**',
      '**/test-results/**',
    ],
  },

  ...compat.extends('airbnb', 'airbnb/hooks', 'prettier'),
  ...compat.extends('airbnb-typescript', 'prettier').map((config) => ({
    ...config,
    files: ['**/*.{ts,tsx}'],
  })),

  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    settings: {
      react: { version: 'detect' },
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
      ...reactHooks.configs.recommended.rules,
      'import/prefer-default-export': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/jsx-filename-extension': ['warn', { extensions: ['.jsx', '.tsx'] }],
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      'import/extensions': [
        'error',
        'ignorePackages',
        { js: 'never', jsx: 'never', ts: 'never', tsx: 'never' },
      ],
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
      '**/playwright.config.{ts,js,mjs,cjs}',
      '**/vite.config.{ts,js,mjs,cjs}',
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
