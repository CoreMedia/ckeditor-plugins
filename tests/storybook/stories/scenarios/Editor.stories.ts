import type { Meta, StoryObj } from "@storybook/html";
import { p, richtext } from "@coremedia-internal/ckeditor5-coremedia-example-data";
import { defaultScenarioArgs, mountScenario, type ScenarioArgs } from "../../src/runtime";
import { createEditorScenario } from "../../src/editors";

/**
 * Base editor scenarios that mount a real CKEditor 5 instance through the
 * migrated editor factories and scenario-setup utilities. These replace the
 * former application as the runtime Playwright tests are migrated against.
 *
 * Each story renders a scenario container (`.storybook-editor-scenario`) and
 * signals readiness via `data-editor-ready="true"`, the contract Playwright
 * waits for.
 */
const meta: Meta<ScenarioArgs> = {
  title: "Scenario/Editor",
  args: {
    ...defaultScenarioArgs,
  },
  render: (args) => mountScenario(createEditorScenario, args),
};

export default meta;

type Story = StoryObj<ScenarioArgs>;

/**
 * Empty CoreMedia RichText editor (base scenario for richtext-based tests).
 */
export const RichText: Story = {
  args: {
    dataType: "richtext",
  },
};

/**
 * CoreMedia RichText editor preloaded with a simple paragraph.
 */
export const RichTextWithData: Story = {
  args: {
    dataType: "richtext",
    data: richtext(p("Hello from CoreMedia RichText.")),
  },
};

/**
 * Empty BBCode editor (base scenario for bbcode-based tests).
 */
export const BBCode: Story = {
  args: {
    dataType: "bbcode",
  },
};
