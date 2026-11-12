/**
 * Constants baked into the prepared `Tests/ContentLink` stories
 * (`tests/storybook/stories/tests/ContentLink.stories.ts`) and used by
 * `tests/playwright/test/ContentLink.test.ts`.
 *
 * Each story is fully prepared for one test (mock content + content-link data
 * baked in), so the tests only open the story and drive the link balloon
 * through locators — no `page.evaluate`. The link texts mirror the original
 * test titles so the assertions stay identical.
 */

/**
 * Display name of the mock content backing a content link in these scenarios.
 *
 * @param linkText - link text the content is registered for
 */
export const contentLinkContentName = (linkText: string): string => `Document for test ${linkText}`;

export const contentLinkScenario = {
  /**
   * Variant asserting a content link renders with the resolved content name.
   */
  renderWithName: { id: 42, linkText: "Should render content-link with name" },
  /**
   * Variant asserting all balloon buttons are reachable via keyboard.
   */
  keyboardButtons: { id: 48, linkText: "Should be possible to reach all buttons with keyboard" },
  /**
   * Variant asserting an empty url cannot be saved (via the form).
   */
  emptyUrlForm: { id: 44, linkText: "Should be not possible to save content link with empty url" },
  /**
   * Variant asserting an empty url cannot be saved (via keyboard).
   */
  emptyUrlKeyboard: {
    id: 50,
    linkText: "Should not be possible to save content link with empty url using keyboard",
  },
  /**
   * Variant adding a content link with the keyboard only (mock content present,
   * editor starts empty).
   */
  addWithKeyboard: { id: 46, linkText: "Should be possible to add content link with keyboard only" },
} as const;
