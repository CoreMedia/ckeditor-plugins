import type { Meta, StoryObj } from "@storybook/html";
import { p, richtext } from "@coremedia-internal/ckeditor5-coremedia-example-data";
import { blocklistWordsScenario } from "@coremedia/ckeditor5-itest-constants";
import { defaultScenarioArgs, mountScenario, type ScenarioArgs } from "../../src/runtime";
import { createEditorScenario } from "../../src/editors";

/**
 * Dedicated scenario for `BlocklistCollapsed.test.ts`: a CoreMedia RichText
 * editor with the blocked word pre-registered and present in the prepared data,
 * so the test can place a collapsed selection in the marker and assert the
 * balloon through locators — no `page.evaluate`.
 */
const meta: Meta<ScenarioArgs> = {
  title: "Tests/BlocklistCollapsed",
  args: {
    ...defaultScenarioArgs,
    dataType: "richtext",
  },
  render: (args) => mountScenario(createEditorScenario, args),
};

export default meta;

type Story = StoryObj<ScenarioArgs>;

/**
 * RichText editor with a single blocked word marker.
 */
export const Default: Story = {
  args: {
    blockedWords: [blocklistWordsScenario.blockedWord],
    data: richtext(
      `${p(blocklistWordsScenario.notBlockedText)}${p(blocklistWordsScenario.blockedWord)}${p(blocklistWordsScenario.exampleText)}`,
    ),
  },
};
