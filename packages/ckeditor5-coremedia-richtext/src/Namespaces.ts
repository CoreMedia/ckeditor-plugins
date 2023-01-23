export const knownNamespacePrefixes = ["xml", "xlink", "xdiff"];

export type KnownNamespacePrefix = typeof knownNamespacePrefixes[number];

export const isKnownNamespacePrefix = (value: unknown): value is KnownNamespacePrefix => typeof value === "string" && knownNamespacePrefixes.includes(value);

/**
 * Maps namespace prefixes to expected namespace URIs.
 */
export const namespaces: Record<KnownNamespacePrefix | "default", string> = {
  // TODO: Better part in differencing plugin.
  xdiff: "http://www.coremedia.com/2015/xdiff",
  xlink: "http://www.w3.org/1999/xlink",
  xml: "http://www.w3.org/XML/1998/namespace",
  default: "http://www.coremedia.com/2003/richtext-1.0",
};
