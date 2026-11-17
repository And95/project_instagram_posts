import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    globals: true,
    root: './',
    include: ['src/**/*.spec.ts'],
    exclude: [
      'node_modules/**',
      'dist/**',
      '**/*.integration.spec.ts',
      '**/*.e2e-spec.ts',
    ],
  },
});
