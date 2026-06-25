import type { Meta, StoryObj } from "@storybook/html";
import { bbCodeScenario } from "@coremedia/ckeditor5-itest-constants";
import { defaultScenarioArgs, mountScenario, type ScenarioArgs } from "../../src/runtime";
import { createEditorScenario } from "../../src/editors";

/**
 * Dedicated scenario for `BBCode.test.ts`: a BBCode editor preloaded with a
 * single bold word, so the test can assert it renders as `<strong>` through
 * locators only — no `page.evaluate`.
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
 * BBCode editor preloaded with a single bold word.
 */
export const BoldWord: Story = {
  args: {
    data: `[b]${bbCodeScenario.boldWord}[/b]`,
  },
};
