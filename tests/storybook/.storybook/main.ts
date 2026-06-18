import type { StorybookConfig } from "@storybook/html-webpack5";

const config: StorybookConfig = {
  stories: ["../stories/**/*.stories.@(ts|mdx)"],
  addons: [
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    "@storybook/addon-webpack5-compiler-swc",
  ],
  framework: {
    name: "@storybook/html-webpack5",
    options: {},
  },
  docs: {
    autodocs: "tag",
  },
};

export default config;
