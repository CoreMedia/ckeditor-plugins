import type { Meta, StoryObj } from "@storybook/html";

type SmokeStoryArgs = {
  title: string;
  description: string;
};

const meta: Meta<SmokeStoryArgs> = {
  title: "Smoke/StorybookRuntime",
  args: {
    title: "Storybook runtime is available",
    description: "This placeholder story confirms the new tests/storybook package setup.",
  },
  render: ({ title, description }) => {
    const container = document.createElement("section");
    container.setAttribute("data-testid", "storybook-smoke");

    const heading = document.createElement("h1");
    heading.textContent = title;

    const paragraph = document.createElement("p");
    paragraph.textContent = description;

    container.append(heading, paragraph);
    return container;
  },
};

export default meta;

type Story = StoryObj<SmokeStoryArgs>;

export const Default: Story = {};
