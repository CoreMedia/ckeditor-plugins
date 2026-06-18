# Storybook Integration-Test Runtime

`@coremedia/ckeditor5-storybook-itest` is the [Storybook][] runtime that the
[Playwright integration tests][playwright] in `tests/playwright` execute
against. It replaces the former example application (`app`) as the test target:
every Playwright test renders a dedicated, isolated [story](#stories) and drives
the editor through an in-page test API instead of handle-based wrappers.

The same Storybook is also published to [GitHub Pages](#github-pages-deployment),
so the test scenarios can be browsed interactively.

## Contents

- [Why Storybook?](#why-storybook)
- [Getting Started](#getting-started)
- [Package Layout](#package-layout)
- [Stories](#stories)
- [Story ↔ Test Mapping](#story--test-mapping)
- [In-Page Editor Test API](#in-page-editor-test-api)
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
- exposes editor interactions through a single **in-page test API**
  (`window.coremediaEditorTestApi`), removing the JS-handle wrappers and their
  type shims;
- keeps the **locator-based wrappers** that still add value
  (see `tests/playwright/test/wrappers`).

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
│  │  ├─ scenario.ts      Scenario args + ready signalling
│  │  ├─ environment.ts   Storybook URL / story-id helpers
│  │  └─ testApi.ts       In-page editor test API (source of truth)
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
- **Export:** `Default`.
- **Story id:** Storybook derives a stable, kebab-cased id from title + export.
  `Tests/HelloEditor` → `Default` becomes **`tests-helloeditor--default`**.

A minimal example (`stories/tests/HelloEditor.stories.ts`):

```ts
const meta: Meta<ScenarioArgs> = {
  title: "Tests/HelloEditor",
  args: { ...defaultScenarioArgs, dataType: "richtext", data: richTextData.Welcome },
  render: (args) => mountScenario(createEditorScenario, args),
};
export default meta;
export const Default: StoryObj<ScenarioArgs> = {};
```

The Playwright preview iframe URL for a story id is:

```text
http://localhost:6006/iframe.html?id=<storyId>&viewMode=story
```

## Story ↔ Test Mapping

Each `*.test.ts` in `tests/playwright/test` targets the story with the matching
name. The test declares the story id and opens it via `openStory(page, storyId)`:

| Playwright test                        | Story (`Tests/…`)              | Story id                                       |
| -------------------------------------- | ------------------------------ | ---------------------------------------------- |
| `HelloEditor.test.ts`                  | `HelloEditor`                  | `tests-helloeditor--default`                   |
| `Application.test.ts`                  | `Application`                  | `tests-application--default`                   |
| `BBCode.test.ts`                       | `BBCode`                       | `tests-bbcode--default`                        |
| `ContentLink.test.ts`                  | `ContentLink`                  | `tests-contentlink--default`                   |
| `LinkBalloon.test.ts`                  | `LinkBalloon`                  | `tests-linkballoon--default`                   |
| `LinkUserInteraction.test.ts`          | `LinkUserInteraction`          | `tests-linkuserinteraction--default`           |
| `Blocklist.test.ts`                    | `Blocklist`                    | `tests-blocklist--default`                     |
| `BlocklistCollapsed.test.ts`           | `BlocklistCollapsed`           | `tests-blocklistcollapsed--default`            |
| `BlocklistExpandedToolbar.test.ts`     | `BlocklistExpandedToolbar`     | `tests-blocklistexpandedtoolbar--default`      |
| `BlocklistExpandedKeyboard.test.ts`    | `BlocklistExpandedKeyboard`    | `tests-blocklistexpandedkeyboard--default`     |
| `Differencing.test.ts`                 | `Differencing`                 | `tests-differencing--default`                  |
| `DocumentLists.test.ts`                | `DocumentLists`                | `tests-documentlists--default`                 |
| `DragDrop.test.ts`                     | `DragDrop`                     | `tests-dragdrop--default`                      |
| `FontMapper.test.ts`                   | `FontMapper`                   | `tests-fontmapper--default`                    |
| `Images.test.ts`                       | `Images`                       | `tests-images--default`                        |
| `PasteButton.test.ts`                  | `PasteButton`                  | `tests-pastebutton--default`                   |

> **Adding a test:** create `stories/tests/<Name>.stories.ts` with title
> `Tests/<Name>` and export `Default`, then reference
> `tests-<name>--default` from the new `<Name>.test.ts`.

## In-Page Editor Test API

The runtime exposes a typed API on `window.coremediaEditorTestApi`
(`EDITOR_TEST_API_GLOBAL = "coremediaEditorTestApi"`), defined in
`src/runtime/testApi.ts`. It is the single channel through which tests
manipulate the editor and its mock backends — replacing the old JS-handle
wrappers. Methods include:

- data: `setData`, `getData`, `setDataAndGetDataView`, `focus`
- mock content: `addMockContents`, `addMockExternalContents`,
  `getLastOpenedEntities`
- editor state: `setReadOnly`
- feature setup: `addBlockedWord`, `addInputExampleElement`,
  `validateIsDroppableState`, `validateIsDroppableInLinkBalloon`

The Playwright side keeps an independent, in-sync mirror in
`tests/playwright/test/storybook/testApi.ts`, where each helper is a thin
`(page, …args) => page.evaluate(…)` wrapper. The two copies are intentionally
decoupled to avoid a build-time dependency between the packages — **keep them in
sync** when adding API methods.

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
