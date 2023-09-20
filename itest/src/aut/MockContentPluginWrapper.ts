import { JSWrapper } from "./JSWrapper";
import { ClassicEditorWrapper } from "./ClassicEditorWrapper";
import MockContentPlugin from "@coremedia/ckeditor5-coremedia-studio-integration-mock/src/content/MockContentPlugin";
import { MockContentConfig } from "@coremedia/ckeditor5-coremedia-studio-integration-mock/src/content/MockContent";

/**
 * Provides access to the `MockContentPlugin`.
 */
export class MockContentPluginWrapper extends JSWrapper<MockContentPlugin> {
  /**
   * Adds contents to be known by the mock backend.
   *
   * @param data - content definitions
   */
  async addContents(...data: MockContentConfig[]): Promise<void> {
    await this.evaluate((p, data) => p.addContents(...data), data);
  }

  /**
   * Provides access to EditorUI via Editor.
   *
   * @param wrapper - editor wrapper
   */
  static fromClassicEditor(wrapper: ClassicEditorWrapper) {
    return new MockContentPluginWrapper(
      wrapper.evaluateHandle((editor, pluginName) => {
        if (!editor.plugins.has(pluginName)) {
          const available = [...editor.plugins]
            .map(([t, p]) => t.pluginName ?? `noname:${p.constructor.name}`)
            .join(", ");
          throw new Error(`Plugin ${pluginName} not available. Available plugins: ${available}`);
        }
        // We need to access the plugin via its name rather than via descriptor,
        // as the descriptor is unknown in remote context.
        return editor.plugins.get(pluginName) as unknown as MockContentPlugin;
      }, MockContentPlugin.pluginName),
    );
  }
}
