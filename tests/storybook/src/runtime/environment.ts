/**
 * Runtime environment constants and the stable story URL strategy that
 * Playwright uses to target individual Storybook stories.
 *
 * Playwright must not rely on the Storybook _manager_ UI. Instead, it targets
 * the isolated story preview iframe directly:
 *
 * ```text
 * http://<host>:<port>/iframe.html?id=<storyId>&viewMode=story
 * ```
 *
 * The `storyId` is the stable, kebab-cased identifier Storybook derives from a
 * story's `title` and its export name (for example title `"Editor/Hello"` with
 * export `Default` becomes `editor-hello--default`). Because these ids are
 * stable across builds, they form the contract between a Playwright test and
 * its dedicated story.
 */

/**
 * Port the Storybook dev server / preview is served on. Mirrors the
 * `--port` used by the `storybook` script and can be overridden via
 * `STORYBOOK_PORT` (for example in CI).
 */
export const storybookPort = process.env.STORYBOOK_PORT ?? "6006";

/**
 * Host the Storybook preview is served on. Overridable via `STORYBOOK_HOST`.
 */
export const storybookHost = process.env.STORYBOOK_HOST ?? "localhost";

/**
 * Base URL of the running Storybook instance (no trailing slash).
 */
export const storybookUrl = `http://${storybookHost}:${storybookPort}`;

/**
 * URL of the isolated story preview iframe. This is the entry point Playwright
 * navigates to instead of the former application URL.
 */
export const storybookIframeUrl = `${storybookUrl}/iframe.html`;

/**
 * Optional encoded story args appended to a story URL via Storybook's
 * `&args=` query parameter (`key:value` pairs separated by `;`).
 */
export type StoryUrlArgs = Record<string, string | number | boolean>;

const encodeStoryArgs = (args: StoryUrlArgs): string =>
  Object.entries(args)
    .map(([key, value]) => `${key}:${encodeURIComponent(String(value))}`)
    .join(";");

/**
 * Builds the stable preview URL for a given story id.
 *
 * @param storyId - stable Storybook story id (for example `editor-hello--default`)
 * @param args - optional story args encoded into the URL
 * @returns absolute iframe URL Playwright can navigate to
 */
export const storyUrl = (storyId: string, args?: StoryUrlArgs): string => {
  const params = new URLSearchParams({
    id: storyId,
    viewMode: "story",
  });
  if (args && Object.keys(args).length > 0) {
    params.set("args", encodeStoryArgs(args));
  }
  return `${storybookIframeUrl}?${params.toString()}`;
};
