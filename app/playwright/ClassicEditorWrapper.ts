import { ElementHandle, JSHandle, Locator, Page, Response } from "playwright";
import ClassicEditor from "@ckeditor/ckeditor5-editor-classic/src/classiceditor";
import EditorUI from "@ckeditor/ckeditor5-core/src/editor/editorui";

export class ClassicEditorWrapper {
  readonly #page: Page;
  readonly #url: URL;

  constructor(page: Page, url: URL) {
    this.#page = page;
    this.#url = url;
  }

  /**
   * Go to CKEditor example app page.
   */
  async goto(): Promise<null | Response> {
    return this.#page.goto(this.#url.toString());
  }

  /**
   * Provides a handle for the editor instance.
   */
  async editor(): Promise<JSHandle<ClassicEditor>> {
    /*
     * We need to define all helper methods within evaluateHandle, as we cannot
     * access outer context.
     */
    return this.#page.evaluateHandle((): ClassicEditor => {
      interface HoldsEditor<T = unknown> {
        editor: T;
      }

      interface HoldsClassicEditor extends HoldsEditor<ClassicEditor> {
      }

      const isHoldsEditor = (value: unknown): value is HoldsEditor => {
        return typeof value === "object" && value !== null && value.hasOwnProperty("editor");
      }

      const isClassicEditor = (value: unknown): value is ClassicEditor => {
        return typeof value === "object" && value !== null && value.hasOwnProperty("data");
      };

      const isHoldsClassicEditor = (value: unknown): value is HoldsClassicEditor => {
        return isHoldsEditor(value) && isClassicEditor(value.editor);
      }

      if (isHoldsClassicEditor(window)) {
        return window.editor;
      }

      throw new Error("window.editor does not provide a CKEditor instance.");
    });
  }

  /**
   * Retrieves the data from current CKEditor instance.
   */
  async getData(): Promise<string> {
    const editor = await this.editor();
    return editor.evaluate((editor) => editor.getData());
  }

  /**
   * Sets CKEditor data to the given value.
   * @param value value to set
   */
  async setData(value: string): Promise<void> {
    const editor = await this.editor();
    return editor.evaluate((editor, value) => editor.setData(value), value);
  }

  /**
   * Clears data in CKEditor.
   */
  async clear(): Promise<void> {
    return this.setData("");
  }

  /**
   * Focuses the editor.
   */
  async focus(): Promise<void> {
    const editor = await this.editor();
    return editor.evaluate((editor) => editor.focus());
  }

  /**
   * Handle to UI of CKEditor.
   */
  async ui(): Promise<JSHandle<EditorUI>> {
    const editor = await this.editor();
    return editor.evaluateHandle((editor) => editor.ui);
  }

  /**
   * Handle to ContentEditable of CKEditor.
   */
  async editable(): Promise<ElementHandle<HTMLElement>> {
    const ui = await this.ui();
    return ui.evaluateHandle((ui): Promise<HTMLElement> => new Promise<HTMLElement>((resolve, reject) => {
      const element = ui.getEditableElement();
      if (!element) {
        return reject(`Cannot find editable element. Available: ${[...ui.getEditableElementsNames()].join(", ")}`);
      }
      resolve(element);
    }));
  }

  /**
   * Provides locator object for the content editable.
   */
  editableLocator(): Locator {
    return page.locator(`div.ck[contenteditable="true"]`);
  }

  /**
   * Provides access to HTML of editable. Defaults to `innerHTML`, but `outerHTML`
   * may be selected as well.
   *
   * @param location - what type of HTML to retrieve
   */
  async editableHtml(location: keyof Pick<HTMLElement, "innerHTML" | "outerHTML"> = "innerHTML"): Promise<string> {
    const editable = await this.editable();
    return editable.evaluate((editable, location) => editable[location], location);
  }

  /**
   * Simulates slow behavior of the AUT, which is, that subsequent validation
   * of data should repeat. This method mainly exists for demonstration purpose
   * how to deal with possibly asynchronous updates within expectations.
   * Libraries such as `wait-for-expect` could be used, to wait for the data
   * to resolve to the desired value eventually.
   */
  async setDataSlow(value: string): Promise<void> {
    const editor = await this.editor();
    return editor.evaluate((editor, value) => {
      window.setTimeout(() => editor.setData(value), 1000)
    }, value);
  }
}
