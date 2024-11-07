## 1.14.0 (2024-11-07)


### Features

- **date-time:** Added the `getMonthIndex` helper function ([8d979d2](https://github.com/storm-software/storm-stack/commit/8d979d2))

## 1.13.2 (2024-10-27)


### Bug Fixes

- **date-time:** Update static function to no longer be constants ([f366ffe](https://github.com/storm-software/storm-stack/commit/f366ffe))

## 1.13.1 (2024-10-26)


### Bug Fixes

- **hooks:** Resolve issue updating element reference in `useHook` hook ([340e2f4](https://github.com/storm-software/storm-stack/commit/340e2f4))

## 1.13.0 (2024-10-26)


### Features

- **types:** Added the `isFileResult` type-checker and updated `status` field ([2fc6410](https://github.com/storm-software/storm-stack/commit/2fc6410))

## 1.12.2 (2024-10-24)


### Bug Fixes

- **date-time:** Update the conditionals in validate functions ([f5f4e26](https://github.com/storm-software/storm-stack/commit/f5f4e26))

## 1.12.1 (2024-10-24)


### Bug Fixes

- **date-time:** Resolve issue with the date-time format functions ([f385b23](https://github.com/storm-software/storm-stack/commit/f385b23))

## 1.12.0 (2024-10-24)


### Features

- **hooks:** Added the `composeRefs` function and hook ([80a1379](https://github.com/storm-software/storm-stack/commit/80a1379))

## 1.11.0 (2024-10-22)


### Features

- **monorepo:** Use latest storm build tools in monorepo ([6bf00c5](https://github.com/storm-software/storm-stack/commit/6bf00c5))

## 1.10.2 (2024-10-20)


### Bug Fixes

- **date-time:** Resolve issue with parsing ISO-8601 string ([a63273e](https://github.com/storm-software/storm-stack/commit/a63273e))

## 1.10.1 (2024-10-20)


### Bug Fixes

- **date-time:** Resolved issue with creating date-time in validation function ([2a3c1e8](https://github.com/storm-software/storm-stack/commit/2a3c1e8))

## 1.10.0 (2024-10-18)


### Features

- **date-time:** Provide time zone to the formatting function ([318ab55](https://github.com/storm-software/storm-stack/commit/318ab55))

## 1.9.0 (2024-10-18)


### Features

- **date-time:** Added `returnEmptyIfNotSet` and `returnEmptyIfInvalid` options to `formatDate` ([79cbf52](https://github.com/storm-software/storm-stack/commit/79cbf52))

- **date-time:** Added new flags to formatting options for helper functions ([b702d6c](https://github.com/storm-software/storm-stack/commit/b702d6c))


### Bug Fixes

- **serialization:** Resolved stack overflow issue with `StormParser` class ([f890df9](https://github.com/storm-software/storm-stack/commit/f890df9))

## 1.8.0 (2024-10-15)


### Features

- **types:** Added the `index` and `status` properties to the `SelectOption` type ([7da9603](https://github.com/storm-software/storm-stack/commit/7da9603))

## 1.7.0 (2024-10-14)


### Features

- **types:** Added the `description` property to the `SelectOption` type ([94c33d2](https://github.com/storm-software/storm-stack/commit/94c33d2))

## 1.6.0 (2024-10-11)


### Features

- **types:** Added the `help` and `success` ValidationDetail message types ([207bf67](https://github.com/storm-software/storm-stack/commit/207bf67))

## 1.5.0 (2024-10-10)


### Features

- **utilities:** Added the `toPath` and `toDeepKey` functions ([1977f13](https://github.com/storm-software/storm-stack/commit/1977f13))

## 1.4.2 (2024-10-10)


### Bug Fixes

- **monorepo:** Regenerate markup after token update ([a37ef2a](https://github.com/storm-software/storm-stack/commit/a37ef2a))

## 1.4.1 (2024-10-10)


### Bug Fixes

- **types:** Added missing tags and regenerated markdown ([7ab98cc](https://github.com/storm-software/storm-stack/commit/7ab98cc))

## 1.4.0 (2024-10-10)


### Features

- **utilities:** Update the base Nx configuration ([99988e0](https://github.com/storm-software/storm-stack/commit/99988e0))


### Bug Fixes

- **monorepo:** Update the Nx configuration to include release process specifications ([df311f7](https://github.com/storm-software/storm-stack/commit/df311f7))

## 1.3.4 (2024-10-10)


### Bug Fixes

- **monorepo:** Regenerate the README file formatting ([b81153c](https://github.com/storm-software/storm-stack/commit/b81153c))

## 1.3.3 (2024-10-09)


### Bug Fixes

- **utilities:** Reformatting the README files ([723d68b](https://github.com/storm-software/storm-stack/commit/723d68b))

## 1.3.2 (2024-10-08)


### Bug Fixes

- **types:** Regenerate the monorepo markdown files ([2b5818e](https://github.com/storm-software/storm-stack/commit/2b5818e))

## 1.3.1 (2024-10-08)


### Bug Fixes

- **monorepo:** Resolve issue with markdown across entire monorepo ([ee6720c](https://github.com/storm-software/storm-stack/commit/ee6720c))

## 1.3.0 (2024-10-08)


### Features

- **utilities:** Added the flatten and unflatten utility functions and helper types ([702d44d](https://github.com/storm-software/storm-stack/commit/702d44d))

## 1.2.1 (2024-09-15)


### Bug Fixes

- **monorepo:** Resolve issues in git hook configurations ([f925f93](https://github.com/storm-software/storm-stack/commit/f925f93))

## 1.2.0 (2024-02-10)

### 🚀 Features

- **server-cache:** Added base package to support various types of caching on
  the server
  ([8be6e04](https://github.com/storm-software/storm-stack/commit/8be6e04))

### ❤️ Thank You

- Patrick Sullivan

## 1.1.2 (2024-02-10)

### 🚀 Features

- **monorepo:** Major redesign of project structure
  ([20c7a8f](https://github.com/storm-software/storm-stack/commit/20c7a8f))

### 🩹 Fixes

- **monorepo:** Removed eslint updates
  ([d4d95c1](https://github.com/storm-software/storm-stack/commit/d4d95c1))

- **monorepo:** Readded the `noEmit` option to tsconfig
  ([b9b43fb](https://github.com/storm-software/storm-stack/commit/b9b43fb))

- **monorepo:** Installed latest root tsconfig
  ([38fe002](https://github.com/storm-software/storm-stack/commit/38fe002))

- **nx-tools:** Resolved typing issues
  ([c6c430f](https://github.com/storm-software/storm-stack/commit/c6c430f))

- **unique-identifier:** Resolved issues with `uuid` function export
  ([c9384b0](https://github.com/storm-software/storm-stack/commit/c9384b0))

- **telemetry:** Added the missing `nx-release-publish` value to the
  `project.json` file
  ([bd1c793](https://github.com/storm-software/storm-stack/commit/bd1c793))

### ❤️ Thank You

- Patrick Sullivan

## 1.1.1 (2024-02-09)

### 🚀 Features

- **monorepo:** Major redesign of project structure
  ([20c7a8f](https://github.com/storm-software/storm-stack/commit/20c7a8f))

### 🩹 Fixes

- **monorepo:** Removed eslint updates
  ([d4d95c1](https://github.com/storm-software/storm-stack/commit/d4d95c1))

- **monorepo:** Readded the `noEmit` option to tsconfig
  ([b9b43fb](https://github.com/storm-software/storm-stack/commit/b9b43fb))

- **monorepo:** Installed latest root tsconfig
  ([38fe002](https://github.com/storm-software/storm-stack/commit/38fe002))

- **nx-tools:** Resolved typing issues
  ([c6c430f](https://github.com/storm-software/storm-stack/commit/c6c430f))

- **unique-identifier:** Resolved issues with `uuid` function export
  ([c9384b0](https://github.com/storm-software/storm-stack/commit/c9384b0))

### ❤️ Thank You

- Patrick Sullivan

## 1.1.0 (2024-02-09)

### 🚀 Features

- **monorepo:** Major redesign of project structure
  ([20c7a8f](https://github.com/storm-software/storm-stack/commit/20c7a8f))

### 🩹 Fixes

- **monorepo:** Removed eslint updates
  ([d4d95c1](https://github.com/storm-software/storm-stack/commit/d4d95c1))

- **monorepo:** Readded the `noEmit` option to tsconfig
  ([b9b43fb](https://github.com/storm-software/storm-stack/commit/b9b43fb))

- **monorepo:** Installed latest root tsconfig
  ([38fe002](https://github.com/storm-software/storm-stack/commit/38fe002))

- **nx-tools:** Resolved typing issues
  ([c6c430f](https://github.com/storm-software/storm-stack/commit/c6c430f))

### ❤️ Thank You

- Patrick Sullivan

## 1.0.4 (2024-02-09)

### 🚀 Features

- **monorepo:** Major redesign of project structure
  ([20c7a8f](https://github.com/storm-software/storm-stack/commit/20c7a8f))

### 🩹 Fixes

- **monorepo:** Removed eslint updates
  ([d4d95c1](https://github.com/storm-software/storm-stack/commit/d4d95c1))

- **monorepo:** Readded the `noEmit` option to tsconfig
  ([b9b43fb](https://github.com/storm-software/storm-stack/commit/b9b43fb))

- **monorepo:** Installed latest root tsconfig
  ([38fe002](https://github.com/storm-software/storm-stack/commit/38fe002))

- **nx-tools:** Resolved typing issues
  ([c6c430f](https://github.com/storm-software/storm-stack/commit/c6c430f))

### ❤️ Thank You

- Patrick Sullivan

## 1.0.3 (2024-02-09)

### 🚀 Features

- **monorepo:** Major redesign of project structure
  ([20c7a8f](https://github.com/storm-software/storm-stack/commit/20c7a8f))

### 🩹 Fixes

- **monorepo:** Removed eslint updates
  ([d4d95c1](https://github.com/storm-software/storm-stack/commit/d4d95c1))

- **monorepo:** Readded the `noEmit` option to tsconfig
  ([b9b43fb](https://github.com/storm-software/storm-stack/commit/b9b43fb))

- **monorepo:** Installed latest root tsconfig
  ([38fe002](https://github.com/storm-software/storm-stack/commit/38fe002))

- **nx-tools:** Resolved typing issues
  ([c6c430f](https://github.com/storm-software/storm-stack/commit/c6c430f))

### ❤️ Thank You

- Patrick Sullivan

## 1.0.2 (2024-02-09)

### 🚀 Features

- **monorepo:** Major redesign of project structure
  ([20c7a8f](https://github.com/storm-software/storm-stack/commit/20c7a8f))

### 🩹 Fixes

- **monorepo:** Removed eslint updates
  ([d4d95c1](https://github.com/storm-software/storm-stack/commit/d4d95c1))

- **monorepo:** Readded the `noEmit` option to tsconfig
  ([b9b43fb](https://github.com/storm-software/storm-stack/commit/b9b43fb))

- **monorepo:** Installed latest root tsconfig
  ([38fe002](https://github.com/storm-software/storm-stack/commit/38fe002))

- **nx-tools:** Resolved typing issues
  ([c6c430f](https://github.com/storm-software/storm-stack/commit/c6c430f))

### ❤️ Thank You

- Patrick Sullivan

## 1.0.1 (2024-02-09)

### 🚀 Features

- **monorepo:** Major redesign of project structure
  ([20c7a8f](https://github.com/storm-software/storm-stack/commit/20c7a8f))

### 🩹 Fixes

- **monorepo:** Removed eslint updates
  ([d4d95c1](https://github.com/storm-software/storm-stack/commit/d4d95c1))

- **monorepo:** Readded the `noEmit` option to tsconfig
  ([b9b43fb](https://github.com/storm-software/storm-stack/commit/b9b43fb))

- **monorepo:** Installed latest root tsconfig
  ([38fe002](https://github.com/storm-software/storm-stack/commit/38fe002))

- **nx-tools:** Resolved typing issues
  ([c6c430f](https://github.com/storm-software/storm-stack/commit/c6c430f))

### ❤️ Thank You

- Patrick Sullivan
