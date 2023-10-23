import { TagNode } from "@bbob/plugin-helper/es";

export type CoreWalk = (callback: (node: string | TagNode) => string | TagNode) => void;

export type CoreParser = () => unknown;
export type CoreRenderNode = null | string | number | TagNode | CoreRenderNode[];
export type CoreRenderer = (node: CoreRenderNode, options: object) => unknown;
export type CoreData = unknown | null;

export interface CoreOptions {
  parser?: CoreParser;
  render?: CoreRenderer;
  skipParse?: boolean;
  data?: CoreData;
  onlyAllowTags?: string[];
  contextFreeTags?: string[];
  enableEscapeTags?: boolean;
  openTag?: string;
  closeTag?: string;
  onError?: (info: { message: string; tagName: string; lineNumber: number; columnNumber: number }) => void;
}

export type CoreMatcher = (expression: unknown, callback: (node: string | TagNode) => string | TagNode) => unknown;

export type CoreTree = (string | TagNode)[] & {
  messages: string[];
  options: CoreOptions;
  walk: CoreWalk;
  match: CoreMatcher;
};


export type CoreIterator = (tree: CoreTree, callback: (entry: CoreTree[number]) => CoreTree[number]) => CoreTree;

export type CorePlugin = (
  tree: CoreTree,
  options: { parse: CoreParser; render: CoreRenderer; iterate: CoreIterator; match: CoreMatcher; data: CoreData },
) => CoreTree | CoreTree[number] | undefined | null;

export default function bbob(
  // eslint-disable-next-line @typescript-eslint/ban-types
  plugs?: Function | Function[],
): {
  process: (
    input: string | undefined,
    opts?: CoreOptions,
  ) => {
    readonly html: string;
    tree: CoreTree;
    raw: unknown;
    messages: CoreTree["messages"];
  };
};
