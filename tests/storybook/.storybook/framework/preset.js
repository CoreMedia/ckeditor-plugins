/**
 * Local Storybook framework: the HTML renderer built with webpack.
 *
 * Storybook ships its HTML renderer (`@storybook/html`) only with Vite
 * (`@storybook/html-vite`); `@storybook/html-webpack5` ended with Storybook 8.
 * The shared `@coremedia-internal/studio-client.storybook-config` builds with
 * webpack, so this preset pairs the official HTML renderer with the official
 * webpack builder, the same way the official framework packages do.
 *
 * Storybook resolves a framework given by path through its `preset` entry,
 * which must be JavaScript.
 */
export const core = {
  builder: import.meta.resolve("@storybook/builder-webpack5"),
  renderer: import.meta.resolve("@storybook/html/preset"),
};
