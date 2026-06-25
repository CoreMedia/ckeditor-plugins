/**
 * Constants for the prepared `Tests/LinkBalloon` story
 * (`tests/storybook/stories/tests/LinkBalloon.stories.ts`) and
 * `tests/playwright/test/LinkBalloon.test.ts`.
 *
 * The story bakes in a content link and renders the helper fixture elements the
 * test interacts with (a draggable element and two "keep the balloon open on
 * click" elements). The keep-open id/class are also referenced by the editor
 * configuration (`tests/storybook/src/editors/richtext.ts`), so they live here
 * as the single source of truth.
 */
export const linkBalloonScenario = {
  /**
   * Backing mock content / content link the test opens the balloon on.
   */
  contentId: 42,
  linkText: "Link Balloon content link",
  /**
   * Id of the draggable fixture element. Clicking it closes the balloon;
   * mousedown on it keeps the balloon open.
   */
  draggableElementId: "draggable-element-for-link-balloon-test",
  /**
   * Id configured in CKEditor to keep the link balloon open on click.
   */
  keepOpenElementId: "example-to-keep-the-link-balloon-open-on-click",
  /**
   * Class configured in CKEditor to keep the link balloon open on click.
   */
  keepOpenElementClass: "example-class-to-keep-the-link-balloon-open-on-click",
} as const;
