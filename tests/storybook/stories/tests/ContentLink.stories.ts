import type { Meta, StoryObj } from "@storybook/html";
import { defaultScenarioArgs, mountScenario, type ScenarioArgs } from "../../src/runtime";
import { createEditorScenario } from "../../src/editors";

/**
 * Dedicated scenario for `ContentLink.test.ts`: an empty CoreMedia RichText
 * editor. Mock contents and link data are set up per test at runtime via the
 * in-page editor test API. The predefined mock contents (e.g. "Some Document",
 * "Some Folder") are provided automatically by `MockContentPlugin`.
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

/**
 * Empty RichText editor.
 */
export const Default: Story = {};
