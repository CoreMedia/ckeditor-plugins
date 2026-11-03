import { expect } from "@playwright/test";
import { setupStudioTests, type StudioTestType } from "@coremedia-internal/studio-client.playwright-config";

/**
 * The shared `test` of `@coremedia-internal/studio-client.playwright-config`: it fails a test on console and
 * page errors, runs cleanup tasks and connects to a remote browser if `CDP_ENDPOINT` is set. Console warnings
 * are not checked. The tests run against Storybook only, so none of the Studio options are passed.
 */
const test: StudioTestType = setupStudioTests({ failOnJsErrors: true });

export { expect, test };
