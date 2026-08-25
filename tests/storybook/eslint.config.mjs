import { createEslintConfig } from "@coremedia/studio-client.eslint-config";

export default [
  {
    ignores: ["build/**", "storybook-static/**"],
  },
  ...createEslintConfig(),
];
