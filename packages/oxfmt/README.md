# @zap-studio/oxfmt

Zap Studio's [oxfmt](https://oxc.rs/docs/guide/usage/formatter.html) preset — sorted imports, sorted `package.json`, and an optional Tailwind CSS class-sorting extension.

## Installation

```bash
npm install --save-dev @zap-studio/oxfmt oxfmt
```

`oxfmt` is a peer dependency — install the version you want to run.

## Usage

```ts
// oxfmt.config.ts
import { defineConfig } from "oxfmt";
import zapStudio from "@zap-studio/oxfmt/base";

export default defineConfig(zapStudio);
```

Tailwind CSS projects:

```ts
import { defineConfig } from "oxfmt";
import zapStudio from "@zap-studio/oxfmt/tailwind";

export default defineConfig(zapStudio);
```

Unlike `oxlint.config.ts`, oxfmt's config has no `extends` merge — override or add options with a plain object spread:

```ts
export default defineConfig({
  ...zapStudio,
  printWidth: 120,
});
```

## Presets

| Preset                       | Built on | Adds                                                                                                                                                                                                                                                         |
| ---------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `@zap-studio/oxfmt/base`     | —        | sorted imports (`type-import`, then builtin/external values, internal types, internal values, then parent/sibling/index grouped by type then value, then unknown — blank line between groups) and sorted `package.json` (keys and `scripts`, alphabetically) |
| `@zap-studio/oxfmt/tailwind` | `base`   | `sortTailwindcss: true`                                                                                                                                                                                                                                      |

## License

MIT.
