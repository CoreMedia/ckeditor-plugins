type Attrs = Record<string, string>;

declare module "@bbob/plugin-helper/es" {
  declare class TagNode {
    tag: string;
    attrs: Attrs;
    content: (string | TagNode)[] | null;
    static create: (tag: string, attrs: Attrs = {}, content: (string | TagNode)[] = []) => TagNode;
    static isOf: (node: TagNode, type: string) => boolean;
  }

  declare function isTagNode(el: unknown): el is TagNode;
  declare function isStringNode(el: unknown): el is string;

  declare function getUniqAttr(attrs: Record<string, string>): string;

  export { TagNode, getUniqAttr, isTagNode, isStringNode };
}
