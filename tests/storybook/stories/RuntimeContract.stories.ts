import type { Meta, StoryObj } from "@storybook/html";
import { defaultScenarioArgs, type ScenarioArgs, storyUrl } from "../src/runtime";

/**
 * Documents the Storybook test runtime contract used by Playwright:
 *
 * - **URL strategy:** Playwright targets the isolated preview iframe via
 *   {@link storyUrl}, for example `storyUrl("runtime-contract--default")`.
 * - **Scenario args:** {@link ScenarioArgs} describes the declarative scenario
 *   setup (data type, initial data, mock contents, ...). This story renders the
 *   resolved args so the contract can be inspected visually and asserted.
 *
 * Editor mounting itself ({@link mountScenario}) is wired in a later step once
 * the wrapper functionality has been migrated into Storybook-side utilities.
 */
const meta: Meta<ScenarioArgs> = {
  title: "Runtime/Contract",
  args: {
    ...defaultScenarioArgs,
  },
  render: (args) => {
    const container = document.createElement("section");
    container.setAttribute("data-testid", "runtime-contract");

    const heading = document.createElement("h1");
    heading.textContent = "Storybook test runtime contract";

    const url = document.createElement("p");
    url.setAttribute("data-testid", "runtime-contract-url");
    url.textContent = storyUrl("runtime-contract--default");

    const argsDump = document.createElement("pre");
    argsDump.setAttribute("data-testid", "runtime-contract-args");
    argsDump.textContent = JSON.stringify(args, null, 2);

    container.append(heading, url, argsDump);
    return container;
  },
};

export default meta;

type Story = StoryObj<ScenarioArgs>;

export const Default: Story = {};

export const Bbcode: Story = {
  args: {
    dataType: "bbcode",
    data: "[b]bold[/b]",
  },
};
