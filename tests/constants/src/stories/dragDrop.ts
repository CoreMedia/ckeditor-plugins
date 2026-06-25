import { PNG_BLUE_240x135, PNG_GREEN_240x135, PNG_RED_240x135 } from "../mockFixtures";

/**
 * Fixtures baked into the prepared `Tests/DragDrop` stories
 * (`tests/storybook/stories/tests/DragDrop.stories.ts`) and asserted by
 * `tests/playwright/test/DragDrop.test.ts`.
 *
 * Each variant pairs the CSS class of its draggable input-example element with
 * the mock (or external) contents that element references. The stories register
 * the contents, create the draggable input-example element and expose the
 * dropability evaluation via the `is-droppable-state` /
 * `is-droppable-in-link-balloon` observable outputs, so the test only opens the
 * matching story and drives the drag-and-drop through locators — no
 * `page.evaluate`.
 *
 * The mock-content literals stay free of the mock-package types on purpose, so
 * this shared package keeps no dependency on the studio-integration-mock
 * package; the stories assign them to their typed args.
 */

/**
 * Label and tooltip shared by every drag-and-drop input-example element.
 */
export const dragDropInputElement = {
  label: "Drag And Drop Test",
  tooltip: "test-element",
} as const;

/**
 * Rich-text content uri for a mock content id (drag source for content drops).
 */
export const dragDropContentUri = (id: number): string => `content/${id}`;

/**
 * External uri for a mock external content id (drag source for external drops).
 */
export const dragDropExternalUri = (id: number): string => `externalUri/${id}`;

export const dragDropScenario = {
  links: {
    /**
     * Single non-embeddable content dropped as a link.
     */
    oneLink: {
      class: "one-link",
      contents: [{ id: 10000, name: "Document 10000" }],
    },
    /**
     * Several non-embeddable contents (one slow-loading) dropped as links.
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
     * Several non-embeddable contents dropped as links.
     */
    multipleLinks: {
      class: "multiple-links",
      contents: [
        { id: 10008, name: "Document: 10008" },
        { id: 10010, name: "Document: 10010" },
        { id: 10012, name: "Document 10012" },
      ],
    },
  },
  externalLinks: {
    /**
     * Single not-yet-imported external content dropped as a link.
     */
    externalLink: {
      class: "external-link",
      external: [
        {
          id: 22000,
          contentAfterImport: { id: 22000, name: "Document 22000", type: "linkable" },
          isAlreadyImported: false,
          errorWhileImporting: false,
        },
      ],
    },
    /**
     * Single already-imported external content dropped as a link.
     */
    alreadyImported: {
      class: "already-imported-external-link",
      external: [
        {
          id: 23000,
          contentAfterImport: { id: 23000, name: "Existing Document 23000", type: "linkable" },
          isAlreadyImported: true,
          errorWhileImporting: false,
        },
      ],
    },
    /**
     * Several not-yet-imported external contents dropped as links.
     */
    multipleExternal: {
      class: "multiple-external-links",
      external: [
        {
          id: 24000,
          contentAfterImport: { id: 24000, name: "Document 24000", type: "linkable" },
          isAlreadyImported: false,
          errorWhileImporting: false,
        },
        {
          id: 25000,
          contentAfterImport: { id: 25000, name: "Document 25000", type: "linkable" },
          isAlreadyImported: false,
          errorWhileImporting: false,
        },
        {
          id: 26000,
          contentAfterImport: { id: 26000, name: "Document 26000", type: "linkable" },
          isAlreadyImported: false,
          errorWhileImporting: false,
        },
      ],
    },
    /**
     * Mixed already-imported and not-imported external contents dropped as
     * links.
     */
    multipleMixed: {
      class: "multiple-imported-and-not-imported-external-links",
      external: [
        {
          id: 27000,
          contentAfterImport: { id: 27000, name: "Document 27000", type: "linkable" },
          isAlreadyImported: false,
          errorWhileImporting: false,
        },
        {
          id: 28000,
          contentAfterImport: { id: 28000, name: "Document 28000", type: "linkable" },
          isAlreadyImported: true,
          errorWhileImporting: false,
        },
      ],
    },
  },
  balloon: {
    /**
     * Single not-yet-imported external content dropped into the link balloon's
     * url field. Reuses the `externalLink` content (id 22000).
     */
    externalContent: {
      class: "external-content",
      external: [
        {
          id: 22000,
          contentAfterImport: { id: 22000, name: "Document 22000", type: "linkable" },
          isAlreadyImported: false,
          errorWhileImporting: false,
        },
      ],
    },
  },
  images: {
    /**
     * Single embeddable content dropped as an image.
     */
    oneImage: {
      class: "one-image",
      contents: [{ id: 100014, name: "Document 100014", blob: PNG_RED_240x135, embeddable: true, linkable: true }],
    },
    /**
     * Several embeddable contents dropped as images.
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
     * Several embeddable contents (one slow-loading) dropped as images.
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
  },
} as const;
