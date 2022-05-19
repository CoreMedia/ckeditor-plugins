import { Wrapper } from "./Wrapper";
import { ClassicEditorWrapper } from "./ClassicEditorWrapper";
import MockContentPlugin from "@coremedia/ckeditor5-coremedia-studio-integration-mock/content/MockContentPlugin";
import { MockContentConfig } from "@coremedia/ckeditor5-coremedia-studio-integration-mock/content/MockContent";

/**
 * Provides access to the `MockContentPlugin`.
 */
export class MockContentPluginWrapper extends Wrapper<MockContentPlugin> {
  /**
   * Adds contents to be known by the mock backend.
   * @param data - content definitions
   */
  async addContents(...data: MockContentConfig[]): Promise<void> {
    await this.evaluate((p, data) => p.addContents(...data), data);
  }

  /**
   * Provides access to EditorUI via Editor.
   * @param wrapper - editor wrapper
   */
  static fromClassicEditor(wrapper: ClassicEditorWrapper) {
    return new MockContentPluginWrapper(
      wrapper.evaluateHandle((editor) => {
        return editor.plugins.get(MockContentPlugin);
      })
    );
  }
}
