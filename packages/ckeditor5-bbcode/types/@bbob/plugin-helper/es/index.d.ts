type TagAttrs = Record<string, string>;

declare module "@bbob/plugin-helper/es" {
  declare class TagNode {
    readonly tag: string;
    attrs: TagAttrs;
    content: (string | TagNode)[] | null;
    append?: (value: string) => void;
    static create: (tag: string, attrs: TagAttrs = {}, content: (string | TagNode)[] = []) => TagNode;
    static isOf: (node: TagNode, type: string) => node is TagNode & { tag: typeof type };
  }

  declare function isTagNode(el: unknown): el is TagNode;
  declare function isStringNode(el: unknown): el is string;

  declare function getUniqAttr(attrs: Record<string, string>): string;

  export { TagNode, getUniqAttr, isTagNode, isStringNode };
}
