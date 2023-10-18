import { getUniqAttr, isTagNode, TagNode } from "@bbob/plugin-helper/es";
import { createPreset } from "@bbob/preset/es";
import html5DefaultTags from "@bbob/preset-html5/es/defaultTags";
import { CoreTree } from "@bbob/core/es";

type DefaultTags = Parameters<typeof createPreset>[0];
type TagMappingFn = DefaultTags[string];
type Core = Parameters<TagMappingFn>[1];
type Options = Parameters<TagMappingFn>[2];
type Tag = TagNode["tag"];
type Content = TagNode["content"];
type Attrs = TagNode["attrs"];

const toNode = (tag: Tag, attrs: Attrs, content: Content): TagNode => ({
  tag,
  attrs,
  content,
});

/**
 * Copy of default processor with adaptations to incorporate workaround for
 * https://github.com/JiLiZART/BBob/issues/125.
 */
const process = (tags: DefaultTags, tree: CoreTree, core: Core, options: Options) => {
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
    /**
     * Adapted for CKEditor 5: CKEditor 5 requires a nested `<code>` element and
     * allows specifying the language via a corresponding class parameter.
     */
    code: (node: TagNode, { render }: Core): TagNode => {
      const language = getUniqAttr(node.attrs) || "plaintext";
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
