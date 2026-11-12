import type { Meta, StoryObj } from "@storybook/html";
import type { MockContentConfig } from "@coremedia-internal/ckeditor5-coremedia-studio-integration-mock";
import { PNG_BLUE_240x135, differencingScenario } from "@coremedia/ckeditor5-itest-constants";
import { defaultScenarioArgs, mountScenario, type ScenarioArgs } from "../../src/runtime";
import { createEditorScenario } from "../../src/editors";

/**
 * Dedicated, fully prepared scenarios for `Differencing.test.ts`.
 *
 * Server-side differencing augments data with `<xdiff:span>` elements. Each
 * story bakes one test's augmented richtext `data` and exposes the processed
 * `data-view` observable output, so the test only opens the story and asserts
 * through the `dataView` locator and editing-view locators — no `page.evaluate`.
 * The augmented data and the strings the test asserts on are generated once and
 * shared via `@coremedia/ckeditor5-itest-constants` (`differencingScenario`).
 *
 * Different to in-production use, where differencing is only active in read-only
 * view, the scenarios use differencing in R/W view (the richtext factory loads
 * the Differencing plugin).
 */
const meta: Meta<ScenarioArgs> = {
  title: "Tests/Differencing",
  args: {
    ...defaultScenarioArgs,
    dataType: "richtext",
  },
  render: (args) => mountScenario(createEditorScenario, args),
};

export default meta;

type Story = StoryObj<ScenarioArgs>;

const dataViewStory = (data: string): Story => ({
  args: {
    data,
    outputs: ["data-view"],
  },
});

const { textCases, allAttributes, falsePositiveNewline, addedNewline, image } = differencingScenario;

const [addition, removal, change, conflict] = textCases;

/**
 * Text difference of type "added".
 */
export const Addition: Story = dataViewStory(addition.data);

/**
 * Text difference of type "removed".
 */
export const Removal: Story = dataViewStory(removal.data);

/**
 * Text difference of type "changed".
 */
export const Change: Story = dataViewStory(change.data);

/**
 * Text difference of type "conflict".
 */
export const Conflict: Story = dataViewStory(conflict.data);

/**
 * Sequence of all difference types, used to assert that every `xdiff:span`
 * attribute is forwarded to the editing view.
 */
export const AllAttributes: Story = dataViewStory(allAttributes.data);

/**
 * Bold word followed by a trailing-space difference, used to assert the
 * false-positive newline is prevented.
 */
export const FalsePositiveNewline: Story = dataViewStory(falsePositiveNewline.data);

/**
 * Added newline, used to assert it passes to the editing view as an empty
 * element.
 */
export const AddedNewline: Story = dataViewStory(addedNewline.data);

/**
 * Image whose `xdiff:changetype` augmentation must be passed to the editing
 * view. Backed by a mock content providing the referenced image blob.
 */
export const ImageChangetype: Story = {
  args: {
    mockContents: [
      {
        id: image.contentId,
        blob: PNG_BLUE_240x135,
        name: image.contentName,
      } as MockContentConfig,
    ],
    data: image.data,
  },
};
