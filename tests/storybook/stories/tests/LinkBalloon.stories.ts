import type { Meta, StoryObj } from "@storybook/html";
import { defaultScenarioArgs, mountScenario, type ScenarioArgs } from "../../src/runtime";
import { createEditorScenario } from "../../src/editors";

/**
 * Dedicated scenario for `LinkBalloon.test.ts`: an empty CoreMedia RichText
 * editor. The editor is configured (in the richtext factory) with the
 * keep-open ids/classes the test relies on. Link data and mock contents are set
 * up per test at runtime via the in-page editor test API.
 */
const meta: Meta<ScenarioArgs> = {
  title: "Tests/LinkBalloon",
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
