import type { Meta, StoryObj } from "@storybook/html";
import { defaultScenarioArgs, mountScenario, type ScenarioArgs } from "../../src/runtime";
import { createEditorScenario } from "../../src/editors";

/**
 * Dedicated scenario for `BBCode.test.ts`: an empty BBCode editor. The test
 * sets the BBCode data at runtime via the in-page editor test API.
 */
const meta: Meta<ScenarioArgs> = {
  title: "Tests/BBCode",
  args: {
    ...defaultScenarioArgs,
    dataType: "bbcode",
  },
  render: (args) => mountScenario(createEditorScenario, args),
};

export default meta;

type Story = StoryObj<ScenarioArgs>;

/**
 * Empty BBCode editor.
 */
export const Default: Story = {};
