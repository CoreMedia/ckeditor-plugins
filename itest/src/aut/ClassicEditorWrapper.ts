import { Page } from "playwright";
import ClassicEditor from "@ckeditor/ckeditor5-editor-classic/src/classiceditor";
import { EditorWrapper } from "./EditorWrapper";
import { CommandCollectionWrapper } from "./CommandCollectionWrapper";
import { EditorUiWrapper } from "./EditorUiWrapper";
import RichTextDataProcessor from "@coremedia/ckeditor5-coremedia-richtext/RichTextDataProcessor";

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
   * Sets the given data and waits for them being processed to _data view_,
   * thus, the result of the `toView` transformation of the data processor.
   * @param value - value to set
   */
  async setDataAndGetDataView(value: string): Promise<string> {
    /*
     * What this implementation does:
     *
     * * It registers a one-time listener for `richtext:toView`.
     * * It sets the data as requested.
     * * It waits for `richtext:toView` to provide the _data view_.
     *
     * It also validates, that the event matches the expected data set.
     *
     * If this should fail, we may want to provide a listener instead, which
     * waits until the expected event data are provided.
     */
    return this.evaluate((editor, value): Promise<string> => {
      return new Promise<string>((resolve, reject) => {
        // @ts-expect-error Bad Typing, DefinitelyTyped/DefinitelyTyped#60965
        const processor = editor.data.processor as RichTextDataProcessor;
        // Prior to setting data, wait for them being processed.
        processor.once("richtext:toView", (eventInfo, eventData) => {
          if ("dataView" in eventData && "data" in eventData) {
            if (eventData.data !== value) {
              reject(
                new Error(
                  `Unexpected data being processed. Concurrent changes applied?\n\tExpected: ${value}\n\tActual: ${eventData.data}`
                )
              );
            }
            resolve(eventData.dataView);
          }
          reject(new Error("richtext:toView provided unexpected data: " + JSON.stringify(eventData)));
        });
        editor.setData(value);
      });
    }, value);
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
