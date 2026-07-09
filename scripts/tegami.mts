import { tegami } from "tegami";
import { runCli } from "tegami/cli";
import { git } from "tegami/plugins/git";
import { github } from "tegami/plugins/github";
import { npm } from "tegami/providers/npm";

const paper = tegami({
  plugins: [
    npm({
      client: "pnpm",
    }),
    git(),
    github({
      repo: "zap-studio/monorepo",
      versionPr: {
        base: "main",
      },
    }),
  ],
});

await runCli(paper);
