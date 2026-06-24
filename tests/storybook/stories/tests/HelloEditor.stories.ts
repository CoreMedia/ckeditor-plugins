import type { Meta, StoryObj } from "@storybook/html";
import { a, p, richtext, richTextData } from "@coremedia-internal/ckeditor5-coremedia-example-data";
import { contentUriPath } from "@coremedia/ckeditor5-coremedia-studio-integration";
import { helloEditorScenario } from "@coremedia/ckeditor5-itest-constants";
import { defaultScenarioArgs, mountScenario, type ScenarioArgs } from "../../src/runtime";
import { createEditorScenario } from "../../src/editors";

/**
 * Dedicated scenarios for `HelloEditor.test.ts`.
 *
 * Each story is fully prepared for the test that consumes it (initial data,
 * mock contents and, where the test reads editor data back, the `editor-data`
 * observable output). Tests interact and assert through Playwright locators
 * only — no `page.evaluate`. The literals baked into these scenarios are shared
 * with the test via `@coremedia/ckeditor5-itest-constants`
 * (`helloEditorScenario`).
 */

const meta: Meta<ScenarioArgs> = {
  title: "Tests/HelloEditor",
  args: {
    ...defaultScenarioArgs,
    dataType: "richtext",
  },
  render: (args) => mountScenario(createEditorScenario, args),
};

export default meta;

type Story = StoryObj<ScenarioArgs>;

/**
 * RichText editor preloaded with the welcome showcase data (renders the
 * `CoreMedia` showcase heading).
 */
export const Welcome: Story = {
  args: {
    data: richTextData.Welcome,
  },
};

/**
 * Empty RichText editor. Exposes `editor-data` so the test can assert the
 * editor data of an empty editor is empty.
 */
export const Cleared: Story = {
  args: {
    data: "",
    outputs: ["editor-data"],
  },
};

/**
 * RichText editor preloaded with a single external link.
 */
export const ExternalLink: Story = {
  args: {
    data: richtext(
      p(a(helloEditorScenario.externalLinkText, { "xlink:href": helloEditorScenario.externalLinkTarget })),
    ),
  },
};

/**
 * RichText editor preloaded with a single internal (content) link and the
 * backing mock content.
 */
export const InternalLink: Story = {
  args: {
    mockContents: [
      {
        id: helloEditorScenario.internalLinkContentId,
        name: `Document for ${helloEditorScenario.internalLinkText}`,
      },
    ],
    data: richtext(
      p(
        a(helloEditorScenario.internalLinkText, {
          "xlink:href": contentUriPath(helloEditorScenario.internalLinkContentId),
        }),
      ),
    ),
  },
};

