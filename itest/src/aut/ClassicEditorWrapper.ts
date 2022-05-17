import { Page } from "playwright";
import ClassicEditor from "@ckeditor/ckeditor5-editor-classic/src/classiceditor";
import { EditorWrapper } from "./EditorWrapper";
import { CommandCollectionWrapper } from "./CommandCollectionWrapper";
import { extendingWaitForExpect } from "./Expectations";
import { EditorUiWrapper } from "./EditorUiWrapper";

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
   * Provides a handle to the `EditorUI` of the CKEditor.
   */
  get ui(): EditorUiWrapper {
    return EditorUiWrapper.fromClassicEditor(this);
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
  async toHaveDataContaining(w: ClassicEditorWrapper, expectedData: string): Promise<jest.CustomMatcherResult> {
    return extendingWaitForExpect(
      "toHaveDataContaining",
      async () => expect(await w.getData()).toContain(expectedData),
      async () => expect(await w.getData()).not.toContain(expectedData),
      this
    );
  },
  async toHaveDataEqualTo(w: ClassicEditorWrapper, expectedData: string): Promise<jest.CustomMatcherResult> {
    return extendingWaitForExpect(
      "toHaveDataEqualTo",
      async () => expect(await w.getData()).toStrictEqual(expectedData),
      async () => expect(await w.getData()).not.toStrictEqual(expectedData),
      this
    );
  },
});

/**
 * Extension to matchers for Application Console.
 */
export interface ClassicEditorWrapperMatchers<R = unknown, T = unknown> {
  toHaveDataContaining: T extends ClassicEditorWrapper
    ? (expectedData: string) => R
    : "Type-level Error: Received value must be a ClassicEditorWrapper";
  toHaveDataEqualTo: T extends ClassicEditorWrapper
    ? (expectedData: string) => R
    : "Type-level Error: Received value must be a ClassicEditorWrapper";
}

/**
 * Tell TypeScript to know of new matchers.
 */
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface Expect extends ClassicEditorWrapperMatchers {}

    // eslint-disable-next-line @typescript-eslint/no-empty-interface,@typescript-eslint/ban-types
    interface Matchers<R = unknown, T = {}> extends ClassicEditorWrapperMatchers<R, T> {}

    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface InverseAsymmetricMatchers extends ClassicEditorWrapperMatchers {}
  }
}
