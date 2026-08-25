/**
 * Descriptors for the prepared `Tests/Images` stories
 * (`tests/storybook/stories/tests/Images.stories.ts`) and
 * `tests/playwright/test/Images.test.ts`.
 *
 * Each story is fully prepared for one test: the backing mock image content(s)
 * and the image richtext data are baked in, so the test only opens the story and
 * drives the editor through locators — no `page.evaluate`. The literals (content
 * names, ids, expected resolved image blobs) are shared here so the story (which
 * bakes `data`/`mockContents`) and the test (which asserts on the same values)
 * stay in sync.
 *
 * Each `id` is the kebab-cased Storybook story id suffix; the matching story
 * export name (PascalCase) resolves to `tests-images--<id>`.
 */

import { PNG_EMPTY_24x24, PNG_LOCK_24x24, PNG_RED_240x135 } from "../mockFixtures";

/**
 * A single "Media Representation" case: a content whose image blob resolves
 * (after server round-trip) to a specific image in the editing view.
 */
export interface ImageMediaCase {
  /**
   * Kebab-cased story id suffix.
   */
  id: string;
  /**
   * Id of the backing mock content (referenced via `xlink:href`).
   */
  contentId: number;
  /**
   * Content display name, also used as the image `alt` text.
   */
  name: string;
  /**
   * Blob the mock content is registered with (omitted = no data available).
   */
  blob?: string;
  /**
   * Initial loading delay of the mock blob in milliseconds.
   */
  initialDelayMs?: number;
  /**
   * Whether the mock content is readable.
   */
  readable?: boolean;
  /**
   * Image `src` expected in the editing view once resolved from the server.
   */
  expectedImage: string;
}

/**
 * The four "Media Representation" cases (fast, slow, unreadable, no-data).
 */
export const imageMediaCases: ImageMediaCase[] = [
  {
    id: "normal-fast",
    contentId: 42,
    name: "Normal document with fast loading image",
    blob: PNG_RED_240x135,
    expectedImage: PNG_RED_240x135,
  },
  {
    id: "slow-loading",
    contentId: 42,
    name: "Normal document with slowly loading image",
    blob: PNG_RED_240x135,
    initialDelayMs: 2000,
    expectedImage: PNG_RED_240x135,
  },
  {
    id: "unreadable",
    contentId: 42,
    name: "Document with unreadable image",
    // This blob doesn't matter as the content is unreadable.
    blob: PNG_RED_240x135,
    readable: false,
    expectedImage: PNG_LOCK_24x24,
  },
  {
    id: "no-data",
    contentId: 42,
    name: "Document with an empty image (no data available)",
    blob: undefined,
    expectedImage: PNG_EMPTY_24x24,
  },
];

/**
 * Display name of the mock content backing an image in the interaction-oriented
 * image scenarios.
 *
 * @param testName - test title the content is registered for
 */
export const imageDocumentName = (testName: string): string => `Document for test ${testName}`;

const alignmentName = "Should correctly set Image Alignment";
const openInTabEnabledName = "Should trigger open in tab for image from balloon";
const openInTabDisabledName = "Should not be able to trigger open in tab for image from balloon";
const noLinkName = "Should have no link and the link button in the contextual balloon is not pressed";
const withLinkName =
  "Should have a link, contextual balloon link button is pressed and the balloon switches on click to show the link";

/**
 * Descriptors for the interaction-oriented image scenarios (invalid href,
 * alignment, open-in-tab, image links).
 */
export const imagesScenario = {
  /**
   * Broken image with an empty `xlink:href` (no mock content).
   */
  invalidHref: {
    id: "invalid-href",
    name: "Should correctly render broken image with empty src",
  },
  /**
   * Single image used to walk through the alignment buttons.
   */
  alignment: {
    id: "alignment",
    contentId: 42,
    name: alignmentName,
    contentName: imageDocumentName(alignmentName),
  },
  openInTab: {
    /**
     * Readable image whose "Open in tab" action is expected to be enabled.
     */
    enabled: {
      id: "open-in-tab-enabled",
      contentId: 42,
      name: openInTabEnabledName,
      contentName: imageDocumentName(openInTabEnabledName),
      expectedOpenedEntities: ["content/42"],
    },
    /**
     * Unreadable image whose "Open in tab" action is expected to be disabled.
     */
    disabled: {
      id: "open-in-tab-disabled",
      contentId: 42,
      name: openInTabDisabledName,
      contentName: imageDocumentName(openInTabDisabledName),
    },
  },
  links: {
    /**
     * Image without a surrounding content link.
     */
    noLink: {
      id: "links-no-link",
      contentId: 42,
      name: noLinkName,
      contentName: imageDocumentName(noLinkName),
    },
    /**
     * Image wrapped in a content link pointing at another content.
     */
    withLink: {
      id: "links-with-link",
      imageId: 42,
      linkedContentId: 46,
      name: withLinkName,
      contentName: imageDocumentName(withLinkName),
      linkedContentName: `Document to link to the image for test ${withLinkName}`,
    },
  },
} as const;
