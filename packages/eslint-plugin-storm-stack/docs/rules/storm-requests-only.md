# Require usage of StormRequest class (`storm-stack/storm-requests-only`)

💼 This rule is enabled in the ✅ `base` config.

<!-- end auto-generated rule header -->

## Rule Details

👎 Examples of **incorrect** code for this rule:

```js
function handler(request: Request) {
  // ...
}
```

👍 Examples of **correct** code for this rule:

```js
function handler(request: StormRequest) {
  // ...
}
```

## Version

4.3.2
