/* eslint no-null/no-null: off */

import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import LinkCleanup, { getLinkCleanup } from "./LinkCleanup";
import { DowncastConversionApi } from "@ckeditor/ckeditor5-engine/src/conversion/downcastdispatcher";
import AttributeElement from "@ckeditor/ckeditor5-engine/src/view/attributeelement";
import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";

/**
 * To benefit from CKEditor's Link Feature integration and its
 * handling of cursor position, all model names of related
 * link attributes should start with `link`. This type helps to
 * apply to the recommended name pattern.
 */
export type LinkAttributeName = `link${string}`;

/**
 * Configuration to register attribute bound to link.
 */
export interface RegisterAttributeConfig {
  /**
   * Model name. Recommended to be prefixed with `link`.
   */
  model: LinkAttributeName;
  /**
   * Name of attribute in view (assumed to be identical in editing and
   * data view.
   */
  view: string;
}

/**
 * Same priority as used for link-downcasting (href and decorators).
 * It is important that this is the same priority as for href
 * attributes as otherwise `<a>` elements won't merge when transformed
 * to data.
 */
const LINK_ATTRIBUTE_PRIORITY = 5;
/**
 * Must be the same name as used for custom property in CKEditor's Link Plugin.
 */
const LINK_CUSTOM_PROPERTY = "link";

/**
 * This generic plugin lets you register attributes, that are meant to
 * be bound to links only. It will take care to register corresponding
 * up- and downcasts, as well as listening to selection changes, similar
 * as CKEditor's link feature does.
 *
 * To benefit from CKEditor's link feature, it is highly recommended, that
 * all model attributes start with `link` in their names.
 */
export class LinkAttributes extends Plugin {
  static readonly #TEXT_NAME = "$text";
  static readonly pluginName: string = "LinkAttributes";

  static readonly requires = [LinkCleanup];

  registerAttribute(config: RegisterAttributeConfig): void {
    const { editor } = this;
    const { model } = editor;
    const { model: modelName, view: viewName } = config;

    // Allow link attribute on all inline nodes.
    model.schema.extend(LinkAttributes.#TEXT_NAME, { allowAttributes: modelName });

    editor.conversion.for("downcast").attributeToElement({
      model: modelName,
      view: provideDowncastFunction(viewName),
      converterPriority: "low",
    });

    // Upcast: Input (Data & Editing) -> Model
    // Take the view target-attribute of a-element and transform it to
    // linkTarget attribute in the model.
    editor.conversion.for("upcast").elementToAttribute({
      view: {
        name: "a",
        attributes: {
          [viewName]: true,
        },
      },
      model: {
        key: modelName,
        value: (viewElement) => viewElement.getAttribute(viewName) ?? null,
      },
      converterPriority: "low",
    });

    getLinkCleanup(editor)?.registerDependentAttribute(modelName);
  }
}

/**
 * Required type for downcast function.
 */
type DowncastFunction = (value: string, api: DowncastConversionApi) => AttributeElement;

/**
 * Provides downcast method for given attribute.
 *
 * Creates an element with given attribute. Element will be merged with
 * the anchor-element created by Link plugin (requires that both share the same
 * priority!).
 *
 * @param view - name of the attribute in editing and data view
 */
const provideDowncastFunction =
  (view: string): DowncastFunction =>
  (modelAttributeValue: string, { writer }: DowncastConversionApi): AttributeElement => {
    const element = writer.createAttributeElement(
      "a",
      {
        [view]: modelAttributeValue,
      },
      { priority: LINK_ATTRIBUTE_PRIORITY }
    );
    // Signal Link-Plugin, that this is a link, too.
    writer.setCustomProperty(LINK_CUSTOM_PROPERTY, true, element);
    return element;
  };

/**
 * Retrieve an instance of LinkAttributes-Plugin for registering attributes
 * dedicated to links.
 *
 * @example
 * ```typescript
 * getLinkAttributes(editor)?.registerAttribute(config);
 * ```
 * @param editor - current editor instance
 */
export const getLinkAttributes = (editor: Editor): LinkAttributes | undefined => editor.plugins.get(LinkAttributes);
