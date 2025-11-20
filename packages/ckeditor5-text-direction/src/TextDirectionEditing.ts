import type { Editor } from "ckeditor5";
import { Plugin } from "ckeditor5";
import { TextDirectionCommand } from "./TextDirectionCommand";
import { textDirectionAttributeName, textDirectionOptions } from "./utils";

/**
 * The text direction editing feature.
 */
export class TextDirectionEditing extends Plugin {
  /**
   * @inheritDoc
   */
  static get pluginName() {
    return "TextDirectionEditing";
  }

  /**
   * @inheritDoc
   */
  constructor(editor: Editor) {
    super(editor);

    editor.config.define("textDirection", {
      options: [...textDirectionOptions],
    });
  }

  /**
   * @inheritDoc
   */
  init() {
    const editor = this.editor;
    const schema = editor.model.schema;

    // Allow text direction attribute on all blocks.
    schema.extend("$block", { allowAttributes: textDirectionAttributeName });
    editor.model.schema.setAttributeProperties(textDirectionAttributeName, { isFormatting: true });

    // Upcast: class="dir-rtl" -> model attribute dir="rtl"
    editor.conversion.for("upcast").attributeToAttribute({
      view: "dir",
      model: "dir",
    });

    // Downcast: model attribute dir="rtl" -> class="dir-rtl"
    editor.conversion.for("downcast").attributeToAttribute({
      model: "dir",
      view: "dir",
    });

    editor.commands.add("textDirection", new TextDirectionCommand(editor));
  }
}
