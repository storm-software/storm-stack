# Prefer usage of `StormJSON` class when using Storm Stack (`storm-stack/storm-json-only`)

💼⚠️🚫 This rule is enabled in the 🔒 `strict` config. This rule _warns_ in the
🌟 `recommended` config. This rule is _disabled_ in the 📋 `base` config.

🔧 This rule is automatically fixable by the
[`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).

<!-- end auto-generated rule header -->

## Rule Details

👎 Examples of **incorrect** code for this rule:

```ts
const value = JSON.parse(strValue)
```

👍 Examples of **correct** code for this rule:

```ts
const value = StormJSON.parse(strValue)
```

## Version

0.4.0
