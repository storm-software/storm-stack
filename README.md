<div align="center"><img src="https://public.storm-cdn.com/storm-banner.gif" width="100%" alt="Storm Stack" /></div>

<br />
<div align="center">
<b>
<a href="https://stormsoftware.com" target="_blank">Website</a>  •
<a href="https://github.com/storm-software/storm-stack" target="_blank">GitHub</a>  •
<a href="https://discord.gg/MQ6YVzakM5">Discord</a>  •  <a href="https://stormstack.github.io/stormstack/" target="_blank">Docs</a>  •  <a href="https://stormsoftware.com/contact" target="_blank">Contact</a>  •
<a href="https://github.com/storm-software/stack/issues/new?assignees=&labels=bug&template=bug-report.yml&title=Bug Report%3A+">Report a Bug</a>
</b>
</div>

<br />

At a high-level, **⚡ Storm Stack** is a toolchain system that generates code and other artifacts during the build and deploy processes via TypeScript transformers and static code analysis. Many modern code generation tools require you to explicitly define the structure and behavior of your code in separate schema files and/or configurations, which can be time-consuming and error-prone. Some tools even require you to learn a new SDL or write boilerplate code to wire everything together. **Storm Stack does not require any extra work - you just write your code the way you normally would, and Storm Stack does the rest**.

**The goal is to allow the developer to focus on the actual application/business logic, rather than the specifics around technologies, frameworks, or cloud providers.** This is achieved by using a set of powerful tools and extensible plugins that are designed to work together.

Storm Stack is largely built on top of [Deepkit](https://deepkit.io/), so our projects benefit from access to very small bytecode type definitions at runtime. **This means you have builtin serialization, deserialization, or validation logic without writing any additional code (with greatly improved performance and reduced bundle sizes when compared to popular packages like Zod, Yup, class-validator, and Valibot)**.

The Storm Stack monorepo contains the [Storm Stack engine](https://www.npmjs.com/package/@storm-stack/core) package and various plugins and tools to help developers using the toolchain. More details can be found below in the [Features](#features) section.

<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->

> [!NOTE] 
> Some features of Storm Stack are opinionated to meet the needs of [Storm Software](https://stormsoftware.com); however, it should be simple to customize the behavior to fit any specific requirements you may have. If you believe any plugins include logic that should be split out into separate packages, please feel free to submit a pull request or open an issue, and we will be happy to discuss it.

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<h3 align="center">💻 Visit <a href="https://stormsoftware.com" target="_blank">stormsoftware.com</a> to stay up to date with this developer</h3>

<br />

[![github](https://img.shields.io/github/package-json/v/storm-software/storm-stack?style=for-the-badge&color=1fb2a6)](https://github.com/storm-software/storm-stack)&nbsp;[![Nx](https://img.shields.io/badge/Nx-17.0.2-lightgrey?style=for-the-badge&logo=nx&logoWidth=20&&color=1fb2a6)](http://nx.dev/)&nbsp;[![NextJs](https://img.shields.io/badge/Next.js-14.0.2-lightgrey?style=for-the-badge&logo=nextdotjs&logoWidth=20&color=1fb2a6)](https://nextjs.org/)&nbsp;[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=for-the-badge&logo=commitlint&color=1fb2a6)](http://commitizen.github.io/cz-cli/)&nbsp;![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg?style=for-the-badge&color=1fb2a6)&nbsp;![documented with docusaurus](https://img.shields.io/badge/documented_with-docusaurus-success.svg?style=for-the-badge&logo=readthedocs&color=1fb2a6)&nbsp;![GitHub Workflow Status (with event)](https://img.shields.io/github/actions/workflow/status/storm-software/storm-stack/cr.yml?style=for-the-badge&logo=github-actions&color=1fb2a6)

<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->

> [!IMPORTANT] 
> This repository, and the apps, libraries, and tools contained within, is still in it's initial development phase. As a result, bugs and issues are expected with it's usage. When the main development phase completes, a proper release will be performed, the packages will be available through NPM (and other distributions), and this message will be removed. However, in the meantime, please feel free to report any issues you may come across.

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- START doctoc -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
## Table of Contents

- [Features](#features)
  - [Engine](#engine)
    - [@storm-stack/core](#storm-stackcore)
    - [@storm-stack/cli](#storm-stackcli)
  - [Plugins](#plugins)
    - [@storm-stack/plugin-config](#storm-stackplugin-config)
    - [@storm-stack/plugin-date](#storm-stackplugin-date)
    - [@storm-stack/plugin-node](#storm-stackplugin-node)
    - [@storm-stack/plugin-cloudflare-worker](#storm-stackplugin-cloudflare-worker)
    - [@storm-stack/plugin-cli](#storm-stackplugin-cli)
    - [@storm-stack/plugin-log-console](#storm-stackplugin-log-console)
    - [@storm-stack/plugin-log-sentry](#storm-stackplugin-log-sentry)
    - [@storm-stack/plugin-log-otel](#storm-stackplugin-log-otel)
    - [@storm-stack/plugin-log-storage](#storm-stackplugin-log-storage)
  - [Development Tools](#development-tools)
    - [@storm-stack/devkit](#storm-stackdevkit)
    - [@storm-stack/nx](#storm-stacknx)
    - [@storm-stack/eslint-plugin](#storm-stackeslint-plugin)
    - [@storm-stack/eslint-config](#storm-stackeslint-config)
    - [@storm-stack/biome](#storm-stackbiome)
    - [@storm-stack/tsdoc](#storm-stacktsdoc)
- [Environment Configuration Help](#environment-configuration-help)
- [Local Development](#local-development)
  - [Build](#build)
  - [Development Server](#development-server)
- [Testing](#testing)
  - [Running Unit Tests](#running-unit-tests)
  - [Running End-to-End Tests](#running-end-to-end-tests)
  - [Understand your workspace](#understand-your-workspace)
- [☁ Nx Cloud](#-nx-cloud)
  - [Distributed Computation Caching & Distributed Task Execution](#distributed-computation-caching--distributed-task-execution)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
  - [Pull Requests](#pull-requests)
  - [Contributor License Agreement (CLA)](#contributor-license-agreement-cla)
  - [Bug Reports](#bug-reports)
- [Support](#support)
- [License](#license)
- [Contributors](#contributors)

<!-- END doctoc -->

<br />

# Features

The core functionality of Storm Stack is built around the concept of a "stack" of tools and services that work together seamlessly. This includes everything from code generation and transformation to deployment and monitoring.

The following sections outline some of the features/publishable content included in this repository.

## Engine

The _Storm Stack Engine_ is an actual class that drives the Storm Stack pipeline's commands; however, the phrase is also often used to describe the base packages containing the core architecture (primarily the [@storm-stack/core](https://www.npmjs.com/package/@storm-stack/core) and [@storm-stack/cli](https://www.npmjs.com/package/@storm-stack/cli) packages).

### [@storm-stack/core](https://www.npmjs.com/package/@storm-stack/core)

The [@storm-stack/core](https://www.npmjs.com/package/@storm-stack/core) package
includes the Storm Stack engine - used to drive the Storm Stack pipeline's commands.

The following features are included in the package:

- The `Engine` class - responsible for orchestrating the various stages of the Storm Stack pipeline. This can be used as a sort of API for driving the processes from an external tool or service.
- Extensible architecture that allows for easy integration of new tools and services.
- Utilities and helpers for working with the Storm Stack ecosystem.
- Various build plugins (supported by [unplugin](https://github.com/unjs/unplugin)) that allow you to benefit from Storm Stack's features, such as code generation, transformation, and deployment, while using an external build system.

Some of the supported build systems with existing plugins are:

- [Vite](https://vitejs.dev/)
- [ESBuild](https://esbuild.github.io/)
- [Webpack](https://webpack.js.org/)
- [Rollup](https://rollupjs.org/)

### [@storm-stack/cli](https://www.npmjs.com/package/@storm-stack/cli)

This package provides a binary to interact with the Storm Stack engine via a [command-line interface](https://en.wikipedia.org/wiki/Command-line_interface).

The following features are included in the package:

- Inclusion of required commands and options for Storm Stack development.
- Utilities for managing local project dependencies and scripts.
- Integration with the Storm Stack ecosystem for seamless project management.

## Plugins

The following Storm Stack plugin packages are included in this repository:

### [@storm-stack/plugin-config](https://www.npmjs.com/package/@storm-stack/plugin-config)

A plugin to generate TypeScript definitions, apply static parameter values, and encourage best practices for managing configuration in Storm Stack applications.

The plugin provides a set of utilities for working with configuration files, including:

- TypeScript definition generation for configuration schemas.
- `$storm.config.<parameter>` object is used to apply static configuration parameter values at build time with automatic type generation for improved type safety.
- Logic to determine all used configuration parameters so that they can be validated and documented later.
- Best practice recommendations for organizing and managing configuration.
- The `storm:config` builtin runtime module, which contains the `StormConfig` type definition and related utilities for working with configuration parameters at runtime.

### [@storm-stack/plugin-date](https://www.npmjs.com/package/@storm-stack/plugin-date)

A plugin package that injects a consistent interface into the application for working with dates across some popular JavaScript libraries, such as `date-fns`, `dayjs`, `luxon`, and `moment.js`. **Never feel the pressure to choose a date library again!**

This plugin was inspired by (and largely lifted from) [date-io](https://github.com/dmtrKovalenko/date-io), which provides a similar interface for date manipulation. The key difference is that this plugin will inject the date manipulation logic into the application at build time, rather than at runtime, allowing for more consistent and performant code.

Huge thanks to [dmtrKovalenko](https://github.com/dmtrKovalenko) for their work on date-io.

### [@storm-stack/plugin-node](https://www.npmjs.com/package/@storm-stack/plugin-node)

A plugin to provide a set of utilities and best practices for building Node.js applications with Storm Stack.

The following features are included in the package:

- The `$storm` context object, which provides access to various utilities and services at runtime.
- The `storm:context` builtin runtime module, which contains the `StormContext` type definition, the `useStorm` hook to access the context (if using the `$storm` object feels uncomfortable), and other related utilities.
- The `storm:env` builtin runtime module, which can be imported directly to access information about the runtime environment.
- The `storm:request` builtin runtime module, which contains the `StormRequest` class to package information about the incoming request.
- The `storm:response` builtin runtime module, which contains the `StormResponse` class to package information about the outgoing response.
- The `storm:event` builtin runtime module, which contains the `StormEvent` class to package information about events that occur in the application.

### [@storm-stack/plugin-cloudflare-worker](https://www.npmjs.com/package/@storm-stack/plugin-cloudflare-worker)

A plugin that provides utilities and best practices for building Cloudflare Worker applications with Storm Stack. Key features include:

The following features are included in the package:

- The `$storm` context object for accessing runtime utilities and services.
- Built-in modules for environment, request, result, and event handling tailored for Cloudflare Workers.
- Preset configuration for seamless deployment to the Cloudflare platform.

### [@storm-stack/plugin-cli](https://www.npmjs.com/package/@storm-stack/plugin-cli)

A plugin for creating command-line applications using Storm Stack.

The following features are included in the package:

- CLI scaffolding and context management via the `$storm` object.
- Utilities for parsing arguments, handling input/output, and managing CLI commands.
- Built-in modules for environment and event handling in CLI contexts.

### [@storm-stack/plugin-log-console](https://www.npmjs.com/package/@storm-stack/plugin-log-console)

Provides logging functionality for Storm Stack applications by writing log messages to the console.

The following features are included in the package:

- Console-based log adapter for development and debugging.
- Integration with the Storm Stack logging system for consistent log formatting.

### [@storm-stack/plugin-log-sentry](https://www.npmjs.com/package/@storm-stack/plugin-log-sentry)

Enables logging to [Sentry](https://sentry.io) for error tracking and monitoring.

The following features are included in the package:

- Sentry log adapter for capturing errors and events.
- Configuration options for Sentry DSN and environment.

### [@storm-stack/plugin-log-otel](https://www.npmjs.com/package/@storm-stack/plugin-log-otel)

Provides logging to [OpenTelemetry](https://opentelemetry.io/) collectors for distributed tracing and monitoring.

The following features are included in the package:

- OpenTelemetry log adapter for exporting traces and metrics.
- Integration with Storm Stack's logging and event system.

### [@storm-stack/plugin-log-storage](https://www.npmjs.com/package/@storm-stack/plugin-log-storage)

Allows log messages to be written to a specified storage type (e.g., file system, cloud storage).

The following features are included in the package:

- Storage log adapter for persistent log management.
- Configurable storage backends and retention policies.

## Development Tools

The following packages are included in this repository to assist with the
development/repository management process and are available for use in any
application.

### [@storm-stack/devkit](https://www.npmjs.com/package/@storm-stack/devkit)

A set of base plugins, shared templates, and helpful utilities for extending Storm Stack.

The following features are included in the package:

- Multiple base plugins for common functionality that could be extended or customized in a personal plugin to meet your specific needs.
- Shared template files for generating boilerplate code.

### [@storm-stack/nx](https://www.npmjs.com/package/@storm-stack/nx)

An [Nx](https://nx.dev/) plugin to manage monorepos using Storm Stack for building and deploying applications.

The following features are included in the package:

- Nx generators and executors tailored for Storm Stack workflows.
- Enhanced project graph visualization and dependency management.

### [@storm-stack/eslint-plugin](https://www.npmjs.com/package/@storm-stack/eslint-plugin)

An [ESLint](https://eslint.org/) plugin to enforce code quality and best practices in Storm Stack projects.

The following features are included in the package:

- Custom ESLint rules for Storm Stack conventions.
- Integration with shared configuration for consistency across packages.

### [@storm-stack/eslint-config](https://www.npmjs.com/package/@storm-stack/eslint-config)

A shared [ESLint](https://eslint.org/) configuration for Storm Stack repositories.

The following features are included in the package:

- Predefined rulesets for JavaScript/TypeScript projects.
- Easy integration with ESLint for consistent code style.

### [@storm-stack/biome](https://www.npmjs.com/package/@storm-stack/biome)

A shared [Biome](https://biomejs.dev/) configuration for Storm Stack projects.

The following features are included in the package:

- Pre-configured Biome settings for formatting and linting.
- Inclusion of required globals and rules for Storm Stack development.

### [@storm-stack/tsdoc](https://www.npmjs.com/package/@storm-stack/tsdoc)

A shared [TSDoc](https://tsdoc.org/) configuration for Storm Stack projects.

The following features are included in the package:

- Pre-configured TSDoc settings for consistent documentation.
- Inclusion of required tags and rules for Storm Stack development.

<br />
<div align="center">
<b><a href="https://github.com/storm-software/storm-stack" target="_blank">Be sure to ⭐ this repository on GitHub so you can keep up to date on any daily progress!</a>
</b>
</div>

<br />
<div align="right">[ <a href="#table-of-contents">Back to top ▲</a> ]</div>
<br />

# Environment Configuration Help

If you run into any issues while trying to run any of the monorepo's code
locally, please reach out to us on [Discord](https://discord.gg/MQ6YVzakM5). See
the [Support](#support) section for more information.

<div align="right">[ <a href="#table-of-contents">Back to top ▲</a> ]</div>
<br />

# Local Development

Once the code is pulled locally, open a command prompt and run `pnpm install` in
the root repo directory (/storm-stack).

More information can be found in the
[Open System documentation](https://storm-software.github.io/storm-stack/docs/getting-started/installation).

<div align="right">[ <a href="#table-of-contents">Back to top ▲</a> ]</div>
<br />

## Build

Run `pnpm build` to build the project. The build artifacts will be stored in the
`dist/` directory. Use the `--prod` flag for a production build.

<div align="right">[ <a href="#table-of-contents">Back to top ▲</a> ]</div>
<br />

## Development Server

Run `pnpm serve` for a dev server. Navigate to <http://localhost:4200/>. The app
will automatically reload if you change any of the source files.

<div align="right">[ <a href="#table-of-contents">Back to top ▲</a> ]</div>
<br />

# Testing

Open System uses [Jest](https://jestjs.io/) for unit testing and
[Cypress](https://www.cypress.io/) for end-to-end testing.

<div align="right">[ <a href="#table-of-contents">Back to top ▲</a> ]</div>
<br />

## Running Unit Tests

Run `pnpm test` to execute the unit tests via [Jest](https://jestjs.io).

Run `pnpm affected:test` to execute the unit tests affected by a change.

<div align="right">[ <a href="#table-of-contents">Back to top ▲</a> ]</div>
<br />

## Running End-to-End Tests

Run `pnpm e2e` to execute the end-to-end tests via
[Cypress](https://www.cypress.io).

Run `pnpm affected:e2e` to execute the end-to-end tests affected by a change.

<div align="right">[ <a href="#table-of-contents">Back to top ▲</a> ]</div>
<br />

## Understand your workspace

Run `pnpm graph` to see a diagram of the dependencies of the Open System
projects.

<div align="right">[ <a href="#table-of-contents">Back to top ▲</a> ]</div>
<br />

# ☁ Nx Cloud

Nx caches the output of any previously run command such as testing and building,
so it can replay the cached results instead of rerunning it. Nx Cloud allows you
to share the computation cache across everyone in your team and CI.

<div align="center">
<img src="https://pub-4661138852db4e5da99a6660fbf9b633.r2.dev/Nx Cloud - Dashboard.png" width="100%" alt="Nx Cloud - Dashboard" />
</div>

<div align="right">[ <a href="#table-of-contents">Back to top ▲</a> ]</div>
<br />

## Distributed Computation Caching & Distributed Task Execution

Nx Cloud pairs with Nx in order to enable you to build and test code more
rapidly, by up to 10 times. Even teams that are new to Nx can connect to Nx
Cloud and start saving time instantly.

Teams using Nx gain the advantage of building full-stack applications with their
preferred framework alongside Nx’s advanced code generation and project
dependency graph, plus a unified experience for both frontend and backend
developers.

Visit [Nx Cloud](https://nx.app/) to learn more.

<div align="right">[ <a href="#table-of-contents">Back to top ▲</a> ]</div>
<br />

# Roadmap

See the [open issues](https://github.com/storm-software/storm-stack/issues) for
a list of proposed features (and known issues).

- [Top Feature Requests](https://github.com/storm-software/storm-stack/issues?q=label%3Aenhancement+is%3Aopen+sort%3Areactions-%2B1-desc)
  (Add your votes using the 👍 reaction)
- [Top Bugs](https://github.com/storm-software/storm-stack/issues?q=is%3Aissue+is%3Aopen+label%3Abug+sort%3Areactions-%2B1-desc)
  (Add your votes using the 👍 reaction)
- [Newest Bugs](https://github.com/storm-software/storm-stack/issues?q=is%3Aopen+is%3Aissue+label%3Abug)

<div align="right">[ <a href="#table-of-contents">Back to top ▲</a> ]</div>
<br />

# Contributing

First off, thanks for taking the time to contribute! Contributions are what
makes the open-source community such an amazing place to learn, inspire, and
create. Any contributions you make will benefit everybody else and are **greatly
appreciated**.

Please read through the [contributing guidelines](.github/CONTRIBUTING.md) so you know what
to expect in terms of development and code style. We also have a
[Code of Conduct](.github/CODE_OF_CONDUCT.md) that we expect all contributors to
adhere to. Please read it before contributing.

<div align="right">[ <a href="#table-of-contents">Back to top ▲</a> ]</div>
<br />

## Pull Requests

Before you submit a pull request (PR), please ensure all [lefthook](https://lefthook.dev/) hooks pass. These hooks will run automatically when you commit your changes.

<div align="right">[ <a href="#table-of-contents">Back to top ▲</a> ]</div>
<br />

## Contributor License Agreement (CLA)

If you have **not** yet signed the Contributor License Agreement (CLA), add a PR comment containing the exact text:

```text
I have read the CLA Document and I hereby sign the CLA
```

The CLA‑Assistant bot will turn the PR status green once all authors have signed.

<div align="right">[ <a href="#table-of-contents">Back to top ▲</a> ]</div>
<br />

## Bug Reports

Please try to create bug reports that are:

- _Reproducible._ Include steps to reproduce the problem.
- _Specific._ Include as much detail as possible: which version, what
  environment, etc.
- _Unique._ Do not duplicate existing opened issues.
- _Scoped to a Single Bug._ One bug per report.

<div align="right">[ <a href="#table-of-contents">Back to top ▲</a> ]</div>
<br />

# Support

Reach out to the maintainer at one of the following places:

- [Contact](https://stormsoftware.com/contact)
- [GitHub discussions](https://github.com/storm-software/storm-stack/discussions)
- <contact@stormsoftware.com>

<div align="right">[ <a href="#table-of-contents">Back to top ▲</a> ]</div>
<br />

# License

This project is licensed under the **Apache License 2.0**. Feel free to edit and
distribute this template as you like. If you have any specific questions, please
reach out to the Storm Software development team.

See [LICENSE](LICENSE) for more information.

<br />

[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fstorm-software%2Fstorm-stack.svg?type=large&issueType=license)](https://app.fossa.io/projects/git%2Bgithub.com%2Fstorm-software%2Fstorm-stack?ref=badge_large&issueType=license)

<div align="right">[ <a href="#table-of-contents">Back to top ▲</a> ]</div>
<br />

# Contributors

Thanks goes to these wonderful people
([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="http://www.sullypat.com/"><img src="https://avatars.githubusercontent.com/u/99053093?v=4?s=100" width="100px;" alt="Patrick Sullivan"/><br /><sub><b>Patrick Sullivan</b></sub></a><br /><a href="#design-sullivanpj" title="Design">🎨</a> <a href="https://github.com/storm-software/storm-stack/commits?author=sullivanpj" title="Code">💻</a> <a href="#tool-sullivanpj" title="Tools">🔧</a> <a href="https://github.com/storm-software/storm-stack/commits?author=sullivanpj" title="Documentation">📖</a> <a href="https://github.com/storm-software/storm-stack/commits?author=sullivanpj" title="Tests">⚠️</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://tylerbenning.com/"><img src="https://avatars.githubusercontent.com/u/7265547?v=4?s=100" width="100px;" alt="Tyler Benning"/><br /><sub><b>Tyler Benning</b></sub></a><br /><a href="#design-tbenning" title="Design">🎨</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://stormsoftware.com"><img src="https://avatars.githubusercontent.com/u/149802440?v=4?s=100" width="100px;" alt="Stormie"/><br /><sub><b>Stormie</b></sub></a><br /><a href="#maintenance-stormie-bot" title="Maintenance">🚧</a></td>
    </tr>
  </tbody>
  <tfoot>
    <tr>
      <td align="center" size="13px" colspan="7">
        <img src="https://raw.githubusercontent.com/all-contributors/all-contributors-cli/1b8533af435da9854653492b1327a23a4dbd0a10/assets/logo-small.svg">
          <a href="https://all-contributors.js.org/docs/en/bot/usage">Add your contributions</a>
        </img>
      </td>
    </tr>
  </tfoot>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the
[all-contributors](https://github.com/all-contributors/all-contributors)
specification. Contributions of any kind welcome!

<div align="right">[ <a href="#table-of-contents">Back to top ▲</a> ]</div>
<br />

<hr />
<br />

<div align="center">
<img src="https://public.storm-cdn.com/brand-banner.png" width="100%" alt="Storm Software" />
</div>
<br />

<div align="center">
<a href="https://stormsoftware.com" target="_blank">Website</a>  •  <a href="https://stormsoftware.com/contact" target="_blank">Contact</a>  •  <a href="https://linkedin.com/in/patrick-sullivan-865526b0" target="_blank">LinkedIn</a>  •  <a href="https://medium.com/@pat.joseph.sullivan" target="_blank">Medium</a>  •  <a href="https://github.com/storm-software" target="_blank">GitHub</a>  •  <a href="https://keybase.io/sullivanp" target="_blank">OpenPGP Key</a>
</div>

<div align="center">
<b>Fingerprint:</b> 1BD2 7192 7770 2549 F4C9 F238 E6AD C420 DA5C 4C2D
</div>
<br />

Storm Software is an open source software development organization and creator
of Acidic, StormStack and StormCloud.

Our mission is to make software development more accessible. Our ideal future is
one where anyone can create software without years of prior development
experience serving as a barrier to entry. We hope to achieve this via LLMs,
Generative AI, and intuitive, high-level data modeling/programming languages.

Join us on [Discord](https://discord.gg/MQ6YVzakM5) to chat with the team,
receive release notifications, ask questions, and get involved.

If this sounds interesting, and you would like to help us in creating the next
generation of development tools, please reach out on our
[website](https://stormsoftware.com/contact) or join our
[Slack](https://join.slack.com/t/storm-software/shared_invite/zt-2gsmk04hs-i6yhK_r6urq0dkZYAwq2pA)
channel!

<br />

<div align="center"><a href="https://stormsoftware.com" target="_blank"><img src="https://public.storm-cdn.com/icon-fill.png" alt="Storm Software" width="200px"/></a></div>
<br />
<div align="center"><a href="https://stormsoftware.com" target="_blank"><img src="https://public.storm-cdn.com/visit-us-text.svg" alt="Visit us at stormsoftware.com" height="90px"/></a></div>
