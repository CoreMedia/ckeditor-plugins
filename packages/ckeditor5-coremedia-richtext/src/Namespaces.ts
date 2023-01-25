/**
 * List of well-known namespace prefixes used along with CoreMedia Rich Text 1.0.
 */
export const knownNamespacePrefixes = ["xml", "xlink", "xdiff"];

/**
 * Type of well-known namespace prefixes.
 */
export type KnownNamespacePrefix = typeof knownNamespacePrefixes[number];

/**
 * Type guard, if the given value represents a well-known namespace prefix.
 *
 * @param value - value to validate.
 */
export const isKnownNamespacePrefix = (value: unknown): value is KnownNamespacePrefix =>
  typeof value === "string" && knownNamespacePrefixes.includes(value);

/**
 * Maps namespace prefixes to expected namespace URIs.
 */
export const namespaces: Record<KnownNamespacePrefix | "default", string> = {
  /**
   * XDiff namespace as it may be provided via server side differencing
   * augmenting CoreMedia Rich Text 1.0 data.
   */
  xdiff: "http://www.coremedia.com/2015/xdiff",
  /**
   * XLink namespace as used to represent links to images, contents and
   * external URLs in CoreMedia Rich Text 1.0.
   */
  xlink: "http://www.w3.org/1999/xlink",
  /**
   * XML namespace, used, for example, by `xml:lang`.
   */
  xml: "http://www.w3.org/XML/1998/namespace",
  /**
   * The default namespace, processing is about: CoreMedia Rich Text 1.0
   */
  default: "http://www.coremedia.com/2003/richtext-1.0",
};
