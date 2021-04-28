import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";

export const PLUGIN_NAME = "CoreMediaLinkTarget";
export const LINK_TARGET = "linkTarget";

/**
 * Adds an attribute `linkTarget` to the model, which will be represented
 * as `target` attribute in view.
 *
 * @see <a href="https://stackoverflow.com/questions/51303892/how-to-add-target-attribute-to-a-tag-in-ckeditor5">How to add "target" attribute to `a` tag in ckeditor5? - Stack Overflow</a>
 */
export default class LinkTarget extends Plugin {
  static readonly pluginName: string = PLUGIN_NAME;
  private readonly TEXT_NAME = "$text";

  init(): Promise<void> | null {
    const editor: Editor = this.editor;

    // Allow link attribute on all inline nodes.
    editor.model.schema.extend(this.TEXT_NAME, { allowAttributes: LINK_TARGET });

    // Create element with target attribute. Element will be merged with
    // a-Element created by Link plugin.
    editor.conversion.for("downcast").attributeToElement({
      model: LINK_TARGET,
      view: (modelAttributeValue, { writer }) => {
        return writer.createAttributeElement("a", {
          target: modelAttributeValue,
        });
      },
      converterPriority: "low",
    });

    // Take the view target-attribute of a-element and transform it to
    // linkTarget attribute in model.
    editor.conversion.for("upcast").attributeToAttribute({
      model: LINK_TARGET,
      view: {
        name: "a",
        key: "target",
      },
      converterPriority: "low",
    });

    return null;
  }
}
