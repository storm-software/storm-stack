import storm from "@storm-software/eslint";

export default storm({
  ignores: ["**/dist", "**/node_modules", "**/.nx"],
  rules: {
    "unicorn/no-null": 0,
    "react/require-default-props": 0,
    "unicorn/no-useless-switch-case": 0,
    "react/jsx-closing-bracket-location": 0,
    "no-undef": 0,
    "unicorn/consistent-function-scoping": 0,
    "class-methods-use-this": 0
  }
});
