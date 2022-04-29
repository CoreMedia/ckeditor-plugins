import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";
import Plugin from "@ckeditor/ckeditor5-core/src/plugin";

/**
 * Provides the General HTML Support integration with {@link module:code-block/codeblock~CodeBlock Code Block} feature.
 *
 * @extends module:core/plugin~Plugin
 */
export default class CodeBlockElementSupport extends Plugin {
  /**
   * @inheritDoc
   */
  static get requires(): Array<new(editor: Editor) => Plugin>;

  /**
   * @inheritDoc
   */
  init(): void;
}
