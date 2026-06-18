# Goals

## Objective

Create a new Storybook package and use it as the runtime target for Playwright tests.

## Current State

- Playwright tests are located in `tests/playwright`.
- Playwright currently runs against the app in `app`.
- The Playwright app contains wrappers used to set up test scenarios, including locator-based wrappers and JS-handle wrappers.
- JS-handle wrappers currently include type workarounds for missing importable Playwright internals (for example `PageFunctionOn`).

## Target State

- Introduce a dedicated Storybook package for UI test scenarios.
- Configure Playwright tests in `tests/playwright` to run against Storybook instead of the `app` target.
- Provide a dedicated Storybook story for each Playwright test case.
- Move JS-wrapper functionality from Playwright test code into the Storybook package as reusable story setup utilities.
- Remove `JSWrapper`-based and other JS-handle wrappers; keep locator-based wrappers where they provide value.
- Eliminate JS-wrapper-specific type workarounds (for example local replacements for `PageFunctionOn`).
- Deploy the Storybook package to GitHub Pages.
- Update `README.md` at the end to document the final Storybook package and Playwright integration workflow.

## Success Criteria

- A Storybook package exists and can be started in a stable way for tests.
- Playwright uses the Storybook URL/runtime as its test target.
- Existing Playwright test location (`tests/playwright`) remains unchanged.
- Each Playwright test has a dedicated corresponding Storybook story.
- Story setup for tests is driven by Storybook-side utilities migrated from wrapper functionality.
- Test scenario setup behavior remains intact after removing JS-handle wrappers.
- Locator-based wrappers continue to be supported where appropriate.
- No custom type shims remain that only exist to support `JSWrapper` internals.
- Storybook is deployed and reachable via GitHub Pages.
- `README.md` is updated at the end with the finalized Storybook/test setup documentation.
