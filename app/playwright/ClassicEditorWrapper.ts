import { JSHandle, Page, Response } from "playwright";
import ClassicEditor from "@ckeditor/ckeditor5-editor-classic/src/classiceditor";

export class ClassicEditorWrapper {
  readonly #page: Page;
  readonly #url: URL;

  constructor(page: Page, url: URL) {
    this.#page = page;
    this.#url = url;
  }

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

  async getData(): Promise<string> {
    const editor = await this.editor();
    return editor.evaluate((editor) => editor.getData());
  }

  async setData(value: string): Promise<void> {
    const editor = await this.editor();
    return editor.evaluate((editor, value) => editor.setData(value), value);
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
