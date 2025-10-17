import type ContentImageClipboardPlugin from "./ContentImageClipboardPlugin";
import type ContentImageEditingPlugin from "./ContentImageEditingPlugin";
import type ContentImageOpenInTabUI from "./contentImageOpenInTab/ContentImageOpenInTabUI";
import type { OpenImageInTabCommand } from "./contentImageOpenInTab/OpenImageInTabCommand";
import type ContentImagePlugin from "./ContentImagePlugin";
import type ModelBoundSubscriptionPlugin from "./ModelBoundSubscriptionPlugin";

declare module "ckeditor5" {
  interface PluginsMap {
    [ContentImageClipboardPlugin.pluginName]: ContentImageClipboardPlugin;
    [ContentImageEditingPlugin.pluginName]: ContentImageEditingPlugin;
    [ContentImageOpenInTabUI.pluginName]: ContentImageOpenInTabUI;
    [ContentImagePlugin.pluginName]: ContentImagePlugin;
    [ModelBoundSubscriptionPlugin.pluginName]: ModelBoundSubscriptionPlugin;
  }

  interface CommandsMap {
    [ContentImageEditingPlugin.openImageInTab]: OpenImageInTabCommand;
  }
}
