import type { Meta, StoryObj } from "@storybook/html";
import { defaultScenarioArgs, mountScenario, type ScenarioArgs } from "../../src/runtime";
import { createEditorScenario } from "../../src/editors";

/**
 * Dedicated scenario for `FontMapper.test.ts`: an empty CoreMedia RichText
 * editor (the richtext factory loads the FontMapper plugin). Pasting from a
 * Word HTML document is driven per test via the clipboard and the in-page
 * editor test API.
 */
const meta: Meta<ScenarioArgs> = {
  title: "Tests/FontMapper",
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
