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
      "packages/unique-identifier/**/*.ts",
      "packages/unique-identifier/**/*.tsx",
      "packages/unique-identifier/**/*.js",
      "packages/unique-identifier/**/*.jsx"
    ],
    parserOptions: { project: ["packages/unique-identifier/tsconfig.*?.json"] },
    rules: {}
  },
  {
    files: [
      "packages/unique-identifier/**/*.ts",
      "packages/unique-identifier/**/*.tsx"
    ],
    rules: {}
  },
  {
    files: [
      "packages/unique-identifier/**/*.js",
      "packages/unique-identifier/**/*.jsx"
    ],
    rules: {}
  },
  ...compat.config({ parser: "jsonc-eslint-parser" }).map(config => ({
    ...config,
    "files": ["packages/unique-identifier/**/*.json"],
    "rules": {
      "@nx/dependency-checks": "error"
    }
  }))
];
