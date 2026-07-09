import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

const noBackendCalls = {
  paths: [
    { name: 'axios', message: 'No internal HTTP calls (ADR 0003). Pass data via props/adapters.' },
    { name: '@tanstack/react-query', importNames: ['useQuery', 'useMutation'], message: 'No data fetching inside the viewer (ADR 0003).' },
  ],
};
const noFetchGlobal = { name: 'fetch', message: 'No internal fetching (ADR 0003).' };

export default defineConfig(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: ['**/dist/**', '**/node_modules/**'],
  },
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
  },

  // D-05: graph-core — zero React/Three/backend coupling
  {
    files: ['packages/graph-core/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        paths: [...noBackendCalls.paths],
        patterns: [
          { group: ['@react-three/*'], message: 'graph-core must not depend on Three.js/R3F.' },
          { group: ['three', 'three/*'], message: 'graph-core must not depend on Three.js/R3F.' },
          { group: ['react', 'react/*', 'react-dom', 'react-dom/*'], message: 'graph-core must not depend on React.' },
        ],
      }],
      'no-restricted-globals': ['error', noFetchGlobal],
    },
  },

  // D-06: react-knowledge-graph — react/react-dom allowed, three/backend/adapters blocked
  {
    files: ['packages/react-knowledge-graph/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        paths: [...noBackendCalls.paths],
        patterns: [
          { group: ['@react-three/*'], message: 'Access Three.js only through graph-renderer-three.' },
          { group: ['three', 'three/*'], message: 'Access Three.js only through graph-renderer-three.' },
          { group: ['@gruporeacciona/adapter-*', '**/adapters/*'], message: 'Adapters must not be imported by react-knowledge-graph (see docs/03-architecture.md).' },
        ],
      }],
      'no-restricted-globals': ['error', noFetchGlobal],
    },
  },

  // D-07: graph-renderer-three — react/three allowed, backend blocked
  {
    files: ['packages/graph-renderer-three/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', { paths: noBackendCalls.paths }],
      'no-restricted-globals': ['error', noFetchGlobal],
    },
  },

  // D-08: adapters/* — pure conversion functions, no React/Three
  {
    files: ['packages/adapters/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [
          { group: ['@react-three/*'] },
          { group: ['three', 'three/*'] },
          { group: ['react', 'react/*', 'react-dom', 'react-dom/*'] },
        ],
      }],
    },
  },
);
