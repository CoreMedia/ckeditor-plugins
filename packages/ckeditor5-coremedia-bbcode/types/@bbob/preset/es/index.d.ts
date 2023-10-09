import { TagNode } from "@bbob/preset/es";

type Content = TagNode["content"];

declare module "@bbob/preset/es" {
  /**
   * Creates preset for @bbob/core
   * @param defTags - default tags
   * @param processor - a processor function of tree
   * @returns preset function
   */
  declare function createPreset(
    defTags: Record<string, (node: TagNode, core: { render: (content: Content) => string }, options: object) => void>,
    // eslint-disable-next-line @typescript-eslint/ban-types
    processor?: Function,
    // eslint-disable-next-line @typescript-eslint/ban-types
  ): Function;

  export { createPreset };
  export default createPreset;
}

/*
https://js2ts.com/

TODO: Continue here.... get typings straight, possibly truncate at some place. And then write CKEditor 5 preset

import { Tree, Core } from '@bbob/core';

interface TagNode {
  tag: string;
}

type TagProcessor = (node: TagNode, core: Core, options: any) => void;

const isTagNode = (el: any): el is TagNode => typeof el === 'object' && !!el.tag;

function process(tags: { [key: string]: TagProcessor }, tree: Tree, core: Core, options: any) {
  tree.walk((node) => isTagNode(node) && tags[node.tag] ? tags[node.tag](node, core, options) : node);
}

interface PresetOptions {
  [key: string]: any;
}

interface PresetExecutor {
  (tree: Tree, core: Core): void;
  options: PresetOptions;
}

interface PresetFactory {
  (opts?: PresetOptions): PresetExecutor;
  extend(callback: (defTags: { [key: string]: TagProcessor }, options: PresetOptions) => PresetOptions): PresetFactory;
  options: PresetOptions;
}

function createPreset(defTags: { [key: string]: TagProcessor }, processor: (tags: { [key: string]: TagProcessor }, tree: Tree, core: Core, options: any) => void = process): PresetFactory {
  const presetFactory: PresetFactory = (opts = {}) => {
    presetFactory.options = Object.assign(presetFactory.options || {}, opts);
    const presetExecutor: PresetExecutor = (tree, core) => processor(defTags, tree, core, presetFactory.options);
    presetExecutor.options = presetFactory.options;
    return presetExecutor;
  };
  presetFactory.extend = (callback) => createPreset(callback(defTags, presetFactory.options), processor);
  return presetFactory;
}

export { createPreset };
export default createPreset;
 */
