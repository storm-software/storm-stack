## 1.34.0 (2024-10-24)


### Features

- **hooks:** Added `useBattery`, `useClickAway`, and `useCopyToClipboard` hooks ([556db4d](https://github.com/storm-software/storm-stack/commit/556db4d))

## 1.33.0 (2024-10-24)


### Features

- **hooks:** Added the `composeRefs` function and hook ([80a1379](https://github.com/storm-software/storm-stack/commit/80a1379))


### Bug Fixes

- **date-time:** Resolved issue with formatting date-time values ([bbddb1a](https://github.com/storm-software/storm-stack/commit/bbddb1a))

## 1.32.0 (2024-10-22)


### Features

- **types:** Add type parameters and the `icon` property to the `SelectOption` type ([c0ae1d6](https://github.com/storm-software/storm-stack/commit/c0ae1d6))

## 1.31.0 (2024-10-22)


### Features

- **monorepo:** Use latest storm build tools in monorepo ([6bf00c5](https://github.com/storm-software/storm-stack/commit/6bf00c5))

## 1.30.0 (2024-10-20)


### Features

- **serialization:** Added the `parseCookie` and `serializeCookie` helper functions ([0b695ef](https://github.com/storm-software/storm-stack/commit/0b695ef))

## 1.29.3 (2024-10-20)


### Bug Fixes

- **date-time:** Resolve issue with parsing ISO-8601 string ([a63273e](https://github.com/storm-software/storm-stack/commit/a63273e))

## 1.29.2 (2024-10-20)


### Bug Fixes

- **date-time:** Resolve issue with call to validation prior to construction ([d020d67](https://github.com/storm-software/storm-stack/commit/d020d67))

## 1.29.1 (2024-10-20)


### Bug Fixes

- **date-time:** Resolved issue with creating date-time in validation function ([2a3c1e8](https://github.com/storm-software/storm-stack/commit/2a3c1e8))

## 1.29.0 (2024-10-20)


### Features

- **date-time:** Added the day of the month validation to date classes ([734d0c8](https://github.com/storm-software/storm-stack/commit/734d0c8))

## 1.28.0 (2024-10-18)


### Features

- **date-time:** Using Tempo to format Date objects ([3b50a18](https://github.com/storm-software/storm-stack/commit/3b50a18))

- **date-time:** Provide time zone to the formatting function ([318ab55](https://github.com/storm-software/storm-stack/commit/318ab55))

## 1.27.0 (2024-10-18)


### Features

- **date-time:** Added the `getDefaultTimeZone` function to the `StormDateTime` class ([f2fac83](https://github.com/storm-software/storm-stack/commit/f2fac83))

## 1.26.0 (2024-10-18)


### Features

- **date-time:** Added the static validate method to the `StormDateTime` utility classes ([3169747](https://github.com/storm-software/storm-stack/commit/3169747))

## 1.25.0 (2024-10-18)


### Features

- **date-time:** Added `returnEmptyIfNotSet` and `returnEmptyIfInvalid` options to `formatDate` ([79cbf52](https://github.com/storm-software/storm-stack/commit/79cbf52))

- **date-time:** Added new flags to formatting options for helper functions ([b702d6c](https://github.com/storm-software/storm-stack/commit/b702d6c))


### Bug Fixes

- **serialization:** Resolved stack overflow issue with `StormParser` class ([f890df9](https://github.com/storm-software/storm-stack/commit/f890df9))

## 1.24.0 (2024-10-15)


### Features

- **types:** Added the `index` and `status` properties to the `SelectOption` type ([7da9603](https://github.com/storm-software/storm-stack/commit/7da9603))

## 1.23.0 (2024-10-14)


### Features

- **types:** Added the `description` property to the `SelectOption` type ([94c33d2](https://github.com/storm-software/storm-stack/commit/94c33d2))

## 1.22.0 (2024-10-11)


### Features

- **types:** Added the `help` and `success` ValidationDetail message types ([207bf67](https://github.com/storm-software/storm-stack/commit/207bf67))

## 1.21.0 (2024-10-10)


### Features

- **utilities:** Added the `toPath` and `toDeepKey` functions ([1977f13](https://github.com/storm-software/storm-stack/commit/1977f13))

## 1.20.2 (2024-10-10)


### Bug Fixes

- **monorepo:** Regenerate markup after token update ([a37ef2a](https://github.com/storm-software/storm-stack/commit/a37ef2a))

## 1.20.1 (2024-10-10)


### Bug Fixes

- **types:** Added missing tags and regenerated markdown ([7ab98cc](https://github.com/storm-software/storm-stack/commit/7ab98cc))

## 1.20.0 (2024-10-10)


### Features

- **utilities:** Update the base Nx configuration ([99988e0](https://github.com/storm-software/storm-stack/commit/99988e0))


### Bug Fixes

- **monorepo:** Update the Nx configuration to include release process specifications ([df311f7](https://github.com/storm-software/storm-stack/commit/df311f7))

## 1.19.4 (2024-10-10)


### Bug Fixes

- **monorepo:** Regenerate the README file formatting ([b81153c](https://github.com/storm-software/storm-stack/commit/b81153c))

## 1.19.3 (2024-10-09)


### Bug Fixes

- **utilities:** Reformatting the README files ([723d68b](https://github.com/storm-software/storm-stack/commit/723d68b))

## 1.19.2 (2024-10-08)


### Bug Fixes

- **types:** Regenerate the monorepo markdown files ([2b5818e](https://github.com/storm-software/storm-stack/commit/2b5818e))

## 1.19.1 (2024-10-08)


### Bug Fixes

- **monorepo:** Resolve issue with markdown across entire monorepo ([ee6720c](https://github.com/storm-software/storm-stack/commit/ee6720c))



## 1.18.0 (2024-02-10)

### 🚀 Features

- **server-cache:** Added base package to support various types of caching on
  the server
  ([8be6e04](https://github.com/storm-software/storm-stack/commit/8be6e04))

### ❤️ Thank You

- Patrick Sullivan

## 1.17.2 (2024-02-10)

### 🚀 Features

- **tools-nx:** Initial check-in for Storm-Stack Nx Tools package
  ([556997b](https://github.com/storm-software/storm-stack/commit/556997b))

- **monorepo:** Major redesign of project structure
  ([20c7a8f](https://github.com/storm-software/storm-stack/commit/20c7a8f))

### 🩹 Fixes

- **monorepo:** Regenerate the monorepo's pnpm-lock file
  ([d7297d0](https://github.com/storm-software/storm-stack/commit/d7297d0))

- **monorepo:** Removed eslint updates
  ([d4d95c1](https://github.com/storm-software/storm-stack/commit/d4d95c1))

- **monorepo:** Readded the `noEmit` option to tsconfig
  ([b9b43fb](https://github.com/storm-software/storm-stack/commit/b9b43fb))

- **unique-identifier:** Resolved issues with `uuid` function export
  ([c9384b0](https://github.com/storm-software/storm-stack/commit/c9384b0))

### ❤️ Thank You

- Patrick Sullivan

## 1.17.1 (2024-02-09)

### 🚀 Features

- **tools-nx:** Initial check-in for Storm-Stack Nx Tools package
  ([556997b](https://github.com/storm-software/storm-stack/commit/556997b))

- **monorepo:** Major redesign of project structure
  ([20c7a8f](https://github.com/storm-software/storm-stack/commit/20c7a8f))

### 🩹 Fixes

- **monorepo:** Regenerate the monorepo's pnpm-lock file
  ([d7297d0](https://github.com/storm-software/storm-stack/commit/d7297d0))

- **monorepo:** Removed eslint updates
  ([d4d95c1](https://github.com/storm-software/storm-stack/commit/d4d95c1))

- **monorepo:** Readded the `noEmit` option to tsconfig
  ([b9b43fb](https://github.com/storm-software/storm-stack/commit/b9b43fb))

- **unique-identifier:** Resolved issues with `uuid` function export
  ([c9384b0](https://github.com/storm-software/storm-stack/commit/c9384b0))

### ❤️ Thank You

- Patrick Sullivan

## 1.17.0 (2024-02-09)

### 🚀 Features

- **tools-nx:** Initial check-in for Storm-Stack Nx Tools package
  ([556997b](https://github.com/storm-software/storm-stack/commit/556997b))

- **monorepo:** Major redesign of project structure
  ([20c7a8f](https://github.com/storm-software/storm-stack/commit/20c7a8f))

### 🩹 Fixes

- **monorepo:** Regenerate the monorepo's pnpm-lock file
  ([d7297d0](https://github.com/storm-software/storm-stack/commit/d7297d0))

- **monorepo:** Removed eslint updates
  ([d4d95c1](https://github.com/storm-software/storm-stack/commit/d4d95c1))

- **monorepo:** Readded the `noEmit` option to tsconfig
  ([b9b43fb](https://github.com/storm-software/storm-stack/commit/b9b43fb))

### ❤️ Thank You

- Patrick Sullivan

## 1.16.4 (2024-02-09)

### 🚀 Features

- **tools-nx:** Initial check-in for Storm-Stack Nx Tools package
  ([556997b](https://github.com/storm-software/storm-stack/commit/556997b))

- **monorepo:** Major redesign of project structure
  ([20c7a8f](https://github.com/storm-software/storm-stack/commit/20c7a8f))

### 🩹 Fixes

- **monorepo:** Regenerate the monorepo's pnpm-lock file
  ([d7297d0](https://github.com/storm-software/storm-stack/commit/d7297d0))

- **monorepo:** Removed eslint updates
  ([d4d95c1](https://github.com/storm-software/storm-stack/commit/d4d95c1))

- **monorepo:** Readded the `noEmit` option to tsconfig
  ([b9b43fb](https://github.com/storm-software/storm-stack/commit/b9b43fb))

### ❤️ Thank You

- Patrick Sullivan

## 1.16.3 (2024-02-09)

### 🚀 Features

- **tools-nx:** Initial check-in for Storm-Stack Nx Tools package
  ([556997b](https://github.com/storm-software/storm-stack/commit/556997b))

- **monorepo:** Major redesign of project structure
  ([20c7a8f](https://github.com/storm-software/storm-stack/commit/20c7a8f))

### 🩹 Fixes

- **monorepo:** Regenerate the monorepo's pnpm-lock file
  ([d7297d0](https://github.com/storm-software/storm-stack/commit/d7297d0))

- **monorepo:** Removed eslint updates
  ([d4d95c1](https://github.com/storm-software/storm-stack/commit/d4d95c1))

- **monorepo:** Readded the `noEmit` option to tsconfig
  ([b9b43fb](https://github.com/storm-software/storm-stack/commit/b9b43fb))

### ❤️ Thank You

- Patrick Sullivan

## 1.16.2 (2024-02-09)

### 🚀 Features

- **tools-nx:** Initial check-in for Storm-Stack Nx Tools package
  ([556997b](https://github.com/storm-software/storm-stack/commit/556997b))

- **monorepo:** Major redesign of project structure
  ([20c7a8f](https://github.com/storm-software/storm-stack/commit/20c7a8f))

### 🩹 Fixes

- **monorepo:** Regenerate the monorepo's pnpm-lock file
  ([d7297d0](https://github.com/storm-software/storm-stack/commit/d7297d0))

- **monorepo:** Removed eslint updates
  ([d4d95c1](https://github.com/storm-software/storm-stack/commit/d4d95c1))

- **monorepo:** Readded the `noEmit` option to tsconfig
  ([b9b43fb](https://github.com/storm-software/storm-stack/commit/b9b43fb))

### ❤️ Thank You

- Patrick Sullivan

## 1.16.1 (2024-02-09)

### 🚀 Features

- **tools-nx:** Initial check-in for Storm-Stack Nx Tools package
  ([556997b](https://github.com/storm-software/storm-stack/commit/556997b))

- **monorepo:** Major redesign of project structure
  ([20c7a8f](https://github.com/storm-software/storm-stack/commit/20c7a8f))

### 🩹 Fixes

- **monorepo:** Regenerate the monorepo's pnpm-lock file
  ([d7297d0](https://github.com/storm-software/storm-stack/commit/d7297d0))

- **monorepo:** Removed eslint updates
  ([d4d95c1](https://github.com/storm-software/storm-stack/commit/d4d95c1))

- **monorepo:** Readded the `noEmit` option to tsconfig
  ([b9b43fb](https://github.com/storm-software/storm-stack/commit/b9b43fb))

### ❤️ Thank You

- Patrick Sullivan

## 1.16.0 (2024-02-09)

### 🚀 Features

- **tools-nx:** Initial check-in for Storm-Stack Nx Tools package
  ([556997b](https://github.com/storm-software/storm-stack/commit/556997b))

- **monorepo:** Major redesign of project structure
  ([20c7a8f](https://github.com/storm-software/storm-stack/commit/20c7a8f))

### 🩹 Fixes

- **monorepo:** Regenerate the monorepo's pnpm-lock file
  ([d7297d0](https://github.com/storm-software/storm-stack/commit/d7297d0))

- **monorepo:** Removed eslint updates
  ([d4d95c1](https://github.com/storm-software/storm-stack/commit/d4d95c1))

- **monorepo:** Readded the `noEmit` option to tsconfig
  ([b9b43fb](https://github.com/storm-software/storm-stack/commit/b9b43fb))

### ❤️ Thank You

- Patrick Sullivan

## 1.15.4 (2024-02-06)

### 🩹 Fixes

- **logging:** Clean up the stopwatch logging formatting
  ([90e544a](https://github.com/storm-software/storm-stack/commit/90e544a))

### ❤️ Thank You

- Patrick Sullivan

## 1.15.1 (2024-02-05)

### 🩹 Fixes

- **logging:** Resolved various formatting issues around logging output
  ([6837c64](https://github.com/storm-software/storm-stack/commit/6837c64))

### ❤️ Thank You

- Patrick Sullivan

## 1.15.0 (2024-02-05)

### 🚀 Features

- **logging:** Added `child` function to storm logger
  ([fc99c2d](https://github.com/storm-software/storm-stack/commit/fc99c2d))

### ❤️ Thank You

- Patrick Sullivan

## 1.14.4 (2024-01-29)

### 🩹 Fixes

- **utilities:** Reformat the README markdown files
  ([db95426](https://github.com/storm-software/storm-stack/commit/db95426))

### ❤️ Thank You

- Patrick Sullivan

## 1.14.3 (2024-01-29)

### 🩹 Fixes

- **monorepo:** Added the `nx-release-publish` target to each projects json
  configuration
  ([a22385a](https://github.com/storm-software/storm-stack/commit/a22385a))

### ❤️ Thank You

- Patrick Sullivan

## 1.14.0 (2024-01-24)

### 🚀 Features

- **plugin-system:** Added the `autoInstall` option to resolvers
  ([18c1841](https://github.com/storm-software/storm-stack/commit/18c1841))

### ❤️ Thank You

- Patrick Sullivan

## 1.13.7 (2024-01-24)

### 🩹 Fixes

- **plugin-system:** Added tsconfig file paths to resolver handler
  ([56ff717](https://github.com/storm-software/storm-stack/commit/56ff717))

### ❤️ Thank You

- Patrick Sullivan

## 1.13.3 (2024-01-21)

### 🩹 Fixes

- **monorepo:** Update the storm-ops workspace dependencies
  ([faadeb6](https://github.com/storm-software/storm-stack/commit/faadeb6))

### ❤️ Thank You

- Patrick Sullivan

## [1.13.2](https://github.com/storm-software/storm-stack/compare/date-time-v1.13.1...date-time-v1.13.2) (2024-01-21)

### Bug Fixes

- **plugin-system:** Resolved build issues
  ([e790271](https://github.com/storm-software/storm-stack/commit/e790271a9fa23375486a6f348e1cc1665a4a8361))

## [1.13.1](https://github.com/storm-software/storm-stack/compare/date-time-v1.13.0...date-time-v1.13.1) (2024-01-21)

### Bug Fixes

- **plugin-system:** Fix linting issues and dependabot warnings
  ([02e630c](https://github.com/storm-software/storm-stack/commit/02e630cc537e86897e48a3e3c3372b38aa673bb1))

# [1.13.0](https://github.com/storm-software/storm-stack/compare/date-time-v1.12.2...date-time-v1.13.0) (2024-01-21)

### Bug Fixes

- **monorepo:** Resolved issues with `extends` option in lefthook config
  ([e468b55](https://github.com/storm-software/storm-stack/commit/e468b55df5958b80fd6cf7707780e4461797c797))
- **unique-identifier:** Fixes for the plugin system errors
  ([e256acb](https://github.com/storm-software/storm-stack/commit/e256acb4069633b6e3d3f8239fa24edc5c992e1a))

### Features

- **plugin-system:** Upgraded Nx and enhanced the `PluginLoader` resolver
  ([aed9c64](https://github.com/storm-software/storm-stack/commit/aed9c64b53a408ce8b7f0d38052bdab4e3ce3072))

## [1.12.2](https://github.com/storm-software/storm-stack/compare/date-time-v1.12.1...date-time-v1.12.2) (2024-01-11)

### Bug Fixes

- **date-time:** Update private variables/methods naming strategy
  ([416305b](https://github.com/storm-software/storm-stack/commit/416305b81fd5d1ee564409013ef8f41bd5d8ad70))

## [1.12.1](https://github.com/storm-software/storm-stack/compare/date-time-v1.12.0...date-time-v1.12.1) (2024-01-10)

### Bug Fixes

- **plugin-system:** Resolved issue with `hooks` property on `PluginModule`
  ([931cf9d](https://github.com/storm-software/storm-stack/commit/931cf9d7ab79107706f47ae57263431b1153e468))

# [1.12.0](https://github.com/storm-software/storm-stack/compare/date-time-v1.11.0...date-time-v1.12.0) (2024-01-09)

### Bug Fixes

- **plugin-system:** Regenerate pnpm-lock file
  ([e0f91dd](https://github.com/storm-software/storm-stack/commit/e0f91dde43cd88626f37414e148145289f32b53c))

### Features

- **plugin-system:** Added a new package to support plugin-driven applications
  ([081bd2c](https://github.com/storm-software/storm-stack/commit/081bd2cff25f336a21128c4a989401e99e601d83))

# [1.11.0](https://github.com/storm-software/storm-stack/compare/date-time-v1.10.0...date-time-v1.11.0) (2024-01-07)

### Features

- **frontend-table:** Initial checkin of table data management package
  ([3742ec7](https://github.com/storm-software/storm-stack/commit/3742ec754eba4b62ca1a9f331a4843e20daaef32))

# [1.10.0](https://github.com/storm-software/storm-stack/compare/date-time-v1.9.1...date-time-v1.10.0) (2024-01-07)

### Features

- **utilities:** Added base `Factory` class and some update lodash function
  implementations
  ([cb3f844](https://github.com/storm-software/storm-stack/commit/cb3f844e839a00086d414ae746088e18a402e2a6))

## [1.9.1](https://github.com/storm-software/storm-stack/compare/date-time-v1.9.0...date-time-v1.9.1) (2024-01-06)

### Bug Fixes

- **serialization:** Resolved parser issues
  ([03af0df](https://github.com/storm-software/storm-stack/commit/03af0dff94041e7fa40c2852c32c1eb24399cc7b))

# [1.9.0](https://github.com/storm-software/storm-stack/compare/date-time-v1.8.0...date-time-v1.9.0) (2024-01-04)

### Features

- **serialization:** Update the serialization helpers to use singleton class
  ([326970f](https://github.com/storm-software/storm-stack/commit/326970f21be294c382d68b3395562b7d0ae6d8d7))

# [1.8.0](https://github.com/storm-software/storm-stack/compare/date-time-v1.7.2...date-time-v1.8.0) (2024-01-03)

### Features

- **utilities:** Added the `isEqual` utility function
  ([a2b77e9](https://github.com/storm-software/storm-stack/commit/a2b77e9252156657e031ab13338aeda916735fad))

## [1.7.2](https://github.com/storm-software/storm-stack/compare/date-time-v1.7.1...date-time-v1.7.2) (2024-01-02)

### Bug Fixes

- **jotai:** Resolved issue with `isAtom` type-checkers
  ([28ddcbe](https://github.com/storm-software/storm-stack/commit/28ddcbedcc36df5435402fdb8407c3c319a2bfbf))

## [1.7.1](https://github.com/storm-software/storm-stack/compare/date-time-v1.7.0...date-time-v1.7.1) (2024-01-02)

### Bug Fixes

- **utilities:** Resolved issue with `isSetObject` passing invalid types
  ([a6c1dcf](https://github.com/storm-software/storm-stack/commit/a6c1dcf8253e3058275f72152b80720aa2d5f0b6))

# [1.7.0](https://github.com/storm-software/storm-stack/compare/date-time-v1.6.1...date-time-v1.7.0) (2024-01-01)

### Features

- **logging:** Added WireIt scripts to the repository
  ([658bada](https://github.com/storm-software/storm-stack/commit/658badae819f6e0cba6f78cba0ff2dad961686be))

## [1.6.1](https://github.com/storm-software/storm-stack/compare/date-time-v1.6.0...date-time-v1.6.1) (2024-01-01)

### Bug Fixes

- **logging:** Resolved issues with creation of extra Pino transports
  ([cf88fc1](https://github.com/storm-software/storm-stack/commit/cf88fc19f6426660a9b6630603ce46e1c0d855bc))

# [1.6.0](https://github.com/storm-software/storm-stack/compare/date-time-v1.5.2...date-time-v1.6.0) (2023-12-28)

### Bug Fixes

- **jotai:** Regenerated pnpm lock file
  ([9c2fbf6](https://github.com/storm-software/storm-stack/commit/9c2fbf6939eb226ee6d5b92864e65b74f2ec33ff))

### Features

- **jotai:** Added `createAtomStore` functionality
  ([9031b61](https://github.com/storm-software/storm-stack/commit/9031b61d811724a5361c98bd6da1c375799cf612))

## [1.5.2](https://github.com/storm-software/storm-stack/compare/date-time-v1.5.1...date-time-v1.5.2) (2023-12-25)

### Bug Fixes

- **utilities:** Enhanced the logic in the `isObject` utility function
  ([0e27903](https://github.com/storm-software/storm-stack/commit/0e27903df21c14c350ceb3005187953736bf7580))

## [1.5.1](https://github.com/storm-software/storm-stack/compare/date-time-v1.5.0...date-time-v1.5.1) (2023-12-25)

### Bug Fixes

- **date-time:** Enhance the logic in the constructor to create instant variable
  ([567d1bf](https://github.com/storm-software/storm-stack/commit/567d1bf3515c23d00c1ce1f4f0f1bbf3618124f4))

# [1.5.0](https://github.com/storm-software/storm-stack/compare/date-time-v1.4.6...date-time-v1.5.0) (2023-12-24)

### Bug Fixes

- **monorepo:** Regenerate pnpm lock file
  ([17ce885](https://github.com/storm-software/storm-stack/commit/17ce885cf5e5241124628fec5ecd5378449c7a42))

### Features

- **docs-website:** Added initial code for documentation website
  ([6dbcaa7](https://github.com/storm-software/storm-stack/commit/6dbcaa76e2568dadf4454e630e7ad7fab2158bed))

## [1.4.6](https://github.com/storm-software/storm-stack/compare/date-time-v1.4.5...date-time-v1.4.6) (2023-12-23)

### Bug Fixes

- **logging:** Resolve issue in log file paths
  ([ae3ea95](https://github.com/storm-software/storm-stack/commit/ae3ea95cee37d0491086a3d3c93a697e87457d55))

## [1.4.5](https://github.com/storm-software/storm-stack/compare/date-time-v1.4.4...date-time-v1.4.5) (2023-12-23)

### Bug Fixes

- **logging:** Added `mkdir` option to create logging directory
  ([df62ea7](https://github.com/storm-software/storm-stack/commit/df62ea7bc9f541ba4d72fb10b4296b430086c433))

## [1.4.4](https://github.com/storm-software/storm-stack/compare/date-time-v1.4.3...date-time-v1.4.4) (2023-12-23)

### Bug Fixes

- **date-time:** Resolve issue with format date display
  ([fde4545](https://github.com/storm-software/storm-stack/commit/fde4545dd80e3b9f254de22ddf1d1d3e2dc00fe8))

## [1.4.3](https://github.com/storm-software/storm-stack/compare/date-time-v1.4.2...date-time-v1.4.3) (2023-12-23)

### Bug Fixes

- **date-time:** Resolved issues with temporal calendar
  ([5039d03](https://github.com/storm-software/storm-stack/commit/5039d03ed8a2b0fcc8ed93c56006cd956517afd8))

## [1.4.2](https://github.com/storm-software/storm-stack/compare/date-time-v1.4.1...date-time-v1.4.2) (2023-12-23)

### Bug Fixes

- **logging:** Added type check for undefined color config
  ([c58876c](https://github.com/storm-software/storm-stack/commit/c58876c4b8f8d16c2e27482f904e30f872cc8aaa))

## [1.4.1](https://github.com/storm-software/storm-stack/compare/date-time-v1.4.0...date-time-v1.4.1) (2023-12-23)

### Bug Fixes

- **logging:** Ensure errors are not thrown with missing config
  ([ade49ac](https://github.com/storm-software/storm-stack/commit/ade49acae4f2c203b571f8ef8dc8e6ef0ebb024f))

# [1.4.0](https://github.com/storm-software/storm-stack/compare/date-time-v1.3.4...date-time-v1.4.0) (2023-12-23)

### Bug Fixes

- **errors:** Resolved issue with error printing
  ([5205570](https://github.com/storm-software/storm-stack/commit/52055702bf4f8c7adb6bb8589a92e77c4016b425))

### Features

- **cli:** Added `title` option to CLI application config
  ([272deb0](https://github.com/storm-software/storm-stack/commit/272deb011ca6ce42a9fbac3711022bd72c0b1845))
- **errors:** Added `cause` to the error print out string
  ([2d3e72f](https://github.com/storm-software/storm-stack/commit/2d3e72f530756f9a834593c41423cc5e76b60755))
- **frontend-components:** Initial checkin of UI components library
  ([bd6a49b](https://github.com/storm-software/storm-stack/commit/bd6a49b0c75b7397cc7ed9f8e50c17e21aba17f3))

## [1.3.4](https://github.com/storm-software/storm-stack/compare/date-time-v1.3.3...date-time-v1.3.4) (2023-12-21)

### Bug Fixes

- **errors:** Resolve stack overflow error
  ([9416a1a](https://github.com/storm-software/storm-stack/commit/9416a1a148113afdd72c0ae39603b1377d3fef73))

## [1.3.3](https://github.com/storm-software/storm-stack/compare/date-time-v1.3.2...date-time-v1.3.3) (2023-12-18)

### Bug Fixes

- **date-time:** Resolved build issues
  ([bcf2dba](https://github.com/storm-software/storm-stack/commit/bcf2dbaa21dff4c2a752a75245baad3eeb3c185d))

## [1.3.2](https://github.com/storm-software/storm-stack/compare/date-time-v1.3.1...date-time-v1.3.2) (2023-12-18)

### Bug Fixes

- **date-time:** Resolved issue with circular references in data-time package
  ([1836e0f](https://github.com/storm-software/storm-stack/commit/1836e0fcb2b07165baa4a2e280a353d863bdb7e1))
- **utilities:** Update storm build tools
  ([1909eaa](https://github.com/storm-software/storm-stack/commit/1909eaabb206cceab19ae7ab7103ed75047cf6db))

## [1.3.1](https://github.com/storm-software/storm-stack/compare/date-time-v1.3.0...date-time-v1.3.1) (2023-12-17)

### Bug Fixes

- **date-time:** Upgrade to latest version of storm-ops
  ([e09478d](https://github.com/storm-software/storm-stack/commit/e09478da0e62fe34f3ab339448043c4b7293bd73))

# [1.3.0](https://github.com/storm-software/storm-stack/compare/date-time-v1.2.12...date-time-v1.3.0) (2023-12-17)

### Features

- **jotai:** Added `atomWithWebStorage` and `atomWithBroadcast` atom creators
  ([4124c6c](https://github.com/storm-software/storm-stack/commit/4124c6c76dd932491e1e043ee5e7759467b48e2e))
- **jotai:** Added `jotai` extension package
  ([03aa93d](https://github.com/storm-software/storm-stack/commit/03aa93d9bcd4b8d576deb1f210994a9c231d5388))

## [1.2.12](https://github.com/storm-software/storm-stack/compare/date-time-v1.2.11...date-time-v1.2.12) (2023-12-17)

### Bug Fixes

- **date-time:** Resolved issue with references in constructors
  ([8bae7b0](https://github.com/storm-software/storm-stack/commit/8bae7b002e144f06b3b24a008712045da17d25d6))
- **date-time:** Upgrade monorepo storm dependencies
  ([214ecb1](https://github.com/storm-software/storm-stack/commit/214ecb1e3227faac1371242fc3581c22467fae1a))
- **utilities:** Upgrade the storm-ops packages to latest
  ([b031630](https://github.com/storm-software/storm-stack/commit/b031630f68ef02d72b64c050553d9db06842b47e))

## [1.2.11](https://github.com/storm-software/storm-stack/compare/date-time-v1.2.10...date-time-v1.2.11) (2023-12-15)

### Bug Fixes

- **utilities:** Fixed the library import paths
  ([0edfed0](https://github.com/storm-software/storm-stack/commit/0edfed0de50250eb450de950ceec6218d22e4460))

## [1.2.10](https://github.com/storm-software/storm-stack/compare/date-time-v1.2.9...date-time-v1.2.10) (2023-12-15)

### Bug Fixes

- **utilities:** Upgraded build utilities
  ([f0b9bbf](https://github.com/storm-software/storm-stack/commit/f0b9bbf215aa2967b84bd2b5e7c35f4b6f967092))

## [1.2.9](https://github.com/storm-software/storm-stack/compare/date-time-v1.2.8...date-time-v1.2.9) (2023-12-14)

### Bug Fixes

- **utilities:** Upgrade build package to resolve nested paths on non-windows
  systems
  ([7c31ed4](https://github.com/storm-software/storm-stack/commit/7c31ed49491e799843f2262a15642388bf1badbd))

## [1.2.8](https://github.com/storm-software/storm-stack/compare/date-time-v1.2.7...date-time-v1.2.8) (2023-12-14)

### Bug Fixes

- **cli:** Regenerated the pnpm-lock file
  ([aebd07b](https://github.com/storm-software/storm-stack/commit/aebd07b9b14806b757095a8b520b058d89e30e13))
- **file-system:** Resolved build issues
  ([8c83d7d](https://github.com/storm-software/storm-stack/commit/8c83d7d0b484d9655ca5144c1b900a68a391bd81))

## [1.2.7](https://github.com/storm-software/storm-stack/compare/date-time-v1.2.6...date-time-v1.2.7) (2023-12-12)

### Bug Fixes

- **utilities:** Update the build executor version
  ([b44cb26](https://github.com/storm-software/storm-stack/commit/b44cb26480a760c1fdb1db6e3811e07703efc179))

## [1.2.6](https://github.com/storm-software/storm-stack/compare/date-time-v1.2.5...date-time-v1.2.6) (2023-12-12)

### Bug Fixes

- **cli:** Upgrade packages to use `implicitDependencies` for references
  ([8c8f670](https://github.com/storm-software/storm-stack/commit/8c8f6706f2b4b29991fdd4c6fb5501360835dfcd))

## [1.2.5](https://github.com/storm-software/storm-stack/compare/date-time-v1.2.4...date-time-v1.2.5) (2023-12-12)

### Bug Fixes

- **monorepo:** Regenerate the pnpm-lock file
  ([dec47e4](https://github.com/storm-software/storm-stack/commit/dec47e45a0bd0dc396fa1324da0eb26db455cab1))
- **monorepo:** Resolve inter-repo dependencies issues
  ([750b10a](https://github.com/storm-software/storm-stack/commit/750b10a820adeead631e32d2e0d9a9660a0d7660))
- **serialization:** Marked the `name` parameter of the `Serializable` decorator
  as required
  ([9f458e4](https://github.com/storm-software/storm-stack/commit/9f458e43028643998da4d27ba9aaa6cf35e8b79e))

## [1.2.4](https://github.com/storm-software/storm-stack/compare/date-time-v1.2.3...date-time-v1.2.4) (2023-12-12)

### Bug Fixes

- **date-time:** Resolved issue with setting name field in decorator
  ([6ec9f78](https://github.com/storm-software/storm-stack/commit/6ec9f78230d52195258b666afdbcd2c82dc8adf0))

## [1.2.3](https://github.com/storm-software/storm-stack/compare/date-time-v1.2.2...date-time-v1.2.3) (2023-12-11)

### Bug Fixes

- **cli:** Resolved issues with `cli` package build
  ([3a0c051](https://github.com/storm-software/storm-stack/commit/3a0c0512c35f4ab8189fb97e4224f76b1f2141f8))
- **logging:** Update logging to resolve type build issue
  ([4d1c25b](https://github.com/storm-software/storm-stack/commit/4d1c25babe3cfe7336857eaf8ce55c9a613fb6fa))
- **monorepo:** Resolved pnpm-lock for monorepo
  ([83d3ac5](https://github.com/storm-software/storm-stack/commit/83d3ac5416ae82724dedf04af10d68b4fad3dcee))

## [1.2.2](https://github.com/storm-software/storm-stack/compare/date-time-v1.2.1...date-time-v1.2.2) (2023-12-11)

### Bug Fixes

- **deps:** pin dependencies
  ([#2](https://github.com/storm-software/storm-stack/issues/2))
  ([07d6782](https://github.com/storm-software/storm-stack/commit/07d6782c3ca03e071a72c249a1d5e377405919bb))
- **deps:** update patch prod dependencies
  ([#6](https://github.com/storm-software/storm-stack/issues/6))
  ([01d9585](https://github.com/storm-software/storm-stack/commit/01d95856f77270d9bd7f0b5e3558df38b27b482e))

## [1.2.1](https://github.com/storm-software/storm-stack/compare/date-time-v1.2.0...date-time-v1.2.1) (2023-12-09)

### Bug Fixes

- **file-system:** Resolved issue with bad file imports
  ([716b412](https://github.com/storm-software/storm-stack/commit/716b412c192e42ef4c45a95e0e5acd73cae913e6))
- **monorepo:** Regenerated the pnpm-lock file
  ([d9c4beb](https://github.com/storm-software/storm-stack/commit/d9c4beb728cc14768676f99b89394c93c50bf7fb))

# [1.2.0](https://github.com/storm-software/storm-stack/compare/date-time-v1.1.2...date-time-v1.2.0) (2023-12-09)

### Bug Fixes

- **monorepo:** Regenerated the pnpm-lock file
  ([d64b250](https://github.com/storm-software/storm-stack/commit/d64b2504201a323b6424d5e4ce61e1ec9b2d6f51))

### Features

- **cli:** Added the `cli` package
  ([6312c04](https://github.com/storm-software/storm-stack/commit/6312c0491c20c2cc1d8f0d610ac217a614a87c80))

## [1.1.2](https://github.com/storm-software/storm-stack/compare/date-time-v1.1.1...date-time-v1.1.2) (2023-12-09)

### Bug Fixes

- **monorepo:** Regenerate pnpm-lock file
  ([76454e5](https://github.com/storm-software/storm-stack/commit/76454e5b7dc30e6d5be84c891bdd2297a0da4b2d))
- **unique-identifier:** Updated `hash` method to accept string or object args
  ([3a94db4](https://github.com/storm-software/storm-stack/commit/3a94db4b49653554cce65a3d6d9ac7b317b39904))

## [1.1.1](https://github.com/storm-software/storm-stack/compare/date-time-v1.1.0...date-time-v1.1.1) (2023-12-07)

### Bug Fixes

- **errors:** Resolved issue with package.json properties
  ([54ce205](https://github.com/storm-software/storm-stack/commit/54ce2055e69954b9b3b9dd882292587840cc1b57))

# [1.1.0](https://github.com/storm-software/storm-stack/compare/date-time-v1.0.0...date-time-v1.1.0) (2023-12-06)

### Bug Fixes

- **monorepo:** Regenerated the pnpm-lock file
  ([6b20acb](https://github.com/storm-software/storm-stack/commit/6b20acb321f784ea31a1a731592c1e3426d14be1))

### Features

- **file-system:** Added a new package to support manipulation of files and
  package management
  ([dc2b9d9](https://github.com/storm-software/storm-stack/commit/dc2b9d9c492428bdaf47fb2d3b3bd2056805db99))

# [1.0.0](https://github.com/storm-software/storm-stack/compare/...date-time-v1.0.0) (2023-12-05)

### Bug Fixes

- **serialization:** Converted the decorators to use older metadata style
  ([4723313](https://github.com/storm-software/storm-stack/commit/47233139584144daf9138fcdbdd3a84fd254a41e))
- **storm-stack:** Generate new pnpm lockfile
  ([51ab3aa](https://github.com/storm-software/storm-stack/commit/51ab3aad425bf4db3fe5b310d3e7f5b8e2fc87f5))
- **storm-stack:** Upgrade dependency versions
  ([ca3ad39](https://github.com/storm-software/storm-stack/commit/ca3ad398813b0f972ab8296c7011b78e164c4e3b))

### Features

- **config:** Added config library to support loading user workspace options
  ([489284a](https://github.com/storm-software/storm-stack/commit/489284a3d48ca49a344f8c770afeb48d3f19d5e0))
- **config:** Read values from env variables in runtime packages
  ([48d6bc4](https://github.com/storm-software/storm-stack/commit/48d6bc4b3a2333b197896830a309d957bf9483bc))
- **date-time:** Added date-time validation and format functions
  ([c6f23ec](https://github.com/storm-software/storm-stack/commit/c6f23ecb578f351e604122d4d34eae04da6a30e0))
- **date-time:** Added StormDate and StormTime class definitions
  ([c069cda](https://github.com/storm-software/storm-stack/commit/c069cdae54c92b41931c5748ea4ab4bc8e0d2bf1))
- **date-time:** Added the Storm Date Time package
  ([7799c2b](https://github.com/storm-software/storm-stack/commit/7799c2bd173815fa75177f1d741a4c9ff7a0dad8))
- **errors:** Added the Storm errors package
  ([7f380be](https://github.com/storm-software/storm-stack/commit/7f380be412c2aaf9dc91ce2ac5867ffb2e16618d))
- **logging:** Added Storm logging package
  ([e860b60](https://github.com/storm-software/storm-stack/commit/e860b604b5c4538500ce5f6edb1d15b133c669ef))
- **logging:** Added Storm logging package
  ([435748f](https://github.com/storm-software/storm-stack/commit/435748f94085c1e36f33e27fd54c873b157af58b))
- **monorepo:** Update build executors used by packages
  ([325b837](https://github.com/storm-software/storm-stack/commit/325b8374ca906ef7ee889725542176127cdff94d))
- **nx:** Added `nx` package for running workspace processes
  ([24aa541](https://github.com/storm-software/storm-stack/commit/24aa541f687fdf8f7cccd1d4c73d14c056699322))
- **serialization:** Added initial code for serialization library
  ([92ab31d](https://github.com/storm-software/storm-stack/commit/92ab31d354c2bebd4457e02113f2bb07491edf23))
- **serialization:** Added serialization to Storm date-time and error classes
  ([3185ac7](https://github.com/storm-software/storm-stack/commit/3185ac771b1e9dca894d85d389d6e38587f480ec))
- **storm-stack:** Initial commit of monorepo
  ([46e8af4](https://github.com/storm-software/storm-stack/commit/46e8af4fa232a3830b4a4c7f0970e176fddd085c))
- **unique-identifier:** Initial checkin of the unique identifier package
  ([e1c56f2](https://github.com/storm-software/storm-stack/commit/e1c56f20db284349bfdbf6b4c3a9bdfe3a0249ab))
- **utilities:** Initial checkin of base utilities package
  ([3c056fa](https://github.com/storm-software/storm-stack/commit/3c056fac74e504dd78741cc61a4ef2bb4b25d40b))
