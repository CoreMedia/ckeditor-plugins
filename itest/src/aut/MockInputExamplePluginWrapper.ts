import { JSWrapper } from "./JSWrapper";
import { ClassicEditorWrapper } from "./ClassicEditorWrapper";
import MockInputExamplePlugin, {
  InputExampleElement,
} from "@coremedia/ckeditor5-coremedia-studio-integration-mock/content/MockInputExamplePlugin";
import { IsDroppableResponse } from "@coremedia/ckeditor5-coremedia-studio-integration/content/IsDroppableInRichtext";

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

  async validateIsDroppableState(uris: string[]): Promise<IsDroppableResponse | undefined> {
    return this.evaluate(
      (plugin: MockInputExamplePlugin, contentIds): IsDroppableResponse | undefined =>
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        plugin.ensureIsDroppableInRichTextIsEvaluated(contentIds),
      uris
    );
  }

  /**
   * Provides access to EditorUI via Editor.
   *
   * @param wrapper - editor wrapper
   */
  static fromClassicEditor(wrapper: ClassicEditorWrapper) {
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
        return editor.plugins.get(pluginName) as MockInputExamplePlugin;
      }, MockInputExamplePlugin.pluginName)
    );
  }
}
