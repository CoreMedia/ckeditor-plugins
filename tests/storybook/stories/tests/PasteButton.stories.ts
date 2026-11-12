import type { Meta, StoryObj } from "@storybook/html";
import { richtext } from "@coremedia-internal/ckeditor5-coremedia-example-data";
import type { MockContentConfig } from "@coremedia-internal/ckeditor5-coremedia-studio-integration-mock";
import { pasteButtonInputElement, pasteButtonScenario } from "@coremedia/ckeditor5-itest-constants";
import { defaultScenarioArgs, mountScenario, type ScenarioArgs } from "../../src/runtime";
import { createEditorScenario } from "../../src/editors";

/**
 * Dedicated scenarios for `PasteButton.test.ts`.
 *
 * Each story is fully prepared for the test that consumes it: the backing mock
 * contents are registered and the draggable input-example element is created,
 * so the test only opens the story and drives the paste through locators — no
 * `page.evaluate`. The fixtures (input-element classes, mock-content ids/names
 * and image blobs) are shared with the test via
 * `@coremedia/ckeditor5-itest-constants` (`pasteButtonScenario`).
 */
const meta: Meta<ScenarioArgs> = {
  title: "Tests/PasteButton",
  args: {
    ...defaultScenarioArgs,
    dataType: "richtext",
  },
  render: (args) => mountScenario(createEditorScenario, args),
};

export default meta;

type Story = StoryObj<ScenarioArgs>;

type PasteButtonVariant = (typeof pasteButtonScenario)[keyof typeof pasteButtonScenario];

/**
 * Builds a prepared paste story: registers the variant's mock contents and a
 * draggable input-example element referencing them, with the editor preloaded
 * with the standard example richtext data. Image variants additionally expose
 * the `editor-data` output so the test can assert the image downcast through a
 * locator.
 */
const pasteButtonStory = ({ class: inputElementClass, contents }: PasteButtonVariant, exposeEditorData = false): Story => {
  const mockContents = contents as readonly MockContentConfig[];
  return {
    args: {
      mockContents: [...mockContents],
      inputExampleElements: [
        {
          label: pasteButtonInputElement.label,
          tooltip: pasteButtonInputElement.tooltip,
          items: mockContents.map((content) => content.id),
          classes: ["input-content", inputElementClass],
        },
      ],
      data: richtext(),
      outputs: exposeEditorData ? ["editor-data"] : [],
    },
  };
};

/**
 * Single non-embeddable content, pasted as a link.
 */
export const OneLink: Story = pasteButtonStory(pasteButtonScenario.oneLink);

/**
 * Several non-embeddable contents (one slow-loading), pasted as links.
 */
export const SlowLinks: Story = pasteButtonStory(pasteButtonScenario.slowLinks);

/**
 * Several non-embeddable contents, pasted as links.
 */
export const MultipleLinks: Story = pasteButtonStory(pasteButtonScenario.multipleLinks);

/**
 * Single non-embeddable content, pasted as a link via keyboard shortcut.
 */
export const PasteViaKeyboardLink: Story = pasteButtonStory(pasteButtonScenario.pasteViaKeyboardLink);

/**
 * Single embeddable content, pasted as an image.
 */
export const OneImage: Story = pasteButtonStory(pasteButtonScenario.oneImage, true);

/**
 * Several embeddable contents, pasted as images.
 */
export const MultipleImages: Story = pasteButtonStory(pasteButtonScenario.multipleImages, true);

/**
 * Several embeddable contents (one slow-loading), pasted as images.
 */
export const SlowImages: Story = pasteButtonStory(pasteButtonScenario.slowImages, true);
