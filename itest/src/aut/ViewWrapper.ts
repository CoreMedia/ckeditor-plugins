import { JSWrapper } from "./JSWrapper";
import View from "@ckeditor/ckeditor5-engine/src/view/view";
import { ViewDocumentWrapper } from "./ViewDocumentWrapper";
import { EditingControllerWrapper } from "./EditingControllerWrapper";

export class ViewWrapper extends JSWrapper<View> {
  get document(): ViewDocumentWrapper {
    return ViewDocumentWrapper.fromView(this);
  }

  /**
   * Focuses the editor in the editing view.
   */
  async focus(): Promise<void> {
    await this.evaluate((view: View) => {
      view.focus();
    });
  }

  static fromEditingController(wrapper: EditingControllerWrapper): ViewWrapper {
    return new ViewWrapper(wrapper.evaluateHandle((editingController) => editingController.view));
  }
}
