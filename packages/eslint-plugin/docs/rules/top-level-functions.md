# Enforce top-level functions to be declared with function keyword (`storm-stack/top-level-functions`)

💼⚠️ This rule is enabled in the following configs: 🌟 `recommended`, 🔒
`strict`. This rule _warns_ in the 📋 `base` config.

🔧 This rule is automatically fixable by the
[`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).

<!-- end auto-generated rule header -->

## Rule Details

Enforce top-level function to be declared using `function` instead of arrow
function or function expression. With auto-fix.

<!-- eslint-skip -->

```ts
// 👎 bad
export const square = (a: number, b: number): number => {
  const a2 = a * a;
  const b2 = b * b;
  return a2 + b2 + 2 * a * b;
};
```

<!-- eslint-skip -->

```ts
// 👎 bad
export const square = function (a: number, b: number): number {
  const a2 = a * a;
  const b2 = b * b;
  return a2 + b2 + 2 * a * b;
};
```

<!-- eslint-skip -->

```js
// 👍 good
export function square(a: number, b: number): number {
  const a2 = a * a
  const b2 = b * b
  return a2 + b2 + 2 * a * b
}
```

### Exceptions

When the variable is assigned with types, it rule will ignore it.

<!-- eslint-skip -->

```ts
// 👍 ok
export const square: MyFunction = (a: number, b: number): number => {
  const a2 = a * a;
  const b2 = b * b;
  return a2 + b2 + 2 * a * b;
};
```

## Version

0.4.0
