import type { Meta, StoryObj } from "@storybook/html";
import { a, p, richtext } from "@coremedia-internal/ckeditor5-coremedia-example-data";
import { contentUriPath } from "@coremedia/ckeditor5-coremedia-studio-integration";
import { linkInteractionContentName, linkUserInteractionScenario } from "@coremedia/ckeditor5-itest-constants";
import { defaultScenarioArgs, mountScenario, type ScenarioArgs } from "../../src/runtime";
import { createEditorScenario } from "../../src/editors";

/**
 * Dedicated, fully prepared scenarios for `LinkUserInteraction.test.ts`.
 *
 * Each story bakes the link data, the backing mock content (for content links)
 * and the read-only state for a pair of tests (mouse + keyboard), so the test
 * only opens the story and drives the link through locators — no `page.evaluate`.
 * Content-link stories expose the `last-opened-entities` output so the test can
 * assert work-area-tab openings through a locator. The literals are shared with
 * the test via `@coremedia/ckeditor5-itest-constants`.
 */
const meta: Meta<ScenarioArgs> = {
  title: "Tests/LinkUserInteraction",
  args: {
    ...defaultScenarioArgs,
    dataType: "richtext",
  },
  render: (args) => mountScenario(createEditorScenario, args),
};

export default meta;

type Story = StoryObj<ScenarioArgs>;

const { externalLink, externalLinkReadOnly, contentLink, contentLinkReadOnly } = linkUserInteractionScenario;

const externalLinkData = (linkText: string): string => richtext(p(a(linkText, { "xlink:href": externalLink.url })));

const contentLinkData = (linkText: string, contentId: number): string =>
  richtext(p(a(linkText, { "xlink:href": contentUriPath(contentId) })));

/**
 * Read/write editor with an external link.
 */
export const ExternalLink: Story = {
  args: {
    data: externalLinkData(externalLink.linkText),
  },
};

/**
 * Read-only editor with an external link.
 */
export const ExternalLinkReadOnly: Story = {
  args: {
    data: externalLinkData(externalLinkReadOnly.linkText),
    readOnly: true,
  },
};

/**
 * Read/write editor with a content link.
 */
export const ContentLink: Story = {
  args: {
    mockContents: [{ id: contentLink.contentId, name: linkInteractionContentName(contentLink.linkText) }],
    data: contentLinkData(contentLink.linkText, contentLink.contentId),
    outputs: ["last-opened-entities"],
  },
};

/**
 * Read-only editor with a content link.
 */
export const ContentLinkReadOnly: Story = {
  args: {
    mockContents: [
      { id: contentLinkReadOnly.contentId, name: linkInteractionContentName(contentLinkReadOnly.linkText) },
    ],
    data: contentLinkData(contentLinkReadOnly.linkText, contentLinkReadOnly.contentId),
    readOnly: true,
    outputs: ["last-opened-entities"],
  },
};
