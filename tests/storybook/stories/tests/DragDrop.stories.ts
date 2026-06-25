import type { Meta, StoryObj } from "@storybook/html";
import { richtext } from "@coremedia-internal/ckeditor5-coremedia-example-data";
import type { MockContentConfig, MockExternalContent } from "@coremedia-internal/ckeditor5-coremedia-studio-integration-mock";
import {
  dragDropContentUri,
  dragDropExternalUri,
  dragDropInputElement,
  dragDropScenario,
} from "@coremedia/ckeditor5-itest-constants";
import { defaultScenarioArgs, mountScenario, type ScenarioArgs } from "../../src/runtime";
import { createEditorScenario } from "../../src/editors";

/**
 * Dedicated scenarios for `DragDrop.test.ts`.
 *
 * Each story is fully prepared for the test that consumes it: the backing mock
 * (or external) contents are registered, the draggable input-example element is
 * created, the editor is preloaded with the standard example richtext data and
 * the dropability evaluation is exposed via the `is-droppable-state` /
 * `is-droppable-in-link-balloon` observable outputs. The test only opens the
 * matching story and drives the drag-and-drop through locators — no
 * `page.evaluate`. The fixtures are shared with the test via
 * `@coremedia/ckeditor5-itest-constants` (`dragDropScenario`).
 */
const meta: Meta<ScenarioArgs> = {
  title: "Tests/DragDrop",
  args: {
    ...defaultScenarioArgs,
    dataType: "richtext",
  },
  render: (args) => mountScenario(createEditorScenario, args),
};

export default meta;

type Story = StoryObj<ScenarioArgs>;

type ContentVariant = { class: string; contents: readonly MockContentConfig[] };
type ExternalVariant = { class: string; external: readonly MockExternalContent[] };
type ExternalContentItem = { externalId: number };

const inputExampleElement = (inputElementClass: string, items: (number | ExternalContentItem)[]) => ({
  label: dragDropInputElement.label,
  tooltip: dragDropInputElement.tooltip,
  items,
  classes: ["input-content", inputElementClass],
});

/**
 * Builds a prepared content drag story: registers the mock contents, a
 * draggable input-example element referencing them and exposes the rich-text
 * dropability evaluation. Image variants additionally expose `editor-data`.
 */
const contentDragStory = ({ class: inputElementClass, contents }: ContentVariant, exposeEditorData = false): Story => ({
  args: {
    mockContents: [...contents],
    inputExampleElements: [inputExampleElement(inputElementClass, contents.map((content) => content.id))],
    droppableUris: contents.map((content) => dragDropContentUri(content.id)),
    data: richtext(),
    outputs: exposeEditorData ? ["editor-data", "is-droppable-state"] : ["is-droppable-state"],
  },
});

/**
 * Builds a prepared external-content drag story: registers the mock external
 * contents (and the imported content for already-imported ones), a draggable
 * input-example element referencing them and exposes the rich-text dropability
 * evaluation.
 */
const externalDragStory = ({ class: inputElementClass, external }: ExternalVariant): Story => {
  const importedContents = external
    .filter((content) => content.isAlreadyImported && content.contentAfterImport)
    .map((content) => content.contentAfterImport as MockContentConfig);
  return {
    args: {
      mockContents: importedContents,
      mockExternalContents: [...external],
      inputExampleElements: [
        inputExampleElement(
          inputElementClass,
          external.map((content) => ({ externalId: content.id })),
        ),
      ],
      droppableUris: external.map((content) => dragDropExternalUri(content.id)),
      data: richtext(),
      outputs: ["is-droppable-state"],
    },
  };
};

/**
 * Single non-embeddable content, dropped as a link.
 */
export const OneLink: Story = contentDragStory(dragDropScenario.links.oneLink);

/**
 * Several non-embeddable contents (one slow-loading), dropped as links.
 */
export const SlowLinks: Story = contentDragStory(dragDropScenario.links.slowLinks);

/**
 * Several non-embeddable contents, dropped as links.
 */
export const MultipleLinks: Story = contentDragStory(dragDropScenario.links.multipleLinks);

/**
 * Single not-yet-imported external content, dropped as a link.
 */
export const ExternalLink: Story = externalDragStory(dragDropScenario.externalLinks.externalLink);

/**
 * Single already-imported external content, dropped as a link.
 */
export const AlreadyImportedExternalLink: Story = externalDragStory(dragDropScenario.externalLinks.alreadyImported);

/**
 * Several not-yet-imported external contents, dropped as links.
 */
export const MultipleExternalLinks: Story = externalDragStory(dragDropScenario.externalLinks.multipleExternal);

/**
 * Mixed already-imported and not-imported external contents, dropped as links.
 */
export const MultipleMixedExternalLinks: Story = externalDragStory(dragDropScenario.externalLinks.multipleMixed);

/**
 * Single not-yet-imported external content, dropped into the link balloon's url
 * field. Exposes the link-balloon dropability evaluation.
 */
export const ExternalLinkIntoBalloon: Story = {
  args: {
    mockExternalContents: [...dragDropScenario.balloon.externalContent.external],
    inputExampleElements: [
      inputExampleElement(
        dragDropScenario.balloon.externalContent.class,
        dragDropScenario.balloon.externalContent.external.map((content) => ({ externalId: content.id })),
      ),
    ],
    droppableUris: dragDropScenario.balloon.externalContent.external.map((content) => dragDropExternalUri(content.id)),
    data: richtext(),
    outputs: ["is-droppable-in-link-balloon"],
  },
};

/**
 * Single embeddable content, dropped as an image.
 */
export const OneImage: Story = contentDragStory(dragDropScenario.images.oneImage, true);

/**
 * Several embeddable contents, dropped as images.
 */
export const MultipleImages: Story = contentDragStory(dragDropScenario.images.multipleImages, true);

/**
 * Several embeddable contents (one slow-loading), dropped as images.
 */
export const SlowImages: Story = contentDragStory(dragDropScenario.images.slowImages, true);
