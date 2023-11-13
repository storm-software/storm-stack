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
      "packages/errors/**/*.ts",
      "packages/errors/**/*.tsx",
      "packages/errors/**/*.js",
      "packages/errors/**/*.jsx"
    ],
    parserOptions: { project: ["packages/errors/tsconfig.*?.json"] },
    rules: {}
  },
  {
    files: ["packages/errors/**/*.ts", "packages/errors/**/*.tsx"],
    rules: {}
  },
  {
    files: ["packages/errors/**/*.js", "packages/errors/**/*.jsx"],
    rules: {}
  },
  ...compat.config({ parser: "jsonc-eslint-parser" }).map(config => ({
    ...config,
    "files": ["packages/errors/**/*.json"],
    "rules": {
      "@nx/dependency-checks": "error"
    }
  }))
];
