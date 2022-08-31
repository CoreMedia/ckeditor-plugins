import EditorUI from "@ckeditor/ckeditor5-core/src/editor/editorui";
import { JSWrapper } from "./JSWrapper";
import { ClassicEditorWrapper } from "./ClassicEditorWrapper";
import { ElementHandle } from "playwright-core";
import { EditorWithUI } from "@ckeditor/ckeditor5-core/src/editor/editorwithui";

/**
 * Wrapper for `EditorUI`.
 */
export class EditorUiWrapper extends JSWrapper<EditorUI> {
  /**
   * Provides access to the editable element via `ElementHandle`.
   */
  async getEditableElement(): Promise<ElementHandle<HTMLElement>> {
    /*
     * While Locator API is preferred, there does not seem to be an easy way
     * how to get from an HTMLElement retrieved via JavaScript API to a
     * corresponding locator. For now, we rely on the `ElementHandle`
     * representation, and we assume, that this is enough for a fully
     * controlled DOM in contrast to Rich Web Applications, which may respond
     * to updates from some server.
     */
    return this.evaluateHandle(async (ui): Promise<HTMLElement> => {
      const element = ui.getEditableElement();
      if (!element) {
        throw new Error(`Cannot find editable element. Available: ${[...ui.getEditableElementsNames()].join(", ")}`);
      }
      return element;
    });
  }

  /**
   * Provides access to EditorUI via Editor.
   * @param wrapper - editor wrapper
   */
  static fromClassicEditor(wrapper: ClassicEditorWrapper) {
    return new EditorUiWrapper(wrapper.evaluateHandle((editor) => (editor as EditorWithUI).ui));
  }
}
