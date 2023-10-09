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

  /**
   * Gets value from
   * @example
   * getUniqAttr({ 'foo': true, 'bar': bar' }) => 'bar'
   * @param attrs
   * @returns {string}
   */
  declare function getUniqAttr(attrs: Record<string, string>): string;

  export { TagNode, getUniqAttr, isTagNode, isStringNode };
}

/*
import { OPEN_BRAKET, CLOSE_BRAKET, SLASH } from './char';
import {
  getNodeLength, appendToNode, attrsToString, attrValue, getUniqAttr,
} from './helpers';

const getTagAttrs = (tag: string, params: Record<string, string>) => {
  const uniqAattr = getUniqAttr(params);

  if (uniqAattr) {
    const tagAttr = attrValue(tag, uniqAattr);
    const attrs = { ...params };

    delete attrs[uniqAattr];

    const attrsStr = attrsToString(attrs);

    return `${tagAttr}${attrsStr}`;
  }

  return `${tag}${attrsToString(params)}`;
};

class TagNode {
  tag: string;
  attrs: Record<string, string>;
  content: string[];

  constructor(tag: string, attrs: Record<string, string>, content: string | string[]) {
    this.tag = tag;
    this.attrs = attrs;
    this.content = Array.isArray(content) ? content : [content];
  }

  attr(name: string, value?: string) {
    if (typeof value !== 'undefined') {
      this.attrs[name] = value;
    }

    return this.attrs[name];
  }

  append(value: string) {
    return appendToNode(this, value);
  }

  get length() {
    return getNodeLength(this);
  }

  toTagStart({ openTag = OPEN_BRAKET, closeTag = CLOSE_BRAKET }: { openTag?: string, closeTag?: string } = {}) {
    const tagAttrs = getTagAttrs(this.tag, this.attrs);

    return `${openTag}${tagAttrs}${closeTag}`;
  }

  toTagEnd({ openTag = OPEN_BRAKET, closeTag = CLOSE_BRAKET }: { openTag?: string, closeTag?: string } = {}) {
    return `${openTag}${SLASH}${this.tag}${closeTag}`;
  }

  toTagNode() {
    return new TagNode(this.tag.toLowerCase(), this.attrs, this.content);
  }

  toString({ openTag = OPEN_BRAKET, closeTag = CLOSE_BRAKET }: { openTag?: string, closeTag?: string } = {}) {
    const isEmpty = this.content.length === 0;
    const content = this.content.reduce((r, node) => r + node.toString({ openTag, closeTag }), '');
    const tagStart = this.toTagStart({ openTag, closeTag });

    if (isEmpty) {
      return tagStart;
    }

    return `${tagStart}${content}${this.toTagEnd({ openTag, closeTag })}`;
  }
}

TagNode.create = (tag: string, attrs: Record<string, string> = {}, content: string[] = []) => new TagNode(tag, attrs, content);
TagNode.isOf = (node: TagNode, type: string) => (node.tag === type);

export { TagNode };
export default TagNode;
 */
