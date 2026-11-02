import type { Meta, StoryObj } from "@storybook/html";
import { a, p, richtext } from "@coremedia-internal/ckeditor5-coremedia-example-data";
import { contentUriPath } from "@coremedia/ckeditor5-coremedia-studio-integration";
import { shadowDomScenario } from "@coremedia/ckeditor5-itest-constants";
import { defaultScenarioArgs, mountScenario, type ScenarioArgs } from "../../src/runtime";
import { createEditorScenario } from "../../src/editors";

/**
 * Dedicated scenarios for `ShadowDom.test.ts`.
 *
 * Each story mounts the CoreMedia RichText editor inside an open shadow root
 * (`shadowDom: true`). The editor styles are adopted into that root, and the
 * floating UI (balloons, tooltips) renders into a separate overlay container
 * at the end of `document.body`, configured as `config.ui.overlayContainer`.
 * The literals baked into these scenarios are shared with the test via
 * `@coremedia/ckeditor5-itest-constants` (`shadowDomScenario`).
 */

const meta: Meta<ScenarioArgs> = {
  title: "Tests/ShadowDom",
  args: {
    ...defaultScenarioArgs,
    dataType: "richtext",
    shadowDom: true,
  },
  render: (args) => mountScenario(createEditorScenario, args),
};

export default meta;

type Story = StoryObj<ScenarioArgs>;

/**
 * Empty editor. Exposes `editor-data` so the test can assert that typing
 * inside the shadow root updates the editor data.
 */
export const Typing: Story = {
  args: {
    data: "",
    outputs: ["editor-data"],
  },
};

/**
 * Editor preloaded with a single paragraph, for applying a heading through the
 * heading dropdown of the toolbar.
 */
export const HeadingDropdown: Story = {
  args: {
    data: richtext(p(shadowDomScenario.paragraphText)),
  },
};

/**
 * Editor preloaded with a single content link and the backing mock content,
 * for link balloon interaction.
 */
export const ContentLink: Story = {
  args: {
    mockContents: [
      {
        id: shadowDomScenario.contentId,
        name: `Document for ${shadowDomScenario.linkText}`,
      },
    ],
    data: richtext(p(a(shadowDomScenario.linkText, { "xlink:href": contentUriPath(shadowDomScenario.contentId) }))),
  },
};
