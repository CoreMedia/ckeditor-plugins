import { TagNode } from "@bbob/plugin-helper/es";

export type CoreWalk = (callback: (node: string | TagNode) => string | TagNode) => void;

export type CoreParser = () => unknown;
export type CoreRenderable = null | string | number | TagNode;
export type CoreRenderNode = CoreRenderable | CoreRenderable[];
export type CoreRenderer = (node: CoreRenderNode, options?: object) => string;
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

  [key: string]: unknown;
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

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export default function bbob(plugs?: Function | Function[]): {
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
