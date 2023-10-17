import { TagNode } from "@bbob/plugin-helper/es";

type Content = TagNode["content"] | TagNode;

interface Options {
  skipParse?: boolean;
  parser?: unknown;
  render: (content: Content, options?: Options) => string;
  data?: unknown;
}

declare module "@bbob/preset/es" {
  /**
   * Creates preset for @bbob/core
   * @param defTags - default tags
   * @param processor - a processor function of tree
   * @returns preset function
   */
  declare function createPreset(
    defTags: Record<string, (node: TagNode, core: { render: Options["render"] }, options: object) => void>,
    // eslint-disable-next-line @typescript-eslint/ban-types
    processor?: Function,
  ): {
    options?: object;
    extend: (
      callback: (
        defTags: Parameters<typeof createPreset>[0],
        options: object = {},
      ) => Parameters<typeof createPreset>[0],
    ) => ReturnType<typeof createPreset>;
    // eslint-disable-next-line @typescript-eslint/ban-types
    (options: object = {}): {
      options?: object;
      (tree: unknown, core: { render: Options["render"] }): unknown;
    };
  };

  export { createPreset };
  export default createPreset;
}
