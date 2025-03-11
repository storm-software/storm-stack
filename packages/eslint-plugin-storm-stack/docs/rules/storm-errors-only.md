# Require usage of StormError class (`storm-stack/storm-errors-only`)

💼 This rule is enabled in the ✅ `base` config.

<!-- end auto-generated rule header -->

## Rule Details

👎 Examples of **incorrect** code for this rule:

```js
throw new Error("Failed to process request");
```

👍 Examples of **correct** code for this rule:

```js
throw new StormError("Failed to process request");
```

## Version

4.3.2
