import type { TagNode } from "@bbob/plugin-helper/es";
import type { createPreset } from "@bbob/preset/es";

export type DefaultTags = Parameters<typeof createPreset>[0];
export type TagMappingFn = DefaultTags[string];
export type Core = Parameters<TagMappingFn>[1];
export type Options = Parameters<TagMappingFn>[2];
export type Tag = TagNode["tag"];
export type Content = TagNode["content"];
export type Attrs = TagNode["attrs"];
