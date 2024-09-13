import { getStormConfig } from "@storm-software/eslint";

export default getStormConfig({
  name: "storm-stack",
  rules: {
    "unicorn/no-null": 0,
    "react/require-default-props": 0,
    "unicorn/no-useless-switch-case": 0,
    "react/jsx-closing-bracket-location": 0,
    "no-undef": 0,
    "no-unused-vars": "warn",
    "unicorn/consistent-function-scoping": 0,
    "class-methods-use-this": 0,
    "operator-linebreak": 0
  }
});
