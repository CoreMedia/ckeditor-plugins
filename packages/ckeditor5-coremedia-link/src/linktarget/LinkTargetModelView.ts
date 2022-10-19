/* eslint no-null/no-null: off */

import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";
import { LINK_TARGET_MODEL, LINK_TARGET_VIEW } from "./Constants";
import LinkTargetCommand from "./command/LinkTargetCommand";
import { DowncastConversionApi } from "@ckeditor/ckeditor5-engine/src/conversion/downcastdispatcher";
import AttributeElement from "@ckeditor/ckeditor5-engine/src/view/attributeelement";
import LinkCleanup, { getLinkCleanup } from "../link/LinkCleanup";
import { reportInitEnd, reportInitStart } from "@coremedia/ckeditor5-core-common/Plugins";

/**
 * Same priority as used for link-downcasting (href and decorators).
 * It is important, that this is the same priority as for href
 * attributes, as otherwise `<a>` elements won't merge when transformed
 * to data.
 */
const LINK_ATTRIBUTE_PRIORITY = 5;
/**
 * Must be the same name as used for custom property in CKEditor's Link Plugin.
 */
const LINK_CUSTOM_PROPERTY = "link";

/**
 * Adds an attribute `linkTarget` to the model, which will be represented
 * as `target` attribute in view.
 *
 * @see {@link https://stackoverflow.com/questions/51303892/how-to-add-target-attribute-to-a-tag-in-ckeditor5 | How to add "target" attribute to `a` tag in ckeditor5? - Stack Overflow}
 */
export default class LinkTargetModelView extends Plugin {
  static readonly pluginName: string = "LinkTargetModelView";
  private readonly TEXT_NAME = "$text";

  // LinkUI: Registers the commands, which are expected to set/unset `linkHref`
  static readonly requires = [LinkCleanup];

  /**
   * Defines `linkTarget` model-attribute, which is represented on downcast
   * (to data and for editing) as `target` attribute.
   */
  init(): Promise<void> | void {
    const initInformation = reportInitStart(this);

    const editor: Editor = this.editor;
    const model = editor.model;

    // Allow link attribute on all inline nodes.
    model.schema.extend(this.TEXT_NAME, { allowAttributes: LINK_TARGET_MODEL });

    // Downcast: Model -> Output (Data & Editing)
    // Create element with target attribute. Element will be merged with
    // a-Element created by Link plugin.
    editor.conversion.for("downcast").attributeToElement({
      model: LINK_TARGET_MODEL,
      view: downcastTarget,
      converterPriority: "low",
    });

    // Upcast: Input (Data & Editing) -> Model
    // Take the view target-attribute of a-element and transform it to
    // linkTarget attribute in model.
    editor.conversion.for("upcast").elementToAttribute({
      view: {
        name: "a",
        attributes: {
          [LINK_TARGET_VIEW]: true,
        },
      },
      model: {
        key: LINK_TARGET_MODEL,
        value: (viewElement) => viewElement.getAttribute(LINK_TARGET_VIEW) ?? null,
      },
      converterPriority: "low",
    });

    getLinkCleanup(editor)?.registerDependentAttribute(LINK_TARGET_MODEL);

    editor.commands.add("linkTarget", new LinkTargetCommand(editor));

    reportInitEnd(initInformation);
  }
}
/**
 * Downcast `linkTarget` attribute (downcast: Model → Output (Data & Editing)).
 * Creates element with target attribute. Element will be merged with
 * a-Element created by Link plugin (requires that both share the same
 * priority).
 *
 * @param modelAttributeValue - target value
 * @param writer - writer from conversion API
 */
function downcastTarget(modelAttributeValue: never, { writer }: DowncastConversionApi): AttributeElement {
  const element = writer.createAttributeElement(
    "a",
    {
      target: modelAttributeValue,
    },
    { priority: LINK_ATTRIBUTE_PRIORITY }
  );
  // Signal Link-Plugin, that this is a link, too.
  writer.setCustomProperty(LINK_CUSTOM_PROPERTY, true, element);
  return element;
}
