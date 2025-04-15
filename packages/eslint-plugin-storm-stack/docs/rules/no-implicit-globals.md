# Disallow implicit global variables (`storm-stack/no-implicit-globals`)

💼⚠️ This rule is enabled in the following configs: 🌟 `recommended`, 🔒
`strict`. This rule _warns_ in the 📋 `base` config.

<!-- end auto-generated rule header -->

## Rule Details

👎 Examples of **incorrect** code for this rule:

```js
const foo = 1;
```

👍 Examples of **correct** code for this rule:

```js
(function () {
  const foo = 1;
})();
```

## Version

0.4.0
