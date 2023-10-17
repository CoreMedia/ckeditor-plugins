import type { createPreset } from "@bbob/preset/es";

type DefaultTags = Parameters<typeof createPreset>[0];
type TagMappingFn = DefaultTags[string];
type SupportedBBCodeTag = "b" | "i" | "u" | "s" | "url" | "img" | "quote" | "code" | "style" | "list" | "color";

declare const defaultTags: Record<SupportedBBCodeTag, TagMappingFn>;
export default defaultTags;
