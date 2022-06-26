# Development

## Prerequisites

* Install `pnpm` globally:

    ```text
    npm install --global pnpm
    ```

## Typical Build Process

```text
pnpm install
pnpm run build
```

### Testing

To run tests use:

```text
pnpm run jest
```

### Troubleshooting

* **Remove node_modules:**

    In case of problems, you may want to try to remove all `node_modules`
    folders and re-install artifacts again via `pnpm install`. The recommended way
    to do so, is using [`npkill`](https://www.npmjs.com/package/npkill). Ensure,
    to install it globally first:

    ```text
    npm install --global npkill
    ```

    And clean up `node_modules` recursively then:

    ```text
    npx npkill
    ```

## TypeScript

The CKEditor 5 plugins provided in this repository are developed with
TypeScript.

Exception up to now: The example application is provided as JavaScript for
CKEditor initialization.

<!-- ===========================================================[References] -->

[DefinitelyTyped]: <https://github.com/DefinitelyTyped/DefinitelyTyped> "DefinitelyTyped/DefinitelyTyped: The repository for high quality TypeScript type definitions."
