import type Blocklist from "./blocklist";
import type { BLOCKLIST_COMMAND_NAME } from "./blocklistCommand";
import type BlocklistCommand from "./blocklistCommand";

declare module "ckeditor5" {
  interface PluginsMap {
    [Blocklist.pluginName]: Blocklist;
  }

  interface CommandsMap {
    [BLOCKLIST_COMMAND_NAME]: BlocklistCommand;
  }
}
