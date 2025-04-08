# Require usage of StormURL class (`storm-stack/storm-urls-only`)

💼 This rule is enabled in the ✅ `base` config.

<!-- end auto-generated rule header -->

## Rule Details

👎 Examples of **incorrect** code for this rule:

```js
const url = new URL("https://example.com");
```

👍 Examples of **correct** code for this rule:

```js
const url = new StormURL("https://example.com");
```

## Version

4.3.2
