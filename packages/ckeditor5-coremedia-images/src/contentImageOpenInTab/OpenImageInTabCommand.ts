import { OpenInTabCommand } from "@coremedia/ckeditor5-coremedia-content/src/commands/OpenInTabCommand";
import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";
import ImageUtils from "@ckeditor/ckeditor5-image/src/imageutils";
import LoggerProvider from "@coremedia/ckeditor5-logging/src/logging/LoggerProvider";
import { UriPath } from "@coremedia/ckeditor5-coremedia-studio-integration";

/**
 * Default command name used to register at editor instance.
 */
export const openImageInTabCommandName = "openImageInTab" as const;

/**
 * A command to open either a given URI path (on `execute`) or the URI path
 * available in the current model state.
 */
export class OpenImageInTabCommand extends OpenInTabCommand {
  static readonly #logger = LoggerProvider.getLogger("OpenImageInTabCommand");

  override refresh() {
    const logger = OpenImageInTabCommand.#logger;
    const { editor } = this;
    const imageUtils = editor.plugins.get(ImageUtils);
    const { model } = editor;
    const { document } = model;
    const { selection } = document;
    const element = imageUtils.getClosestSelectedImageElement(selection);
    if (element) {
      const xlinkHrefValue = element.getAttribute("xlink-href");
      this.refreshValueAndEnabledState(xlinkHrefValue);
      logger.debug(`Enabled state updated according to xlink-href value of "${xlinkHrefValue}": ${this.isEnabled}`);
    } else {
      // noinspection JSConstantReassignment
      this.isEnabled = false;
      logger.debug("Disable command, as current selection does not represent an image.");
    }
  }
}

/**
 * Registers the `OpenImageInTabCommand`.
 *
 * @param editor - editor instance to register command at
 * @param name - name of the command
 */
export const registerOpenImageInTabCommand = (editor: Editor, name = openImageInTabCommandName) =>
  editor.commands.add(name, new OpenImageInTabCommand(editor));

/**
 * Require the command to be available and return it.
 *
 * @param editor - editor instance to lookup command at
 * @param name - name of the command
 * @throws Error - if the required command is unavailable
 */
export const requireOpenImageInTabCommand = (
  editor: Editor,
  name = openImageInTabCommandName,
): OpenImageInTabCommand => {
  const command = editor.commands.get(name);
  if (!command) {
    throw new Error(`Missing required command ${name}.`);
  }
  return command;
};

/**
 * Executes `OpenImageInTabCommand`, if available. Optional URI paths may
 * be provided to override URI paths as possibly evaluated from the model
 * state.
 *
 * @param editor - editor instance to invoke the command for
 * @param uriPaths - URI path to open explicitly (overrides the model state)
 * @param name - name of the command
 */
export const executeOpenImageInTabCommand = (
  editor: Editor,
  uriPaths: UriPath[] = [],
  name = openImageInTabCommandName,
) => editor.commands.get(name)?.execute(...uriPaths);
