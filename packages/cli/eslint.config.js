const { FlatCompat } = require("@eslint/eslintrc");
const baseConfig = require("../../eslint.config.js");
const js = require("@eslint/js");
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended
});
module.exports = [
  ...baseConfig,
  {
    files: [
      "packages/cli/**/*.ts",
      "packages/cli/**/*.tsx",
      "packages/cli/**/*.js",
      "packages/cli/**/*.jsx"
    ],
    rules: {}
  },
  {
    files: ["packages/cli/**/*.ts", "packages/cli/**/*.tsx"],
    rules: {}
  },
  {
    files: ["packages/cli/**/*.js", "packages/cli/**/*.jsx"],
    rules: {}
  },
  ...compat.config({ parser: "jsonc-eslint-parser" }).map(config => ({
    ...config,
    "files": ["packages/cli/**/*.json"],
    "rules": {
      "@nx/dependency-checks": "error"
    }
  }))
];
