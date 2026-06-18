import type { Meta, StoryObj } from "@storybook/html";
import { defaultScenarioArgs, mountScenario, type ScenarioArgs } from "../../src/runtime";
import { createEditorScenario } from "../../src/editors";

/**
 * Dedicated scenario for `LinkUserInteraction.test.ts`: an empty CoreMedia
 * RichText editor. Link data, mock contents and read-only state are applied per
 * test at runtime via the in-page editor test API.
 */
const meta: Meta<ScenarioArgs> = {
  title: "Tests/LinkUserInteraction",
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
