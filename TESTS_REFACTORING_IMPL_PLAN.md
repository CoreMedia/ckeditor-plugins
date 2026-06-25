# Tests Refactoring — Implementation Plan

Concrete, code-referenced execution plan for the refactoring described in
[`TESTS_REFACTORING.md`](./TESTS_REFACTORING.md): remove every `page.evaluate` /
`testApi` call from `tests/playwright` by serving **fully prepared stories** and
reading all values back through **observable DOM outputs** via Playwright
locators.

This plan is the working checklist. Track progress by checking the boxes. Each
phase ends with a verification gate that must pass before the next phase starts.

## Conventions & Ground Rules

- **No `page.evaluate` at all** may remain in `tests/playwright` at the end
  (neither direct nor via `test/storybook/testApi.ts`). The former
  browser-clipboard exception in `FontMapper.test.ts` was also removed: the Word
  HTML now lives in the Storybook package and each prepared FontMapper story
  writes it to the browser clipboard while mounting (`clipboard` scenario arg →
  `src/setup/clipboard.ts`), so the test only pastes and asserts through the
  `editor-data` output. The Phase 6 audit greps confirm no `page.evaluate`
  remains.
- **Story files are CSF:** every named export is treated as a story. **Do not
  export helper constants/types** from a `*.stories.ts` file — Storybook will try
  to render them as stories and the editor never becomes ready. Put per-story
  fixtures in the shared constants package (see next rule) and import them into
  both the story and its test, so neither file mirrors literals by hand.
- **Shared constants live in `@coremedia/ckeditor5-itest-constants`**
  (`tests/constants`). Constants that both the Storybook and Playwright packages
  rely on — the scenario container contract (`SCENARIO_CONTAINER_CLASS`,
  `EDITOR_READY_ATTRIBUTE`, `EDITOR_ELEMENT_ID`), the outputs harness ids
  (`OUTPUT_TEST_IDS`, `OUTPUTS_CONTAINER_CLASS`, `ScenarioOutput`), the in-page
  test API global (`EDITOR_TEST_API_GLOBAL`), and per-story fixtures (e.g.
  `helloEditorScenario`) — are defined **once** there and imported by both
  packages. This replaces the former "kept in sync by value" copies. The package
  is consumed as TypeScript source (`main` → `src/index.ts`), so there is no
  build step; just add a `workspace:^27.0.0` dependency where needed and
  `pnpm install`.
- **Arrange in the story, act/assert via locators.** Tests only call
  `openStory(page, id)` and then use locators.
- **Story id scheme unchanged:** `tests-<name>--<export-kebab>`. New per-scenario
  exports replace the single `Default` where needed.
- **Keep both API copies in sync** (`tests/storybook/src/runtime/testApi.ts` and
  `tests/playwright/test/storybook/testApi.ts`) until they are removed together
  in Phase 5. Their shared `EDITOR_TEST_API_GLOBAL` now comes from
  `@coremedia/ckeditor5-itest-constants`; remove it there once both API copies
  are deleted. Do not partially delete one side.
- **CRLF caveat:** the `create` tool writes CRLF and trips prettier. After
  creating/editing files run
  `pnpm --filter <pkg> exec eslint --fix <files>`.
- **Verification per file:**
  `pnpm --filter "@coremedia/ckeditor5-playwright-itest" run ui-test --project=<File>.test.ts`.
- **Do not weaken assertions.** A scenario that previously asserted on
  `testInfo.title`-derived text must assert on the equivalent fixed story
  constant.

## Source-of-Truth References (existing code)

These already exist and are reused — the harness wraps them, it does not
reimplement them:

- `tests/storybook/src/runtime/scenario.ts` — `ScenarioArgs`,
  `defaultScenarioArgs`. **Extend here.**
- `tests/storybook/src/setup/applyScenario.ts` — `applyScenario(editor, args)`.
  **Extend here.**
- `tests/storybook/src/runtime/mountStory.ts` — `mountScenario(initialize,
  args)`, container, `EDITOR_READY_ATTRIBUTE`, `installEditorTestApi`. **Render
  harness here.**
- `tests/storybook/src/setup/editorData.ts` — `getEditorData`, `setEditorData`,
  `setDataAndGetDataView` (one-shot `richtext:toView` listener).
- `tests/storybook/src/setup/serviceAgent.ts` — `getLastOpenedEntities`,
  `getContentFormService`, `addBlockedWord`, `getBlocklistService`.
- `tests/storybook/src/setup/inputExample.ts` — `addInputExampleElement`,
  `validateIsDroppableState`, `validateIsDroppableInLinkBalloon`.
- `tests/storybook/src/editors/index.ts` — `createEditorScenario`,
  `editorFactories`.
- `tests/playwright/test/locators/` — existing locator modules (`editor.ts`,
  `balloon.ts`). **Add `outputs.ts`.**

## Phase 0 — Baseline

- [x] Record the current green baseline: run the full suite with
      `PLAYWRIGHT_RETRIES=2` and note pass/flaky counts. _(104 passed, 0 flaky.)_
- [x] Confirm typecheck/lint clean for both packages.

**Gate:** baseline suite green (modulo known DragDrop flakiness). _(Met.)_

## Phase 1 — Scenario Contract Extension

Goal: stories can declare blocked words and input-example drag sources.

- [x] `scenario.ts`: add to `ScenarioArgs`:
  - `blockedWords: string[]`
  - `inputExampleElements: InputExampleElement[]`
      (import `InputExampleElement` from
      `@coremedia-internal/ckeditor5-coremedia-studio-integration-mock`).
- [x] `scenario.ts`: add both to `defaultScenarioArgs` (`[]` each).
- [x] `applyScenario.ts`: after existing steps, apply the new args:
  - for each `blockedWords` → `await addBlockedWord(editor, word)`
    (note: async; make `applyScenario` async or fire a tracked promise — see
    below).
  - for each `inputExampleElements` → `addInputExampleElement(editor, el)`.
- [x] **Async ordering decision:** `addBlockedWord` is async (resolves the mock
      blocklist service). `applyScenario` is currently sync and called inside
      `createEditorScenario` before returning the editor. Make `applyScenario`
      `async` and `await` it in `createEditorScenario` so the
      `data-editor-ready` signal is only set after blocked words are registered.
      Verify `mountScenario`'s ready wiring still holds. _(Done: `applyScenario`
      is now async and awaited in `createEditorScenario`.)_
- [x] Typecheck `tests/storybook`.

**Gate:** `pnpm --filter "@coremedia/ckeditor5-storybook-itest" run typecheck`
and `run lint` pass. _(Met.)_

## Phase 2 — Observable Outputs Harness

Goal: an opt-in harness renders live editor/service values as `textContent` on
stable `[data-test="…"]` selectors, updated reactively.

### 2a. Scenario flag

- [x] `scenario.ts`: add `outputs?: ScenarioOutput[]` where
      `ScenarioOutput = "editor-data" | "data-view" | "last-opened-entities" |
      "is-droppable-state" | "is-droppable-in-link-balloon"`.
- [x] Add a companion arg for the dropability inputs the harness needs:
      `droppableUris?: string[]` (uris evaluated for `is-droppable-*` outputs).
- [x] Default in `defaultScenarioArgs`: `outputs: []`, `droppableUris: []`.

### 2b. Harness module

- [x] New file `tests/storybook/src/runtime/outputs.ts` exporting
      `installOutputsHarness(container: HTMLElement, editor: ClassicEditor, args:
      ScenarioArgs): void`. Behavior per requested output:
  - `editor-data`: create `<pre data-test="editor-data">`; set on
    `editor.model.document` `change:data` (and once initially) to
    `getEditorData(editor)`.
  - `data-view`: create `<pre data-test="data-view">`; render the processed
    data view for the **loaded** `args.data` using the `richtext:toView`
    mechanism from `editorData.ts` (persistent listener + one re-set to
    populate; richtext only).
  - `last-opened-entities`: create `<pre data-test="last-opened-entities">`;
    resolve the mock content-form service once, then poll
    `JSON.stringify(service.getLastOpenedEntities())` reactively.
  - `is-droppable-state` / `is-droppable-in-link-balloon`: create the matching
    `<pre data-test="…">`; poll `JSON.stringify(validateIsDroppable*(editor,
    args.droppableUris) ?? null)`.
- [x] Export `ScenarioOutput` and the `data-test` constant names so the
      Playwright locators can share them by value (string copy; no build-time
      dependency, mirroring the `EDITOR_TEST_API_GLOBAL` pattern).
- [x] Define a shared constants block (`OUTPUT_TEST_IDS`) in `outputs.ts`.

### 2c. Mount wiring

- [x] `mountStory.ts`: after the editor is ready and before/with
      `installEditorTestApi`, if `resolvedArgs.outputs.length > 0` call
      `installOutputsHarness(container, editor, resolvedArgs)`. Harness elements
      live inside the scenario container but visually out of the way (they are
      only read by tests).

### 2d. Playwright locators

- [x] New file `tests/playwright/test/locators/outputs.ts` with typed readers
      (no `page.evaluate`): `editorData`, `dataView`, `lastOpenedEntities`,
      `isDroppableState`, `isDroppableInLinkBalloon`, plus `*Output` locator
      getters for `expect.poll`/`toHaveText`.
- [x] Mirror the `data-test` id constants here (string copy).

**Gate:** `tests/storybook` typecheck/lint and `tests/playwright` build/lint
pass. Harness not yet consumed. _(Met.)_

## Phase 3 — Pilot: `HelloEditor`

Goal: prove the end-to-end model on the simplest read-back test before rolling
out. Current usage: `setEditorData ×4`, `getEditorData ×2`, `addMockContents ×2`.

- [x] `HelloEditor.stories.ts`: replace single `Default` with prepared variants,
      one per test case (`Welcome`, `Cleared`, `ExternalLink`, `InternalLink`).
      Each sets `data`, `mockContents`, and `outputs: ["editor-data"]` where the
      test reads data back.
- [x] `HelloEditor.test.ts`: per test `openStory(page, "tests-helloeditor--<v>")`;
      replace `setEditorData`/`getEditorData` with story data + `editorData`
      locator (`expect.poll`); drop `addMockContents` (now in args). Remove all
      `testApi` imports.
- [x] Move `testInfo.title`-derived link text to explicit story constants and
      update assertions.
- [x] `eslint --fix`, then run `--project=HelloEditor.test.ts`. _(4 passed.)_
- [x] Extract the constants shared between the story and its test into the new
      `@coremedia/ckeditor5-itest-constants` package (`helloEditorScenario`), and
      move the previously "kept in sync by value" infra constants
      (`OUTPUT_TEST_IDS` / scenario container contract / `EDITOR_TEST_API_GLOBAL`)
      there too. Both `tests/storybook` and `tests/playwright` now import them
      instead of holding private copies. _(typecheck/lint/build green; 4 passed.)_

**Gate:** `HelloEditor.test.ts` green with **zero** `testApi` imports. Re-confirm
the harness reactivity (data updates after the cleared case). _(Met.)_

If the pilot reveals harness gaps (e.g. reactive timing for
`last-opened-entities`), fix Phase 2 before continuing.

## Phase 4 — Rollout by Group

For every test: create prepared story variant(s) → move arrange-calls into args
→ replace read/act-calls with locators/harness → delete `testApi` imports →
`eslint --fix` → run that file. Check the box only when the file is green with no
`testApi` import.

### 4a. Setup-only (arrange args, no harness)

- [x] `BBCode` — `data`, `dataType: "bbcode"`. _(story `tests-bbcode--bold-word`;
      bold word shared via `bbCodeScenario`; 1 passed.)_
- [x] `Blocklist` — `data`. _(story `tests-blocklist--default`; paragraphs +
      blocked word shared via `blocklistScenario`; 1 passed.)_
- [x] `BlocklistCollapsed` — `data`, `blockedWords`. _(shared `blocklistWordsScenario`; 1 passed.)_
- [x] `BlocklistExpandedKeyboard` — `data`, `blockedWords`. _(shared `blocklistWordsScenario`; 1 passed.)_
- [x] `BlocklistExpandedToolbar` — `data`, `blockedWords`. _(shared `blocklistWordsScenario`; 1 passed.)_
- [x] `ContentLink` — `data`, `mockContents`. _(6 prepared variants; shared
      `contentLinkScenario`/`contentLinkContentName`; 6 passed.)_
- [x] `LinkBalloon` — `data`, `mockContents`. _(content link + helper fixture
      divs baked into the story render; the test's own `page.evaluate` injectors
      removed; shared `linkBalloonScenario` (also used by the richtext keep-open
      config); 3 passed.)_

### 4b. Read-back (`editor-data` harness; focus via locator)

- [x] `FontMapper` — `outputs: ["editor-data"]`; `getEditorData` → `editorData`
      locator; `focusEditor` → `editor(page).click()`. _(Story `Default` exposes
      `editor-data`; the `writeToClipboard` `page.evaluate` is retained as the
      documented browser-clipboard exception — see Ground Rules; 3 passed.)_
- [x] `PasteButton` — `data`, `mockContents`, `inputExampleElements`;
      `getEditorData` → `editorData` locator. _(7 prepared per-test stories
      built by a `pasteButtonStory` factory; shared `pasteButtonScenario`; the
      PNG/content-name fixtures moved into the constants package
      (`mockFixtures.ts`, re-exported by playwright's `MockFixtures.ts`); image
      variants expose `editor-data`; 7 passed.)_
- [x] `DragDrop` — `mockContents`, `mockExternalContents`,
      `inputExampleElements`, `data`; `getEditorData` → `editorData`;
      `validateIsDroppable*` → `is-droppable-*` harness with per-variant
      `droppableUris`. Keep `PLAYWRIGHT_RETRIES` behavior. _(11 prepared per-test
      stories built by `contentDragStory`/`externalDragStory` factories; shared
      `dragDropScenario`; dropability polled via the `isDroppableState` /
      `isDroppableInLinkBalloon` output locators; image variants expose
      `editor-data`; 11 passed.)_

### 4c. Data-view round-trips (`data-view` harness; many variants)

These are heavily parametrized; build a **per-file story factory** that
generates exports from a parameter table to avoid duplication.

- [x] `DocumentLists` — factory over (ol/ul × attribute sets); each variant sets
      `data`, `outputs: ["data-view"]`; assert `dataView` locator + editing-view
      locators. _(38 prepared per-test stories generated by a `story`/`makeStory`
      factory from the shared `documentListsCases` table; the test iterates the
      same table and asserts by case `kind`; 38 passed.)_
- [x] `Differencing` — variants set `data`/`mockContents`,
      `outputs: ["data-view"]`. _(8 prepared per-test stories — 4 text-diff types,
      all-attributes, false-positive-newline, added-newline, image-changetype.
      The augmented `<xdiff:span>` markup is generated once in the shared
      `differencingScenario` (`tests/constants/src/stories/differencing.ts`, which
      deliberately depends on example-data because the augmented markup _is_ the
      asserted value) and consumed by both story `data` and test assertions, so
      the byte-exact xdiff ids never drift. The `data-view` harness was fixed to
      re-set the original scenario `data` rather than `editor.getData()`, because
      editing-only augmentations like `<xdiff:span>` are stripped from `getData()`
      but must be visible in the data view; DocumentLists re-verified (38 passed).
      8 passed.)_
- [x] `Images` — variants set `data`/`mockContents`,
      `outputs: ["data-view","last-opened-entities"]`. _(10 prepared per-test
      stories — 4 media-representation cases (shared `imageMediaCases` table,
      `data-view`), invalid-href, alignment, open-in-tab enabled/disabled
      (enabled exposes `last-opened-entities`), image-links no-link/with-link.
      Literals shared via `imagesScenario`/`imageMediaCases`. Two latent bugs
      surfaced and fixed: (1) the `last-opened-entities` harness output stringified
      the Promise returned by `service.getLastOpenedEntities()` without awaiting it
      (Images is its first consumer) → now awaited; (2) `PNG_EMPTY_24x24` in the
      shared `mockFixtures` had a two-character base64 corruption introduced during
      the constants-package move → restored to the original value. 10 passed.)_

### 4d. Interaction + service reads

- [x] `LinkUserInteraction` — variants `ExternalLink`, `ExternalLinkReadOnly`,
      `ContentLink`, `ContentLinkReadOnly` set `data`, `mockContents`,
      `readOnly`, `outputs: ["last-opened-entities"]`; replace
      `getLastOpenedEntities` with the harness locator; `setReadOnly` initial
      state → `readOnly` arg. Move `testInfo.title` link text into story
      constants. _(4 prepared stories, each backing a mouse + keyboard test pair
      (8 tests total): external-link / external-link-read-only drive the new
      browser-tab assertions; content-link / content-link-read-only expose
      `last-opened-entities` for the work-area-tab assertions. Link texts and the
      `["content/42"]` expectation shared via `linkUserInteractionScenario`.
      8 passed.)_

### 4e. Already-prepared

- [x] `Application` — verify it has no `testApi` usage; no change expected.
      _(Verified: `Application.test.ts` only opens `tests-application--default` and
      waits for the editor locator — no `testApi`, no `page.evaluate`. No change
      needed; 1 passed. A repo-wide grep over `tests/playwright/test/*.test.ts`
      confirms no remaining `testApi` imports, and the only `page.evaluate` is the
      documented FontMapper clipboard-write exception.)_

**Gate after 4:** every `*.test.ts` is free of `testApi` imports;
`grep` for `storybook/testApi` and `page.evaluate` in `tests/playwright/test`
returns nothing.

## Phase 5 — Retire the Runtime API

- [x] Delete `tests/playwright/test/storybook/testApi.ts`.
- [x] In `tests/storybook`: remove `installEditorTestApi` /
      `createEditorTestApi` and the `window[EDITOR_TEST_API_GLOBAL]` surface from
      `src/runtime/testApi.ts`; drop its export from `src/runtime/index.ts`.
      Keep the underlying setup utilities (`editorData`, `serviceAgent`,
      `inputExample`) — the harness depends on them. _(The whole
      `src/runtime/testApi.ts` was deleted — it only held the test-API surface;
      the kept setup utilities live in `src/setup/*`. `setDataAndGetDataView`
      remains exported as an unused-but-kept setup helper.)_
- [x] Remove the `installEditorTestApi` call in `mountStory.ts`. _(Import +
      call removed; `window.editor` instance global is left as-is — it is not the
      test-API global and is not used by any test.)_
- [x] Remove now-dead imports/types; ensure no `EditorTestApi` references
      remain.
- [x] Verify nothing else imports the removed symbols. _(Also deleted
      `tests/constants/src/testApi.ts` (`EDITOR_TEST_API_GLOBAL`) and its barrel
      export, as both API copies are gone. A repo-wide grep for
      `installEditorTestApi` / `createEditorTestApi` / `EditorTestApi` /
      `EDITOR_TEST_API_GLOBAL` / `coremediaEditorTestApi` / `storybook/testApi`
      returns nothing. All three packages typecheck/lint/build clean; smoke test
      24 passed.)_

**Gate:** both packages typecheck/lint/build; no references to
`coremediaEditorTestApi` remain except possibly historical docs.

## Phase 6 — Documentation & Final Verification

- [x] Update `tests/storybook/README.md`:
  - story-per-scenario model (multiple exports per `Tests/<Name>`),
  - the Observable Outputs Harness and `data-test` ids,
  - explicit statement that tests use **locators only**, no `page.evaluate`,
  - refresh the story↔test mapping (now many variants).
- [x] Update root `README.md` / any cross-links if needed. _(No root-README
      references to the retired API; updated `tests/constants/README.md` to drop
      the deleted `testApi.ts` entry and note `mockFixtures.ts` +
      the `stories/differencing.ts` example-data exception.)_
- [x] Update `TESTS_REFACTORING.md` success-criteria checklist to done.
- [x] Full suite green with `PLAYWRIGHT_RETRIES=2`. _(104 passed, 1.9m.)_
- [x] `pnpm -r` lint + build clean (at least both test packages).
      _(constants + storybook typecheck/lint clean; playwright lint/build clean.)_
- [x] Final `grep` audits:
  - `tests/playwright/test` contains no `page.evaluate`,
  - no import of `./storybook/testApi`,
  - `tests/storybook/src` exposes no `window` test-API global.

**Gate:** all success criteria in `TESTS_REFACTORING.md` met.

## Tracking Table (per-file status)

| File                          | Variants created | Args moved | Reads → harness/locator | `testApi` removed | Green |
| ----------------------------- | ---------------- | ---------- | ----------------------- | ----------------- | ----- |
| `Application`                 | n/a              | n/a        | n/a                     | n/a               | [x]   |
| `HelloEditor` (pilot)         | [x]              | [x]        | [x]                     | [x]               | [x]   |
| `BBCode`                      | [x]              | [x]        | n/a                     | [x]               | [x]   |
| `Blocklist`                   | [x]              | [x]        | n/a                     | [x]               | [x]   |
| `BlocklistCollapsed`          | [x]              | [x]        | n/a                     | [x]               | [x]   |
| `BlocklistExpandedKeyboard`   | [x]              | [x]        | n/a                     | [x]               | [x]   |
| `BlocklistExpandedToolbar`    | [x]              | [x]        | n/a                     | [x]               | [x]   |
| `ContentLink`                 | [x]              | [x]        | n/a                     | [x]               | [x]   |
| `LinkBalloon`                 | [x]              | [x]        | n/a                     | [x]               | [x]   |
| `FontMapper`                  | [x]              | [x]        | [x]                     | [x]               | [x]   |
| `PasteButton`                 | [x]              | [x]        | [x]                     | [x]               | [x]   |
| `DragDrop`                    | [x]              | [x]        | [x]                     | [x]               | [x]   |
| `DocumentLists`               | [x]              | [x]        | [x]                     | [x]               | [x]   |
| `Differencing`                | [x]              | [x]        | [x]                     | [x]               | [x]   |
| `Images`                      | [x]              | [x]        | [x]                     | [x]               | [x]   |
| `LinkUserInteraction`         | [x]              | [x]        | [x]                     | [x]               | [x]   |

## Rollback / Safety

- One file per commit (story + test together) keeps the suite green throughout
  on the working branch in use; the two API copies stay until Phase 5, so
  partially migrated states still run.
- If a harness output proves unreliable for a given test, prefer fixing the
  reactive binding over reintroducing `page.evaluate`; only as a last resort,
  keep that single read on the API and document it as an open item before
  Phase 5.
