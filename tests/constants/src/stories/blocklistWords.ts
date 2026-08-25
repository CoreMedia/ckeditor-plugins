/**
 * Constants baked into the prepared `Tests/BlocklistCollapsed`,
 * `Tests/BlocklistExpandedKeyboard` and `Tests/BlocklistExpandedToolbar` stories
 * and used by the matching tests in `tests/playwright/test`.
 *
 * These scenarios pre-register blocked words (via the `blockedWords` arg) and
 * bake the editor data into the story, so the tests only open the story and
 * assert through locators — no `page.evaluate`.
 */
export const blocklistWordsScenario = {
  /**
   * Paragraph text that is never blocked.
   */
  notBlockedText: "Hello World!",
  /**
   * Words pre-registered with the mock blocklist service and present in the
   * prepared data.
   */
  blockedWord: "thisisablockedword",
  anotherBlockedWord: "anotherBlockedWord",
  /**
   * Trailing example paragraph.
   */
  exampleText: "This is an example text for test purposes.",
} as const;
