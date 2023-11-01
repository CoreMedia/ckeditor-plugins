import { JSWrapper } from "../JSWrapper";
import { ClassicEditorWrapper } from "../ClassicEditorWrapper";
import type MockServiceAgentPlugin from "@coremedia/ckeditor5-coremedia-studio-integration-mock/src/content/MockServiceAgentPlugin";
import { WorkAreaServiceWrapper } from "./WorkAreaServiceWrapper";
import { BlocklistServiceWrapper } from "./BlocklistServiceWrapper";

export class MockServiceAgentPluginWrapper extends JSWrapper<MockServiceAgentPlugin> {
  getWorkAreaServiceWrapper(): WorkAreaServiceWrapper {
    return WorkAreaServiceWrapper.fromServiceAgentPlugin(this);
  }

  getBlocklistServiceWrapper(): BlocklistServiceWrapper {
    return BlocklistServiceWrapper.fromServiceAgentPlugin(this);
  }

  /**
   * Provides access to EditorUI via Editor.
   *
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
      return editor.plugins.get(pluginName) as unknown as MockServiceAgentPlugin;
      // We need to use the MockServiceAgentPlugin name as a string here and cannot
      // use the pluginName property directly. Importing from MockServiceAgentPlugin
      // would result in a serviceAgent instance during test runs, which then would
      // prevent the test from finishing.
    }, "MockServiceAgent");
    return new MockServiceAgentPluginWrapper(instance);
  }
}
