![Storm Software's logo banner](https://public.storm-cdn.com/brand-banner.png)

# Changelog for Storm Stack - Plugin Date

## [0.1.0](https://github.com/storm-software/storm-stack/releases/tag/plugin-date%400.1.0) (2025-08-17)

### Features

- **core:** Reorganized plugin packages and added runtime dynamic configuration
  ([c6d97d9f](https://github.com/storm-software/storm-stack/commit/c6d97d9f))
- **core:** Added the `plugins` node to context to share plugin configurations
  ([21fc43ed](https://github.com/storm-software/storm-stack/commit/21fc43ed))
- **plugin-date:** Initial check-in of the Date plugin package
  ([96ef9620](https://github.com/storm-software/storm-stack/commit/96ef9620))

### Bug Fixes

- **monorepo:** Resolve issue with monorepo build script
  ([4d38825b](https://github.com/storm-software/storm-stack/commit/4d38825b))

### Miscellaneous

- **core:** Renamed `storm:config` module to `storm:dotenv` so the former can be
  used later
  ([649345d9](https://github.com/storm-software/storm-stack/commit/649345d9))
- **plugin-date:** Ensure export names align in date utility modules
  ([c8732ea2](https://github.com/storm-software/storm-stack/commit/c8732ea2))

### Updated Dependencies

- Updated devkit to 0.10.0
- Updated core to 0.34.0
- Updated nx to 0.15.0
