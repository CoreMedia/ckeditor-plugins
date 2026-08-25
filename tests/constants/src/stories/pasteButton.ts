import { PNG_BLUE_240x135, PNG_GREEN_240x135, PNG_RED_240x135 } from "../mockFixtures";

/**
 * Fixtures baked into the prepared `Tests/PasteButton` stories
 * (`tests/storybook/stories/tests/PasteButton.stories.ts`) and asserted by
 * `tests/playwright/test/PasteButton.test.ts`.
 *
 * Each variant pairs the CSS class of its draggable input-example element with
 * the mock contents that element references. The stories register the mock
 * contents and create the input-example element, so the test only opens the
 * matching story and drives the paste through locators — no `page.evaluate`.
 *
 * The mock-content literals stay free of the mock-package types on purpose, so
 * this shared package keeps no dependency on the studio-integration-mock
 * package; the story assigns them to its typed `mockContents` arg.
 */

/**
 * Label and tooltip shared by every paste input-example element.
 */
export const pasteButtonInputElement = {
  label: "Paste Test",
  tooltip: "test-element",
} as const;

export const pasteButtonScenario = {
  /**
   * Single non-embeddable content pasted as a link.
   */
  oneLink: {
    class: "one-link",
    contents: [{ id: 10000, name: "Document 10000" }],
  },
  /**
   * Several non-embeddable contents (one slow-loading) pasted as links.
   */
  slowLinks: {
    class: "multiple-links-slow",
    contents: [
      { id: 10002, name: "Document: 10002" },
      { id: 10004, name: "Document: 10004", initialDelayMs: 1000 },
      { id: 10006, name: "Document 10006" },
    ],
  },
  /**
   * Several non-embeddable contents pasted as links.
   */
  multipleLinks: {
    class: "multiple-links",
    contents: [
      { id: 10008, name: "Document: 10008" },
      { id: 10010, name: "Document: 10010" },
      { id: 10012, name: "Document 10012" },
    ],
  },
  /**
   * Single non-embeddable content pasted as a link via keyboard shortcut.
   */
  pasteViaKeyboardLink: {
    class: "paste-via-keyboard-link",
    contents: [{ id: 10000, name: "Document 10000" }],
  },
  /**
   * Single embeddable content pasted as an image.
   */
  oneImage: {
    class: "one-image",
    contents: [{ id: 100014, name: "Document 100014", blob: PNG_RED_240x135, embeddable: true, linkable: true }],
  },
  /**
   * Several embeddable contents pasted as images.
   */
  multipleImages: {
    class: "multiple-images",
    contents: [
      { id: 100016, name: "Document 100016", blob: PNG_RED_240x135, embeddable: true, linkable: true },
      { id: 100018, name: "Document 100018", blob: PNG_BLUE_240x135, embeddable: true, linkable: true },
      { id: 100020, name: "Document 100020", blob: PNG_GREEN_240x135, embeddable: true, linkable: true },
    ],
  },
  /**
   * Several embeddable contents (one slow-loading) pasted as images.
   */
  slowImages: {
    class: "multiple-images-slow",
    contents: [
      { id: 100022, name: "Document 100022", blob: PNG_RED_240x135, embeddable: true, linkable: true },
      {
        id: 100024,
        name: "Document 100024",
        blob: PNG_BLUE_240x135,
        initialDelayMs: 1000,
        embeddable: true,
        linkable: true,
      },
      { id: 100026, name: "Document 100026", blob: PNG_GREEN_240x135, embeddable: true, linkable: true },
    ],
  },
} as const;
