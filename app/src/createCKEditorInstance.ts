import { ApplicationState } from "./ApplicationState";
import { ClassicEditor } from "@ckeditor/ckeditor5-editor-classic";
import { Command, Editor } from "@ckeditor/ckeditor5-core";
import { CKEditorInstanceFactory } from "./CKEditorInstanceFactory";
import { Differencing } from "@coremedia/ckeditor5-coremedia-differencing";
import { initReadOnlyToggle } from "./ReadOnlySwitch";
import { initPreview, updatePreview } from "./preview";
import { createRichTextEditor } from "./editors/richtext";
import { createBBCodeEditor } from "./editors/bbCode";
import { initDataTypeSwitch } from "./DataTypeSwitch";
import { initUiLanguageSwitch } from "./UiLanguageSwitch";

/**
 * Typings for CKEditorInspector, as it does not ship with typings yet.
 */
// See https://github.com/ckeditor/ckeditor5-inspector/issues/173
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
declare class CKEditorInspector {
  static attach(editorOrConfig: Editor | Record<string, Editor>, options?: { isCollapsed?: boolean }): string[];
}

export const editorElementId = "editor";

export interface CKEditorInstanceFactories {
  bbcode: CKEditorInstanceFactory;
  richtext: CKEditorInstanceFactory;
}

export const ckEditorInstanceFactories: CKEditorInstanceFactories = {
  bbcode: createBBCodeEditor,
  richtext: createRichTextEditor,
};

const attachInspector = (editor: Editor, { dataType, inspector }: ApplicationState): string[] =>
  CKEditorInspector.attach(
    {
      [dataType]: editor,
    },
    {
      // With hash parameter #expandInspector you may expand the
      // inspector by default.
      isCollapsed: inspector === "collapsed",
    }
  );

const optionallyActivateDifferencing = (editor: Editor): void => {
  if (editor.plugins.has(Differencing)) {
    editor.plugins.get(Differencing).activateDifferencing();
  }
};

/**
 * Convenience method to help test with the undo stack.
 *
 * @param editor - editor to apply new method to.
 */
const registerResetUndo = (editor: Editor): void => {
  const undoCommand: Command | undefined = editor.commands.get("undo");

  if (undoCommand) {
    //@ts-expect-error Editor extension, no typing available.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-return
    editor.resetUndo = () => undoCommand.clearStack();
    console.log("Registered `editor.resetUndo()` to clear undo history.");
  }
};

/**
 * Register the editor as global variable for better support when
 * debugging in DevTools.
 *
 * May also be used by tests that may rely on setting the global variable
 * late when all adaptations have been applied.
 *
 * @param editor - editor to register globally
 */
const registerGlobalEditor = (editor: Editor): void => {
  // Do it late, so that we also have a clear signal (e.g., to integration
  // tests), that the editor is ready.
  //@ts-expect-error Unknown, but we set it.
  window.editor = editor;
  console.log("Exposed editor instance as `editor`.");
};

/**
 * Update preview with data from the editor initially.
 *
 * @param editor - editor to get data from
 * @param dataType - type of data
 */
const initializePreviewData = (editor: ClassicEditor, { dataType }: ApplicationState): void => {
  switch (dataType) {
    case "richtext":
      updatePreview(editor.getData(), "xml");
      break;
    default:
      updatePreview(editor.getData(), "text");
  }
};

export const createCKEditorInstance = async (state: ApplicationState): Promise<ClassicEditor> => {
  const sourceElement = document.getElementById(editorElementId);

  if (!sourceElement) {
    throw new Error(`Required element with id ${editorElementId} not defined in HTML.`);
  }

  const { dataType, uiLanguage, readOnlyMode } = state;
  let factory: CKEditorInstanceFactory;
  switch (dataType) {
    case "richtext":
      factory = ckEditorInstanceFactories.richtext;
      break;
    case "bbcode":
      factory = ckEditorInstanceFactories.bbcode;
      break;
    default:
      throw new Error(`Unknown data type: ${dataType}`);
  }

  const editor = await factory(sourceElement, state);

  initDataTypeSwitch({
    default: dataType,
    onSwitch(mode): void {
      state.dataType = mode;
    },
  });

  initUiLanguageSwitch({
    default: uiLanguage,
    onSwitch(lang): void {
      state.uiLanguage = lang;
    },
  });

  attachInspector(editor, state);

  optionallyActivateDifferencing(editor);

  initReadOnlyToggle({
    default: readOnlyMode,
    onSwitch: (mode) => {
      if (mode === "ro") {
        editor.enableReadOnlyMode("exampleApp");
      } else {
        editor.disableReadOnlyMode("exampleApp");
      }
      state.readOnlyMode = mode;
    },
  });

  initPreview(state);

  registerResetUndo(editor);
  initializePreviewData(editor, state);
  registerGlobalEditor(editor);
  return editor;
};
