import ContentImageClipboardPlugin from "./ContentImageClipboardPlugin";
import ContentImageEditingPlugin from "./ContentImageEditingPlugin";
import ContentImageOpenInTabUI from "./contentImageOpenInTab/ContentImageOpenInTabUI";
import { OpenImageInTabCommand } from "./contentImageOpenInTab/OpenImageInTabCommand";
import ContentImagePlugin from "./ContentImagePlugin";
import ModelBoundSubscriptionPlugin from "./ModelBoundSubscriptionPlugin";

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
