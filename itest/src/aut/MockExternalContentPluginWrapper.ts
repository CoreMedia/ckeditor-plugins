import { JSWrapper } from "./JSWrapper";
import { ClassicEditorWrapper } from "./ClassicEditorWrapper";
import type {
  MockExternalContentPlugin,
  MockExternalContent,
} from "@coremedia/ckeditor5-coremedia-studio-integration-mock";

const PLUGIN_NAME = "MockExternalContent";

/**
 * Provides access to the `MockExternalContentPlugin`.
 */
export class MockExternalContentPluginWrapper extends JSWrapper<MockExternalContentPlugin> {
  /**
   * Adds contents to be known by the mock backend.
   *
   * @param data - content definitions
   */
  async addContents(...data: MockExternalContent[]): Promise<void> {
    // eslint-disable-next-line max-statements-per-line
    await this.evaluate((p, data) => {
      p.addExternalContents(data);
    }, data);
  }

  /**
   * Provides access to EditorUI via Editor.
   *
   * @param wrapper - editor wrapper
   */
  static fromClassicEditor(wrapper: ClassicEditorWrapper) {
    return new MockExternalContentPluginWrapper(
      wrapper.evaluateHandle((editor, pluginName) => {
        if (!editor.plugins.has(pluginName)) {
          const available = [...editor.plugins]
            .map(([t, p]) => t.pluginName ?? `noname:${p.constructor.name}`)
            .join(", ");
          throw new Error(`Plugin ${pluginName} not available. Available plugins: ${available}`);
        }
        // We need to access the plugin via its name rather than via descriptor,
        // as the descriptor is unknown in remote context.
        return editor.plugins.get(pluginName) as unknown as MockExternalContentPlugin;
      }, PLUGIN_NAME),
    );
  }
}
