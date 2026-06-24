import type { Meta, StoryObj } from "@storybook/html";
import { p, richtext } from "@coremedia-internal/ckeditor5-coremedia-example-data";
import { blocklistScenario } from "@coremedia/ckeditor5-itest-constants";
import { defaultScenarioArgs, mountScenario, type ScenarioArgs } from "../../src/runtime";
import { createEditorScenario } from "../../src/editors";

/**
 * Dedicated scenario for `Blocklist.test.ts`: a CoreMedia RichText editor (the
 * richtext factory loads the Blocklist plugin) preloaded with the three
 * paragraphs the test operates on. Blocked words are added/removed by the test
 * through the blocklist balloon UI via locators — no `page.evaluate`.
 */
const meta: Meta<ScenarioArgs> = {
  title: "Tests/Blocklist",
  args: {
    ...defaultScenarioArgs,
    dataType: "richtext",
  },
  render: (args) => mountScenario(createEditorScenario, args),
};

export default meta;

type Story = StoryObj<ScenarioArgs>;

/**
 * RichText editor preloaded with the paragraphs the test blocks/unblocks a word in.
 */
export const Default: Story = {
  args: {
    data: richtext(
      `(${p(blocklistScenario.helloWorldText)}${p(blocklistScenario.contentText)}${p(blocklistScenario.exampleText)}`,
    ),
  },
};
