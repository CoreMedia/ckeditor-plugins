# Tests Refactoring: Fully Prepared Stories Instead of `page.evaluate`

## Objective

The Playwright integration tests in `tests/playwright` already run against the
Storybook package (`tests/storybook`). However, they still drive the editor and
set up scenarios at runtime through an in-page test API
(`window.coremediaEditorTestApi`) called via `page.evaluate` (wrapped by
`tests/playwright/test/storybook/testApi.ts`).

**Goal:** eliminate `page.evaluate` from the tests. Each test should open a
story that is **completely prepared** for it — all data, mock contents,
read-only state, blocked words and drag sources baked into the story — and then
interact with and assert against the editor purely through **Playwright
locators**. Any value a test currently reads back through `page.evaluate` should
instead be exposed by the story as an **observable DOM output** that Playwright
reads with a locator.

This document is the plan. No test or story code is changed yet.

## Background: Current State

- One story per test file (`Tests/<Name>` → `tests-<name>--default`), usually an
  **empty** editor. The test arranges everything afterwards via the API.
- Scenario setup already has a declarative contract: `ScenarioArgs` in
  `tests/storybook/src/runtime/scenario.ts` (`data`, `mockContents`,
  `mockExternalContents`, `readOnly`, `dataType`, `uiLanguage`) applied by
  `applyScenario.ts`. Stories *can* be prepared declaratively today — most tests
  simply don't use it yet and call the API at runtime instead.
- The in-page API and its Playwright mirror expose both **setup** and
  **read/act** operations (see categorization below).

### Current `page.evaluate` usage per test

Counts are call sites of the `testApi` helpers (each is a `page.evaluate`).

| Test                          | API calls used                                                                                                                   |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `Application.test.ts`         | _(none — already prepared)_                                                                                                       |
| `BBCode.test.ts`              | `setEditorData` ×2                                                                                                                |
| `Blocklist.test.ts`           | `setEditorData` ×2                                                                                                                |
| `BlocklistCollapsed.test.ts`  | `setEditorData` ×2, `addBlockedWord` ×2                                                                                           |
| `BlocklistExpandedKeyboard.test.ts` | `setEditorData` ×2, `addBlockedWord` ×3                                                                                     |
| `BlocklistExpandedToolbar.test.ts`  | `setEditorData` ×2, `addBlockedWord` ×3                                                                                     |
| `ContentLink.test.ts`         | `setEditorData` ×5, `addMockContents` ×6                                                                                          |
| `Differencing.test.ts`        | `setEditorDataAndGetDataView` ×6, `setEditorData` ×2, `addMockContents` ×2                                                        |
| `DocumentLists.test.ts`       | `setEditorDataAndGetDataView` ×11                                                                                                 |
| `DragDrop.test.ts`            | `setEditorData` ×2, `getEditorData` ×2, `addMockContents` ×3, `addMockExternalContents` ×2, `addInputExampleElement` ×3, `validateIsDroppableState` ×2, `validateIsDroppableInLinkBalloon` ×2 |
| `FontMapper.test.ts`          | `getEditorData` ×2, `focusEditor` ×3                                                                                              |
| `HelloEditor.test.ts`         | `setEditorData` ×4, `getEditorData` ×2, `addMockContents` ×2                                                                      |
| `Images.test.ts`              | `setEditorDataAndGetDataView` ×8, `addMockContents` ×7, `getLastOpenedEntities` ×2                                                |
| `LinkBalloon.test.ts`         | `setEditorData` ×4, `addMockContents` ×4                                                                                          |
| `LinkUserInteraction.test.ts` | `setEditorData` ×9, `addMockContents` ×5, `setReadOnly` ×5, `getLastOpenedEntities` ×5                                            |
| `PasteButton.test.ts`         | `setEditorData` ×2, `getEditorData` ×2, `addMockContents` ×2, `addInputExampleElement` ×2                                         |

## Categorizing the API Calls

The way each call is eliminated depends on whether it **arranges** state before
the test acts, or **reads/acts** during the test.

### A. Arrange (pre-test setup) — move into the prepared story

These describe the starting state and map directly onto story args. They are the
bulk of the calls and the easiest to remove.

| API call                       | Story mechanism                                                        |
| ------------------------------ | ---------------------------------------------------------------------- |
| `setEditorData(data)`          | `ScenarioArgs.data` (already supported)                                |
| `addMockContents(...)`         | `ScenarioArgs.mockContents` (already supported)                        |
| `addMockExternalContents(...)` | `ScenarioArgs.mockExternalContents` (already supported)                |
| `setReadOnly(true)` _(initial)_ | `ScenarioArgs.readOnly` (already supported)                           |
| `addBlockedWord(word)`         | **New** `ScenarioArgs.blockedWords: string[]`                          |
| `addInputExampleElement(el)`   | **New** `ScenarioArgs.inputExampleElements: InputExampleElement[]`     |

### B. Read / Act (during the test) — expose as observable DOM output

These read live editor/service state or perform an action mid-test. They cannot
be "baked in"; instead the story renders the value into a stable, observable
element that updates reactively, and the test reads it via a locator
(`expect.poll(() => locator.textContent())`). See
[Observable Outputs Harness](#observable-outputs-harness).

| API call                              | Replacement                                                                                  |
| ------------------------------------- | -------------------------------------------------------------------------------------------- |
| `getEditorData()`                     | Harness element `[data-test="editor-data"]`, bound to `editor` data changes                  |
| `setEditorDataAndGetDataView(data)`   | Story is prepared with `data`; harness element `[data-test="data-view"]` renders the processed data view |
| `getLastOpenedEntities()`             | Harness element `[data-test="last-opened-entities"]`, fed by the mock content-form service   |
| `validateIsDroppableState(uris)`      | Harness element `[data-test="is-droppable-state"]` for the story's fixed uris                 |
| `validateIsDroppableInLinkBalloon(uris)` | Harness element `[data-test="is-droppable-in-link-balloon"]` for the story's fixed uris    |
| `focusEditor()`                       | Locator action `editor(page).click()` (no harness needed)                                    |

> **Note on `setEditorDataAndGetDataView`:** this is a data-processing
> round-trip (set data → read processed data view). Since the input becomes
> fixed story data, each distinct input becomes its own story variant, and the
> resulting data view is rendered into the harness. This converts the
> heavily-parametrized `Differencing`, `DocumentLists` and `Images` tests into
> sets of prepared story variants.

## Target Design

### 1. Extend the scenario contract

Add to `ScenarioArgs` (and `defaultScenarioArgs`, `applyScenario`):

- `blockedWords: string[]` — pre-registered with the mock blocklist service
  before the editor loads (uses existing `serviceAgent.addBlockedWord`).
- `inputExampleElements: InputExampleElement[]` — draggable input-example
  sources created at mount time (uses existing
  `inputExample.addInputExampleElement`).

These reuse the existing in-page setup helpers; only the declarative wiring is
new.

### 2. Observable Outputs Harness

Introduce an opt-in harness rendered by `mountScenario` next to the editor
(within the scenario container), controlled by a new `ScenarioArgs.outputs`
flag/list so only stories that need it render it. The harness exposes live
values as `textContent` on stable selectors:

- `[data-test="editor-data"]` — current editor data, updated on
  `editor.model.document` `change:data`.
- `[data-test="data-view"]` — processed data view for the loaded data
  (richtext only).
- `[data-test="last-opened-entities"]` — JSON array of entities opened via the
  mock content-form service, updated reactively.
- `[data-test="is-droppable-state"]` /
  `[data-test="is-droppable-in-link-balloon"]` — JSON evaluation results for the
  story's configured uris.

Add a Playwright-side locator module (e.g. `test/locators/outputs.ts`) with
typed readers (`editorData(page)`, `dataView(page)`,
`lastOpenedEntities(page)`, …) returning locators / parsed values — **no
`page.evaluate`**.

### 3. Dedicated, fully prepared stories per scenario

Replace single empty `--default` stories with one story export per test
scenario. Conventions (unchanged id scheme):

- Title stays `Tests/<Name>`; add **multiple exports**, one per scenario
  variant.
- Story id = `tests-<name>--<export-kebab>` (e.g.
  `tests-linkuserinteraction--content-link-read-only`).
- A shared per-file factory builds the variants to avoid duplication
  (especially for `DocumentLists` / `Differencing` / `Images`).

The test body then becomes: `openStory(page, id)` → locator interactions →
locator assertions. `beforeEach` may map a per-`describe` story.

### 4. Retire the runtime API

Once no test references them, remove the runtime-only helpers and keep the
in-page pieces only where the harness needs them:

- Delete `tests/playwright/test/storybook/testApi.ts` (the `page.evaluate`
  wrappers) and its `EditorTestApi` mirror.
- In `tests/storybook`, drop `installEditorTestApi` / the `window`-exposed API
  surface that exists purely for `page.evaluate`; fold the still-needed reads
  (data view, last opened entities, dropability) into the harness wiring.
- `window.editor` exposure and the editor factories are unaffected.

## Per-Test Refactoring Plan

For each test: create prepared story variant(s), move arrange-calls into args,
replace read/act-calls with harness locators or locator actions, delete API
imports.

| Test                         | New story variants (exports)                                              | Arrange → args                                  | Read/act → replacement                                  |
| ---------------------------- | ------------------------------------------------------------------------- | ----------------------------------------------- | ------------------------------------------------------- |
| `Application`                | keep as-is (already prepared)                                             | —                                               | —                                                       |
| `BBCode`                     | per data case                                                            | `data`, `dataType: "bbcode"`                    | —                                                       |
| `Blocklist`                  | per data case                                                            | `data`                                          | —                                                       |
| `BlocklistCollapsed`         | per case                                                                 | `data`, `blockedWords`                          | —                                                       |
| `BlocklistExpandedKeyboard`  | per case                                                                 | `data`, `blockedWords`                          | —                                                       |
| `BlocklistExpandedToolbar`   | per case                                                                 | `data`, `blockedWords`                          | —                                                       |
| `ContentLink`                | per link case                                                            | `data`, `mockContents`                          | —                                                       |
| `Differencing`               | per diff case                                                            | `data`, `mockContents`                          | `data-view` harness                                     |
| `DocumentLists`              | per list case (factory: ol/ul × attribute set)                          | `data`                                          | `data-view` harness                                     |
| `DragDrop`                   | per drag case                                                            | `mockContents`, `mockExternalContents`, `inputExampleElements`, `data` | `editor-data` harness; `is-droppable-*` harness         |
| `FontMapper`                 | per case                                                                 | `data`                                          | `editor-data` harness; `focusEditor` → `editor.click()` |
| `HelloEditor`                | per case                                                                 | `data`, `mockContents`                          | `editor-data` harness                                   |
| `Images`                     | per image case                                                          | `data`, `mockContents`                          | `data-view` harness; `last-opened-entities` harness     |
| `LinkBalloon`                | per case                                                                 | `data`, `mockContents`                          | —                                                       |
| `LinkUserInteraction`        | `ExternalLink`, `ExternalLinkReadOnly`, `ContentLink`, `ContentLinkReadOnly` | `data`, `mockContents`, `readOnly`          | `last-opened-entities` harness                          |
| `PasteButton`                | per paste case                                                          | `mockContents`, `inputExampleElements`, `data` | `editor-data` harness                                   |

> Tests that currently key their data off `testInfo.title` (e.g.
> `LinkUserInteraction`, `HelloEditor`) must move that constant into the story
> and assert against the story's known text instead.

## Step-by-Step Execution Plan

1. **Contract & harness foundation**
   - [x] Extend `ScenarioArgs` with `blockedWords` and `inputExampleElements`;
         wire them in `applyScenario.ts` and `defaultScenarioArgs`.
   - [x] Implement the Observable Outputs Harness in `tests/storybook/src`
         (reactive bindings for editor data, data view, last opened entities,
         dropability) behind an opt-in `outputs` arg.
   - [x] Add `tests/playwright/test/locators/outputs.ts` typed readers.
   - [x] Verify with one pilot (e.g. `HelloEditor`) before rolling out.
2. **Pilot migration (`HelloEditor`)**
   - [x] Create prepared story variants, refactor the test to locators only,
         remove its `testApi` imports. Confirm green.
3. **Roll out by group** (small → large), running the affected file after each:
   - [x] Setup-only: `BBCode`, `Blocklist*`, `ContentLink`, `LinkBalloon`.
   - [x] Read-back: `FontMapper`, `PasteButton`, `DragDrop`.
   - [x] Data-view round-trips: `DocumentLists`, `Differencing`, `Images`.
   - [x] Interaction + service reads: `LinkUserInteraction`.
4. **Retire the runtime API**
   - [x] Delete `test/storybook/testApi.ts` and the Storybook
         `installEditorTestApi` window surface once unused.
   - [x] Remove now-dead helpers/imports; keep harness-backing setup utilities.
5. **Docs & verification**
   - [x] Update `tests/storybook/README.md` (story-per-scenario model, harness,
         no `page.evaluate`) and the story↔test mapping.
   - [x] Full suite green (`PLAYWRIGHT_RETRIES=2`), lint + typecheck for both
         packages.

## Success Criteria

- [x] No `page.evaluate` (directly or via `testApi`) remains in
  `tests/playwright` — the sole, documented exception is the `FontMapper`
  browser-clipboard write.
- [x] `tests/playwright/test/storybook/testApi.ts` is removed.
- [x] Every test opens a story that is fully prepared for it; arrange happens in
  the story, not the test.
- [x] All values previously read via the API are exposed as observable DOM
  outputs and read through locators.
- [x] Each test scenario maps to a dedicated story (id
  `tests-<name>--<variant>`).
- [x] Full Playwright suite passes; lint/typecheck/build pass for both packages.
- [x] `tests/storybook/README.md` reflects the new model.

## Risks & Open Questions

- **Story proliferation:** `DocumentLists` / `Differencing` / `Images` expand
  into many variants. Mitigate with per-file story factories generating exports
  from a parameter table.
- **Reactive harness fidelity:** values read *after* an interaction (e.g.
  `getEditorData` post-paste, `getLastOpenedEntities` post-click) require the
  harness to update reactively; tests should use `expect.poll`.
- **Dropability evaluation:** `validateIsDroppable*` results depend on the uris
  under test. With prepared stories the uris are fixed per variant; confirm this
  preserves the original coverage.
- **`testInfo.title`-derived data:** must become explicit story constants;
  ensure assertions are updated accordingly.
- **DragDrop flakiness:** pre-existing drag-timing flakiness should not regress;
  keep `PLAYWRIGHT_RETRIES` behavior for CI.
- **Two-copy contract:** while migrating, the Storybook and Playwright API
  copies must stay in sync until both are removed together.
