/**
 * Constants baked into the prepared `Tests/Blocklist` story
 * (`tests/storybook/stories/tests/Blocklist.stories.ts`) and used by
 * `tests/playwright/test/Blocklist.test.ts`.
 *
 * Shared here so the story data and the test's locators/assertions reference the
 * exact same literals instead of mirroring them in both files.
 */
export const blocklistScenario = {
  /**
   * Paragraph texts baked into the prepared editor data.
   */
  helloWorldText: "Hello World!",
  contentText: "Content",
  exampleText: "This is an example text for test purposes.",
  /**
   * Word the test adds to the blocklist (matches `contentText`
   * case-insensitively).
   */
  blockedWord: "content",
} as const;
