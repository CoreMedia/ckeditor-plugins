import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";

/**
 * The General HTML Support feature.
 *
 * This is a "glue" plugin which initializes the {@link module:html-support/datafilter~DataFilter data filter} configuration
 * and features integration with the General HTML Support.
 *
 * @extends module:core/plugin~Plugin
 */
export default class GeneralHtmlSupport extends Plugin {
  /**
   * @inheritDoc
   */
  static get pluginName(): string;

  /**
   * @inheritDoc
   */
  static get requires(): Array<new(editor: Editor) => Plugin>;

  /**
   * @inheritDoc
   */
  init(): null;
}
