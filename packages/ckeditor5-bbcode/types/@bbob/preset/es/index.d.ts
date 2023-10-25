import { TagNode } from "@bbob/plugin-helper/es";

type Content = TagNode["content"] | TagNode;

type RenderFn = (content: Content, options?: Options) => string;

interface Options {
  skipParse?: boolean;
  parser?: unknown;
  render: RenderFn;
  data?: unknown;
  [key: string]: unknown;
}

/**
 * Creates preset for @bbob/core
 * @param defTags - default tags
 * @param processor - a processor function of tree
 * @returns preset function
 */
declare function createPreset(
  defTags: Record<string, (node: TagNode, core: { render: RenderFn }, options: Options) => string | TagNode>,
  // eslint-disable-next-line @typescript-eslint/ban-types
  processor?: Function,
): {
  extend: (
    callback: (defTags: Parameters<typeof createPreset>[0], options: object) => Parameters<typeof createPreset>[0],
  ) => ReturnType<typeof createPreset>;
  // eslint-disable-next-line @typescript-eslint/ban-types
  options?: object;
  // Function signature.
  (options: object = {}): {
    options?: object;
    (tree: unknown, core: { render: RenderFn }): unknown;
  };
};

export { createPreset };
export default createPreset;
