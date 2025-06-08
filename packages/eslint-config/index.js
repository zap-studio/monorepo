import turboConfig from "eslint-config-turbo/flat";
import turbo from "eslint-plugin-turbo";

export default [...turboConfig, turbo.configs["flat/recommended"]];
