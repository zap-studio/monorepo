# @zap-studio/oxfmt

Zap Studio's [oxfmt](https://oxc.rs/docs/guide/usage/formatter.html) preset — sorted imports, sorted `package.json`, and an optional Tailwind CSS class-sorting extension.

Full documentation: [docs/oxfmt](https://github.com/zap-studio/monorepo/tree/main/docs/oxfmt)

## Installation

```bash
npm install --save-dev @zap-studio/oxfmt oxfmt
```

`oxfmt` is a peer dependency — install the version you want to run.

## Usage

```ts
import zapStudio from "@zap-studio/oxfmt/base";
// oxfmt.config.ts
import { defineConfig } from "oxfmt";

export default defineConfig(zapStudio);
```

Tailwind CSS projects:

```ts
import zapStudio from "@zap-studio/oxfmt/tailwind";
import { defineConfig } from "oxfmt";

export default defineConfig(zapStudio);
```

Unlike `oxlint.config.ts`, oxfmt's config has no `extends` merge — override or add options with a plain object spread:

```ts
export default defineConfig({
  ...zapStudio,
  printWidth: 120,
});
```

## License

MIT.
