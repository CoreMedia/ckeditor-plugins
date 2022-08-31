import { JSWrapper } from "./JSWrapper";
import { ClassicEditorWrapper } from "./ClassicEditorWrapper";
import { ElementHandle } from "playwright-core";
import type ClassicEditorUI from "@ckeditor/ckeditor5-editor-classic/src/classiceditorui";
import { EditorUIViewWrapper } from "./EditorUIViewWrapper";
import { Locatable } from "./Locatable";
import { Locator } from "playwright";

/**
 * Wrapper for `EditorUI`.
 */
export class EditorUIWrapper extends JSWrapper<ClassicEditorUI> implements Locatable {
  readonly #parent: ClassicEditorWrapper;

  constructor(parent: ClassicEditorWrapper) {
    super(parent.evaluateHandle((editor) => editor.ui));
    this.#parent = parent;
  }

  get locator(): Locator {
    return this.#parent.locator.locator("+ div.ck-editor");
  }

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

  get view(): EditorUIViewWrapper {
    return EditorUIViewWrapper.fromClassicEditorUI(this);
  }

  /**
   * Provides access to EditorUI via Editor.
   * @param wrapper - editor wrapper
   */
  static fromClassicEditor(wrapper: ClassicEditorWrapper) {
    return new EditorUIWrapper(wrapper);
  }
}
