import { bundlerConfig } from '@zap-ts/config/bundler/config';
import { defineConfig } from 'tsdown';

export default defineConfig({
  ...bundlerConfig,
  entry: 'src/index.ts',
});
