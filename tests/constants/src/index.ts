/**
 * Constants shared between the Storybook (`@coremedia/ckeditor5-storybook-itest`)
 * and Playwright (`@coremedia/ckeditor5-playwright-itest`) integration-test
 * packages. Centralizing them here replaces the former "kept in sync by value"
 * copies that lived independently in each package.
 */
export * from "./scenarioContract";
export * from "./outputs";
export * from "./testApi";
export * from "./stories/bbCode";
export * from "./stories/blocklist";
export * from "./stories/blocklistWords";
export * from "./stories/contentLink";
export * from "./stories/helloEditor";
