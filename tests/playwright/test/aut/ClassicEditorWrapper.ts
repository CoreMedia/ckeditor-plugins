import type { JSHandle, Locator, Page } from "playwright-core";
import type { ClassicEditor } from "ckeditor5";
import { EditorWrapper } from "./EditorWrapper";
import { EditorUIWrapper } from "./EditorUIWrapper";
import type { Locatable } from "./Locatable";
import { visible } from "./Locatable";

/**
 * Provides access to the editor within the example application. It requires
 * the editor to be exposed as global variable in window context.
 */
export class ClassicEditorWrapper extends EditorWrapper<ClassicEditor> implements Locatable {
  readonly #elementId: string;
  readonly #page: Page;

  constructor(instance: Promise<JSHandle<ClassicEditor>>, page: Page, elementId: string) {
    super(instance);
    this.#page = page;
    this.#elementId = elementId;
  }

  get locator(): Locator {
    return this.#page.locator(`#${this.#elementId}`);
  }

  get visible(): Promise<boolean> {
    return visible(this);
  }

  /**
   * Retrieves the data from current CKEditor instance.
   */
  async getData(): Promise<string> {
    return this.evaluate((editor) => editor.getData());
  }

  /**
   * Sets CKEditor data to the given value.
   *
   * @param value - value to set
   */
  async setData(value: string): Promise<void> {
    return this.evaluate((editor, value) => editor.setData(value), value);
  }

  /**
   * Provides a handle to the `EditorUI` of the CKEditor.
   */
  get ui(): EditorUIWrapper {
    return EditorUIWrapper.fromClassicEditor(this);
  }

  /**
   * Provide access to ClassicEditor via Page.
   *
   * @param page - page to evaluate handle for ClassicEditor
   * @param name - name of the editor instance, stored at `window` as well as
   * expected to be the ID of the element referenced on `ClassicEditor.create`.
   */
  static fromPage(page: Page, name = "editor"): ClassicEditorWrapper {
    return new ClassicEditorWrapper(
      page.evaluateHandle((name): ClassicEditor => {
        const editorHolder = window as unknown as Record<string, unknown>;
        if (name in editorHolder) {
          const editor = editorHolder[name];
          return editor as ClassicEditor;
        }
        throw new Error(`Editor instance not available as ${name}`);
      }, name),
      page,
      name,
    );
  }
}
