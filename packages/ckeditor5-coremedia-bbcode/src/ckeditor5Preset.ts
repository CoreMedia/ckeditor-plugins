import { getUniqAttr, isStringNode, isTagNode, TagNode } from "@bbob/plugin-helper/es";
import { createPreset } from "@bbob/preset/es";

type DefaultTags = Parameters<typeof createPreset>[0];
type TagMappingFn = DefaultTags[string];
type Core = Parameters<TagMappingFn>[1];
type Options = Parameters<TagMappingFn>[2];
type RenderFn = Core["render"];
type Tag = TagNode["tag"];
type Content = TagNode["content"];
type Attrs = TagNode["attrs"];

const isStartsWith = (node: string, type: string): boolean => node[0] === type;

const styleMap = {
  color: (val: string): string => `color:${val};`,
  size: (val: string): string => `font-size:${val};`,
};
type MappedStyle = keyof typeof styleMap;
const isMappedStyle = (value: string): value is MappedStyle => Object.keys(styleMap).includes(value);

const getStyleFromAttrs = (attrs: Attrs) =>
  Object.keys(attrs)
    .reduce((acc: string[], key): string[] => (isMappedStyle(key) ? acc.concat(styleMap[key](attrs[key])) : acc), [])
    .join(" ");

const asListItems = (content: Content): NonNullable<Content> => {
  let listIdx = 0;
  const listItems: NonNullable<Content> = [];
  type ValueType = (typeof listItems)[number];

  const createItemNode = () => TagNode.create("li");
  const ensureListItem = (val: ValueType) => {
    listItems[listIdx] = listItems[listIdx] || val;
  };
  const addItem = (val: ValueType) => {
    // @ts-expect-error - TODO: Analyze and understand preset-html5 behavior
    if (listItems[listIdx] && listItems[listIdx].content) {
      // @ts-expect-error - TODO: Analyze and understand preset-html5 behavior
      listItems[listIdx].content = listItems[listIdx].content.concat(val);
    } else {
      // @ts-expect-error - TODO: Analyze and understand preset-html5 behavior
      listItems[listIdx] = listItems[listIdx].concat(val);
    }
  };

  content?.forEach((el) => {
    if (isStringNode(el) && isStartsWith(el, "*")) {
      if (listItems[listIdx]) {
        listIdx++;
      }
      ensureListItem(createItemNode());
      addItem(el.substr(1));
    } else if (isTagNode(el) && TagNode.isOf(el, "*")) {
      if (listItems[listIdx]) {
        listIdx++;
      }
      ensureListItem(createItemNode());
    } else if (!isTagNode(listItems[listIdx])) {
      listIdx++;
      ensureListItem(el);
    } else if (listItems[listIdx]) {
      addItem(el);
    } else {
      ensureListItem(el);
    }
  });

  // @ts-expect-error - TODO: Analyze and understand preset-html5 behavior
  return [].concat(listItems);
};

const renderUrl = (node: TagNode, render: RenderFn, options: Options): string =>
  getUniqAttr(node.attrs) ? getUniqAttr(node.attrs) : render(node.content);

const toNode = (tag: Tag, attrs: Attrs, content: Content): TagNode => ({
  tag,
  attrs,
  content,
});

const toStyle = (style: string): { style: string } => ({ style });

const defaultTags: DefaultTags = {
  b: (node: TagNode) => toNode("span", toStyle("font-weight: bold;"), node.content),
  i: (node: TagNode) => toNode("span", toStyle("font-style: italic;"), node.content),
  u: (node: TagNode) => toNode("span", toStyle("text-decoration: underline;"), node.content),
  s: (node: TagNode) => toNode("span", toStyle("text-decoration: line-through;"), node.content),
  url: (node, { render }, options) =>
    toNode(
      "a",
      {
        href: renderUrl(node, render, options),
      },
      node.content,
    ),
  img: (node, { render }) =>
    toNode(
      "img",
      {
        src: render(node.content),
      },
      null,
    ),
  quote: (node) => toNode("blockquote", {}, [toNode("p", {}, node.content)]),
  code: (node) => toNode("pre", {}, node.content),
  style: (node) => toNode("span", toStyle(getStyleFromAttrs(node.attrs)), node.content),
  list: (node) => {
    const type = getUniqAttr(node.attrs);

    return toNode(type ? "ol" : "ul", type ? { type } : {}, asListItems(node.content));
  },
  color: (node) => toNode("span", toStyle(`color: ${getUniqAttr(node.attrs)};`), node.content),
};

export const ckeditor5Preset = createPreset(defaultTags);
