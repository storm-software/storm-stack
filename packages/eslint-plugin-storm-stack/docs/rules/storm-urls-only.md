# Prefer usage of `StormURL` class when using Storm Stack (`storm-stack/storm-urls-only`)

💼🚫 This rule is enabled in the 🔒 `strict` config. This rule is _disabled_ in
the following configs: 📋 `base`, 🌟 `recommended`.

🔧 This rule is automatically fixable by the
[`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).

<!-- end auto-generated rule header -->

## Rule Details

👎 Examples of **incorrect** code for this rule:

```ts
const url = new URL("https://example.com");
```

👍 Examples of **correct** code for this rule:

```ts
const url = new StormURL("https://example.com");
```

## Version

0.4.0
