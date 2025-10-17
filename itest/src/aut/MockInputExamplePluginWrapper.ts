import type {
  InputExampleElement,
  MockInputExamplePlugin,
} from "@coremedia/ckeditor5-coremedia-studio-integration-mock";
import type {
  IsDroppableEvaluationResult,
  IsLinkableEvaluationResult,
} from "@coremedia/ckeditor5-coremedia-studio-integration";
import { JSWrapper } from "./JSWrapper";
import type { ClassicEditorWrapper } from "./ClassicEditorWrapper";

/**
 * Provides access to the `MockInputExamplePlugin`.
 */
export class MockInputExamplePluginWrapper extends JSWrapper<MockInputExamplePlugin> {
  async addInputExampleElement(data: InputExampleElement): Promise<void> {
    await this.evaluate((p, data) => {
      const htmlDivElement = p.createInsertElement(data);
      window.document.body.append(htmlDivElement);
    }, data);
  }

  /**
   * Evaluates the drop state of the uris inside the browser context.
   *
   * @param uris - the uris to check if they are in a droppable state.
   * @returns the evaluation promise
   */
  async validateIsDroppableState(uris: string[]): Promise<IsDroppableEvaluationResult | undefined> {
    return this.evaluate(
      (plugin, contentIds): IsDroppableEvaluationResult | undefined =>
        plugin.ensureIsDroppableInRichTextIsEvaluated(contentIds),
      uris,
    );
  }

  async validateIsDroppableInLinkBalloon(uris: string[]): Promise<IsLinkableEvaluationResult | undefined> {
    return this.evaluate(
      (plugin, contentIds): IsLinkableEvaluationResult | undefined => plugin.ensureIsDroppableInLinkBalloon(contentIds),
      uris,
    );
  }

  /**
   * Provides access to EditorUI via Editor.
   *
   * @param wrapper - editor wrapper
   * @returns the MockInputExamplePluginWrapper
   */
  static fromClassicEditor(wrapper: ClassicEditorWrapper): MockInputExamplePluginWrapper {
    return new MockInputExamplePluginWrapper(
      wrapper.evaluateHandle((editor, pluginName) => {
        if (!editor.plugins.has(pluginName)) {
          const available = [...editor.plugins]
            .map(([t, p]) => t.pluginName ?? `noname:${p.constructor.name}`)
            .join(", ");
          throw new Error(`Plugin ${pluginName} not available. Available plugins: ${available}`);
        }
        // We need to access the plugin via its name rather than via descriptor,
        // as the descriptor is unknown in remote context.
        return editor.plugins.get(pluginName) as unknown as MockInputExamplePlugin;
        // We need to use the MockInputExamplePlugin name as a string here and cannot
        // use the pluginName property directly. Importing from MockInputExamplePlugin
        // would result in a serviceAgent instance during test runs, which then would
        // prevent the test from finishing.
      }, "MockInputExamplePlugin"),
    );
  }
}
