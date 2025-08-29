import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: [
    'src/files/index.ts',
    'src/hooks/index.ts',
    'src/ide.ts',
    'src/plugins.ts',
    'src/types.ts',
    'src/deps.ts'
  ],
  dts: true,
  format: ['cjs', 'esm'],
  exports: true,
});
