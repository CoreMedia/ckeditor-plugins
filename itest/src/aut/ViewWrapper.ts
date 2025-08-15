import { EditingView } from "ckeditor5";
import { JSWrapper } from "./JSWrapper";
import { ViewDocumentWrapper } from "./ViewDocumentWrapper";
import { EditingControllerWrapper } from "./EditingControllerWrapper";

export class ViewWrapper extends JSWrapper<EditingView> {
  get document(): ViewDocumentWrapper {
    return ViewDocumentWrapper.fromView(this);
  }

  /**
   * Focuses the editor in the editing view.
   */
  async focus(): Promise<void> {
    await this.evaluate((view: EditingView) => {
      view.focus();
    });
  }
  static fromEditingController(wrapper: EditingControllerWrapper): ViewWrapper {
    return new ViewWrapper(wrapper.evaluateHandle((editingController) => editingController.view));
  }
}
