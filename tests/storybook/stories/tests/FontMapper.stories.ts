import type { Meta, StoryObj } from "@storybook/html";
import { defaultScenarioArgs, mountScenario, type ScenarioArgs } from "../../src/runtime";
import { createEditorScenario } from "../../src/editors";

/**
 * Dedicated scenario for `FontMapper.test.ts`: an empty CoreMedia RichText
 * editor (the richtext factory loads the FontMapper plugin) that exposes the
 * `editor-data` observable output, so the test can assert the pasted/mapped
 * content through a locator instead of `page.evaluate`. The paste itself is
 * driven by the test via the browser clipboard.
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
 * Empty RichText editor exposing its live editor data.
 */
export const Default: Story = {
  args: {
    outputs: ["editor-data"],
  },
};
