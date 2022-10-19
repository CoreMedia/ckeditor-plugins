import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";
import { EditorWithUI } from "@ckeditor/ckeditor5-core/src/editor/editorwithui";
import { isRaw } from "@coremedia/ckeditor5-common/AdvancedTypes";

/**
 * Type-guard, which validates, if the given instance of Editor is an
 * EditorWithUI.
 *
 * @param value - editor instance to validate
 */
export const isEditorWithUI = <T extends Editor>(value: T): value is T & EditorWithUI => {
  if (isRaw<EditorWithUI>(value, "ui")) {
    return typeof value.ui === "object";
  }
  return false;
};

/**
 * Valides, that the given editor instance provides is an EditorWithUI.
 *
 * @param editor - editor instance to validate
 * @throws Error if the editor instance does not provide a UI
 */
export const requireEditorWithUI = <T extends Editor>(editor: T): T & EditorWithUI => {
  if (!isEditorWithUI(editor)) {
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    throw new Error(`Editor does not provide required access to \`ui\`: ${editor}`);
  }
  return editor;
};
