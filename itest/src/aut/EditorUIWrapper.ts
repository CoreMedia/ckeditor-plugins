import { ElementHandle } from "playwright-core";
import { ClassicEditor } from "ckeditor5";
import { Locator } from "playwright";
import { JSWrapper } from "./JSWrapper";
import { ClassicEditorWrapper } from "./ClassicEditorWrapper";
// ClassicEditorUI: See ckeditor/ckeditor5#12027.
import { EditorUIViewWrapper } from "./EditorUIViewWrapper";
import { Locatable, visible } from "./Locatable";

/**
 * Wrapper for `EditorUI`.
 */
export class EditorUIWrapper extends JSWrapper<ClassicEditor["ui"]> implements Locatable {
  readonly #parent: ClassicEditorWrapper;

  constructor(parent: ClassicEditorWrapper) {
    super(parent.evaluateHandle((editor) => editor.ui));
    this.#parent = parent;
  }

  get locator(): Locator {
    // We need to find the next sibling of the parent node. As it seems, there
    // is no good way to express this with locators like simply chaining
    // `+ div.ck-editor` as the resulting querySelector chain is invalid then.
    // For now, we assume, that both share the same parent.
    return this.#parent.locator.locator("..").locator("div.ck-editor");
  }

  get visible(): Promise<boolean> {
    return visible(this);
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
   *
   * @param wrapper - editor wrapper
   */
  static fromClassicEditor(wrapper: ClassicEditorWrapper) {
    return new EditorUIWrapper(wrapper);
  }
}
