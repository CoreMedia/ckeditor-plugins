import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";
import Plugin from "@ckeditor/ckeditor5-core/src/plugin";

/**
 * Provides the General HTML Support integration with the {@link module:image/image~Image Image} feature.
 *
 * @extends module:core/plugin~Plugin
 */
export default class ImageElementSupport extends Plugin {
  /**
   * @inheritDoc
   */
  static get requires(): Array<new(editor: Editor) => Plugin>;

  /**
   * @inheritDoc
   */
  init(): void;
}
