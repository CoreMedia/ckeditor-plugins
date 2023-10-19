import { TagNode } from "@bbob/plugin-helper/es";
import { Attrs, Content, Tag } from "./types";

// eslint-disable-next-line no-null/no-null
export const toNode = (tag: Tag, attrs: Attrs = {}, content: Content = null): TagNode => ({
  tag,
  attrs,
  content,
});
