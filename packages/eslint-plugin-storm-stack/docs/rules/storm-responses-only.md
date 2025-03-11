# Require usage of StormResponse class (`storm-stack/storm-responses-only`)

💼 This rule is enabled in the ✅ `base` config.

<!-- end auto-generated rule header -->

## Rule Details

👎 Examples of **incorrect** code for this rule:

```js
function handler(request): Response {
  // ...

  return new Response("Hello, world!");
}
```

👍 Examples of **correct** code for this rule:

```js
function handler(request): StormResponse {
  // ...

  return new StormResponse("Hello, world!");
}
```

## Version

4.3.2
