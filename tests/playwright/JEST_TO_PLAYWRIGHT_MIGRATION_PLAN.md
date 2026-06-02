# Jest-Playwright to Playwright Migration Plan

This document describes how to replace the legacy tests in `itest/` (Jest + jest-playwright) with native Playwright tests in `tests/playwright/`.

## Goals

- Move all integration tests from `itest/src/` to `tests/playwright/test/`.
- Remove Jest and jest-playwright dependencies from the test execution path.
- Keep test behavior, coverage, and CI reliability at least equivalent.
- Preserve local developer workflows (headed mode, debugging, retries, artifacts).

## Scope

### In scope

- Test code migration (`*.test.ts`).
- Test utilities and wrappers migration (`itest/src/aut`, `itest/src/browser`, `itest/src/expect`, `itest/src/user-interaction`, etc.).
- Configuration migration from Jest configs in `itest/` to Playwright config in `tests/playwright/`.
- Script and CI updates to run only Playwright test runner.

### Out of scope (for this step)

- Functional changes to editor behavior.
- Refactoring test semantics beyond what is required by the runner migration.

## Migration Strategy

## 1) Baseline and inventory

- List all current tests in `itest/src/` and group by domain (BBCode, Blocklist, Images, Link, PasteButton, etc.).
- Identify shared helpers used by many suites.
- Record baseline pass/fail and runtime from current `itest` run to compare after migration.

## 2) Create compatibility mapping

Define explicit mapping from Jest/jest-playwright patterns to Playwright equivalents.

- `describe/test/it` -> `test.describe/test` from `@playwright/test`.
- `beforeAll/afterAll/beforeEach/afterEach` -> Playwright hooks.
- `expect-playwright` assertions -> Playwright `expect` assertions.
- Global `page`/`browser` access from jest-playwright -> Playwright fixtures (`{ page, browser, context }`).
- Any `jest`-specific mocking/timer utilities -> Playwright-compatible alternatives or plain TypeScript utilities.

### Conventions

- **Shared base test / global per-test setup:** Anything that must run before
  (or after) *every* test lives in the shared base test module
  `test/base.ts`. Import `test` (and `expect`) from there instead of from
  `@playwright/test`:

  ```ts
  import { test, expect } from "./base";
  ```

  `base.ts` registers global `test.beforeEach` / `test.afterEach` hooks that
  start console capture before each test and, after each test, assert that no
  console errors/warnings were logged. Add further global behavior there.

  Use `globalSetup` in `playwright.config.ts` only for one-time setup; it does
  **not** run per test.

- **Waiting for the editor to be available:** Do **not** use a custom matcher or
  helper such as the legacy `waitForCKEditorToBeAvailable` /
  `expectCKEditorToBeAvailable`. Instead, always use the locator-based wait:

  ```ts
  import { editor } from "./locators/editor";

  await editor(page).waitFor();
  ```

  Whenever you encounter `expectCKEditorToBeAvailable` (or the old matcher)
  during migration, replace it with `await editor(page).waitFor()`.

- **Navigating to the application:** Do **not** use `await application.goto()`.
  Navigate directly with the Playwright `page` and the `applicationUrl` constant
  from `test/utils/environment`:

  ```ts
  import { applicationUrl } from "./utils/environment";

  await page.goto(applicationUrl);
  ```

  When a test requires a specific application state (e.g., a data type), append
  the corresponding hash parameters to `applicationUrl`:

  ```ts
  await page.goto(`${applicationUrl}#dataType=bbcode`);
  ```

  Whenever you encounter `await application.goto()` during migration, replace it
  with `await page.goto(applicationUrl)` (plus hash parameters as needed).

- **Cross-platform Ctrl/Cmd modifier:** Do **not** sniff the user agent to choose
  between `Control` and `Meta` (the legacy `ctrlOrMeta` / `clickModifiers`
  helpers). Use Playwright's built-in `"ControlOrMeta"` modifier, which resolves
  to `Meta` on macOS and `Control` elsewhere — for both clicks and keyboard:

  ```ts
  await locator.click({ modifiers: ["ControlOrMeta"] });
  await page.keyboard.down("ControlOrMeta");
  ```




## 3) Migrate shared test infrastructure first

- Move/adapt helper modules from `itest/src/*` into `tests/playwright/test/utils/` (or subfolders).
- Ensure helper APIs are runner-agnostic where possible.
- Replace any hidden dependency on Jest globals.

## 4) Migrate tests incrementally by suite

- Migrate one suite at a time (e.g., `HelloEditor`, then `BBCode`, then `Blocklist`, ...).
- Keep naming pattern `*.test.ts` under `tests/playwright/test/`.
- Validate each migrated suite before moving to the next.
- Prefer small PR-sized chunks to reduce regression risk.

## 5) Align execution model and configuration

- Confirm `tests/playwright/playwright.config.ts` contains required timeouts, retries, artifacts, and web server settings.
- Mirror legacy local/CI behavior:
  - CI: headless, deterministic, minimal flakiness.
  - Local: headed debugging options via env vars (instead of Jest local config files).
- If needed, add optional projects (e.g., smoke/full) in Playwright config.

## 6) Update scripts and workspace wiring

- Ensure root/workspace scripts point to `tests/playwright` for integration tests.
- Stop invoking `itest` Jest scripts in CI and local docs.
- Keep migration period explicit if both packages temporarily coexist.

## 7) Remove Jest-based setup from `itest`

After all suites are migrated and green:

- Delete/retire Jest config files in `itest/`:
  - `jest.config.cjs`
  - `jest-playwright.config.js`
  - `jest.local.js`
  - `jest-playwright.local.js`
- Remove Jest-related dependencies from `itest/package.json`.
- Optionally decommission `itest/` package once no longer needed.

## 8) Validation and quality gates

- Functional parity: migrated tests cover same scenarios as legacy tests.
- Stability: run migrated suites multiple times to catch flaky behavior.
- Reporting: confirm Playwright HTML report and traces are produced on failures.
- Lint/typecheck: pass for new test package.

## 9) Documentation updates

- Update `itest/README.md` to point to Playwright-only approach (or mark package deprecated).
- Add migration notes and run instructions to `tests/playwright/README.md` (to be created/updated).
- Document env vars used by Playwright (`PLAYWRIGHT_TIMEOUT_FACTOR`, `PLAYWRIGHT_RETRIES`, `STORYBOOK_PORT`).

## Tests to transform

The following test suites currently live in `itest/src/` and must be transformed
to native Playwright tests under `tests/playwright/test/`. Check off each suite
once it has been fully migrated and verified.

- [x] `BBCode.test.ts`
- [x] `Blocklist.test.ts`
- [x] `BlocklistCollapsed.test.ts`
- [x] `BlocklistExpandedKeyboard.test.ts`
- [x] `BlocklistExpandedToolbar.test.ts`
- [x] `ContentLink.test.ts`
- [x] `Differencing.test.ts`
- [x] `DocumentLists.test.ts`
- [x] `DragDrop.test.ts`
- [x] `FontMapper.test.ts`
- [x] `HelloEditor.test.ts`
- [ ] `Images.test.ts`
- [ ] `LinkBalloon.test.ts`
- [ ] `LinkUserInteraction.test.ts`
- [ ] `PasteButton.test.ts`

Total: 15 test suites.

> **Note:** `MockContentPluginWrapper` (and the related handle-based wrappers)
> will be migrated as-is and is intentionally **not** replaced by a functional
> helper.

## Proposed execution order

1. Baseline + inventory.
2. Shared helper migration.
3. Pilot suite migration (`HelloEditor.test.ts` recommended).
4. Remaining suites in batches.
5. CI/script switch.
6. Jest removal and cleanup.
7. Final docs and sign-off.

## Definition of done

- All integration tests run via `pnpm --filter ckeditor.playwright-itest run ui-test`.
- No Jest/jest-playwright execution path remains for integration tests.
- CI uses Playwright-only execution and is green.
- Migration docs are updated and discoverable.

