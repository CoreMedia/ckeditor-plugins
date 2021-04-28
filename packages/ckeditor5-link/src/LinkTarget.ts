import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";
import { Logger, LoggerProvider } from "@coremedia/coremedia-utils/index";

export const PLUGIN_NAME = "CoreMediaLinkTarget";
export const LINK_TARGET_MODEL = "linkTarget";

const LINK_TARGET_VIEW = "target";
/**
 * Adds an attribute `linkTarget` to the model, which will be represented
 * as `target` attribute in view.
 *
 * @see <a href="https://stackoverflow.com/questions/51303892/how-to-add-target-attribute-to-a-tag-in-ckeditor5">How to add "target" attribute to `a` tag in ckeditor5? - Stack Overflow</a>
 */
export default class LinkTarget extends Plugin {
  static readonly pluginName: string = PLUGIN_NAME;
  private readonly logger: Logger = LoggerProvider.getLogger(PLUGIN_NAME);
  private readonly TEXT_NAME = "$text";

  init(): Promise<void> | null {
    const startTimestamp = performance.now();

    this.logger.info(`Initializing ${LinkTarget.pluginName}...`);

    const editor: Editor = this.editor;

    // Allow link attribute on all inline nodes.
    editor.model.schema.extend(this.TEXT_NAME, { allowAttributes: LINK_TARGET_MODEL });

    // Create element with target attribute. Element will be merged with
    // a-Element created by Link plugin.
    editor.conversion.for("downcast").attributeToElement({
      model: LINK_TARGET_MODEL,
      view: (modelAttributeValue, { writer }) => {
        return writer.createAttributeElement("a", {
          target: modelAttributeValue,
        });
      },
      converterPriority: "low",
    });

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
        value: (viewElement) => viewElement.getAttribute(LINK_TARGET_VIEW) || null,
      },
      converterPriority: "low",
    });

    this.logger.info(`Initialized ${LinkTarget.pluginName} within ${performance.now() - startTimestamp} ms.`);

    return null;
  }
}
