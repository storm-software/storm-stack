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
      "packages/file-system/**/*.ts",
      "packages/file-system/**/*.tsx",
      "packages/file-system/**/*.js",
      "packages/file-system/**/*.jsx"
    ],
    rules: {}
  },
  {
    files: ["packages/file-system/**/*.ts", "packages/file-system/**/*.tsx"],
    rules: {}
  },
  {
    files: ["packages/file-system/**/*.js", "packages/file-system/**/*.jsx"],
    rules: {}
  },
  ...compat.config({ parser: "jsonc-eslint-parser" }).map(config => ({
    ...config,
    "files": ["packages/file-system/**/*.json"],
    "rules": {
      "@nx/dependency-checks": "error"
    }
  }))
];
