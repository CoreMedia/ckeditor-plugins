/**
 * Storybook runtime environment for Playwright.
 *
 * Migrated tests target the isolated Storybook story preview iframe instead of
 * the former example application. The story id is the stable, kebab-cased
 * identifier Storybook derives from a story's `title` and export name.
 *
 * URL strategy follows Storybook's standard `iframe.html` preview endpoint:
 * `${storybookUrl}/iframe.html?id=<storyId>&viewMode=story`.
 * This file intentionally duplicates that logic to avoid a build-time dependency on the Storybook package.
 */

export const storybookPort = process.env.STORYBOOK_PORT ?? "6006";

export const storybookHost = process.env.STORYBOOK_HOST ?? "localhost";

/**
 * Base URL of the running Storybook instance (no trailing slash).
 */
export const storybookUrl = `http://${storybookHost}:${storybookPort}`;

/**
 * URL of the isolated story preview iframe.
 */
export const storybookIframeUrl = `${storybookUrl}/iframe.html`;

/**
 * Builds the stable preview URL for a given story id.
 *
 * @param storyId - stable Storybook story id (for example `tests-helloeditor--default`)
 */
export const storyUrl = (storyId: string): string => {
  const params = new URLSearchParams({
    id: storyId,
    viewMode: "story",
  });
  return `${storybookIframeUrl}?${params.toString()}`;
};
