import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";
import Plugin from "@ckeditor/ckeditor5-core/src/plugin";

/**
 * Provides the General HTML Support integration for elements which can behave like sectioning element (e.g. article) or
 * element accepting only inline content (e.g. paragraph).
 *
 * The distinction between this two content models is important for choosing correct schema model and proper content conversion.
 * As an example, it ensures that:
 *
 * * children elements paragraphing is enabled for sectioning elements only,
 * * element and its content can be correctly handled by editing view (splitting and merging elements),
 * * model element HTML is semantically correct and easier to work with.
 *
 * If element contains any block element, it will be treated as a sectioning element and registered using
 * {@link module:html-support/dataschema~DataSchemaDefinition#model} and
 * {@link module:html-support/dataschema~DataSchemaDefinition#modelSchema} in editor schema.
 * Otherwise, it will be registered under {@link module:html-support/dataschema~DataSchemaBlockElementDefinition#paragraphLikeModel} model
 * name with model schema accepting only inline content (inheriting from `$block`).
 *
 * @extends module:core/plugin~Plugin
 */
export default class DualContentModelElementSupport extends Plugin {
  /**
   * @inheritDoc
   */
  static get requires(): Array<new(editor: Editor) => Plugin>;

  /**
   * @inheritDoc
   */
  init(): null;
}
