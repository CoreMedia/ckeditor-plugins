import type { ClassicEditor, Editor } from "ckeditor5";
import type { RichTextDataProcessor } from "@coremedia/ckeditor5-coremedia-richtext";

/**
 * Sets editor data.
 *
 * In-page replacement for `ClassicEditorWrapper.setData`.
 */
export const setEditorData = (editor: Editor, value: string): void => {
  editor.setData(value);
};

/**
 * Reads editor data.
 *
 * In-page replacement for `ClassicEditorWrapper.getData`.
 */
export const getEditorData = (editor: Editor): string => editor.getData();

/**
 * Focuses the editor.
 *
 * In-page replacement for `EditorWrapper.focus`.
 */
export const focusEditor = (editor: Editor): void => {
  editor.focus();
};

/**
 * Sets the given data and resolves with the processed _data view_, that is the
 * result of the data processor's `toView` transformation.
 *
 * In-page replacement for `ClassicEditorWrapper.setDataAndGetDataView`:
 * - registers a one-time `richtext:toView` listener,
 * - sets the data,
 * - resolves with the produced data view (validating it matches the input).
 *
 * @param editor - live editor instance (rich text data processor expected)
 * @param value - data to set
 */
export const setDataAndGetDataView = (editor: ClassicEditor, value: string): Promise<string> =>
  new Promise<string>((resolve, reject) => {
    const processor = editor.data.processor as RichTextDataProcessor;
    processor.once("richtext:toView", (_eventInfo, eventData: { data?: unknown; dataView?: string }) => {
      if (typeof eventData.dataView === "string" && "data" in eventData) {
        if (eventData.data !== value) {
          reject(
            new Error(
              `Unexpected data being processed. Concurrent changes applied?\n\tExpected: ${value}\n\tActual: ${String(
                eventData.data,
              )}`,
            ),
          );
          return;
        }
        resolve(eventData.dataView);
        return;
      }
      reject(new Error("richtext:toView provided unexpected data: " + JSON.stringify(eventData)));
    });
    editor.setData(value);
  });
