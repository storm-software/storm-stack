![Storm Software's logo banner](https://public.storm-cdn.com/brand-banner.png)

# Changelog for Storm Stack - Types

## [0.19.1](https://github.com/storm-software/storm-stack/releases/tag/types%400.19.1) (2025-09-08)

### Bug Fixes

- **core:** Resolve issue with type imports
  ([61d9c59c](https://github.com/storm-software/storm-stack/commit/61d9c59c))

## [0.19.0](https://github.com/storm-software/storm-stack/releases/tag/types%400.19.0) (2025-09-04)

### Features

- **plugin-react:** Added React plugin to assist in client application
  development
  ([81f25ed7](https://github.com/storm-software/storm-stack/commit/81f25ed7))
- **core:** Update type declarations, engine, and plugins to support many
  different build tools
  ([9b5bb774](https://github.com/storm-software/storm-stack/commit/9b5bb774))

## [0.18.0](https://github.com/storm-software/storm-stack/releases/tag/types%400.18.0) (2025-08-30)

### Features

- **types:** Added the `browser` types for use in client packages
  ([de6b8390](https://github.com/storm-software/storm-stack/commit/de6b8390))

## [0.17.0](https://github.com/storm-software/storm-stack/releases/tag/types%400.17.0) (2025-08-29)

### Features

- **core:** Bundle `deepkit` packages into separate exports
  ([7caead22](https://github.com/storm-software/storm-stack/commit/7caead22))

## [0.16.1](https://github.com/storm-software/storm-stack/releases/tag/types%400.16.1) (2025-08-24)

### Bug Fixes

- **core:** Resolve issue with applying default values
  ([84814d40](https://github.com/storm-software/storm-stack/commit/84814d40))

### Miscellaneous

- **monorepo:** Update README markdown files
  ([4384b109](https://github.com/storm-software/storm-stack/commit/4384b109))

## [0.16.0](https://github.com/storm-software/storm-stack/releases/tag/types%400.16.0) (2025-08-19)

### Features

- **core:** Update context to use runtime configuration values
  ([1026697d](https://github.com/storm-software/storm-stack/commit/1026697d))

## [0.15.0](https://github.com/storm-software/storm-stack/releases/tag/types%400.15.0) (2025-08-17)

### Features

- **core:** Reorganized plugin packages and added runtime dynamic configuration
  ([c6d97d9f](https://github.com/storm-software/storm-stack/commit/c6d97d9f))
- **core:** Major update to allow virtual output and plugin structure
  ([c9b6252d](https://github.com/storm-software/storm-stack/commit/c9b6252d))

### Miscellaneous

- **core:** Renamed `storm:config` module to `storm:dotenv` so the former can be
  used later
  ([649345d9](https://github.com/storm-software/storm-stack/commit/649345d9))
- **types:** Updates to the format of the `date` and `env` modules
  ([672b717f](https://github.com/storm-software/storm-stack/commit/672b717f))

![Storm Software](https://public.storm-cdn.com/brand-banner.png)

# Changelog for Storm Stack - Types

## [0.14.2](https://github.com/storm-software/storm-stack/releases/tag/types%400.14.2) (2025-06-27)

### Bug Fixes

- **monorepo:** Resolve issue with Deepkit package patch versions
  ([f9da4723](https://github.com/storm-software/storm-stack/commit/f9da4723))

## [0.14.1](https://github.com/storm-software/storm-stack/releases/tag/types%400.14.1) (2025-06-23)

### Source Code Improvements

- **plugin-cli:** Update name from `preset-cli` to `plugin-cli`
  ([841adc9d](https://github.com/storm-software/storm-stack/commit/841adc9d))

## [0.14.0](https://github.com/storm-software/storm-stack/releases/tag/types%400.14.0) (2025-06-23)

### Features

- **plugin-cli:** Added logic to persist command reflections to data directory
  ([d96999c6](https://github.com/storm-software/storm-stack/commit/d96999c6))

## [0.13.0](https://github.com/storm-software/storm-stack/releases/tag/types%400.13.0) (2025-06-17)

### Features

- **monorepo:** Upgrade TypeScript to v5.9.0 dev release
- **core:** Added Cap’n Proto buffer persistence of TypeScript compiler
  reflection data

### Source Code Improvements

- **core:** Rename `vars` to `config` in project references

## [0.12.0](https://github.com/storm-software/storm-stack/releases/tag/types%400.12.0) (2025-06-08)

### Features

- **eslint-config-storm-stack:** Added Storm Stack `eslint-plugin-tsdoc`
  configuration

## [0.11.0](https://github.com/storm-software/storm-stack/releases/tag/types%400.11.0) (2025-06-07)

### Features

- **core:** Added `domain`, `permission`, and `readonly` tags to Deepkit patches

## [0.10.0](https://github.com/storm-software/storm-stack/releases/tag/types%400.10.0) (2025-06-07)

### Features

- **core:** Added automated generation of runtime type declarations

## [0.9.0](https://github.com/storm-software/storm-stack/releases/tag/types%400.9.0) (2025-06-04)

### Features

- **core:** Improved TypeScript compiler processing

## [0.8.0](https://github.com/storm-software/storm-stack/releases/tag/types%400.8.0) (2025-05-28)

### Features

- **core:** Patched the `deepkit` package to include the `tags` reflection for
  TSDoc
- **core:** Added the `error-lookup` and `commit-config` workers

## [0.7.0](https://github.com/storm-software/storm-stack/releases/tag/types%400.7.0) (2025-05-27)

### Features

- **plugin-cli:** Removed dependencies from generated package and implemented
  banner and footer

## [0.6.0](https://github.com/storm-software/storm-stack/releases/tag/types%400.6.0) (2025-05-22)

### Features

- **plugin-cli:** Added interactive prompts and env arguments to generated
  source code

## [0.5.0](https://github.com/storm-software/storm-stack/releases/tag/types%400.5.0) (2025-05-13)

### Features

- **monorepo:** Major updates to structure of core engine processing

## [0.4.3](https://github.com/storm-software/storm-stack/releases/tag/types%400.4.3) (2025-05-06)

### Miscellaneous

- **types:** Skip caching during sub-tasks
  ([53fad3e8](https://github.com/storm-software/storm-stack/commit/53fad3e8))

## [0.4.2](https://github.com/storm-software/storm-stack/releases/tag/types%400.4.2) (2025-05-05)

### Bug Fixes

- **types:** Resolved issues with invalid `dependsOn` property
  ([6b72e19e](https://github.com/storm-software/storm-stack/commit/6b72e19e))

## [0.4.1](https://github.com/storm-software/storm-stack/releases/tag/types%400.4.1) (2025-05-05)

### Miscellaneous

- **monorepo:** Update the package versions
  ([a8444cf2](https://github.com/storm-software/storm-stack/commit/a8444cf2))

## [0.4.0](https://github.com/storm-software/storm-stack/releases/tag/types%400.4.0) (2025-05-01)

### Features

- **core:** Added `onPreTransform` and `onPostTransform` compiler options
  ([b0dbd5c8](https://github.com/storm-software/storm-stack/commit/b0dbd5c8))

## [0.3.3](https://github.com/storm-software/storm-stack/releases/tag/types%400.3.3) (2025-04-29)

### Miscellaneous

- **monorepo:** Update banners on source files
  ([49367b8e](https://github.com/storm-software/storm-stack/commit/49367b8e))

## [0.3.2](https://github.com/storm-software/storm-stack/releases/tag/types%400.3.2) (2025-04-25)

### Miscellaneous

- **monorepo:** Clean up the workspace package linking
  ([a046139f](https://github.com/storm-software/storm-stack/commit/a046139f))

## [0.3.1](https://github.com/storm-software/storm-stack/releases/tag/types%400.3.1) (2025-04-25)

### Miscellaneous

- **monorepo:** Update workspace configuration to use pnpm for publish
  ([c9fd85a0](https://github.com/storm-software/storm-stack/commit/c9fd85a0))

## [0.1.0](https://github.com/storm-software/storm-stack/releases/tag/types%400.1.0) (2025-04-23)

### Features

- **core:** Added `deepkit` type reflection to builds
  ([c25871c0](https://github.com/storm-software/storm-stack/commit/c25871c0))
- **types:** Initial check-in of the shared types package
  ([7d351dda](https://github.com/storm-software/storm-stack/commit/7d351dda))
