import { DataSchemaBlockElementDefinition, DataSchemaDefinition, DataSchemaInlineElementDefinition } from "./dataschema";
import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";
import ModelElement from "@ckeditor/ckeditor5-engine/src/model/element";
import ViewElement from "@ckeditor/ckeditor5-engine/src/view/element";
import DowncastWriter from "@ckeditor/ckeditor5-engine/src/view/downcastwriter";
import DataFilter from "./datafilter";

/**
 * View-to-model conversion helper for object elements.
 *
 * Preserves object element content in `htmlContent` attribute.
 *
 * @param {module:html-support/dataschema~DataSchemaDefinition} definition
 * @returns {Function} Returns a conversion callback.
 */
export function viewToModelObjectConverter({ model: modelName }: DataSchemaDefinition): Function;

/**
 * Conversion helper converting object element to HTML object widget.
 *
 * @param {module:core/editor/editor~Editor} editor
 * @param {module:html-support/dataschema~DataSchemaInlineElementDefinition} definition
 * @returns {Function} Returns a conversion callback.
 */
export function toObjectWidgetConverter(editor: Editor, {
  view: viewName,
  isInline
}: DataSchemaInlineElementDefinition): Function;

/**
 * Creates object view element from the given model element.
 *
 * @param {String} viewName
 * @param {module:engine/model/element~Element} modelElement
 * @param {module:engine/view/downcastwriter~DowncastWriter} writer
 * @returns {module:engine/view/element~Element}
 */
export function createObjectView(viewName: string, modelElement: ModelElement, writer: DowncastWriter): ViewElement;

/**
 * View-to-attribute conversion helper preserving inline element attributes on `$text`.
 *
 * @param {module:html-support/dataschema~DataSchemaInlineElementDefinition} definition
 * @param {module:html-support/datafilter~DataFilter} dataFilter
 * @returns {Function} Returns a conversion callback.
 */
export function viewToAttributeInlineConverter({
                                                 view: viewName,
                                                 model: attributeKey
                                               }: DataSchemaInlineElementDefinition, dataFilter: DataFilter): Function;

/**
 * Attribute-to-view conversion helper applying attributes to view element preserved on `$text`.
 *
 * @param {module:html-support/dataschema~DataSchemaInlineElementDefinition} definition
 * @returns {Function} Returns a conversion callback.
 */
export function attributeToViewInlineConverter({
                                                 priority,
                                                 view: viewName
                                               }: DataSchemaInlineElementDefinition): Function;

/**
 * View-to-model conversion helper preserving allowed attributes on block element.
 *
 * All matched attributes will be preserved on `htmlAttributes` attribute.
 *
 * @param {module:html-support/dataschema~DataSchemaBlockElementDefinition} definition
 * @param {module:html-support/datafilter~DataFilter} dataFilter
 * @returns {Function} Returns a conversion callback.
 */
export function viewToModelBlockAttributeConverter({ view: viewName }: DataSchemaBlockElementDefinition, dataFilter: DataFilter): Function;

/**
 * Model-to-view conversion helper applying attributes preserved in `htmlAttributes` attribute
 * for block elements.
 *
 * @param {module:html-support/dataschema~DataSchemaBlockElementDefinition} definition
 * @returns {Function} Returns a conversion callback.
 */
export function modelToViewBlockAttributeConverter({ model: modelName }: DataSchemaBlockElementDefinition): Function;
