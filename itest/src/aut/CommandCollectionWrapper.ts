// CommandCollection: See ckeditor/ckeditor5#12027.
import type { Editor } from "ckeditor5";
import { JSWrapper } from "./JSWrapper";
import { CommandWrapper } from "./CommandWrapper";
import type { EditorWrapper } from "./EditorWrapper";

/**
 * Wrapper for the command collection.
 */
export class CommandCollectionWrapper extends JSWrapper<Editor["commands"]> {
  /**
   * Get a wrapper for the given command name.
   *
   * @param commandName - name of the command to get
   */
  get(commandName: string): CommandWrapper {
    return CommandWrapper.fromCommandCollection(this, commandName);
  }

  /**
   * Provide access to CommandCollection via Editor.
   *
   * @param wrapper - editor wrapper
   */
  static fromEditor(wrapper: EditorWrapper): CommandCollectionWrapper {
    return new CommandCollectionWrapper(wrapper.evaluateHandle((editor) => editor.commands));
  }
}
