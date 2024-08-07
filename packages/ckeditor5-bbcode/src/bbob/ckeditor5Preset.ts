import { getUniqAttr, isTagNode, TagAttrs, TagNode } from "@bbob/plugin-helper/es";
import { createPreset } from "@bbob/preset/es";
import html5DefaultTags from "@bbob/preset-html5/es/defaultTags";
import { CoreTree } from "@bbob/core/es";
import { paragraphAwareContent } from "./Paragraphs";
import { Core, DefaultTags, Options } from "./types";
import { bbCodeLogger } from "../BBCodeLogger";
import { stripUniqueAttr, uniqueAttrToAttr } from "./Attributes";
import { renderRaw } from "./renderRaw";
import { trimEOL } from "./TagNodes";
import { fontSizes, normalSize } from "../utils/FontSizes";

type DefaultTagsRule = DefaultTags[string];

const toNode = TagNode.create;

/**
 * To be able to handle paragraphs also on root-level within the defined
 * tag-set, we need to create an artificial root node.
 *
 * As long as allowed tags are configured, there is no need to increase
 * efforts to prevent collisions with same-named tag-nodes within the
 * original BBCode.
 */
const rootNodeName = "root";

/**
 * Wraps tree contents into an artificial root-node, that may then respect
 * paragraphs during processing.
 *
 * @param tree - tree to wrap
 * @returns function to later unwrap the tree; unwrapping will fail with Error,
 * when the tree changed in an unexpected way, i.e., does not have a singleton
 * node of type _root-node_ anymore.
 */
const wrapInRoot = (tree: CoreTree): (() => void) => {
  const treeContents = [...tree];
  const rootNode = toNode(rootNodeName, {}, treeContents);
  tree.length = 0;
  tree.push(rootNode);

  // Unwrap root node.
  return () => {
    if (tree.length !== 1) {
      throw new Error(
        `Failed to unwrap artificial root node due to an unexpected state. Expect a single artificial root node as entry, but tree size is ${tree.length}.`,
      );
    }
    const [processedRootNode] = tree;
    if (!isTagNode(processedRootNode) || !TagNode.isOf(processedRootNode, rootNodeName)) {
      throw new Error(
        `Failed to unwrap artificial root node due to an unexpected state. Singleton root node is not of expected type ${rootNodeName}: ${JSON.stringify(
          tree,
        )}`,
      );
    }
    tree.length = 0;
    tree.push(...(processedRootNode.content ?? []));
  };
};

/**
 * Copy of default processor with adaptations to incorporate workaround for
 * https://github.com/JiLiZART/BBob/issues/125.
 */
const process = (tags: DefaultTags, tree: CoreTree, core: Core, options: Options) => {
  const logger = bbCodeLogger;

  if (logger.isDebugEnabled()) {
    logger.debug(`Starting processing parsed AST: ${JSON.stringify(tree)}`);
  }

  const unwrap = wrapInRoot(tree);
  try {
    tree.walk((node) => (node && isTagNode(node) && tags[node.tag] ? tags[node.tag](node, core, options) : node));
  } finally {
    unwrap();
  }

  if (logger.isDebugEnabled()) {
    logger.debug(`Done processing parsed AST: ${JSON.stringify(tree)}`);
  }
};

/**
 * Base Preset to modify parser, too. Possibly to be replaced once
 * https://github.com/JiLiZART/BBob/issues/125 got resolved (newline handling).
 *
 * Note that if we stick to this custom preset, we could just modify the tags
 * here (and export it as `ckeditor5Preset` directly). We keep this split-up
 * state to possibly revert to extending the `html5Preset` instead.
 */
const basePreset: ReturnType<typeof createPreset> = createPreset(html5DefaultTags, process);

/**
 * Transforms the node as is, but ensures that its content respects possible
 * paragraph formatting.
 */
const toParagraphAwareNode = (node: TagNode): TagNode =>
  toNode(node.tag, node.attrs, paragraphAwareContent(node.content ?? []));

const toHtmlAnchorAttrs = (node: TagNode): TagAttrs =>
  uniqueAttrToAttr("href", node.attrs, false, () => renderRaw(node));

const toHtmlImageAttrs = (node: TagNode): TagAttrs => {
  const { attrs } = node;
  // We ignore unique attributes here, but keep all others, just in case
  // they got defined. Some BBCode dialects use the unique attribute to
  // denote an image size like: [img=640x480], while others use
  // [img width=640 height=480]. The latter one will pass here as is due
  // to not stripping other attributes.
  //
  // This implicitly also opens doors for supporting the `alt` attribute,
  // as provided with the CKEditor 5 image feature.
  const { otherAttrs } = stripUniqueAttr(attrs);
  // Keep other attributes, but override any possibly already set
  // `src` with unexpected tags such as: `[img src=...]` which is not
  // standard BBCode.
  otherAttrs.src = renderRaw(node);
  return otherAttrs;
};

/**
 * Override default from HTML5 Preset for CKEditor 5: CKEditor 5 requires a
 * nested `<code>` element and allows specifying the language via a
 * corresponding class parameter.
 *
 * See also: <https://github.com/JiLiZART/BBob/issues/205>.
 */
const code: DefaultTagsRule = (node: TagNode): TagNode => {
  // Using `||` also for possibly empty string.
  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  const language = getUniqAttr(node.attrs) || "plaintext";
  return toNode("pre", {}, [toNode("htmlCode", { class: `language-${language}` }, node.content)]);
};

/**
 * Processing of artificial intermediate node created via `code` parsing.
 * We need this extra mapping, not to recurse into `code` parsing, thus,
 * we must not add a `code` node within the `[code]` to `<pre>` processing,
 * which again is required for proper code block support in CKEditor 5.
 */
const htmlCode: DefaultTagsRule = (node: TagNode): TagNode => toNode("code", node.attrs, trimEOL(node.content));

/**
 * Transforms `quote` to `blockquote`. Ensures that only block-level
 * nodes are contained within `blockquote`. Wraps, for example, plain text
 * content into a paragraph node.
 */
const quote: DefaultTagsRule = (node) =>
  toNode("blockquote", {}, paragraphAwareContent(node.content ?? [], { requireParagraph: true }));

const url: DefaultTagsRule = (node: TagNode): TagNode => toNode("a", toHtmlAnchorAttrs(node), node.content);

const img: DefaultTagsRule = (node: TagNode): TagNode => ({
  ...toNode("img", toHtmlImageAttrs(node), null),
  // Workaround: https://github.com/JiLiZART/BBob/issues/206
  content: null,
});

const toFontSizeSpanAttrs = (node: TagNode): TagAttrs => {
  // Stage 1: Check if (expected) unique attribute exists; return only other attributes otherwise
  const { uniqueAttrValue, otherAttrs } = stripUniqueAttr(node.attrs);
  if (!uniqueAttrValue) {
    return otherAttrs;
  }

  // Stage 2: Check if unique attribute represents a number; return only other attributes otherwise
  const nValue = Number(uniqueAttrValue);
  if (Number.isNaN(nValue)) {
    return otherAttrs;
  }

  // Stage 3: Check if unique attribute represents a known number to map; return only other attributes otherwise
  const matchedEntry = fontSizes.find((config) => config.matchesData(nValue));
  if (!matchedEntry || matchedEntry.numeric === normalSize) {
    return otherAttrs;
  }

  // Stage 4: Prepare new attributes including `class` attribute (possibly merge with existing)

  const existingClass: string | undefined = otherAttrs.class;
  const classValue = existingClass ? `${matchedEntry.className} ${existingClass}` : matchedEntry.className;
  return {
    ...otherAttrs,
    class: classValue,
  };
};

/**
 * Parses the font-size given by `[size=number]` within BBCode and transforms
 * it to a `<span>` with a size representing class attribute.
 */
const size: DefaultTagsRule = (node: TagNode): TagNode => toNode("span", toFontSizeSpanAttrs(node), node.content);

/**
 * Mappings for nodes, that need to be aware of internal paragraph handling
 * (only).
 *
 * Some remarks:
 *
 * * `root`: Processes artificial root-node to support paragraphs in root-level.
 * * `li`: During default processing by HTML5 preset, `li` nodes get generated
 *   from `*` nodes. As a subsequent step, we add support for nested paragraphs
 *   within these tags.
 */
const paragraphAwareTags: DefaultTags = Object.fromEntries(["root", "li"].map((tag) => [tag, toParagraphAwareNode]));

/**
 * Extension of the HTML 5 Default Preset, that ships with BBob. It adapts
 * the given presets, so that they align with the expectations by CKEditor 5
 * regarding the representation in data view.
 */
export const ckeditor5Preset: ReturnType<typeof createPreset> = basePreset.extend((tags: DefaultTags): DefaultTags => {
  const extendedTags: DefaultTags = {
    ...tags,
    ...paragraphAwareTags,
    quote,
    code,
    htmlCode,
    url,
    img,
    size,
  };
  bbCodeLogger.debug(`Extended Tags to: ${Object.keys(extendedTags)}`);
  return extendedTags;
});
