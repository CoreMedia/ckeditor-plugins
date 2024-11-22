import { JSWrapper } from "./JSWrapper";
import { EditingController } from "ckeditor5";
import { ViewWrapper } from "./ViewWrapper";
import { EditorWrapper } from "./EditorWrapper";
export class EditingControllerWrapper extends JSWrapper<EditingController> {
  get view(): ViewWrapper {
    return ViewWrapper.fromEditingController(this);
  }

  /**
   * Provides access to EditingController via Editor.
   *
   * @param wrapper - editor wrapper
   */
  static fromEditor(wrapper: EditorWrapper) {
    return new EditingControllerWrapper(wrapper.evaluateHandle((editor) => editor.editing));
  }
}
