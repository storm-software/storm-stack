![Storm Software's logo banner](https://public.storm-cdn.com/brand-banner.png)

# Changelog for Storm Stack - Plugin Node

## [0.19.1](https://github.com/storm-software/storm-stack/releases/tag/plugin-node%400.19.1) (2025-09-05)

### Miscellaneous

- **monorepo:** Update workspace package links
  ([4c77735d](https://github.com/storm-software/storm-stack/commit/4c77735d))

### Updated Dependencies

- Updated devkit to 0.14.1
- Updated core to 0.39.0
- Updated nx to 0.19.1

## [0.19.0](https://github.com/storm-software/storm-stack/releases/tag/plugin-node%400.19.0) (2025-09-05)

### Features

- **core:** Split out `deepkit` exports into self-contained runtime build
  ([0a0ae40c](https://github.com/storm-software/storm-stack/commit/0a0ae40c))

### Updated Dependencies

- Updated devkit to 0.14.0
- Updated core to 0.38.0
- Updated nx to 0.19.0

## [0.18.0](https://github.com/storm-software/storm-stack/releases/tag/plugin-node%400.18.0) (2025-09-04)

### Features

- **plugin-config:** Consolidated the configuration parameter functionality into
  one plugin
  ([30e512e8](https://github.com/storm-software/storm-stack/commit/30e512e8))
- **core:** Update type declarations, engine, and plugins to support many
  different build tools
  ([9b5bb774](https://github.com/storm-software/storm-stack/commit/9b5bb774))

### Updated Dependencies

- Updated devkit to 0.13.0
- Updated types to 0.19.0
- Updated core to 0.37.0
- Updated nx to 0.18.0

## [0.17.0](https://github.com/storm-software/storm-stack/releases/tag/plugin-node%400.17.0) (2025-08-30)

### Features

- **core:** Renamed the `StormResult` definition to `StormResponse`
  ([4a17c22d](https://github.com/storm-software/storm-stack/commit/4a17c22d))

### Miscellaneous

- **monorepo:** Update workspace package links
  ([3a786529](https://github.com/storm-software/storm-stack/commit/3a786529))

### Updated Dependencies

- Updated devkit to 0.12.1
- Updated types to 0.18.0
- Updated core to 0.36.1
- Updated nx to 0.17.1

## [0.16.0](https://github.com/storm-software/storm-stack/releases/tag/plugin-node%400.16.0) (2025-08-29)

### Features

- **core:** Added the ability to explicitly specify required dependency versions
  in plugins
  ([a66d894b](https://github.com/storm-software/storm-stack/commit/a66d894b))
- **core:** Update plugin packages to include an optional `plugin` export
  ([f52f0bc0](https://github.com/storm-software/storm-stack/commit/f52f0bc0))
- **core:** Bundle `deepkit` packages into separate exports
  ([7caead22](https://github.com/storm-software/storm-stack/commit/7caead22))

### Miscellaneous

- **monorepo:** Consolidate duplicate build config to shared tools package
  ([faa5c167](https://github.com/storm-software/storm-stack/commit/faa5c167))

### Updated Dependencies

- Updated devkit to 0.12.0
- Updated types to 0.17.0
- Updated core to 0.36.0
- Updated nx to 0.17.0

## [0.15.1](https://github.com/storm-software/storm-stack/releases/tag/plugin-node%400.15.1) (2025-08-24)

### Bug Fixes

- **core:** Resolve issue with applying default values
  ([84814d40](https://github.com/storm-software/storm-stack/commit/84814d40))

### Miscellaneous

- **monorepo:** Update README markdown files
  ([4384b109](https://github.com/storm-software/storm-stack/commit/4384b109))

### Updated Dependencies

- Updated devkit to 0.11.1
- Updated core to 0.35.1
- Updated nx to 0.16.1

## [0.15.0](https://github.com/storm-software/storm-stack/releases/tag/plugin-node%400.15.0) (2025-08-19)

### Features

- **core:** Update context to use runtime configuration values
  ([1026697d](https://github.com/storm-software/storm-stack/commit/1026697d))

### Updated Dependencies

- Updated devkit to 0.11.0
- Updated core to 0.35.0
- Updated nx to 0.16.0

## [0.14.0](https://github.com/storm-software/storm-stack/releases/tag/plugin-node%400.14.0) (2025-08-17)

### Features

- **core:** Reorganized plugin packages and added runtime dynamic configuration
  ([c6d97d9f](https://github.com/storm-software/storm-stack/commit/c6d97d9f))
- **core:** Added the `plugins` node to context to share plugin configurations
  ([21fc43ed](https://github.com/storm-software/storm-stack/commit/21fc43ed))
- **core:** Major update to allow virtual output and plugin structure
  ([c9b6252d](https://github.com/storm-software/storm-stack/commit/c9b6252d))

### Miscellaneous

- **core:** Renamed `storm:config` module to `storm:dotenv` so the former can be
  used later
  ([649345d9](https://github.com/storm-software/storm-stack/commit/649345d9))
- **types:** Updates to the format of the `date` and `env` modules
  ([672b717f](https://github.com/storm-software/storm-stack/commit/672b717f))

### Updated Dependencies

- Updated devkit to 0.10.0
- Updated core to 0.34.0
- Updated nx to 0.15.0
