import { TagNode } from "@bbob/plugin-helper/es";

export type CoreWalk = (callback: (node: unknown) => void) => void;

export interface CoreOptions {
  // eslint-disable-next-line @typescript-eslint/ban-types
  parser?: Function;
  // eslint-disable-next-line @typescript-eslint/ban-types
  render?: Function;
  skipParse?: boolean;
  data?: null | unknown;
  onlyAllowTags?: string[];
  contextFreeTags?: string[];
  enableEscapeTags?: boolean;
  openTag?: string;
  closeTag?: string;
  onError?: (info: { message: string; tagName: string; lineNumber: number; columnNumber: number }) => void;
}

export type CoreTree = (string | TagNode)[] & {
  messages: string[];
  options: CoreOptions;
  walk: CoreWalk;
  match: (expression: unknown, callback: (node: string | TagNode) => string | TagNode) => unknown;
};

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
