import type { Meta, StoryObj } from "@storybook/html";
import { defaultScenarioArgs, mountScenario, type ScenarioArgs } from "../../src/runtime";
import { createEditorScenario } from "../../src/editors";

/**
 * Dedicated scenario for `PasteButton.test.ts`: an empty CoreMedia RichText
 * editor. Mock contents and input-example elements are created per test at
 * runtime via the in-page editor test API.
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

/**
 * Empty RichText editor.
 */
export const Default: Story = {};
