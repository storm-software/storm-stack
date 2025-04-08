# Prefer usage of `StormRequest` class when using Storm Stack (`storm-stack/storm-requests-only`)

💼⚠️ This rule is enabled in the following configs: 🌟 `recommended`, 🔒
`strict`. This rule _warns_ in the 📋 `base` config.

🔧 This rule is automatically fixable by the
[`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).

<!-- end auto-generated rule header -->

## Rule Details

👎 Examples of **incorrect** code for this rule:

```ts
function handler(request: Request) {
  // ...
}
```

👍 Examples of **correct** code for this rule:

```ts
function handler(request: StormRequest) {
  // ...
}
```

## Version

0.4.0
