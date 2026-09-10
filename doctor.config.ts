import { defineConfig } from "react-doctor/api";

export default defineConfig({
  ignore: {
    files: ["packages/oxlint/src/anti-slop/**"],
  },
  projects: ["@zap-studio/react-hooks", "@zap-studio/store-react", "@zap-studio/webmcp-react"],
});
