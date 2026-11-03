/**
 * Constants baked into the prepared `Tests/ShadowDom` stories
 * (`tests/storybook/stories/tests/ShadowDom.stories.ts`) and asserted by
 * `tests/playwright/test/ShadowDom.test.ts`.
 *
 * Shared here so the story and its test reference the exact same literals
 * without mirroring them in both files.
 */
export const shadowDomScenario = {
  /**
   * Text typed into the empty editor of the `Typing` scenario.
   */
  typedText: "Typed inside a shadow root",
  /**
   * Text of the single paragraph baked into the `HeadingDropdown` scenario.
   */
  paragraphText: "Paragraph inside a shadow root",
  /**
   * Link text and backing content id baked into the `ContentLink` scenario.
   */
  linkText: "Shadow Document",
  contentId: 42,
} as const;
