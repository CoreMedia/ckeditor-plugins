import { Plugin } from "ckeditor5";
import { TextDirectionEditing } from "./TextDirectionEditing";
import { TextDirectionUI } from "./TextDirectionUI";

/**
 * The text direction plugin.
 */
export class TextDirection extends Plugin {
  /**
   * @inheritDoc
   */
  static get requires() {
    return [TextDirectionEditing, TextDirectionUI];
  }

  /**
   * @inheritDoc
   */
  static get pluginName() {
    return "TextDirection";
  }
}
