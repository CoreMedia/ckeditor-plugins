import { JSWrapper } from "../JSWrapper";
import { ClassicEditorWrapper } from "../ClassicEditorWrapper";
import MockServiceAgentPlugin from "@coremedia/ckeditor5-coremedia-studio-integration-mock/content/MockServiceAgentPlugin";
import { WorkAreaServiceWrapper } from "./WorkAreaServiceWrapper";

export class MockServiceAgentPluginWrapper extends JSWrapper<MockServiceAgentPlugin> {
  getWorkAreaServiceWrapper(): WorkAreaServiceWrapper {
    return WorkAreaServiceWrapper.fromServiceAgentPlugin(this);
  }

  /**
   * Provides access to EditorUI via Editor.
   * @param wrapper - editor wrapper
   */
  static fromClassicEditor(wrapper: ClassicEditorWrapper) {
    const instance = wrapper.evaluateHandle((editor, pluginName) => {
      if (!editor.plugins.has(pluginName)) {
        const available = [...editor.plugins]
          .map(([t, p]) => t.pluginName ?? `noname:${p.constructor.name}`)
          .join(", ");
        throw new Error(`Plugin ${pluginName} not available. Available plugins: ${available}`);
      }
      // We need to access the plugin via its name rather than via descriptor,
      // as the descriptor is unknown in remote context.
      return editor.plugins.get(pluginName) as MockServiceAgentPlugin;
    }, MockServiceAgentPlugin.pluginName);
    return new MockServiceAgentPluginWrapper(instance);
  }
}
