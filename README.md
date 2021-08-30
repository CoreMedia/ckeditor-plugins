# CKEditor 5 Evaluation and Preparation

This repository contains the results of our preparation steps for
replacing CKEditor 4 which reaches EOL soon. While `archive/` contains
previous evaluation efforts, the root-folder represents the current
evaluation process.

## Build

To build we use `pnpm`.

### Setup

Install pnpm globally:

```text
npm install --global pnpm
```

### Install

Install artifacts via:

```text
pnpm install
```

### Build

To build the workspace use:

```text
pnpm run build
```

### Test

To run tests use:

```text
pnpm run jest
```

### Troubleshooting

* **Remove node_modules:**

    In case of problems, you may want to try to remove all `node_modules`
    folders and re-install artifacts again via `pnpm install`. The recommended
    way to do so, is using [`npkill`](https://www.npmjs.com/package/npkill).
    Ensure, to install it globally first:

    ```text
    npm install --global npkill
    ```

    And clean up `node_modules` recursively then:

    ```text
    npx npkill
    ```
