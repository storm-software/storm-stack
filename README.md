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

The **⚡Storm Stack** monorepo contains the [storm-stack](https://www.npmjs.com/package/storm-stack) package and various plugins and tools for building and deploying applications. At a high-level, Storm Stack is a system that generates artifacts and code during the build and deploy processes. The goal is to allow the developer to focus on the code/business logic, rather than the specifics around technologies, frameworks, or cloud providers. This is achieved by using a set of tools and plugins that are designed to work together. Please note: some features of Storm Stack are opinionated to meet the needs of Storm Software; however, it is simple to customize to fit any specific requirements you may have.

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
  - [Plugins](#plugins)
  - [Presets](#presets)
  - [Adapters](#adapters)
  - [Development Tools](#development-tools)
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

The following sections outline some of the features/publishable content included
in this repository.

## Engine

The [@storm-stack/core](https://www.npmjs.com/package/@storm-stack/core) package
includes the Storm Stack engine and CLI used to drive the build and deploy
processes.

## Plugins

The following Storm Stack plugin packages are included in this repository:

- [@storm-stack/plugin-node](https://www.npmjs.com/package/@storm-stack/plugin-node) -
  A plugin for Node.js applications
- [@storm-stack/plugin-http](https://www.npmjs.com/package/@storm-stack/plugin-http) -
  A plugin that adds Http helper types, classes, and functions to a project

## Presets

The following Storm Stack preset packages are included in this repository:

- [@storm-stack/plugin-cloudflare-worker](https://www.npmjs.com/package/@storm-stack/plugin-cloudflare-worker) -
  A preset for Cloudflare Worker applications
- [@storm-stack/plugin-cli](https://www.npmjs.com/package/@storm-stack/plugin-cli) -
  A preset for creating commandline applications

## Adapters

An application developed with Storm Stack can include a set of adapters that are
used to abstract the underlying technology. This allows the application to be
built and deployed to different platforms without changing the code. There are
currently two classes of adapters available:

- Log Adapters - adapters that provide logging and reporting functionality for
  the application. The following log adapters packages are included in the
  repository:

  - [@storm-stack/log-console](https://www.npmjs.com/package/@storm-stack/log-console) -
    A package containing functionality to write log messages to the console
  - [@storm-stack/log-sentry](https://www.npmjs.com/package/@storm-stack/log-sentry) -
    A package containing functionality to write log messages to
    [sentry](https://sentry.io)
  - [@storm-stack/log-otel](https://www.npmjs.com/package/@storm-stack/log-otel) -
    A package containing functionality to write log messages to an
    [OpenTelemetry](https://opentelemetry.io/) collector
  - [@storm-stack/log-storage](https://www.npmjs.com/package/@storm-stack/log-storage) -
    A package containing functionality to write log messages to a specified
    storage type
  - [@storm-stack/log-stream](https://www.npmjs.com/package/@storm-stack/log-stream) -
    A package containing functionality to write log messages to streams

- File System Adapters - adapters used to abstract away the process of writing
  or reading from the file system

## Development Tools

The following packages are included in this repository to assist with the
development/repository management process and are available for use in any
application:

- A [Nx](https://nx.dev/) plugin to manage monorepos using Storm Stack to build
  and deploy applications
- An [ESLint](https://eslint.org/) plugin to format code ensuring it's high
  quality
- An [ESLint](https://eslint.org/) shared configuration to ensure code quality
  and consistency
- A [Biome](https://biomejs.dev/) shared configuration to include required
  globals and rules

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
