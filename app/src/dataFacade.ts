import { updatePreview } from "./preview";
import { Editor } from "@ckeditor/ckeditor5-core";
import { findDataApi, isInvalidData } from "@coremedia/ckeditor5-data-facade";

/**
 * A small facade around editor.setData, which remembers the last data
 * set explicitly. This simulates a similar approach as in studio-client.
 */
export const setData = (editor: Editor, data: string): void => {
  const { data: dataController } = editor;

  findDataApi(editor).setData(data);

  console.log(`Editor Data Set.`, {
    data,
    transformedData: dataController.get({
      trim: "empty",
    }),
  });
};

/**
 * Save method with additional recognition, if there is an actual change.
 * This represents how we could prevent auto-checkout in CoreMedia
 * Studio for irrelevant changes, because they are semantically equivalent.
 *
 * @param editor - the editor instance whose data to save
 * @param source - which editor stored the data
 */
// async: In production scenarios, this will be an asynchronous call.
// eslint-disable-next-line @typescript-eslint/require-await
export const saveData = async (editor: Editor, source: string): Promise<void> => {
  const data = findDataApi(editor).getData({
    // set to `none`, to trigger data-processing for empty text, too
    // possible values: empty, none (default: empty)
    trim: "empty",
  });

  if (isInvalidData(data)) {
    throw new Error(`Failed retrieving data for ${source}: They are considered invalid.`);
  }

  // Similar to CoreMedia Studio, we prefer the originally set data, when
  // there is no semantic difference compared to the data as returned by
  // CKEditor.
  console.log(`Update Preview triggered by ${source}.`, { data });
  updatePreview(data);
};
