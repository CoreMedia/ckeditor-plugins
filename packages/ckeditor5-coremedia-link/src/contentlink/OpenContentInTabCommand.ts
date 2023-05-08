import { OpenInTabCommand } from "@coremedia/ckeditor5-coremedia-content";
import first from "@ckeditor/ckeditor5-utils/src/first";
import type Schema from "@ckeditor/ckeditor5-engine/src/model/schema";
import type ModelElement from "@ckeditor/ckeditor5-engine/src/model/element";
import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";

/**
 * Default command name used to register at editor instance.
 */
export const openContentInTabCommandName = "openContentInTab";

/**
 * A command to open either a given URI path (on `execute`) or the URI path
 * available in the current model state.
 */
export class OpenContentInTabCommand extends OpenInTabCommand {
  override refresh() {
    const { editor } = this;
    const { model } = editor;
    const { schema, document } = model;
    const { selection } = document;
    const selectedElement = selection.getSelectedElement() ?? first(selection.getSelectedBlocks());

    // See `LinkCommand.refresh()` for similar implementation.
    if (isLinkableElement(selectedElement, schema)) {
      this.refreshValue(selectedElement.getAttribute("linkHref"));
    } else {
      this.refreshValue(selection.getAttribute("linkHref"));
    }

    // Defaults to set enabled state to `true`.
    super.refresh();

    // DevNote: Enabled State Always `true`
    // We could consider depending the enabled state depending on if the
    // model provides a URI path **and** if it can be opened. This would
    // be helpful if the enabled state is represented in the UI in some way.
    // In general, there is no harm to "try to open" contents. If any of them
    // cannot be opened, they just won't open.
  }
}

/**
 * Registers the `OpenContentInTabCommand`.
 *
 * @param editor - editor instance to register command at
 * @param name - name of the command
 */
export const registerOpenContentInTabCommand = (editor: Editor, name = openContentInTabCommandName) =>
  editor.commands.add(name, new OpenContentInTabCommand(editor));

/**
 * Executes `OpenContentInTabCommand`, if available. Optional URI paths may
 * be provided to override URI paths as possibly evaluated from the model
 * state.
 *
 * @param editor - editor instance to invoke the command for
 * @param uriPaths - URI path to open explicitly (overrides the model state)
 * @param name - name of the command
 */
export const executeOpenContentInTabCommand = (
  editor: Editor,
  uriPaths: string[] = [],
  name = openContentInTabCommandName
) => editor.commands.get(name)?.execute(...uriPaths);

/**
 * Checks if the given element represents a linkable element. Copy of
 * the corresponding check in CKEditor 5 Link-Feature.
 *
 * @param element - current model element
 * @param schema - model schema
 */
const isLinkableElement = (element: ModelElement | null, schema: Schema): element is ModelElement => {
  if (!element) {
    return false;
  }

  return schema.checkAttribute(element.name, "linkHref");
};
