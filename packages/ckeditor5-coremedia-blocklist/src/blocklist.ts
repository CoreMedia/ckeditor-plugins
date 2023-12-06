import { Plugin } from "@ckeditor/ckeditor5-core";
import Blocklistui from "./blocklistui";
import BlocklistEditing from "./blocklistediting";

/**
 * CKEditor 5 Blocklist is a plugin which retrieves a list of words from a
 * CoreMedia Studio service, that are highlighted in the editor's content.
 * Blocklist entries can be added or removed via a contextual balloon.
 *
 * The intention behind this plugin is to give editors a possibility to easily
 * identify inappropriate words, used in any kind of content (user comments in
 * social media components, for example).
 */
export default class Blocklist extends Plugin {
  public static readonly pluginName = "Blocklist" as const;
  static readonly requires = [BlocklistEditing, Blocklistui];
}
