## 0.18.0 (2024-12-18)

### Features

- **logging:** Update the `initialize` method signature in the `StormLog` class ([7b11262](https://github.com/storm-software/storm-stack/commit/7b11262))

## 0.17.0 (2024-11-10)

### Features

- **date-time:** Resolve issue parsing ISO string in `StormDateTime` constructor ([c8032d6](https://github.com/storm-software/storm-stack/commit/c8032d6))

## 0.16.0 (2024-11-10)

### Features

- **cli:** Added the `execute` and `install` utility functions ([8b04259](https://github.com/storm-software/storm-stack/commit/8b04259))

## 0.15.0 (2024-11-08)

### Features

- **types:** Regenerate packages with upgraded ops packages ([936026a](https://github.com/storm-software/storm-stack/commit/936026a))

## 0.14.0 (2024-11-07)


### Features

- **date-time:** Added the `getMonthIndex` helper function ([8d979d2](https://github.com/storm-software/storm-stack/commit/8d979d2))

## 0.13.2 (2024-10-27)


### Bug Fixes

- **date-time:** Update static function to no longer be constants ([f366ffe](https://github.com/storm-software/storm-stack/commit/f366ffe))

## 0.13.1 (2024-10-26)


### Bug Fixes

- **hooks:** Resolve issue updating element reference in `useHook` hook ([340e2f4](https://github.com/storm-software/storm-stack/commit/340e2f4))

## 0.13.0 (2024-10-26)


### Features

- **types:** Added the `isFileResult` type-checker and updated `status` field ([2fc6410](https://github.com/storm-software/storm-stack/commit/2fc6410))

## 0.12.2 (2024-10-24)


### Bug Fixes

- **date-time:** Update the conditionals in validate functions ([f5f4e26](https://github.com/storm-software/storm-stack/commit/f5f4e26))

## 0.12.1 (2024-10-24)


### Bug Fixes

- **date-time:** Resolve issue with the date-time format functions ([f385b23](https://github.com/storm-software/storm-stack/commit/f385b23))

## 0.12.0 (2024-10-24)


### Features

- **hooks:** Added the `composeRefs` function and hook ([80a1379](https://github.com/storm-software/storm-stack/commit/80a1379))

## 0.11.0 (2024-10-22)


### Features

- **monorepo:** Use latest storm build tools in monorepo ([6bf00c5](https://github.com/storm-software/storm-stack/commit/6bf00c5))

## 0.10.2 (2024-10-20)


### Bug Fixes

- **date-time:** Resolve issue with parsing ISO-8601 string ([a63273e](https://github.com/storm-software/storm-stack/commit/a63273e))

## 0.10.1 (2024-10-20)


### Bug Fixes

- **date-time:** Resolved issue with creating date-time in validation function ([2a3c1e8](https://github.com/storm-software/storm-stack/commit/2a3c1e8))

## 0.10.0 (2024-10-18)


### Features

- **date-time:** Provide time zone to the formatting function ([318ab55](https://github.com/storm-software/storm-stack/commit/318ab55))

## 0.9.0 (2024-10-18)


### Features

- **date-time:** Added new flags to formatting options for helper functions ([b702d6c](https://github.com/storm-software/storm-stack/commit/b702d6c))


### Bug Fixes

- **serialization:** Resolved stack overflow issue with `StormParser` class ([f890df9](https://github.com/storm-software/storm-stack/commit/f890df9))

## 0.8.0 (2024-10-15)


### Features

- **types:** Added the `index` and `status` properties to the `SelectOption` type ([7da9603](https://github.com/storm-software/storm-stack/commit/7da9603))

## 0.7.0 (2024-10-14)


### Features

- **types:** Added the `description` property to the `SelectOption` type ([94c33d2](https://github.com/storm-software/storm-stack/commit/94c33d2))

## 0.6.0 (2024-10-11)


### Features

- **types:** Added the `help` and `success` ValidationDetail message types ([207bf67](https://github.com/storm-software/storm-stack/commit/207bf67))

## 0.5.0 (2024-10-10)


### Features

- **utilities:** Added the `toPath` and `toDeepKey` functions ([1977f13](https://github.com/storm-software/storm-stack/commit/1977f13))

## 0.4.2 (2024-10-10)


### Bug Fixes

- **monorepo:** Regenerate markup after token update ([a37ef2a](https://github.com/storm-software/storm-stack/commit/a37ef2a))

## 0.4.1 (2024-10-10)


### Bug Fixes

- **types:** Added missing tags and regenerated markdown ([7ab98cc](https://github.com/storm-software/storm-stack/commit/7ab98cc))

## 0.4.0 (2024-10-10)


### Features

- **utilities:** Update the base Nx configuration ([99988e0](https://github.com/storm-software/storm-stack/commit/99988e0))


### Bug Fixes

- **monorepo:** Update the Nx configuration to include release process specifications ([df311f7](https://github.com/storm-software/storm-stack/commit/df311f7))

## 0.3.4 (2024-10-10)


### Bug Fixes

- **monorepo:** Regenerate the README file formatting ([b81153c](https://github.com/storm-software/storm-stack/commit/b81153c))

## 0.3.3 (2024-10-09)


### Bug Fixes

- **utilities:** Reformatting the README files ([723d68b](https://github.com/storm-software/storm-stack/commit/723d68b))

## 0.3.2 (2024-10-08)


### Bug Fixes

- **types:** Regenerate the monorepo markdown files ([2b5818e](https://github.com/storm-software/storm-stack/commit/2b5818e))

## 0.3.1 (2024-10-08)


### Bug Fixes

- **monorepo:** Resolve issue with markdown across entire monorepo ([ee6720c](https://github.com/storm-software/storm-stack/commit/ee6720c))

## 0.3.0 (2024-10-08)


### Features

- **utilities:** Added the flatten and unflatten utility functions and helper types ([702d44d](https://github.com/storm-software/storm-stack/commit/702d44d))

- **errors:** Added the `ErrorType` concept to separate error data behavior ([cfffb39](https://github.com/storm-software/storm-stack/commit/cfffb39))

## 0.2.1 (2024-09-15)


### Bug Fixes

- **monorepo:** Resolve issues in git hook configurations ([f925f93](https://github.com/storm-software/storm-stack/commit/f925f93))

## 0.2.0 (2024-09-13)


### Features

- **telemetry:** Added sentry telemetry functionality ([a29cc50](https://github.com/storm-software/storm-stack/commit/a29cc50))


### Continuous Integration

- **monorepo:** Added updated action parameter names ([e82025a](https://github.com/storm-software/storm-stack/commit/e82025a))