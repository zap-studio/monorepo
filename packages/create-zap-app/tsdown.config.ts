import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: 'src/index.ts',
  dts: {
    sourcemap: true,
  },
  format: ['cjs', 'esm'],
  exports: true,
});
