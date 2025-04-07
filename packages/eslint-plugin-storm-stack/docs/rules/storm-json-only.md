# Require usage of StormJSON class (`storm-stack/storm-json-only`)

💼 This rule is enabled in the ✅ `base` config.

<!-- end auto-generated rule header -->

## Rule Details

👎 Examples of **incorrect** code for this rule:

```js
const value = JSON.parse(strValue);
```

👍 Examples of **correct** code for this rule:

```js
const value = StormJSON.parse(strValue);
```

## Version

4.3.2
