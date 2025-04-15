# Error messages should exist in a JSON file that's shared across the workspace when using Storm Stack (`storm-stack/format-error-codes`)

💼⚠️ This rule is enabled in the following configs: 🌟 `recommended`, 🔒
`strict`. This rule _warns_ in the 📋 `base` config.

🔧 This rule is automatically fixable by the
[`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).

<!-- end auto-generated rule header -->

## Rule Details

👎 Examples of **incorrect** code for this rule:

```ts
const type = "GET";

throw new StormError(`Failed to process ${type} request`);
```

👍 Examples of **correct** code for this rule:

```ts
const type = "GET";

throw new StormError({ type: "general", code: 123, args: { type } });
```

## Version

0.4.0
