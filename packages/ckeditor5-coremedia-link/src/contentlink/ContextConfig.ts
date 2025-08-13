export { COREMEDIA_CONTEXT_KEY } from "@coremedia/ckeditor5-coremedia-studio-integration";

export interface CoremediaContextConfig {
  /**
   * The uriPath of the part (e.g. Content) to which the editor (richtext property) belongs to
   */
  uriPath?: string;
}
