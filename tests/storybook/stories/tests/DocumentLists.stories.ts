import type { Meta, StoryObj } from "@storybook/html";
import { defaultScenarioArgs, mountScenario, type ScenarioArgs } from "../../src/runtime";
import { createEditorScenario } from "../../src/editors";

/**
 * Dedicated scenario for `DocumentLists.test.ts`: an empty CoreMedia RichText
 * editor. List data is applied per test at runtime via the in-page editor test
 * API.
 */
const meta: Meta<ScenarioArgs> = {
  title: "Tests/DocumentLists",
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
