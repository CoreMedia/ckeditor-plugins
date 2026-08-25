/**
 * Constants baked into the prepared `Tests/HelloEditor` stories
 * (`tests/storybook/stories/tests/HelloEditor.stories.ts`) and asserted by
 * `tests/playwright/test/HelloEditor.test.ts`.
 *
 * Shared here so the story and its test reference the exact same literals
 * without mirroring them in both files. Story files are CSF — every named
 * export is treated as a story — so per-story fixtures like these must live
 * outside the story module.
 */
export const helloEditorScenario = {
  /**
   * Link text/target baked into the `ExternalLink` scenario.
   */
  externalLinkText: "Example Website",
  externalLinkTarget: "https://example.org",
  /**
   * Link text and backing content id baked into the `InternalLink` scenario.
   */
  internalLinkText: "Example Document",
  internalLinkContentId: 42,
} as const;
