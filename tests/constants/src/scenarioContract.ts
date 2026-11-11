/**
 * Stable contract of the scenario container a Storybook story renders, shared
 * between the Storybook runtime (`tests/storybook/src/runtime/mountStory.ts`)
 * and the Playwright locators (`tests/playwright/test/locators/storybook.ts`).
 *
 * Both packages used to keep independent copies of these literals in sync by
 * hand; importing them from here removes that duplication.
 */

/**
 * Id of the element the editor is mounted into. Kept identical to the former
 * application (`editor`) so existing editing-view selectors keep working.
 */
export const EDITOR_ELEMENT_ID = "editor";

/**
 * Class of the scenario container element rendered by a story.
 */
export const SCENARIO_CONTAINER_CLASS = "storybook-editor-scenario";

/**
 * Attribute set on the scenario container once the editor finished
 * initializing. Playwright waits for this readiness signal before interacting
 * with a story.
 */
export const EDITOR_READY_ATTRIBUTE = "data-editor-ready";

/**
 * Class of the shadow host element a scenario renders inside its container when
 * mounted with `shadowDom: true`. The editor host element (see
 * {@link EDITOR_ELEMENT_ID}) then lives inside the open shadow root of this
 * element.
 */
export const SHADOW_HOST_CLASS = "storybook-editor-shadow-host";

/**
 * Class of the shadow host element appended to the end of `document.body` when
 * a scenario is mounted with `shadowDom: true`. Its open shadow root is
 * configured as `config.ui.overlayContainer`, so CKEditor's floating UI
 * (balloons, tooltips) renders inside it.
 */
export const OVERLAY_HOST_CLASS = "storybook-editor-overlay-host";
