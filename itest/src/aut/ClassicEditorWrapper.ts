import { Page } from "playwright";
import ClassicEditor from "@ckeditor/ckeditor5-editor-classic/src/classiceditor";
import { EditorWrapper } from "./EditorWrapper";
import { CommandCollectionWrapper } from "./CommandCollectionWrapper";
import { extendingWaitForExpect } from "./Expectations";

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

/**
 * JEST Extension: Add matchers for `ClassicEditorWrapper`.
 */
expect.extend({
  async toHaveDataEqualTo(w: ClassicEditorWrapper, expectedData: string): Promise<jest.CustomMatcherResult> {
    return extendingWaitForExpect(
      "toHaveDataEqualTo",
      async () => expect(await w.getData()).toStrictEqual(expectedData),
      expectedData,
      // Needs careful analysis on flaky behavior, as this is not the last data used for comparison.
      w.getData(),
      this
    );
  },
});

/**
 * Extension to matchers for Application Console.
 */
export interface ClassicEditorWrapperMatchers<R = unknown> {
  toHaveDataEqualTo(expectedData: string): R;
}

/**
 * Tell TypeScript to know of new matchers.
 */
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface Expect extends ClassicEditorWrapperMatchers {}

    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface Matchers<R> extends ClassicEditorWrapperMatchers<R> {}

    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface InverseAsymmetricMatchers extends ClassicEditorWrapperMatchers {}
  }
}
