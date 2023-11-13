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
      "packages/serialization/**/*.ts",
      "packages/serialization/**/*.tsx",
      "packages/serialization/**/*.js",
      "packages/serialization/**/*.jsx"
    ],
    parserOptions: { project: ["packages/serialization/tsconfig.*?.json"] },
    rules: {}
  },
  {
    files: [
      "packages/serialization/**/*.ts",
      "packages/serialization/**/*.tsx"
    ],
    rules: {}
  },
  {
    files: [
      "packages/serialization/**/*.js",
      "packages/serialization/**/*.jsx"
    ],
    rules: {}
  },
  ...compat.config({ parser: "jsonc-eslint-parser" }).map(config => ({
    ...config,
    "files": ["packages/serialization/**/*.json"],
    "rules": {
      "@nx/dependency-checks": "error"
    }
  }))
];
