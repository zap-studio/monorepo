import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/*.ts', 'src/files/index.ts', 'src/helpers/*'],
  dts: true,
  format: ['cjs', 'esm'],
  exports: true,
});
