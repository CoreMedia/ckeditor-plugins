# @coremedia/ckeditor5-itest-constants

Constants shared between the two integration-test packages:

- `@coremedia/ckeditor5-storybook-itest` (`tests/storybook`) — renders the
  prepared stories and the observable outputs harness.
- `@coremedia/ckeditor5-playwright-itest` (`tests/playwright`) — drives those
  stories through Playwright locators.

Both packages previously kept independent, hand-synced copies of these literals
(the comment "kept in sync by value to avoid a build-time dependency"). This
package removes that duplication: it is consumed as TypeScript source (`main`
points at `src/index.ts`), so there is no build step and no risk of drift.

## What lives here

- `scenarioContract.ts` — the scenario container contract
  (`EDITOR_ELEMENT_ID`, `SCENARIO_CONTAINER_CLASS`, `EDITOR_READY_ATTRIBUTE`).
- `outputs.ts` — the observable outputs harness ids (`OUTPUT_TEST_IDS`,
  `OUTPUTS_CONTAINER_CLASS`) and the derived `ScenarioOutput` union.
- `mockFixtures.ts` — shared blob/content fixtures (e.g. the `PNG_*` image
  blobs) baked into prepared stories and asserted by their tests.
- `stories/*` — per-story fixtures shared by a prepared story and its test
  (for example `helloEditorScenario`). Story files are CSF, so per-story
  fixtures cannot be exported from the story module itself and live here
  instead. Most of these keep no heavy dependencies; the sole exception is
  `stories/differencing.ts`, which depends on the example-data package because
  the augmented `<xdiff:span>` markup it generates _is_ the value under test and
  must be byte-identical in both the story data and the test assertions.
