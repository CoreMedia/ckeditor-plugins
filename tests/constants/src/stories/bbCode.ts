/**
 * Constants baked into the prepared `Tests/BBCode` story
 * (`tests/storybook/stories/tests/BBCode.stories.ts`) and asserted by
 * `tests/playwright/test/BBCode.test.ts`.
 *
 * Shared here so the story data and its test assertion reference the exact same
 * literal instead of mirroring it in both files.
 */
export const bbCodeScenario = {
  /**
   * Word wrapped in `[b]…[/b]` in the prepared story; rendered as `<strong>`.
   */
  boldWord: "boldword",
} as const;
