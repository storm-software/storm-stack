![Storm Software](https://public.storm-cdn.com/brand-banner.png)

# Changelog for Storm Stack - Core

## [0.32.0](https://github.com/storm-software/storm-stack/releases/tag/core%400.32.0) (2025-06-26)

### Features

- **core:** Improvements to the configuration types and processing logic
  ([09b2edf1](https://github.com/storm-software/storm-stack/commit/09b2edf1))

### Bug Fixes

- **core:** Resolved issue with `base` exports in `package.json` file
  ([1e7b7bf2](https://github.com/storm-software/storm-stack/commit/1e7b7bf2))

## [0.31.1](https://github.com/storm-software/storm-stack/releases/tag/core%400.31.1) (2025-06-23)

### Source Code Improvements

- **core:** Remove references to removed `Preset` plugin types
  ([02ede5c1](https://github.com/storm-software/storm-stack/commit/02ede5c1))
- **core:** Reduce the usage of the `Options` type parameter
  ([ba02dc99](https://github.com/storm-software/storm-stack/commit/ba02dc99))

### Updated Dependencies

- Updated types to 0.14.1

## [0.31.0](https://github.com/storm-software/storm-stack/releases/tag/core%400.31.0) (2025-06-23)

### Features

- **plugin-cli:** Added logic to persist command reflections to data directory
  ([d96999c6](https://github.com/storm-software/storm-stack/commit/d96999c6))

### Updated Dependencies

- Updated types to 0.14.0

## [0.30.0](https://github.com/storm-software/storm-stack/releases/tag/core%400.30.0) (2025-06-20)

### Features

- **plugin-cli:** Update the `author` configuration option to align with
  `OrganizationConfig` from `storm-workspace.json` file
  ([76e9d211](https://github.com/storm-software/storm-stack/commit/76e9d211))

## [0.29.1](https://github.com/storm-software/storm-stack/releases/tag/core%400.29.1) (2025-06-18)

### Miscellaneous

- **monorepo:** Update workspace's `storm-ops` dependencies
  ([d37bc369](https://github.com/storm-software/storm-stack/commit/d37bc369))

## [0.29.0](https://github.com/storm-software/storm-stack/releases/tag/core%400.29.0) (2025-06-17)

### Features

- **monorepo:** Upgrade TypeScript to v5.9.0 dev release
- **core:** Added Cap’n Proto buffer persistence of TypeScript compiler
  reflection data

### Bug Fixes

- **core:** Resolve issue with missing dotenv values during build process
- **core:** Added missing `@stryke/capnp` dependency
- **core:** Resolved issue applying unused dotenv properties to `StormConfig`
  type

### Source Code Improvements

- **core:** Rename `vars` to `config` in project references

### Updated Dependencies

- Updated types to 0.13.0

## [0.28.0](https://github.com/storm-software/storm-stack/releases/tag/core%400.28.0) (2025-06-08)

### Features

- **eslint-config-storm-stack:** Added Storm Stack `eslint-plugin-tsdoc`
  configuration

### Bug Fixes

- **core:** Resolve issue with existing reflection files

### Source Code Improvements

- **eslint-plugin:** Shorten ESLint package's project names in monorepo

### Updated Dependencies

- Updated types to 0.12.0

## [0.27.1](https://github.com/storm-software/storm-stack/releases/tag/core%400.27.1) (2025-06-08)

### Miscellaneous

- **monorepo:** Update workspace package dependencies

## [0.27.0](https://github.com/storm-software/storm-stack/releases/tag/core%400.27.0) (2025-06-07)

### Features

- **core:** Added `domain`, `permission`, and `readonly` tags to Deepkit patches

### Updated Dependencies

- Updated types to 0.11.0

## [0.26.0](https://github.com/storm-software/storm-stack/releases/tag/core%400.26.0) (2025-06-07)

### Features

- **core:** Added automated generation of runtime type declarations

### Updated Dependencies

- Updated types to 0.10.0

## [0.25.0](https://github.com/storm-software/storm-stack/releases/tag/core%400.25.0) (2025-06-04)

### Features

- **core:** Improved TypeScript compiler processing

### Miscellaneous

- **monorepo:** Upgrade base Storm Software workspace packages

### Updated Dependencies

- Updated types to 0.9.0

## [0.24.0](https://github.com/storm-software/storm-stack/releases/tag/core%400.24.0) (2025-05-28)

### Features

- **core:** Patched the `deepkit` package to include the `tags` reflection for
  TSDoc
- **core:** Added the `error-lookup` and `commit-config` workers
- **core:** Added the `new` command to generate new projects

### Updated Dependencies

- Updated types to 0.8.0

## [0.23.0](https://github.com/storm-software/storm-stack/releases/tag/core%400.23.0) (2025-05-27)

### Features

- **plugin-cli:** Removed dependencies from generated package and implemented
  banner and footer

### Updated Dependencies

- Updated types to 0.7.0

## [0.22.1](https://github.com/storm-software/storm-stack/releases/tag/core%400.22.1) (2025-05-25)

### Bug Fixes

- **core:** Resolved issue with invalid runtime imports in output

## [0.22.0](https://github.com/storm-software/storm-stack/releases/tag/core%400.22.0) (2025-05-25)

### Features

- **plugin-cli:** Update output to dynamically import child commands

## [0.21.0](https://github.com/storm-software/storm-stack/releases/tag/core%400.21.0) (2025-05-24)

### Features

- **core:** Minimize required external depdendencies

## [0.20.0](https://github.com/storm-software/storm-stack/releases/tag/core%400.20.0) (2025-05-23)

### Features

- **cli:** Added the banner and footer to shared runtime module

## [0.19.0](https://github.com/storm-software/storm-stack/releases/tag/core%400.19.0) (2025-05-23)

### Features

- **plugin-cli:** Added Variable Management commands generation and positional
  args

## [0.18.0](https://github.com/storm-software/storm-stack/releases/tag/core%400.18.0) (2025-05-22)

### Features

- **plugin-cli:** Added interactive prompts and env arguments to generated
  source code
- **cli:** Initial check-in of the CLI application

### Updated Dependencies

- Updated types to 0.6.0

## [0.17.0](https://github.com/storm-software/storm-stack/releases/tag/core%400.17.0) (2025-05-13)

### Features

- **core:** Enhanced the `storage` runtime module to support plugins
- **plugin-log-storage:** Added `useFileSystem` and `storageId` options

### Miscellaneous

- **monorepo:** Update workspace package links

## [0.16.0](https://github.com/storm-software/storm-stack/releases/tag/core%400.16.0) (2025-05-13)

### Features

- **monorepo:** Major updates to structure of core engine processing
- **plugin-typedoc:** Update typedoc functionality to be separate plugin

### Updated Dependencies

- Updated types to 0.5.0

## [0.15.1](https://github.com/storm-software/storm-stack/releases/tag/core%400.15.1) (2025-05-08)

### Miscellaneous

- **core:** Enable typedoc generation in `docs` function

## [0.15.0](https://github.com/storm-software/storm-stack/releases/tag/core%400.15.0) (2025-05-08)

### Features

- **core:** Add reference documentation generator
- **typedoc:** Added the Storm Stack typedoc plugin

### Bug Fixes

- **typedoc:** Resolve typing issues with typedoc package

## [0.14.5](https://github.com/storm-software/storm-stack/releases/tag/core%400.14.5) (2025-05-06)

### Miscellaneous

- **monorepo:** Updates to linking and devenv configuration
  ([c175decb](https://github.com/storm-software/storm-stack/commit/c175decb))

## [0.14.4](https://github.com/storm-software/storm-stack/releases/tag/core%400.14.4) (2025-05-06)

### Miscellaneous

- **monorepo:** Rerun the `update-pnpm-link` script
  ([ed3c509d](https://github.com/storm-software/storm-stack/commit/ed3c509d))

## [0.14.3](https://github.com/storm-software/storm-stack/releases/tag/core%400.14.3) (2025-05-05)

### Miscellaneous

- **monorepo:** Update workspace package linking
  ([be6585be](https://github.com/storm-software/storm-stack/commit/be6585be))

## [0.14.2](https://github.com/storm-software/storm-stack/releases/tag/core%400.14.2) (2025-05-05)

### Miscellaneous

- **monorepo:** update auto-merge non-major dependencies
  ([#166](https://github.com/storm-software/storm-stack/pull/166))

## [0.14.1](https://github.com/storm-software/storm-stack/releases/tag/core%400.14.1) (2025-05-01)

### Bug Fixes

- **core:** Resolve issue with incorrectly excluding `process.env` variables
  ([21a227df](https://github.com/storm-software/storm-stack/commit/21a227df))
- **core:** Resolve issue reading variables persistence
  ([80aa7047](https://github.com/storm-software/storm-stack/commit/80aa7047))

## [0.14.0](https://github.com/storm-software/storm-stack/releases/tag/core%400.14.0) (2025-05-01)

### Features

- **plugin-cli:** Added .env logic for CLI arguments
  ([cf281d99](https://github.com/storm-software/storm-stack/commit/cf281d99))

## [0.13.1](https://github.com/storm-software/storm-stack/releases/tag/core%400.13.1) (2025-05-01)

### Miscellaneous

- **monorepo:** update auto-merge non-major dependencies
  ([#165](https://github.com/storm-software/storm-stack/pull/165))

## [0.13.0](https://github.com/storm-software/storm-stack/releases/tag/core%400.13.0) (2025-05-01)

### Features

- **nx:** Added additional executor options to Nx plugin
  ([6ae7cc23](https://github.com/storm-software/storm-stack/commit/6ae7cc23))

## [0.12.1](https://github.com/storm-software/storm-stack/releases/tag/core%400.12.1) (2025-05-01)

### Bug Fixes

- **plugin-cli:** Resolve issue writting output directory
  ([bae1fefc](https://github.com/storm-software/storm-stack/commit/bae1fefc))

## [0.12.0](https://github.com/storm-software/storm-stack/releases/tag/core%400.12.0) (2025-05-01)

### Features

- **core:** Added `onPreTransform` and `onPostTransform` compiler options
  ([b0dbd5c8](https://github.com/storm-software/storm-stack/commit/b0dbd5c8))

### Updated Dependencies

- Updated types to 0.4.0

## [0.11.0](https://github.com/storm-software/storm-stack/releases/tag/core%400.11.0) (2025-04-30)

### Features

- **plugin-node:** Complete tsup build integration
  ([6d5a3a3c](https://github.com/storm-software/storm-stack/commit/6d5a3a3c))

## [0.10.0](https://github.com/storm-software/storm-stack/releases/tag/core%400.10.0) (2025-04-29)

### Features

- **core:** Update NodeJs package to use tsup for builds
  ([f714c254](https://github.com/storm-software/storm-stack/commit/f714c254))

### Miscellaneous

- **monorepo:** Update banners on source files
  ([49367b8e](https://github.com/storm-software/storm-stack/commit/49367b8e))

### Updated Dependencies

- Updated types to 0.3.3

## [0.9.4](https://github.com/storm-software/storm-stack/releases/tag/core%400.9.4) (2025-04-28)

### Miscellaneous

- **monorepo:** update auto-merge non-major dependencies
  ([#164](https://github.com/storm-software/storm-stack/pull/164))

## [0.9.3](https://github.com/storm-software/storm-stack/releases/tag/core%400.9.3) (2025-04-28)

### Miscellaneous

- **monorepo:** Upgrade workspace package dependencies
  ([2af8f02f](https://github.com/storm-software/storm-stack/commit/2af8f02f))

## [0.9.2](https://github.com/storm-software/storm-stack/releases/tag/core%400.9.2) (2025-04-25)

### Miscellaneous

- **monorepo:** Clean up the workspace package linking
  ([a046139f](https://github.com/storm-software/storm-stack/commit/a046139f))

### Updated Dependencies

- Updated types to 0.3.2

## [0.9.1](https://github.com/storm-software/storm-stack/releases/tag/core%400.9.1) (2025-04-25)

### Miscellaneous

- **monorepo:** Update workspace configuration to use pnpm for publish
  ([c9fd85a0](https://github.com/storm-software/storm-stack/commit/c9fd85a0))

### Updated Dependencies

- Updated types to 0.3.1

## [0.9.0](https://github.com/storm-software/storm-stack/releases/tag/core%400.9.0) (2025-04-25)

### Updated Dependencies

- Updated types to 0.3.0

## [0.8.0](https://github.com/storm-software/storm-stack/releases/tag/core%400.8.0) (2025-04-25)

### Features

- **plugin-cli:** Added support for the `options` argument type
  ([eef96e81](https://github.com/storm-software/storm-stack/commit/eef96e81))

## [0.7.0](https://github.com/storm-software/storm-stack/releases/tag/core%400.7.0) (2025-04-25)

### Updated Dependencies

- Updated types to 0.2.0

## [0.6.0](https://github.com/storm-software/storm-stack/releases/tag/core%400.6.0) (2025-04-23)

### Features

- **core:** Added `deepkit` type reflection to builds
  ([c25871c0](https://github.com/storm-software/storm-stack/commit/c25871c0))

### Updated Dependencies

- Updated types to 0.1.0

## [0.5.0](https://github.com/storm-software/storm-stack/releases/tag/core%400.5.0) (2025-04-18)

### Features

- **core:** Patch `@deepkit/type-compiler` to read from JSDoc comments
  ([7a12e757](https://github.com/storm-software/storm-stack/commit/7a12e757))

## [0.4.3](https://github.com/storm-software/storm-stack/releases/tag/core%400.4.3) (2025-04-15)

### Miscellaneous

- **core:** Remove the `config.json` file during preparation
  ([70f51ab8](https://github.com/storm-software/storm-stack/commit/70f51ab8))
- **monorepo:** Format monorepo source code
  ([3383a1a5](https://github.com/storm-software/storm-stack/commit/3383a1a5))

## [0.4.2](https://github.com/storm-software/storm-stack/releases/tag/core%400.4.2) (2025-04-14)

### Miscellaneous

- **monorepo:** Format monorepo source code
  ([3383a1a5](https://github.com/storm-software/storm-stack/commit/3383a1a5))

## [0.4.1](https://github.com/storm-software/storm-stack/releases/tag/core%400.4.1) (2025-04-13)

### Miscellaneous

- **monorepo:** update auto-merge non-major dependencies
  ([#102](https://github.com/storm-software/storm-stack/pull/102))

## [0.4.0](https://github.com/storm-software/storm-stack/releases/tag/core%400.4.0) (2025-04-13)

### Features

- **monorepo:** Added `devenv` to repository
  ([f442b14f](https://github.com/storm-software/storm-stack/commit/f442b14f))
- **nx:** Added the `lint` and `docs` executors
  ([13f40e06](https://github.com/storm-software/storm-stack/commit/13f40e06))
- **core:** Completed transform error compiler functionality
  ([0599c3fc](https://github.com/storm-software/storm-stack/commit/0599c3fc))

### Bug Fixes

- **core:** Resolve Typescript compilation issue
  ([48d6cd7e](https://github.com/storm-software/storm-stack/commit/48d6cd7e))
- **core:** Resolve issues with entry file generation
  ([4aad7536](https://github.com/storm-software/storm-stack/commit/4aad7536))

### Miscellaneous

- **core:** Added exception logging to env file writter
  ([62797eda](https://github.com/storm-software/storm-stack/commit/62797eda))
- **core:** Reduce the amount of noise in trace logs
  ([7ab51069](https://github.com/storm-software/storm-stack/commit/7ab51069))
- **monorepo:** Format repository markdown files
  ([b0643179](https://github.com/storm-software/storm-stack/commit/b0643179))
- **monorepo:** Update the Storm CDN url in image links
  ([22cb22d7](https://github.com/storm-software/storm-stack/commit/22cb22d7))

## [0.3.0](https://github.com/storm-software/storm-stack/releases/tag/core%400.3.0) (2025-04-07)

### Features

- **plugin-http:** Initial check-in of the `http` plugiun
  ([7bc84ed6](https://github.com/storm-software/storm-stack/commit/7bc84ed6))

## [0.2.0](https://github.com/storm-software/storm-stack/releases/tag/core%400.2.0) (2025-04-07)

### Features

- **core:** Rename core package to `core`
  ([22c9b4e3](https://github.com/storm-software/storm-stack/commit/22c9b4e3))

### Bug Fixes

- **monorepo:** Resolve issues with renaming core package
  ([14f0a577](https://github.com/storm-software/storm-stack/commit/14f0a577))

## [0.1.1](https://github.com/storm-software/storm-stack/releases/tag/storm-stack%400.1.1) (2025-04-07)

### Miscellaneous

- **monorepo:** Reformat monorepo files
  ([d36d9489](https://github.com/storm-software/storm-stack/commit/d36d9489))
