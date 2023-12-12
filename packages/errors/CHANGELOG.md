## [1.2.4](https://github.com/storm-software/storm-stack/compare/errors-v1.2.3...errors-v1.2.4) (2023-12-12)


### Bug Fixes

* **date-time:** Resolved issue with setting name field in decorator ([6ec9f78](https://github.com/storm-software/storm-stack/commit/6ec9f78230d52195258b666afdbcd2c82dc8adf0))

## [1.2.3](https://github.com/storm-software/storm-stack/compare/errors-v1.2.2...errors-v1.2.3) (2023-12-11)

### Bug Fixes

- **cli:** Resolved issues with `cli` package build ([3a0c051](https://github.com/storm-software/storm-stack/commit/3a0c0512c35f4ab8189fb97e4224f76b1f2141f8))
- **logging:** Update logging to resolve type build issue ([4d1c25b](https://github.com/storm-software/storm-stack/commit/4d1c25babe3cfe7336857eaf8ce55c9a613fb6fa))
- **monorepo:** Resolved pnpm-lock for monorepo ([83d3ac5](https://github.com/storm-software/storm-stack/commit/83d3ac5416ae82724dedf04af10d68b4fad3dcee))

## [1.2.2](https://github.com/storm-software/storm-stack/compare/errors-v1.2.1...errors-v1.2.2) (2023-12-11)

### Bug Fixes

- **deps:** pin dependencies ([#2](https://github.com/storm-software/storm-stack/issues/2)) ([07d6782](https://github.com/storm-software/storm-stack/commit/07d6782c3ca03e071a72c249a1d5e377405919bb))
- **deps:** update patch prod dependencies ([#6](https://github.com/storm-software/storm-stack/issues/6)) ([01d9585](https://github.com/storm-software/storm-stack/commit/01d95856f77270d9bd7f0b5e3558df38b27b482e))

## [1.2.1](https://github.com/storm-software/storm-stack/compare/errors-v1.2.0...errors-v1.2.1) (2023-12-09)

### Bug Fixes

- **file-system:** Resolved issue with bad file imports ([716b412](https://github.com/storm-software/storm-stack/commit/716b412c192e42ef4c45a95e0e5acd73cae913e6))
- **monorepo:** Regenerated the pnpm-lock file ([d9c4beb](https://github.com/storm-software/storm-stack/commit/d9c4beb728cc14768676f99b89394c93c50bf7fb))

# [1.2.0](https://github.com/storm-software/storm-stack/compare/errors-v1.1.2...errors-v1.2.0) (2023-12-09)

### Bug Fixes

- **monorepo:** Regenerated the pnpm-lock file ([d64b250](https://github.com/storm-software/storm-stack/commit/d64b2504201a323b6424d5e4ce61e1ec9b2d6f51))

### Features

- **cli:** Added the `cli` package ([6312c04](https://github.com/storm-software/storm-stack/commit/6312c0491c20c2cc1d8f0d610ac217a614a87c80))

## [1.1.2](https://github.com/storm-software/storm-stack/compare/errors-v1.1.1...errors-v1.1.2) (2023-12-09)

### Bug Fixes

- **monorepo:** Regenerate pnpm-lock file ([76454e5](https://github.com/storm-software/storm-stack/commit/76454e5b7dc30e6d5be84c891bdd2297a0da4b2d))
- **unique-identifier:** Updated `hash` method to accept string or object args ([3a94db4](https://github.com/storm-software/storm-stack/commit/3a94db4b49653554cce65a3d6d9ac7b317b39904))

## [1.1.1](https://github.com/storm-software/storm-stack/compare/errors-v1.1.0...errors-v1.1.1) (2023-12-07)

### Bug Fixes

- **errors:** Resolved issue with package.json properties ([54ce205](https://github.com/storm-software/storm-stack/commit/54ce2055e69954b9b3b9dd882292587840cc1b57))

# [1.1.0](https://github.com/storm-software/storm-stack/compare/errors-v1.0.0...errors-v1.1.0) (2023-12-06)

### Bug Fixes

- **monorepo:** Regenerated the pnpm-lock file ([6b20acb](https://github.com/storm-software/storm-stack/commit/6b20acb321f784ea31a1a731592c1e3426d14be1))

### Features

- **file-system:** Added a new package to support manipulation of files and package management ([dc2b9d9](https://github.com/storm-software/storm-stack/commit/dc2b9d9c492428bdaf47fb2d3b3bd2056805db99))

# [1.0.0](https://github.com/storm-software/storm-stack/compare/...errors-v1.0.0) (2023-12-05)

### Bug Fixes

- **serialization:** Converted the decorators to use older metadata style ([4723313](https://github.com/storm-software/storm-stack/commit/47233139584144daf9138fcdbdd3a84fd254a41e))
- **storm-stack:** Generate new pnpm lockfile ([51ab3aa](https://github.com/storm-software/storm-stack/commit/51ab3aad425bf4db3fe5b310d3e7f5b8e2fc87f5))
- **storm-stack:** Upgrade dependency versions ([ca3ad39](https://github.com/storm-software/storm-stack/commit/ca3ad398813b0f972ab8296c7011b78e164c4e3b))

### Features

- **config:** Added config library to support loading user workspace options ([489284a](https://github.com/storm-software/storm-stack/commit/489284a3d48ca49a344f8c770afeb48d3f19d5e0))
- **config:** Read values from env variables in runtime packages ([48d6bc4](https://github.com/storm-software/storm-stack/commit/48d6bc4b3a2333b197896830a309d957bf9483bc))
- **date-time:** Added the Storm Date Time package ([7799c2b](https://github.com/storm-software/storm-stack/commit/7799c2bd173815fa75177f1d741a4c9ff7a0dad8))
- **errors:** Added the Storm errors package ([7f380be](https://github.com/storm-software/storm-stack/commit/7f380be412c2aaf9dc91ce2ac5867ffb2e16618d))
- **logging:** Added Storm logging package ([e860b60](https://github.com/storm-software/storm-stack/commit/e860b604b5c4538500ce5f6edb1d15b133c669ef))
- **logging:** Added Storm logging package ([435748f](https://github.com/storm-software/storm-stack/commit/435748f94085c1e36f33e27fd54c873b157af58b))
- **monorepo:** Update build executors used by packages ([325b837](https://github.com/storm-software/storm-stack/commit/325b8374ca906ef7ee889725542176127cdff94d))
- **nx:** Added `nx` package for running workspace processes ([24aa541](https://github.com/storm-software/storm-stack/commit/24aa541f687fdf8f7cccd1d4c73d14c056699322))
- **serialization:** Added initial code for serialization library ([92ab31d](https://github.com/storm-software/storm-stack/commit/92ab31d354c2bebd4457e02113f2bb07491edf23))
- **serialization:** Added serialization to Storm date-time and error classes ([3185ac7](https://github.com/storm-software/storm-stack/commit/3185ac771b1e9dca894d85d389d6e38587f480ec))
- **storm-stack:** Initial commit of monorepo ([46e8af4](https://github.com/storm-software/storm-stack/commit/46e8af4fa232a3830b4a4c7f0970e176fddd085c))
- **unique-identifier:** Initial checkin of the unique identifier package ([e1c56f2](https://github.com/storm-software/storm-stack/commit/e1c56f20db284349bfdbf6b4c3a9bdfe3a0249ab))
- **utilities:** Initial checkin of base utilities package ([3c056fa](https://github.com/storm-software/storm-stack/commit/3c056fac74e504dd78741cc61a4ef2bb4b25d40b))
