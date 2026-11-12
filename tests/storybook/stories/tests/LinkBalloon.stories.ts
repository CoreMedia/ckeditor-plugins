import type { Meta, StoryObj } from "@storybook/html";
import { a, p, richtext } from "@coremedia-internal/ckeditor5-coremedia-example-data";
import { contentUriPath } from "@coremedia/ckeditor5-coremedia-studio-integration";
import { linkBalloonScenario } from "@coremedia/ckeditor5-itest-constants";
import { defaultScenarioArgs, mountScenario, type ScenarioArgs } from "../../src/runtime";
import { createEditorScenario } from "../../src/editors";

/**
 * Dedicated scenario for `LinkBalloon.test.ts`: a CoreMedia RichText editor
 * preloaded with a content link (so the test can open the link balloon) and the
 * helper fixture elements the test interacts with, rendered into the scenario
 * container. The editor is configured (in the richtext factory) with the
 * keep-open ids/classes the test relies on. The test only opens the story and
 * asserts through locators — no `page.evaluate`.
 */

/**
 * Creates a 50×50 fixture element the test can click/hover.
 */
const createFixtureElement = (init: { id?: string; className?: string; draggable?: boolean }): HTMLElement => {
  const element = document.createElement("div");
  if (init.id) {
    element.id = init.id;
  }
  if (init.className) {
    element.classList.add(init.className);
  }
  if (init.draggable) {
    element.draggable = true;
  }
  element.style.width = "50px";
  element.style.height = "50px";
  element.style.backgroundColor = "#00ff00";
  return element;
};

const renderLinkBalloonScenario = (args: ScenarioArgs): HTMLElement => {
  const container = mountScenario(createEditorScenario, args);
  container.append(
    createFixtureElement({ id: linkBalloonScenario.draggableElementId, draggable: true }),
    createFixtureElement({ id: linkBalloonScenario.keepOpenElementId }),
    createFixtureElement({ className: linkBalloonScenario.keepOpenElementClass }),
  );
  return container;
};

const meta: Meta<ScenarioArgs> = {
  title: "Tests/LinkBalloon",
  args: {
    ...defaultScenarioArgs,
    dataType: "richtext",
  },
  render: renderLinkBalloonScenario,
};

export default meta;

type Story = StoryObj<ScenarioArgs>;

/**
 * RichText editor with a content link and the link-balloon test fixtures.
 */
export const Default: Story = {
  args: {
    mockContents: [
      {
        id: linkBalloonScenario.contentId,
        name: `Document for test ${linkBalloonScenario.linkText}`,
      },
    ],
    data: richtext(
      p(a(linkBalloonScenario.linkText, { "xlink:href": contentUriPath(linkBalloonScenario.contentId) })),
    ),
  },
};
