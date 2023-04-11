/* eslint no-null/no-null: off */

import { Plugin } from "@ckeditor/ckeditor5-core";
import LinkCleanup, { getLinkCleanup } from "./LinkCleanup";
import { DowncastConversionApi } from "@ckeditor/ckeditor5-engine/src/conversion/downcastdispatcher";
import AttributeElement from "@ckeditor/ckeditor5-engine/src/view/attributeelement";
import { Editor } from "@ckeditor/ckeditor5-core";
import { RegisterAttributeConfig } from "./RegisterAttributeConfig";
import { parseAttributesConfig } from "./LinkAttributesConfig";
import { TwoStepCaretMovement } from "@ckeditor/ckeditor5-typing";
import { reportInitEnd, reportInitStart } from "@coremedia/ckeditor5-core-common/Plugins";
import LoggerProvider from "@coremedia/ckeditor5-logging/logging/LoggerProvider";
import { LinkEditing } from "@ckeditor/ckeditor5-link";
import { ViewElement } from "@ckeditor/ckeditor5-engine";

/**
 * Same priority as used for link-downcasting (href and decorators).
 * It is important that this is the same priority as for href
 * attributes as otherwise the `<a>` elements won't merge when transformed
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
 * up- and downcast, as well as listening to selection changes, similar
 * as CKEditor's link feature does.
 *
 * To benefit from CKEditor's link feature, it is highly recommended that
 * all model attributes start with `link` in their names.
 *
 * **Configuration API**
 *
 * To register attributes to handle as being part of links, you may call
 * `registerAttribute`. To ease this process, a utility method
 * `getLinkAttributes` exists, that may be invoked like this:
 *
 * ```typescript
 * getLinkAttributes(editor)?.registerAttribute({
 *   model: "linkCustomAttribute",
 *   view: "data-custom-attribute",
 * });
 * ```
 *
 * **CKEditor Configuration**
 *
 * As an alternative to configuring these attributes via API, you may also
 * define corresponding attributes as part of the CKEditor Link Feature
 * configuration – with an extended section `attributes`:
 *
 * ```typescript
 * const linkAttributesConfig: LinkAttributesConfig = {
 *   attributes: [
 *     { view: "title", model: "linkTitle" },
 *     { view: "data-xlink-actuate", model: "linkActuate" },
 *   ],
 * };
 *
 * ClassicEditor.create(sourceElement, {
 *   plugins: [
 *     LinkAttributes,
 *     Link,
 *     // ...
 *   ],
 *   link: {
 *     defaultProtocol: "https://",
 *     ...linkAttributesConfig,
 *   },
 * };
 * ```
 *
 * Declaring this as a constant is recommended to get IDE support regarding
 * the available fields and valid values. You will note that the type of
 * the field `model` requires, that the value starts with `link`. This
 * automatically triggers some behavior in the Link Plugin.
 *
 * Configuration as part of the CKEditor 5 Configuration section is highly
 * recommended, when it is about attributes that are not yet handled by any
 * dedicated plugin, that provides editing features for that attribute. If
 * a plugin gets added, that handles the corresponding attribute, the
 * configuration needs to be adapted accordingly.
 *
 * While this plugin does not depend on `LinkEditing` explicitly, it is
 * best used with `LinkEditing` to be available. Otherwise, some clean-up
 * tasks we implicitly rely on (like for all model attributes prefixed
 * with `link`) won't work.
 */
export class LinkAttributes extends Plugin {
  static readonly #TEXT_NAME = "$text";
  static readonly pluginName: string = "LinkAttributes";
  static readonly #logger = LoggerProvider.getLogger(LinkAttributes.pluginName);

  static readonly requires = [LinkCleanup, TwoStepCaretMovement];

  init(): void {
    const initInformation = reportInitStart(this);

    const { editor } = this;
    const { config } = editor;

    if (!editor.plugins.has(LinkEditing)) {
      // This plugin will continue to work.
      // It is just that other means should provide some clean-up actions.
      const logger = LinkAttributes.#logger;
      logger.info(
        "LinkEditing unavailable. Registered link attributes may miss, for example, some expected cleanup on editing actions."
      );
    }

    // Provide opportunity to register not yet explicitly handled
    // link attributes as to belong to the given link.
    // Typically, these are attributes only registered via GHS/GRS.
    const { attributes } = parseAttributesConfig(config);
    for (const attribute of attributes) {
      this.registerAttribute(attribute);
    }

    reportInitEnd(initInformation);
  }

  /**
   * Register an attribute as being bound to links.
   *
   * This method automatically registers the corresponding up- and downcast
   * configuration and extends the model schema.
   *
   * It also registers the attribute for clean-up, when a link gets
   * removed (via `LinkCleanup` plugin).
   *
   * @param config - configuration of the link attribute
   */
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
    // Take the view target-attribute of the <a>-element and transform it to
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
        value: (viewElement: ViewElement) => viewElement.getAttribute(viewName) ?? null,
      },
      converterPriority: "low",
    });

    getLinkCleanup(editor)?.registerDependentAttribute(modelName);
    this.#registerForTwoStepCaretMovement(modelName);
  }

  /**
   * Registers the attribute to be automatically removed when exiting the
   * link "area" by a second cursor left or right click.
   *
   * @param modelAttributeName name of the attribute in model
   */
  #registerForTwoStepCaretMovement(modelAttributeName: string): void {
    const { editor } = this;
    const { plugins } = editor;
    const twoStepCaretMovementPlugin = plugins.get(TwoStepCaretMovement);
    twoStepCaretMovementPlugin.registerAttribute(modelAttributeName);
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
