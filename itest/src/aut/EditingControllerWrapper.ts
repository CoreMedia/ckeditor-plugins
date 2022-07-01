import { Wrapper } from "./Wrapper";
import EditingController from "@ckeditor/ckeditor5-engine/src/controller/editingcontroller";
import { ViewWrapper } from "./ViewWrapper";
import { EditorWrapper } from "./EditorWrapper";

export class EditingControllerWrapper extends Wrapper<EditingController> {
  get view(): ViewWrapper {
    return ViewWrapper.fromEditingController(this);
  }

  /**
   * Provides access to EditingController via Editor.
   * @param wrapper - editor wrapper
   */
  static fromEditor(wrapper: EditorWrapper) {
    return new EditingControllerWrapper(wrapper.evaluateHandle((editor) => editor.editing));
  }
}
