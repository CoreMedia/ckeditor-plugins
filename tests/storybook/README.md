# Storybook Integration-Test Runtime

`@coremedia/ckeditor5-storybook-itest` is the [Storybook][] runtime that the
[Playwright integration tests][playwright] in `tests/playwright` execute
against. It replaces the former example application (`app`) as the test target:
every Playwright test opens a dedicated, **fully prepared** [story](#stories)
(data, mock contents, read-only state, blocked words and drag sources all baked
in) and interacts with and asserts against the editor purely through
**Playwright locators** — no `page.evaluate`. Any value a test needs to read
back from the running editor is exposed by the story as an
[observable DOM output](#observable-outputs-harness) that Playwright reads with a
locator.

The same Storybook is also published to [GitHub Pages](#github-pages-deployment),
so the test scenarios can be browsed interactively.

## Contents

- [Why Storybook?](#why-storybook)
- [Getting Started](#getting-started)
- [Package Layout](#package-layout)
- [Stories](#stories)
- [Story ↔ Test Mapping](#story--test-mapping)
- [Observable Outputs Harness](#observable-outputs-harness)
- [How Playwright Targets Storybook](#how-playwright-targets-storybook)
- [CKEditor License (`.env`)](#ckeditor-license-env)
- [GitHub Pages Deployment](#github-pages-deployment)

## Why Storybook?

Previously the Playwright tests ran against the `app` package and set up their
scenarios through JS-handle wrappers (`JSWrapper` and friends), which required
type workarounds for non-exported Playwright internals. The Storybook approach:

- gives **each test a dedicated, isolated story** (no shared application state);
- moves scenario setup into **reusable Storybook-side utilities**
  (`src/setup`, `src/runtime`) instead of Playwright wrapper classes;
- **bakes every scenario into the story** declaratively via `ScenarioArgs`
  (data, mock contents, read-only state, blocked words, drag sources, and even a
  prepared clipboard payload), so tests no longer arrange state at runtime;
- exposes live editor/service values a test must read back through an
  [Observable Outputs Harness](#observable-outputs-harness) — stable
  `[data-test="…"]` DOM elements read with locators — so tests run with
  **locators only, no `page.evaluate`**;
- shares the literals baked into each story (and asserted by its test) through
  the `@coremedia/ckeditor5-itest-constants` package, so story and test never
  drift.

## Getting Started

All commands run from the repository root (or use `--filter`):

```bash
# Start the Storybook dev server on http://localhost:6006
pnpm --filter "@coremedia/ckeditor5-storybook-itest" run storybook

# Build the static Storybook into ./build/storybook
pnpm --filter "@coremedia/ckeditor5-storybook-itest" run build-storybook

# Type-check / lint
pnpm --filter "@coremedia/ckeditor5-storybook-itest" run typecheck
pnpm --filter "@coremedia/ckeditor5-storybook-itest" run lint
```

You normally do **not** start Storybook by hand for tests: the Playwright config
starts it automatically (see [below](#how-playwright-targets-storybook)).

## Package Layout

```text
tests/storybook/
├─ .storybook/            Storybook configuration
│  ├─ main.ts             Framework, addons, .env + SVG-as-source webpack tweaks
│  ├─ preview.ts          Global preview config; imports content-styles.css
│  └─ content-styles.css  Editing-view CSS (float/align/list/min-height, …)
├─ src/
│  ├─ editors/            Editor factories (richtext, bbCode) + license helper
│  ├─ runtime/            Story runtime contract:
│  │  ├─ mountStory.ts    Mounts a scenario into the story canvas
│  │  ├─ scenario.ts      Scenario args (`ScenarioArgs`) + ready signalling
│  │  ├─ outputs.ts       Observable Outputs Harness (`installOutputsHarness`)
│  │  └─ environment.ts   Storybook URL / story-id helpers
│  └─ setup/              Reusable scenario setup utilities (migrated from the
│                         former JS-handle wrappers)
└─ stories/
   ├─ scenarios/          Reusable editor scenario stories
   ├─ tests/              One dedicated story per Playwright test
   ├─ RuntimeContract.*   Documents/validates the runtime contract
   └─ Smoke.stories.ts    Minimal smoke story
```

## Stories

Test stories live under `stories/tests/` and follow a single convention:

- **Title:** `Tests/<Name>` (e.g. `Tests/HelloEditor`).
- **Exports:** **one named export per Playwright test case.** Each Playwright
  test opens the prepared story for exactly that case, so a story file has as
  many exports as its test has scenarios (e.g. `Welcome`, `Cleared`,
  `ExternalLink`, `InternalLink` for `HelloEditor`). Story files that back a
  single test case keep a single `Default` export.
- **Story id:** Storybook derives a stable, kebab-cased id from title + export.
  `Tests/HelloEditor` → `Welcome` becomes **`tests-helloeditor--welcome`**;
  `Tests/Images` → `OpenInTabEnabled` becomes
  **`tests-images--open-in-tab-enabled`**.

Each export is **fully prepared**: its `ScenarioArgs` bake in everything the
test needs (data, mock contents, read-only state, blocked words, drag sources,
…). Tests never arrange editor state at runtime — they only open the story and
read/assert through locators.

Because CSF requires statically analysable named exports, parametrised story
families keep their per-case fixtures in a shared table in
`@coremedia/ckeditor5-itest-constants` and expose each case through a small
factory plus an explicit one-line export, e.g.:

```ts
const meta: Meta<ScenarioArgs> = {
  title: "Tests/PasteButton",
  render: (args) => mountScenario(createEditorScenario, args),
};
export default meta;

export const OneLink: Story = pasteButtonStory(pasteButtonScenario.oneLink);
export const SlowLinks: Story = pasteButtonStory(pasteButtonScenario.slowLinks);
```

The Playwright preview iframe URL for a story id is:

```text
http://localhost:6006/iframe.html?id=<storyId>&viewMode=story
```

## Story ↔ Test Mapping

Each `*.test.ts` in `tests/playwright/test` targets the `Tests/<Name>` story
group with the matching name; its individual test cases open the matching
prepared export via `openStory(page, storyId)`. The story id of an export is
`tests-<kebab(Name)>--<kebab(Export)>`.

| Playwright test                     | Story group (`Tests/…`)     | Prepared exports (story id `…--<kebab>`)                                                                                                       |
| ----------------------------------- | --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `HelloEditor.test.ts`               | `HelloEditor`               | `Welcome`, `Cleared`, `ExternalLink`, `InternalLink`                                                                                           |
| `Application.test.ts`               | `Application`               | `Default`                                                                                                                                      |
| `BBCode.test.ts`                    | `BBCode`                    | `BoldWord`                                                                                                                                     |
| `ContentLink.test.ts`               | `ContentLink`               | `RenderWithName`, `KeyboardButtons`, `EmptyUrlForm`, `EmptyUrlKeyboard`, `AddWithKeyboard`, `SelectFromSuggestions`                            |
| `LinkBalloon.test.ts`               | `LinkBalloon`               | `Default`                                                                                                                                      |
| `LinkUserInteraction.test.ts`       | `LinkUserInteraction`       | `ExternalLink`, `ExternalLinkReadOnly`, `ContentLink`, `ContentLinkReadOnly`                                                                   |
| `Blocklist.test.ts`                 | `Blocklist`                 | `Default`                                                                                                                                      |
| `BlocklistCollapsed.test.ts`        | `BlocklistCollapsed`        | `Default`                                                                                                                                      |
| `BlocklistExpandedToolbar.test.ts`  | `BlocklistExpandedToolbar`  | `Default`                                                                                                                                      |
| `BlocklistExpandedKeyboard.test.ts` | `BlocklistExpandedKeyboard` | `Default`                                                                                                                                      |
| `Differencing.test.ts`              | `Differencing`              | `Addition`, `Removal`, `Change`, `Conflict`, `AllAttributes`, `FalsePositiveNewline`, `AddedNewline`, `ImageChangetype`                        |
| `DocumentLists.test.ts`             | `DocumentLists`             | one export per `ol-*`/`ul-*` case (e.g. `OlContainsAttributes` → `tests-documentlists--ol-contains-attributes`)                                |
| `DragDrop.test.ts`                  | `DragDrop`                  | `OneLink`, `SlowLinks`, `MultipleLinks`, `ExternalLink`, `AlreadyImportedExternalLink`, …, `OneImage`, `MultipleImages`, `SlowImages`          |
| `FontMapper.test.ts`                | `FontMapper`                | `WordTemplate`, `WordTemplateTable`, `WordTemplateTableInheritFont`                                                                            |
| `Images.test.ts`                    | `Images`                    | `NormalFast`, `SlowLoading`, `Unreadable`, `NoData`, `InvalidHref`, `Alignment`, `OpenInTabEnabled`, `OpenInTabDisabled`, `LinksNoLink`, `LinksWithLink` |
| `PasteButton.test.ts`               | `PasteButton`               | `OneLink`, `SlowLinks`, `MultipleLinks`, `PasteViaKeyboardLink`, `OneImage`, `MultipleImages`, `SlowImages`                                    |

> **Adding a test case:** add a named export to
> `stories/tests/<Name>.stories.ts` (sharing its fixture via
> `@coremedia/ckeditor5-itest-constants` when parametrised), then reference
> `tests-<name>--<kebab(export)>` from the corresponding test case.

## Observable Outputs Harness

Tests run with **Playwright locators only** — no `page.evaluate`. When a test
must read a live value back from the running editor or a mock service, the story
publishes it through the **Observable Outputs Harness**: stable, hidden DOM
elements addressed by `data-test` ids, which Playwright reads with a locator.

- `installOutputsHarness(editor, element, args)` (`src/runtime/outputs.ts`)
  wires the requested outputs into `<pre data-test="…">` elements inside the
  outputs container (`OUTPUTS_CONTAINER_CLASS`).
- The available outputs (`OUTPUT_TEST_IDS` in
  `@coremedia/ckeditor5-itest-constants`) are:
  - `editor-data` — the current `editor.getData()`.
  - `data-view` — the rendered `richtext:toView` data view (re-set from the
    story's original loaded `data`, since `getData()` strips editing-only
    augmentations such as `<xdiff:span>`).
  - `last-opened-entities` — the awaited result of the work-area service's
    `getLastOpenedEntities()`.
  - `is-droppable-state` / `is-droppable-in-link-balloon` — drag-and-drop
    droppability signals.
- On the Playwright side, `tests/playwright/test/locators/outputs.ts` exposes
  matching locator readers (`editorData`, `dataView`, `lastOpenedEntities`,
  `isDroppableState`, `isDroppableInLinkBalloon`).

Stories can also bake in a **prepared clipboard** payload: when a scenario's
`clipboard` arg is set, the runtime writes that `text/html` (or other) item to
the browser clipboard while mounting (`src/setup/clipboard.ts`). This lets the
clipboard-driven `FontMapper` test paste a fully prepared Word document and
assert through the `editor-data` output — so it, too, runs with **locators
only, no `page.evaluate`** (the browser context grants `clipboard-write` via the
Playwright config).

## How Playwright Targets Storybook

Playwright no longer talks to the `app`. Instead:

1. `tests/playwright/playwright.config.ts` declares a single `webServer` that
   runs `pnpm run webserver:storybook` (which starts this package's Storybook
   dev server) and waits for `http://localhost:6006`.
2. `tests/playwright/test/storybook/environment.ts` builds the story preview URL
   (`storyUrl(storyId)`).
3. `tests/playwright/test/storybook/mountStory.ts#openStory` navigates to that
   iframe URL and waits for the scenario-ready signal
   (`data-editor-ready="true"`).

Run the tests as usual:

```bash
# Full suite (starts Storybook automatically)
pnpm --filter "@coremedia/ckeditor5-playwright-itest" run ui-test

# A single test file (one Playwright project per *.test.ts)
pnpm --filter "@coremedia/ckeditor5-playwright-itest" run ui-test --project=HelloEditor.test.ts
```

Useful environment variables: `STORYBOOK_PORT`/`STORYBOOK_HOST`,
`PLAYWRIGHT_RETRIES`, `PLAYWRIGHT_TIMEOUT_FACTOR`.

## CKEditor License (`.env`)

The editor factories read `CKEDITOR_LICENSE_KEY` (use `GPL` for the GNU GPL).
`.storybook/main.ts` resolves it from the first available `.env`:

1. `tests/storybook/.env` (local to this package),
2. `app/.env`,
3. the workspace-root `.env`.

In CI the value comes from the `CKEDITOR_LICENSE` secret (see the deployment
workflow and `build.yml`).

## GitHub Pages Deployment

The workflow `.github/workflows/deploy-storybook.yml` builds and publishes this
Storybook on every push to `main` (and on manual dispatch).

To **coexist with the existing GitHub Pages content** (the API documentation is
served from the Pages root at `…/docs/api/`), the static Storybook is published
into a dedicated `storybook/` subfolder of the `gh-pages` branch using
`peaceiris/actions-gh-pages` with `keep_files: true`. Sibling content is left
untouched.

- **Live URL:** <https://coremedia.github.io/ckeditor-plugins/storybook/>
- **Base path:** none required — the static build uses **relative** asset paths,
  so it works unchanged under the `/storybook/` subpath.

[Storybook]: <https://storybook.js.org/> "Storybook: Frontend workshop for UI development"
[playwright]: <../playwright> "Playwright integration tests"
