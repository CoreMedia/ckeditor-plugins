import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";
import { Wrapper } from "./Wrapper";

/**
 * Wrapper for CKEditor instance.
 */
export class EditorWrapper<T extends Editor = Editor> extends Wrapper<T> {
  /**
   * Focuses the editor.
   */
  async focus(): Promise<void> {
    return this.evaluate((editor) => editor.focus());
  }
}
