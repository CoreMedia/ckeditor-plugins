import Blocklist from "./blocklist";
import BlocklistCommand, { BLOCKLIST_COMMAND_NAME } from "./blocklistCommand";

declare module "ckeditor5" {
  interface PluginsMap {
    [Blocklist.pluginName]: Blocklist;
  }

  interface CommandsMap {
    [BLOCKLIST_COMMAND_NAME]: BlocklistCommand;
  }
}
