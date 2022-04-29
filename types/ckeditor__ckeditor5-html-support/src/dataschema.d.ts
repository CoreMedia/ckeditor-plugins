import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";
import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import { AttributeProperties, SchemaItemDefinition } from "@ckeditor/ckeditor5-engine/src/model/schema";

/**
 * Holds representation of the extended HTML document type definitions to be used by the
 * editor in HTML support.
 *
 * Data schema is represented by data schema definitions.
 *
 * To add new definition for block element,
 * use {@link module:html-support/dataschema~DataSchema#registerBlockElement} method:
 *
 *    dataSchema.registerBlockElement( {
 *			view: 'section',
 *			model: 'my-section',
 *			modelSchema: {
 *				inheritAllFrom: '$block'
 *			}
 *		} );
 *
 * To add new definition for inline element,
 * use {@link module:html-support/dataschema~DataSchema#registerInlineElement} method:
 *
 *    dataSchema.registerInlineElement( {
 *			view: 'span',
 *			model: 'my-span',
 *			attributeProperties: {
 *				copyOnEnter: true
 *			}
 *		} );
 *
 * @extends module:core/plugin~Plugin
 */
export default class DataSchema extends Plugin {
  /**
   * @inheritDoc
   */
  static get pluginName(): string;

  constructor(editor: Editor);

  /**
   * @inheritDoc
   */
  init(): void;

  /**
   * Add new data schema definition describing block element.
   *
   * @param {module:html-support/dataschema~DataSchemaBlockElementDefinition} definition
   */
  registerBlockElement(definition: DataSchemaBlockElementDefinition): void;

  /**
   * Add new data schema definition describing inline element.
   *
   * @param {module:html-support/dataschema~DataSchemaInlineElementDefinition} definition
   */
  registerInlineElement(definition: DataSchemaInlineElementDefinition): void;

  /**
   * Returns all definitions matching the given view name.
   *
   * @param {String|RegExp} viewName
   * @param {Boolean} [includeReferences] Indicates if this method should also include definitions of referenced models.
   * @returns {Set.<module:html-support/dataschema~DataSchemaDefinition>}
   */
  getDefinitionsForView(viewName: string | RegExp, includeReferences?: boolean): Set<DataSchemaDefinition>;
}

/**
 * A base definition of {@link module:html-support/dataschema~DataSchema data schema}.
 */
export interface DataSchemaDefinition {
  /**
   * Name of the model.
   */
  model: string;
  /**
   * Name of the view element.
   */
  view?: string;
  /**
   * Indicates that the definition describes object element.
   */
  isObject?: boolean;
  /**
   * The model schema item definition describing registered model.
   */
  modelSchema?: SchemaItemDefinition;
}

/**
 * A definition of {@link module:html-support/dataschema~DataSchema data schema} for block elements.
 */
export interface DataSchemaBlockElementDefinition extends DataSchemaDefinition {
  /**
   * Indicates that the definition describes block element.
   */
  isBlock: boolean;
  /**
   * Should be used when an element can behave both as a sectioning element (e.g. article) and
   * element accepting only inline content (e.g. paragraph).
   * If an element contains only inline content, this option will be used as a model
   * name.
   */
  paragraphLikeModel?: string;
}

/**
 * A definition of {@link module:html-support/dataschema~DataSchema data schema} for inline elements.
 */
export interface DataSchemaInlineElementDefinition extends DataSchemaDefinition {
  /**
   * Additional metadata describing the model attribute.
   */
  attributeProperties?: AttributeProperties;
  /**
   * Indicates that the definition descibes inline element.
   */
  isInline: boolean;
  /**
   * Element priority. Decides in what order elements are wrapped by
   * {@link module:engine/view/downcastwriter~DowncastWriter}.
   */
  priority?: number;
}
