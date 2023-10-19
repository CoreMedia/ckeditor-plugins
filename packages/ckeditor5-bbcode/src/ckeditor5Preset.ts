import { getUniqAttr, isEOL, isTagNode, TagNode } from "@bbob/plugin-helper/es";
import { createPreset } from "@bbob/preset/es";
import html5DefaultTags from "@bbob/preset-html5/es/defaultTags";
import { CoreTree } from "@bbob/core/es";
import { paragraphAwareContent } from "./bbob/Paragraphs";

type DefaultTags = Parameters<typeof createPreset>[0];
type TagMappingFn = DefaultTags[string];
type Core = Parameters<TagMappingFn>[1];
type Options = Parameters<TagMappingFn>[2];
type Tag = TagNode["tag"];
type Content = TagNode["content"];
type Attrs = TagNode["attrs"];

// eslint-disable-next-line no-null/no-null
const toNode = (tag: Tag, attrs: Attrs = {}, content: Content = null): TagNode => ({
  tag,
  attrs,
  content,
});

/**
 * Copy of default processor with adaptations to incorporate workaround for
 * https://github.com/JiLiZART/BBob/issues/125.
 */
const process = (tags: DefaultTags, tree: CoreTree, core: Core, options: Options) => {
  /*
   * Brainstorming
   *
   * * On top-level it is clear, that each set of consecutive newlines
   *   describes a paragraph.
   *
   * * Within inline-tags any paragraph is forbidden and should better be
   *   ignored, possibly replaced by some BR? The only alternative here is
   *   to ignore the newline(s).
   *
   * * We must not adapt anything, if we are inside a code-block. Newlines must
   *   be kept as is.
   *
   * * We may leave it to explicit DefaultTags configuration, how newlines should
   *   be handled within.
   *
   * * If we don't provide a "global handling", it requires any tag that should
   *   handle doubled newlines, to be explicitly defined and not implicitly
   *   converted. Such as `[h1]` is converted to `<h1>` without any further do.
   *
   * * Tags that should add special handling (thus, add paragraphs on demand):
   *   [th], [td], [quote], [*] and "top level".
   *
   * * Regarding [*] Preset HTML transforms them to "li" TagNodes, which means
   *   as an assumption that we can handle them with an extra [li] rule. Tests
   *   show, that this is true, as the parents get processed prior to its
   *   children. Thus, the rules will never process "*", as it already got
   *   transformed to "li" when processing "list".
   *
   * * Having this, we could trick the processing, to create some intermediate
   *   artificial child like "respect-paragraphs". This could then add
   *   paragraphs where required. Only for root we need to find some other
   *   solution, possibly introducing a virtual "root" even before handing
   *   over to processing. The other option would be tracking the "depth"
   *   within the process function and respond to "top-level" nodes.
   */
  tree.walk((node) => (isTagNode(node) && tags[node.tag] ? tags[node.tag](node, core, options) : node));
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
 * Extension of the HTML 5 Default Preset, that ships with BBob. It adapts
 * the given presets, so that they align with the expectations by CKEditor 5
 * regarding the representation in data view.
 */
export const ckeditor5Preset: ReturnType<typeof createPreset> = basePreset.extend(
  (tags: DefaultTags): DefaultTags => ({
    ...tags,
    td: (node) => {
      // Must enable extra processing for `td` to handle nested paragraphs
      // correctly.
      node.content = paragraphAwareContent(node.content);
      return node;
    },
    th: (node) => {
      // Must enable extra processing for `th` to handle nested paragraphs
      // correctly.
      node.content = paragraphAwareContent(node.content);
      return node;
    },
    li: (node) => {
      // Processing the transformed result from BBob Preset HTML5. We must not
      // return a node with the same name here, but instead we directly modify
      // the content.
      node.content = paragraphAwareContent(node.content);
      return node;
    },
    quote: (node) => {
      console.log("quote", {
        node,
        content: node.content,
      });
      return toNode("blockquote", {}, paragraphAwareContent(node.content, { requireParagraph: true }));
    },
    /**
     * Adapted for CKEditor 5: CKEditor 5 requires a nested `<code>` element and
     * allows specifying the language via a corresponding class parameter.
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
  }),
);
