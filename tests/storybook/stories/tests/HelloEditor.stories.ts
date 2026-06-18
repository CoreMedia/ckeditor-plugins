import type { Meta, StoryObj } from "@storybook/html";
import { richTextData } from "@coremedia-internal/ckeditor5-coremedia-example-data";
import { defaultScenarioArgs, mountScenario, type ScenarioArgs } from "../../src/runtime";
import { createEditorScenario } from "../../src/editors";

/**
 * Dedicated scenario for `HelloEditor.test.ts`.
 *
 * Mirrors the former application default: a CoreMedia RichText editor preloaded
 * with the "Welcome" example data (which renders the `CoreMedia` showcase
 * heading the test asserts on). Individual tests may still replace the data at
 * runtime via the in-page editor test API.
 */
const meta: Meta<ScenarioArgs> = {
  title: "Tests/HelloEditor",
  args: {
    ...defaultScenarioArgs,
    dataType: "richtext",
    data: richTextData.Welcome,
  },
  render: (args) => mountScenario(createEditorScenario, args),
};

export default meta;

type Story = StoryObj<ScenarioArgs>;

/**
 * RichText editor preloaded with the welcome showcase data.
 */
export const Default: Story = {};
