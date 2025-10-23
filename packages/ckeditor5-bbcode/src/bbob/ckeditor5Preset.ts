import type { BBobCoreTagNodeTree, ProcessorFunction } from "@bbob/types";
import { getUniqAttr, isTagNode, TagNode } from "@bbob/plugin-helper";
import { createPreset } from "@bbob/preset";
import { defaultTags } from "@bbob/preset-html5/defaultTags";
import { bbCodeLogger } from "../BBCodeLogger";
import { fontSizes, normalSize } from "../utils/FontSizes";
import { stripUniqueAttr, uniqueAttrToAttr } from "./Attributes";
import { paragraphAwareContent } from "./Paragraphs";
import { renderRaw } from "./renderRaw";
import { trimEOL } from "./TagNodes";
import type { DefaultTags } from "./types";

type TagNodeType = ReturnType<typeof TagNode.create>;

type DefaultTagsRule = DefaultTags[string];

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
const wrapInRoot = (tree: BBobCoreTagNodeTree): (() => void) => {
  const treeContents = [...tree];
  const rootNode = TagNode.create(rootNodeName, {}, treeContents);
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
    tree.push(...(Array.isArray(processedRootNode.content) ? processedRootNode.content : []));
  };
};

/**
 * Copy of default processor with adaptations to incorporate workaround for
 * https://github.com/JiLiZART/BBob/issues/125.
 */
const process: ProcessorFunction<DefaultTags> = (tags, tree, core, options) => {
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
  return tree;
};

/**
 * Base Preset to modify parser, too. Possibly to be replaced once
 * https://github.com/JiLiZART/BBob/issues/125 got resolved (newline handling).
 *
 * Note that if we stick to this custom preset, we could just modify the tags
 * here (and export it as `ckeditor5Preset` directly). We keep this split-up
 * state to possibly revert to extending the `html5Preset` instead.
 */
const basePreset: ReturnType<typeof createPreset> = createPreset(defaultTags, process);

/**
 * Transforms the node as is, but ensures that its content respects possible
 * paragraph formatting.
 */
const toParagraphAwareNode = (node: TagNodeType): TagNodeType =>
  TagNode.create(node.tag, node.attrs, paragraphAwareContent(node.content ?? []));

const toHtmlAnchorAttrs = (node: TagNodeType): Record<string, unknown> =>
  uniqueAttrToAttr("href", node.attrs, false, () => renderRaw(node));

const toHtmlImageAttrs = (node: TagNodeType): Record<string, unknown> => {
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
const code = (node: TagNodeType): TagNodeType => {
  // Using `||` also for possibly empty string.
  const language = getUniqAttr(node.attrs) || "plaintext";
  return TagNode.create("pre", {}, [TagNode.create("htmlCode", { class: `language-${language}` }, node.content)]);
};

/**
 * Processing of artificial intermediate node created via `code` parsing.
 * We need this extra mapping, not to recurse into `code` parsing, thus,
 * we must not add a `code` node within the `[code]` to `<pre>` processing,
 * which again is required for proper code block support in CKEditor 5.
 */
const htmlCode = (node: TagNodeType): TagNodeType => TagNode.create("code", node.attrs, trimEOL(node.content));

/**
 * Transforms `quote` to `blockquote`. Ensures that only block-level
 * nodes are contained within `blockquote`. Wraps, for example, plain text
 * content into a paragraph node.
 */
const quote: DefaultTagsRule = (node) =>
  TagNode.create("blockquote", {}, paragraphAwareContent(node.content ?? [], { requireParagraph: true }));

const url = (node: TagNodeType): TagNodeType => TagNode.create("a", toHtmlAnchorAttrs(node), node.content);

const img = (node: TagNodeType) => ({
  ...TagNode.create("img", toHtmlImageAttrs(node), null),
  // Workaround: https://github.com/JiLiZART/BBob/issues/206
  content: null,
});

const toFontSizeSpanAttrs = (node: TagNodeType): Record<string, unknown> => {
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

  const existingClass = typeof otherAttrs.class === "string" ? otherAttrs.class : undefined;
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
const size = (node: TagNodeType): TagNodeType => TagNode.create("span", toFontSizeSpanAttrs(node), node.content);

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
const paragraphAwareTags = Object.fromEntries(["root", "li"].map((tag) => [tag, toParagraphAwareNode]));

/**
 * Extension of the HTML 5 Default Preset, that ships with BBob. It adapts
 * the given presets, so that they align with the expectations by CKEditor 5
 * regarding the representation in data view.
 */
// @ts-expect-error TODO just for now
export const ckeditor5Preset = basePreset.extend((tags) => {
  const extendedTags = {
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
