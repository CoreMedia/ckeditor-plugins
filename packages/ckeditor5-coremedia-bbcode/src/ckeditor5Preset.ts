import { getUniqAttr, TagNode } from "@bbob/plugin-helper/es";
import { createPreset } from "@bbob/preset/es";
import html5Preset from "@bbob/preset-html5/es";

type DefaultTags = Parameters<typeof createPreset>[0];
type TagMappingFn = DefaultTags[string];
type Core = Parameters<TagMappingFn>[1];
type Tag = TagNode["tag"];
type Content = TagNode["content"];
type Attrs = TagNode["attrs"];

const toNode = (tag: Tag, attrs: Attrs, content: Content): TagNode => ({
  tag,
  attrs,
  content,
});

/**
 * Extension of the HTML 5 Default Preset, that ships with BBob. It adapts
 * the given presets, so that they align with the expectations by CKEditor 5
 * regarding the representation in data view.
 */
export const ckeditor5Preset: typeof html5Preset = html5Preset.extend(
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
