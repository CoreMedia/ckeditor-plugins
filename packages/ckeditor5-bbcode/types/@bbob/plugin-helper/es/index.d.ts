type TagAttrs = Record<string, string>;

export declare class TagNode {
  readonly tag: string;
  attrs: TagAttrs;
  content: (string | TagNode)[];
  attr: (name: string, value?: string) => string | undefined;
  append: (value: string) => void;
  readonly length: number;
  static create: (tag: string, attrs: TagAttrs = {}, content: (string | TagNode)[] = []) => TagNode;
  static isOf: (node: TagNode, type: string) => node is TagNode & { tag: typeof type };
}

export declare function isTagNode(el: unknown): el is TagNode;
export declare function isStringNode(el: unknown): el is string;
export declare function isEOL(el: unknown): el is "\n";
export declare function escapeHTML(value: string): string;

export declare function getUniqAttr(attrs: Record<string, string>): string;

export declare const N: "\n";
export declare const TAB: "\t";
export declare const F: "\f";
export declare const R: "\r";
export declare const EQ: "=";
export declare const QUOTEMARK: `"`;
export declare const SPACE: " ";
export declare const OPEN_BRAKET: "[";
export declare const CLOSE_BRAKET: "]";
export declare const SLASH: "/";
export declare const BACKSLASH: "\\";
