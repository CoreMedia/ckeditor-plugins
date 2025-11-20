import type { ModelElement, ModelWriter } from "ckeditor5";
import { Command, first } from "ckeditor5";
import { isDefault, textDirectionAttributeName } from "./utils";
import type { TextDirectionOption } from "./utils";

/**
 * The text direction command plugin.
 */
export class TextDirectionCommand extends Command {
  /**
   * @inheritDoc
   */
  override refresh() {
    const editor = this.editor;
    const locale = editor.locale;
    const firstBlock = first(this.editor.model.document.selection.getSelectedBlocks());

    // As first check whether to enable or disable the command as the value will always be false if the command cannot be enabled.
    this.isEnabled = !!firstBlock && this._canHaveTextDirection(firstBlock);

    /**
     * A value of the current block's text direction.
     *
     * @observable
     * @readonly
     * @member {String} #value
     */
    if (this.isEnabled && firstBlock?.hasAttribute(textDirectionAttributeName)) {
      this.value = firstBlock.getAttribute(textDirectionAttributeName);
    } else {
      this.value = locale.contentLanguageDirection === "rtl" ? "rtl" : "ltr";
    }
  }

  /**
   * Executes the command. Applies the dir `value` to the selected blocks.
   * If no `value` is passed, the `value` is the default one or it is equal to the currently selected block's dir attribute,
   * the command will remove the attribute from the selected blocks.
   *
   * @param {Object} [options] Options for the executed command.
   * @param {String} [options.value] The value to apply.
   * @fires execute
   */
  override execute(options: { value?: TextDirectionOption }) {
    const editor = this.editor;
    const locale = editor.locale;
    const model = editor.model;
    const doc = model.document;

    const value = options.value;

    model.change((writer) => {
      // Get only those blocks from selected that can have dir set
      const blocks = Array.from(doc.selection.getSelectedBlocks()).filter((block) => this._canHaveTextDirection(block));
      const currentTextDirection = blocks[0].getAttribute("dir");

      // Remove TextDirection attribute if current dir is:
      // - default (should not be stored in model as it will bloat model data)
      // - equal to currently set
      // - or no value is passed - denotes default TextDirection.
      const removeTextDirection = !value || isDefault(value, locale) || currentTextDirection === value;

      if (removeTextDirection) {
        removeTextDirectionFromSelection(blocks, writer);
      } else {
        setTextDirectionOnSelection(blocks, writer, value);
      }
    });
  }

  /**
   * Checks whether a block can have dir set.
   *
   * @private
   * @param block The block to be checked.
   * @returns {Boolean}
   */
  _canHaveTextDirection(block: ModelElement) {
    return this.editor.model.schema.checkAttribute(block, textDirectionAttributeName);
  }
}

// Removes the dir attribute from blocks.
// @private
function removeTextDirectionFromSelection(blocks: ModelElement[], writer: ModelWriter) {
  for (const block of blocks) {
    writer.removeAttribute(textDirectionAttributeName, block);
  }
}

// Sets the dir attribute on blocks.
// @private
function setTextDirectionOnSelection(blocks: ModelElement[], writer: ModelWriter, dirValue: TextDirectionOption) {
  for (const block of blocks) {
    writer.setAttribute(textDirectionAttributeName, dirValue, block);
  }
}
