# Storybook + Playwright Implementation Plan

This plan describes how to implement the goals defined in `GOALS.md` step by step.

## 1. Create Storybook package skeleton

- [x] Add a new workspace package for Storybook in `tests/storybook`.
- [x] Register `tests/storybook` in `pnpm-workspace.yaml`.
- [x] Add all new Storybook dependencies via pnpm in the `tests/storybook` package and ensure workspace wiring is updated accordingly.
- [x] Configure Storybook build and dev scripts.
- [x] Ensure the package can run locally and build in CI.

## 2. Define Storybook test runtime contract

- [x] Define a stable story URL strategy that Playwright can target.
- [x] Define story args/parameters for scenario setup input.
- [x] Provide a shared helper module in Storybook for scenario initialization.

## 3. Migrate JS-wrapper functionality into Storybook utilities

- [x] Inventory all `JSWrapper`-based wrappers used by Playwright tests.
- [x] Move the setup logic into Storybook-side utilities (no Playwright JSHandle wrappers).
- [x] Replace `JSWrapper`-specific type shims/workarounds (including `PageFunctionOn`-style local types) with Storybook-side implementation.

## 4. Keep and align locator-based access patterns

- [x] Keep locator-based wrappers/helpers where they add clarity and value.
- [x] Align locator APIs with Storybook story structure and stable selectors.

## 5. Migrate Playwright tests one by one

- [x] Create a migration checklist of all test files in `tests/playwright/test`.
- [x] Build real editor factories (richtext + bbcode) in the Storybook package, ported from `app/src/editors`.
- [x] Pick one test file, create/migrate the corresponding Storybook story setup, and switch only that test to Storybook runtime.
- [x] Validate that migrated test file passes before starting the next file.
- [x] Repeat until every Playwright test file is migrated.
- [x] Track completion per test file by checking off each migrated item.

### Per-test migration checklist

- [x] `HelloEditor.test.ts` (richtext base scenario)
- [x] `Application.test.ts`
- [x] `BBCode.test.ts` (bbcode base scenario)
- [x] `ContentLink.test.ts`
- [x] `LinkBalloon.test.ts`
- [x] `LinkUserInteraction.test.ts`
- [x] `Blocklist.test.ts`
- [x] `BlocklistCollapsed.test.ts`
- [x] `BlocklistExpandedToolbar.test.ts`
- [x] `BlocklistExpandedKeyboard.test.ts`
- [x] `Differencing.test.ts`
- [x] `DocumentLists.test.ts`
- [x] `DragDrop.test.ts`
- [x] `FontMapper.test.ts`
- [x] `Images.test.ts`
- [x] `PasteButton.test.ts`

## 6. Create and refine stories for migrated scenarios

- [x] Ensure each migrated test has a dedicated story/scenario entry in Storybook.
- [x] Wire each migrated story to the Storybook setup utilities.
- [x] Ensure scenario behavior matches current tests.

## 7. Switch Playwright runtime target to Storybook

- [x] Update Playwright environment/config to point to Storybook URL instead of `app`.
- [x] Update web server startup command in Playwright config to run Storybook.
- [x] Keep test location under `tests/playwright` unchanged.

## 8. Remove obsolete JS-handle wrappers

- [x] Remove `tests/playwright/test/wrappers/JSWrapper.ts`.
- [x] Remove wrappers that only exist for JS-handle access.
- [x] Keep locator-based wrappers that remain useful.
- [x] Clean imports/usages and delete dead code.

## 9. Add GitHub Pages deployment for Storybook

- [ ] Add/adjust CI workflow to build and publish Storybook to GitHub Pages.
- [ ] Ensure deployment uses the correct base path for this repository.
- [ ] Verify deployed Storybook is reachable.

## 10. Hardening and parity checks

- [ ] Run lint/build/tests for affected packages.
- [ ] Fix regressions in story setup and Playwright execution.
- [ ] Confirm all success criteria from `GOALS.md` are met.

## 11. Final documentation update

- [ ] Update `README_STORYBOOK` at the end with finalized Storybook package usage.
- [ ] Document how Playwright targets Storybook and how stories map to tests.
- [ ] Document GitHub Pages URL/deployment behavior.
