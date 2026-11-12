/**
 * `data-test` attribute values the Storybook outputs harness renders its
 * observable values under, shared with the Playwright output locators
 * (`tests/playwright/test/locators/outputs.ts`). This object is the single
 * source of truth for the available output kinds; {@link ScenarioOutput} is
 * derived from its keys.
 */
export const OUTPUT_TEST_IDS = {
  "editor-data": "editor-data",
  "data-view": "data-view",
  "last-opened-entities": "last-opened-entities",
  "is-droppable-state": "is-droppable-state",
  "is-droppable-in-link-balloon": "is-droppable-in-link-balloon",
} as const;

/**
 * Observable output a scenario can render as live, locator-readable DOM (see the
 * outputs harness). Each value a test previously read back through
 * `page.evaluate` is instead exposed as the text content of a stable
 * `[data-test="…"]` element.
 */
export type ScenarioOutput = keyof typeof OUTPUT_TEST_IDS;

/**
 * Class of the container holding the harness output elements.
 */
export const OUTPUTS_CONTAINER_CLASS = "storybook-scenario-outputs";
