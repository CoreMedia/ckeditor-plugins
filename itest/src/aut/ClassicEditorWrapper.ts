import { Page } from "playwright";
import ClassicEditor from "@ckeditor/ckeditor5-editor-classic/src/classiceditor";
import { EditorWrapper } from "./EditorWrapper";
import { CommandCollectionWrapper } from "./CommandCollectionWrapper";

/**
 * Provides access to the editor within the example application. It requires
 * the editor to be exposed as global variable in window context.
 */
export class ClassicEditorWrapper extends EditorWrapper<ClassicEditor> {
  /**
   * Retrieves the data from current CKEditor instance.
   */
  async getData(): Promise<string> {
    return this.evaluate((editor) => editor.getData());
  }

  /**
   * Sets CKEditor data to the given value.
   * @param value - value to set
   */
  async setData(value: string): Promise<void> {
    return this.evaluate((editor, value) => editor.setData(value), value);
  }

  /**
   * Provides a handle to the commands of the CKEditor.
   */
  get commands(): CommandCollectionWrapper {
    return CommandCollectionWrapper.fromEditor(this);
  }

  /**
   * Provide access to ClassicEditor via Page.
   * @param page - page to evaluate handle for ClassicEditor
   * @param name - name of the editor instance, stored at `window`
   */
  static fromPage(page: Page, name = "editor"): ClassicEditorWrapper {
    return new ClassicEditorWrapper(
      page.evaluateHandle((name): ClassicEditor => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const editorHolder: any = window;
        if (name in editorHolder) {
          return editorHolder[name];
        }
        throw new Error(`Editor instance not available as ${name}`);
      }, name)
    );
  }
}
