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
      "packages/logging/**/*.ts",
      "packages/logging/**/*.tsx",
      "packages/logging/**/*.js",
      "packages/logging/**/*.jsx"
    ],
    parserOptions: { project: ["packages/logging/tsconfig.*?.json"] },
    rules: {}
  },
  {
    files: ["packages/logging/**/*.ts", "packages/logging/**/*.tsx"],
    rules: {}
  },
  {
    files: ["packages/logging/**/*.js", "packages/logging/**/*.jsx"],
    rules: {}
  },
  ...compat.config({ parser: "jsonc-eslint-parser" }).map(config => ({
    ...config,
    "files": ["packages/logging/**/*.json"],
    "rules": {
      "@nx/dependency-checks": "error"
    }
  }))
];
