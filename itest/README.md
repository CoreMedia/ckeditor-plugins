# CKEditor 5 Automatic Integration Tests

In here you will find automatic integration tests for CoreMedia's CKEditor 5
plugins.

## Environment

The tests are based on the [Playwright][] testing framework. Especially for
IDE convenience, we use [Jest][] as test-runner provided by [Jest Playwright][].

## Running Tests

### CI

```text
pnpm run playwright
```

This will run the tests with the default configurations `jest.config.js` and
`jest-playwright.config.js` which especially runs the tests in headless
mode.

### Local Console

In addition to the CI you may want to call:

```text
pnpm run playwright-local
```

This will use configurations `jest.local.js` and `jest-playwright.local.js`,
which, by default, run tests in headed mode.

### IDE

If you want to run tests with local configuration (e.g., to run tests in
headed mode), you can configure `jest` accordingly with these Jest CLI Option:

```text
--config ./jest.local.js
```

> **Note on updating `jest.local.js` as well as `jest-playwright.local.js`:**
>
> Both files are by default "git-ignored", so that you may do local changes
> To propagate adaptions, you need to call `git add` with `--force` flag.

[Jest]: <https://jestjs.io/>
[Jest Playwright]: <https://github.com/playwright-community/jest-playwright>
[Playwright]: <https://playwright.dev/>
