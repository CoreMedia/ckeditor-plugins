import { getUniqAttr, isTagNode, TagNode } from "@bbob/plugin-helper/es";
import { createPreset } from "@bbob/preset/es";
import html5DefaultTags from "@bbob/preset-html5/es/defaultTags";
import { CoreTree } from "@bbob/core/es";
import { paragraphAwareContent } from "./Paragraphs";
import { Core, DefaultTags, Options } from "./types";
import { bbCodeLogger } from "../BBCodeLogger";

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
    tree.push(...processedRootNode.content);
  };
};

/**
 * Copy of default processor with adaptations to incorporate workaround for
 * https://github.com/JiLiZART/BBob/issues/125.
 */
const process = (tags: DefaultTags, tree: CoreTree, core: Core, options: Options) => {
  const unwrap = wrapInRoot(tree);
  try {
    //tree.walk((node) => (isTagNode(node) && tags[node.tag] ? tags[node.tag](node, core, options) : node));
    tree.walk((node) => (isTagNode(node) && tags[node.tag] ? tags[node.tag](node, core, options) : node));
  } finally {
    unwrap();
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
  toNode(node.tag, node.attrs, paragraphAwareContent(node.content));

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
    quote: (node) => toNode("blockquote", {}, paragraphAwareContent(node.content, { requireParagraph: true })),
    /**
     * Override default from HTML5 Preset for CKEditor 5: CKEditor 5 requires a
     * nested `<code>` element and allows specifying the language via a
     * corresponding class parameter.
     */
    code: (node: TagNode, { render }: Core): TagNode => {
      const language = getUniqAttr(node.attrs) || "plaintext";
      // TODO: Possibly pass stripTags=true? We must prevent any plain script tag to appear.
      // TODO: We may also need to prevent "onclick" etc. handlers, thus, strip any
      //   unhandled attributes.
      const renderedCodeContent = render(node.content);
      // Remove some surrounding space from possible pretty-print BBCode.
      // If not doing so, you will see some extra lines above and below the
      // actual code within the code-block.
      const trimmedRenderedCodeContent = renderedCodeContent.trim();
      // Must not nest mapping to code-Node, as this would trigger an endless
      // recursion. Render the node directly instead.
      const renderedCode = render(toNode("code", { class: `language-${language}` }, [trimmedRenderedCodeContent]));
      return toNode("pre", {}, [renderedCode]);
    },
  };
  bbCodeLogger.debug(`Extended Tags to: ${Object.keys(extendedTags)}`);
  return extendedTags;
});
