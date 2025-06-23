export const COREMEDIA_CONTEXT_KEY = "coremedia:context";

export interface CoremediaContextConfig {
  /**
   * The uriPath of the part (e.g. Content) to which the editor (richtext property) belongs to
   */
  uriPath?: string;
}
