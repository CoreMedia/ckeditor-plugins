import type { Meta, StoryObj } from "@storybook/html";
import { a, p, richtext } from "@coremedia-internal/ckeditor5-coremedia-example-data";
import { contentUriPath } from "@coremedia/ckeditor5-coremedia-studio-integration";
import { contentLinkContentName, contentLinkScenario } from "@coremedia/ckeditor5-itest-constants";
import { defaultScenarioArgs, mountScenario, type ScenarioArgs } from "../../src/runtime";
import { createEditorScenario } from "../../src/editors";

/**
 * Dedicated scenarios for `ContentLink.test.ts`.
 *
 * Each story is fully prepared for the test that consumes it: the backing mock
 * content and the content-link data are baked in, so the test only opens the
 * story and drives the link balloon through locators — no `page.evaluate`. The
 * predefined mock contents (e.g. "Some Document", "Some Folder") are provided
 * automatically by `MockContentPlugin`. The literals are shared with the test
 * via `@coremedia/ckeditor5-itest-constants` (`contentLinkScenario`).
 */
const meta: Meta<ScenarioArgs> = {
  title: "Tests/ContentLink",
  args: {
    ...defaultScenarioArgs,
    dataType: "richtext",
  },
  render: (args) => mountScenario(createEditorScenario, args),
};

export default meta;

type Story = StoryObj<ScenarioArgs>;

type ContentLinkVariant = (typeof contentLinkScenario)[
  | "renderWithName"
  | "keyboardButtons"
  | "emptyUrlForm"
  | "emptyUrlKeyboard"];

/**
 * Builds a prepared content-link story: registers the backing mock content and
 * loads a single content link pointing at it.
 */
const contentLinkStory = ({ id, linkText }: ContentLinkVariant): Story => ({
  args: {
    mockContents: [{ id, name: contentLinkContentName(linkText) }],
    data: richtext(p(a(linkText, { "xlink:href": contentUriPath(id) }))),
  },
});

/**
 * Content link whose resolved content name is asserted in the balloon.
 */
export const RenderWithName: Story = contentLinkStory(contentLinkScenario.renderWithName);

/**
 * Content link used to walk all balloon buttons via keyboard.
 */
export const KeyboardButtons: Story = contentLinkStory(contentLinkScenario.keyboardButtons);

/**
 * Content link used to assert an empty url cannot be saved via the form.
 */
export const EmptyUrlForm: Story = contentLinkStory(contentLinkScenario.emptyUrlForm);

/**
 * Content link used to assert an empty url cannot be saved via keyboard.
 */
export const EmptyUrlKeyboard: Story = contentLinkStory(contentLinkScenario.emptyUrlKeyboard);

/**
 * Empty editor with the mock content present, used to add a content link with
 * the keyboard only.
 */
export const AddWithKeyboard: Story = {
  args: {
    mockContents: [
      {
        id: contentLinkScenario.addWithKeyboard.id,
        name: contentLinkContentName(contentLinkScenario.addWithKeyboard.linkText),
      },
    ],
  },
};

/**
 * Empty editor used to select a content from the link-field suggestions (backed
 * by the predefined mock contents).
 */
export const SelectFromSuggestions: Story = {};
