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
      "packages/config/**/*.ts",
      "packages/config/**/*.tsx",
      "packages/config/**/*.js",
      "packages/config/**/*.jsx"
    ],
    parserOptions: { project: ["packages/config/tsconfig.*?.json"] },
    rules: {}
  },
  {
    files: ["packages/config/**/*.ts", "packages/config/**/*.tsx"],
    rules: {}
  },
  {
    files: ["packages/config/**/*.js", "packages/config/**/*.jsx"],
    rules: {}
  },
  ...compat.config({ parser: "jsonc-eslint-parser" }).map(config => ({
    ...config,
    "files": ["packages/config/**/*.json"],
    "rules": {
      "@nx/dependency-checks": "error"
    }
  }))
];
