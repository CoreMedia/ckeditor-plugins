import type { ClassicEditor } from "ckeditor5";
import type { ScenarioArgs } from "../runtime/scenario";
import { registerMockContents } from "./mockContent";
import { registerMockExternalContents } from "./mockExternalContent";
import { setEditorData } from "./editorData";

/**
 * Reason id used when enabling read-only mode for a scenario.
 */
export const SCENARIO_READ_ONLY_LOCK_ID = "storybook-scenario";

/**
 * Applies the declarative scenario setup to a freshly created editor. This is
 * the central in-page replacement for the imperative wrapper-based setup that
 * Playwright tests previously performed (mock contents, external contents,
 * read-only state and initial data).
 *
 * Note: `dataType` and `uiLanguage` are creation-time concerns handled by the
 * editor factory, not here.
 *
 * @param editor - freshly created editor instance
 * @param args - resolved scenario args
 */
export const applyScenario = (editor: ClassicEditor, args: ScenarioArgs): void => {
  if (args.mockContents.length > 0) {
    registerMockContents(editor, ...args.mockContents);
  }
  if (args.mockExternalContents.length > 0) {
    registerMockExternalContents(editor, args.mockExternalContents);
  }
  if (args.readOnly) {
    editor.enableReadOnlyMode(SCENARIO_READ_ONLY_LOCK_ID);
  }
  if (args.data) {
    setEditorData(editor, args.data);
  }
};
