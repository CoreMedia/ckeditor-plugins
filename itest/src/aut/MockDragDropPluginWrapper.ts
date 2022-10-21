import { JSWrapper } from "./JSWrapper";
import { ClassicEditorWrapper } from "./ClassicEditorWrapper";
import MockDragDropPlugin, {
  DroppableElement,
} from "@coremedia/ckeditor5-coremedia-studio-integration-mock/content/MockDragDropPlugin";

/**
 * Provides access to the `MockDragDropPlugin`.
 */
export class MockDragDropPluginWrapper extends JSWrapper<MockDragDropPlugin> {
  async addDraggableElement(data: DroppableElement): Promise<void> {
    await this.evaluate((p, data) => {
      const htmlDivElement = p.createDragDivElement(data);
      window.document.body.append(htmlDivElement);
    }, data);
  }

  async prefillCaches(contentIds: number[]): Promise<boolean> {
    return this.evaluate(
      (plugin: MockDragDropPlugin, contentIds): boolean => plugin.prefillCaches(contentIds),
      contentIds
    );
  }

  /**
   * Provides access to EditorUI via Editor.
   *
   * @param wrapper - editor wrapper
   */
  static fromClassicEditor(wrapper: ClassicEditorWrapper) {
    return new MockDragDropPluginWrapper(
      wrapper.evaluateHandle((editor, pluginName) => {
        if (!editor.plugins.has(pluginName)) {
          const available = [...editor.plugins]
            .map(([t, p]) => t.pluginName ?? `noname:${p.constructor.name}`)
            .join(", ");
          throw new Error(`Plugin ${pluginName} not available. Available plugins: ${available}`);
        }
        // We need to access the plugin via its name rather than via descriptor,
        // as the descriptor is unknown in remote context.
        return editor.plugins.get(pluginName) as MockDragDropPlugin;
      }, MockDragDropPlugin.pluginName)
    );
  }
}
