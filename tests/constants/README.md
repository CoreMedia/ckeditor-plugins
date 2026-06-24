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
- `testApi.ts` — the in-page test API global name (`EDITOR_TEST_API_GLOBAL`),
  retired together with the in-page test API.
- `stories/*` — per-story fixtures shared by a prepared story and its test
  (for example `helloEditorScenario`). Story files are CSF, so per-story
  fixtures cannot be exported from the story module itself and live here
  instead.
