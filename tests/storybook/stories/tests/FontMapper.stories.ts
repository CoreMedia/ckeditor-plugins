import type { Meta, StoryObj } from "@storybook/html";
import { defaultScenarioArgs, mountScenario, type ScenarioArgs } from "../../src/runtime";
import { createEditorScenario } from "../../src/editors";
import { fontMapperClipboardHtml } from "./fontMapperTemplates";

/**
 * Dedicated scenarios for `FontMapper.test.ts`: an empty CoreMedia RichText
 * editor (the richtext factory loads the FontMapper plugin) that exposes the
 * `editor-data` observable output, so the test can assert the pasted/mapped
 * content through a locator instead of `page.evaluate`.
 *
 * Each story is **fully prepared**: while mounting, it writes the corresponding
 * Word-document HTML to the browser clipboard. The test therefore only focuses
 * the editor and pastes — it neither reads the source HTML files nor touches the
 * clipboard API itself.
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
 * Builds a prepared story whose clipboard already holds the given Word HTML.
 */
const clipboardStory = (clipboardHtml: string): Story => ({
  args: {
    outputs: ["editor-data"],
    clipboard: { type: "text/html", content: clipboardHtml },
  },
});

export const WordTemplate: Story = clipboardStory(fontMapperClipboardHtml["word-template"]);
export const WordTemplateTable: Story = clipboardStory(fontMapperClipboardHtml["word-template-table"]);
export const WordTemplateTableInheritFont: Story = clipboardStory(
  fontMapperClipboardHtml["word-template-table-inherit-font"],
);
