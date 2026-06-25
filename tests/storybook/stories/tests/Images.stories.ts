import type { Meta, StoryObj } from "@storybook/html";
import { a, blobReference, img, linkReference, p, richtext } from "@coremedia-internal/ckeditor5-coremedia-example-data";
import type { MockContentConfig } from "@coremedia-internal/ckeditor5-coremedia-studio-integration-mock";
import { PNG_RED_240x135, imageMediaCases, imagesScenario, type ImageMediaCase } from "@coremedia/ckeditor5-itest-constants";
import { defaultScenarioArgs, mountScenario, type ScenarioArgs } from "../../src/runtime";
import { createEditorScenario } from "../../src/editors";

/**
 * Dedicated, fully prepared scenarios for `Images.test.ts`.
 *
 * Each story bakes the backing mock image content(s) and the image richtext
 * `data` for one test, so the test only opens the story and drives the editor
 * through locators — no `page.evaluate`. The "Media Representation" stories
 * additionally expose the processed `data-view` output, and the enabled
 * "Open in tab" story exposes the `last-opened-entities` output. The literals
 * are shared with the test via `@coremedia/ckeditor5-itest-constants`.
 */
const meta: Meta<ScenarioArgs> = {
  title: "Tests/Images",
  args: {
    ...defaultScenarioArgs,
    dataType: "richtext",
  },
  render: (args) => mountScenario(createEditorScenario, args),
};

export default meta;

type Story = StoryObj<ScenarioArgs>;

const imageData = (alt: string, href: string): string => richtext(p(img({ "alt": alt, "xlink:href": href })));

const mediaStory = (testCase: ImageMediaCase): Story => {
  const content: MockContentConfig = {
    id: testCase.contentId,
    name: testCase.name,
    blob: testCase.blob,
    initialDelayMs: testCase.initialDelayMs,
    readable: testCase.readable,
  };
  return {
    args: {
      mockContents: [content],
      data: imageData(testCase.name, blobReference(testCase.contentId)),
      outputs: ["data-view"],
    },
  };
};

const mediaCasesById = new Map(imageMediaCases.map((testCase) => [testCase.id, testCase]));

const mediaStoryById = (id: string): Story => {
  const testCase = mediaCasesById.get(id);
  if (!testCase) {
    throw new Error(`Unknown image media case id: ${id}`);
  }
  return mediaStory(testCase);
};

/**
 * Content with a fast-loading image.
 */
export const NormalFast: Story = mediaStoryById("normal-fast");

/**
 * Content with a slowly-loading image.
 */
export const SlowLoading: Story = mediaStoryById("slow-loading");

/**
 * Content with an unreadable image (resolves to the lock placeholder).
 */
export const Unreadable: Story = mediaStoryById("unreadable");

/**
 * Content with no image data (resolves to the empty placeholder).
 */
export const NoData: Story = mediaStoryById("no-data");

/**
 * Broken image with an empty `xlink:href`.
 */
export const InvalidHref: Story = {
  args: {
    data: imageData(imagesScenario.invalidHref.name, ""),
  },
};

/**
 * Single image used to walk through the alignment buttons.
 */
export const Alignment: Story = {
  args: {
    mockContents: [
      {
        id: imagesScenario.alignment.contentId,
        blob: PNG_RED_240x135,
        name: imagesScenario.alignment.contentName,
      },
    ],
    data: imageData(imagesScenario.alignment.name, blobReference(imagesScenario.alignment.contentId)),
  },
};

/**
 * Readable image whose "Open in tab" action is enabled.
 */
export const OpenInTabEnabled: Story = {
  args: {
    mockContents: [
      {
        id: imagesScenario.openInTab.enabled.contentId,
        blob: PNG_RED_240x135,
        name: imagesScenario.openInTab.enabled.contentName,
      },
    ],
    data: imageData(imagesScenario.openInTab.enabled.name, blobReference(imagesScenario.openInTab.enabled.contentId)),
    outputs: ["last-opened-entities"],
  },
};

/**
 * Unreadable image whose "Open in tab" action is disabled.
 */
export const OpenInTabDisabled: Story = {
  args: {
    mockContents: [
      {
        id: imagesScenario.openInTab.disabled.contentId,
        blob: PNG_RED_240x135,
        name: imagesScenario.openInTab.disabled.contentName,
        readable: false,
      },
    ],
    data: imageData(imagesScenario.openInTab.disabled.name, blobReference(imagesScenario.openInTab.disabled.contentId)),
  },
};

/**
 * Image without a surrounding content link.
 */
export const LinksNoLink: Story = {
  args: {
    mockContents: [
      {
        id: imagesScenario.links.noLink.contentId,
        blob: PNG_RED_240x135,
        name: imagesScenario.links.noLink.contentName,
      },
    ],
    data: imageData(imagesScenario.links.noLink.name, blobReference(imagesScenario.links.noLink.contentId)),
  },
};

/**
 * Image wrapped in a content link pointing at another content.
 */
export const LinksWithLink: Story = {
  args: {
    mockContents: [
      {
        id: imagesScenario.links.withLink.imageId,
        blob: PNG_RED_240x135,
        name: imagesScenario.links.withLink.contentName,
      },
      {
        id: imagesScenario.links.withLink.linkedContentId,
        name: imagesScenario.links.withLink.linkedContentName,
      },
    ],
    data: richtext(
      p(
        a(img({ "alt": imagesScenario.links.withLink.name, "xlink:href": blobReference(imagesScenario.links.withLink.imageId) }), {
          "xlink:href": linkReference(imagesScenario.links.withLink.linkedContentId),
        }),
      ),
    ),
  },
};
