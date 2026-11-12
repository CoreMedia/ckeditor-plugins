import type { Meta, StoryObj } from "@storybook/html";
import { p, richtext } from "@coremedia-internal/ckeditor5-coremedia-example-data";
import { blocklistWordsScenario } from "@coremedia/ckeditor5-itest-constants";
import { defaultScenarioArgs, mountScenario, type ScenarioArgs } from "../../src/runtime";
import { createEditorScenario } from "../../src/editors";

/**
 * Dedicated scenario for `BlocklistExpandedKeyboard.test.ts`: a CoreMedia
 * RichText editor with two blocked words pre-registered and present in the
 * prepared data, so the test can select all text and reveal the blocked words
 * via the keyboard shortcut through locators — no `page.evaluate`.
 */
const meta: Meta<ScenarioArgs> = {
  title: "Tests/BlocklistExpandedKeyboard",
  args: {
    ...defaultScenarioArgs,
    dataType: "richtext",
  },
  render: (args) => mountScenario(createEditorScenario, args),
};

export default meta;

type Story = StoryObj<ScenarioArgs>;

/**
 * RichText editor with two blocked word markers.
 */
export const Default: Story = {
  args: {
    blockedWords: [blocklistWordsScenario.blockedWord, blocklistWordsScenario.anotherBlockedWord],
    data: richtext(
      `${p(blocklistWordsScenario.notBlockedText)}${p(`${blocklistWordsScenario.blockedWord},${blocklistWordsScenario.anotherBlockedWord}`)}${p(blocklistWordsScenario.exampleText)}`,
    ),
  },
};
