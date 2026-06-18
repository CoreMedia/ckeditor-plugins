import type { Editor } from "ckeditor5";
import {
  MockInputExamplePlugin,
  type InputExampleElement,
} from "@coremedia-internal/ckeditor5-coremedia-studio-integration-mock";
import type {
  IsDroppableEvaluationResult,
  IsLinkableEvaluationResult,
} from "@coremedia/ckeditor5-coremedia-studio-integration";
import { ensurePluginLoaded } from "./plugins";

const inputExamplePlugin = (editor: Editor): MockInputExamplePlugin => {
  ensurePluginLoaded(editor, MockInputExamplePlugin.pluginName);
  return editor.plugins.get(MockInputExamplePlugin);
};

/**
 * Creates a draggable input-example element and appends it to the document
 * body, so it can serve as a drag source for drag-and-drop scenarios.
 *
 * In-page replacement for `MockInputExamplePluginWrapper.addInputExampleElement`.
 *
 * @param editor - live editor instance
 * @param data - description of the input-example element
 */
export const addInputExampleElement = (editor: Editor, data: InputExampleElement): void => {
  const element = inputExamplePlugin(editor).createInsertElement(data);
  document.body.append(element);
};

/**
 * Evaluates the droppable state of the given uris in rich text.
 *
 * In-page replacement for `MockInputExamplePluginWrapper.validateIsDroppableState`.
 *
 * @param editor - live editor instance
 * @param uris - content uris to evaluate
 */
export const validateIsDroppableState = (editor: Editor, uris: string[]): IsDroppableEvaluationResult | undefined =>
  inputExamplePlugin(editor).ensureIsDroppableInRichTextIsEvaluated(uris);

/**
 * Evaluates the droppable state of the given uris in the link balloon.
 *
 * In-page replacement for `MockInputExamplePluginWrapper.validateIsDroppableInLinkBalloon`.
 *
 * @param editor - live editor instance
 * @param uris - content uris to evaluate
 */
export const validateIsDroppableInLinkBalloon = (
  editor: Editor,
  uris: string[],
): IsLinkableEvaluationResult | undefined => inputExamplePlugin(editor).ensureIsDroppableInLinkBalloon(uris);
