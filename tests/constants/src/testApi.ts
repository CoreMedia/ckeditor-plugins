/**
 * Name of the global property the in-page editor test API is exposed under.
 * Shared between the Storybook runtime (`tests/storybook/src/runtime/testApi.ts`)
 * and the Playwright `page.evaluate` wrappers
 * (`tests/playwright/test/storybook/testApi.ts`).
 *
 * Note: the in-page test API is being retired in favor of fully prepared
 * stories and the observable outputs harness; this constant can be removed once
 * both copies of the API are deleted.
 */
export const EDITOR_TEST_API_GLOBAL = "coremediaEditorTestApi";
