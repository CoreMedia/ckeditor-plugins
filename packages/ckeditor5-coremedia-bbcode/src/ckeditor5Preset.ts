import { getUniqAttr, TagNode } from "@bbob/plugin-helper/es";
import { createPreset } from "@bbob/preset/es";
import html5Preset from "@bbob/preset-html5/es";

type DefaultTags = Parameters<typeof createPreset>[0];
type TagMappingFn = DefaultTags[string];
type Core = Parameters<TagMappingFn>[1];
type RenderFn = Core["render"];
type Tag = TagNode["tag"];
type Content = TagNode["content"];
type Attrs = TagNode["attrs"];

const toNode = (tag: Tag, attrs: Attrs, content: Content): TagNode => ({
  tag,
  attrs,
  content,
});

export const ckeditor5Preset: typeof html5Preset = html5Preset.extend(
  (tags: DefaultTags): DefaultTags => ({
    ...tags,
    /**
     * Adapted for CKEditor 5: CKEditor 5 requires a nested `<code>` element and
     * allows specifying the language via a corresponding class parameter.
     */
    code: (node) => {
      if ("class" in node.attrs) {
        // Break recursion: Nothing to do, it is our node we created before
        // by assigning a language attribute.
        return node;
      }
      const language = getUniqAttr(node.attrs) || "plaintext";
      return toNode("pre", {}, [toNode("code", { class: `language-${language}` }, node.content)]);
    },
  }),
);
