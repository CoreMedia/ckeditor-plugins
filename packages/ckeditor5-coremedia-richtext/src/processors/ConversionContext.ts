import { Editor } from "@ckeditor/ckeditor5-core";

/**
 * Context provided to conversion functions.
 */
export interface ConversionContext {
  /**
   * Target document to transform to. May be used for
   * creating new elements, etc.
   */
  document: Document;
  /**
   * Editor, to access API, if required. Possible example is, to access
   * the editor configuration to control transformation behavior.
   */
  editor: Editor;
}
