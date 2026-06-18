import type { ClassicEditor } from "ckeditor5";
import type { ScenarioArgs, ScenarioDataType } from "../runtime/scenario";
import type { ScenarioInitializer } from "../runtime/mountStory";
import { applyScenario } from "../setup/applyScenario";
import { createRichTextEditor } from "./richtext";
import { createBBCodeEditor } from "./bbCode";

/**
 * Factory creating a concrete editor instance for a scenario data type.
 */
export type EditorFactory = (host: HTMLElement, args: ScenarioArgs) => Promise<ClassicEditor>;

/**
 * Registry of editor factories per data type, ported from the former
 * application `ckEditorInstanceFactories`.
 */
export const editorFactories: Record<ScenarioDataType, EditorFactory> = {
  richtext: createRichTextEditor,
  bbcode: createBBCodeEditor,
};

/**
 * Builds the {@link ScenarioInitializer} used by `mountScenario`: it creates the
 * editor matching `args.dataType` and then applies the declarative scenario
 * setup (mock contents, read-only state, initial data).
 *
 * This is the bridge between the editor factories and the in-page setup
 * utilities that replaced the former Playwright wrapper-based setup.
 */
export const createEditorScenario: ScenarioInitializer = async (host, args) => {
  const factory = editorFactories[args.dataType];
  const editor = await factory(host, args);
  applyScenario(editor, args);
  return editor;
};
