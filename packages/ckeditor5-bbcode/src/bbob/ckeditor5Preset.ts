import { getUniqAttr, isEOL, isTagNode, N, TagAttrs, TagNode } from "@bbob/plugin-helper/es";
import { createPreset } from "@bbob/preset/es";
import html5DefaultTags from "@bbob/preset-html5/es/defaultTags";
import { CoreTree } from "@bbob/core/es";
import { paragraphAwareContent } from "./Paragraphs";
import { Core, DefaultTags, Options } from "./types";
import { bbCodeLogger } from "../BBCodeLogger";
import { uniqueAttrToAttr } from "./Attributes";
import { renderRaw } from "./renderRaw";

const toNode = TagNode.create;

/**
 * To be able to handle paragraphs also on root-level within the defined
 * tag-set, we need to create an artificial root node.
 *
 * As long as allowed tags are configured, there is no need to increase
 * efforts to prevent collisions with same-named tag-nodes within the
 * original BBCode.
 */
const rootNodeName = "root" as const;

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
    //tree.walk((node) => (isTagNode(node) && tags[node.tag] ? tags[node.tag](node, core, options) : node));
    tree.walk((node) => (isTagNode(node) && tags[node.tag] ? tags[node.tag](node, core, options) : node));
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

/**
 * Removes EOLs at the beginning and end, that may be a result of
 * BBCode pretty-printing.
 *
 * @param contents - contents to trim
 */
const trimEOL = (contents: TagNode["content"]): TagNode["content"] => {
  const result: TagNode["content"] = [];
  const bufferedEOLs: (typeof N)[] = [];
  for (const content of contents ?? []) {
    if (isEOL(content)) {
      // > 0: Ignore EOLs at the beginning
      if (result.length > 0) {
        bufferedEOLs.push(content);
      }
    } else {
      // Push any EOLs collected up to now.
      result.push(...bufferedEOLs);
      result.push(content);
      bufferedEOLs.length = 0;
    }
  }
  // Ignoring any bufferedEOLs at the end implements the "trim at end"
  // feature.
  return result;
};

const toHtmlAnchorAttrs = (node: TagNode): TagAttrs =>
  uniqueAttrToAttr("href", node.attrs, false, () => renderRaw(node));

/**
 * Extension of the HTML 5 Default Preset, that ships with BBob. It adapts
 * the given presets, so that they align with the expectations by CKEditor 5
 * regarding the representation in data view.
 */
export const ckeditor5Preset: ReturnType<typeof createPreset> = basePreset.extend((tags: DefaultTags): DefaultTags => {
  const extendedTags: DefaultTags = {
    ...tags,
    /**
     * Processes artificial root-node to support paragraphs in root-level.
     */
    root: toParagraphAwareNode,
    td: toParagraphAwareNode,
    th: toParagraphAwareNode,
    /**
     * During default processing by HTML5 preset, `li` nodes get generated from
     * `*` nodes. As a subsequent step, we add support for nested paragraphs
     * within these tags.
     */
    li: toParagraphAwareNode,
    /**
     * Transforms `quote` to `blockquote`. Ensures that only block-level
     * nodes are contained within `blockquote`. Wraps, for example, plain text
     * content into a paragraph node.
     */
    quote: (node) => toNode("blockquote", {}, paragraphAwareContent(node.content ?? [], { requireParagraph: true })),
    /**
     * Override default from HTML5 Preset for CKEditor 5: CKEditor 5 requires a
     * nested `<code>` element and allows specifying the language via a
     * corresponding class parameter.
     */
    code: (node: TagNode): TagNode => {
      // Using `||` also for possibly empty string.
      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
      const language = getUniqAttr(node.attrs) || "plaintext";
      return toNode("pre", {}, [toNode("htmlCode", { class: `language-${language}` }, node.content)]);
    },
    /**
     * Processing of artificial intermediate node created via `code` parsing.
     * We need this extra mapping, not to recurse into `code` parsing, thus,
     * we must not add a `code` node within the `[code]` to `<pre>` processing,
     * which again is required for proper code block support in CKEditor 5.
     */
    htmlCode: (node: TagNode): TagNode => toNode("code", node.attrs, trimEOL(node.content)),
    url: (node: TagNode): TagNode => toNode("a", toHtmlAnchorAttrs(node), node.content),
  };
  bbCodeLogger.debug(`Extended Tags to: ${Object.keys(extendedTags)}`);
  return extendedTags;
});
