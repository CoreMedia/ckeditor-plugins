import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";
import { Logger, LoggerProvider } from "@coremedia/coremedia-utils/index";

export const PLUGIN_NAME = "CoreMediaLinkTarget";

/**
 * Adds an attribute `linkTarget` to the model, which will be represented
 * as `target` attribute in view.
 */
export default class LinkTarget extends Plugin {
  static readonly pluginName: string = PLUGIN_NAME;
  private readonly logger: Logger = LoggerProvider.getLogger(PLUGIN_NAME);
  private readonly TEXT_NAME = "$text";

  init(): Promise<void> | null {
    const editor: Editor = this.editor;

    // Allow link attribute on all inline nodes.
    editor.model.schema.extend(this.TEXT_NAME, { allowAttributes: "linkTarget" });

    return null;
  }
}
