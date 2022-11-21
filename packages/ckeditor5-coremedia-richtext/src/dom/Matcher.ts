import { Editor } from "@ckeditor/ckeditor5-core";

/**
 * Contextual information during the matching process.
 */
export interface MatcherContext {
  /**
   * Editor, which may be used, for example, to retrieve the configuration.
   */
  editor: Editor;
}
