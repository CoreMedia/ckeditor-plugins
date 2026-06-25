/**
 * Descriptors for the prepared `Tests/LinkUserInteraction` stories
 * (`tests/storybook/stories/tests/LinkUserInteraction.stories.ts`) and
 * `tests/playwright/test/LinkUserInteraction.test.ts`.
 *
 * Each story is fully prepared for a pair of tests (mouse + keyboard variant):
 * the link data, the backing mock content (for content links) and the read-only
 * state are baked in, so the test only opens the story and drives the link
 * through locators — no `page.evaluate`. The link texts (formerly the test
 * titles) are shared here so the story (which bakes the link) and the test (which
 * locates the link by text) stay in sync.
 *
 * Each `id` is the kebab-cased Storybook story id suffix; the matching story
 * export name (PascalCase) resolves to `tests-linkuserinteraction--<id>`.
 */

/**
 * External URL used by the external-link scenarios.
 */
export const externalLinkUrl = "https://www.coremedia.com/";

/**
 * Display name of the mock content backing a content link.
 *
 * @param linkText - link text the content is registered for
 */
export const linkInteractionContentName = (linkText: string): string => `Document for test ${linkText}`;

/**
 * Prepared link-interaction scenarios. Each variant backs both the mouse
 * (Ctrl/Meta + click) and the keyboard (Alt+Enter) test of its kind.
 */
export const linkUserInteractionScenario = {
  /**
   * Read/write editor with an external link.
   */
  externalLink: {
    id: "external-link",
    linkText: "External link interaction",
    url: externalLinkUrl,
  },
  /**
   * Read-only editor with an external link.
   */
  externalLinkReadOnly: {
    id: "external-link-read-only",
    linkText: "External link interaction read-only",
    url: externalLinkUrl,
  },
  /**
   * Read/write editor with a content link.
   */
  contentLink: {
    id: "content-link",
    contentId: 42,
    linkText: "Content link interaction",
    expectedOpenedEntities: ["content/42"],
  },
  /**
   * Read-only editor with a content link.
   */
  contentLinkReadOnly: {
    id: "content-link-read-only",
    contentId: 42,
    linkText: "Content link interaction read-only",
    expectedOpenedEntities: ["content/42"],
  },
} as const;
