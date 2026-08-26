import js from '@eslint/js'
import { defineConfig } from 'eslint/config'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import globals from 'globals'
import tsEslint from 'typescript-eslint'

// add ESLint rule configurations here
export default defineConfig([
  js.configs.recommended,
  tsEslint.configs.recommended,
  {
    files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'],
    plugins: { 'simple-import-sort': simpleImportSort },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { ignoreRestSiblings: true }
      ],
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error'
    }
  },
  {
    files: ['src/**/*'],
    languageOptions: { globals: globals.browser }
  },
  {
    files: ['server/**', 'tests/**', '__mocks__/**', 'esbuild.js'],
    languageOptions: { globals: globals.node }
  },
  {
    files: [
      '__mocks__/**/*',
      '**/*.test.js',
      '**/*.test.ts',
      '**/*.test.jsx',
      '**/*.test.tsx'
    ],
    languageOptions: { globals: globals.jest }
  },
  { ignores: ['public'] }
])
