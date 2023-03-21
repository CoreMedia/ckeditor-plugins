import { JSWrapper } from "./JSWrapper";
import { EditingControllerWrapper } from "./EditingControllerWrapper";
import { Editor } from "@ckeditor/ckeditor5-core";

/**
 * Wrapper for CKEditor instance.
 */
export class EditorWrapper<T extends Editor = Editor> extends JSWrapper<T> {
  /**
   * Focuses the editor.
   */
  async focus(): Promise<void> {
    return this.evaluate((editor) => editor.focus());
  }

  get editing(): EditingControllerWrapper {
    return EditingControllerWrapper.fromEditor(this);
  }
}
