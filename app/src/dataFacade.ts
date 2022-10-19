/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { updatePreview } from "./preview";
import ClassicEditor from "@ckeditor/ckeditor5-editor-classic/src/classiceditor";

const LastSetVersion = Symbol("LastSetVersion");
const LastSetData = Symbol("LastSetData");

/**
 * A small facade around editor.setData, which remembers the last data
 * set explicitly. This simulates similar approach in studio-client.
 */
export const setData = (editor: ClassicEditor, data: string) => {
  const { document } = editor.model;

  const versionBefore = document.version;
  editor.setData(data);
  const versionAfter = document.version;

  //@ts-expect-error problem with symbols
  window[LastSetData] = data;

  //@ts-expect-error problem with symbols
  window[LastSetVersion] = versionAfter;

  console.log(`Editor Data Set.`, {
    data,
    transformedData: editor.getData(),
    versionBefore,
    versionAfter,
  });
};

/**
 * Save method with additional recognition, if there is an actual change.
 * This represents, how we could prevent auto-checkout in CoreMedia
 * Studio for irrelevant changes, because they are semantically equivalent.
 *
 * @param editor - the editor instance whose data to save
 * @param source - which editor stored the data
 */
// async: In production scenarios, this will be an asynchronous call.
// eslint-disable-next-line @typescript-eslint/require-await
export const saveData = async (editor: ClassicEditor, source: string) => {
  const data = editor.getData({
    // set to `none`, to trigger data-processing for empty text, too
    // possible values: empty, none (default: empty)
    trim: "empty",
  });
  const currentVersion = editor.model.document.version;
  //@ts-expect-error problem with symbols
  const lastSetVersion = window[LastSetVersion];
  //@ts-expect-error problem with symbols
  const lastSetData = window[LastSetData];

  const logInfo = (isUpdate: boolean) => ({
    isUpdate,
    currentVersion,
    lastSetVersion,
    data,
    lastSetData,
  });

  let previewData: string;

  if (lastSetVersion !== undefined && lastSetVersion === currentVersion) {
    console.log(
      `Would skip saving data triggered by ${source} as they represent the same data as set originally. Note, that the actual data may differ, but they are semantically equivalent.`,
      logInfo(false)
    );
    previewData = lastSetData;
  } else {
    console.log(`Saving data triggered by ${source}.`, logInfo(true));
    previewData = data;
  }

  // Similar to CoreMedia Studio, we prefer the originally set data, when
  // there is no semantic difference compared to the data as returned by
  // CKEditor.
  console.log(`Update Preview triggered by ${source}.`, { previewData });
  updatePreview(previewData);
};
