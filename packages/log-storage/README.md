<!-- START header -->
<!-- END header -->

# Storm Stack - Storage Log Adapters

A package containing a Storm Stack log adapter to write logs to storage (for example: a file system).

<!-- START doctoc -->
<!-- END doctoc -->

## Installing

Using [pnpm](http://pnpm.io):

```bash
pnpm add @storm-stack/log-storage
```

<details>
  <summary>Using npm</summary>

```bash
npm install @storm-stack/log-storage
```

</details>

<details>
  <summary>Using yarn</summary>

```bash
yarn add @storm-stack/log-storage
```

</details>

## Reduced Package Size

This project uses [tsup](https://tsup.egoist.dev/) to package the source code
due to its ability to remove unused code and ship smaller javascript files
thanks to code splitting. This helps to greatly reduce the size of the package
and to make it easier to use in other projects.

## Development

This project is built using [Nx](https://nx.dev). As a result, many of the usual
commands are available to assist in development.

### Building

Run `nx build log-storage` to build the library.

### Running unit tests

Run `nx test log-storage` to execute the unit tests via
[Jest](https://jestjs.io).

### Linting

Run `nx lint log-storage` to run [ESLint](https://eslint.org/) on the package.

<!-- START footer -->
<!-- END footer -->
